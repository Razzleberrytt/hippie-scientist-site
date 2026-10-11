import { describe, it, expect } from 'vitest'
import { getProductPicks, groupProductPicks } from '../product-ranking'

describe('getProductPicks', () => {
  it('returns only picks matching the given compound slug', () => {
    const picks = getProductPicks('turmeric')

    expect(picks.length).toBeGreaterThan(0)
    expect(picks.every(p => p.compound_slug === 'turmeric')).toBe(true)
  })

  it('returns an empty array for a slug with no product picks', () => {
    expect(getProductPicks('not-a-real-compound-slug')).toEqual([])
  })

  it('fails closed for restricted product slugs regardless of configured picks', () => {
    expect(getProductPicks('kava')).toEqual([])
    expect(getProductPicks('kratom')).toEqual([])
    expect(getProductPicks('7-oh')).toEqual([])
  })
})

describe('groupProductPicks', () => {
  it('groups eligible fixture picks into top/budget/premium by type', () => {
    const grouped = groupProductPicks([
      { type: 'top', name: 'Reviewed top' },
      { type: 'budget', name: 'Reviewed budget' },
      { type: 'premium', name: 'Reviewed premium' },
    ])

    expect(grouped.top?.type).toBe('top')
    expect(grouped.budget?.type).toBe('budget')
    expect(grouped.premium?.type).toBe('premium')
  })

  it('does not synthesize missing catalog products to fill empty categories', () => {
    const grouped = groupProductPicks(getProductPicks('turmeric'))

    const original = getProductPicks('turmeric')
    for (const type of ['top', 'budget', 'premium'] as const) {
      expect(grouped[type]).toEqual(original.find(p => p.type === type))
    }
  })

  it('leaves a bucket undefined when no pick of that type exists', () => {
    const grouped = groupProductPicks([{ type: 'top', name: 'Only Pick' }])

    expect(grouped.top).toBeDefined()
    expect(grouped.budget).toBeUndefined()
    expect(grouped.premium).toBeUndefined()
  })

  it('returns all-undefined buckets for an empty input array', () => {
    expect(groupProductPicks([])).toEqual({ top: undefined, budget: undefined, premium: undefined })
  })
})
