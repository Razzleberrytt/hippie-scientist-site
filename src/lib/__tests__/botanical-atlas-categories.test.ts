import { describe, expect, it } from 'vitest'
import { BOTANICAL_ATLAS_CATEGORIES, getBotanicalAtlasCategory } from '@/lib/botanical-atlas-categories'
import type { BotanicalAtlasRecord } from '@/components/atlas/BotanicalActivityAtlasClient'

const baseRecord: BotanicalAtlasRecord = {
  slug: 'example',
  name: 'Example',
  effects: [],
  compounds: [],
  compoundClasses: [],
  evidence: 'Preliminary',
  intensity: 'Moderate',
  safety: [],
}

describe('Botanical Activity Atlas category presets', () => {
  it('uses unique stable slugs', () => {
    const slugs = BOTANICAL_ATLAS_CATEGORIES.map((category) => category.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
    expect(slugs).toEqual(expect.arrayContaining([
      'alkaloid-botanicals',
      'natural-stimulants',
      'calming-botanicals',
      'dream-and-perception-herbs',
      'serotonergic-interaction-risk',
    ]))
  })

  it('matches each normalized taxonomy dimension', () => {
    expect(getBotanicalAtlasCategory('alkaloid-botanicals')?.matches({ ...baseRecord, compoundClasses: ['Alkaloids'] })).toBe(true)
    expect(getBotanicalAtlasCategory('natural-stimulants')?.matches({ ...baseRecord, effects: ['Stimulating / energy'] })).toBe(true)
    expect(getBotanicalAtlasCategory('calming-botanicals')?.matches({ ...baseRecord, effects: ['Calming'] })).toBe(true)
    expect(getBotanicalAtlasCategory('dream-and-perception-herbs')?.matches({ ...baseRecord, effects: ['Dream / perception'] })).toBe(true)
    expect(getBotanicalAtlasCategory('serotonergic-interaction-risk')?.matches({ ...baseRecord, safety: ['Serotonergic'] })).toBe(true)
  })
})
