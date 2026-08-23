/**
 * Deterministic normalization.
 *
 * Every candidate is normalized before it is validated, so validation and
 * overwrite comparison always see canonical forms. Normalization is pure and
 * idempotent: `normalize(normalize(x)) === normalize(x)` for every function
 * here, which is what makes "did this candidate actually change anything?" a
 * decidable question rather than a string-diff guess.
 */

const TRACKING_PARAMS = [
  /^utm_/i,
  /^fbclid$/i,
  /^gclid$/i,
  /^mc_(cid|eid)$/i,
  /^ref$/i,
  /^referrer$/i,
  /^source$/i,
  /^_hsenc$/i,
  /^_hsmi$/i,
]

export function normalizeWhitespace(value) {
  return String(value ?? '')
    .replace(/\r\n/g, '\n')
    .replace(/[\u00a0\u2007\u202f]/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .trim()
}

/** Straight quotes and dashes, so two spellings of the same string compare equal. */
export function normalizePunctuation(value) {
  return normalizeWhitespace(value)
    .replace(/[‘’‛]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/–/g, '-')
    .replace(/—/g, '-')
    .replace(/…/g, '...')
}

export function normalizeText(value) {
  return normalizePunctuation(value)
}

export function normalizeProse(value) {
  return normalizePunctuation(value).replace(/\s+([.,;:!?])/g, '$1')
}

/** Semicolon-delimited value lists: trimmed, de-duplicated, order preserved. */
export function normalizeSemicolonList(value) {
  const parts = normalizePunctuation(value)
    .split(/\s*;\s*/)
    .map((part) => part.trim())
    .filter(Boolean)
  const seen = new Set()
  const unique = []
  for (const part of parts) {
    const key = part.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    unique.push(part)
  }
  return unique.join('; ')
}

/** Binomial nomenclature: "Genus species", authority and rank markers preserved. */
export function normalizeBinomialName(value) {
  const text = normalizePunctuation(value).replace(/\s+/g, ' ').trim()
  if (!text) return ''
  const parts = text.split(' ')
  const genus = parts[0].charAt(0).toUpperCase() + parts[0].slice(1).toLowerCase()
  const rest = parts.slice(1).map((part) => {
    if (/^(var\.|subsp\.|ssp\.|f\.|cv\.|x)$/i.test(part)) return part.toLowerCase()
    // Authority strings keep their original casing; epithets are lowercased.
    return /^[A-Z]/.test(part) && parts.indexOf(part) > 1 ? part : part.toLowerCase()
  })
  return [genus, ...rest].join(' ')
}

export const NORMALIZERS = {
  text: normalizeText,
  prose: normalizeProse,
  semicolonList: normalizeSemicolonList,
  binomialName: normalizeBinomialName,
}

export function normalizeFieldValue(value, normalizerName = 'text') {
  const fn = NORMALIZERS[normalizerName]
  if (!fn) throw new Error(`Unknown normalizer "${normalizerName}". Known: ${Object.keys(NORMALIZERS).join(', ')}`)
  return fn(value)
}

/* ------------------------------------------------------------------ *
 * Bibliographic identifiers
 * ------------------------------------------------------------------ */

export function normalizeDoi(value) {
  let text = String(value ?? '').trim()
  if (!text) return ''
  text = text.replace(/^https?:\/\/(dx\.)?doi\.org\//i, '')
  text = text.replace(/^doi:\s*/i, '')
  text = text.replace(/[).,;\]]+$/, '')
  if (!/^10\.\d{4,9}\/\S+$/.test(text)) return ''
  return text.toLowerCase()
}

export function normalizePmid(value) {
  const text = String(value ?? '').trim().replace(/^pmid:?\s*/i, '')
  const match = text.match(/\b(\d{4,9})\b/)
  return match ? match[1] : ''
}

export function normalizePmcid(value) {
  const text = String(value ?? '').trim()
  const match = text.match(/PMC\s*(\d+)/i)
  return match ? `PMC${match[1]}` : ''
}

