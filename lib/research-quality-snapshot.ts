import { analyzeResearchQuality, type ResearchQualityAnalysis } from './research-quality-analysis'
import { buildResearchGapQueue, structuralCoverageFailures } from './research-quality-policy'
import { buildResearchQualityTopology, type ResearchQualityTopology } from './research-quality-topology'
import { analyzeResearchSourceIntegrity } from './research-source-integrity'

export type ResearchQualitySnapshot = {
  analysis: ResearchQualityAnalysis
  topology: ResearchQualityTopology
  structuralFailures: ReturnType<typeof structuralCoverageFailures>
  researchGapQueue: ReturnType<typeof buildResearchGapQueue>
  sourceIntegrity: ReturnType<typeof analyzeResearchSourceIntegrity>
}

/**
 * Canonical execution boundary for research-quality consumers.
 *
 * Specialized reporters may format different views, but they should consume
 * this snapshot instead of independently rebuilding analysis/topology/policy
 * state. This keeps one authoritative graph and one remediation queue contract.
 */
export function buildResearchQualitySnapshot(root = process.cwd()): ResearchQualitySnapshot {
  const analysis = analyzeResearchQuality(root)
  const topology = buildResearchQualityTopology(analysis)
  return {
    analysis,
    topology,
    structuralFailures: structuralCoverageFailures(analysis),
    researchGapQueue: buildResearchGapQueue(analysis, topology),
    sourceIntegrity: analyzeResearchSourceIntegrity(analysis),
  }
}
