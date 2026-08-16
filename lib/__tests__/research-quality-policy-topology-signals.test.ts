import { describe, expect, it } from 'vitest'

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

function topology(overrides: Record<string, unknown> = {}): ResearchQualityTopology {
  return {
    narrowCrossProfileEvidenceBundles: [],
    semanticAlignment: { findings: [], concentrationFindings: [], coverageGapFindings: [] },
    claimLanguageCalibration: { directEvidenceFindings: [] },
    claimCitationMetadata: { lowCoverageClaims: [] },
    metadataIntegrity: { profiles: [] },
    provenanceNarrowMultiStudyClaims: [],
    edgeCardinality: { pseudoMultiSourceClaims: [] },
    trialRegistrationIndependence: { sameTrialReuseClaims: [] },
    evidenceLineage: { sharedNonRegistryLineageClaims: [] },
    evidenceIndependenceCoverage: { unresolvedClaims: [] },
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

  it('aggregates advisory metadata once while leaving severe class conflicts structural', () => {
    const severe = { url: '/herbs/a/', severe: true }
    const signals = buildAggregatedTopologyGapSignals(topology({
      studyClassConflicts: { conflicts: [severe], severeConflicts: [severe] },
      metadataIntegrity: {
        profiles: [
          {
            url: '/herbs/a/',
            yearConflicts: 0,
            provenanceConflicts: 0,
            studyClassConflicts: 1,
            severeStudyClassConflicts: 1,
            lowCitationMetadataClaims: 0,
            highConfidenceLowCitationMetadataClaims: 0,
            issueCount: 1,
            severeIssueCount: 1,
          },
          {
            url: '/herbs/b/',
            yearConflicts: 1,
            provenanceConflicts: 1,
            studyClassConflicts: 1,
            severeStudyClassConflicts: 0,
            lowCitationMetadataClaims: 2,
            highConfidenceLowCitationMetadataClaims: 1,
            issueCount: 5,
            severeIssueCount: 1,
          },
        ],
      },
    }), weights)

    expect(signals.find((signal) => signal.url === '/herbs/a/')).toMatchObject({
      kind: 'severe-canonical-study-class-conflict',
      weight: 100,
    })
    expect(signals.some((signal) => signal.url === '/herbs/a/' && signal.kind === 'research-metadata-integrity')).toBe(false)

    const metadata = signals.find((signal) => signal.url === '/herbs/b/' && signal.kind === 'research-metadata-integrity')
    expect(metadata).toMatchObject({ weight: 18 })
    expect(metadata?.detail).toContain('5 advisory metadata integrity issue(s)')
    expect(metadata?.detail).toContain('1 publication-year conflict(s)')
    expect(metadata?.detail).toContain('1 provenance alias conflict(s)')
    expect(metadata?.detail).toContain('1 advisory study-class ambiguity')
    expect(metadata?.detail).toContain('2 low-completeness claim(s)')
    expect(metadata?.detail).toContain('1 high-confidence citation gap(s)')
  })
})
