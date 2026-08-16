import { analyzeClaimBreadth } from './research-claim-breadth'
import { analyzeClaimCitationMetadata } from './research-claim-citation-metadata'
import { analyzeClaimEvidenceDiversity } from './research-claim-evidence-diversity'
import { analyzeClaimLanguageCalibration } from './research-claim-language-calibration'
import { analyzeClaimProvenanceIndependence } from './research-claim-provenance-independence'
import { analyzeCrossProfileEvidenceBundles } from './research-cross-profile-bundles'
import { analyzeEdgeWeightedDesignUsage } from './research-design-usage'
import { analyzeDirectionalConsistency } from './research-directional-consistency'
import { analyzeEffectCertainty } from './research-effect-certainty'
import { analyzeResearchEdgeCardinality } from './research-edge-cardinality'
import { analyzeEvidenceIndependenceCoverage } from './research-evidence-independence-coverage'
import { analyzeEvidenceLineage } from './research-evidence-lineage'
import { analyzeClaimEvidenceAge, analyzeStudyYearConflicts, summarizeEvidenceAge } from './research-evidence-age'
import { buildResearchMetadataIntegrity } from './research-metadata-integrity'
import { analyzeProvenanceConcentration, analyzeStudyProvenanceConflicts } from './research-provenance-concentration'
import type { ResearchQualityAnalysis } from './research-quality-analysis'
import { analyzeResearchSemanticAlignment } from './research-semantic-alignment'
import { analyzeSelectiveOutcomeReporting } from './research-selective-outcome-reporting'
import { analyzeStudyClassConflicts } from './research-study-class-conflicts'
import { analyzeStudyIdentityCoverage } from './research-study-identity-coverage'
import {
  analyzeClaimEvidenceOverlap,
  analyzeCrossProfileStudyLoad,
  analyzeEvidenceBundleReuse,
} from './research-study-load'
import { analyzeTrialRegistrationIndependence } from './research-trial-registration-independence'
import { analyzeUnderlyingStudyIndependence } from './research-underlying-study-independence'

export type ResearchQualityTopology = ReturnType<typeof buildResearchQualityTopology>

/**
 * Build all derived research-quality products once from the canonical analysis.
 * Policy and reporting consume this snapshot rather than independently walking
 * the same claim/study graph or recomputing policy-facing editorial analyses.
 */
