import { describe, expect, it } from 'vitest'

import { analyzeResearchEdgeCardinality } from '../research-edge-cardinality'
import type { ResearchQualityAnalysis } from '../research-quality-analysis'

function analysisWith(record: Record<string, unknown>): ResearchQualityAnalysis {
  return {
    cache: {},
    profiles: [{
      kind: 'herbs',
      url: '/herbs/example/',
      file: '/tmp/example.json',
      record,
    }],
    profileAnalyses: [],
    claimAnalyses: [],
    structuredClaimAnalyses: [],
  } as ResearchQualityAnalysis
}

describe('research edge cardinality', () => {
  it('preserves duplicate raw edges while collapsing source aliases to one canonical study', () => {
    const result = analyzeResearchEdgeCardinality(analysisWith({
      sources: [
        { id: 's1', doi: '10.1000/example' },
        { id: 's2', doi: '10.1000/example', pmid: '12345' },
      ],
      claimMap: [{
        id: 'claim-1',
        reviewStatus: 'approved',
        sourceRefIds: ['s1', 's1', 's2'],
      }],
    }))

    expect(result.claims).toHaveLength(1)
    expect(result.claims[0]).toMatchObject({
      rawSourceRefCount: 3,
      uniqueSourceRefCount: 2,
      validUniqueSourceRefCount: 2,
      canonicalStudyCount: 1,
      duplicateSourceRefCount: 1,
      aliasCollapsedSourceCount: 1,
      duplicateSourceRefs: ['s1'],
      aliasCollapsed: true,
      pseudoMultiSource: true,
    })
    expect(result.summary).toMatchObject({
      duplicateEdgeClaims: 1,
      aliasCollapsedClaims: 1,
      pseudoMultiSourceClaims: 1,
      duplicateEdges: 1,
      aliasCollapsedSourceRows: 1,
    })
  })

  it('keeps genuinely independent source rows as distinct canonical studies', () => {
    const result = analyzeResearchEdgeCardinality(analysisWith({
      sources: [
        { id: 's1', doi: '10.1000/one' },
        { id: 's2', doi: '10.1000/two' },
      ],
      claimMap: [{
        id: 'claim-2',
        reviewStatus: 'approved',
        sourceRefIds: ['s1', 's2'],
      }],
    }))

    expect(result.claims[0]).toMatchObject({
      rawSourceRefCount: 2,
      uniqueSourceRefCount: 2,
      validUniqueSourceRefCount: 2,
      canonicalStudyCount: 2,
      duplicateSourceRefCount: 0,
      aliasCollapsedSourceCount: 0,
      aliasCollapsed: false,
      pseudoMultiSource: false,
    })
  })
})
