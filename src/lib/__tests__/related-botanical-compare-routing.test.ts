import { describe, expect, it } from 'vitest'
import { getValidComparisonSlug } from '@/lib/comparison-utils'

describe('related botanical comparison routing', () => {
  it('emits a comparison only when a static route is actually built', () => {
    expect(getValidComparisonSlug('ashwagandha', 'rhodiola')).toBe('rhodiola-vs-ashwagandha')
    expect(getValidComparisonSlug('ashwagandha', 'lemon-balm')).toBeUndefined()
  })
})
