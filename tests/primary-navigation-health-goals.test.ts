import { describe, expect, it } from 'vitest'
import { primaryNavigation } from '@/lib/primary-navigation'

describe('primary navigation health goals', () => {
  it('keeps stress and anxiety as distinct canonical goal destinations', () => {
    const goals = primaryNavigation.find((item) => item.label === 'Goals')

    expect(goals?.children).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: 'Stress', href: '/goals/stress' }),
        expect.objectContaining({ label: 'Anxiety', href: '/goals/anxiety' }),
      ])
    )
  })
})
