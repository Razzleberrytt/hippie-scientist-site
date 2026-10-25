import { describe, expect, it } from 'vitest'
import { applyLicoriceSafetyFloor, LICORICE_SAFETY_REASON } from './licorice-safety-floor.mjs'

const original = {
  reviewStatus: 'approved',
  legalRisk: 'none',
  medicalRisk: 'low',
  monetizationAllowed: true,
  indexingAllowed: true,
  recommendationAllowed: true,
  requiresHumanReview: false,
  reason: '',
}

describe('source-backed licorice recommendation safety floor', () => {
  it('blocks consumer recommendation and monetization after regeneration', () => {
    const result = applyLicoriceSafetyFloor('herbs', 'licorice', original)
    expect(result).toEqual({
      ...original,
      medicalRisk: 'high',
      monetizationAllowed: false,
      recommendationAllowed: false,
      requiresHumanReview: true,
      reason: LICORICE_SAFETY_REASON,
    })
    expect(result.indexingAllowed).toBe(true)
    expect(result.reviewStatus).toBe('approved')
    expect(result.legalRisk).toBe('none')
    expect(original.monetizationAllowed).toBe(true)
  })
  it('is idempotent and does not promote existing stricter indexing or review holds', () => {
    const hold = { ...original, indexingAllowed: false, reviewStatus: 'needs_review' }
    const once = applyLicoriceSafetyFloor('herbs', 'licorice', hold)
    expect(applyLicoriceSafetyFloor('herbs', 'licorice', once)).toEqual(once)
    expect(once.indexingAllowed).toBe(false)
    expect(once.reviewStatus).toBe('needs_review')
  })
  it('holds each whole-licorice alias without changing indexing', () => {
    for (const slug of ['licorice', 'licorice-root', 'glycyrrhiza-glabra']) {
      const result = applyLicoriceSafetyFloor('herbs', slug, original)
      expect(result.medicalRisk).toBe('high')
      expect(result.recommendationAllowed).toBe(false)
      expect(result.monetizationAllowed).toBe(false)
      expect(result.requiresHumanReview).toBe(true)
      expect(result.indexingAllowed).toBe(original.indexingAllowed)
    }
  })
  it('never affects other herbs, DGL-specific records, or compounds', () => {
    expect(applyLicoriceSafetyFloor('herbs', 'ashwagandha', original)).toBe(original)
    expect(applyLicoriceSafetyFloor('herbs', 'dgl', original)).toBe(original)
    expect(applyLicoriceSafetyFloor('herbs', 'deglycyrrhizinated-licorice', original)).toBe(original)
    expect(applyLicoriceSafetyFloor('compounds', 'licorice', original)).toBe(original)
    expect(applyLicoriceSafetyFloor('compounds', 'glycyrrhiza-glabra', original)).toBe(original)
  })
  it('fails closed instead of approving missing licorice governance', () => {
    expect(() => applyLicoriceSafetyFloor('herbs', 'licorice', null)).toThrow(/unavailable/)
  })
})
