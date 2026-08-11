import { describe, expect, it } from 'vitest'
import { affiliateRationaleForDisplay } from '../affiliate-copy'

describe('affiliateRationaleForDisplay', () => {
  it('removes product-specific first-pass metabolism claims from fast-dissolve affiliate copy', () => {
    const result = affiliateRationaleForDisplay(
      'Natrol Melatonin 5 mg Fast Dissolve',
      'Best overall for a fast-dissolve tablet that avoids first-pass metabolism; well-reviewed.',
    )

    expect(result).toContain('fast-dissolve format')
    expect(result).toContain('5 mg dose')
    expect(result).toContain('not evidence of superior absorption or better clinical outcomes')
    expect(result).not.toMatch(/first[- ]pass metabolism/i)
    expect(result).not.toMatch(/well-reviewed/i)
  })

  it('removes sweeping researcher-preference claims from unsourced retail rationale', () => {
    const result = affiliateRationaleForDisplay(
      'NOW Melatonin 3 mg',
      'Budget pick for a common 3 mg melatonin capsule — lower dose preferred by most sleep researchers.',
    )

    expect(result).toContain('3 mg serving')
    expect(result).not.toMatch(/preferred by most sleep researchers/i)
  })

  it('removes unsourced absorption or bioavailability superiority from retail rationale', () => {
    const faster = affiliateRationaleForDisplay(
      'Example Liquid Extract',
      'Premium liquid extract for faster absorption and flexible dosing.',
    )
    const superior = affiliateRationaleForDisplay(
      'Example Phytosome',
      'Premium form with superior bioavailability over the standard extract.',
    )

    expect(faster).not.toMatch(/faster absorption/i)
    expect(superior).not.toMatch(/superior bioavailability/i)
    expect(faster).toMatch(/product-format example/i)
    expect(superior).toMatch(/product-format example/i)
  })

  it('removes dynamic popularity claims when no live source is attached to the card', () => {
    const result = affiliateRationaleForDisplay(
      'Example Product',
      'Simple format and well-reviewed by shoppers.',
    )

    expect(result).not.toMatch(/well-reviewed/i)
  })

  it('preserves ordinary sourcing rationale', () => {
    expect(
      affiliateRationaleForDisplay(
        'Jarrow Theanine 200 mg',
        'Best overall pick for a simple 200 mg L-theanine capsule format.',
      ),
    ).toBe('Best overall pick for a simple 200 mg L-theanine capsule format.')
  })
})
