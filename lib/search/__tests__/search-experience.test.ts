import { describe, expect, it } from 'vitest'
import {
  buildOnDemandComparisonHref,
  getCanonicalMatchNote,
  normalizeResearchSearchItem,
  parseComparisonKey,
  safeFailedSearchAnalyticsTerm,
  weightedSearchScore,
} from '@/lib/search/search-experience'

describe('canonical research search experience', () => {
  it('indexes aliases, scientific names, extract names, conditions, and mechanisms separately', () => {
    const item = normalizeResearchSearchItem({
      slug: 'ashwagandha',
      name: 'Ashwagandha',
      aliases: ['Indian ginseng'],
      scientific_name: 'Withania somnifera',
      branded_extracts: ['KSM-66'],
      clinically_supported_outcomes: ['Stress'],
      conditions: ['Stress-related symptoms'],
      mechanisms: ['GABAergic signaling'],
      evidence_tier: 'B',
    }, 'Herb')

    expect(item).not.toBeNull()
    expect(item?.aliases).toContain('Indian ginseng')
    expect(item?.scientificNames).toContain('Withania somnifera')
    expect(item?.extractNames).toContain('KSM-66')
    expect(item?.conditions).toContain('Stress-related symptoms')
    expect(item?.mechanisms).toContain('GABAergic signaling')
    expect(item?.outcomes).not.toContain('GABAergic signaling')
    expect(item?.searchText).toContain('Withania somnifera')
    expect(item?.searchText).toContain('KSM-66')
  })

  it('surfaces the canonical profile when an alias matches', () => {
    const item = normalizeResearchSearchItem({
      slug: 'hypericum-perforatum',
      name: "St. John's Wort",
      aliases: ['Hypericum'],
    }, 'Herb')
    expect(item && getCanonicalMatchNote(item, 'hypericum')).toBe('Canonical profile for “Hypericum”')
  })

  it('uses evidence completeness and popularity in general ranking', () => {
    const base = normalizeResearchSearchItem({ slug: 'a', name: 'A' }, 'Compound')!
    const stronger = { ...base, evidenceCompleteness: 1, popularityScore: 1, authorityScore: 1 }
    const weaker = { ...base, evidenceCompleteness: 0, popularityScore: 0, authorityScore: 0 }
    expect(weightedSearchScore(stronger, 0.7, 'general')).toBeGreaterThan(weightedSearchScore(weaker, 0.7, 'general'))
  })

  it('keeps dynamic comparisons encoded as two canonical entity keys', () => {
    const href = buildOnDemandComparisonHref(['herb:ashwagandha', 'compound:magnesium'])
    expect(href).toContain('left=herb%3Aashwagandha')
    expect(href).toContain('right=compound%3Amagnesium')
    expect(parseComparisonKey('herb:ashwagandha')).toEqual({ type: 'Herb', slug: 'ashwagandha' })
  })

  it('does not send sensitive or complex failed-search text to analytics', () => {
    expect(safeFailedSearchAnalyticsTerm('ashwagandha extract')).toBe('ashwagandha extract')
    expect(safeFailedSearchAnalyticsTerm('my anxiety medication')).toBeNull()
    expect(safeFailedSearchAnalyticsTerm('pregnancy dose')).toBeNull()
  })
})
