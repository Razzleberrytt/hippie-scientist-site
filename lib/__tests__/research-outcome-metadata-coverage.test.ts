import { describe, expect, it } from 'vitest'

import { analyzeOutcomeMetadataCoverage } from '@/lib/research-outcome-metadata-coverage'
import type { OutcomeMetadataAnalysis } from '@/lib/research-outcome-metadata'
import type { ResearchQualityAnalysis } from '@/lib/research-quality-analysis'

function analysis(predicate = 'supports_outcome'): ResearchQualityAnalysis {
  return {
    cache: {},
    profiles: [{
      kind: 'herbs',
      url: '/herbs/example/',
      file: 'example.json',
      record: {
        slug: 'example',
        sources: [
          { id: 's1', pmid: '1', studyClass: 'rct' },
          { id: 's2', pmid: '2', studyClass: 'controlled-trial' },
          { id: 's3', pmid: '3', studyClass: 'rct' },
        ],
        claimMap: [{
          id: 'claim-1',
          predicate,
          confidence: 0.9,
          reviewStatus: 'approved',
          sourceRefIds: ['s1', 's2'],
        }],
      },
    }],
    claimAnalyses: [],
    structuredClaimAnalyses: [],
    profileAnalyses: [],
  } as unknown as ResearchQualityAnalysis
}

function metadata(): OutcomeMetadataAnalysis {
  return {
    studies: [
      {
        url: '/herbs/example/', studyId: 'pmid:1', trialRegistrationIds: ['NCT12345678'],
        primaryOutcomes: ['ISI'], secondaryOutcomes: [], registeredPrimaryOutcomes: ['ISI'], reportedPrimaryOutcomes: [],
        primaryOutcomeStatus: 'unknown', explicitOutcomeSwitch: false, explicitRegisteredOutcomeNotReported: false,
        structuredFieldCount: 2, hasOutcomeMetadata: true,
      },
      {
        url: '/herbs/example/', studyId: 'pmid:2', trialRegistrationIds: [],
        primaryOutcomes: [], secondaryOutcomes: [], registeredPrimaryOutcomes: [], reportedPrimaryOutcomes: [],
        primaryOutcomeStatus: 'unknown', explicitOutcomeSwitch: false, explicitRegisteredOutcomeNotReported: false,
        structuredFieldCount: 0, hasOutcomeMetadata: false,
      },
      {
        url: '/herbs/example/', studyId: 'pmid:3', trialRegistrationIds: [],
        primaryOutcomes: [], secondaryOutcomes: [], registeredPrimaryOutcomes: [], reportedPrimaryOutcomes: [],
        primaryOutcomeStatus: 'unknown', explicitOutcomeSwitch: false, explicitRegisteredOutcomeNotReported: false,
        structuredFieldCount: 0, hasOutcomeMetadata: false,
      },
    ],
    summary: {
      canonicalStudies: 3,
      studiesWithOutcomeMetadata: 1,
      studiesWithPrimaryOutcomes: 1,
      studiesWithSecondaryOutcomes: 0,
      studiesWithRegisteredPrimaryOutcomes: 1,
      studiesWithReportedPrimaryOutcomes: 0,
      studiesWithRegistryIds: 1,
      primaryOutcomeNotMet: 0,
      explicitOutcomeSwitches: 0,
      explicitRegisteredOutcomeNonReporting: 0,
    },
  }
}

describe('outcome metadata coverage', () => {
  it('flags profiles with sparse primary-human outcome metadata and named alignment data', () => {
    const result = analyzeOutcomeMetadataCoverage({ analysis: analysis(), outcomeMetadata: metadata() })

    expect(result.profiles[0]).toMatchObject({
      primaryHumanStudies: 3,
      studiesWithOutcomeMetadata: 1,
      studiesWithNamedAlignmentData: 0,
      lowOutcomeMetadataCoverage: true,
      lowNamedAlignmentCoverage: true,
    })
    expect(result.summary.profileCoverageGaps).toBe(1)
  })

  it('flags high-confidence approved outcome claims that cannot be directly aligned', () => {
    const result = analyzeOutcomeMetadataCoverage({ analysis: analysis(), outcomeMetadata: metadata() })

    expect(result.claims[0]).toMatchObject({
      claimId: 'claim-1',
      primaryHumanStudies: 2,
      outcomeMetadataCoverage: 0.5,
      namedAlignmentCoverage: 0,
      outcomeMetadataGap: true,
      highConfidenceOutcomeMetadataGap: true,
    })
    expect(result.summary.highConfidenceClaimCoverageGaps).toBe(1)
  })

  it('does not confuse absence of primary-human evidence with an outcome metadata gap', () => {
    const input = analysis()
    input.profiles[0].record.sources = [{ id: 's1', pmid: '1', studyClass: 'systematic-review' }]
    input.profiles[0].record.claimMap![0].sourceRefIds = ['s1']

    const result = analyzeOutcomeMetadataCoverage({ analysis: input, outcomeMetadata: metadata() })

    expect(result.profiles[0].primaryHumanStudies).toBe(0)
    expect(result.profiles[0].lowOutcomeMetadataCoverage).toBe(false)
    expect(result.claims).toHaveLength(0)
  })

  it('does not widen canonical outcome eligibility to benefit-like predicates', () => {
    const result = analyzeOutcomeMetadataCoverage({ analysis: analysis('benefit'), outcomeMetadata: metadata() })

    expect(result.profiles[0].primaryHumanStudies).toBe(3)
    expect(result.summary.approvedOutcomeClaimsWithPrimaryHumanEvidence).toBe(0)
    expect(result.claims).toEqual([])
    expect(result.claimCoverageGaps).toEqual([])
  })
})
