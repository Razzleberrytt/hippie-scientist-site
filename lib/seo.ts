const DEFAULT_SITE_URL = 'https://thehippiescientist.net'
const DEFAULT_SITE_NAME = 'The Hippie Scientist'
const DEFAULT_DESCRIPTION_MAX_LENGTH = 155
export const DEFAULT_TITLE = 'The Hippie Scientist – Evidence-Based Herb & Supplement Research'
export const DEFAULT_DESCRIPTION = 'Evidence-first herb and compound reference grounded in mechanisms, safety context, and scientific review.'
export const TWITTER_HANDLE = '@HippieScientist'
export const DEFAULT_OG_IMAGE = '/og-default.jpg'

type CanonicalUrlOptions = {
  siteUrl?: string
  keepQueryParams?: string[]
}

type RobotsConfigOptions = {
  index?: boolean
  follow?: boolean
  noarchive?: boolean
  nosnippet?: boolean
  noimageindex?: boolean
  maxSnippet?: number
  maxImagePreview?: 'none' | 'standard' | 'large'
  maxVideoPreview?: number
}

type TitleOptions = {
  siteName?: string
  separator?: string
  template?: string
}

type MetaDescriptionOptions = {
  fallback?: string
  maxLength?: number
}

const NON_CANONICAL_PARAM_PATTERNS = [
  /^utm_/i,
  /^fbclid$/i,
  /^gclid$/i,
  /^msclkid$/i,
  /^ref$/i,
  /^source$/i,
]

const isAbsoluteUrl = (value: string) => /^https?:\/\//i.test(value)

const withLeadingSlash = (value: string) => {
  if (!value) return '/'
  return value.startsWith('/') || isAbsoluteUrl(value) ? value : `/${value}`
}

const compactWhitespace = (value: string) => value.replace(/\s+/g, ' ').trim()

export function buildCanonicalUrl(path = '/', options: CanonicalUrlOptions = {}): string {
  const siteUrl = options.siteUrl || DEFAULT_SITE_URL
  const url = new URL(isAbsoluteUrl(path) ? path : withLeadingSlash(path), siteUrl)
  const allowedParams = new Set((options.keepQueryParams || []).map(param => param.toLowerCase()))
  const canonicalSearch = new URLSearchParams()

  for (const [key, value] of url.searchParams.entries()) {
    const normalizedKey = key.toLowerCase()
    const isBlocked = NON_CANONICAL_PARAM_PATTERNS.some(pattern => pattern.test(normalizedKey))

    if (!isBlocked && allowedParams.has(normalizedKey)) {
      canonicalSearch.append(key, value)
    }
  }

  const sortedSearch = new URLSearchParams(
    [...canonicalSearch.entries()].sort(([left], [right]) => left.localeCompare(right)),
  )
  url.search = sortedSearch.toString()
  url.hash = ''

  return url.toString()
}

export function buildRobotsConfig(options: RobotsConfigOptions = {}) {
  const index = options.index ?? true
  const follow = options.follow ?? true

  return {
    index,
    follow,
    ...(options.noarchive !== undefined ? { noarchive: options.noarchive } : {}),
    ...(options.nosnippet !== undefined ? { nosnippet: options.nosnippet } : {}),
    ...(options.noimageindex !== undefined ? { noimageindex: options.noimageindex } : {}),
    ...(options.maxSnippet !== undefined ? { 'max-snippet': options.maxSnippet } : {}),
    ...(options.maxImagePreview !== undefined ? { 'max-image-preview': options.maxImagePreview } : {}),
    ...(options.maxVideoPreview !== undefined ? { 'max-video-preview': options.maxVideoPreview } : {}),
  }
}

export function buildTitle(title: string, options: TitleOptions = {}): string {
  const cleanTitle = compactWhitespace(title)
  const siteName = compactWhitespace(options.siteName || DEFAULT_SITE_NAME)

  if (options.template) {
    return compactWhitespace(options.template.replace(/%s/g, cleanTitle || siteName))
  }

  if (!cleanTitle || cleanTitle === siteName) return siteName

  return `${cleanTitle} ${options.separator || '|'} ${siteName}`
}

export function cleanMetaDescription(description: string, options: MetaDescriptionOptions = {}): string {
  const fallback = compactWhitespace(options.fallback || '')
  const cleaned = compactWhitespace(description) || fallback
  const maxLength = options.maxLength ?? DEFAULT_DESCRIPTION_MAX_LENGTH

  if (!cleaned || cleaned.length <= maxLength) return cleaned

  const cutoff = cleaned.slice(0, Math.max(0, maxLength - 1))
  const lastBreak = Math.max(
    cutoff.lastIndexOf(' '),
    cutoff.lastIndexOf(','),
    cutoff.lastIndexOf(';'),
  )
  const compact = (lastBreak > 90 ? cutoff.slice(0, lastBreak) : cutoff).trim()

  return `${compact}…`
}
