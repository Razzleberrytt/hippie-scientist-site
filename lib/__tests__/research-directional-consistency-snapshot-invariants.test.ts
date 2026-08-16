import { describe, expect, it } from 'vitest'

import { validateDirectionalConsistencySnapshotInvariants } from '@/lib/research-directional-consistency-snapshot-invariants'
import type { ResearchQualityAnalysis } from '@/lib/research-quality-analysis'
import type { ResearchQualityTopology } from '@/lib/research-quality-topology'

function analysis(): ResearchQualityAnalysis {
  return {
    cache: {},
    profiles: [],
    profileAnalyses: [],
    structuredClaimAnalyses: [],
    claimAnalyses: [{
      url: '/herbs/example/',
      claimId: 'claim-1',
      reviewStatus: 'approved',
      approved: true,
      predicate: 'supports_outcome',
      confidence: 0.8,
      sourceRefCount: 2,
      validSourceRefCount: 2,
      danglingSourceRefs: [],
      studyIds: ['a', 'b'],
      studyCount: 2,
      classifiedStudyCount: 2,
      primaryHuman: 2,
      synthesis: 0,
      narrative: 0,
      designs: ['rct', 'rct'],
      outcomeClaim: true,
      supportTier: 'human-supported',
      structuredSupportTier: 'adequate',
      weakStructuredClaim: false,
      highConfidenceWeakStructured: false,
      highConfidenceWeakOutcome: false,
      singleStudy: false,
      aliasCollapsed: false,
    }],
  } as ResearchQualityAnalysis
}

function topology(overrides: Record<string, unknown> = {}): ResearchQualityTopology {
  const row = {
    url: '/herbs/example/',
    claimId: 'claim-1',
    predicate: 'supports_outcome',
    confidence: 0.8,
    favorableClaim: true,
    humanSourceCount: 2,
    positiveSourceCount: 1,
    nullSourceCount: 1,
    negativeSourceCount: 0,
    mixedSourceCount: 0,
    primaryNullOrNegativeSourceCount: 0,
    secondaryOrSubgroupPositiveSourceCount: 0,
    endpointCherryPickRisk: false,
    directionalHeterogeneity: true,
    uniformlyPositiveOverstatement: false,
    reasons: ['linked human evidence is directionally mixed'],
    ...overrides,
  }
  return {
    directionalConsistency: {
      summary: {
        approvedOutcomeClaims: 1,
        assessableClaims: 1,
        findings: 1,
        highConfidenceFindings: 1,
        endpointCherryPickRisks: 0,
        directionalHeterogeneityClaims: 1,
        uniformlyPositiveOverstatements: 0,
      },
      claims: [row],
      findings: [row],
      highConfidenceFindings: [row],
    },
  } as unknown as ResearchQualityTopology
}

describe('directional consistency snapshot invariants', () => {
  it('accepts a self-consistent directional report', () => {
    expect(validateDirectionalConsistencySnapshotInvariants(analysis(), topology())).toEqual([])
  })

  it('detects summary drift', () => {
    const value = topology()
    value.directionalConsistency.summary.findings = 0
    expect(validateDirectionalConsistencySnapshotInvariants(analysis(), value)
      .map((failure) => failure.kind)).toContain('directional-finding-count-mismatch')
  })

  it('detects impossible source cardinality', () => {
    expect(validateDirectionalConsistencySnapshotInvariants(analysis(), topology({ positiveSourceCount: 3 }))
      .map((failure) => failure.kind)).toContain('directional-source-count-invalid')
  })
})
