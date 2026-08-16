import { analyzeResearchQuality, type ResearchQualityAnalysis } from './research-quality-analysis'
import { buildResearchQualityGate, type ResearchQualityGate } from './research-quality-gate'
import { buildResearchGapQueue } from './research-quality-policy'
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
  researchGapQueue: ReturnType<typeof buildResearchGapQueue>
  sourceIntegrity: ReturnType<typeof analyzeResearchSourceIntegrity>
  invariants: ResearchSnapshotInvariantReport
}

/**
 * Canonical execution boundary for research-quality consumers.
 *
 * Specialized reporters may format different views, but they should consume
 * this snapshot instead of independently rebuilding analysis/topology/gate/policy
 * state. The hard gate and softer remediation queue remain separate by design.
 * Snapshot invariants detect implementation contradictions between those views.
 */
export function buildResearchQualitySnapshot(root = process.cwd()): ResearchQualitySnapshot {
  const analysis = analyzeResearchQuality(root)
  const topology = buildResearchQualityTopology(analysis)
  const gate = buildResearchQualityGate(analysis, topology)
  const researchGapQueue = buildResearchGapQueue(analysis, topology)

  return {
    analysis,
    topology,
    gate,
    researchGapQueue,
    sourceIntegrity: analyzeResearchSourceIntegrity(analysis),
    invariants: validateResearchQualitySnapshotInvariants(analysis, topology, gate, researchGapQueue),
  }
}