export function normalizeUrl(value) {
  const text = String(value ?? '').trim()
  if (!text) return ''
  let url
  try {
    url = new URL(text)
  } catch {
    return ''
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return ''
  url.protocol = 'https:'
  url.hostname = url.hostname.toLowerCase().replace(/^www\./, '')
  url.hash = ''
  if (url.pathname !== '/' && url.pathname.endsWith('/')) {
    url.pathname = url.pathname.replace(/\/+$/, '')
  }
  const keep = [...url.searchParams.entries()].filter(
    ([key]) => !TRACKING_PARAMS.some((pattern) => pattern.test(key)),
  )
  url.search = ''
  for (const [key, val] of keep.sort((a, b) => a[0].localeCompare(b[0]))) {
    url.searchParams.append(key, val)
  }
  return url.toString()
}

export function normalizeYear(value) {
  const match = String(value ?? '').match(/\b(1[5-9]\d{2}|20\d{2}|21\d{2})\b/)
  if (!match) return null
  const year = Number.parseInt(match[1], 10)
  return year >= 1500 && year <= 2100 ? year : null
}

export function normalizeSampleSize(value) {
  const match = String(value ?? '').replace(/,/g, '').match(/\b(\d{1,7})\b/)
  if (!match) return null
  const n = Number.parseInt(match[1], 10)
  return Number.isFinite(n) && n > 0 ? n : null
}

export function normalizeJournal(value) {
  return normalizePunctuation(value).replace(/\.$/, '')
}

export function normalizeAuthors(value) {
  return normalizePunctuation(value).replace(/\s*;\s*/g, '; ').replace(/\s*,\s*/g, ', ')
}

export function firstAuthorSurname(value) {
  const text = normalizeAuthors(value)
  if (!text) return ''
  const first = text.split(/[;]/)[0].trim()
  // "Ferracioli-Oda 2013", "Smith J", "Smith, John"
  const withoutYear = first.replace(/\b(1[5-9]\d{2}|20\d{2})\b/, '').trim()
  const commaForm = withoutYear.split(',')[0].trim()
  const token = commaForm.split(/\s+/)[0] || ''
  return token.replace(/[^A-Za-zÀ-ɏ-]/g, '').toLowerCase()
}

/** Title key used only for last-resort source identity matching. */
export function normalizeTitleKey(value) {
  return normalizePunctuation(value)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\b(a|an|the|of|and|in|on|for|to|with)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/* ------------------------------------------------------------------ *
 * Study and evidence vocabulary
 * ------------------------------------------------------------------ */

const STUDY_TYPE_MAP = [
  [/systematic[\s_-]*review.*meta[\s_-]*analys/i, 'systematic-review-meta-analysis'],
  [/meta[\s_-]*analys/i, 'meta-analysis'],
  [/systematic[\s_-]*review/i, 'systematic-review'],
  [/randomi[sz]ed.*(double|placebo|controlled|clinical|trial)/i, 'randomized-controlled-trial'],
  [/\brct\b/i, 'randomized-controlled-trial'],
  [/cross[\s_-]*over/i, 'crossover-trial'],
  [/cohort/i, 'cohort-study'],
  [/case[\s_-]*control/i, 'case-control-study'],
  [/cross[\s_-]*sectional/i, 'cross-sectional-study'],
  [/case[\s_-]*(report|series)/i, 'case-report'],
  [/pharmacokinetic|\bpk\b/i, 'pharmacokinetic-study'],
  [/in[\s_-]*vitro/i, 'in-vitro'],
  [/animal|in[\s_-]*vivo|rodent|murine|rat\b|mice\b/i, 'in-vivo-animal'],
  [/narrative[\s_-]*review|review/i, 'narrative-review'],
  [/monograph/i, 'monograph'],
]

export function normalizeStudyType(value) {
  const text = String(value ?? '').trim()
  if (!text) return ''
  for (const [pattern, canonical] of STUDY_TYPE_MAP) {
    if (pattern.test(text)) return canonical
  }
  return 'unclassified'
}

const PRECLINICAL_STUDY_TYPES = new Set(['in-vitro', 'in-vivo-animal'])
const HUMAN_STUDY_TYPES = new Set([
  'systematic-review-meta-analysis',
  'meta-analysis',
  'systematic-review',
  'randomized-controlled-trial',
  'crossover-trial',
  'cohort-study',
  'case-control-study',
  'cross-sectional-study',
  'case-report',
  'pharmacokinetic-study',
])

export function studyTypeIsHuman(studyType) {
  return HUMAN_STUDY_TYPES.has(normalizeStudyType(studyType))
}

export function studyTypeIsPreclinical(studyType) {
  return PRECLINICAL_STUDY_TYPES.has(normalizeStudyType(studyType))
}

/**
 * Comparison-only grade normalization.
 *
 * The workbook carries 32 raw spellings of evidence_grade. This collapses them
 * so two candidates can be compared, but it is deliberately NOT a writer:
 * evidence_grade is a manual-review field and the canonical normalization pass
 * is scripts/data/normalize-evidence-grades.ts.
 */
export function normalizeEvidenceGradeForComparison(value) {
  const text = String(value ?? '').trim().toLowerCase()
  if (!text) return ''
  if (/^a\+?$/.test(text) || /\bstrong\b/.test(text) || /\bhigh\b/.test(text)) return 'a'
  if (/^b[+-]?$/.test(text) || /\bmoderate\b/.test(text)) return 'b'
  if (/^c[+-]?$/.test(text) || /\blimited\b/.test(text) || /\bpreliminary\b/.test(text)) return 'c'
  if (/^d$/.test(text) || /\binsufficient\b/.test(text) || /^f$/.test(text) || /\blow\b/.test(text)) return 'd'
  return text
}

export function normalizePopulation(value) {
  return normalizePunctuation(value).toLowerCase().replace(/\.$/, '')
}

export function normalizeDoseDuration(value) {
  return normalizePunctuation(value)
    .replace(/\s*\/\s*/g, '/')
    .replace(/\s*;\s*/g, '; ')
    .toLowerCase()
}

/** Normalize a whole source record in place-safe fashion. */
export function normalizeSource(source) {
  return {
    ...source,
    doi: normalizeDoi(source?.doi),
    pmid: normalizePmid(source?.pmid),
    pmcid: normalizePmcid(source?.pmcid),
    url: normalizeUrl(source?.url),
    title: normalizePunctuation(source?.title),
    journal: normalizeJournal(source?.journal),
    authors: normalizeAuthors(source?.authors),
    year: normalizeYear(source?.year),
    study_type: source?.study_type ? normalizeStudyType(source.study_type) : '',
    sample_size: source?.sample_size != null ? normalizeSampleSize(source.sample_size) : null,
    population: source?.population ? normalizePopulation(source.population) : '',
  }
}

/** Normalize a candidate document. Pure — returns a new object. */
export function normalizeCandidate(candidate, contract) {
  const sources = (candidate.sources || []).map(normalizeSource)
  const changes = (candidate.changes || []).map((change) => {
    const field = contract?.fields?.get?.(change.field)
    const normalizer = field?.normalizer || 'text'
    return {
      ...change,
      current_value: normalizeText(change.current_value),
      proposed_value:
        change.operation === 'set' ? normalizeFieldValue(change.proposed_value, normalizer) : '',
    }
  })
  return { ...candidate, sources, changes }
}
