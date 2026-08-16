import { describe, expect, it } from 'vitest'

import { analyzeCrossProfileEvidenceBundles } from '@/lib/research-cross-profile-bundles'
import type { ResearchQualityAnalysis } from '@/lib/research-quality-analysis'
import { analyzeCrossProfileStudyLoad } from '@/lib/research-study-load'

function claim(url: string, claimId: string, studyIds: string[]) {
  return {
    url,
    claimId,
    reviewStatus: 'approved',
    approved: true,
    predicate: 'supports_outcome',
    confidence: 0.9,
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
    supportTier: 'human-supported' as const,
    structuredSupportTier: 'adequate' as const,
    weakStructuredClaim: false,
    highConfidenceWeakStructured: false,
    highConfidenceWeakOutcome: false,
    singleStudy: studyIds.length === 1,
    aliasCollapsed: false,
  }
}

describe('cross-profile alias-aware topology', () => {
  it('aggregates study load and evidence bundles across DOI/PMID representation differences', () => {
    const profiles = [
      {
        kind: 'herbs' as const,
        url: '/herbs/a/',
        file: 'a.json',
        record: {
          slug: 'a',
          sources: [
            { id: 'a1', doi: '10.1234/one', pmid: '12345678' },
            { id: 'a2', doi: '10.1234/two', pmid: '23456789' },
          ],
        },
      },
      {
        kind: 'herbs' as const,
        url: '/herbs/b/',
        file: 'b.json',
        record: {
          slug: 'b',
          sources: [
            { id: 'b1', pmid: '12345678' },
            { id: 'b2', pmid: '23456789' },
          ],
        },
      },
    ]

    const analysis = {
      profiles,
      claimAnalyses: [
        claim('/herbs/a/', 'a-outcome', ['doi:10.1234/one', 'doi:10.1234/two']),
        claim('/herbs/b/', 'b-outcome-1', ['pmid:12345678', 'pmid:23456789']),
        claim('/herbs/b/', 'b-outcome-2', ['pmid:12345678', 'pmid:23456789']),
      ],
    } as unknown as ResearchQualityAnalysis

    const load = analyzeCrossProfileStudyLoad(analysis)
    const firstStudy = load.find((item) => item.studyId === 'doi:10.1234/one')
    expect(firstStudy).toMatchObject({ profileCount: 2, approvedClaimCount: 3 })

    const bundles = analyzeCrossProfileEvidenceBundles(analysis)
    expect(bundles).toHaveLength(1)
    expect(bundles[0]).toMatchObject({
      studyIds: ['doi:10.1234/one', 'doi:10.1234/two'],
      studyCount: 2,
      profileCount: 2,
      approvedClaimCount: 3,
      narrowCrossProfileBundle: true,
    })
  })
})
