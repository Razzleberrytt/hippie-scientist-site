import { describe, expect, it } from 'vitest'

import { canonicalStudyGroups } from '@/lib/research-coverage'
import { analyzeUnderlyingStudyIndependence } from '@/lib/research-underlying-study-independence'
import type { ResearchQualityAnalysis } from '@/lib/research-quality-analysis'

function fixtureAnalysis(): ResearchQualityAnalysis {
  const firstRecord = {
    slug: 'first',
    sources: [
      { id: 'first-rct', pmid: '11111111', studyClass: 'rct', title: 'Trial primary paper' },
    ],
    claimMap: [],
  }
  const secondRecord = {
    slug: 'second',
    sources: [
      { id: 'second-rct', pmid: '22222222', studyClass: 'rct', title: 'Trial follow-up paper' },
    ],
    claimMap: [],
  }

  return {
    cache: {},
    profiles: [
      { kind: 'herbs', url: '/herbs/first/', file: 'first.json', record: firstRecord },
      { kind: 'herbs', url: '/herbs/second/', file: 'second.json', record: secondRecord },
    ],
    profileAnalyses: [],
    claimAnalyses: [],
    structuredClaimAnalyses: [],
  } as ResearchQualityAnalysis
}

describe('global underlying-study identity', () => {
  it('separates profile-study incidences from site-wide independent human studies', () => {
    const analysis = fixtureAnalysis()
    const firstStudyId = [...canonicalStudyGroups(analysis.profiles[0].record).keys()][0]
    const secondStudyId = [...canonicalStudyGroups(analysis.profiles[1].record).keys()][0]

    const result = analyzeUnderlyingStudyIndependence({
      analysis,
      trialRegistrationIndependence: {
        studies: [
          { url: '/herbs/first/', studyId: firstStudyId, stableRegistryId: 'NCT01234567' },
          { url: '/herbs/second/', studyId: secondStudyId, stableRegistryId: 'NCT01234567' },
        ],
        claims: [],
      } as never,
      evidenceLineage: { studies: [], claims: [] } as never,
    })

    expect(result.profiles).toHaveLength(2)
    expect(result.profiles.map((profile) => profile.primaryHumanUnderlyingStudyCount)).toEqual([1, 1])
    expect(result.summary).toMatchObject({
      primaryHumanPublicationCount: 2,
      primaryHumanUnderlyingStudyCount: 2,
      collapsedPrimaryHumanPublicationCount: 0,
      globalInventoryPublicationCount: 2,
      globalInventoryUnderlyingStudyCount: 1,
      globalCollapsedInventoryPublicationCount: 1,
      globalPrimaryHumanPublicationCount: 2,
      globalPrimaryHumanUnderlyingStudyCount: 1,
      globalCollapsedPrimaryHumanPublicationCount: 1,
    })
  })
})
