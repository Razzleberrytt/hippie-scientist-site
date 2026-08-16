/** Canonical primitives for deciding whether structured data is meaningfully populated. */

export const MISSING_LIKE_VALUES = new Set([
  '', 'na', 'n/a', 'none', 'null', 'undefined', 'unknown', 'unk', 'tbd', '-', '--',
])

export const GENERIC_PLACEHOLDER_PATTERNS = [
  /\bneeds review\b/i,
  /\bsafety review pending\b/i,
  /\bresearch[ _-]?pending\b/i,
  /\bresearch[ _-]?only\b/i,
  /\bplaceholder\b/i,
]

export function normalizeStructuredText(value) {
  return String(value ?? '').replace(/\s+/g, ' ').trim()
}

export function isMissingLike(value) {
  return MISSING_LIKE_VALUES.has(normalizeStructuredText(value).toLowerCase())
}

export function hasMeaningfulText(value, extraPatterns = []) {
  const text = normalizeStructuredText(value)
  if (isMissingLike(text)) return false
  return ![...GENERIC_PLACEHOLDER_PATTERNS, ...extraPatterns].some((pattern) => pattern.test(text))
}

export function collectionHasMeaningfulText(value, extraPatterns = []) {
  if (Array.isArray(value)) return value.some((item) => hasMeaningfulText(item, extraPatterns))
  return hasMeaningfulText(value, extraPatterns)
}
