import { describe, expect, it } from 'vitest'

import { getStackRecommendations } from '../recommendation-engine'

describe('profile stack recommendation safety boundary', () => {
  it('withholds legacy product-backed stack pairings until evidence and interactions are audited', () => {
    for (const slug of ['ashwagandha', 'magnesium', '5-htp', 'sam-e', 'valerian', 'berberine']) {
      expect(getStackRecommendations(slug)).toEqual([])
    }
  })
})
