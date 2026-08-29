import { describe, expect, it } from 'vitest'
import { getValidComparisonSlug } from '@/lib/comparison-utils'

describe('related botanical comparison routing', () => {
  it('emits a comparison only when a static route is actually built', () => {
    expect(getValidComparisonSlug('ashwagandha', 'rhodiola')).toBe('rhodiola-vs-ashwagandha')
    expect(getValidComparisonSlug('guarana', 'yerba-mate')).toBe('guarana-vs-yerba-mate')
    expect(getValidComparisonSlug('guarana', 'guayusa')).toBe('guarana-vs-guayusa')
    expect(getValidComparisonSlug('coptis', 'goldenseal')).toBe('coptis-vs-goldenseal')
    expect(getValidComparisonSlug('coptis', 'phellodendron')).toBe('coptis-vs-phellodendron')
    expect(getValidComparisonSlug('oregano', 'thyme')).toBe('oregano-vs-thyme')
    expect(getValidComparisonSlug('ashwagandha', 'lemon-balm')).toBeUndefined()
  })

  it('maps canonical profile slugs to readable comparison routes', () => {
    expect(getValidComparisonSlug('panax-quinquefolius', 'panax-ginseng'))
      .toBe('american-ginseng-vs-asian-ginseng')
    expect(getValidComparisonSlug('coffea-arabica', 'guarana'))
      .toBe('coffee-vs-guarana')
    expect(getValidComparisonSlug('coffea-arabica', 'camellia-sinensis'))
      .toBe('coffee-vs-green-tea')
    expect(getValidComparisonSlug('hypericum-perforatum', 'saffron'))
      .toBe('st-johns-wort-vs-saffron')
  })
})
