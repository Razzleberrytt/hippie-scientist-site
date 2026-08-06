import { describe, expect, it } from 'vitest'
import { getAtlasRecoverySuggestions } from '@/lib/botanical-atlas-recovery'

const records = [
  { name: 'Calm Herb', effects: ['Calming'], explicitEffects: ['Calming'], compounds: [], compoundClasses: ['Flavonoids'], evidence: 'Moderate', intensity: 'Subtle', safety: [] },
  { name: 'Focus Herb', effects: ['Cognition / focus'], explicitEffects: [], compounds: [], compoundClasses: ['Alkaloids'], evidence: 'Preliminary', intensity: 'Moderate', safety: ['Serotonergic'] },
  { name: 'Sleep Herb', effects: ['Sedating / sleep'], explicitEffects: ['Sedating / sleep'], compounds: [], compoundClasses: ['Terpenes'], evidence: 'Moderate', intensity: 'Pronounced', safety: ['Sedation'] },
]

const base = {
  query: '',
  effect: 'all',
  effectSource: 'all' as const,
  evidence: 'all',
  intensity: 'all',
  compoundClass: 'all',
  safety: 'all',
}

describe('botanical atlas recovery', () => {
  it('ranks the change restoring the most records first', () => {
    const suggestions = getAtlasRecoverySuggestions(records, {
      ...base,
      effect: 'Calming',
      compoundClass: 'Alkaloids',
    })

    expect(suggestions[0]).toMatchObject({ action: 'clear-effect', recoveredCount: 1 })
    expect(suggestions[1]).toMatchObject({ action: 'clear-chemistry', recoveredCount: 1 })
  })

  it('offers pathway inclusion when explicit-only mode hides inferred effects', () => {
    const suggestions = getAtlasRecoverySuggestions(records, {
      ...base,
      effect: 'Cognition / focus',
      effectSource: 'explicit',
    })

    expect(suggestions).toContainEqual({
      action: 'include-pathways',
      label: 'Include pathway-derived effects',
      recoveredCount: 1,
    })
  })

  it('omits changes that would still produce zero results', () => {
    const suggestions = getAtlasRecoverySuggestions(records, {
      ...base,
      query: 'does-not-exist',
      safety: 'Serotonergic',
    })

    expect(suggestions).toEqual([
      { action: 'clear-query', label: 'Clear search term', recoveredCount: 1 },
    ])
  })

  it('limits the recovery queue', () => {
    const suggestions = getAtlasRecoverySuggestions(records, {
      query: 'missing',
      effect: 'Calming',
      effectSource: 'explicit',
      evidence: 'Strong',
      intensity: 'Unknown',
      compoundClass: 'Alkaloids',
      safety: 'Serotonergic',
    }, 2)

    expect(suggestions).toHaveLength(2)
  })
})
