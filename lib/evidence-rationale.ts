/**
 * Derive the "why this grade?" rationale for a profile from its claims.
 *
 * `evidence_design_match`, `evidence_risk_of_bias`, and `evidence_consistency`
 * are read by `EvidenceGradeRationale`, but the workbook never filled them:
 * all three are empty on all 856 records, so the component renders on no page
 * at all. The information needed to compute them already exists in
 * `claims.json`, where each claim records the design of the study behind it.
 *
 * Every field here is computed from recorded publication designs only. Where the
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
  /** Human-design records with distinct stable PMID/DOI source identities. */
  identifiedHumanStudyCount: number
  /** Claims carrying any recorded design at all. */
  classifiedStudyCount: number
  totalClaimCount: number
  strongestClass: StudyClass
  classCounts: Partial<Record<StudyClass, number>>
  /** One sentence explaining the rationale, safe to render directly. */
  summary: string
}

/** A recorded design that also reports the finding went against the claim. */
/** A recorded design that reports the underlying studies disagreed. */
const MIXED_MARKER = /\bmixed\b|\binconsistent\b|\bconflict/i
/** A recorded design that explicitly flags its own bias problem. */
const HIGH_BIAS_MARKER = /high[_\s-]?bias|\bpoor quality\b/i

// A consistency assessment needs outcome-specific directional evidence, not merely a number of studies.

export type RationaleClaimInput = {
  /** Canonical class, when the pipeline has already assigned one. */
  study_class?: unknown
  /** Raw recorded design, used both as fallback and for finding markers. */
  study_class_source?: unknown
  evidence_tier?: unknown
  pmid?: unknown
  pubmedId?: unknown
  doi?: unknown
  url?: unknown
  source_url?: unknown
}

/** Publication identity is evidence of one record, never trial independence. */
function publicationIdentity(claim: RationaleClaimInput): string | null {
  for (const value of [claim.pmid, claim.pubmedId]) {
    const id = String(value ?? '').trim()
    if (/^\d{5,10}$/.test(id)) return `pmid:${id}`
  }
  for (const value of [claim.url, claim.source_url]) {
    const text = String(value ?? '')
    const match = text.match(/(?:pubmed\.ncbi\.nlm\.nih\.gov\/|ncbi\.nlm\.nih\.gov\/pubmed\/)(\d{5,10})(?:\b|\/)/i)
    if (match) return `pmid:${match[1]}`
  }
  const doi = String(claim.doi ?? '').trim().replace(/^https?:\/\/(?:dx\.)?doi\.org\//i, '').toLowerCase()
  return /^10\.\d{4,9}\/\S+$/.test(doi) ? `doi:${doi}` : null
}

function uniqueRecordedPublications(claims: readonly RationaleClaimInput[]): {
  records: RationaleClaimInput[]
  identifiedHumanStudyCount: number
} {
  const withIdentity = new Map<string, RationaleClaimInput>()
  const unknownIdentity: RationaleClaimInput[] = []
  for (const claim of claims) {
    const id = publicationIdentity(claim)
    if (!id) {
      // Unresolved source identity cannot satisfy the Grade A independence floor.
      unknownIdentity.push(claim)
      continue
    }
    const previous = withIdentity.get(id)
    if (!previous) {
      withIdentity.set(id, claim)
      continue
    }
    // A publication appearing in claims and profile sources is still ONE item.
    // Preserve the strongest recorded design and all negative/bias markers.
    const strongest = strongestStudyClass([classOf(previous), classOf(claim)])
    withIdentity.set(id, {
      ...previous,
      study_class: strongest,
      study_class_source: `${sourceText(previous)}; ${sourceText(claim)}`,
    })
  }
  return {
    records: [...withIdentity.values(), ...unknownIdentity],
    identifiedHumanStudyCount: [...withIdentity.values()].filter((claim) => isHumanStudyClass(classOf(claim))).length,
  }
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

/**
 * Build the rationale for one profile from every claim attached to it.
 *
 * Only 142 of 445 indexable profiles currently carry any claim, so an empty
 * list is the expected case rather than an error; it yields an all-null
 * rationale that the caller can render as "not assessed".
 */
export function buildEvidenceRationale(claims: readonly RationaleClaimInput[], directions: readonly RationaleClaimInput[] = []): EvidenceRationale {
  const unique = uniqueRecordedPublications(claims)
  const records = unique.records
  const classes = records.map(classOf)
  const classCounts: Partial<Record<StudyClass, number>> = {}
  for (const studyClass of classes) {
    classCounts[studyClass] = (classCounts[studyClass] ?? 0) + 1
  }

  const classified = classes.filter((studyClass) => studyClass !== 'unclassified')
  const humanStudyCount = classes.filter(isHumanStudyClass).length
  const strongestClass = strongestStudyClass(classes)

  // Publication identities are deduplicated for counts; directional authored markers are not separate publications.
  const texts = [...records, ...directions].map(markerText)
  const flaggedHighBias = texts.some((text) => HIGH_BIAS_MARKER.test(text))
  // A negative/null result is not itself evidence that publications disagree.
  // Only an explicit mixed/inconsistent/conflicting marker supports this label.
  const mixedCount = texts.filter((text) => MIXED_MARKER.test(text)).length

  const designMatch = strongestClass === 'unclassified' ? null : STUDY_CLASS_INFO[strongestClass].label
  // A design label alone cannot establish the assessed risk of bias.
  const riskOfBias: RiskOfBias | null = flaggedHighBias ? 'High' : null

  let consistency: EvidenceConsistency | null = null
  if (mixedCount > 0) consistency = 'Mixed'
  // Absence of recorded disagreement does not prove that study results agree.

  return {
    designMatch,
    riskOfBias,
    consistency,
    humanStudyCount,
    identifiedHumanStudyCount: unique.identifiedHumanStudyCount,
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

  const studies = `${classified} design-classified ${classified === 1 ? 'publication' : 'publications'}`
  const human =
    humanStudyCount === 0
      ? 'none classified as human evidence'
      : `${humanStudyCount} classified as human evidence`
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
  editorialSummary = '',
): { backed: boolean; reason: string | null } {
  if (grade !== 'A' && grade !== 'B') return { backed: true, reason: null }
  // A settled grade must not contradict a plainly limited or mixed authored summary.
  if (/limited\/modest evidence|evidence (?:is |remains )?(?:mixed|limited|modest|preliminary)|no two [^.]*same significant/i.test(editorialSummary)) {
    return { backed: false, reason: 'conflicting-editorial-evidence-signals' }
  }

  if (rationale.totalClaimCount === 0) {
    return { backed: false, reason: 'no-claims-recorded' }
  }
  if (rationale.humanStudyCount === 0) {
    return { backed: false, reason: 'no-human-study-recorded' }
  }
  if (grade === 'A' && rationale.identifiedHumanStudyCount < 2) {
    return {
      backed: false,
      reason: rationale.identifiedHumanStudyCount === 0
        ? 'no-identifiable-human-publications-for-grade-a'
        : 'single-human-study-for-grade-a',
    }
  }
  if (grade === 'A' && (!rationale.riskOfBias || !rationale.consistency)) {
    return { backed: false, reason: 'grade-a-certainty-not-assessed' }
  }
  return { backed: true, reason: null }
}
