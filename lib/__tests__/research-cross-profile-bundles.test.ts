import { describe, expect, it } from 'vitest'

import { analyzeCrossProfileEvidenceBundles } from '@/lib/research-cross-profile-bundles'
import type { ClaimQualityAnalysis, ResearchQualityAnalysis } from '@/lib/research-quality-analysis'

function claim(url: string, claimId: string, studyIds: string[]): ClaimQualityAnalysis {
  return {
    url,
    claimId,
    reviewStatus: 'approved',
    approved: true,
    predicate: 'supports_outcome',
    confidence: 0.8,
    sourceRefCount: studyIds.length,
    validSourceRefCount: studyIds.length,
    danglingSourceRefs: [],
    studyIds,
    studyCount: studyIds.length,
    classifiedStudyCount: studyIds.length,
    primaryHuman: studyIds.length,
    synthesis: 0,
    narrative: 0,
    designs: studyIds.map(() => 'rct' as const),
    outcomeClaim: true,
    supportTier: 'human-supported',
    structuredSupportTier: 'adequate',
    weakStructuredClaim: false,
    highConfidenceWeakStructured: false,
    highConfidenceWeakOutcome: false,
    singleStudy: false,
    aliasCollapsed: false,
  }
}

function analysis(claims: ClaimQualityAnalysis[]): ResearchQualityAnalysis {
  const studiesByUrl = new Map<string, Set<string>>()
  for (const item of claims) {
    const studies = studiesByUrl.get(item.url) ?? new Set<string>()
    for (const studyId of item.studyIds) studies.add(studyId)
    studiesByUrl.set(item.url, studies)
  }

  const profiles = [...studiesByUrl.entries()].map(([url, studyIds]) => ({
    url,
    kind: url.startsWith('/compounds/') ? 'compounds' as const : 'herbs' as const,
    file: '',
    record: {
      sources: [...studyIds].map((studyId) => {
        const pmid = studyId.replace(/^pmid:/, '')
        return { id: studyId, pmid }
      }),
    },
  }))

  return { cache: {}, profiles, profileAnalyses: [], claimAnalyses: claims, structuredClaimAnalyses: claims }
}

describe('cross-profile evidence bundle reuse', () => {
  it('flags a two-study bundle reused by three approved claims across two profiles', () => {
    const result = analyzeCrossProfileEvidenceBundles(analysis([
      claim('/herbs/a/', 'a1', ['pmid:111', 'pmid:222']),
      claim('/herbs/a/', 'a2', ['pmid:222', 'pmid:111']),
      claim('/compounds/b/', 'b1', ['pmid:111', 'pmid:222']),
    ]))

    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({
      studyIds: ['pmid:111', 'pmid:222'],
      studyCount: 2,
      profileCount: 2,
      approvedClaimCount: 3,
      narrowCrossProfileBundle: true,
    })
  })

  it('does not duplicate the single-study load-bearing analysis', () => {
    const result = analyzeCrossProfileEvidenceBundles(analysis([
      claim('/herbs/a/', 'a1', ['pmid:111']),
      claim('/compounds/b/', 'b1', ['pmid:111']),
      claim('/compounds/c/', 'c1', ['pmid:111']),
    ]))
    expect(result).toHaveLength(0)
  })

  it('reports broader multi-study bundles across profiles without calling them narrow', () => {
    const result = analyzeCrossProfileEvidenceBundles(analysis([
      claim('/herbs/a/', 'a1', ['pmid:111', 'pmid:222', 'pmid:333']),
      claim('/compounds/b/', 'b1', ['pmid:111', 'pmid:222', 'pmid:333']),
    ]))
    expect(result[0]).toMatchObject({ profileCount: 2, studyCount: 3, narrowCrossProfileBundle: false })
  })
})
