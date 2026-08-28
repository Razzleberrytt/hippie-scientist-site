const GOOGLE_COMMON_CRAWLER_RANGES_URL =
  'https://developers.google.com/static/crawling/ipranges/common-crawlers.json'

const RANGE_CACHE_TTL_MS = 6 * 60 * 60 * 1000

type PrefixPayload = {
  creationTime?: string
  prefixes?: Array<{ ipv4Prefix?: string; ipv6Prefix?: string }>
}

type RangeCache = {
  expiresAt: number
  prefixes: string[]
}

export type GooglebotType = 'smartphone' | 'desktop' | 'other'

export type GooglebotVerification = {
  verified: boolean
  verificationMethod: 'google_common_crawler_cidr' | 'unverified'
  googlebotType: GooglebotType
}

let rangeCache: RangeCache | undefined
let inflightRangeFetch: Promise<string[]> | undefined

function classifyGooglebot(userAgent: string): GooglebotType {
  if (!/Googlebot/i.test(userAgent)) return 'other'
  if (/Mobile/i.test(userAgent)) return 'smartphone'
  if (/Googlebot\/[0-9.]+/i.test(userAgent)) return 'desktop'
  return 'other'
}

function parseIpv4(value: string): number | null {
  const parts = value.split('.')
  if (parts.length !== 4) return null

  let result = 0
  for (const part of parts) {
    if (!/^\d{1,3}$/.test(part)) return null
    const octet = Number(part)
    if (!Number.isInteger(octet) || octet < 0 || octet > 255) return null
    result = (result * 256 + octet) >>> 0
  }
  return result >>> 0
}

function ipv4TailToHextets(value: string): string | null {
  const lastColon = value.lastIndexOf(':')
  if (lastColon < 0) return null
  const ipv4 = parseIpv4(value.slice(lastColon + 1))
  if (ipv4 === null) return null
  const high = ((ipv4 >>> 16) & 0xffff).toString(16)
  const low = (ipv4 & 0xffff).toString(16)
  return `${value.slice(0, lastColon)}:${high}:${low}`
}

function parseIpv6(value: string): bigint | null {
  let normalized = value.toLowerCase().split('%')[0]
  if (!normalized) return null

  if (normalized.includes('.')) {
    normalized = ipv4TailToHextets(normalized) ?? ''
    if (!normalized) return null
  }

  if ((normalized.match(/::/g) ?? []).length > 1) return null
  const [leftRaw, rightRaw] = normalized.split('::')
  const left = leftRaw ? leftRaw.split(':') : []
  const right = rightRaw ? rightRaw.split(':') : []

  if (normalized.includes('::')) {
    const missing = 8 - left.length - right.length
    if (missing < 1) return null
    left.push(...Array.from({ length: missing }, () => '0'))
  }

  const parts = [...left, ...right]
  if (parts.length !== 8) return null

  let result = 0n
  for (const part of parts) {
    if (!/^[0-9a-f]{1,4}$/i.test(part)) return null
    result = (result << 16n) | BigInt(Number.parseInt(part, 16))
  }
  return result
}

function ipInCidr(ip: string, cidr: string): boolean {
  const [networkRaw, prefixRaw] = cidr.split('/')
  if (!networkRaw || prefixRaw === undefined) return false
  const prefix = Number(prefixRaw)

  const ip4 = parseIpv4(ip)
  const network4 = parseIpv4(networkRaw)
  if (ip4 !== null || network4 !== null) {
    if (ip4 === null || network4 === null || prefix < 0 || prefix > 32) return false
    if (prefix === 0) return true
    const shift = 32 - prefix
    return (ip4 >>> shift) === (network4 >>> shift)
  }

  const ip6 = parseIpv6(ip)
  const network6 = parseIpv6(networkRaw)
  if (ip6 === null || network6 === null || prefix < 0 || prefix > 128) return false
  if (prefix === 0) return true
  const shift = BigInt(128 - prefix)
  return (ip6 >> shift) === (network6 >> shift)
}

async function fetchCommonCrawlerRanges(): Promise<string[]> {
  const now = Date.now()
  if (rangeCache && rangeCache.expiresAt > now) return rangeCache.prefixes
  if (inflightRangeFetch) return inflightRangeFetch

  inflightRangeFetch = (async () => {
    const response = await fetch(GOOGLE_COMMON_CRAWLER_RANGES_URL, {
      headers: { Accept: 'application/json' },
    })
    if (!response.ok) {
      throw new Error(`Google crawler range fetch failed with HTTP ${response.status}`)
    }

    const payload = (await response.json()) as PrefixPayload
    const prefixes = (payload.prefixes ?? [])
      .flatMap((entry) => [entry.ipv4Prefix, entry.ipv6Prefix])
      .filter((value): value is string => typeof value === 'string' && value.includes('/'))

    if (prefixes.length < 50) {
      throw new Error(`Google crawler range payload unexpectedly small (${prefixes.length})`)
    }

    rangeCache = {
      expiresAt: Date.now() + RANGE_CACHE_TTL_MS,
      prefixes,
    }
    return prefixes
  })()

  try {
    return await inflightRangeFetch
  } finally {
    inflightRangeFetch = undefined
  }
}

export async function verifyGooglebotRequest(request: Request): Promise<GooglebotVerification> {
  const userAgent = request.headers.get('user-agent') ?? ''
  const googlebotType = classifyGooglebot(userAgent)

  if (!/Googlebot/i.test(userAgent)) {
    return { verified: false, verificationMethod: 'unverified', googlebotType }
  }

  const sourceIp = request.headers.get('cf-connecting-ip')?.trim()
  if (!sourceIp) {
    return { verified: false, verificationMethod: 'unverified', googlebotType }
  }

  try {
    const prefixes = await fetchCommonCrawlerRanges()
    if (prefixes.some((cidr) => ipInCidr(sourceIp, cidr))) {
      return {
        verified: true,
        verificationMethod: 'google_common_crawler_cidr',
        googlebotType,
      }
    }
  } catch (error) {
    console.warn('[crawl-experiment] Google crawler verification unavailable', error)
  }

  return { verified: false, verificationMethod: 'unverified', googlebotType }
}

export const GOOGLE_CRAWLER_RANGE_SOURCE = GOOGLE_COMMON_CRAWLER_RANGES_URL
