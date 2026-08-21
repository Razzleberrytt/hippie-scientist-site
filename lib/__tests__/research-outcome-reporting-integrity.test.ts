import { describe, expect, it } from 'vitest'

import { analyzeOutcomeReportingIntegrity } from '@/lib/research-outcome-reporting-integrity'
import type { OutcomeMetadataAnalysis } from '@/lib/research-outcome-metadata'
import type { OutcomeRegistrationAlignmentAnalysis } from '@/lib/research-outcome-registration-alignment'
import type { ResearchQualityAnalysis } from '@/lib/research-quality-analysis'
import type { SelectiveOutcomeReportingReport } from '@/lib/research-selective-outcome-reporting'

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
          { id: 's1', pmid: '123', studyClass: 'rct' },
          { id: 's2', pmid: '456', studyClass: 'rct' },
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

function outcomeMetadata(): OutcomeMetadataAnalysis {
  const studies = [
    {
      url: '/herbs/example/', studyId: 'pmid:123', trialRegistrationIds: ['NCT12345678'],
      primaryOutcomes: [], secondaryOutcomes: [], registeredPrimaryOutcomes: ['ISI'], reportedPrimaryOutcomes: ['Quality of life'],
      primaryOutcomeStatus: 'not-met' as const, explicitOutcomeSwitch: false, explicitRegisteredOutcomeNotReported: false,
      structuredFieldCount: 2, hasOutcomeMetadata: true,
    },
    {
      url: '/herbs/example/', studyId: 'pmid:456', trialRegistrationIds: [],
      primaryOutcomes: [], secondaryOutcomes: [], registeredPrimaryOutcomes: [], reportedPrimaryOutcomes: [],
      primaryOutcomeStatus: 'unknown' as const, explicitOutcomeSwitch: false, explicitRegisteredOutcomeNotReported: false,
      structuredFieldCount: 0, hasOutcomeMetadata: false,
    },
  ]
  return {
    studies,
    summary: {
      canonicalStudies: 2,
      studiesWithOutcomeMetadata: 1,
      studiesWithPrimaryOutcomes: 0,
      studiesWithSecondaryOutcomes: 0,
      studiesWithRegisteredPrimaryOutcomes: 1,
      studiesWithReportedPrimaryOutcomes: 1,
      studiesWithRegistryIds: 1,
      primaryOutcomeNotMet: 1,
      explicitOutcomeSwitches: 0,
      explicitRegisteredOutcomeNonReporting: 0,
    },
  }
}

function alignment(): OutcomeRegistrationAlignmentAnalysis {
  const finding = {
    url: '/herbs/example/',
    studyId: 'pmid:123',
    trialRegistrationIds: ['NCT12345678'],
    status: 'mismatch' as const,
    registeredPrimaryOutcomes: ['ISI'],
    reportedPrimaryOutcomes: ['Quality of life'],
    matchedPrimaryOutcomes: [],
    missingRegisteredPrimaryOutcomes: ['ISI'],
    unregisteredReportedPrimaryOutcomes: ['Quality of life'],
    explicitOutcomeSwitch: false,
    explicitRegisteredOutcomeNotReported: false,
    outcomeHierarchyConcern: true,
  }
  return {
    studies: [finding],
    assessableStudies: [finding],
    findings: [finding],
    summary: {
      canonicalStudies: 1,
      assessableStudies: 1,
      matchedStudies: 0,
      partialMismatchStudies: 0,
      mismatchStudies: 1,
      explicitOutcomeSwitches: 0,
      explicitRegisteredOutcomeNonReporting: 0,
      findings: 1,
    },
  }
}

