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
  severeStudyClassConflict: 100,
  studyClassAmbiguity: 5,
}

function topology(overrides: Record<string, unknown> = {}): ResearchQualityTopology {
  return {
    narrowCrossProfileEvidenceBundles: [],
    semanticAlignment: { findings: [], concentrationFindings: [], coverageGapFindings: [] },
    claimLanguageCalibration: { directEvidenceFindings: [] },
    claimCitationMetadata: { lowCoverageClaims: [] },
    provenanceNarrowMultiStudyClaims: [],
    edgeCardinality: { pseudoMultiSourceClaims: [] },
    studyClassConflicts: { conflicts: [], severeConflicts: [] },
    ...overrides,
  } as unknown as ResearchQualityTopology
}

describe('aggregated topology gap signals', () => {
  it('collapses multiple semantic mismatches on one profile into one signal', () => {
    const findings = [
      { url: '/herbs/a/', claimId: 'c1', confidence: 0.9, roleMismatch: true, domainMismatch: false, populationMismatch: false },
      { url: '/herbs/a/', claimId: 'c2', confidence: 0.8, roleMismatch: false, domainMismatch: true, populationMismatch: false },
      { url: '/herbs/a/', claimId: 'c3', confidence: 0.6, roleMismatch: false, domainMismatch: false, populationMismatch: true },
    ]
    const signals = buildAggregatedTopologyGapSignals(topology({
      semanticAlignment: { findings, concentrationFindings: [], coverageGapFindings: [] },
    }), weights)

    const semantic = signals.filter((signal) => signal.kind === 'semantic-claim-source-mismatch')
    expect(semantic).toHaveLength(1)
    expect(semantic[0]).toMatchObject({ url: '/herbs/a/' })
    expect(semantic[0].detail).toContain('3 approved claim(s)')
    expect(semantic[0].detail).toContain('2 high-confidence')
  })

  it('routes narrow multi-study provenance once per affected profile', () => {
    const signals = buildAggregatedTopologyGapSignals(topology({
      provenanceNarrowMultiStudyClaims: [
        { url: '/herbs/a/', highConfidenceProvenanceNarrowMultiStudySupport: true, sameFirstAuthorLineage: true, sameJournalLineage: false },
        { url: '/herbs/a/', highConfidenceProvenanceNarrowMultiStudySupport: false, sameFirstAuthorLineage: false, sameJournalLineage: true },
      ],
    }), weights)

    const provenance = signals.filter((signal) => signal.kind === 'claim-provenance-narrow-multi-study-support')
    expect(provenance).toHaveLength(1)
    expect(provenance[0].detail).toContain('2 multi-study approved claim(s)')
  })

  it('aggregates pseudo-multi-source claims once per profile', () => {
    const signals = buildAggregatedTopologyGapSignals(topology({
      edgeCardinality: {
        pseudoMultiSourceClaims: [
          { url: '/herbs/a/', approved: true, aliasCollapsedSourceCount: 1, validUniqueSourceRefCount: 2 },
          { url: '/herbs/a/', approved: true, aliasCollapsedSourceCount: 2, validUniqueSourceRefCount: 3 },
          { url: '/herbs/a/', approved: false, aliasCollapsedSourceCount: 5, validUniqueSourceRefCount: 6 },
        ],
      },
    }), weights)

    const pseudo = signals.filter((signal) => signal.kind === 'pseudo-multi-source-support')
    expect(pseudo).toHaveLength(1)
    expect(pseudo[0]).toMatchObject({ url: '/herbs/a/' })
    expect(pseudo[0].detail).toContain('2 approved claim(s)')
    expect(pseudo[0].detail).toContain('3 redundant source row(s)')
    expect(pseudo[0].detail).toContain('3 source rows')
  })

  it('keeps severe and advisory study-class conflicts distinct', () => {
    const severe = { url: '/herbs/a/', severe: true }
    const advisory = { url: '/herbs/b/', severe: false }
    const signals = buildAggregatedTopologyGapSignals(topology({
      studyClassConflicts: { conflicts: [severe, advisory], severeConflicts: [severe] },
    }), weights)

    expect(signals.find((signal) => signal.url === '/herbs/a/')).toMatchObject({
      kind: 'severe-canonical-study-class-conflict',
      weight: 100,
    })
    expect(signals.find((signal) => signal.url === '/herbs/b/')).toMatchObject({
      kind: 'canonical-study-class-ambiguity',
      weight: 5,
    })
  })
})
