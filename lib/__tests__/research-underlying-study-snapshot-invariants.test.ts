import { describe, expect, it } from 'vitest'

import type { ResearchQualityAnalysis } from '@/lib/research-quality-analysis'
import type { ResearchQualityTopology } from '@/lib/research-quality-topology'
import { validateUnderlyingStudySnapshotInvariants } from '@/lib/research-underlying-study-snapshot-invariants'

function fixtures() {
  const analysis = {
    claimAnalyses: [{
      url: '/herbs/example/',
      claimId: 'claim-1',
      confidence: 0.9,
      studyIds: ['a', 'b'],
      studyCount: 2,
    }],
    profileAnalyses: [{
      url: '/herbs/example/',
      supportedApprovedClaimCount: 1,
      overDependentOnSingleStudy: false,
    }],
  } as unknown as ResearchQualityAnalysis

  const claim = {
    url: '/herbs/example/',
    claimId: 'claim-1',
    predicate: 'supports_outcome',
    confidence: 0.9,
    apparentStudyCount: 2,
    underlyingStudyCount: 1,
    collapsedPublicationCount: 1,
    dependentPublicationGroups: [['a', 'b']],
    publicationStructuredSupportTier: 'adequate',
    independenceAdjustedStructuredSupportTier: 'single-study',
    supportTierDowngradedByDependence: true,
    independenceReduced: true,
    pseudoMultiStudySupport: true,
    highConfidencePseudoMultiStudySupport: true,
  }
  const profile = {
    url: '/herbs/example/',
    supportedApprovedClaimCount: 1,
    publicationStudyCount: 2,
    underlyingStudyCount: 1,
    collapsedPublicationCount: 1,
    inventoryPublicationStudyCount: 2,
    inventoryUnderlyingStudyCount: 1,
    inventoryCollapsedPublicationCount: 1,
    primaryHumanPublicationCount: 2,
    primaryHumanUnderlyingStudyCount: 1,
    collapsedPrimaryHumanPublicationCount: 1,
    mostUsedUnderlyingStudyId: 'a',
    mostUsedUnderlyingStudyClaimCount: 1,
    dominantUnderlyingStudySupportedClaimShare: 1,
    underlyingStudyConcentrationIndex: 1,
    effectiveUnderlyingStudyCount: 1,
    overDependentOnSingleUnderlyingStudy: false,
    newlyOverDependentAfterIndependenceAdjustment: false,
  }
  const topology = {
    underlyingStudyIndependence: {
      claims: [claim],
      reducedClaims: [claim],
      pseudoMultiStudyClaims: [claim],
      highConfidencePseudoMultiStudyClaims: [claim],
      supportTierDowngrades: [claim],
      profiles: [profile],
      newlyOverDependentProfiles: [],
      summary: {
        multiStudyApprovedClaims: 1,
        independenceReducedClaims: 1,
        pseudoMultiStudyClaims: 1,
        highConfidencePseudoMultiStudyClaims: 1,
        supportTierDowngrades: 1,
        collapsedPublicationCount: 1,
        profilesAnalyzed: 1,
        profilesWithSupportedClaims: 1,
        profilesWithReducedStudyCount: 1,
        profilesWithReducedHumanStudyCount: 1,
        primaryHumanPublicationCount: 2,
        primaryHumanUnderlyingStudyCount: 1,
        collapsedPrimaryHumanPublicationCount: 1,
        globalInventoryPublicationCount: 2,
        globalInventoryUnderlyingStudyCount: 1,
        globalCollapsedInventoryPublicationCount: 1,
        globalPrimaryHumanPublicationCount: 2,
        globalPrimaryHumanUnderlyingStudyCount: 1,
        globalCollapsedPrimaryHumanPublicationCount: 1,
        overDependentProfiles: 0,
        newlyOverDependentProfiles: 0,
      },
    },
  } as unknown as ResearchQualityTopology

  return { analysis, topology }
}

describe('underlying-study snapshot invariants', () => {
  it('accepts a self-consistent independence product', () => {
    const { analysis, topology } = fixtures()
    expect(validateUnderlyingStudySnapshotInvariants(analysis, topology)).toEqual([])
  })

  it('rejects impossible adjusted study arithmetic', () => {
    const { analysis, topology } = fixtures()
    topology.underlyingStudyIndependence.claims[0].underlyingStudyCount = 3
    const kinds = validateUnderlyingStudySnapshotInvariants(analysis, topology).map((failure) => failure.kind)
    expect(kinds).toContain('underlying-study-invalid-adjusted-count')
    expect(kinds).toContain('underlying-study-claim-collapse-mismatch')
  })

  it('rejects subset and summary count drift', () => {
    const { analysis, topology } = fixtures()
    topology.underlyingStudyIndependence.summary.pseudoMultiStudyClaims = 0
    const kinds = validateUnderlyingStudySnapshotInvariants(analysis, topology).map((failure) => failure.kind)
    expect(kinds).toContain('underlying-study-pseudo-count-mismatch')
  })

  it('rejects global underlying-study arithmetic drift', () => {
    const { analysis, topology } = fixtures()
    topology.underlyingStudyIndependence.summary.globalPrimaryHumanUnderlyingStudyCount = 2
    const kinds = validateUnderlyingStudySnapshotInvariants(analysis, topology).map((failure) => failure.kind)
    expect(kinds).toContain('underlying-study-global-primary-human-collapse-mismatch')
    expect(kinds).toContain('underlying-study-global-primary-human-underlying-exceeds-incidences')
  })

  it('rejects impossible global counts above profile incidences', () => {
    const { analysis, topology } = fixtures()
    topology.underlyingStudyIndependence.summary.globalInventoryPublicationCount = 3
    topology.underlyingStudyIndependence.summary.globalCollapsedInventoryPublicationCount = 2
    const kinds = validateUnderlyingStudySnapshotInvariants(analysis, topology).map((failure) => failure.kind)
    expect(kinds).toContain('underlying-study-global-publication-exceeds-incidences')
  })
})
