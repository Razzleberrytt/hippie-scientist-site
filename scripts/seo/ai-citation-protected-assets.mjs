import crypto from 'node:crypto'
import path from 'node:path'

export const DEFAULT_AI_CITATION_PROTECTION_POLICY = Object.freeze({
  minCitations: 250,
  cumulativeCitationShare: 0.75,
  maxAssets: 25,
})

export function validateProtectionPolicy(candidate) {
  const failures = []
  if (!Number.isFinite(candidate?.minCitations) || candidate.minCitations < 0) {
    failures.push('minCitations must be a finite number >= 0')
  }
  if (
    !Number.isFinite(candidate?.cumulativeCitationShare) ||
    candidate.cumulativeCitationShare <= 0 ||
    candidate.cumulativeCitationShare > 1
  ) {
    failures.push('cumulativeCitationShare must be > 0 and <= 1')
  }
  if (!Number.isInteger(candidate?.maxAssets) || candidate.maxAssets < 1) {
    failures.push('maxAssets must be an integer >= 1')
  }
  if (failures.length) throw new Error(`Invalid AI citation protection policy: ${failures.join('; ')}`)
  return candidate
}

export function normalizeUrlPath(value) {
  if (!value) return '/'
  let pathname = String(value).trim()
  try {
    pathname = new URL(pathname, 'https://thehippiescientist.net').pathname
  } catch {
    // Keep the supplied path and normalize it below.
  }
  pathname = `/${pathname}`.replace(/\/{2,}/g, '/')
  if (pathname !== '/' && !pathname.endsWith('/')) pathname += '/'
  return pathname
}

export function selectProtectedCitationAssets(rows, policy = DEFAULT_AI_CITATION_PROTECTION_POLICY) {
  validateProtectionPolicy(policy)

  const byUrl = new Map()
  for (const row of rows) {
    const url = normalizeUrlPath(row.url ?? row.Page ?? row.page)
    const citations = Number(row.citations ?? row.Citations ?? 0)
    if (!url || !Number.isFinite(citations) || citations <= 0) continue
    byUrl.set(url, (byUrl.get(url) ?? 0) + citations)
  }

  const normalized = [...byUrl.entries()]
    .map(([url, citations]) => ({ url, citations }))
    .sort((a, b) => b.citations - a.citations || a.url.localeCompare(b.url))

  const totalCitations = normalized.reduce((sum, row) => sum + row.citations, 0)
  const assets = []
  let cumulativeCitations = 0

  for (const row of normalized) {
    const cumulativeBefore = totalCitations > 0 ? cumulativeCitations / totalCitations : 0
    cumulativeCitations += row.citations
    const share = totalCitations > 0 ? row.citations / totalCitations : 0
    const cumulativeShare = totalCitations > 0 ? cumulativeCitations / totalCitations : 0
    const byMinimum = row.citations >= policy.minCitations
    const byCoverage = cumulativeBefore < policy.cumulativeCitationShare

    if ((byMinimum || byCoverage) && assets.length < policy.maxAssets) {
      assets.push({
        ...row,
        share,
        cumulativeShare,
        protectionReason: [
          ...(byMinimum ? ['min_citations'] : []),
          ...(byCoverage ? ['cumulative_coverage'] : []),
        ],
      })
      continue
    }

    if (!byMinimum && !byCoverage) break
  }

  return {
    totalCitations,
    protectedCitations: assets.reduce((sum, row) => sum + row.citations, 0),
    protectedCitationShare:
      totalCitations > 0 ? assets.reduce((sum, row) => sum + row.citations, 0) / totalCitations : 0,
    assets,
  }
}

function decodeHtmlEntities(value) {
  return String(value ?? '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)))
}

function visibleText(value) {
  return decodeHtmlEntities(String(value ?? '').replace(/<[^>]*>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim()
}

function firstTagContent(html, tagName) {
  const match = String(html).match(new RegExp(`<${tagName}\\b[^>]*>([\\s\\S]*?)<\\/${tagName}>`, 'i'))
  return match ? visibleText(match[1]) : ''
}

function attributeValue(tag, name) {
  const match = String(tag).match(new RegExp(`\\b${name}\\s*=\\s*(["'])(.*?)\\1`, 'i'))
  return match ? decodeHtmlEntities(match[2]).trim() : ''
}

export function normalizeCanonicalUrl(value) {
  if (!value) return ''
  try {
    const parsed = new URL(value, 'https://thehippiescientist.net')
    const pathname = normalizeUrlPath(parsed.pathname)
    return `${parsed.protocol}//${parsed.host.toLowerCase()}${pathname}${parsed.search}${parsed.hash}`
  } catch {
    return String(value).trim()
  }
}

export function parseRenderedPageIdentity(html, routePath) {
  const source = String(html ?? '')
  const linkTags = source.match(/<link\b[^>]*>/gi) ?? []
  const canonicalTag = linkTags.find((tag) =>
    attributeValue(tag, 'rel')
      .toLowerCase()
      .split(/\s+/)
      .includes('canonical'),
  )

  const metaTags = source.match(/<meta\b[^>]*>/gi) ?? []
  const robotsTag = metaTags.find((tag) => attributeValue(tag, 'name').toLowerCase() === 'robots')
  const robots = robotsTag ? attributeValue(robotsTag, 'content').toLowerCase() : ''
  const noindex = /(^|[\s,])noindex($|[\s,])/.test(robots)

  return {
    status: 'ready',
    routePath: normalizeUrlPath(routePath),
    title: firstTagContent(source, 'title'),
    h1: firstTagContent(source, 'h1'),
    canonical: canonicalTag ? normalizeCanonicalUrl(attributeValue(canonicalTag, 'href')) : '',
    indexable: !noindex,
  }
}

export function identityFingerprint(identity) {
  const stable = {
    routePath: normalizeUrlPath(identity.routePath),
    title: String(identity.title ?? '').trim(),
    h1: String(identity.h1 ?? '').trim(),
    canonical: normalizeCanonicalUrl(identity.canonical),
    indexable: Boolean(identity.indexable),
    redirectTarget: identity.redirectTarget ? normalizeUrlPath(identity.redirectTarget) : null,
  }
  return crypto.createHash('sha256').update(JSON.stringify(stable)).digest('hex')
}

function normalizedIdentityValue(identity, field) {
  if (field === 'canonical') return normalizeCanonicalUrl(identity?.[field])
  if (field === 'redirectTarget') {
    return identity?.[field] ? normalizeUrlPath(identity[field]) : null
  }
  return identity?.[field]
}

export function compareProtectedPageIdentity(expected, actual) {
  const fields = ['title', 'h1', 'canonical', 'indexable', 'redirectTarget']
  const failures = []
  for (const field of fields) {
    const left = normalizedIdentityValue(expected, field)
    const right = normalizedIdentityValue(actual, field)
    if (left !== right) failures.push({ field, expected: left, actual: right })
  }
  return failures
}

export function parseRedirectMap(content) {
  const redirects = new Map()
  for (const rawLine of String(content ?? '').split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) continue
    const [source, target] = line.split(/\s+/)
    if (!source || !target || !source.startsWith('/') || source.startsWith('//')) continue
    redirects.set(normalizeUrlPath(source), target.startsWith('/') ? normalizeUrlPath(target) : target)
  }
  return redirects
}

export function outputHtmlPath(outDir, routePath) {
  const normalized = normalizeUrlPath(routePath)
  if (normalized === '/') return path.join(outDir, 'index.html')
  return path.join(outDir, normalized.replace(/^\//, ''), 'index.html')
}
