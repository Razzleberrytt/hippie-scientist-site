import { describe, expect, it } from 'vitest'

import { analyzeUnderlyingStudyIndependence } from '@/lib/research-underlying-study-independence'
import type { ResearchQualityAnalysis } from '@/lib/research-quality-analysis'
import type { TrialRegistrationIndependenceAnalysis } from '@/lib/research-trial-registration-independence'
import type { EvidenceLineageAnalysis } from '@/lib/research-evidence-lineage'

function analysis(studyIds: string[], confidence = 0.85): ResearchQualityAnalysis {
  const claim = {
    url: '/herbs/example/',
    claimId: 'claim-1',
    reviewStatus: 'approved',
    approved: true,
    predicate: 'supports_outcome',
    confidence,
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
  return {
    cache: {},
    profiles: [],
    profileAnalyses: [],
    claimAnalyses: [claim],
    structuredClaimAnalyses: [claim],
  }
}

function trialAnalysis(
  sameRegisteredTrialPairs: Array<{ leftStudyId: string; rightStudyId: string; trialRegistrationId: string }> = [],
): TrialRegistrationIndependenceAnalysis {
  return {
    claims: [{
      url: '/herbs/example/',
      claimId: 'claim-1',
      predicate: 'supports_outcome',
      confidence: 0.85,
      apparentStudyCount: 3,
      registryKnownStudyCount: 0,
      registryAmbiguousStudyCount: 0,
      registryCoverage: 0,
      registryAdjustedStudyCount: 3,
      duplicatePublicationCount: 0,
      sameRegisteredTrialPairs,
      sameRegisteredTrialPublicationReuse: sameRegisteredTrialPairs.length > 0,
      highConfidenceSameTrialReuse: sameRegisteredTrialPairs.length > 0,
    }],
    sameTrialReuseClaims: [],
    highConfidenceSameTrialReuseClaims: [],
    summary: {
      multiStudyApprovedClaims: 1,
      claimsWithRegistryCoverage: 0,
      claimsWithAmbiguousRegistryEvidence: 0,
      sameTrialReuseClaims: 0,
      highConfidenceSameTrialReuseClaims: 0,
      duplicatePublicationCount: 0,
    },
  }
}

function lineageAnalysis(
  lineages: Record<string, string[]> = {},
): EvidenceLineageAnalysis {
  const studies = Object.entries(lineages).map(([studyId, lineageIds]) => ({
    url: '/herbs/example/', studyId, lineageIds, explicitLineage: lineageIds.length > 0,
  }))
  return {
    studies,
    claims: [],
    sharedNonRegistryLineageClaims: [],
    highConfidenceSharedNonRegistryLineageClaims: [],
    summary: {
      studies: studies.length,
      studiesWithExplicitLineage: studies.filter((study) => study.explicitLineage).length,
      explicitStudyLineageCoverage: 0,
      multiStudyApprovedClaims: 1,
      sharedNonRegistryLineageClaims: 0,
      highConfidenceSharedNonRegistryLineageClaims: 0,
    },
  }
}

describe('underlying study independence', () => {
  it('combines registered-trial and cohort lineage transitively', () => {
    const result = analyzeUnderlyingStudyIndependence({
      analysis: analysis(['a', 'b', 'c']),
      trialRegistrationIndependence: trialAnalysis([
        { leftStudyId: 'a', rightStudyId: 'b', trialRegistrationId: 'NCT01234567' },
      ]),
      evidenceLineage: lineageAnalysis({
        b: ['cohort:COHORT-1'],
        c: ['cohort:COHORT-1'],
      }),
    })

    expect(result.claims[0]).toMatchObject({
      apparentStudyCount: 3,
      underlyingStudyCount: 1,
      collapsedPublicationCount: 2,
      independenceReduced: true,
      pseudoMultiStudySupport: true,
      highConfidencePseudoMultiStudySupport: true,
    })
    expect(result.claims[0].dependentPublicationGroups).toEqual([['a', 'b', 'c']])
  })

  it('does not collapse publications when no explicit dependence relation exists', () => {
    const result = analyzeUnderlyingStudyIndependence({
      analysis: analysis(['a', 'b', 'c']),
      trialRegistrationIndependence: trialAnalysis(),
      evidenceLineage: lineageAnalysis(),
    })

    expect(result.claims[0]).toMatchObject({
      apparentStudyCount: 3,
      underlyingStudyCount: 3,
      collapsedPublicationCount: 0,
      independenceReduced: false,
      pseudoMultiStudySupport: false,
    })
  })

  it('can reduce support without collapsing an entire claim to one underlying study', () => {
    const result = analyzeUnderlyingStudyIndependence({
      analysis: analysis(['a', 'b', 'c']),
      trialRegistrationIndependence: trialAnalysis([
        { leftStudyId: 'a', rightStudyId: 'b', trialRegistrationId: 'NCT01234567' },
      ]),
      evidenceLineage: lineageAnalysis(),
    })

    expect(result.claims[0]).toMatchObject({
      apparentStudyCount: 3,
      underlyingStudyCount: 2,
      collapsedPublicationCount: 1,
      independenceReduced: true,
      pseudoMultiStudySupport: false,
    })
  })
})
