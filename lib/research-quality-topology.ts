import { analyzeClaimEvidenceDiversity } from './research-claim-evidence-diversity'
import { analyzeEdgeWeightedDesignUsage } from './research-design-usage'
import { analyzeClaimEvidenceAge, summarizeEvidenceAge } from './research-evidence-age'
import { analyzeProvenanceConcentration } from './research-provenance-concentration'
import type { ResearchQualityAnalysis } from './research-quality-analysis'
import { analyzeStudyIdentityCoverage } from './research-study-identity-coverage'
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
  const studyIdentityCoverage = analyzeStudyIdentityCoverage(analysis)
  const edgeWeightedDesignUsage = analyzeEdgeWeightedDesignUsage(analysis)
  const edgeWeightedNarrativeDominatedProfiles = edgeWeightedDesignUsage.filter((profile) => profile.edgeWeightedNarrativeDominated)
  const provenanceConcentration = analyzeProvenanceConcentration(analysis)
  const provenanceConcentratedProfiles = provenanceConcentration.profiles.filter((profile) => profile.provenanceConcentrated)
  const claimEvidenceDiversity = analyzeClaimEvidenceDiversity(analysis)
  const homogeneousMultiStudyClaims = claimEvidenceDiversity.filter((claim) => claim.homogeneousMultiStudySupport)
  const highConfidenceHomogeneousMultiStudyClaims = claimEvidenceDiversity.filter(
    (claim) => claim.highConfidenceHomogeneousMultiStudySupport,
  )

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
    studyIdentityCoverage,
    edgeWeightedDesignUsage,
    edgeWeightedNarrativeDominatedProfiles,
    provenanceConcentration,
    provenanceConcentratedProfiles,
    claimEvidenceDiversity,
    homogeneousMultiStudyClaims,
    highConfidenceHomogeneousMultiStudyClaims,
  }
}
