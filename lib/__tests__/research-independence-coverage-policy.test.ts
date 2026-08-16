import { describe, expect, it } from 'vitest'

import { buildAggregatedTopologyGapSignals } from '@/lib/research-quality-policy-topology-signals'
import type { ResearchQualityTopology } from '@/lib/research-quality-topology'

const weights = {
  narrowCrossProfileEvidenceBundle: 12,
  semanticMismatch: 18,
  highConfidenceSemanticMismatchBonus: 10,
  semanticSingleSource: 12,
  semanticSupportConcentration: 8,
  highConfidenceSemanticConcentrationBonus: 6,
  semanticMetadataCoverageGap: 6,
  highConfidenceSemanticCoverageGapBonus: 4,
  causalWithoutControlledOrSynthesis: 18,
  causalWithoutDirectControlled: 10,
  synthesisOnlyCausalSupport: 7,
  highConfidenceCausalLanguageBonus: 8,
  claimCitationMetadataGap: 8,
  highConfidenceCitationMetadataBonus: 4,
  provenanceNarrowMultiStudySupport: 8,
  highConfidenceProvenanceNarrowBonus: 4,
  pseudoMultiSourceSupport: 9,
  underlyingStudyPublicationReuse: 12,
  highConfidenceUnderlyingStudyPublicationReuseBonus: 6,
  independenceMetadataGap: 8,
  highConfidenceIndependenceMetadataBonus: 6,
  severeStudyClassConflict: 100,
  studyClassAmbiguity: 5,
}

function topology(): ResearchQualityTopology {
  return {
    narrowCrossProfileEvidenceBundles: [],
    semanticAlignment: { findings: [], concentrationFindings: [], coverageGapFindings: [] },
    claimLanguageCalibration: { directEvidenceFindings: [] },
    claimCitationMetadata: { lowCoverageClaims: [] },
    provenanceNarrowMultiStudyClaims: [],
    edgeCardinality: { pseudoMultiSourceClaims: [] },
    trialRegistrationIndependence: { sameTrialReuseClaims: [] },
    evidenceLineage: { sharedNonRegistryLineageClaims: [] },
    evidenceIndependenceCoverage: {
      unresolvedClaims: [
        { url: '/herbs/a/', claimId: 'c1', combinedCoverage: 0.25, unresolvedStudyCount: 3, highConfidenceIndependenceUnresolved: true },
        { url: '/herbs/a/', claimId: 'c2', combinedCoverage: 0.5, unresolvedStudyCount: 1, highConfidenceIndependenceUnresolved: false },
      ],
    },
    studyClassConflicts: { conflicts: [], severeConflicts: [] },
  } as unknown as ResearchQualityTopology
}

describe('evidence independence remediation policy', () => {
  it('aggregates unresolved independence metadata once per profile without calling it dependence', () => {
    const signals = buildAggregatedTopologyGapSignals(topology(), weights)
    const signal = signals.find((item) => item.kind === 'evidence-independence-metadata-gap')
    expect(signal).toBeDefined()
    expect(signal?.url).toBe('/herbs/a/')
    expect(signal?.detail).toContain('2 approved multi-study claim(s) have unresolved independence')
    expect(signal?.detail).toContain('4 study slot(s) lack explicit')
    expect(signal?.detail).toContain('1 high-confidence')
    expect(signal?.detail).not.toContain('reuse underlying evidence')
  })
})
