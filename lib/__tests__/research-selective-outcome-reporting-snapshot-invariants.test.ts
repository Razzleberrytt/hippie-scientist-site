import { describe, expect, it } from 'vitest'

import { validateSelectiveOutcomeReportingSnapshotInvariants } from '@/lib/research-selective-outcome-reporting-snapshot-invariants'
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
    humanSourceCount: 2,
    assessableSourceCount: 2,
    registeredOrPrespecifiedPrimaryNullCount: 1,
    favorableSecondaryOrExploratoryCount: 1,
    explicitOutcomeSwitchCount: 0,
    primaryOutcomeNotMetCount: 1,
    selectiveOutcomeRisk: true,
    explicitOutcomeSwitchRisk: false,
    reasons: ['linked human evidence pairs a not-met primary outcome with a favorable secondary result'],
    ...overrides,
  }
  return {
    selectiveOutcomeReporting: {
      summary: {
        approvedOutcomeClaims: 1,
        assessableClaims: 1,
        findings: 1,
        highConfidenceFindings: 1,
        selectiveOutcomeRisks: 1,
        explicitOutcomeSwitchRisks: 0,
      },
      claims: [row],
      findings: [row],
      highConfidenceFindings: [row],
    },
  } as unknown as ResearchQualityTopology
}

describe('selective outcome reporting snapshot invariants', () => {
  it('accepts a self-consistent selective-outcome report', () => {
    expect(validateSelectiveOutcomeReportingSnapshotInvariants(analysis(), topology())).toEqual([])
  })

  it('detects approved outcome denominator drift', () => {
    const value = topology()
    value.selectiveOutcomeReporting.summary.approvedOutcomeClaims = 2
    expect(validateSelectiveOutcomeReportingSnapshotInvariants(analysis(), value)
      .map((failure) => failure.kind)).toContain('selective-outcome-approved-outcome-count-mismatch')
  })

  it('detects impossible source cardinality', () => {
    expect(validateSelectiveOutcomeReportingSnapshotInvariants(
      analysis(),
      topology({ explicitOutcomeSwitchCount: 3, explicitOutcomeSwitchRisk: true }),
    ).map((failure) => failure.kind)).toContain('selective-outcome-source-count-invalid')
  })

  it('detects inconsistent switch flags and high-confidence thresholds', () => {
    const value = topology({ confidence: 0.6, explicitOutcomeSwitchCount: 1, explicitOutcomeSwitchRisk: false })
    expect(validateSelectiveOutcomeReportingSnapshotInvariants(analysis(), value)
      .map((failure) => failure.kind)).toEqual(expect.arrayContaining([
        'selective-outcome-switch-state-invalid',
        'selective-outcome-high-confidence-threshold-invalid',
      ]))
  })
})
