import { analyzeClaimEvidenceAge, summarizeEvidenceAge } from './research-evidence-age'
import type { ResearchQualityAnalysis } from './research-quality-analysis'
import {
  analyzeClaimEvidenceOverlap,
  analyzeCrossProfileStudyLoad,
  analyzeEvidenceBundleReuse,
} from './research-study-load'

export type ResearchQualityTopology = ReturnType<typeof buildResearchQualityTopology>

/**
 * Build all derived evidence-topology products once from the canonical analysis.
 * Policy and reporting should consume this snapshot rather than independently
 * walking the same claim/study graph again.
 */
export function buildResearchQualityTopology(analysis: ResearchQualityAnalysis) {
  const crossProfileStudyLoad = analyzeCrossProfileStudyLoad(analysis)
  const systemicLoadBearingStudies = crossProfileStudyLoad.filter((study) => study.systemicLoadBearing)
  const evidenceBundleReuse = analyzeEvidenceBundleReuse(analysis)
  const narrowRepeatedEvidenceBundles = evidenceBundleReuse.filter((bundle) => bundle.narrowRepeatedEvidenceBundle)
  const claimEvidenceOverlap = analyzeClaimEvidenceOverlap(analysis)
  const crossPredicateEvidenceOverlap = claimEvidenceOverlap.filter((item) => item.differentPredicates)
  const claimEvidenceAge = analyzeClaimEvidenceAge(analysis)
  const evidenceAgeSummary = summarizeEvidenceAge(claimEvidenceAge)
  const legacyOnlyClaims = claimEvidenceAge.filter((claim) => claim.allKnownEvidenceOlderThan10Years)
  const highConfidenceLegacyOnlyClaims = claimEvidenceAge.filter((claim) => claim.highConfidenceLegacyOnlyClaim)

  return {
    crossProfileStudyLoad,
    systemicLoadBearingStudies,
    evidenceBundleReuse,
    narrowRepeatedEvidenceBundles,
    claimEvidenceOverlap,
    crossPredicateEvidenceOverlap,
    claimEvidenceAge,
    evidenceAgeSummary,
    legacyOnlyClaims,
    highConfidenceLegacyOnlyClaims,
  }
}
