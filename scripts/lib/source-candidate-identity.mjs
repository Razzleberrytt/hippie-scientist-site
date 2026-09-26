function isNonEmpty(value) {
  return typeof value === 'string' && value.trim().length > 0
}

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/https?:\/\//g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
}

function canonicalizeUrl(raw) {
  if (!isNonEmpty(raw)) return null
  try {
    const url = new URL(raw)
    const pathname = url.pathname.replace(/\/+$/g, '') || '/'
    return `${url.protocol}//${url.hostname.toLowerCase()}${pathname}${url.search}`
  } catch {
    return null
  }
}

export function candidateSourceIdBase(candidate) {
  if (isNonEmpty(candidate?.pmid)) return `src_pubmed-${candidate.pmid.trim()}`
  if (isNonEmpty(candidate?.doi)) return `src_doi-${slugify(candidate.doi)}`
  const canonicalUrl = canonicalizeUrl(candidate?.canonicalUrl)
  if (canonicalUrl) return `src_url-${slugify(canonicalUrl)}`
  if (isNonEmpty(candidate?.monographId)) return `src_mono-${slugify(candidate.monographId)}`
  const year = Number.isInteger(candidate?.publicationYear) ? `-${candidate.publicationYear}` : ''
  return `src_title-${slugify(candidate?.title)}${year}`
}
