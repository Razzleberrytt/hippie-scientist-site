import { describe, expect, it } from 'vitest'

import { canonicalStudyGroups } from '@/lib/research-coverage'
import { analyzeUnderlyingStudyIndependence } from '@/lib/research-underlying-study-independence'
import type { ResearchQualityAnalysis } from '@/lib/research-quality-analysis'

function fixtureAnalysis(): ResearchQualityAnalysis {
  const record = {
    slug: 'example',
    sources: [
      { id: 's1', pmid: '11111111', studyClass: 'rct', title: 'Trial primary publication' },
      { id: 's2', pmid: '22222222', studyClass: 'rct', title: 'Trial follow-up publication' },
      { id: 's3', pmid: '33333333', studyClass: 'narrative-review', title: 'Narrative review' },
    ],
    claimMap: [],
  }
  return {
    cache: {},
    profiles: [{ kind: 'herbs', url: '/herbs/example/', file: 'example.json', record }],
    profileAnalyses: [],
    claimAnalyses: [],
    structuredClaimAnalyses: [],
  } as ResearchQualityAnalysis
}

describe('underlying primary-human inventory counts', () => {
  it('keeps unmapped human publications in inventory and collapses explicit same-trial reuse', () => {
    const analysis = fixtureAnalysis()
    const record = analysis.profiles[0].record
    const studyIds = [...canonicalStudyGroups(record).keys()]
    const first = studyIds.find((studyId) => studyId.includes('11111111')) as string
    const second = studyIds.find((studyId) => studyId.includes('22222222')) as string

    const result = analyzeUnderlyingStudyIndependence({
      analysis,
      trialRegistrationIndependence: {
        studies: [
          { url: '/herbs/example/', studyId: first, stableRegistryId: 'NCT01234567' },
          { url: '/herbs/example/', studyId: second, stableRegistryId: 'NCT01234567' },
        ],
        claims: [],
      } as never,
      evidenceLineage: { studies: [], claims: [] } as never,
    })

    expect(result.profiles).toHaveLength(1)
    expect(result.profiles[0]).toMatchObject({
      url: '/herbs/example/',
      supportedApprovedClaimCount: 0,
      publicationStudyCount: 0,
      underlyingStudyCount: 0,
      inventoryPublicationStudyCount: 3,
      inventoryUnderlyingStudyCount: 2,
      inventoryCollapsedPublicationCount: 1,
      inventoryPublicationsWithIndependenceMetadata: 2,
      inventoryPublicationsWithoutIndependenceMetadata: 1,
      inventoryIndependenceMetadataCoverage: 0.667,
      primaryHumanPublicationCount: 2,
      primaryHumanUnderlyingStudyCount: 1,
      collapsedPrimaryHumanPublicationCount: 1,
      primaryHumanPublicationsWithIndependenceMetadata: 2,
      primaryHumanPublicationsWithoutIndependenceMetadata: 0,
      primaryHumanIndependenceMetadataCoverage: 1,
    })
    expect(result.summary).toMatchObject({
      profilesAnalyzed: 1,
      profilesWithSupportedClaims: 0,
      profilesWithReducedHumanStudyCount: 1,
      profilesWithIncompletePrimaryHumanIndependenceMetadata: 0,
      primaryHumanPublicationCount: 2,
      primaryHumanUnderlyingStudyCount: 1,
      collapsedPrimaryHumanPublicationCount: 1,
    })
  })

  it('tracks primary-human lineage gaps even when evidence is not linked to approved claims', () => {
    const analysis = fixtureAnalysis()
    const studyIds = [...canonicalStudyGroups(analysis.profiles[0].record).keys()]
    const first = studyIds.find((studyId) => studyId.includes('11111111')) as string

    const result = analyzeUnderlyingStudyIndependence({
      analysis,
      trialRegistrationIndependence: {
        studies: [{ url: '/herbs/example/', studyId: first, stableRegistryId: 'NCT01234567' }],
        claims: [],
      } as never,
      evidenceLineage: { studies: [], claims: [] } as never,
    })

    expect(result.profiles[0]).toMatchObject({
      supportedApprovedClaimCount: 0,
      primaryHumanPublicationCount: 2,
      primaryHumanPublicationsWithIndependenceMetadata: 1,
      primaryHumanPublicationsWithoutIndependenceMetadata: 1,
      primaryHumanIndependenceMetadataCoverage: 0.5,
    })
    expect(result.summary.profilesWithIncompletePrimaryHumanIndependenceMetadata).toBe(1)
  })
})
