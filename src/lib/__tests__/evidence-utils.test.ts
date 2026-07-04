import { describe, it, expect } from 'vitest'
import { normalizeEvidenceLevel, normalizeSafetyLevel, getEffects, getSources } from '../../../lib/evidence-utils'

describe('normalizeEvidenceLevel', () => {
  it('maps raw evidence language to a standard label', () => {
    expect(normalizeEvidenceLevel('strong clinical evidence')).toBe('Strong evidence')
    expect(normalizeEvidenceLevel('preclinical/animal only')).toBe('Preliminary evidence')
  })

  it('falls back to "Limited evidence" when no value is given', () => {
    expect(normalizeEvidenceLevel(undefined)).toBe('Limited evidence')
  })
})

describe('normalizeSafetyLevel', () => {
  it('maps a canonical safety string through unchanged', () => {
    expect(normalizeSafetyLevel('Generally well tolerated')).toBe('Generally well tolerated')
  })

  it('falls back to "Safety review pending" when nothing is known', () => {
    expect(normalizeSafetyLevel(undefined)).toBe('Safety review pending')
  })
})

describe('getEffects', () => {
  it('prefers an array of effects, capped at 5', () => {
    const row = { effects: ['a', 'b', 'c', 'd', 'e', 'f'] }
    expect(getEffects(row)).toEqual(['a', 'b', 'c', 'd', 'e'])
  })

  it('falls back to primary_effects when effects is absent', () => {
    const row = { primary_effects: ['stress relief'] }
    expect(getEffects(row)).toEqual(['stress relief'])
  })

  it('parses a delimited string into a list', () => {
    const row = { effects: 'stress relief; better sleep, focus' }
    expect(getEffects(row)).toEqual(['stress relief', 'better sleep', 'focus'])
  })

  it('returns a placeholder when no effects are documented', () => {
    expect(getEffects({})).toEqual(['No strong effects established yet'])
  })
})

describe('getSources', () => {
  it('returns an array of sources unchanged, filtering falsy entries', () => {
    const row = { sources: ['pmid1', null, 'pmid2'] }
    expect(getSources(row)).toEqual(['pmid1', 'pmid2'])
  })

  it('falls back to references then pmids', () => {
    expect(getSources({ references: ['ref1'] })).toEqual(['ref1'])
    expect(getSources({ pmids: ['12345'] })).toEqual(['12345'])
  })

  it('parses a delimited string of sources', () => {
    expect(getSources({ sources: 'pmid1; pmid2, pmid3' })).toEqual(['pmid1', 'pmid2', 'pmid3'])
  })

  it('returns an empty array when nothing is documented', () => {
    expect(getSources({})).toEqual([])
  })
})
