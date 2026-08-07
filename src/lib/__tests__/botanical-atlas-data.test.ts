import { describe, expect, it } from 'vitest'
import { toAtlasRecord } from '@/lib/botanical-atlas-data'
import type { RuntimeRecord } from '@/types/content'

const record = (overrides: Record<string, unknown>): RuntimeRecord => ({
  slug: 'test-herb',
  name: 'Test Herb',
  ...overrides,
} as RuntimeRecord)

describe('Botanical Activity Atlas runtime fallbacks', () => {
  it('combines safety fields instead of stopping at an empty array', () => {
    const result = toAtlasRecord(record({ safety_flags: [], safety: 'May cause sedation and interact with anticoagulants.' }))
    expect(result.safety).toContain('Sedation')
    expect(result.safety).toContain('Bleeding')
  })

  it('infers known chemical families from named active compounds', () => {
    const result = toAtlasRecord(record({ activeCompounds: ['caffeine', 'theobromine'] }))
    expect(result.compoundClasses).toEqual(['Methylxanthines'])
  })

  it('reads snake_case runtime identity and chemistry fields', () => {
    const result = toAtlasRecord(record({
      scientific_name: 'Morus alba',
      active_constituents: ['caffeine'],
      compound_profile: ['theobromine'],
      related_compounds: ['theophylline'],
    }))

    expect(result.scientificName).toBe('Morus alba')
    expect(result.compounds).toEqual(['caffeine', 'theobromine', 'theophylline'])
    expect(result.compoundClasses).toEqual(['Methylxanthines'])
  })

  it('does not turn unknown compound names into fake chemical classes', () => {
    const result = toAtlasRecord(record({ activeCompounds: ['mystery constituent'] }))
    expect(result.compoundClasses).toEqual([])
  })

  it('recognizes additional noticeability and timing aliases', () => {
    const result = toAtlasRecord(record({ noticeability: 'noticeable', onsetTime: '30 minutes', effectDuration: '4 hours' }))
    expect(result.intensity).toBe('Moderate')
    expect(result.onset).toBe('30 minutes')
    expect(result.duration).toBe('4 hours')
  })

  it('combines effects from multiple populated fields', () => {
    const result = toAtlasRecord(record({ primary_effects: [], effects: ['calming'], benefits: ['sleep support'] }))
    expect(result.explicitEffects).toEqual(['Calming', 'Sedating / sleep'])
    expect(result.inferredEffects).toEqual([])
    expect(result.effects).toEqual(['Calming', 'Sedating / sleep'])
  })

  it('tracks mechanism-enriched categories as inferred', () => {
    const result = toAtlasRecord(record({
      effects: [],
      mechanisms: ['GABA-A positive allosteric modulation', 'acetylcholinesterase inhibition'],
      canonical_mechanisms: ['Serotonergic signaling'],
    }))
    expect(result.explicitEffects).toEqual([])
    expect(result.inferredEffects).toEqual(['Calming', 'Cognition / focus', 'Mood'])
    expect(result.effects).toEqual(result.inferredEffects)
  })

  it('keeps explicit effects authoritative and removes inferred overlap', () => {
    const result = toAtlasRecord(record({ effects: ['calming'], mechanisms: ['GABA-A modulation', 'HPA axis modulation'] }))
    expect(result.explicitEffects).toEqual(['Calming'])
    expect(result.inferredEffects).toEqual([])
    expect(result.effects).toEqual(['Calming'])
  })

  it('does not expose unknown mechanism text as an effect label', () => {
    const result = toAtlasRecord(record({ mechanisms: ['Unmapped experimental pathway XYZ'] }))
    expect(result.effects).toEqual([])
    expect(result.inferredEffects).toEqual([])
  })
})
