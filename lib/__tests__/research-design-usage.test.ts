import { describe, expect, it } from 'vitest'

import { analyzeEdgeWeightedDesignUsage } from '@/lib/research-design-usage'
import type { ClaimQualityAnalysis, ResearchQualityAnalysis } from '@/lib/research-quality-analysis'

function claim(
  claimId: string,
  designs: ClaimQualityAnalysis['designs'],
): ClaimQualityAnalysis {
  const studyIds = designs.map((_, index) => `${claimId}-study-${index}`)
  return {
    url: '/herbs/example/',
    claimId,
    reviewStatus: 'approved',
    approved: true,
    predicate: 'supports_outcome',
    confidence: 0.7,
    sourceRefCount: studyIds.length,
    validSourceRefCount: studyIds.length,
    danglingSourceRefs: [],
    studyIds,
    studyCount: studyIds.length,
    classifiedStudyCount: designs.filter((design) => design !== 'unclassified').length,
    primaryHuman: designs.filter((design) => design === 'rct').length,
    synthesis: designs.filter((design) => design === 'systematic-review' || design === 'meta-analysis').length,
    narrative: designs.filter((design) => design === 'narrative-review').length,
    designs,
    outcomeClaim: true,
    supportTier: 'human-supported',
    structuredSupportTier: studyIds.length === 1 ? 'single-study' : 'adequate',
    weakStructuredClaim: studyIds.length === 1,
    highConfidenceWeakStructured: false,
    highConfidenceWeakOutcome: false,
    singleStudy: studyIds.length === 1,
    aliasCollapsed: false,
  }
}

function analysis(claims: ClaimQualityAnalysis[]): ResearchQualityAnalysis {
  return {
    cache: {},
    profiles: [],
    profileAnalyses: [],
    claimAnalyses: claims,
    structuredClaimAnalyses: claims,
  }
}

describe('edge-weighted research design usage', () => {
  it('flags narrative dominance when review evidence carries most approved claim edges', () => {
    const input = analysis([
      claim('c1', ['narrative-review', 'rct']),
      claim('c2', ['narrative-review']),
      claim('c3', ['narrative-review']),
      claim('c4', ['narrative-review', 'rct']),
      claim('c5', ['narrative-review']),
    ])

    const result = analyzeEdgeWeightedDesignUsage(input)[0]

    expect(result).toMatchObject({
      claimStudyEdges: 7,
      classifiedEdges: 7,
      narrativeReviewEdges: 5,
      primaryHumanEdges: 2,
      edgeWeightedNarrativeDominated: true,
    })
    expect(result.narrativeReviewEdgeShare).toBeCloseTo(5 / 7, 3)
    expect(result.narrativeToPrimaryHumanEdgeRatio).toBe(2.5)
  })

  it('does not flag a balanced claim-edge mix', () => {
    const input = analysis([
      claim('c1', ['rct', 'narrative-review']),
      claim('c2', ['rct']),
      claim('c3', ['narrative-review']),
    ])

    const result = analyzeEdgeWeightedDesignUsage(input)[0]
    expect(result.primaryHumanEdges).toBe(2)
    expect(result.narrativeReviewEdges).toBe(2)
    expect(result.edgeWeightedNarrativeDominated).toBe(false)
  })

  it('tracks unclassified edges without letting them distort classified-design shares', () => {
    const input = analysis([
      claim('c1', ['narrative-review', 'unclassified']),
      claim('c2', ['rct', 'unclassified']),
    ])

    const result = analyzeEdgeWeightedDesignUsage(input)[0]
    expect(result).toMatchObject({
      claimStudyEdges: 4,
      classifiedEdges: 2,
      unclassifiedEdges: 2,
      narrativeReviewEdgeShare: 0.5,
      primaryHumanEdgeShare: 0.5,
    })
  })
})
