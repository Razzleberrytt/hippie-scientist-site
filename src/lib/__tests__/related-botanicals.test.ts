import { describe, expect, it } from 'vitest'
import { getRelatedBotanicals, scoreRelatedBotanical, type RelatedBotanicalRecord } from '../related-botanicals'

const herb = (overrides: Partial<RelatedBotanicalRecord>): RelatedBotanicalRecord => ({
  slug: 'source',
  name: 'Source',
  explicitEffects: [],
  effects: [],
  compounds: [],
  compoundClasses: [],
  evidence: 'Moderate',
  intensity: 'Subtle',
  safety: [],
  ...overrides,
})

describe('related botanicals engine', () => {
  it('prioritizes shared explicit effects and chemistry over metadata-only matches', () => {
    const source = herb({ explicitEffects: ['Calming'], effects: ['Calming'], compoundClasses: ['Flavonoids'] })
    const strong = herb({ slug: 'strong', name: 'Strong', explicitEffects: ['Calming'], effects: ['Calming'], compoundClasses: ['Flavonoids'], evidence: 'Preliminary', intensity: 'Pronounced' })
    const weak = herb({ slug: 'weak', name: 'Weak', evidence: 'Moderate', intensity: 'Subtle' })

    expect(getRelatedBotanicals(source, [weak, strong]).map((match) => match.record.slug)).toEqual(['strong'])
  })

  it('explains every scored relationship with stable reason types and values', () => {
    const source = herb({ explicitEffects: ['Calming'], effects: ['Calming'], compounds: ['Apigenin'], compoundClasses: ['Flavonoids'], safety: ['Sedating'] })
    const candidate = herb({ slug: 'candidate', name: 'Candidate', explicitEffects: ['Calming'], effects: ['Calming'], compounds: ['apigenin'], compoundClasses: ['Flavonoids'], safety: ['Sedating'] })
    const match = scoreRelatedBotanical(source, candidate)

    expect(match?.reasons.map((reason) => reason.type)).toEqual([
      'explicit-effect',
      'compound-class',
      'compound',
      'safety',
      'evidence',
      'noticeability',
    ])
    expect(match?.reasons.find((reason) => reason.type === 'compound')?.values).toEqual(['Apigenin'])
  })

  it('does not recommend the source record or safety-only similarities', () => {
    const source = herb({ safety: ['Serotonergic'] })
    const safetyOnly = herb({ slug: 'risk', name: 'Risk', safety: ['Serotonergic'] })

    expect(scoreRelatedBotanical(source, source)).toBeNull()
    expect(scoreRelatedBotanical(source, safetyOnly)).toBeNull()
  })

  it('does not recommend duplicate aliases for the same scientific species', () => {
    const source = herb({ scientificName: 'Morus alba', explicitEffects: ['Metabolic'], effects: ['Metabolic'] })
    const alias = herb({ slug: 'mulberry-leaf', name: 'Mulberry Leaf', scientificName: ' morus   alba ', explicitEffects: ['Metabolic'], effects: ['Metabolic'] })

    expect(scoreRelatedBotanical(source, alias)).toBeNull()
  })

  it('does not qualify broad antioxidant or tonic labels by themselves', () => {
    const antioxidantSource = herb({ explicitEffects: ['antioxidant'], effects: ['antioxidant'] })
    const antioxidantCandidate = herb({ slug: 'antioxidant', name: 'Antioxidant', explicitEffects: ['antioxidant'], effects: ['antioxidant'] })
    const tonicSource = herb({ explicitEffects: ['tonic'], effects: ['tonic'] })
    const tonicCandidate = herb({ slug: 'tonic', name: 'Tonic', explicitEffects: ['tonic'], effects: ['tonic'] })

    expect(scoreRelatedBotanical(antioxidantSource, antioxidantCandidate)).toBeNull()
    expect(scoreRelatedBotanical(tonicSource, tonicCandidate)).toBeNull()
  })

  it('allows broad labels when chemistry independently supports the relationship', () => {
    const source = herb({ explicitEffects: ['antioxidant'], effects: ['antioxidant'], compoundClasses: ['Flavonoids'] })
    const candidate = herb({ slug: 'chemistry', name: 'Chemistry', explicitEffects: ['antioxidant'], effects: ['antioxidant'], compoundClasses: ['Flavonoids'] })

    expect(scoreRelatedBotanical(source, candidate)?.reasons.some((reason) => reason.type === 'compound-class')).toBe(true)
  })

  it('rejects otherwise-substantive matches below the minimum confidence score', () => {
    const source = herb({ explicitEffects: ['Cognition / focus', 'Calming', 'Mood'] })
    const candidate = herb({ slug: 'thin', name: 'Thin', explicitEffects: ['Cognition / focus', 'Metabolic', 'Immune'] })

    expect(scoreRelatedBotanical(source, candidate)).toBeNull()
  })

  it('falls back to combined effects when explicit effect provenance is unavailable', () => {
    const source = herb({ explicitEffects: undefined, effects: ['Cognition / focus'] })
    const candidate = herb({ slug: 'legacy', name: 'Legacy', explicitEffects: undefined, effects: ['Cognition / focus'] })

    expect(scoreRelatedBotanical(source, candidate)?.reasons[0]).toMatchObject({
      type: 'explicit-effect',
      values: ['Cognition / focus'],
    })
  })

  it('uses deterministic alphabetical tie breaking and respects limits', () => {
    const source = herb({ explicitEffects: ['Calming'], effects: ['Calming'] })
    const beta = herb({ slug: 'beta', name: 'Beta', explicitEffects: ['Calming'], effects: ['Calming'] })
    const alpha = herb({ slug: 'alpha', name: 'Alpha', explicitEffects: ['Calming'], effects: ['Calming'] })

    expect(getRelatedBotanicals(source, [beta, alpha], 1).map((match) => match.record.name)).toEqual(['Alpha'])
    expect(getRelatedBotanicals(source, [beta, alpha], 0)).toEqual([])
  })
})
