import { describe, expect, it } from 'vitest'

import type { ClaimQualityAnalysis, ResearchQualityAnalysis } from '@/lib/research-quality-analysis'
import { buildResearchGapQueue } from '@/lib/research-quality-policy'
import {
  analyzeClaimEvidenceOverlap,
  analyzeCrossProfileStudyLoad,
  analyzeEvidenceBundleReuse,
} from '@/lib/research-study-load'

function claim(overrides: Partial<ClaimQualityAnalysis> & Pick<ClaimQualityAnalysis, 'url' | 'claimId' | 'studyIds'>): ClaimQualityAnalysis {
  const studyCount = overrides.studyIds.length
  return {
    url: overrides.url,
    claimId: overrides.claimId,
    reviewStatus: 'approved',
    approved: true,
    predicate: 'supports_outcome',
    confidence: 0.6,
    sourceRefCount: studyCount,
    validSourceRefCount: studyCount,
    danglingSourceRefs: [],
    studyIds: overrides.studyIds,
    studyCount,
    classifiedStudyCount: studyCount,
    primaryHuman: studyCount,
    synthesis: 0,
    narrative: 0,
    designs: Array.from({ length: studyCount }, () => 'rct' as const),
    outcomeClaim: true,
    supportTier: 'human-supported',
    structuredSupportTier: studyCount === 1 ? 'single-study' : 'adequate',
    weakStructuredClaim: studyCount === 1,
    highConfidenceWeakStructured: false,
    highConfidenceWeakOutcome: false,
    singleStudy: studyCount === 1,
    aliasCollapsed: false,
    ...overrides,
  }
}

function analysis(claims: ClaimQualityAnalysis[]): ResearchQualityAnalysis {
  const urls = [...new Set(claims.map((item) => item.url))]
  return {
    cache: {},
    profiles: [],
    claimAnalyses: claims,
    structuredClaimAnalyses: claims,
    profileAnalyses: urls.map((url) => ({
      url,
      sourceCount: 0,
      canonicalStudyCount: 0,
      claimCount: claims.filter((item) => item.url === url).length,
      approvedClaimCount: claims.filter((item) => item.url === url).length,
      supportedApprovedClaimCount: claims.filter((item) => item.url === url && item.studyCount > 0).length,
      weakStructuredClaimCount: claims.filter((item) => item.url === url && item.weakStructuredClaim).length,
      designMix: {},
      primaryHuman: 1,
      synthesis: 0,
      narrativeReview: 0,
      narrativeToPrimaryHumanRatio: 0,
      narrativeDominatedVsPrimaryHuman: false,
      unsupportedApprovedClaims: [],
      weakStructuredClaims: [],
      singleStudyApprovedClaims: [],
      aliasCollapsedClaims: [],
      danglingSourceRefs: [],
      claimStudyEdges: 0,
      mostUsedStudyIdentity: null,
      mostUsedStudyClaimCount: 0,
      studyDependencyShare: 0,
      dominantStudySupportedClaimShare: 0,
      studyConcentrationIndex: 0,
      effectiveStudyCount: 0,
      overDependentOnSingleStudy: false,
      reviewDominated: false,
      noPrimaryHuman: false,
    })),
  }
}

describe('research evidence topology contracts', () => {
  it('flags three approved claims sharing a two-study bundle as narrow reuse', () => {
    const input = analysis([
      claim({ url: '/herbs/a/', claimId: 'c1', studyIds: ['s1', 's2'] }),
      claim({ url: '/herbs/a/', claimId: 'c2', studyIds: ['s2', 's1'] }),
      claim({ url: '/herbs/a/', claimId: 'c3', studyIds: ['s1', 's2'] }),
    ])

    const bundles = analyzeEvidenceBundleReuse(input)
    expect(bundles).toHaveLength(1)
    expect(bundles[0]).toMatchObject({ approvedClaimCount: 3, studyCount: 2, narrowRepeatedEvidenceBundle: true })
  })

  it('detects contained evidence sets without double-counting exact bundles', () => {
    const input = analysis([
      claim({ url: '/herbs/a/', claimId: 'small', studyIds: ['s1', 's2'], predicate: 'supports_outcome' }),
      claim({ url: '/herbs/a/', claimId: 'large', studyIds: ['s1', 's2', 's3'], predicate: 'supports_mechanism' }),
      claim({ url: '/herbs/a/', claimId: 'exact', studyIds: ['s1', 's2'], predicate: 'supports_safety' }),
    ])

    const overlaps = analyzeClaimEvidenceOverlap(input)
    expect(overlaps.some((item) => item.claimA.claimId === 'small' && item.claimB.claimId === 'large')).toBe(true)
    expect(overlaps.every((item) => item.sameEvidenceBundle === false)).toBe(true)
    expect(overlaps[0].containment).toBe(1)
  })

  it('marks a study systemic when it supports five approved claims across three profiles', () => {
    const input = analysis([
      claim({ url: '/herbs/a/', claimId: 'a1', studyIds: ['global'] }),
      claim({ url: '/herbs/a/', claimId: 'a2', studyIds: ['global'] }),
      claim({ url: '/herbs/b/', claimId: 'b1', studyIds: ['global'] }),
      claim({ url: '/herbs/b/', claimId: 'b2', studyIds: ['global'] }),
      claim({ url: '/herbs/c/', claimId: 'c1', studyIds: ['global'] }),
    ])

    expect(analyzeCrossProfileStudyLoad(input)[0]).toMatchObject({
      studyId: 'global',
      approvedClaimCount: 5,
      profileCount: 3,
      systemicLoadBearing: true,
    })
  })

  it('prioritizes very-high-confidence single-study claims above ordinary single-study claims', () => {
    const input = analysis([
      claim({ url: '/herbs/ordinary/', claimId: 'ordinary', studyIds: ['s1'], confidence: 0.6 }),
      claim({
        url: '/herbs/high/',
        claimId: 'high',
        studyIds: ['s2'],
        confidence: 0.95,
        highConfidenceWeakStructured: true,
      }),
    ])

    const queue = buildResearchGapQueue(input)
    const ordinary = queue.find((item) => item.url === '/herbs/ordinary/')
    const high = queue.find((item) => item.url === '/herbs/high/')
    expect(ordinary?.reasonCounts['single-study-approved-claim']).toBe(1)
    expect(high?.reasonCounts['single-study-approved-claim']).toBe(1)
    expect(high?.score ?? 0).toBeGreaterThan(ordinary?.score ?? 0)
  })
})
