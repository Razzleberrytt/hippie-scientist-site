/**
 * Derive the "why this grade?" rationale for a profile from its claims.
 *
 * `evidence_design_match`, `evidence_risk_of_bias`, and `evidence_consistency`
 * are read by `EvidenceGradeRationale`, but the workbook never filled them:
 * all three are empty on all 856 records, so the component renders on no page
 * at all. The information needed to compute them already exists in
 * `claims.json`, where each claim records the design of the study behind it.
 *
 * Every field here is computed from recorded study designs only. Where the
 * claims cannot support a judgement the value is `null` and the caller renders
 * "Not assessed" — an absent signal must never read as a clean bill of health.
 */

import {
  STUDY_CLASS_INFO,
  isHumanStudyClass,
  normalizeStudyClass,
  strongestStudyClass,
  type StudyClass,
} from './study-class'

export type RiskOfBias = 'Low' | 'Medium' | 'High'
export type EvidenceConsistency = 'Consistent' | 'Mixed'

export type EvidenceRationale = {
  /** Strongest study design backing the profile, as a reader-facing label. */
  designMatch: string | null
  riskOfBias: RiskOfBias | null
  consistency: EvidenceConsistency | null
  /** Claims backed by a design that measured an outcome in people. */
  humanStudyCount: number
  /** Claims carrying any recorded design at all. */
  classifiedStudyCount: number
  totalClaimCount: number
  strongestClass: StudyClass
  classCounts: Partial<Record<StudyClass, number>>
  /** One sentence explaining the rationale, safe to render directly. */
  summary: string
}

/** A recorded design that also reports the finding went against the claim. */
const NEGATIVE_MARKER = /\bnegative\b|\bnull\b/i
/** A recorded design that reports the underlying studies disagreed. */
const MIXED_MARKER = /\bmixed\b|\binconsistent\b|\bconflict/i
/** A recorded design that explicitly flags its own bias problem. */
const HIGH_BIAS_MARKER = /high[_\s-]?bias|\bpoor quality\b/i

/**
 * Consistency needs a real body of work behind it. Below this many human
 * studies, "no disagreement recorded" only means there was little to disagree.
 */
const MIN_STUDIES_FOR_CONSISTENCY = 3

export type RationaleClaimInput = {
  /** Canonical class, when the pipeline has already assigned one. */
  study_class?: unknown
  /** Raw recorded design, used both as fallback and for finding markers. */
  study_class_source?: unknown
  evidence_tier?: unknown
}

function sourceText(claim: RationaleClaimInput): string {
  return String(claim.study_class_source ?? claim.evidence_tier ?? '')
}

/**
 * Designs are recorded both as prose and as snake_case keys. `_` is a word
 * character, so `\bnegative\b` cannot match `negative_randomized_trial` until
 * separators are unified.
 */
function markerText(claim: RationaleClaimInput): string {
  return sourceText(claim).replace(/[_/+]+/g, ' ')
}

function classOf(claim: RationaleClaimInput): StudyClass {
  const assigned = claim.study_class
  if (typeof assigned === 'string' && assigned in STUDY_CLASS_INFO) return assigned as StudyClass
  return normalizeStudyClass(sourceText(claim))
}

function riskOfBiasFor(strongest: StudyClass, flaggedHighBias: boolean): RiskOfBias | null {
  if (flaggedHighBias) return 'High'
  switch (strongest) {
    case 'meta-analysis':
    case 'systematic-review':
    case 'rct':
      return 'Low'
    case 'controlled-trial':
    case 'uncontrolled-trial':
    case 'observational':
      return 'Medium'
    case 'case-report':
    case 'narrative-review':
    case 'regulatory-guidance':
    case 'animal':
    case 'in-vitro':
      return 'High'
    case 'unclassified':
      // No recorded design is not the same as a badly designed study.
      return null
  }
}

/**
 * Build the rationale for one profile from every claim attached to it.
 *
 * Only 142 of 445 indexable profiles currently carry any claim, so an empty
 * list is the expected case rather than an error; it yields an all-null
 * rationale that the caller can render as "not assessed".
 */
export function buildEvidenceRationale(claims: readonly RationaleClaimInput[]): EvidenceRationale {
  const classes = claims.map(classOf)
  const classCounts: Partial<Record<StudyClass, number>> = {}
  for (const studyClass of classes) {
    classCounts[studyClass] = (classCounts[studyClass] ?? 0) + 1
  }

  const classified = classes.filter((studyClass) => studyClass !== 'unclassified')
  const humanStudyCount = classes.filter(isHumanStudyClass).length
  const strongestClass = strongestStudyClass(classes)

  const texts = claims.map(markerText)
  const flaggedHighBias = texts.some((text) => HIGH_BIAS_MARKER.test(text))
  const negativeCount = texts.filter((text) => NEGATIVE_MARKER.test(text)).length
  const mixedCount = texts.filter((text) => MIXED_MARKER.test(text)).length

  const designMatch = strongestClass === 'unclassified' ? null : STUDY_CLASS_INFO[strongestClass].label
  const riskOfBias = riskOfBiasFor(strongestClass, flaggedHighBias)

  let consistency: EvidenceConsistency | null = null
  if (mixedCount > 0 || (negativeCount > 0 && negativeCount < classified.length)) {
    consistency = 'Mixed'
  } else if (humanStudyCount >= MIN_STUDIES_FOR_CONSISTENCY && negativeCount === 0) {
    consistency = 'Consistent'
  }

  return {
    designMatch,
    riskOfBias,
    consistency,
    humanStudyCount,
    classifiedStudyCount: classified.length,
    totalClaimCount: claims.length,
    strongestClass,
    classCounts,
    summary: summarize({ designMatch, humanStudyCount, classified: classified.length, consistency }),
  }
}

function summarize({
  designMatch,
  humanStudyCount,
  classified,
  consistency,
}: {
  designMatch: string | null
  humanStudyCount: number
  classified: number
  consistency: EvidenceConsistency | null
}): string {
  if (!designMatch) return 'No study design has been recorded for this profile yet.'

  const studies = `${classified} recorded ${classified === 1 ? 'study' : 'studies'}`
  const human =
    humanStudyCount === 0
      ? 'none of which measured an outcome in people'
      : `${humanStudyCount} in people`
  const agreement = consistency === 'Mixed'
    ? ' Findings across those studies disagree.'
    : consistency === 'Consistent'
      ? ' No disagreement is recorded across them.'
      : ''

  return `Strongest recorded design is a ${designMatch.toLowerCase()}, drawn from ${studies}, ${human}.${agreement}`
}

/**
 * Whether the recorded designs can support a grade at this strength.
 *
 * A profile graded A or B tells readers that people were studied. If no claim
 * on the record carries a human design, that grade is not backed by anything
 * in our own dataset — reported rather than silently corrected, because the
 * missing piece may be an unrecorded citation rather than a wrong grade.
 */
export function gradeIsBackedByEvidence(
  grade: string | null | undefined,
  rationale: EvidenceRationale,
): { backed: boolean; reason: string | null } {
  if (grade !== 'A' && grade !== 'B') return { backed: true, reason: null }

  if (rationale.totalClaimCount === 0) {
    return { backed: false, reason: 'no-claims-recorded' }
  }
  if (rationale.humanStudyCount === 0) {
    return { backed: false, reason: 'no-human-study-recorded' }
  }
  if (grade === 'A' && rationale.humanStudyCount < 2) {
    return { backed: false, reason: 'single-human-study-for-grade-a' }
  }
  return { backed: true, reason: null }
}
