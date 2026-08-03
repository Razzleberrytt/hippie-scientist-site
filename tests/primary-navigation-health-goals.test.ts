import { describe, expect, it } from 'vitest'
import { primaryNavigation } from '@/lib/primary-navigation'

describe('primary navigation health goals', () => {
  it('keeps stress and anxiety as distinct destinations', () => {
    const topics = primaryNavigation.find((item) => item.label === 'Topics')

    expect(topics?.children).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: 'Stress', href: '/guides/stress' }),
        expect.objectContaining({ label: 'Anxiety', href: '/guides/anxiety' }),
      ])
    )
  })
})
