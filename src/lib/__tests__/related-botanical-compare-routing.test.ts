import { describe, expect, it } from 'vitest'
import { getValidComparisonSlug } from '@/lib/comparison-utils'

describe('related botanical comparison routing', () => {
  it('emits a comparison only when a static route is actually built', () => {
    expect(getValidComparisonSlug('ashwagandha', 'rhodiola')).toBe('rhodiola-vs-ashwagandha')
    expect(getValidComparisonSlug('guarana', 'yerba-mate')).toBe('guarana-vs-yerba-mate')
    expect(getValidComparisonSlug('coptis', 'goldenseal')).toBe('coptis-vs-goldenseal')
    expect(getValidComparisonSlug('oregano', 'thyme')).toBe('oregano-vs-thyme')
    expect(getValidComparisonSlug('ashwagandha', 'lemon-balm')).toBeUndefined()
  })

  it('maps canonical profile slugs to readable comparison routes', () => {
    expect(getValidComparisonSlug('panax-quinquefolius', 'panax-ginseng'))
      .toBe('american-ginseng-vs-asian-ginseng')
    expect(getValidComparisonSlug('coffea-arabica', 'guarana'))
      .toBe('coffee-vs-guarana')
  })
})
