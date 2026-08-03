import { describe, expect, it } from 'vitest'
import { getGoalCompareLinks, getGoalsForEntity } from '@/src/lib/goal-hub-links'

describe('goal hub canonical links', () => {
  it('routes stress entities to the dedicated stress hub', () => {
    const links = getGoalsForEntity('ashwagandha')

    expect(links).toContainEqual({ label: 'stress', href: '/guides/stress/' })
    expect(links).toContainEqual({ label: 'anxiety', href: '/guides/anxiety/' })
  })

  it('uses the canonical rhodiola versus ashwagandha comparison route', () => {
    const stressLinks = getGoalCompareLinks('stress')
    const anxietyLinks = getGoalCompareLinks('anxiety')
    const energyLinks = getGoalCompareLinks('energy')

    for (const links of [stressLinks, anxietyLinks, energyLinks]) {
      expect(links.some((link) => link.href === '/guides/compare/rhodiola-vs-ashwagandha/')).toBe(true)
      expect(links.some((link) => link.href === '/guides/compare/ashwagandha-vs-rhodiola/')).toBe(false)
    }
  })
})
