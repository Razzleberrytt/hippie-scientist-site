import { describe, expect, it } from 'vitest'
import { primaryNavigation } from '@/lib/primary-navigation'

describe('primary navigation health goals', () => {
  it('keeps stress and anxiety as distinct destinations under Goals', () => {
    const goals = primaryNavigation.find((item) => item.label === 'Goals')

    expect(goals?.children).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: 'Stress', href: '/guides/stress' }),
        expect.objectContaining({ label: 'Anxiety', href: '/guides/anxiety' }),
      ])
    )
  })
})
