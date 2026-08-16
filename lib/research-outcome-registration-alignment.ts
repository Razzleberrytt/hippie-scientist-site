import type { OutcomeMetadataAnalysis, StudyOutcomeMetadata } from './research-outcome-metadata'

export type OutcomeRegistrationAlignmentStatus =
  | 'unassessable'
  | 'matched'
  | 'partial-mismatch'
  | 'mismatch'

export type StudyOutcomeRegistrationAlignment = {
  url: string
  studyId: string
  trialRegistrationIds: string[]
  status: OutcomeRegistrationAlignmentStatus
  registeredPrimaryOutcomes: string[]
  reportedPrimaryOutcomes: string[]
  matchedPrimaryOutcomes: string[]
  missingRegisteredPrimaryOutcomes: string[]
  unregisteredReportedPrimaryOutcomes: string[]
  explicitOutcomeSwitch: boolean
  explicitRegisteredOutcomeNotReported: boolean
  outcomeHierarchyConcern: boolean
}

export type OutcomeRegistrationAlignmentAnalysis = {
  studies: StudyOutcomeRegistrationAlignment[]
  assessableStudies: StudyOutcomeRegistrationAlignment[]
  findings: StudyOutcomeRegistrationAlignment[]
  summary: {
    canonicalStudies: number
    assessableStudies: number
    matchedStudies: number
    partialMismatchStudies: number
    mismatchStudies: number
    explicitOutcomeSwitches: number
    explicitRegisteredOutcomeNonReporting: number
    findings: number
  }
}

function normalizeOutcomeName(value: string): string {
  return value
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[‐‑‒–—]/g, '-')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function normalizedLookup(values: string[]): Map<string, string> {
  const lookup = new Map<string, string>()
  for (const value of values) {
    const normalized = normalizeOutcomeName(value)
    if (normalized && !lookup.has(normalized)) lookup.set(normalized, value)
  }
  return lookup
}

function alignmentForStudy(study: StudyOutcomeMetadata): StudyOutcomeRegistrationAlignment {
  const registered = normalizedLookup(study.registeredPrimaryOutcomes)
  const reported = normalizedLookup(study.reportedPrimaryOutcomes)
  const registeredKeys = [...registered.keys()]
  const reportedKeys = [...reported.keys()]

  let status: OutcomeRegistrationAlignmentStatus = 'unassessable'
  if (registeredKeys.length && reportedKeys.length) {
    const matchedKeys = registeredKeys.filter((key) => reported.has(key))
    const sameCardinality = registeredKeys.length === reportedKeys.length
    if (matchedKeys.length === registeredKeys.length && sameCardinality) status = 'matched'
    else if (matchedKeys.length > 0) status = 'partial-mismatch'
    else status = 'mismatch'
  }

  const matchedPrimaryOutcomes = registeredKeys
    .filter((key) => reported.has(key))
    .map((key) => registered.get(key)!)
  const missingRegisteredPrimaryOutcomes = registeredKeys
    .filter((key) => !reported.has(key))
    .map((key) => registered.get(key)!)
  const unregisteredReportedPrimaryOutcomes = reportedKeys
    .filter((key) => !registered.has(key))
    .map((key) => reported.get(key)!)
  const outcomeHierarchyConcern = status === 'partial-mismatch'
    || status === 'mismatch'
    || study.explicitOutcomeSwitch
    || study.explicitRegisteredOutcomeNotReported

  return {
    url: study.url,
    studyId: study.studyId,
    trialRegistrationIds: study.trialRegistrationIds,
    status,
    registeredPrimaryOutcomes: study.registeredPrimaryOutcomes,
    reportedPrimaryOutcomes: study.reportedPrimaryOutcomes,
    matchedPrimaryOutcomes,
    missingRegisteredPrimaryOutcomes,
    unregisteredReportedPrimaryOutcomes,
    explicitOutcomeSwitch: study.explicitOutcomeSwitch,
    explicitRegisteredOutcomeNotReported: study.explicitRegisteredOutcomeNotReported,
    outcomeHierarchyConcern,
  }
}

/**
 * Compare explicit structured registered/prespecified primary outcomes with
 * explicit structured reported primary outcomes at canonical-study level.
 * Missing metadata is deliberately unassessable rather than inferred as a
 * mismatch. Explicit switch/non-reporting flags remain independent evidence and
 * can surface a concern even when named outcomes are unavailable.
 */
export function analyzeOutcomeRegistrationAlignment(
  outcomeMetadata: OutcomeMetadataAnalysis,
): OutcomeRegistrationAlignmentAnalysis {
  const studies = outcomeMetadata.studies.map(alignmentForStudy)
  const assessableStudies = studies.filter((study) => study.status !== 'unassessable')
  const findings = studies.filter((study) => study.outcomeHierarchyConcern)

  return {
    studies,
    assessableStudies,
    findings,
    summary: {
      canonicalStudies: studies.length,
      assessableStudies: assessableStudies.length,
      matchedStudies: assessableStudies.filter((study) => study.status === 'matched').length,
      partialMismatchStudies: assessableStudies.filter((study) => study.status === 'partial-mismatch').length,
      mismatchStudies: assessableStudies.filter((study) => study.status === 'mismatch').length,
      explicitOutcomeSwitches: studies.filter((study) => study.explicitOutcomeSwitch).length,
      explicitRegisteredOutcomeNonReporting: studies.filter((study) => study.explicitRegisteredOutcomeNotReported).length,
      findings: findings.length,
    },
  }
}