function selective(): SelectiveOutcomeReportingReport {
  const finding = {
    url: '/herbs/example/',
    claimId: 'claim-1',
    predicate: 'supports_outcome',
    confidence: 0.9,
    humanSourceCount: 2,
    assessableSourceCount: 1,
    registeredOrPrespecifiedPrimaryNullCount: 1,
    favorableSecondaryOrExploratoryCount: 1,
    explicitOutcomeSwitchCount: 0,
    primaryOutcomeNotMetCount: 1,
    selectiveOutcomeRisk: true,
    explicitOutcomeSwitchRisk: false,
    reasons: ['null primary plus favorable secondary'],
  }
  return {
    summary: {
      approvedOutcomeClaims: 1,
      assessableClaims: 1,
      findings: 1,
      highConfidenceFindings: 1,
      selectiveOutcomeRisks: 1,
      explicitOutcomeSwitchRisks: 0,
    },
    claims: [finding],
    findings: [finding],
    highConfidenceFindings: [finding],
  }
}

describe('outcome-reporting integrity', () => {
  it('joins study-level mismatch and claim-level selective reporting into one affected claim', () => {
    const result = analyzeOutcomeReportingIntegrity({
      analysis: analysis(),
      outcomeMetadata: outcomeMetadata(),
      outcomeRegistrationAlignment: alignment(),
      selectiveOutcomeReporting: selective(),
    })

    expect(result.summary.affectedStudies).toBe(1)
    expect(result.summary.affectedApprovedOutcomeClaims).toBe(1)
    expect(result.claims[0]).toMatchObject({
      claimId: 'claim-1',
      affectedStudyIds: ['pmid:123'],
      severity: 'high',
    })
    expect(result.claims[0].risks).toEqual(expect.arrayContaining([
      'registered-reported-primary-mismatch',
      'null-primary-with-favorable-secondary',
    ]))
  })

  it('does not create findings for clean or unassessable studies without selective-reporting risk', () => {
    const cleanAlignment: OutcomeRegistrationAlignmentAnalysis = {
      studies: [{
        url: '/herbs/example/', studyId: 'pmid:456', trialRegistrationIds: [], status: 'unassessable',
        registeredPrimaryOutcomes: [], reportedPrimaryOutcomes: [], matchedPrimaryOutcomes: [],
        missingRegisteredPrimaryOutcomes: [], unregisteredReportedPrimaryOutcomes: [],
        explicitOutcomeSwitch: false, explicitRegisteredOutcomeNotReported: false, outcomeHierarchyConcern: false,
      }],
      assessableStudies: [],
      findings: [],
      summary: {
        canonicalStudies: 1, assessableStudies: 0, matchedStudies: 0, partialMismatchStudies: 0,
        mismatchStudies: 0, explicitOutcomeSwitches: 0, explicitRegisteredOutcomeNonReporting: 0, findings: 0,
      },
    }
    const emptySelective: SelectiveOutcomeReportingReport = {
      summary: {
        approvedOutcomeClaims: 1, assessableClaims: 0, findings: 0, highConfidenceFindings: 0,
        selectiveOutcomeRisks: 0, explicitOutcomeSwitchRisks: 0,
      },
      claims: [], findings: [], highConfidenceFindings: [],
    }

    const result = analyzeOutcomeReportingIntegrity({
      analysis: analysis(),
      outcomeMetadata: outcomeMetadata(),
      outcomeRegistrationAlignment: cleanAlignment,
      selectiveOutcomeReporting: emptySelective,
    })

    expect(result.summary.affectedStudies).toBe(0)
    expect(result.summary.affectedApprovedOutcomeClaims).toBe(0)
  })

  it('does not widen canonical outcome eligibility to benefit-like predicates', () => {
    const result = analyzeOutcomeReportingIntegrity({
      analysis: analysis('benefit'),
      outcomeMetadata: outcomeMetadata(),
      outcomeRegistrationAlignment: alignment(),
      selectiveOutcomeReporting: selective(),
    })

    expect(result.summary.affectedStudies).toBe(1)
    expect(result.summary.affectedApprovedOutcomeClaims).toBe(0)
    expect(result.claims).toEqual([])
  })
})
