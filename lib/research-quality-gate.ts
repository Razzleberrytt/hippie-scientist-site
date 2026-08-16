import type { EvidenceGradeConsistencyReport, EvidenceGradeFinding } from './evidence-grade-consistency'
import type { ResearchQualityAnalysis } from './research-quality-analysis'
import { structuralCoverageFailures, type StructuralCoverageFailure } from './research-quality-policy'
import { buildResearchQualityTopology, type ResearchQualityTopology } from './research-quality-topology'
import type { StudyClassConflict } from './research-study-class-conflicts'

export type ResearchQualityGate = {
  passed: boolean
  structuralFailures: StructuralCoverageFailure[]
  severeStudyClassConflicts: StudyClassConflict[]
  evidenceGradeContradictions: EvidenceGradeFinding[]
  summary: {
    structuralFailures: number
    unsupportedApprovedClaims: number
    danglingClaimSourceEdges: number
    severeStudyClassConflicts: number
    evidenceGradeContradictions: number
    blockingFailures: number
  }
}

/**
 * Canonical hard-gate decision for research coverage. Structural evidence-edge
 * failures, severe cross-family canonical study-class conflicts, and published
 * Grade A contradictions positively proven by the canonical research topology
 * are blockers. Grade B independence warnings and other softer research-quality
 * signals remain remediation priorities rather than accidental build failures.
 *
 * `evidenceGradeConsistency` stays optional for lightweight/direct callers. The
 * canonical snapshot always supplies it and therefore owns production grade
 * enforcement without forcing low-level gate tests to reconstruct profile files.
 */
export function buildResearchQualityGate(
  analysis: ResearchQualityAnalysis,
  topology: ResearchQualityTopology = buildResearchQualityTopology(analysis),
  evidenceGradeConsistency?: EvidenceGradeConsistencyReport,
): ResearchQualityGate {
  const structuralFailures = structuralCoverageFailures(analysis)
  const severeStudyClassConflicts = topology.studyClassConflicts.severeConflicts
  const evidenceGradeContradictions = evidenceGradeConsistency?.topologyContradictions ?? []
  const unsupportedApprovedClaims = structuralFailures.filter(
    (failure) => failure.kind === 'unsupported-approved-claim',
  ).length
  const danglingClaimSourceEdges = structuralFailures.filter(
    (failure) => failure.kind === 'dangling-claim-source-edge',
  ).length
  const blockingFailures =
    structuralFailures.length
    + severeStudyClassConflicts.length
    + evidenceGradeContradictions.length

  return {
    passed: blockingFailures === 0,
    structuralFailures,
    severeStudyClassConflicts,
    evidenceGradeContradictions,
    summary: {
      structuralFailures: structuralFailures.length,
      unsupportedApprovedClaims,
      danglingClaimSourceEdges,
      severeStudyClassConflicts: severeStudyClassConflicts.length,
      evidenceGradeContradictions: evidenceGradeContradictions.length,
      blockingFailures,
    },
  }
}
