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
const INSUFFICIENT_RE = /\b(insufficient|no evidence|none|avoid|blocked|contraindicat(?:ed|ion)?)\b/i
const PRECLINICAL_RE = /\b(preclinical|animal(?:\s+stud(?:y|ies))?|in\s*vitro|cell(?:ular)?\s+(?:study|studies)|theoretical|no\s+human(?:\s+(?:trial|trials|evidence|data))?)\b/i
const MECHANISTIC_RE = /\bmechanistic(?:\s+evidence)?\b/i
const HUMAN_CLINICAL_RE = /\b(human|clinical|rct|randomi[sz]ed|controlled\s+trial|trial|meta[- ]analysis|systematic\s+review)\b/i
const MIXED_RE = /\b(mixed|inconsistent|conflict(?:ing)?|equivocal)\b/i

const STRONG_RE = /\b(moderate[- ]to[- ]strong|strong|robust|high[- ]quality|well[- ]established)\b/i
const MODERATE_RE = /\b(limited[- ]to[- ]moderate|moderate)\b/i
const LIMITED_RE = /\b(limited|low[- ]moderate|emerging)\b/i
const PRELIMINARY_RE = /\b(preliminary|pilot|early|weak|low)\b/i

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

/**
 * Conservative phrase classifier.
 *
 * Disqualifying language is checked before positive adjectives. This prevents
 * strings such as "strong mechanistic evidence; no human trials" from being
 * upgraded merely because the word "strong" appears first. Mechanistic wording
 * only caps the grade when no human/clinical study signal is present.
 */
function bandFromPhrase(value) {
  if (INSUFFICIENT_RE.test(value)) return 'insufficient'
  if (PRECLINICAL_RE.test(value)) return 'preliminary'
  if (MECHANISTIC_RE.test(value) && !HUMAN_CLINICAL_RE.test(value)) return 'preliminary'
  if (MIXED_RE.test(value)) return 'limited'
  if (STRONG_RE.test(value)) return 'strong'
  if (MODERATE_RE.test(value)) return 'moderate'
  if (LIMITED_RE.test(value)) return 'limited'
  if (PRELIMINARY_RE.test(value)) return 'preliminary'
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
  const value = String(tier ?? '').trim()
  if (!value) return null
  const band = bandFromPhrase(value)
  return band ? GRADE_FOR_BAND[band] : null
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
