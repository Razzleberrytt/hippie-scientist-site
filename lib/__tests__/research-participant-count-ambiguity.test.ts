import { describe, expect, it } from 'vitest'

import { buildResearchMetadataIntegrity } from '@/lib/research-metadata-integrity'
import { analyzeStudyParticipantCountAmbiguities } from '@/lib/research-participant-count-ambiguity'
import type { ResearchQualityAnalysis } from '@/lib/research-quality-analysis'
import {
  buildAggregatedTopologyGapSignals,
  type AggregatedTopologyGapWeights,
} from '@/lib/research-quality-policy-topology-signals'
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
  metadataIntegrity: 6,
  highConfidenceMetadataIntegrityBonus: 4,
  provenanceNarrowMultiStudySupport: 8,
  highConfidenceProvenanceNarrowBonus: 4,
  pseudoMultiSourceSupport: 9,
  underlyingStudyPublicationReuse: 12,
  highConfidenceUnderlyingStudyPublicationReuseBonus: 6,
  independenceMetadataGap: 8,
  highConfidenceIndependenceMetadataBonus: 6,
  severeStudyClassConflict: 100,
} satisfies AggregatedTopologyGapWeights

function analysisFixture(): ResearchQualityAnalysis {
  return {
    cache: {},
    profiles: [{
      kind: 'herbs',
      url: '/herbs/example/',
      file: 'example.json',
      record: {
        slug: 'example',
        sources: [
          { id: 'doi', doi: '10.1000/shared', n: 100 },
          { id: 'bridge', doi: '10.1000/shared', pmid: '34559859', sample_size: 'N=120' },
        ],
        claimMap: [],
      },
    }],
    profileAnalyses: [],
    claimAnalyses: [],
    structuredClaimAnalyses: [],
  } as unknown as ResearchQualityAnalysis
}

describe('participant-count ambiguity', () => {
  it('preserves conflicting explicit N values on one canonical publication', () => {
    const ambiguities = analyzeStudyParticipantCountAmbiguities(analysisFixture())

    expect(ambiguities).toEqual([{
      url: '/herbs/example/',
      studyId: 'doi:10.1000/shared',
      participantCounts: [100, 120],
      minParticipantCount: 100,
      maxParticipantCount: 120,
      spread: 20,
    }])
  })

  it('rolls ambiguity into the existing metadata-integrity remediation reason', () => {
    const ambiguities = analyzeStudyParticipantCountAmbiguities(analysisFixture())
    const metadataIntegrity = buildResearchMetadataIntegrity({
      studyYearConflicts: [],
      participantCountAmbiguities: ambiguities,
      provenanceConflicts: [],
      studyClassConflicts: { conflicts: [], severeConflicts: [] } as never,
      claimCitationMetadata: { lowCoverageClaims: [], highConfidenceLowCoverageClaims: [] } as never,
    })

    expect(metadataIntegrity.profiles[0]).toMatchObject({
      url: '/herbs/example/',
      participantCountAmbiguities: 1,
      issueCount: 1,
    })

    const topology = {
      narrowCrossProfileEvidenceBundles: [],
      semanticAlignment: { findings: [], concentrationFindings: [], coverageGapFindings: [] },
      claimBreadth: { findings: [] },
      effectCertainty: { findings: [] },
      directionalConsistency: { findings: [] },
      outcomeReportingIntegrity: { claims: [] },
      claimLanguageCalibration: { directEvidenceFindings: [] },
      metadataIntegrity,
      provenanceNarrowMultiStudyClaims: [],
      edgeCardinality: { pseudoMultiSourceClaims: [] },
      underlyingStudyIndependence: { newlyOverDependentProfiles: [], reducedClaims: [], profiles: [] },
      evidenceIndependenceCoverage: { unresolvedClaims: [] },
      studyClassConflicts: { severeConflicts: [] },
    } as unknown as ResearchQualityTopology

    const signals = buildAggregatedTopologyGapSignals(topology, weights)
    expect(signals).toHaveLength(1)
    expect(signals[0]).toMatchObject({
      url: '/herbs/example/',
      kind: 'research-metadata-integrity',
      weight: 6,
    })
    expect(signals[0].detail).toContain('1 participant-count ambiguity finding(s)')
  })
})
