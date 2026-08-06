import { describe, expect, it } from 'vitest'
import {
  effectsForSource,
  matchesFilters,
  type BotanicalAtlasRecord,
} from '../BotanicalActivityAtlasClient'

const record: BotanicalAtlasRecord = {
  slug: 'test-herb',
  name: 'Test Herb',
  effects: ['Calming', 'Mood'],
  explicitEffects: ['Calming'],
  inferredEffects: ['Mood'],
  compounds: [],
  compoundClasses: [],
  evidence: 'Preliminary',
  intensity: 'Moderate',
  safety: [],
}

const filters = {
  query: '',
  effect: 'all',
  effectSource: 'all' as const,
  evidence: 'all',
  intensity: 'all',
  compoundClass: 'all',
  safety: 'all',
}

describe('Botanical Activity Atlas effect source filter', () => {
  it('includes pathway-derived categories in the default mode', () => {
    expect(effectsForSource(record, 'all')).toEqual(['Calming', 'Mood'])
    expect(matchesFilters(record, { ...filters, effect: 'Mood' })).toBe(true)
  })

  it('restricts effects and matching to explicit categories', () => {
    expect(effectsForSource(record, 'explicit')).toEqual(['Calming'])
    expect(matchesFilters(record, { ...filters, effectSource: 'explicit', effect: 'Mood' })).toBe(false)
    expect(matchesFilters(record, { ...filters, effectSource: 'explicit', effect: 'Calming' })).toBe(true)
  })

  it('falls back to the combined effect list for older records without provenance fields', () => {
    const legacy = { ...record, explicitEffects: undefined, inferredEffects: undefined }
    expect(effectsForSource(legacy, 'explicit')).toEqual(['Calming', 'Mood'])
  })

  it('excludes pathway-only search terms in explicit-only mode', () => {
    expect(matchesFilters(record, { ...filters, effectSource: 'explicit', query: 'mood' })).toBe(false)
  })
})
