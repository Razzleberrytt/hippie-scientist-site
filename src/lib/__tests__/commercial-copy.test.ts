import { describe, expect, it } from 'vitest'
import { getPublicProductRationale } from '../commercial-copy'

describe('getPublicProductRationale', () => {
  it('removes the product-specific first-pass and review claim from Natrol melatonin copy', () => {
    const result = getPublicProductRationale({
      brand: 'Natrol',
      title: 'Natrol Melatonin 5 mg Fast Dissolve',
      rationale: 'Best overall for a fast-dissolve tablet that avoids first-pass metabolism; well-reviewed.',
    })

    expect(result).toMatch(/fast-dissolve format/i)
    expect(result).not.toMatch(/first-pass|well-reviewed/i)
  })

  it('removes the sweeping researcher-preference claim from NOW melatonin copy', () => {
    const result = getPublicProductRationale({
      brand: 'NOW Foods',
      title: 'NOW Melatonin 3 mg',
      rationale: 'Budget pick for a common 3 mg melatonin capsule — lower dose preferred by most sleep researchers.',
    })

    expect(result).toMatch(/simple 3 mg melatonin capsule/i)
    expect(result).not.toMatch(/most sleep researchers/i)
  })

  it('falls back when generic catalog copy makes a pharmacokinetic superiority claim', () => {
    const result = getPublicProductRationale({
      brand: 'Example',
      title: 'Example Extract',
      rationale: 'Premium liquid extract for faster absorption and flexible dosing.',
    })

    expect(result).toMatch(/product-format example/i)
    expect(result).not.toMatch(/faster absorption/i)
  })

  it('preserves objective low-risk rationale copy', () => {
    const rationale = 'Budget pick for a simple single-ingredient capsule with clear serving-size labeling.'
    expect(getPublicProductRationale({ rationale })).toBe(rationale)
  })
})
