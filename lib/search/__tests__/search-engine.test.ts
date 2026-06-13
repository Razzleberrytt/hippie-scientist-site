import { describe, it, expect } from 'vitest'
import Fuse from 'fuse.js'
import { computeFacets, filterDocs, runSearch, activeFilterCount, type SearchEngine } from '../search-engine'
import { EMPTY_FILTERS, type SearchDoc, type SearchFilterState } from '../types'

function doc(partial: Partial<SearchDoc> & { id: string; title: string; type: SearchDoc['type'] }): SearchDoc {
  return {
    slug: partial.id,
    href: `/x/${partial.id}`,
    summary: '',
    goals: [],
    pathways: [],
    evidenceGrade: 'Preliminary',
    safety: 'Use with caution',
    safetyFlags: { hasInteractions: false, hasContraindications: false },
    tags: [],
    searchText: `${partial.title} ${partial.id}`.toLowerCase(),
    ...partial,
  }
}

const docs: SearchDoc[] = [
  doc({ id: 'ashwagandha', title: 'Ashwagandha', type: 'Herb', goals: ['stress', 'sleep'], pathways: ['hpa-axis'], evidenceGrade: 'Strong', safety: 'Generally well tolerated', safetyFlags: { hasInteractions: true, hasContraindications: false } }),
  doc({ id: 'l-theanine', title: 'L-Theanine', type: 'Compound', goals: ['focus', 'stress'], pathways: ['gaba'], evidenceGrade: 'Moderate', safety: 'Generally well tolerated' }),
  doc({ id: 'evidence-levels', title: 'Understanding Evidence Levels', type: 'Education', goals: [], evidenceGrade: 'Educational', safety: 'Educational' }),
]

function makeEngine(list: SearchDoc[]): SearchEngine {
  return {
    docs: list,
    facets: computeFacets(list),
    fuse: new Fuse(list, { keys: ['title', 'searchText'], threshold: 0.34, ignoreLocation: true, includeScore: true }),
  }
}

function withFilters(overrides: Partial<SearchFilterState>): SearchFilterState {
  return { ...EMPTY_FILTERS, ...overrides }
}

describe('computeFacets', () => {
  it('tallies counts per facet value', () => {
    const facets = computeFacets(docs)
    expect(facets.types.find((t) => t.value === 'Herb')?.count).toBe(1)
    expect(facets.goals.find((g) => g.value === 'stress')?.count).toBe(2)
    expect(facets.goals.find((g) => g.value === 'stress')?.label).toBe('Stress')
  })
})

describe('filterDocs', () => {
  it('filters by type', () => {
    expect(filterDocs(docs, withFilters({ types: ['Education'] }))).toHaveLength(1)
  })
  it('filters by goal (OR within facet)', () => {
    expect(filterDocs(docs, withFilters({ goals: ['focus'] })).map((d) => d.id)).toEqual(['l-theanine'])
  })
  it('filters by evidence grade', () => {
    expect(filterDocs(docs, withFilters({ evidenceGrades: ['Strong'] })).map((d) => d.id)).toEqual(['ashwagandha'])
  })
  it('filters by safety consideration flags', () => {
    expect(filterDocs(docs, withFilters({ hasInteractions: true })).map((d) => d.id)).toEqual(['ashwagandha'])
  })
})

describe('runSearch', () => {
  const engine = makeEngine(docs)
  it('returns a browse list when query is empty', () => {
    const results = runSearch(engine, { query: '', filters: EMPTY_FILTERS })
    expect(results).toHaveLength(3)
    // Education ranks after monographs in the browse list.
    expect(results[results.length - 1].type).toBe('Education')
  })
  it('finds a fuzzy match by title', () => {
    const results = runSearch(engine, { query: 'theanine', filters: EMPTY_FILTERS })
    expect(results[0].id).toBe('l-theanine')
  })
  it('applies filters on top of a query', () => {
    const results = runSearch(engine, { query: 'e', filters: withFilters({ types: ['Education'] }) })
    expect(results.every((d) => d.type === 'Education')).toBe(true)
  })
})

describe('activeFilterCount', () => {
  it('counts selected facets and boolean flags', () => {
    expect(activeFilterCount(withFilters({ goals: ['stress', 'sleep'], hasInteractions: true }))).toBe(3)
  })
})
