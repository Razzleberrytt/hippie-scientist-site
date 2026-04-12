import { describe, expect, it } from 'vitest'
import { filterHerbs } from '@/utils/filterHerbs'
import { filterCompounds } from '@/utils/filterCompounds'
import { DEFAULT_FILTER_STATE } from '@/utils/filterModel'
import type { Herb } from '@/types'
import type { CompoundSummaryRecord } from '@/lib/compound-data'

describe('default browse ranking', () => {
  it('keeps default sort on quality ranking and demotes low-signal herb rows', () => {
    expect(DEFAULT_FILTER_STATE.sort).toBe('browse_quality')

    const herbs = [
      {
        id: 'high',
        slug: 'high',
        common: 'Ashwagandha',
        summaryShort: 'Well-formed overview with practical context for browsing quality.',
        description:
          'Adaptogenic herb with better metadata, mechanism detail, and clearly useful context.',
        mechanism: 'HPA-axis modulation and stress-response support.',
        effects: ['stress support', 'sleep support', 'calm'],
        compounds: ['withanolides'],
        confidence: 'high',
        sourceCount: 4,
      },
      {
        id: 'low',
        slug: 'low',
        common: 'X1',
        summaryShort: 'N/A',
        description: 'profile still being expanded',
        mechanism: '',
        effects: [],
        compounds: [],
        confidence: 'low',
        sourceCount: 0,
      },
    ] as Herb[]

    const ranked = filterHerbs(herbs, DEFAULT_FILTER_STATE)
    expect(ranked.map(item => item.slug)).toEqual(['high', 'low'])

    const searchable = filterHerbs(herbs, { ...DEFAULT_FILTER_STATE, query: 'x1' })
    expect(searchable.map(item => item.slug)).toEqual(['low'])
  })

  it('demotes sparse compounds but keeps them searchable', () => {
    const compounds = [
      {
        id: 'rich',
        slug: 'rich',
        name: 'Rosmarinic Acid',
        summaryShort: 'Useful summary with clean naming and practical context.',
        description: 'Well-described polyphenol with mechanism, effects, and herb associations.',
        className: 'polyphenol',
        category: 'phenolic',
        mechanism: 'Antioxidant and inflammatory pathway modulation.',
        effects: ['calm', 'focus'],
        primaryEffects: [],
        herbs: ['lemon balm', 'rosemary'],
        confidence: 'high',
        hasInteractionData: true,
        hasEvidenceNotes: true,
        aliases: [],
        sourceCount: 3,
      },
      {
        id: 'sparse',
        slug: 'sparse',
        name: '2,3,4,5,6,7,8,9-octamethyl-11-(2,4,6-trimethylphenyl)-tricyclo[7.3.1.0]trideca-1,3,5-triene',
        summaryShort: 'unknown',
        description: 'data is still being verified',
        className: 'unknown',
        category: 'unknown',
        mechanism: '',
        effects: [],
        primaryEffects: [],
        herbs: [],
        confidence: 'low',
        hasInteractionData: false,
        hasEvidenceNotes: false,
        aliases: [],
        sourceCount: 0,
      },
    ] as CompoundSummaryRecord[]

    const ranked = filterCompounds(compounds, DEFAULT_FILTER_STATE)
    expect(ranked.map(item => item.slug)).toEqual(['rich', 'sparse'])

    const searchable = filterCompounds(compounds, { ...DEFAULT_FILTER_STATE, query: 'octamethyl' })
    expect(searchable.map(item => item.slug)).toEqual(['sparse'])
  })
})
