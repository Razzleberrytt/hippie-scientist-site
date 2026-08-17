import { describe, expect, it } from 'vitest'

import { getGoalsForEntity } from '../goal-hub-links'

describe('goal-hub-links — THS-0551', () => {
  it('preserves editorial priority for flagship herb pathways', () => {
    expect(getGoalsForEntity('ashwagandha')).toEqual([
      { label: 'stress', href: '/guides/stress/' },
      { label: 'anxiety', href: '/guides/anxiety/' },
      { label: 'sleep', href: '/guides/sleep/' },
      { label: 'testosterone support', href: '/goals/testosterone-support/' },
    ])
  })

  it('derives relevant goal links for herbs that were not in the manual whitelist', () => {
    const links = getGoalsForEntity('ginger')

    expect(links).toContainEqual({
      label: 'inflammation',
      href: '/guides/best/supplements-for-joint-support/',
    })
    expect(links).toContainEqual({
      label: 'gut health',
      href: '/goals/gut-health/',
    })
  })

  it('uses a focused link budget rather than emitting every matching goal', () => {
    expect(getGoalsForEntity('magnesium').length).toBeLessThanOrEqual(4)
  })

  it('does not invent goal pathways for an entity absent from goal data and editorial overrides', () => {
    expect(getGoalsForEntity('not-a-real-herb')).toEqual([])
  })
})
