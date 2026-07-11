// Shared value normalization used by migration and patch ingestion.
//
// Handles the "obvious formatting differences" the spec calls out: whitespace,
// capitalization, boolean variants, delimiter differences, empty strings,
// duplicate aliases.

export function cleanString(value) {
  if (value == null) return ''
  return String(value).replace(/\s+/g, ' ').trim()
}

export function isEmpty(value) {
  return cleanString(value) === ''
}

const TRUE_VALUES = new Set(['true', 'yes', 'y', '1', 'x', 'on', 't'])
const FALSE_VALUES = new Set(['false', 'no', 'n', '0', 'off', 'f', ''])

// Parse a boolean-ish cell. Returns true/false, or undefined when unrecognized
// (so unknown values are preserved rather than coerced to false).
export function parseBoolean(value) {
  const v = cleanString(value).toLowerCase()
  if (TRUE_VALUES.has(v)) return true
  if (FALSE_VALUES.has(v)) return false
  return undefined
}

// Split a multi-value cell on any of ; | , / newline, trimming and dropping
// empties. Common across the workbook's mixed delimiters.
export function splitList(value) {
  if (Array.isArray(value)) return dedupeStrings(value.map(cleanString).filter(Boolean))
  const raw = cleanString(value)
  if (!raw) return []
  return dedupeStrings(
    raw
      .split(/[;|/\n]+|,(?![^(]*\))/) // split on delimiters, but not commas inside parens
      .map((part) => cleanString(part))
      .filter(Boolean),
  )
}

// Case-insensitive de-dupe that keeps first-seen casing.
export function dedupeStrings(values) {
  const seen = new Set()
  const out = []
  for (const value of values) {
    const key = cleanString(value).toLowerCase()
    if (!key || seen.has(key)) continue
    seen.add(key)
    out.push(cleanString(value))
  }
  return out
}

// Slugify a name deterministically (mirrors common site slug rules).
export function slugify(value) {
  return cleanString(value)
    .toLowerCase()
    .replace(/['’.]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Parse a number-ish cell to a finite number or undefined.
export function parseNumber(value) {
  const v = cleanString(value)
  if (!v) return undefined
  const n = Number(v)
  return Number.isFinite(n) ? n : undefined
}

// Map a workbook evidence descriptor to a canonical evidence_level enum.
export function normalizeEvidenceLevel(value) {
  const v = cleanString(value).toLowerCase()
  if (!v) return 'none'
  if (/rct|randomi/.test(v)) return 'human_rct'
  if (/human|clinical|observ|cohort|case/.test(v)) return 'human_obs'
  if (/preclin|animal|in ?vitro|cell|rodent|mouse|rat/.test(v)) return 'preclinical'
  if (/tradition|ethno|folk|historical/.test(v)) return 'traditional'
  if (/anecd|report|forum/.test(v)) return 'anecdotal'
  return 'none'
}
