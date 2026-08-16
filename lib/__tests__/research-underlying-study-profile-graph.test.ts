import { describe, expect, it } from 'vitest'

import { analyzeUnderlyingStudyIndependence } from '../research-underlying-study-independence'
import type { ResearchQualityAnalysis } from '../research-quality-analysis'
import type { TrialRegistrationIndependenceAnalysis } from '../research-trial-registration-independence'
import type { EvidenceLineageAnalysis } from '../research-evidence-lineage'

function claim(claimId: string, studyIds: string[]) {
  return {
    url: '/herbs/example/',
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
    structuredSupportTier: studyIds.length === 1 ? 'single-study' as const : 'adequate' as const,
    weakStructuredClaim: studyIds.length === 1,
    highConfidenceWeakStructured: studyIds.length === 1,
    highConfidenceWeakOutcome: false,
    singleStudy: studyIds.length === 1,
    aliasCollapsed: false,
  }
}

describe('profile-wide underlying study graph', () => {
  it('combines registry and cohort relations across claims and exposes false diversification', () => {
    const claims = [
      claim('claim-ac', ['a', 'c']),
      claim('claim-b', ['b']),
      claim('claim-a', ['a']),
    ]
    const analysis = {
      cache: {},
      profiles: [],
      claimAnalyses: claims,
      structuredClaimAnalyses: claims,
      profileAnalyses: [{
        url: '/herbs/example/',
        overDependentOnSingleStudy: false,
      }],
    } as unknown as ResearchQualityAnalysis

    const trialRegistrationIndependence = {
      studies: [
        { url: '/herbs/example/', studyId: 'a', registryIds: ['NCT01234567'], stableRegistryId: 'NCT01234567', ambiguous: false },
        { url: '/herbs/example/', studyId: 'b', registryIds: ['NCT01234567'], stableRegistryId: 'NCT01234567', ambiguous: false },
        { url: '/herbs/example/', studyId: 'c', registryIds: [], stableRegistryId: null, ambiguous: false },
      ],
      claims: [],
      sameTrialReuseClaims: [],
      highConfidenceSameTrialReuseClaims: [],
      summary: {
        canonicalStudies: 3,
        studiesWithRegistryCoverage: 2,
        studiesWithAmbiguousRegistryEvidence: 0,
        multiStudyApprovedClaims: 1,
        claimsWithRegistryCoverage: 0,
        claimsWithAmbiguousRegistryEvidence: 0,
        sameTrialReuseClaims: 0,
        highConfidenceSameTrialReuseClaims: 0,
        duplicatePublicationCount: 0,
      },
    } satisfies TrialRegistrationIndependenceAnalysis

    const evidenceLineage = {
      studies: [
        { url: '/herbs/example/', studyId: 'b', lineageIds: ['cohort:COHORT-1'], explicitLineage: true },
        { url: '/herbs/example/', studyId: 'c', lineageIds: ['cohort:COHORT-1'], explicitLineage: true },
      ],
      claims: [],
      sharedNonRegistryLineageClaims: [],
      highConfidenceSharedNonRegistryLineageClaims: [],
      summary: {
        studies: 2,
        studiesWithExplicitLineage: 2,
        explicitStudyLineageCoverage: 1,
        multiStudyApprovedClaims: 1,
        sharedNonRegistryLineageClaims: 0,
        highConfidenceSharedNonRegistryLineageClaims: 0,
      },
    } satisfies EvidenceLineageAnalysis

    const result = analyzeUnderlyingStudyIndependence({
      analysis,
      trialRegistrationIndependence,
      evidenceLineage,
    })

    expect(result.claims.find((item) => item.claimId === 'claim-ac')).toMatchObject({
      apparentStudyCount: 2,
      underlyingStudyCount: 1,
      collapsedPublicationCount: 1,
      pseudoMultiStudySupport: true,
      independenceAdjustedStructuredSupportTier: 'single-study',
    })
    expect(result.profiles[0]).toMatchObject({
      publicationStudyCount: 3,
      underlyingStudyCount: 1,
      collapsedPublicationCount: 2,
      mostUsedUnderlyingStudyClaimCount: 3,
      dominantUnderlyingStudySupportedClaimShare: 1,
      effectiveUnderlyingStudyCount: 1,
      overDependentOnSingleUnderlyingStudy: true,
      newlyOverDependentAfterIndependenceAdjustment: true,
    })
    expect(result.summary).toMatchObject({
      profilesWithReducedStudyCount: 1,
      overDependentProfiles: 1,
      newlyOverDependentProfiles: 1,
    })
  })
})
