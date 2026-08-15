/**
 * Runtime-agnostic evidence-grade normalization core.
 *
 * This file is plain ESM on purpose: Next/TypeScript code and Node `.mjs` data
 * pipelines both import this exact implementation. Keep legacy parsing here so
 * build scripts, migrations, validators, and UI cannot grow competing rules.
 */

export const CANONICAL_EVIDENCE_GRADES = Object.freeze([
  'A',
  'B',
  'C',
  'D',
  'Avoid/Insufficient',
])

export const BAND_LABEL = Object.freeze({
  strong: 'Strong evidence',
  moderate: 'Moderate evidence',
  limited: 'Limited evidence',
  preliminary: 'Preliminary evidence',
  insufficient: 'Insufficient evidence',
})

export const CANONICAL_GRADE_LABEL = Object.freeze({
  A: 'Grade A: Strong Evidence',
  B: 'Grade B: Moderate Evidence',
  C: 'Grade C: Limited Evidence',
  D: 'Grade D: Preliminary / Theoretical Evidence',
  'Avoid/Insufficient': 'Avoid / Insufficient Evidence',
})

export const LETTER_LABEL = Object.freeze({
  A: CANONICAL_GRADE_LABEL.A,
  B: CANONICAL_GRADE_LABEL.B,
  C: CANONICAL_GRADE_LABEL.C,
  D: CANONICAL_GRADE_LABEL.D,
})

const GRADE_FOR_BAND = Object.freeze({
  strong: 'A',
  moderate: 'B',
  limited: 'C',
  preliminary: 'D',
  insufficient: 'Avoid/Insufficient',
})

const BAND_FOR_GRADE = Object.freeze({
  A: 'strong',
  B: 'moderate',
  C: 'limited',
  D: 'preliminary',
  'Avoid/Insufficient': 'insufficient',
})

const BARE_LETTER_RE = /^([a-d])\s*[+-]?$/i
const LEGACY_FAIL_RE = /^f\s*[+-]?$/i
const OUTCOME_DEPENDENT_RE = /\b[a-df]\s*[+-]?\s+for\s+\w+.*;\s*[a-df]\s*[+-]?\s+for\s+/i

const PHRASE_BANDS = [
  [/\b(moderate[- ]to[- ]strong|strong|robust|high[- ]quality|well[- ]established)\b/i, 'strong'],
  [/\b(limited[- ]to[- ]moderate|moderate)\b/i, 'moderate'],
  [/\b(mixed|inconsistent|limited|low[- ]moderate|emerging)\b/i, 'limited'],
  [/\b(preliminary|pilot|early|weak|mechanistic|theoretical|preclinical|no human|low)\b/i, 'preliminary'],
  [/\b(insufficient|no evidence|none|avoid|blocked|contraindicated)\b/i, 'insufficient'],
]

const EMPTY = Object.freeze({
  grade: null,
  letter: null,
  band: null,
  label: 'Evidence grade not assigned',
  raw: '',
  canonical: false,
  outcomeDependent: false,
})

export function isCanonicalEvidenceGrade(value) {
  return CANONICAL_EVIDENCE_GRADES.includes(value)
}

export function bandFromCanonicalGrade(grade) {
  return BAND_FOR_GRADE[grade] ?? null
}

function bandFromPhrase(value) {
  for (const [pattern, band] of PHRASE_BANDS) {
    if (pattern.test(value)) return band
  }
  return null
}

function normalizedFromGrade(grade, raw, canonical, sourceLabel) {
  const label = sourceLabel && sourceLabel !== grade
    ? `${CANONICAL_GRADE_LABEL[grade]} — ${sourceLabel}`
    : CANONICAL_GRADE_LABEL[grade]

  return {
    grade,
    letter: grade === 'Avoid/Insufficient' ? null : grade,
    band: BAND_FOR_GRADE[grade],
    label,
    raw,
    canonical,
    outcomeDependent: false,
  }
}

export function normalizeEvidenceGrade(raw) {
  const value = String(raw ?? '').trim()
  if (!value) return { ...EMPTY }

  if (OUTCOME_DEPENDENT_RE.test(value)) {
    return {
      grade: null,
      letter: null,
      band: null,
      label: value,
      raw: value,
      canonical: false,
      outcomeDependent: true,
    }
  }

  if (isCanonicalEvidenceGrade(value)) {
    return normalizedFromGrade(value, value, true)
  }

  if (/^avoid\s*\/\s*insufficient$/i.test(value)) {
    return normalizedFromGrade('Avoid/Insufficient', value, false)
  }

  const bare = BARE_LETTER_RE.exec(value)
  if (bare) {
    return normalizedFromGrade(bare[1].toUpperCase(), value, false)
  }

  if (LEGACY_FAIL_RE.test(value)) {
    return normalizedFromGrade('Avoid/Insufficient', value, false)
  }

  const band = bandFromPhrase(value)
  if (band) {
    const grade = GRADE_FOR_BAND[band]
    return normalizedFromGrade(grade, value, false, value)
  }

  return { ...EMPTY, raw: value, label: value }
}

export function canonicalGradeFromEvidenceTier(tier) {
  const value = String(tier ?? '').toLowerCase().trim()
  if (!value) return null
  if (/\b(insufficient|no evidence|none|avoid|blocked|contraindicat)/.test(value)) return 'Avoid/Insufficient'
  if (value.includes('strong')) return 'A'
  if (value.includes('moderate')) return 'B'
  if (value.includes('limited') || value.includes('contextual') || value.includes('mixed')) return 'C'
  if (
    value.includes('mechanistic') ||
    value.includes('preclinical') ||
    value.includes('preliminary') ||
    value.includes('traditional') ||
    value.includes('theoretical') ||
    value.includes('early')
  ) {
    return 'D'
  }
  return null
}

export function bandFromEvidenceTier(tier) {
  const grade = canonicalGradeFromEvidenceTier(tier)
  return grade ? BAND_FOR_GRADE[grade] : null
}

export const BAND_ORDER = Object.freeze([
  'insufficient',
  'preliminary',
  'limited',
  'moderate',
  'strong',
])

export function gradeTierDistance(gradeBand, tierBand) {
  if (!gradeBand || !tierBand) return null
  return Math.abs(BAND_ORDER.indexOf(gradeBand) - BAND_ORDER.indexOf(tierBand))
}

/**
 * Persisted-data helper: returns the canonical enum value or null. It never
 * falls back to evidence tier because migrations should expose missing/unknown
 * grade data rather than silently synthesize it from another field.
 */
export function canonicalizePersistedEvidenceGrade(raw) {
  return normalizeEvidenceGrade(raw).grade
}
