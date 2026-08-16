import { analyzeResearchQuality, type ResearchQualityAnalysis } from './research-quality-analysis'
import { buildResearchQualityGate, type ResearchQualityGate } from './research-quality-gate'
import { buildResearchGapQueue } from './research-quality-policy'
import { buildResearchQualityTopology, type ResearchQualityTopology } from './research-quality-topology'
import { analyzeResearchSourceIntegrity } from './research-source-integrity'

export type ResearchQualitySnapshot = {
  analysis: ResearchQualityAnalysis
  topology: ResearchQualityTopology
  gate: ResearchQualityGate
  researchGapQueue: ReturnType<typeof buildResearchGapQueue>
  sourceIntegrity: ReturnType<typeof analyzeResearchSourceIntegrity>
}

/**
 * Canonical execution boundary for research-quality consumers.
 *
 * Specialized reporters may format different views, but they should consume
 * this snapshot instead of independently rebuilding analysis/topology/gate/policy
 * state. The hard gate and softer remediation queue remain separate by design.
 */
export function buildResearchQualitySnapshot(root = process.cwd()): ResearchQualitySnapshot {
  const analysis = analyzeResearchQuality(root)
  const topology = buildResearchQualityTopology(analysis)
  return {
    analysis,
    topology,
    gate: buildResearchQualityGate(analysis, topology),
    researchGapQueue: buildResearchGapQueue(analysis, topology),
    sourceIntegrity: analyzeResearchSourceIntegrity(analysis),
  }
}
