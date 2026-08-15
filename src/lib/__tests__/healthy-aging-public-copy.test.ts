import { describe, expect, it } from 'vitest'

import { goals } from '@/data/goals'
import { getPublicGoal } from '@/src/lib/goal-public-copy'

describe('healthy-aging public copy', () => {
  it('keeps longevity claims tied to human outcomes rather than mechanism promises', () => {
    const source = goals.find((goal) => goal.slug === 'longevity')
    expect(source).toBeTruthy()

    const goal = getPublicGoal(source!)
    const publicText = JSON.stringify({
      title: goal.title,
      description: goal.description,
      quickPicks: goal.quickPicks,
      options: goal.options.map(({ bestFor, evidence, speed, whyPeopleStop }) => ({
        bestFor,
        evidence,
        speed,
        whyPeopleStop,
      })),
    }).toLowerCase()

    expect(publicText).toContain('no established human lifespan benefit')
    expect(publicText).toContain('not evidence that a supplement extends human lifespan')
    expect(publicText).not.toContain('anti-aging mitochondrial support')
    expect(publicText).not.toContain('senolytic aging support')
    expect(publicText).not.toContain('sirtuin pathway activation and antioxidant support')
  })
})
