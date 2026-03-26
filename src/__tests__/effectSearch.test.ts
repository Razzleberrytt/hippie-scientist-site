import { describe, expect, it } from 'vitest'
import { buildEffectIndex, normalizeEffectTerm, rankHerbsByEffect } from '@/utils/effectSearch'
import type { Herb } from '@/types'

const herbs: Herb[] = [
  {
    id: 'h1',
    slug: 'calm-herb',
    common: 'Calm Herb',
    effects: ['calming', 'sleep support'],
    confidence: 'high',
    compounds: ['a', 'b', 'c'],
  },
  {
    id: 'h2',
    slug: 'focus-herb',
    common: 'Focus Herb',
    effects: ['focus', 'clarity'],
    confidence: 'medium',
    compounds: ['x'],
  },
]

describe('effectSearch', () => {
  it('normalizes synonyms to a canonical term', () => {
    expect(normalizeEffectTerm('calming')).toBe('relaxation')
    expect(normalizeEffectTerm('anxiolytic')).toBe('relaxation')
    expect(normalizeEffectTerm('cognition')).toBe('focus')
    expect(normalizeEffectTerm('nighttime support')).toBe('sleep')
  })

  it('builds an effect index from herb effects', () => {
    const index = buildEffectIndex(herbs)
    expect(index.has('relaxation')).toBe(true)
    expect(index.get('relaxation')?.has('calm-herb')).toBe(true)
  })

  it('ranks herbs by effect match, confidence, and compounds', () => {
    const ranked = rankHerbsByEffect(herbs, 'relaxation')
    expect(ranked).toHaveLength(1)
    expect(ranked[0].herb.slug).toBe('calm-herb')
    expect(ranked[0].confidence).toBe('high')
    expect(ranked[0].compoundSupportCount).toBe(3)
  })
})
