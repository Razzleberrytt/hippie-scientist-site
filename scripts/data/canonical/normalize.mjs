// Shared value normalization used by migration and patch ingestion.
//
// Handles ingestion-specific coercion while delegating generic text/slug rules
// to the repo-wide canonical primitives.

import { normalizeStructuredText } from '../../../lib/data-quality.mjs'
import { slugifyEntityName } from '../../../lib/entity-identity.mjs'

export function cleanString(value) {
  return normalizeStructuredText(value)
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
      .split(/[;|/\n]+|,(?![^(]*\))/)
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

// Backward-compatible ingestion export backed by the canonical entity slugger.
export function slugify(value) {
  return slugifyEntityName(value)
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
