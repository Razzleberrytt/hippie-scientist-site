import type { ResearchQualityAnalysis } from './research-quality-analysis'
import { structuralCoverageFailures, type StructuralCoverageFailure } from './research-quality-policy'
import { buildResearchQualityTopology, type ResearchQualityTopology } from './research-quality-topology'
import type { StudyClassConflict } from './research-study-class-conflicts'

export type ResearchQualityGate = {
  passed: boolean
  structuralFailures: StructuralCoverageFailure[]
  severeStudyClassConflicts: StudyClassConflict[]
  summary: {
    structuralFailures: number
    unsupportedApprovedClaims: number
    danglingClaimSourceEdges: number
    severeStudyClassConflicts: number
    blockingFailures: number
  }
}

/**
 * Canonical hard-gate decision for research coverage. Structural evidence-edge
 * failures and severe cross-family canonical study-class conflicts are the only
 * blockers owned here; softer research-quality signals remain remediation
 * priorities in the gap policy rather than becoming accidental build failures.
 */
export function buildResearchQualityGate(
  analysis: ResearchQualityAnalysis,
  topology: ResearchQualityTopology = buildResearchQualityTopology(analysis),
): ResearchQualityGate {
  const structuralFailures = structuralCoverageFailures(analysis)
  const severeStudyClassConflicts = topology.studyClassConflicts.severeConflicts
  const unsupportedApprovedClaims = structuralFailures.filter(
    (failure) => failure.kind === 'unsupported-approved-claim',
  ).length
  const danglingClaimSourceEdges = structuralFailures.filter(
    (failure) => failure.kind === 'dangling-claim-source-edge',
  ).length
  const blockingFailures = structuralFailures.length + severeStudyClassConflicts.length

  return {
    passed: blockingFailures === 0,
    structuralFailures,
    severeStudyClassConflicts,
    summary: {
      structuralFailures: structuralFailures.length,
      unsupportedApprovedClaims,
      danglingClaimSourceEdges,
      severeStudyClassConflicts: severeStudyClassConflicts.length,
      blockingFailures,
    },
  }
}
