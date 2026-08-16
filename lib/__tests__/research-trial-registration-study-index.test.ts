import { describe, expect, it } from 'vitest'

import { analyzeTrialRegistrationIndependence } from '../research-trial-registration-independence'
import type { ResearchQualityAnalysis } from '../research-quality-analysis'

describe('study-level trial registration index', () => {
  it('preserves canonical registry resolution even when publications do not co-occur on a claim', () => {
    const analysis = {
      profiles: [{
        url: '/herbs/example/',
        record: {
          sources: [
            { id: 'publication-a', pmid: '11111111', trialRegistrationId: 'NCT00001234' },
            { id: 'publication-b', pmid: '22222222', trialRegistrationId: 'NCT00001234' },
            { id: 'ambiguous', pmid: '33333333', trialRegistrationIds: ['NCT00005678', 'NCT00009999'] },
          ],
        },
      }],
      claimAnalyses: [
        { url: '/herbs/example/', claimId: 'claim-a', predicate: 'supports_outcome', confidence: 0.8, studyCount: 1, studyIds: ['pmid:11111111'] },
        { url: '/herbs/example/', claimId: 'claim-b', predicate: 'supports_outcome', confidence: 0.8, studyCount: 1, studyIds: ['pmid:22222222'] },
      ],
      cache: {},
    } as unknown as ResearchQualityAnalysis

    const result = analyzeTrialRegistrationIndependence(analysis)

    expect(result.claims).toHaveLength(0)
    expect(result.studies).toEqual([
      {
        url: '/herbs/example/',
        studyId: 'pmid:11111111',
        registryIds: ['NCT00001234'],
        stableRegistryId: 'NCT00001234',
        ambiguous: false,
      },
      {
        url: '/herbs/example/',
        studyId: 'pmid:22222222',
        registryIds: ['NCT00001234'],
        stableRegistryId: 'NCT00001234',
        ambiguous: false,
      },
      {
        url: '/herbs/example/',
        studyId: 'pmid:33333333',
        registryIds: ['NCT00005678', 'NCT00009999'],
        stableRegistryId: null,
        ambiguous: true,
      },
    ])
    expect(result.summary).toMatchObject({
      canonicalStudies: 3,
      studiesWithRegistryCoverage: 2,
      studiesWithAmbiguousRegistryEvidence: 1,
      multiStudyApprovedClaims: 0,
    })
  })
})
