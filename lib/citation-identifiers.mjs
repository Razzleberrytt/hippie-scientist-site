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
 * Return every stable identifier that names a citation, in canonical form.
 * DOI is listed first because it is the preferred resolver. A packed PMID cell
 * can return more than one PMID because those values name distinct studies;
 * callers must not assume every returned identifier is an alias of one study.
 *
 * @param {{ doi?: unknown, pmid?: unknown, pubmedId?: unknown }} source
 * @returns {string[]}
 */
export function citationIdentifiers(source) {
  const identifiers = []
  const doi = normalizeDoi(source?.doi)
  if (isValidDoi(doi)) identifiers.push(`doi:${doi.toLowerCase()}`)
  for (const pmid of normalizePmidList(source?.pmid ?? source?.pubmedId)) {
    identifiers.push(`pmid:${pmid}`)
  }
  return identifiers
}

function createIdentifierUnion() {
  const parent = new Map()
  const find = (value) => {
    const current = parent.get(value) ?? value
    if (current === value) {
      parent.set(value, value)
      return value
    }
    const root = find(current)
    parent.set(value, root)
    return root
  }
  const union = (left, right) => {
    const leftRoot = find(left)
    const rightRoot = find(right)
    if (leftRoot === rightRoot) return
    const [keep, merge] = [leftRoot, rightRoot].sort()
    parent.set(merge, keep)
  }
  return { parent, find, union }
}

/**
 * Build one deterministic DOI/PMID alias identity map for a citation corpus.
 *
 * A DOI and PMID are unioned only when one row carries exactly one valid DOI
 * and exactly one valid PMID. Multiple PMIDs in one raw row are distinct studies
 * and are never unioned with each other (or guessed onto a DOI). This keeps the
 * resolver safe even if an unsplit legacy row reaches it.
 *
 * @param {Array<{ doi?: unknown, pmid?: unknown, pubmedId?: unknown }>} sources
 * @returns {Map<string, string>}
 */
export function buildCitationIdentifierIdentityMap(sources = []) {
  const { parent, find, union } = createIdentifierUnion()

  for (const source of sources) {
    const identifiers = citationIdentifiers(source)
    for (const identifier of identifiers) find(identifier)
    const doiIdentifiers = identifiers.filter((identifier) => identifier.startsWith('doi:'))
    const pmidIdentifiers = identifiers.filter((identifier) => identifier.startsWith('pmid:'))
    if (doiIdentifiers.length === 1 && pmidIdentifiers.length === 1) {
      union(doiIdentifiers[0], pmidIdentifiers[0])
    }
  }

  const identities = new Map()
  for (const identifier of parent.keys()) identities.set(identifier, find(identifier))
  return identities
}

/**
 * Resolve one normalized citation row onto the canonical identity produced by
 * buildCitationIdentifierIdentityMap. Identifier-less rows return an empty
 * string so the caller can apply its context-specific fallback identity.
 *
 * @param {{ doi?: unknown, pmid?: unknown, pubmedId?: unknown }} source
 * @param {Map<string, string>} identities
 * @returns {string}
 */
export function canonicalCitationIdentifier(source, identities) {
  for (const identifier of citationIdentifiers(source)) {
    const canonical = identities.get(identifier)
    if (canonical) return canonical
  }
  return ''
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
 * @param {Record<string, unknown>} source
 * @returns {{ complete: boolean, missing: string[], identifier: string }}
 */
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
