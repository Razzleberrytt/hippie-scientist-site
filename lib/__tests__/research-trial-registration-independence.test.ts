import { describe, expect, it } from 'vitest'

import { canonicalStudyIdentityMap, type ResearchProfile } from '@/lib/research-coverage'
import type { ClaimQualityAnalysis, ResearchQualityAnalysis } from '@/lib/research-quality-analysis'
import {
  analyzeTrialRegistrationIndependence,
  extractTrialRegistryIds,
} from '@/lib/research-trial-registration-independence'

function qualityClaim(studyIds: string[]): ClaimQualityAnalysis {
  return {
    url: '/herbs/example/',
    claimId: 'claim-1',
    reviewStatus: 'approved',
    approved: true,
    predicate: 'supports_outcome',
    confidence: 0.85,
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

function analysis(
  sources: Array<Record<string, unknown>>,
  abstracts: Record<string, string> = {},
): ResearchQualityAnalysis {
  const record: ResearchProfile = {
    slug: 'example',
    sources,
    claimMap: [],
  }
  const identities = canonicalStudyIdentityMap(record)
  const studyIds = sources.map((source) => identities.get(String(source.id))!).filter(Boolean)
  const claim = qualityClaim(studyIds)
  const cache = Object.fromEntries(
    Object.entries(abstracts).map(([pmid, abstract]) => [pmid, { abstract }]),
  )
  return {
    cache,
    profiles: [{ kind: 'herbs', url: '/herbs/example/', file: 'example.json', record }],
    claimAnalyses: [claim],
    structuredClaimAnalyses: [claim],
    profileAnalyses: [],
  }
}

describe('registered-trial publication independence', () => {
  it('normalizes common registry identifiers from text', () => {
    expect(extractTrialRegistryIds('NCT 01234567; ISRCTN 12345678; ACTRN12612345678901')).toEqual([
      'ACTRN12612345678901',
      'ISRCTN12345678',
      'NCT01234567',
    ])
  })

  it('collapses two publications carrying the same stable NCT registration', () => {
    const result = analyzeTrialRegistrationIndependence(analysis([
      { id: 's1', pmid: '111', studyClass: 'rct' },
      { id: 's2', pmid: '222', studyClass: 'rct' },
    ], {
      '111': 'Randomized trial. ClinicalTrials.gov NCT01234567.',
      '222': 'Follow-up publication from NCT01234567.',
    }))

    expect(result.claims[0]).toMatchObject({
      apparentStudyCount: 2,
      registryKnownStudyCount: 2,
      registryAdjustedStudyCount: 1,
      duplicatePublicationCount: 1,
      sameRegisteredTrialPublicationReuse: true,
      highConfidenceSameTrialReuse: true,
    })
    expect(result.claims[0].sameRegisteredTrialPairs[0].trialRegistrationId).toBe('NCT01234567')
  })

  it('keeps publications from different registered trials separate', () => {
    const result = analyzeTrialRegistrationIndependence(analysis([
      { id: 's1', pmid: '111', studyClass: 'rct' },
      { id: 's2', pmid: '222', studyClass: 'rct' },
    ], {
      '111': 'ClinicalTrials.gov NCT01234567.',
      '222': 'ClinicalTrials.gov NCT07654321.',
    }))

    expect(result.claims[0]).toMatchObject({
      registryAdjustedStudyCount: 2,
      duplicatePublicationCount: 0,
      sameRegisteredTrialPublicationReuse: false,
    })
  })

  it('does not collapse a publication that mentions multiple registry IDs', () => {
    const result = analyzeTrialRegistrationIndependence(analysis([
      { id: 's1', pmid: '111', studyClass: 'rct' },
      { id: 's2', pmid: '222', studyClass: 'rct' },
    ], {
      '111': 'Pooled report of NCT01234567 and NCT07654321.',
      '222': 'ClinicalTrials.gov NCT01234567.',
    }))

    expect(result.claims[0]).toMatchObject({
      registryKnownStudyCount: 1,
      registryAmbiguousStudyCount: 1,
      registryAdjustedStudyCount: 2,
      sameRegisteredTrialPublicationReuse: false,
    })
  })

  it('uses structured registration fields when abstract text is unavailable', () => {
    const result = analyzeTrialRegistrationIndependence(analysis([
      { id: 's1', pmid: '111', studyClass: 'rct', trialRegistrationId: 'NCT01234567' },
      { id: 's2', pmid: '222', studyClass: 'rct', registrationId: 'NCT01234567' },
    ]))

    expect(result.claims[0].sameRegisteredTrialPublicationReuse).toBe(true)
    expect(result.claims[0].registryAdjustedStudyCount).toBe(1)
  })
})
