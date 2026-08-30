import { describe, expect, it } from 'vitest'
import {
  evaluatePageQualityGate,
  hasCompleteSafetyProvenance,
  safetyPolicyForFlag,
  type SafetyFlag,
} from '../safety-governance'

function flag(overrides: Partial<SafetyFlag> = {}): SafetyFlag {
  return {
    id: 'flag-1',
    severity: 'moderate',
    certainty: 'theoretical',
    riskClass: 'general',
    provenance: { sourceIds: ['PMID:123'], reviewedAt: '2026-08-15' },
    ...overrides,
  }
}

describe('safety governance', () => {
  it('keeps severity separate from certainty', () => {
    const policy = safetyPolicyForFlag(flag({ severity: 'high', certainty: 'unknown' }))
    expect(policy.messageMode).toBe('high-risk-harm-reduction')
    expect(policy.reviewLevel).toBe('standard')
  })

  it('suppresses commerce and start-low language when unsupervised use is inappropriate', () => {
    const policy = safetyPolicyForFlag(
      flag({
        severity: 'critical',
        certainty: 'known',
        riskClass: 'high-risk-compound',
        unsupervisedUseInappropriate: true,
      }),
    )

    expect(policy.suppressCommercialModules).toBe(true)
    expect(policy.allowStartLowLanguage).toBe(false)
    expect(policy.messageMode).toBe('avoid-unsupervised-use')
  })

  it.each(['addiction-risk', 'pregnancy', 'pediatric', 'major-medication-interaction'] as const)(
    'requires expert review for %s content',
    (riskClass) => {
      expect(safetyPolicyForFlag(flag({ riskClass })).reviewLevel).toBe('expert')
    },
  )

  it('requires source ids and review dates for safety provenance', () => {
    expect(hasCompleteSafetyProvenance(flag())).toBe(true)
    expect(hasCompleteSafetyProvenance(flag({ provenance: { sourceIds: [] } }))).toBe(false)
  })

  it('gates commercial pages on complete evidence, safety and sourcing', () => {
    expect(
      evaluatePageQualityGate('commercial', {
        evidenceComplete: true,
        safetyComplete: false,
        sourcingComplete: true,
      }),
    ).toEqual({
      publishable: false,
      commercialAllowed: false,
      failures: ['safety-incomplete'],
    })
  })

  it('requires complete data for both sides of comparisons', () => {
    const result = evaluatePageQualityGate('comparison', {
      evidenceComplete: true,
      safetyComplete: true,
      sourcingComplete: true,
      bothComparisonSidesComplete: false,
    })
    expect(result.publishable).toBe(false)
    expect(result.failures).toContain('comparison-side-incomplete')
  })

  it('requires source-backed interaction data on safety pages', () => {
    const result = evaluatePageQualityGate('safety', {
      evidenceComplete: true,
      safetyComplete: true,
      sourcingComplete: true,
      interactionDataSourceBacked: false,
    })
    expect(result.failures).toContain('interaction-data-not-source-backed')
  })

  it('requires ranking methodology for best-of guides and stronger evidence for disease pages', () => {
    expect(
      evaluatePageQualityGate('best-of', {
        evidenceComplete: true,
        safetyComplete: true,
        sourcingComplete: true,
        rankingMethodologyPublished: false,
      }).failures,
    ).toContain('ranking-methodology-missing')

    expect(
      evaluatePageQualityGate('disease-related', {
        evidenceComplete: true,
        safetyComplete: true,
        sourcingComplete: true,
        diseaseEvidenceStandardMet: false,
      }).failures,
    ).toContain('disease-evidence-standard-not-met')
  })

  it('keeps mechanism-only references non-commercial', () => {
    const result = evaluatePageQualityGate('mechanism-reference', {
      evidenceComplete: false,
      safetyComplete: false,
      sourcingComplete: false,
      commercialFramingPresent: true,
    })
    expect(result.publishable).toBe(false)
    expect(result.commercialAllowed).toBe(false)
    expect(result.failures).toContain('mechanism-reference-has-commercial-framing')
  })
})
