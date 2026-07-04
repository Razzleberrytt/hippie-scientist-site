import { describe, it, expect } from 'vitest'
import { getProductPicks, groupProductPicks } from '../../../lib/product-ranking'

describe('getProductPicks', () => {
  it('returns only picks matching the given compound slug', () => {
    const picks = getProductPicks('turmeric')

    expect(picks.length).toBeGreaterThan(0)
    expect(picks.every(p => p.compound_slug === 'turmeric')).toBe(true)
  })

  it('returns an empty array for a slug with no product picks', () => {
    expect(getProductPicks('not-a-real-compound-slug')).toEqual([])
  })
})

describe('groupProductPicks', () => {
  it('groups picks into top/budget/premium by type', () => {
    const picks = getProductPicks('turmeric')
    const grouped = groupProductPicks(picks)

    expect(grouped.top?.type).toBe('top')
    expect(grouped.budget?.type).toBe('budget')
    expect(grouped.premium?.type).toBe('premium')
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
