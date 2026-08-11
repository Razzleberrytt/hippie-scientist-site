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

  it('preserves ordinary sourcing rationale', () => {
    expect(
      affiliateRationaleForDisplay(
        'Jarrow Theanine 200 mg',
        'Best overall pick for a simple 200 mg L-theanine capsule format.',
      ),
    ).toBe('Best overall pick for a simple 200 mg L-theanine capsule format.')
  })
})
