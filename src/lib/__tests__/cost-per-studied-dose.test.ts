import { describe, expect, it } from 'vitest'

import { calculateCostPerStudiedDose } from '@/src/lib/cost-per-studied-dose'

const baseInput = {
  priceUsd: 30,
  servingsPerContainer: 60,
  amountPerServing: 500,
  amountUnit: 'mg' as const,
  studiedDose: 1,
  studiedDoseUnit: 'g' as const,
  productDataReliable: true,
  formulationMatchesEvidence: true,
  reviewedAt: '2026-08-01',
  now: new Date('2026-08-15T12:00:00Z'),
}

describe('calculateCostPerStudiedDose', () => {
  it('calculates cost only from reliable, fresh, formulation-matched data', () => {
    expect(calculateCostPerStudiedDose(baseInput)).toEqual({
      available: true,
      costUsd: 1,
      servingsNeeded: 2,
      costPerServingUsd: 0.5,
      studiedDoseMg: 1000,
      amountPerServingMg: 500,
    })
  })

  it('normalizes mcg, mg, and g before calculating', () => {
    const result = calculateCostPerStudiedDose({
      ...baseInput,
      amountPerServing: 250_000,
      amountUnit: 'mcg',
      studiedDose: 0.5,
      studiedDoseUnit: 'g',
    })

    expect(result.available).toBe(true)
    if (result.available) expect(result.servingsNeeded).toBe(2)
  })

  it('fails closed when product data is not reliable', () => {
    expect(calculateCostPerStudiedDose({ ...baseInput, productDataReliable: false })).toEqual({
      available: false,
      reason: 'unreliable-product-data',
    })
  })

  it('fails closed when the product formulation does not match the studied evidence', () => {
    expect(calculateCostPerStudiedDose({ ...baseInput, formulationMatchesEvidence: false })).toEqual({
      available: false,
      reason: 'formulation-does-not-match-evidence',
    })
  })

  it('fails closed on stale product economics', () => {
    expect(calculateCostPerStudiedDose({ ...baseInput, reviewedAt: '2025-01-01' })).toEqual({
      available: false,
      reason: 'stale-product-data',
    })
  })

  it('rejects missing or impossible numeric inputs', () => {
    expect(calculateCostPerStudiedDose({ ...baseInput, priceUsd: 0 })).toEqual({
      available: false,
      reason: 'missing-or-invalid-price',
    })
    expect(calculateCostPerStudiedDose({ ...baseInput, servingsPerContainer: -2 })).toEqual({
      available: false,
      reason: 'missing-or-invalid-package-quantity',
    })
    expect(calculateCostPerStudiedDose({ ...baseInput, amountPerServing: Number.NaN })).toEqual({
      available: false,
      reason: 'missing-or-invalid-amount-per-serving',
    })
  })
})
