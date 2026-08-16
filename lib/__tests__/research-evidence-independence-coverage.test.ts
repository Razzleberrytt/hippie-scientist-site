import { describe, expect, it } from 'vitest'

import { analyzeEvidenceIndependenceCoverage } from '@/lib/research-evidence-independence-coverage'

function inputs() {
  return {
    trialRegistrationIndependence: {
      claims: [], sameTrialReuseClaims: [], highConfidenceSameTrialReuseClaims: [],
      summary: { multiStudyApprovedClaims: 0, claimsWithRegistryCoverage: 0, claimsWithAmbiguousRegistryEvidence: 0, sameTrialReuseClaims: 0, highConfidenceSameTrialReuseClaims: 0, duplicatePublicationCount: 0 },
    },
    evidenceLineage: {
      studies: [], claims: [], sharedNonRegistryLineageClaims: [], highConfidenceSharedNonRegistryLineageClaims: [],
      summary: { studies: 0, studiesWithExplicitLineage: 0, explicitStudyLineageCoverage: 0, multiStudyApprovedClaims: 0, sharedNonRegistryLineageClaims: 0, highConfidenceSharedNonRegistryLineageClaims: 0 },
    },
  }
}

describe('evidence independence coverage', () => {
  it('keeps missing lineage unknown instead of treating it as dependence', () => {
    const value = inputs()
    value.trialRegistrationIndependence.claims.push({
      url: '/herbs/a/', claimId: 'c1', predicate: 'supports', confidence: 0.8,
      apparentStudyCount: 3, registryKnownStudyCount: 0, registryAmbiguousStudyCount: 0,
      registryCoverage: 0, registryAdjustedStudyCount: 3, duplicatePublicationCount: 0,
      sameRegisteredTrialPairs: [], sameRegisteredTrialPublicationReuse: false, highConfidenceSameTrialReuse: false,
    })
    value.evidenceLineage.claims.push({
      url: '/herbs/a/', claimId: 'c1', confidence: 0.8, studyCount: 3,
      studiesWithExplicitLineage: 0, explicitLineageCoverage: 0, repeatedExplicitLineages: [],
      sharedNonRegistryLineage: false, highConfidenceSharedNonRegistryLineage: false,
    })

    const result = analyzeEvidenceIndependenceCoverage(value)
    expect(result.claims[0]).toMatchObject({
      combinedCoverage: 0,
      unresolvedStudyCount: 3,
      independenceUnresolved: true,
      highConfidenceIndependenceUnresolved: true,
    })
  })

  it('uses the stronger explicit coverage rather than adding overlapping sources', () => {
    const value = inputs()
    value.trialRegistrationIndependence.claims.push({
      url: '/herbs/a/', claimId: 'c1', predicate: 'supports', confidence: 0.7,
      apparentStudyCount: 4, registryKnownStudyCount: 2, registryAmbiguousStudyCount: 0,
      registryCoverage: 0.5, registryAdjustedStudyCount: 4, duplicatePublicationCount: 0,
      sameRegisteredTrialPairs: [], sameRegisteredTrialPublicationReuse: false, highConfidenceSameTrialReuse: false,
    })
    value.evidenceLineage.claims.push({
      url: '/herbs/a/', claimId: 'c1', confidence: 0.7, studyCount: 4,
      studiesWithExplicitLineage: 3, explicitLineageCoverage: 0.75, repeatedExplicitLineages: [],
      sharedNonRegistryLineage: false, highConfidenceSharedNonRegistryLineage: false,
    })

    const result = analyzeEvidenceIndependenceCoverage(value)
    expect(result.claims[0]).toMatchObject({ combinedCoverage: 0.75, unresolvedStudyCount: 1 })
  })

  it('marks a claim fully resolved when either explicit lineage system covers every study', () => {
    const value = inputs()
    value.trialRegistrationIndependence.claims.push({
      url: '/herbs/a/', claimId: 'c1', predicate: 'supports', confidence: 0.9,
      apparentStudyCount: 2, registryKnownStudyCount: 2, registryAmbiguousStudyCount: 0,
      registryCoverage: 1, registryAdjustedStudyCount: 2, duplicatePublicationCount: 0,
      sameRegisteredTrialPairs: [], sameRegisteredTrialPublicationReuse: false, highConfidenceSameTrialReuse: false,
    })

    const result = analyzeEvidenceIndependenceCoverage(value)
    expect(result.claims[0]).toMatchObject({ combinedCoverage: 1, unresolvedStudyCount: 0, independenceUnresolved: false })
    expect(result.summary.fullyResolvedClaims).toBe(1)
  })
})
