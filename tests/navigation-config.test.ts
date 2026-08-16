import { describe, expect, it } from 'vitest'

import { coreGoals } from '@/lib/core-goals'
import { generateDynamicBreadcrumbs } from '@/lib/navigation-config'

describe('navigation breadcrumbs', () => {
  it('labels the start router', () => {
    expect(generateDynamicBreadcrumbs('/start')).toEqual([
      { label: 'Home', href: '/', current: false },
      { label: 'Start Here', href: '/start', current: true },
    ])
  })

  it('labels first-class guide hubs distinctly', () => {
    expect(generateDynamicBreadcrumbs('/guides/stress')).toEqual([
      { label: 'Home', href: '/', current: false },
      { label: 'Topics & Guides', href: '/guides', current: false },
      { label: 'Stress', href: '/guides/stress', current: true },
    ])

    expect(generateDynamicBreadcrumbs('/guides/anxiety')).toEqual([
      { label: 'Home', href: '/', current: false },
      { label: 'Topics & Guides', href: '/guides', current: false },
      { label: 'Anxiety', href: '/guides/anxiety', current: true },
    ])

    expect(generateDynamicBreadcrumbs('/guides/metabolic-health')).toEqual([
      { label: 'Home', href: '/', current: false },
      { label: 'Topics & Guides', href: '/guides', current: false },
      { label: 'Metabolic Health', href: '/guides/metabolic-health', current: true },
    ])
  })

  it('uses the canonical goal taxonomy for goal breadcrumbs', () => {
    for (const goal of coreGoals) {
      const href = goal.href.replace(/\/$/, '')
      expect(generateDynamicBreadcrumbs(href)).toEqual([
        { label: 'Home', href: '/', current: false },
        { label: 'Supplement Goals', href: '/goals', current: false },
        { label: goal.label, href, current: true },
      ])
    }
  })
})
