import { describe, expect, it } from 'vitest'

import type { ResearchQualityAnalysis } from '@/lib/research-quality-analysis'
import type { ResearchQualityTopology } from '@/lib/research-quality-topology'
import { validateEffectCertaintySnapshotInvariants } from '@/lib/research-effect-certainty-snapshot-invariants'

function fixtures() {
  const analysis = {
    claimAnalyses: [{
      url: '/herbs/example/',
      claimId: 'claim-1',
      outcomeClaim: true,
    }],
  } as unknown as ResearchQualityAnalysis

  const finding = {
    url: '/herbs/example/',
    claimId: 'claim-1',
    predicate: 'supports_outcome',
    confidence: 0.9,
    claimStrengthLanguage: true,
    claimClinicalImportanceLanguage: false,
    claimReliabilityLanguage: false,
    humanSourceCount: 1,
    comparableHumanSourceCount: 1,
    smallOrModestSourceCount: 1,
    nullSourceCount: 0,
    mixedSourceCount: 0,
    clinicallyInsufficientSourceCount: 0,
    statisticalOnlySourceCount: 0,
    magnitudeOverstatement: true,
    clinicalImportanceOverstatement: false,
    certaintyOverstatement: false,
    reasons: ['strong magnitude wording exceeds linked evidence'],
  }
  const topology = {
    effectCertainty: {
      claims: [finding],
      findings: [finding],
      highConfidenceFindings: [finding],
      summary: {
        approvedOutcomeClaims: 1,
        assessableClaims: 1,
        findings: 1,
        highConfidenceFindings: 1,
        magnitudeOverstatements: 1,
        clinicalImportanceOverstatements: 0,
        certaintyOverstatements: 0,
      },
    },
  } as unknown as ResearchQualityTopology

  return { analysis, topology }
}

describe('effect-certainty snapshot invariants', () => {
  it('accepts a self-consistent effect-certainty product', () => {
    const { analysis, topology } = fixtures()
    expect(validateEffectCertaintySnapshotInvariants(analysis, topology)).toEqual([])
  })

  it('rejects summary drift', () => {
    const { analysis, topology } = fixtures()
    topology.effectCertainty.summary.findings = 0
    const kinds = validateEffectCertaintySnapshotInvariants(analysis, topology).map((failure) => failure.kind)
    expect(kinds).toContain('effect-certainty-finding-count-mismatch')
  })

  it('rejects impossible source counts', () => {
    const { analysis, topology } = fixtures()
    topology.effectCertainty.claims[0].comparableHumanSourceCount = 2
    const kinds = validateEffectCertaintySnapshotInvariants(analysis, topology).map((failure) => failure.kind)
    expect(kinds).toContain('effect-certainty-invalid-human-source-count')
  })
})
