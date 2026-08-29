import { describe, expect, it } from 'vitest'
import { getAtlasRecoverySuggestions } from '../botanical-atlas-recovery'

describe('atlas recovery tracking inputs', () => {
  it('returns stable action identifiers and restored counts for analytics', () => {
    const records = [
      { name: 'A', effects: ['Calming'], explicitEffects: ['Calming'], compounds: [], compoundClasses: [], evidence: 'Moderate', intensity: 'Subtle', safety: [] },
      { name: 'B', effects: ['Calming'], explicitEffects: [], compounds: [], compoundClasses: [], evidence: 'Preliminary', intensity: 'Subtle', safety: [] },
    ]
    const suggestions = getAtlasRecoverySuggestions(records, {
      query: '', effect: 'Calming', effectSource: 'explicit', evidence: 'Strong', intensity: 'all', compoundClass: 'all', safety: 'all',
    })

    expect(suggestions[0]).toMatchObject({ action: 'clear-evidence' })
    expect(suggestions.every((item) => item.recoveredCount > 0)).toBe(true)
  })
})
