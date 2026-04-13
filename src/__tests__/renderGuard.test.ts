import { describe, expect, it } from 'vitest'
import { buildUniqueDetailCopy, sanitizeRenderChips, sanitizeRenderList } from '@/lib/renderGuard'

describe('renderGuard', () => {
  it('dedupes list values and drops broken fragments', () => {
    expect(sanitizeRenderList(['focus', 'Focus', 'nan', 'an', ''])).toEqual(['focus'])
  })

  it('strips trailing punctuation from chips and dedupes', () => {
    expect(sanitizeRenderChips(['anti-inflammatory...', 'anti-inflammatory;', 'focus!!'], 5)).toEqual([
      'anti-inflammatory',
      'focus',
    ])
  })

  it('collapses repeated section meaning', () => {
    expect(
      buildUniqueDetailCopy({
        hero: 'Supports calm and sleep quality.',
        overview: 'Supports calm and sleep quality',
        context: 'Used when stress drives poor sleep.',
        mechanism: 'Used when stress drives poor sleep',
      }),
    ).toEqual({
      hero: 'Supports calm and sleep quality.',
      overview: '',
      context: 'Used when stress drives poor sleep.',
      mechanism: '',
    })
  })
})
