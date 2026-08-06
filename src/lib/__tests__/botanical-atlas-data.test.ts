import { describe, expect, it } from 'vitest'
import { toAtlasRecord } from '@/lib/botanical-atlas-data'
import type { RuntimeRecord } from '@/types/content'

const record = (overrides: Partial<RuntimeRecord>): RuntimeRecord => ({
  slug: 'test-herb',
  name: 'Test Herb',
  ...overrides,
} as RuntimeRecord)

describe('Botanical Activity Atlas runtime fallbacks', () => {
  it('combines safety fields instead of stopping at an empty array', () => {
    const result = toAtlasRecord(record({
      safety_flags: [],
      safety: 'May cause sedation and interact with anticoagulants.',
    }))

    expect(result.safety).toContain('Sedation')
    expect(result.safety).toContain('Bleeding')
  })

  it('infers known chemical families from named active compounds', () => {
    const result = toAtlasRecord(record({
      activeCompounds: ['caffeine', 'theobromine'],
    }))

    expect(result.compoundClasses).toEqual(['Methylxanthines'])
  })

  it('does not turn unknown compound names into fake chemical classes', () => {
    const result = toAtlasRecord(record({
      activeCompounds: ['mystery constituent'],
    }))

    expect(result.compoundClasses).toEqual([])
  })

  it('recognizes additional noticeability and timing aliases', () => {
    const result = toAtlasRecord(record({
      noticeability: 'noticeable',
      onsetTime: '30 minutes',
      effectDuration: '4 hours',
    }))

    expect(result.intensity).toBe('Moderate')
    expect(result.onset).toBe('30 minutes')
    expect(result.duration).toBe('4 hours')
  })

  it('combines effects from multiple populated fields', () => {
    const result = toAtlasRecord(record({
      primary_effects: [],
      effects: ['calming'],
      benefits: ['sleep support'],
    }))

    expect(result.effects).toContain('Calming')
    expect(result.effects).toContain('Sedating / sleep')
  })

  it('enriches discovery effects from structured mechanisms', () => {
    const result = toAtlasRecord(record({
      effects: [],
      mechanisms: ['GABA-A positive allosteric modulation', 'acetylcholinesterase inhibition'],
      canonical_mechanisms: ['Serotonergic signaling'],
    }))

    expect(result.effects).toContain('Calming')
    expect(result.effects).toContain('Cognition / focus')
    expect(result.effects).toContain('Mood')
  })

  it('keeps explicit effects and deduplicates inferred matches', () => {
    const result = toAtlasRecord(record({
      effects: ['calming'],
      mechanisms: ['GABA-A modulation', 'HPA axis modulation'],
    }))

    expect(result.effects.filter((effect) => effect === 'Calming')).toHaveLength(1)
  })

  it('does not expose unknown mechanism text as an effect label', () => {
    const result = toAtlasRecord(record({
      mechanisms: ['Unmapped experimental pathway XYZ'],
    }))

    expect(result.effects).toEqual([])
  })
})
