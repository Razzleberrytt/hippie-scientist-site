const DOI_HOSTS = new Set(['doi.org', 'dx.doi.org'])
const PUBMED_HOSTS = new Set(['pubmed.ncbi.nlm.nih.gov', 'ncbi.nlm.nih.gov', 'www.ncbi.nlm.nih.gov'])

export const UNIQUE_SOURCE_IDENTITY_FIELDS = Object.freeze(['pmid', 'doi', 'canonicalUrl', 'monographId'])

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0
}

function normalizeDoi(value) {
  if (!isNonEmptyString(value)) return null
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\/(?:dx\.)?doi\.org\//u, '')
    .replace(/^doi:\s*/u, '')
    .replace(/\/+$/u, '')
  return normalized || null
}

function normalizePmid(value) {
  if (!isNonEmptyString(value)) return null
  const normalized = value.trim().replace(/^pmid:\s*/iu, '')
  return normalized || null
}

function normalizeUrl(value) {
  if (!isNonEmptyString(value)) return null
  try {
    const url = new URL(value.trim())
    url.hash = ''
    if (url.pathname.length > 1) url.pathname = url.pathname.replace(/\/+$/u, '')
    return url
  } catch {
    return null
  }
}

function decodePathname(pathname) {
  try {
    return decodeURIComponent(pathname)
  } catch {
    return pathname
  }
}

function recognizedAnchorToken(url) {
  const hostname = url.hostname.toLowerCase()
  if (DOI_HOSTS.has(hostname)) {
    const doi = normalizeDoi(decodePathname(url.pathname).replace(/^\/+/, ''))
    return doi ? `doi:${doi}` : null
  }

  if (!PUBMED_HOSTS.has(hostname)) return null
  const pattern = hostname === 'pubmed.ncbi.nlm.nih.gov' ? /^\/(\d+)\/?$/u : /^\/pubmed\/(\d+)\/?$/u
  const match = url.pathname.match(pattern)
  return match ? `pmid:${match[1]}` : null
}

export function normalizeSourceIdentityValue(field, value) {
  if (field === 'pmid') return normalizePmid(value)
  if (field === 'doi') return normalizeDoi(value)
  if (field === 'canonicalUrl') {
    const url = normalizeUrl(value)
    return url ? url.toString() : isNonEmptyString(value) ? value.trim() : null
  }
  return isNonEmptyString(value) ? value.trim().toLowerCase() : null
}

export function sourceIdentityTokens(field, value) {
  const normalized = normalizeSourceIdentityValue(field, value)
  if (!normalized) return []

  if (field === 'pmid') return [`pmid:${normalized}`]
  if (field === 'doi') return [`doi:${normalized}`]
  if (field === 'monographId') return [`monograph:${normalized}`]

  const url = normalizeUrl(value)
  const tokens = [`canonical-url:${normalized}`]
  if (url) {
    const recognized = recognizedAnchorToken(url)
    if (recognized) tokens.push(recognized)
  }
  return [...new Set(tokens)]
}
