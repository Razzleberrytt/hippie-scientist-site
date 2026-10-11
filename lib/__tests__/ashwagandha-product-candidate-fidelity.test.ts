import { describe, expect, it } from 'vitest'
import { revenueProductSets } from '../../config/revenue-products'

// Draft catalog data only: these tests do not assert independent editorial
// approval, Amazon listing validity, or permission to display product links.
describe('ashwagandha candidate product identity', () => {
  const products = revenueProductSets.ashwagandha?.products ?? []

  it('keeps the draft candidate products single-ingredient ashwagandha extracts', () => {
    expect(products.map((product) => product.title)).toEqual([
      'NOW Ashwagandha 450 mg',
      'Jarrow KSM-66 Ashwagandha',
    ])
    expect(products.every((product) => product.asin)).toBe(true)
  })

  it('does not claim premium or best-overall clinical superiority without substantiation', () => {
    const copy = products.map((product) => product.rationale || '').join('\n')
    expect(copy).not.toMatch(/\bbest overall\b|\bpremium\b|\bpractitioner-style\b/i)
    expect(copy).toContain('300 mg of KSM-66')
    expect(copy).toContain('450 mg of standardized root-and-leaf')
  })

  it('excludes the multi-ingredient Thorne Stress Balance from the standalone herb set', () => {
    expect(products.some((product) => /thorne stress balance/i.test(product.title || ''))).toBe(false)
  })
})
