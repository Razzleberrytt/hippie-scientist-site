import { describe, expect, it } from 'vitest'
import { revenueProductSets } from '../../config/revenue-products'

// Catalog source-fidelity only. This does NOT attest human approval, Amazon
// listing validity, third-party certification, or eligibility for live commerce.
describe('turmeric and creatine candidate catalog identity', () => {
  const turmeric = revenueProductSets.turmeric.products
  const creatine = revenueProductSets.creatine.products

  it('holds unmatched NOW Turmeric 400 mg out of the candidate catalog', () => {
    expect(turmeric.some((p) => /now turmeric 400 mg/i.test(p.title || ''))).toBe(false)
    expect(turmeric.some((p) => /thorne/i.test(p.brand || ''))).toBe(true)
    expect(turmeric.some((p) => /life extension/i.test(p.brand || ''))).toBe(true)
  })

  it('does not imply unverified Creapure certification for every ON variant', () => {
    const on = creatine.find((p) => p.brand === 'Optimum Nutrition')
    expect(on?.title).toMatch(/micronized creatine/i)
    expect(on?.rationale).toMatch(/5 g creatine per serving/i)
    expect(on?.rationale).not.toMatch(/creapure.sourced|best overall/i)
    expect(on?.affiliateUrl).not.toMatch(/creapure/i)
  })

  it('does not claim outcome superiority from Meriva absorption research', () => {
    const thorne = turmeric.find((p) => p.brand === 'Thorne')
    expect(thorne?.rationale).toMatch(/phospholipid.bound curcumin/i)
    expect(thorne?.rationale).not.toMatch(/best overall|29x|clinically validated/i)
  })

  it('maps corroborated ASIN candidate IDs to the exact current product sets', () => {
    const now = creatine.find((p) => p.brand === 'NOW Foods')
    const on = creatine.find((p) => p.brand === 'Optimum Nutrition')
    const lifeExtension = turmeric.find((p) => p.brand === 'Life Extension')
    expect(now?.asin).toBe('B0013OUOBM')
    expect(now?.affiliateUrl).toContain('/dp/B0013OUOBM')
    expect(on?.asin).toBe('B002DYIZEO')
    expect(on?.affiliateUrl).toContain('/dp/B002DYIZEO')
    expect(lifeExtension?.asin).toBe('B000X9P5GM')
    expect(lifeExtension?.affiliateUrl).toContain('/dp/B000X9P5GM')
  })

  it('does not invent an ASIN for unverified Thorne creatine or Meriva-SR', () => {
    const thorneCreatine = creatine.find((p) => p.brand === 'Thorne')
    const meriva = turmeric.find((p) => p.brand === 'Thorne')
    expect(thorneCreatine?.asin).toBeUndefined()
    expect(meriva?.asin).toBeUndefined()
  })
})
