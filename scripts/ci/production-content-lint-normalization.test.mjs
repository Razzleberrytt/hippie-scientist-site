import { describe, expect, it } from 'vitest'
import { normalizeH1ForUniqueness } from './production-content-lint-normalization.mjs'

describe('production content H1 normalization', () => {
  it('keeps distinct non-Latin localized headings distinct', () => {
    const headings = [
      'أشواغاندا (Withania somnifera): الأدلة والسلامة',
      'Ашваганда (Withania somnifera): доказательства и безопасность',
      'อัชวากันธา (Withania somnifera): หลักฐานและความปลอดภัย',
    ]

    const normalized = headings.map(normalizeH1ForUniqueness)
    expect(new Set(normalized).size).toBe(headings.length)
    expect(normalized.every((value) => value.includes('withania somnifera'))).toBe(true)
  })

  it('still collapses genuine duplicates across case, punctuation, and compatibility forms', () => {
    expect(normalizeH1ForUniqueness('Ashwagandha — Evidence & Safety')).toBe(
      normalizeH1ForUniqueness('  ASHWAGANDHA: evidence + safety  '),
    )
    expect(normalizeH1ForUniqueness('Ａｓｈｗａｇａｎｄｈａ 2026')).toBe(
      normalizeH1ForUniqueness('ashwagandha 2026'),
    )
  })
})