export function buildResearchQualityTopology(analysis: ResearchQualityAnalysis) {
  const crossProfileStudyLoad = analyzeCrossProfileStudyLoad(analysis)
  const systemicLoadBearingStudies = crossProfileStudyLoad.filter((study) => study.systemicLoadBearing)
  const crossProfileEvidenceBundles = analyzeCrossProfileEvidenceBundles(analysis)
  const narrowCrossProfileEvidenceBundles = crossProfileEvidenceBundles.filter((bundle) => bundle.narrowCrossProfileBundle)
  const evidenceBundleReuse = analyzeEvidenceBundleReuse(analysis)
  const narrowRepeatedEvidenceBundles = evidenceBundleReuse.filter((bundle) => bundle.narrowRepeatedEvidenceBundle)
  const claimEvidenceOverlap = analyzeClaimEvidenceOverlap(analysis)
  const crossPredicateEvidenceOverlap = claimEvidenceOverlap.filter((item) => item.differentPredicates)
  const claimEvidenceAge = analyzeClaimEvidenceAge(analysis)
  const evidenceAgeSummary = summarizeEvidenceAge(claimEvidenceAge)
  const studyYearConflicts = analyzeStudyYearConflicts(analysis)
  const legacyOnlyClaims = claimEvidenceAge.filter((claim) => claim.allKnownEvidenceOlderThan10Years)
  const highConfidenceLegacyOnlyClaims = claimEvidenceAge.filter((claim) => claim.highConfidenceLegacyOnlyClaim)
  const studyIdentityCoverage = analyzeStudyIdentityCoverage(analysis)
  const edgeWeightedDesignUsage = analyzeEdgeWeightedDesignUsage(analysis)
  const edgeWeightedNarrativeDominatedProfiles = edgeWeightedDesignUsage.filter((profile) => profile.edgeWeightedNarrativeDominated)
  const provenanceConcentration = analyzeProvenanceConcentration(analysis)
  const provenanceConflicts = analyzeStudyProvenanceConflicts(analysis)
  const provenanceConcentratedProfiles = provenanceConcentration.profiles.filter((profile) => profile.provenanceConcentrated)
  const claimEvidenceDiversity = analyzeClaimEvidenceDiversity(analysis)
  const homogeneousMultiStudyClaims = claimEvidenceDiversity.filter((claim) => claim.homogeneousMultiStudySupport)
  const highConfidenceHomogeneousMultiStudyClaims = claimEvidenceDiversity.filter(
    (claim) => claim.highConfidenceHomogeneousMultiStudySupport,
  )
  const claimProvenanceIndependence = analyzeClaimProvenanceIndependence(analysis)
  const provenanceNarrowMultiStudyClaims = claimProvenanceIndependence.filter(
    (claim) => claim.provenanceNarrowMultiStudySupport,
  )
  const highConfidenceProvenanceNarrowMultiStudyClaims = claimProvenanceIndependence.filter(
    (claim) => claim.highConfidenceProvenanceNarrowMultiStudySupport,
  )
  const trialRegistrationIndependence = analyzeTrialRegistrationIndependence(analysis)
  const evidenceLineage = analyzeEvidenceLineage(analysis)
  const evidenceIndependenceCoverage = analyzeEvidenceIndependenceCoverage({
    trialRegistrationIndependence,
    evidenceLineage,
  })
  const underlyingStudyIndependence = analyzeUnderlyingStudyIndependence({
    analysis,
    trialRegistrationIndependence,
    evidenceLineage,
  })
  const studyClassConflicts = analyzeStudyClassConflicts(analysis)
  const semanticAlignment = analyzeResearchSemanticAlignment(analysis)
  const claimBreadth = analyzeClaimBreadth(analysis)
  const effectCertainty = analyzeEffectCertainty(analysis)
  const directionalConsistency = analyzeDirectionalConsistency(analysis)
  const selectiveOutcomeReporting = analyzeSelectiveOutcomeReporting(analysis)
  const claimLanguageCalibration = analyzeClaimLanguageCalibration(analysis)
  const claimCitationMetadata = analyzeClaimCitationMetadata(analysis)
  const metadataIntegrity = buildResearchMetadataIntegrity({
    studyYearConflicts,
    provenanceConflicts,
    studyClassConflicts,
    claimCitationMetadata,
  })
  const edgeCardinality = analyzeResearchEdgeCardinality(analysis)

  return {
    crossProfileStudyLoad,
    systemicLoadBearingStudies,
    crossProfileEvidenceBundles,
    narrowCrossProfileEvidenceBundles,
    evidenceBundleReuse,
    narrowRepeatedEvidenceBundles,
    claimEvidenceOverlap,
    crossPredicateEvidenceOverlap,
    claimEvidenceAge,
    evidenceAgeSummary,
    studyYearConflicts,
    legacyOnlyClaims,
    highConfidenceLegacyOnlyClaims,
    studyIdentityCoverage,
    edgeWeightedDesignUsage,
    edgeWeightedNarrativeDominatedProfiles,
    provenanceConcentration,
    provenanceConflicts,
    provenanceConcentratedProfiles,
    claimEvidenceDiversity,
    homogeneousMultiStudyClaims,
    highConfidenceHomogeneousMultiStudyClaims,
    claimProvenanceIndependence,
    provenanceNarrowMultiStudyClaims,
    highConfidenceProvenanceNarrowMultiStudyClaims,
    trialRegistrationIndependence,
    evidenceLineage,
    evidenceIndependenceCoverage,
    underlyingStudyIndependence,
    studyClassConflicts,
    semanticAlignment,
    claimBreadth,
    effectCertainty,
    directionalConsistency,
    selectiveOutcomeReporting,
    claimLanguageCalibration,
    claimCitationMetadata,
    metadataIntegrity,
    edgeCardinality,
  }
}
