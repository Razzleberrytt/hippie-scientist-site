import { analyzeCitationIntegrity } from './citation-integrity.mjs'
import { analyzeEvidenceGradeConsistency } from './evidence-grade-consistency'
import { analyzeResearchQuality, type ResearchQualityAnalysis } from './research-quality-analysis'
import { buildResearchQualityGate, type ResearchQualityGate } from './research-quality-gate'
import { buildCanonicalResearchGapQueue } from './research-quality-remediation'
import {
  validateResearchQualitySnapshotInvariants,
  type ResearchSnapshotInvariantReport,
} from './research-quality-snapshot-invariants'
import { buildResearchQualityTopology, type ResearchQualityTopology } from './research-quality-topology'
import { analyzeResearchSourceIntegrity } from './research-source-integrity'

export type ResearchQualitySnapshot = {
  analysis: ResearchQualityAnalysis
  topology: ResearchQualityTopology
  gate: ResearchQualityGate
  researchGapQueue: ReturnType<typeof buildCanonicalResearchGapQueue>
  sourceIntegrity: ReturnType<typeof analyzeResearchSourceIntegrity>
  citationIntegrity: ReturnType<typeof analyzeCitationIntegrity>
  evidenceGradeConsistency: ReturnType<typeof analyzeEvidenceGradeConsistency>
  invariants: ResearchSnapshotInvariantReport
}

/**
 * Canonical execution boundary for research-quality consumers.
 *
 * Specialized reporters may format different views, but they should consume
 * this snapshot instead of independently rebuilding analysis/topology/gate/policy,
 * citation/source-integrity, evidence-grade consistency, or remediation state.
 * The hard gate and remediation queue remain distinct views, but every hard
 * blocker must have an explicit remediation target. Snapshot invariants are
 * implementation contracts: contradictory derived views invalidate the snapshot
 * itself and therefore fail every canonical consumer.
 */
export function buildResearchQualitySnapshot(root = process.cwd()): ResearchQualitySnapshot {
  const analysis = analyzeResearchQuality(root)
  const topology = buildResearchQualityTopology(analysis)
  const evidenceGradeConsistency = analyzeEvidenceGradeConsistency(root, topology)
  const gate = buildResearchQualityGate(analysis, topology, evidenceGradeConsistency)
  const researchGapQueue = buildCanonicalResearchGapQueue(analysis, topology, evidenceGradeConsistency)
  const sourceIntegrity = analyzeResearchSourceIntegrity(analysis)
  const citationIntegrity = analyzeCitationIntegrity(analysis.profiles)
  const invariants = validateResearchQualitySnapshotInvariants(
    analysis,
    topology,
    gate,
    researchGapQueue,
    sourceIntegrity,
    citationIntegrity,
  )

  if (!invariants.passed) {
    const details = invariants.failures.slice(0, 10).map((failure) => `${failure.kind}: ${failure.detail}`).join('; ')
    throw new Error(
      `[research-quality-snapshot] ${invariants.summary.failures} internal invariant failure(s): ${details}`,
    )
  }

  return {
    analysis,
    topology,
    gate,
    researchGapQueue,
    sourceIntegrity,
    citationIntegrity,
    evidenceGradeConsistency,
    invariants,
  }
}
