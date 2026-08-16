import { describe, expect, it } from 'vitest'

import { analyzeOutcomeMetadata } from '@/lib/research-outcome-metadata'
import type { ResearchQualityAnalysis } from '@/lib/research-quality-analysis'
import type { TrialRegistrationIndependenceAnalysis } from '@/lib/research-trial-registration-independence'

function analysis(sources: Array<Record<string, unknown>>, cache: Record<string, Record<string, unknown>> = {}): ResearchQualityAnalysis {
  return {
    cache,
    profiles: [{
      kind: 'herbs',
      url: '/herbs/example/',
      file: 'example.json',
      record: { slug: 'example', sources, claimMap: [] },
    }],
    claimAnalyses: [],
    structuredClaimAnalyses: [],
    profileAnalyses: [],
  } as unknown as ResearchQualityAnalysis
}

function registration(studies: TrialRegistrationIndependenceAnalysis['studies']): TrialRegistrationIndependenceAnalysis {
  return {
    studies,
    claims: [],
    sameTrialReuseClaims: [],
    highConfidenceSameTrialReuseClaims: [],
    summary: {
      canonicalStudies: studies.length,
      studiesWithRegistryCoverage: studies.filter((study) => study.registryIds.length > 0).length,
      studiesWithAmbiguousRegistryEvidence: studies.filter((study) => study.ambiguous).length,
      multiStudyApprovedClaims: 0,
      claimsWithRegistryCoverage: 0,
      claimsWithAmbiguousRegistryEvidence: 0,
      sameTrialReuseClaims: 0,
      highConfidenceSameTrialReuseClaims: 0,
      duplicatePublicationCount: 0,
    },
  }
}

describe('canonical outcome metadata', () => {
  it('preserves explicit outcome hierarchy and registration on one canonical study', () => {
    const input = analysis([{
      id: 's1',
      pmid: '123',
      primaryOutcome: 'Insomnia Severity Index',
      secondaryOutcomes: ['Sleep onset latency', 'Wake after sleep onset'],
      registeredPrimaryOutcome: 'Insomnia Severity Index',
      reportedPrimaryOutcome: 'Insomnia Severity Index',
      primaryOutcomeStatus: 'met',
    }])
    const trialRegistrationIndependence = registration([{
      url: '/herbs/example/',
      studyId: 'pmid:123',
      registryIds: ['NCT12345678'],
      stableRegistryId: 'NCT12345678',
      ambiguous: false,
    }])

    const result = analyzeOutcomeMetadata({ analysis: input, trialRegistrationIndependence })

    expect(result.studies).toHaveLength(1)
    expect(result.studies[0]).toMatchObject({
      primaryOutcomes: ['Insomnia Severity Index'],
      secondaryOutcomes: ['Sleep onset latency', 'Wake after sleep onset'],
      registeredPrimaryOutcomes: ['Insomnia Severity Index'],
      reportedPrimaryOutcomes: ['Insomnia Severity Index'],
      primaryOutcomeStatus: 'met',
      trialRegistrationIds: ['NCT12345678'],
      hasOutcomeMetadata: true,
    })
  })

  it('collapses alias source rows before counting study-level outcome metadata', () => {
    const input = analysis([
      { id: 'a', pmid: '123', doi: '10.1000/example', primaryOutcome: 'Fatigue score' },
      { id: 'b', doi: '10.1000/example', secondaryOutcome: 'Quality of life' },
    ])
    const trialRegistrationIndependence = registration([{
      url: '/herbs/example/',
      studyId: 'doi:10.1000/example',
      registryIds: [],
      stableRegistryId: null,
      ambiguous: false,
    }])

    const result = analyzeOutcomeMetadata({ analysis: input, trialRegistrationIndependence })

    expect(result.summary.canonicalStudies).toBe(1)
    expect(result.studies[0].primaryOutcomes).toEqual(['Fatigue score'])
    expect(result.studies[0].secondaryOutcomes).toEqual(['Quality of life'])
  })

  it('uses explicit publication language for status/flags without inventing outcome names', () => {
    const input = analysis(
      [{ id: 's1', pmid: '123' }],
      { '123': { abstract: 'The primary endpoint was not met. The prespecified primary outcome was not reported and the primary outcome was changed after registration.' } },
    )
    const trialRegistrationIndependence = registration([{
      url: '/herbs/example/',
      studyId: 'pmid:123',
      registryIds: [],
      stableRegistryId: null,
      ambiguous: false,
    }])

    const result = analyzeOutcomeMetadata({ analysis: input, trialRegistrationIndependence })
    const study = result.studies[0]

    expect(study.primaryOutcomes).toEqual([])
    expect(study.registeredPrimaryOutcomes).toEqual([])
    expect(study.primaryOutcomeStatus).toBe('not-met')
    expect(study.explicitOutcomeSwitch).toBe(true)
    expect(study.explicitRegisteredOutcomeNotReported).toBe(true)
  })

  it('does not reinterpret negated statistical significance as a met outcome', () => {
    const input = analysis(
      [{ id: 's1', pmid: '123' }],
      { '123': { abstract: 'The primary outcome was not statistically significant compared with placebo.' } },
    )
    const trialRegistrationIndependence = registration([{
      url: '/herbs/example/',
      studyId: 'pmid:123',
      registryIds: [],
      stableRegistryId: null,
      ambiguous: false,
    }])

    const result = analyzeOutcomeMetadata({ analysis: input, trialRegistrationIndependence })

    expect(result.studies[0].primaryOutcomeStatus).toBe('not-met')
    expect(result.summary.primaryOutcomeNotMet).toBe(1)
  })

  it('does not reinterpret negated superiority or favorability as a met outcome', () => {
    for (const abstract of [
      'The primary outcome was not superior to placebo.',
      'The primary endpoint did not favor treatment over placebo.',
    ]) {
      const input = analysis(
        [{ id: 's1', pmid: '123' }],
        { '123': { abstract } },
      )
      const trialRegistrationIndependence = registration([{
        url: '/herbs/example/',
        studyId: 'pmid:123',
        registryIds: [],
        stableRegistryId: null,
        ambiguous: false,
      }])

      const result = analyzeOutcomeMetadata({ analysis: input, trialRegistrationIndependence })
      expect(result.studies[0].primaryOutcomeStatus).toBe('not-met')
    }
  })

  it('keeps missing outcome metadata unknown', () => {
    const input = analysis([{ id: 's1', pmid: '123', title: 'Randomized clinical trial' }])
    const trialRegistrationIndependence = registration([{
      url: '/herbs/example/',
      studyId: 'pmid:123',
      registryIds: [],
      stableRegistryId: null,
      ambiguous: false,
    }])

    const result = analyzeOutcomeMetadata({ analysis: input, trialRegistrationIndependence })

    expect(result.studies[0]).toMatchObject({
      primaryOutcomeStatus: 'unknown',
      explicitOutcomeSwitch: false,
      explicitRegisteredOutcomeNotReported: false,
      hasOutcomeMetadata: false,
    })
  })
})
