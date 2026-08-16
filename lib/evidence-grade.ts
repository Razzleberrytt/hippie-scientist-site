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
  /**
   * True when the source explicitly declares that no grade applies (stacks,
   * blends). This is a different claim from "insufficient evidence" and must
   * never render as a letter grade.
   */
  notApplicable: boolean
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
/** Grade explicitly withheld — stacks and proprietary blends are not one entity. */
const NOT_APPLICABLE_RE = /^n\/?a$|^not[_ -]applicable/i

/**
 * Bare strength words used as whole grade values. These are matched on the
 * exact value rather than added to PHRASE_BANDS because the same words appear
 * inside longer phrases that mean something else — "high safety caution"
 * describes risk, not evidence strength.
 */
const EXACT_BAND_VALUES: Record<string, EvidenceBand> = {
  high: 'strong',
  medium: 'moderate',
  low: 'preliminary',
}

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
  notApplicable: false,
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
    notApplicable: false,
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
      notApplicable: false,
    }
  }

  if (NOT_APPLICABLE_RE.test(value)) {
    return { ...EMPTY, raw: value, label: 'Evidence grade not applicable', notApplicable: true }
  }

  if (isCanonicalEvidenceGrade(value)) {
    return normalizedFromGrade(value, value, true)
  }

  if (/^avoid\s*\/\s*insufficient$/i.test(value)) {
    return normalizedFromGrade('Avoid/Insufficient', value, true)
  }

  const bare = BARE_LETTER_RE.exec(value)
  if (bare) {
    const grade = bare[1].toUpperCase() as EvidenceLetter
    // A bare letter IS the canonical grade — only its casing differs. Treating
    // `c` as non-canonical would report 463 records as migration work that a
    // case fold already resolves.
    const canonical = /^[a-d]$/i.test(value)
    return normalizedFromGrade(grade, value, canonical)
  }

  const exactBand = EXACT_BAND_VALUES[value.toLowerCase()]
  if (exactBand) {
    return normalizedFromGrade(GRADE_FOR_BAND[exactBand], value, false, value)
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
  // "Early Human Evidence" is still human evidence. Without this floor it fell
  // through to the preclinical bucket below and rendered at the same strength
  // as mechanism-only records, understating every early-stage human trial.
  if (/\bhumans?\b|\bclinical\b/.test(value)) return 'C'
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

export type EvidenceReconciliation = {
  /** Grade safe to publish after reconciling both authored signals. */
  grade: CanonicalEvidenceGrade | null
  band: EvidenceBand | null
  /** Band implied by the authored `evidence_grade` column. */
  gradeBand: EvidenceBand | null
  /** Band implied by the authored `evidence_tier` column. */
  tierBand: EvidenceBand | null
  distance: number | null
  /** True when the published grade is weaker than the authored grade. */
  adjusted: boolean
  /** Machine-readable reason, suitable for an audit trail. */
  reason:
    | 'agree'
    | 'grade-only'
    | 'tier-only'
    | 'minor-disagreement'
    | 'capped-by-weaker-tier'
    | 'contradiction-resolved-conservatively'
    | 'not-applicable'
    | 'unresolved'
  /** Reader-facing explanation of why this grade was published. */
  explanation: string
}

function weakerBand(a: EvidenceBand, b: EvidenceBand): EvidenceBand {
  return BAND_ORDER.indexOf(a) <= BAND_ORDER.indexOf(b) ? a : b
}

/**
 * Reconcile the two independently authored evidence signals into the one grade
 * a page may publish.
 *
 * `evidence_grade` and `evidence_tier` are separate workbook columns filled in
 * by hand, so they disagree on real records — 98 indexable profiles carry a
 * two-band-or-worse conflict, including `calcium` graded "strong" against a
 * tier of "Mechanistic Evidence". Publishing the stronger of two conflicting
 * signals would state a level of confidence the record cannot support, so
 * every rule here resolves downward and records why.
 */
export function reconcileEvidenceGrade(rawGrade: unknown, rawTier: unknown): EvidenceReconciliation {
  const normalized = normalizeEvidenceGrade(rawGrade)
  const tierBand = bandFromEvidenceTier(rawTier)
  const gradeBand = normalized.band
  const distance = gradeTierDistance(gradeBand, tierBand)

  const settle = (
    band: EvidenceBand | null,
    reason: EvidenceReconciliation['reason'],
    explanation: string,
  ): EvidenceReconciliation => ({
    grade: band ? GRADE_FOR_BAND[band] : null,
    band,
    gradeBand,
    tierBand,
    distance,
    adjusted: Boolean(band && gradeBand && band !== gradeBand),
    reason,
    explanation,
  })

  if (normalized.notApplicable) {
    return settle(null, 'not-applicable', 'This record is a stack or blend, so a single evidence grade does not apply.')
  }

  if (normalized.outcomeDependent) {
    return settle(null, 'unresolved', 'Evidence differs by outcome, so no single grade is published.')
  }

  if (!gradeBand && !tierBand) {
    return settle(null, 'unresolved', 'No evidence grade has been assigned to this record.')
  }

  if (!gradeBand && tierBand) {
    return settle(tierBand, 'tier-only', `Graded from the evidence tier (${BAND_LABEL[tierBand]}); no separate grade was recorded.`)
  }

  if (gradeBand && !tierBand) {
    return settle(gradeBand, 'grade-only', `Graded from the recorded evidence grade (${BAND_LABEL[gradeBand]}).`)
  }

  const resolvedGradeBand = gradeBand as EvidenceBand
  const resolvedTierBand = tierBand as EvidenceBand

  if (distance === 0) {
    return settle(resolvedGradeBand, 'agree', `Both evidence signals agree on ${BAND_LABEL[resolvedGradeBand].toLowerCase()}.`)
  }

  const weaker = weakerBand(resolvedGradeBand, resolvedTierBand)

  if ((distance ?? 0) >= 2) {
    return settle(
      weaker,
      'contradiction-resolved-conservatively',
      `The recorded grade (${BAND_LABEL[resolvedGradeBand].toLowerCase()}) and evidence tier (${BAND_LABEL[resolvedTierBand].toLowerCase()}) conflict, so the weaker signal is published pending review.`,
    )
  }

  // Grade A makes the strongest public claim on the site, so it additionally
  // requires the tier to agree. Every weaker grade tolerates a one-band
  // authoring disagreement without being pulled down.
  if (resolvedGradeBand === 'strong' && resolvedTierBand !== 'strong') {
    return settle(
      resolvedTierBand,
      'capped-by-weaker-tier',
      `Grade A requires strong human evidence; the evidence tier records ${BAND_LABEL[resolvedTierBand].toLowerCase()}, so the grade is capped.`,
    )
  }

  return settle(
    resolvedGradeBand,
    'minor-disagreement',
    `The evidence tier records ${BAND_LABEL[resolvedTierBand].toLowerCase()}, one band from the recorded grade.`,
  )
}

/** How far apart two evidence signals sit, in semantic bands. */
export function gradeTierDistance(gradeBand: EvidenceBand | null, tierBand: EvidenceBand | null): number | null {
  if (!gradeBand || !tierBand) return null
  return Math.abs(BAND_ORDER.indexOf(gradeBand) - BAND_ORDER.indexOf(tierBand))
}

export { BAND_LABEL, BAND_ORDER }
