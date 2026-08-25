function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0
}

function normalizeDoi(value) {
  if (!isNonEmptyString(value)) return null
  let normalized = value.trim().toLowerCase()
    .replace(/^https?:\/\/(?:dx\.)?doi\.org\//u, '')
    .replace(/^doi:\s*/u, '')
  try {
    normalized = decodeURIComponent(normalized)
  } catch {
    // Preserve the original token when percent-decoding is invalid.
  }
  return normalized || null
}

function normalizePmid(value) {
  if (!isNonEmptyString(value)) return null
  return value.trim().replace(/^pmid:\s*/iu, '') || null
}

function normalizeCanonicalUrl(value) {
  if (!isNonEmptyString(value)) return null
  const trimmed = value.trim()
  try {
    const url = new URL(trimmed)
    url.hash = ''
    if (url.pathname.length > 1) url.pathname = url.pathname.replace(/\/+$/u, '')
    return url.toString()
  } catch {
    return trimmed
  }
}

export function identityTokens(source) {
  const tokens = new Set()
  const pmid = normalizePmid(source?.pmid)
  const doi = normalizeDoi(source?.doi)
  if (pmid) tokens.add(`pmid:${pmid}`)
  if (doi) tokens.add(`doi:${doi}`)

  const canonicalUrl = normalizeCanonicalUrl(source?.canonicalUrl)
  if (canonicalUrl) {
    try {
      const url = new URL(canonicalUrl)
      const hostname = url.hostname.toLowerCase().replace(/^www\./u, '')
      const pubmedPath = hostname === 'pubmed.ncbi.nlm.nih.gov'
        ? url.pathname.match(/^\/(\d+)$/u)
        : hostname === 'ncbi.nlm.nih.gov'
          ? url.pathname.match(/^\/pubmed\/(\d+)$/u)
          : null

      if (hostname === 'doi.org' || hostname === 'dx.doi.org') {
        const canonicalDoi = normalizeDoi(url.pathname.replace(/^\//u, ''))
        if (canonicalDoi) tokens.add(`doi:${canonicalDoi}`)
      } else if (pubmedPath) {
        tokens.add(`pmid:${pubmedPath[1]}`)
      } else {
        tokens.add(`url:${canonicalUrl}`)
      }
    } catch {
      tokens.add(`url:${canonicalUrl}`)
    }
  }

  if (isNonEmptyString(source?.monographId)) {
    tokens.add(`monograph:${source.monographId.trim().toLowerCase()}`)
  }
  return [...tokens].sort()
}
