import { describe, expect, it } from 'vitest'
import {
  DEFAULT_ATLAS_URL_STATE,
  parseAtlasUrlState,
  serializeAtlasUrlState,
} from '../botanical-atlas-url-state'

describe('Botanical Activity Atlas URL state', () => {
  it('returns defaults for an empty query string', () => {
    expect(parseAtlasUrlState('')).toEqual(DEFAULT_ATLAS_URL_STATE)
    expect(serializeAtlasUrlState(DEFAULT_ATLAS_URL_STATE)).toBe('')
  })

  it('round-trips a complete shareable state', () => {
    const state = {
      query: 'green tea',
      effect: 'Stimulating / energy',
      effectSource: 'explicit' as const,
      evidence: 'Moderate',
      intensity: 'Pronounced',
      compoundClass: 'Methylxanthines',
      safety: 'Cardiovascular',
      sort: 'evidence' as const,
    }

    expect(parseAtlasUrlState(serializeAtlasUrlState(state))).toEqual(state)
  })

  it('encodes spaces and punctuation safely', () => {
    const search = serializeAtlasUrlState({
      ...DEFAULT_ATLAS_URL_STATE,
      query: 'kava & kanna',
      effect: 'Sedating / sleep',
    })

    expect(search).toContain('q=kava+%26+kanna')
    expect(parseAtlasUrlState(search).query).toBe('kava & kanna')
  })

  it('falls back for unsupported enum values', () => {
    const parsed = parseAtlasUrlState('?source=mechanistic&sort=popular')
    expect(parsed.effectSource).toBe('all')
    expect(parsed.sort).toBe('name')
  })

  it('omits defaults while preserving active filters', () => {
    const search = serializeAtlasUrlState({
      ...DEFAULT_ATLAS_URL_STATE,
      safety: 'Serotonergic',
    })

    expect(search).toBe('?safety=Serotonergic')
  })
})
