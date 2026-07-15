import { describe, expect, it } from 'vitest'
import { buildCompoundTrustGuidance } from '@/lib/compound-trust'

describe('buildCompoundTrustGuidance', () => {
  it('separates the safety evidence label from the practical detail', () => {
    const result = buildCompoundTrustGuidance(
      {
        safety: 'Safety evidence: limited human evidence for one formulation. Pregnancy and medication-interaction safety remain insufficient.',
      },
      [],
    )

    expect(result.evidenceLabel).toBe('limited human evidence for one formulation')
    expect(result.safetyDetail).toBe('Pregnancy and medication-interaction safety remain insufficient.')
    expect(result.avoidSummary).toContain('No specific evidence-backed contraindication')
    expect(result.providerGuidance).toContain('pregnant or breastfeeding')
    expect(result.providerGuidance).toContain('relevant medications')
  })

  it('keeps explicit contraindications separate from medication interactions', () => {
    const result = buildCompoundTrustGuidance(
      {
        safety: 'Safety evidence: systematic-review evidence. Use is strain- and host-specific.',
        interactions: ['warfarin'],
      },
      ['Severe immunocompromise'],
    )

    expect(result.avoidSummary).toBe('Severe immunocompromise')
    expect(result.providerGuidance).toBe('you take: warfarin.')
  })

  it('does not invent a trust label for unreviewed runtime copy', () => {
    const result = buildCompoundTrustGuidance({ safety: 'General caution.' }, [])

    expect(result.evidenceLabel).toBe('')
    expect(result.safetyDetail).toBe('General caution.')
    expect(result.providerGuidance).toBe('')
  })
})
