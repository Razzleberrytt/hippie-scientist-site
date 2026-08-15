/**
 * Canonical evidence-grade contract.
 *
 * The workbook historically accepted free-text values such as `a`, `B+`,
 * `moderate-high`, `Strong drug evidence`, and `F`. Those legacy values are
 * still accepted at the ingestion boundary, but they must collapse into one
 * canonical public/data contract:
 *
 *   A | B | C | D | Avoid/Insufficient
 *
 * Unknown or outcome-dependent values intentionally normalize to `null`; a
 * caller must not invent a grade when the source does not support one.
 */

export const CANONICAL_EVIDENCE_GRADES = ['A', 'B', 'C', 'D', 'Avoid/Insufficient'] as const

export type CanonicalEvidenceGrade = (typeof CANONICAL_EVIDENCE_GRADES)[number]
export type EvidenceLetter = Exclude<CanonicalEvidenceGrade, 'Avoid/Insufficient'>
export type EvidenceBand = 'strong' | 'moderate' | 'limited' | 'preliminary' | 'insufficient'

export type NormalizedEvidenceGrade = {
  /** Canonical grade, or null when no honest single grade can be assigned. */
  grade: CanonicalEvidenceGrade | null
  /** Single-letter badge value. Avoid/Insufficient intentionally has no letter. */
  letter: EvidenceLetter | null
  /** Coarse semantic band used for comparisons and presentation. */
  band: EvidenceBand | null
  /** Human-readable label for display. */
  label: string
  /** Original source value preserved for audit/migration reporting. */
  raw: string
  /** True only when the source already equals one canonical enum value. */
  canonical: boolean
  /** True when the source grades different outcomes differently. */
  outcomeDependent: boolean
}

const BAND_LABEL: Record<EvidenceBand, string> = {
  strong: 'Strong evidence',
  moderate: 'Moderate evidence',
  limited: 'Limited evidence',
  preliminary: 'Preliminary evidence',
  insufficient: 'Insufficient evidence',
}

export const CANONICAL_GRADE_LABEL: Record<CanonicalEvidenceGrade, string> = {
  A: 'Grade A: Strong Evidence',
  B: 'Grade B: Moderate Evidence',
  C: 'Grade C: Limited Evidence',
  D: 'Grade D: Preliminary / Theoretical Evidence',
  'Avoid/Insufficient': 'Avoid / Insufficient Evidence',
}

/** Compatibility export for components that render only letter-grade badges. */
export const LETTER_LABEL: Record<EvidenceLetter, string> = {
  A: CANONICAL_GRADE_LABEL.A,
  B: CANONICAL_GRADE_LABEL.B,
  C: CANONICAL_GRADE_LABEL.C,
  D: CANONICAL_GRADE_LABEL.D,
}

const GRADE_FOR_BAND: Record<EvidenceBand, CanonicalEvidenceGrade> = {
  strong: 'A',
  moderate: 'B',
  limited: 'C',
  preliminary: 'D',
  insufficient: 'Avoid/Insufficient',
}

const BAND_FOR_GRADE: Record<CanonicalEvidenceGrade, EvidenceBand> = {
  A: 'strong',
  B: 'moderate',
  C: 'limited',
  D: 'preliminary',
  'Avoid/Insufficient': 'insufficient',
}

/** A bare legacy letter grade, optionally with a +/- modifier. */
const BARE_LETTER_RE = /^([a-d])\s*[+-]?$/i
const LEGACY_FAIL_RE = /^f\s*[+-]?$/i

/**
 * Values that grade different outcomes differently. Picking one grade from
 * these would misrepresent the record, so they remain explicitly unassigned.
 */
const OUTCOME_DEPENDENT_RE = /\b[a-df]\s*[+-]?\s+for\s+\w+.*;\s*[a-df]\s*[+-]?\s+for\s+/i

/**
 * Legacy phrase mappings, ordered from strongest/specific to weakest. Ambiguous
 * language resolves conservatively; explicit insufficiency/avoidance is never
 * collapsed into D because the canonical model reserves its own state for it.
 */
const PHRASE_BANDS: [RegExp, EvidenceBand][] = [
  [/\b(moderate[- ]to[- ]strong|strong|robust|high[- ]quality|well[- ]established)\b/i, 'strong'],
  [/\b(limited[- ]to[- ]moderate|moderate)\b/i, 'moderate'],
  [/\b(mixed|inconsistent|limited|low[- ]moderate|emerging)\b/i, 'limited'],
  [/\b(preliminary|pilot|early|weak|mechanistic|theoretical|preclinical|no human|low)\b/i, 'preliminary'],
  [/\b(insufficient|no evidence|none|avoid|blocked|contraindicated)\b/i, 'insufficient'],
]

const EMPTY: NormalizedEvidenceGrade = {
  grade: null,
  letter: null,
  band: null,
  label: 'Evidence grade not assigned',
  raw: '',
  canonical: false,
  outcomeDependent: false,
}

export function isCanonicalEvidenceGrade(value: unknown): value is CanonicalEvidenceGrade {
  return CANONICAL_EVIDENCE_GRADES.includes(value as CanonicalEvidenceGrade)
}

export function bandFromCanonicalGrade(grade: CanonicalEvidenceGrade): EvidenceBand {
  return BAND_FOR_GRADE[grade]
}

function bandFromPhrase(value: string): EvidenceBand | null {
  for (const [pattern, band] of PHRASE_BANDS) {
    if (pattern.test(value)) return band
  }
  return null
}

function normalizedFromGrade(
  grade: CanonicalEvidenceGrade,
  raw: string,
  canonical: boolean,
  sourceLabel?: string,
): NormalizedEvidenceGrade {
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

/**
 * Normalize any raw evidence-grade value to the canonical enum.
 *
 * Legacy values are accepted only at this boundary so migration and rendering
 * can share one deterministic interpretation. Unrecognized values return null.
 */
export function normalizeEvidenceGrade(raw: unknown): NormalizedEvidenceGrade {
  const value = String(raw ?? '').trim()
  if (!value) return EMPTY

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
    const grade = bare[1].toUpperCase() as EvidenceLetter
    return normalizedFromGrade(grade, value, false)
  }

  // F was a legacy pseudo-grade. Preserve the meaning while removing F from
  // the canonical model entirely.
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

/**
 * Map a legacy evidence-tier phrase onto the canonical grade contract. This is
 * an adapter for older records; new persisted grade fields should already be
 * canonical rather than storing these presentation labels.
 */
export function canonicalGradeFromEvidenceTier(tier: unknown): CanonicalEvidenceGrade | null {
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

export function bandFromEvidenceTier(tier: unknown): EvidenceBand | null {
  const grade = canonicalGradeFromEvidenceTier(tier)
  return grade ? BAND_FOR_GRADE[grade] : null
}

const BAND_ORDER: EvidenceBand[] = ['insufficient', 'preliminary', 'limited', 'moderate', 'strong']

/** How far apart two evidence signals sit, in semantic bands. */
export function gradeTierDistance(gradeBand: EvidenceBand | null, tierBand: EvidenceBand | null): number | null {
  if (!gradeBand || !tierBand) return null
  return Math.abs(BAND_ORDER.indexOf(gradeBand) - BAND_ORDER.indexOf(tierBand))
}

export { BAND_LABEL, BAND_ORDER }
