import type { ResearchQualityTopology } from './research-quality-topology'

export type OutcomeRegistrationSnapshotInvariantFailure = {
  kind: string
  detail: string
}

function studyKey(url: string, studyId: string): string {
  return `${url}::${studyId}`
}

/**
 * Cross-check the topology-owned registered-vs-reported outcome alignment against
 * its canonical outcome-metadata input. These are snapshot consistency checks;
 * they do not recompute scientific classifications.
 */
export function validateOutcomeRegistrationSnapshotInvariants(
  topology: ResearchQualityTopology,
): OutcomeRegistrationSnapshotInvariantFailure[] {
  const failures: OutcomeRegistrationSnapshotInvariantFailure[] = []
  const add = (kind: string, detail: string) => failures.push({ kind, detail })
  const alignment = topology.outcomeRegistrationAlignment
  const metadata = topology.outcomeMetadata

  if (alignment.summary.canonicalStudies !== alignment.studies.length) {
    add('outcome-alignment-study-count-mismatch', `summary=${alignment.summary.canonicalStudies}; rows=${alignment.studies.length}`)
  }
  if (alignment.summary.canonicalStudies !== metadata.studies.length) {
    add('outcome-alignment-metadata-count-mismatch', `alignment=${alignment.summary.canonicalStudies}; metadata=${metadata.studies.length}`)
  }
  if (alignment.summary.assessableStudies !== alignment.assessableStudies.length) {
    add('outcome-alignment-assessable-count-mismatch', `summary=${alignment.summary.assessableStudies}; rows=${alignment.assessableStudies.length}`)
  }
  if (alignment.summary.findings !== alignment.findings.length) {
    add('outcome-alignment-finding-count-mismatch', `summary=${alignment.summary.findings}; rows=${alignment.findings.length}`)
  }

  const matchedStudies = alignment.studies.filter((study) => study.status === 'matched').length
  const partialMismatchStudies = alignment.studies.filter((study) => study.status === 'partial-mismatch').length
  const mismatchStudies = alignment.studies.filter((study) => study.status === 'mismatch').length
  const explicitOutcomeSwitches = alignment.studies.filter((study) => study.explicitOutcomeSwitch).length
  const explicitRegisteredOutcomeNonReporting = alignment.studies.filter(
    (study) => study.explicitRegisteredOutcomeNotReported,
  ).length

  if (alignment.summary.matchedStudies !== matchedStudies) {
    add('outcome-alignment-matched-count-mismatch', `summary=${alignment.summary.matchedStudies}; computed=${matchedStudies}`)
  }
  if (alignment.summary.partialMismatchStudies !== partialMismatchStudies) {
    add('outcome-alignment-partial-count-mismatch', `summary=${alignment.summary.partialMismatchStudies}; computed=${partialMismatchStudies}`)
  }
  if (alignment.summary.mismatchStudies !== mismatchStudies) {
    add('outcome-alignment-mismatch-count-mismatch', `summary=${alignment.summary.mismatchStudies}; computed=${mismatchStudies}`)
  }
  if (alignment.summary.explicitOutcomeSwitches !== explicitOutcomeSwitches) {
    add('outcome-alignment-switch-count-mismatch', `summary=${alignment.summary.explicitOutcomeSwitches}; computed=${explicitOutcomeSwitches}`)
  }
  if (alignment.summary.explicitRegisteredOutcomeNonReporting !== explicitRegisteredOutcomeNonReporting) {
    add(
      'outcome-alignment-nonreporting-count-mismatch',
      `summary=${alignment.summary.explicitRegisteredOutcomeNonReporting}; computed=${explicitRegisteredOutcomeNonReporting}`,
    )
  }

  const metadataKeys = new Set(metadata.studies.map((study) => studyKey(study.url, study.studyId)))
  const alignmentKeys = new Set<string>()
  for (const study of alignment.studies) {
    const key = studyKey(study.url, study.studyId)
    if (alignmentKeys.has(key)) add('outcome-alignment-duplicate-study', key)
    alignmentKeys.add(key)
    if (!metadataKeys.has(key)) add('outcome-alignment-unknown-study', key)
  }
  for (const key of metadataKeys) {
    if (!alignmentKeys.has(key)) add('outcome-alignment-missing-study', key)
  }

  const assessableKeys = new Set(alignment.assessableStudies.map((study) => studyKey(study.url, study.studyId)))
  for (const study of alignment.assessableStudies) {
    const key = studyKey(study.url, study.studyId)
    if (!alignmentKeys.has(key)) add('outcome-alignment-assessable-not-study', key)
    if (study.status === 'unassessable') add('outcome-alignment-unassessable-in-assessable', key)
  }
  for (const study of alignment.studies) {
    const key = studyKey(study.url, study.studyId)
    const shouldBeAssessable = study.status !== 'unassessable'
    if (shouldBeAssessable !== assessableKeys.has(key)) {
      add('outcome-alignment-assessable-subset-mismatch', `${key}: status=${study.status}`)
    }
  }

  const findingKeys = new Set(alignment.findings.map((study) => studyKey(study.url, study.studyId)))
  for (const finding of alignment.findings) {
    const key = studyKey(finding.url, finding.studyId)
    if (!alignmentKeys.has(key)) add('outcome-alignment-finding-not-study', key)
    if (!finding.outcomeHierarchyConcern) add('outcome-alignment-nonconcern-finding', key)
  }
  for (const study of alignment.studies) {
    const key = studyKey(study.url, study.studyId)
    if (study.outcomeHierarchyConcern !== findingKeys.has(key)) {
      add('outcome-alignment-finding-subset-mismatch', `${key}: concern=${study.outcomeHierarchyConcern}`)
    }
  }

  return failures
}
