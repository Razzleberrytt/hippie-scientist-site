import { describe, expect, it } from 'vitest'
import { filterHerbs } from '@/utils/filterHerbs'
import { filterCompounds } from '@/utils/filterCompounds'
import { DEFAULT_FILTER_STATE } from '@/utils/filterModel'
import { assessBrowseRecord } from '@/utils/browseQuality'
import type { Herb } from '@/types'
import type { CompoundSummaryRecord } from '@/lib/compound-data'

describe('default browse ranking', () => {
  it('keeps default sort on quality ranking and hides low-signal herb rows from default browse', () => {
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
    expect(ranked.map(item => item.slug)).toEqual(['high'])

    const searchable = filterHerbs(herbs, { ...DEFAULT_FILTER_STATE, query: 'x1' })
    expect(searchable.map(item => item.slug)).toEqual(['low'])
  })

  it('hides sparse compounds from default browse but keeps them searchable', () => {
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
    ] as unknown as CompoundSummaryRecord[]

    const ranked = filterCompounds(compounds, DEFAULT_FILTER_STATE)
    expect(ranked.map(item => item.slug)).toEqual(['rich'])

    const searchable = filterCompounds(compounds, { ...DEFAULT_FILTER_STATE, query: 'octamethyl' })
    expect(searchable.map(item => item.slug)).toEqual(['sparse'])
  })

  it('dedupes obvious browse clutter variants on default browse', () => {
    const compounds = [
      {
        id: 'primary',
        slug: 'rosmarinic-acid',
        name: 'Rosmarinic Acid',
        summaryShort: 'Useful summary with practical context.',
        description: 'Rich metadata and herb associations.',
        className: 'polyphenol',
        category: 'phenolic',
        mechanism: 'Antioxidant pathway modulation.',
        effects: ['calm'],
        herbs: ['lemon balm'],
        sourceCount: 2,
      },
      {
        id: 'variant',
        slug: 'rosmarinic-acid-extract',
        name: 'Rosmarinic Acid (L.)',
        summaryShort: 'N/A',
        description: 'profile still being expanded',
        className: 'polyphenol',
        category: 'phenolic',
        mechanism: '',
        effects: [],
        herbs: [],
        sourceCount: 0,
      },
    ] as CompoundSummaryRecord[]

    const ranked = filterCompounds(compounds, DEFAULT_FILTER_STATE)
    expect(ranked.map(item => item.slug)).toEqual(['rosmarinic-acid'])

    const searchable = filterCompounds(compounds, { ...DEFAULT_FILTER_STATE, query: 'l.' })
    expect(searchable.map(item => item.slug)).toEqual(['rosmarinic-acid-extract'])
  })

  it('demotes long chemical names only when metadata is sparse', () => {
    const longName =
      '2,3,4,5,6,7,8,9-octamethyl-11-(2,4,6-trimethylphenyl)-tricyclo[7.3.1.0]trideca-1,3,5-triene'

    const sparse = assessBrowseRecord({
      name: longName,
      summary: 'unknown',
      description: 'data is still being verified',
      mechanism: '',
      effects: [],
      associations: [],
      sourceCount: 0,
      hasEvidence: false,
    })
    expect(sparse.demote).toBe(true)

    const rich = assessBrowseRecord({
      name: longName,
      summary: 'Detailed summary with high-signal context suitable for browse ranking.',
      description: 'Rich metadata, useful mechanism detail, and direct associations to mapped herbs.',
      mechanism: 'Mechanistic pathway has plausible receptor-level coverage and context.',
      effects: ['calm', 'focus'],
      associations: ['rosemary', 'lemon balm'],
      sourceCount: 3,
      hasEvidence: true,
    })
    expect(rich.demote).toBe(false)
  })
})
