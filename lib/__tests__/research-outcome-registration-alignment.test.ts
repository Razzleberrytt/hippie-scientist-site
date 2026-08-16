import { describe, expect, it } from 'vitest'

import { analyzeOutcomeRegistrationAlignment } from '@/lib/research-outcome-registration-alignment'
import type { OutcomeMetadataAnalysis, StudyOutcomeMetadata } from '@/lib/research-outcome-metadata'

function study(overrides: Partial<StudyOutcomeMetadata> = {}): StudyOutcomeMetadata {
  return {
    url: '/herbs/example/',
    studyId: 'pmid:123',
    trialRegistrationIds: ['NCT12345678'],
    primaryOutcomes: [],
    secondaryOutcomes: [],
    registeredPrimaryOutcomes: [],
    reportedPrimaryOutcomes: [],
    primaryOutcomeStatus: 'unknown',
    explicitOutcomeSwitch: false,
    explicitRegisteredOutcomeNotReported: false,
    structuredFieldCount: 0,
    hasOutcomeMetadata: false,
    ...overrides,
  }
}

function metadata(studies: StudyOutcomeMetadata[]): OutcomeMetadataAnalysis {
  return {
    studies,
    summary: {
      canonicalStudies: studies.length,
      studiesWithOutcomeMetadata: studies.filter((item) => item.hasOutcomeMetadata).length,
      studiesWithPrimaryOutcomes: 0,
      studiesWithSecondaryOutcomes: 0,
      studiesWithRegisteredPrimaryOutcomes: studies.filter((item) => item.registeredPrimaryOutcomes.length > 0).length,
      studiesWithReportedPrimaryOutcomes: studies.filter((item) => item.reportedPrimaryOutcomes.length > 0).length,
      studiesWithRegistryIds: studies.filter((item) => item.trialRegistrationIds.length > 0).length,
      primaryOutcomeNotMet: 0,
      explicitOutcomeSwitches: studies.filter((item) => item.explicitOutcomeSwitch).length,
      explicitRegisteredOutcomeNonReporting: studies.filter((item) => item.explicitRegisteredOutcomeNotReported).length,
    },
  }
}

describe('outcome registration alignment', () => {
  it('matches outcome names after conservative formatting normalization', () => {
    const result = analyzeOutcomeRegistrationAlignment(metadata([
      study({
        registeredPrimaryOutcomes: ['Insomnia Severity Index (ISI)'],
        reportedPrimaryOutcomes: ['Insomnia Severity Index (ISI)'],
      }),
    ]))

    expect(result.studies[0].status).toBe('matched')
    expect(result.summary.matchedStudies).toBe(1)
    expect(result.summary.findings).toBe(0)
  })

  it('detects partial divergence when only some registered outcomes are reported as primary', () => {
    const result = analyzeOutcomeRegistrationAlignment(metadata([
      study({
        registeredPrimaryOutcomes: ['Sleep onset latency', 'Wake after sleep onset'],
        reportedPrimaryOutcomes: ['Sleep onset latency', 'Total sleep time'],
      }),
    ]))

    expect(result.studies[0]).toMatchObject({
      status: 'partial-mismatch',
      missingRegisteredPrimaryOutcomes: ['Wake after sleep onset'],
      unregisteredReportedPrimaryOutcomes: ['Total sleep time'],
      outcomeHierarchyConcern: true,
    })
  })

  it('detects a full mismatch when named registered and reported primaries do not overlap', () => {
    const result = analyzeOutcomeRegistrationAlignment(metadata([
      study({
        registeredPrimaryOutcomes: ['Insomnia Severity Index'],
        reportedPrimaryOutcomes: ['Quality of life'],
      }),
    ]))

    expect(result.studies[0].status).toBe('mismatch')
    expect(result.summary.mismatchStudies).toBe(1)
    expect(result.summary.findings).toBe(1)
  })

  it('keeps missing named outcome metadata unassessable', () => {
    const result = analyzeOutcomeRegistrationAlignment(metadata([
      study({ registeredPrimaryOutcomes: ['Insomnia Severity Index'] }),
    ]))

    expect(result.studies[0].status).toBe('unassessable')
    expect(result.studies[0].outcomeHierarchyConcern).toBe(false)
  })

  it('preserves explicit switch and non-reporting concerns without inventing named mismatches', () => {
    const result = analyzeOutcomeRegistrationAlignment(metadata([
      study({
        explicitOutcomeSwitch: true,
        explicitRegisteredOutcomeNotReported: true,
      }),
    ]))

    expect(result.studies[0].status).toBe('unassessable')
    expect(result.studies[0].outcomeHierarchyConcern).toBe(true)
    expect(result.summary.explicitOutcomeSwitches).toBe(1)
    expect(result.summary.explicitRegisteredOutcomeNonReporting).toBe(1)
  })
})
