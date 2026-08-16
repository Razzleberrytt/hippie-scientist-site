import { describe, expect, it } from 'vitest'

import type { EvidenceLineageAnalysis } from '@/lib/research-evidence-lineage'
import type { ResearchQualityAnalysis } from '@/lib/research-quality-analysis'
import type { TrialRegistrationIndependenceAnalysis } from '@/lib/research-trial-registration-independence'
import { analyzeUnderlyingStudyIndependence } from '@/lib/research-underlying-study-independence'

describe('underlying-study inventory bridge nodes', () => {
  it('uses an unmapped publication to prove transitive dependence without counting it as claim support', () => {
    const analysis = {
      profileAnalyses: [{ url: '/herbs/example/', overDependentOnSingleStudy: false }],
      claimAnalyses: [{
        url: '/herbs/example/',
        claimId: 'claim-1',
        predicate: 'supports_outcome',
        confidence: 0.9,
        studyIds: ['a', 'c'],
        studyCount: 2,
        structuredSupportTier: 'adequate',
      }],
    } as unknown as ResearchQualityAnalysis

    const trialRegistrationIndependence = {
      studies: [
        { url: '/herbs/example/', studyId: 'a', registryIds: ['NCT00001234'], stableRegistryId: 'NCT00001234', ambiguous: false },
        { url: '/herbs/example/', studyId: 'b', registryIds: ['NCT00001234'], stableRegistryId: 'NCT00001234', ambiguous: false },
        { url: '/herbs/example/', studyId: 'c', registryIds: [], stableRegistryId: null, ambiguous: false },
      ],
      claims: [],
      sameTrialReuseClaims: [],
      highConfidenceSameTrialReuseClaims: [],
      summary: {},
    } as unknown as TrialRegistrationIndependenceAnalysis

    const evidenceLineage = {
      studies: [
        { url: '/herbs/example/', studyId: 'a', lineageIds: [], explicitLineage: false },
        { url: '/herbs/example/', studyId: 'b', lineageIds: ['cohort:bridge'], explicitLineage: true },
        { url: '/herbs/example/', studyId: 'c', lineageIds: ['cohort:bridge'], explicitLineage: true },
      ],
      claims: [],
      sharedNonRegistryLineageClaims: [],
      highConfidenceSharedNonRegistryLineageClaims: [],
      summary: {},
    } as unknown as EvidenceLineageAnalysis

    const result = analyzeUnderlyingStudyIndependence({
      analysis,
      trialRegistrationIndependence,
      evidenceLineage,
    })

    expect(result.claims[0]).toMatchObject({
      apparentStudyCount: 2,
      underlyingStudyCount: 1,
      collapsedPublicationCount: 1,
      pseudoMultiStudySupport: true,
      independenceAdjustedStructuredSupportTier: 'single-study',
    })
    expect(result.claims[0].dependentPublicationGroups).toEqual([['a', 'c']])
    expect(result.profiles[0]).toMatchObject({
      publicationStudyCount: 2,
      underlyingStudyCount: 1,
      collapsedPublicationCount: 1,
    })
  })
})
