/**
 * Canonical handling for the two identifiers a citation can carry.
 *
 * Citation rows are assembled from workbook cells, and a cell holding two
 * studies is written as one string: `pmid: "15070181; 22167571"`. Nothing
 * split it, so the exporter built
 * `https://pubmed.ncbi.nlm.nih.gov/15070181/; https://pubmed.ncbi.nlm.nih.gov/22167571/`
 * as a single href — a link that resolves nowhere. Two compounds shipped that
 * way and the production-invariants gate blocks on both.
 *
 * Splitting here rather than at the render layer means the two studies stay
 * countable as two studies, which matters because evidence strength is derived
 * from how many independent sources back a claim.
 */

export const PMID_PATTERN = /^[1-9]\d{0,8}$/
export const DOI_PATTERN = /^10\.\d{4,9}\/\S+$/
const IDENTIFIER_SEPARATOR = /[;,]|\s+and\s+|\s{2,}/i
const URL_SEPARATOR = /\s*\|\s*|\r?\n+/
function text(value) { return String(value ?? '').trim() }
export function isValidPmid(value) { return PMID_PATTERN.test(text(value)) }
export function isValidDoi(value) { return DOI_PATTERN.test(normalizeDoi(value)) }
export function normalizeDoi(value) {
  return text(value).replace(/^https?:\/\/(?:dx\.)?doi\.org\//i, '').replace(/^doi:\s*/i, '').trim()
}
export function normalizePmidList(value) {
  const raw = text(value)
  if (!raw) return []
  const seen = new Set()
  for (const part of raw.split(IDENTIFIER_SEPARATOR)) {
    const candidate = part.trim().replace(/^pmid:?\s*/i, '').replace(/^https?:\/\/pubmed\.ncbi\.nlm\.nih\.gov\//i, '').replace(/\/$/, '').trim()
    if (isValidPmid(candidate)) seen.add(candidate)
  }
  return [...seen]
}
export function citationIdentifiers(source) {
  const identifiers = []
  const doi = normalizeDoi(source?.doi)
  if (isValidDoi(doi)) identifiers.push(`doi:${doi.toLowerCase()}`)
  for (const pmid of normalizePmidList(source?.pmid ?? source?.pubmedId)) identifiers.push(`pmid:${pmid}`)
  return identifiers
}
function createIdentifierUnion() {
  const parent = new Map()
  const find = (value) => {
    const current = parent.get(value) ?? value
    if (current === value) { parent.set(value, value); return value }
    const root = find(current); parent.set(value, root); return root
  }
  const union = (left, right) => {
    const leftRoot = find(left), rightRoot = find(right)
    if (leftRoot === rightRoot) return
    const [keep, merge] = [leftRoot, rightRoot].sort(); parent.set(merge, keep)
  }
  return { parent, find, union }
}
export function buildCitationIdentifierIdentityMap(sources = []) {
  const { parent, find, union } = createIdentifierUnion()
  for (const source of sources) {
    const identifiers = citationIdentifiers(source)
    for (const identifier of identifiers) find(identifier)
    const dois = identifiers.filter(identifier => identifier.startsWith('doi:'))
    const pmids = identifiers.filter(identifier => identifier.startsWith('pmid:'))
    if (dois.length === 1 && pmids.length === 1) union(dois[0], pmids[0])
  }
  const identities = new Map()
  for (const identifier of parent.keys()) identities.set(identifier, find(identifier))
  return identities
}
export function canonicalCitationIdentifier(source, identities) {
  for (const identifier of citationIdentifiers(source)) {
    const canonical = identities.get(identifier)
    if (canonical) return canonical
  }
  return ''
}
export function normalizeCitationUrlList(value) {
  const raw = text(value)
  if (!raw) return []
  const seen = new Set()
  for (const part of raw.split(URL_SEPARATOR)) {
    const candidate = part.trim()
    if (!/^https?:\/\/\S+$/i.test(candidate)) continue
    if (!seen.has(candidate)) seen.add(candidate)
  }
  return [...seen]
}
export function citationUrl(source) {
  const [direct] = normalizeCitationUrlList(source?.url)
  if (direct) return direct
  const doi = normalizeDoi(source?.doi)
  if (isValidDoi(doi)) return `https://doi.org/${doi}`
  const [pmid] = normalizePmidList(source?.pmid ?? source?.pubmedId)
  if (pmid) return `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`
  return ''
}
const PLACEHOLDER_TITLE_PATTERNS = [/minimal citation row/i,/metadata extraction required/i,/abstract unavailable/i,/^pubmed\s+pmid\s+\d+\.?$/i,/^(?:doi|pmid)\s+\S+$/i,/\bplaceholder\b/i,/\bto be (?:added|filled|completed)\b/i]
export function isPlaceholderCitationTitle(value) {
  const title = text(value)
  if (!title) return true
  return PLACEHOLDER_TITLE_PATTERNS.some(pattern => pattern.test(title))
}
export function citationCompleteness(source) {
  const missing = []
  const [identifier = ''] = citationIdentifiers(source)
  if (!identifier) missing.push('identifier')
  if (isPlaceholderCitationTitle(source?.title)) missing.push('title')
  if (!text(source?.year)) missing.push('year')
  if (!text(source?.authors ?? source?.author_or_label)) missing.push('authors')
  if (!text(source?.journal)) missing.push('journal')
  return { complete: missing.length === 0, missing, identifier }
}
