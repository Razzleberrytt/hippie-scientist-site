import { describe, expect, it } from 'vitest'
import {
  goalContainsRestrictedIngredient,
  isRestrictedIngredient,
  isRestrictedRecord,
} from '../restricted-ingredients'

describe('restricted ingredient governance', () => {
  it('matches restricted ingredients on normalized token boundaries', () => {
    expect(isRestrictedIngredient('kava')).toBe(true)
    expect(isRestrictedIngredient('Piper methysticum extract')).toBe(true)
    expect(isRestrictedIngredient('standardized kavalactones')).toBe(true)

    // Short restricted tokens must not trigger merely because their letters are
    // embedded inside an unrelated word.
    expect(isRestrictedIngredient('balsam')).toBe(false)
  })

  it('keeps explicit restricted identities and constituents blocked', () => {
    expect(isRestrictedRecord({ slug: 'kava' })).toBe(true)
    expect(isRestrictedRecord({ botanical_name: 'Piper methysticum' })).toBe(true)
    expect(isRestrictedRecord({ slug: 'example', active_constituents: ['kavalactones'] })).toBe(true)
    expect(isRestrictedRecord({ slug: 'example', do_not_monetize: true })).toBe(true)
  })

  it('does not reclassify a benign entity solely because educational prose mentions a restricted ingredient', () => {
    expect(isRestrictedRecord({
      slug: 'vitamin-d',
      name: 'Vitamin D',
      summary: 'Educational comparison text mentions kava in a separate context.',
      description: 'This page may compare vitamin D with kava without making kava the product target.',
      safety: 'Avoid assuming another ingredient such as kava has the same safety profile.',
    })).toBe(false)
  })

  it('still blocks restricted terms in goal copy because the goal itself is the user-facing target', () => {
    expect(goalContainsRestrictedIngredient({
      slug: 'stress-support',
      title: 'Stress support',
      description: 'Find kava options for stress.',
    })).toBe(true)
  })
})