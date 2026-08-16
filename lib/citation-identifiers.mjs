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

/**
 * PubMed IDs are positive integers, currently 8 digits and growing. No leading
 * zero has ever been issued, so one signals a malformed or truncated value.
 */
export const PMID_PATTERN = /^[1-9]\d{0,8}$/

/** DOIs are a `10.` registrant prefix and a non-empty suffix. */
export const DOI_PATTERN = /^10\.\d{4,9}\/\S+$/

/** Separators seen between identifiers packed into one cell. */
const IDENTIFIER_SEPARATOR = /[;,]|\s+and\s+|\s{2,}/i

/** Separators seen between full URLs packed into one workbook cell. */
const URL_SEPARATOR = /\s*\|\s*|\r?\n+/

/**
 * @param {unknown} value
 * @returns {string}
 */
function text(value) {
  return String(value ?? '').trim()
}

/**
 * @param {unknown} value
 * @returns {boolean}
 */
export function isValidPmid(value) {
  return PMID_PATTERN.test(text(value))
}

/**
 * @param {unknown} value
 * @returns {boolean}
 */
export function isValidDoi(value) {
  return DOI_PATTERN.test(normalizeDoi(value))
}

/**
 * Strip the resolver prefixes a DOI arrives with.
 *
 * @param {unknown} value
 * @returns {string}
 */
export function normalizeDoi(value) {
  return text(value)
    .replace(/^https?:\/\/(?:dx\.)?doi\.org\//i, '')
    .replace(/^doi:\s*/i, '')
    .trim()
}

/**
 * Every valid PubMed ID in a value, in order, de-duplicated.
 *
 * A cell holding `"15070181; 22167571"` describes two studies and returns two
 * identifiers. Values that are not valid PMIDs are dropped rather than passed
 * through, because a malformed identifier renders as a dead citation link.
 *
 * @param {unknown} value
 * @returns {string[]}
 */
export function normalizePmidList(value) {
  const raw = text(value)
  if (!raw) return []

  const seen = new Set()
  for (const part of raw.split(IDENTIFIER_SEPARATOR)) {
    // Tolerate `PMID: 12345` and bare pubmed URLs inside a packed cell.
    const candidate = part
      .trim()
      .replace(/^pmid:?\s*/i, '')
      .replace(/^https?:\/\/pubmed\.ncbi\.nlm\.nih\.gov\//i, '')
      .replace(/\/$/, '')
      .trim()
    if (isValidPmid(candidate)) seen.add(candidate)
  }
  return [...seen]
}

/**
 * Every usable full URL in a value, in order, de-duplicated.
 *
 * Some legacy workbook cells contain multiple complete links separated by a
 * pipe. A browser cannot navigate to the packed string, so keep the first
 * valid link as the canonical href while leaving identifier fields available
 * for additional study counting.
 *
 * @param {unknown} value
 * @returns {string[]}
 */
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

/**
 * The identifier a citation should link to, preferring a direct URL when one
 * is usable, then DOI, then PMID.
 *
 * @param {{ doi?: unknown, pmid?: unknown, pubmedId?: unknown, url?: unknown }} source
 * @returns {string}
 */
export function citationUrl(source) {
  const [direct] = normalizeCitationUrlList(source?.url)
  if (direct) return direct

  const doi = normalizeDoi(source?.doi)
  if (isValidDoi(doi)) return `https://doi.org/${doi}`

  const [pmid] = normalizePmidList(source?.pmid ?? source?.pubmedId)
  if (pmid) return `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`

  return ''
}

/**
 * Titles that record the absence of metadata rather than naming a study.
 *
 * `"PubMed PMID 37818728. Minimal citation row added from existing evidence."`
 * is a note to whoever fills the row in, and it currently renders as the study
 * title on a live page.
 */
const PLACEHOLDER_TITLE_PATTERNS = [
  /minimal citation row/i,
  /metadata extraction required/i,
  /abstract unavailable/i,
  /^pubmed\s+pmid\s+\d+\.?$/i,
  /^(?:doi|pmid)\s+\S+$/i,
  /\bplaceholder\b/i,
  /\bto be (?:added|filled|completed)\b/i,
]

/**
 * @param {unknown} value
 * @returns {boolean}
 */
export function isPlaceholderCitationTitle(value) {
  const title = text(value)
  if (!title) return true
  return PLACEHOLDER_TITLE_PATTERNS.some((pattern) => pattern.test(title))
}

/**
 * Which of the fields a reader needs are present on a citation.
 *
 * @param {Record<string, unknown>} source
 * @returns {{ complete: boolean, missing: string[], identifier: string }}
 */
export function citationCompleteness(source) {
  const missing = []
  const doi = normalizeDoi(source?.doi)
  const pmids = normalizePmidList(source?.pmid ?? source?.pubmedId)
  const identifier = isValidDoi(doi) ? `doi:${doi}` : pmids[0] ? `pmid:${pmids[0]}` : ''

  if (!identifier) missing.push('identifier')
  if (isPlaceholderCitationTitle(source?.title)) missing.push('title')
  if (!text(source?.year)) missing.push('year')
  if (!text(source?.authors ?? source?.author_or_label)) missing.push('authors')
  if (!text(source?.journal)) missing.push('journal')

  return { complete: missing.length === 0, missing, identifier }
}
