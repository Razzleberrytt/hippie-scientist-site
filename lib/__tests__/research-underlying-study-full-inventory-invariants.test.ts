import { describe, expect, it } from 'vitest'

import type { ResearchQualityAnalysis } from '../research-quality-analysis'
import { validateUnderlyingStudySnapshotInvariants } from '../research-underlying-study-snapshot-invariants'
import type { ResearchQualityTopology } from '../research-quality-topology'

function fixture() {
  const analysis = {
    claimAnalyses: [],
    profileAnalyses: [{
      url: '/herbs/example/',
      supportedApprovedClaimCount: 0,
      overDependentOnSingleStudy: false,
    }],
  } as unknown as ResearchQualityAnalysis

  const profile = {
    url: '/herbs/example/',
    supportedApprovedClaimCount: 0,
    publicationStudyCount: 0,
    underlyingStudyCount: 0,
    collapsedPublicationCount: 0,
    inventoryPublicationStudyCount: 2,
    inventoryUnderlyingStudyCount: 1,
    inventoryCollapsedPublicationCount: 1,
    inventoryPublicationsWithIndependenceMetadata: 2,
    inventoryPublicationsWithoutIndependenceMetadata: 0,
    inventoryIndependenceMetadataCoverage: 1,
    primaryHumanPublicationCount: 2,
    primaryHumanUnderlyingStudyCount: 1,
    collapsedPrimaryHumanPublicationCount: 1,
    primaryHumanPublicationsWithIndependenceMetadata: 2,
    primaryHumanPublicationsWithoutIndependenceMetadata: 0,
    primaryHumanIndependenceMetadataCoverage: 1,
    mostUsedUnderlyingStudyId: null,
    mostUsedUnderlyingStudyClaimCount: 0,
    dominantUnderlyingStudySupportedClaimShare: 0,
    underlyingStudyConcentrationIndex: 0,
    effectiveUnderlyingStudyCount: 0,
    overDependentOnSingleUnderlyingStudy: false,
    newlyOverDependentAfterIndependenceAdjustment: false,
  }

  const topology = {
    underlyingStudyIndependence: {
      claims: [],
      reducedClaims: [],
      pseudoMultiStudyClaims: [],
      highConfidencePseudoMultiStudyClaims: [],
      supportTierDowngrades: [],
      profiles: [profile],
      newlyOverDependentProfiles: [],
      summary: {
        multiStudyApprovedClaims: 0,
        independenceReducedClaims: 0,
        pseudoMultiStudyClaims: 0,
        highConfidencePseudoMultiStudyClaims: 0,
        supportTierDowngrades: 0,
        collapsedPublicationCount: 0,
        profilesAnalyzed: 1,
        profilesWithSupportedClaims: 0,
        profilesWithReducedStudyCount: 1,
        profilesWithReducedHumanStudyCount: 1,
        profilesWithIncompletePrimaryHumanIndependenceMetadata: 0,
        primaryHumanPublicationCount: 2,
        primaryHumanUnderlyingStudyCount: 1,
        collapsedPrimaryHumanPublicationCount: 1,
        globalInventoryPublicationCount: 2,
        globalInventoryUnderlyingStudyCount: 1,
        globalCollapsedInventoryPublicationCount: 1,
        globalInventoryPublicationsWithIndependenceMetadata: 2,
        globalInventoryPublicationsWithoutIndependenceMetadata: 0,
        globalInventoryIndependenceMetadataCoverage: 1,
        globalPrimaryHumanPublicationCount: 2,
        globalPrimaryHumanUnderlyingStudyCount: 1,
        globalCollapsedPrimaryHumanPublicationCount: 1,
        globalPrimaryHumanPublicationsWithIndependenceMetadata: 2,
        globalPrimaryHumanPublicationsWithoutIndependenceMetadata: 0,
        globalPrimaryHumanIndependenceMetadataCoverage: 1,
        overDependentProfiles: 0,
        newlyOverDependentProfiles: 0,
      },
    },
  } as unknown as ResearchQualityTopology

  return { analysis, topology }
}

describe('underlying-study full-inventory snapshot invariants', () => {
  it('accepts inventory evidence for a profile with zero approved claim edges', () => {
    const { analysis, topology } = fixture()
    expect(validateUnderlyingStudySnapshotInvariants(analysis, topology)).toEqual([])
  })

  it('detects inventory-vs-summary reduction drift independently of claim-linked counts', () => {
    const { analysis, topology } = fixture()
    topology.underlyingStudyIndependence.summary.profilesWithReducedStudyCount = 0
    const failures = validateUnderlyingStudySnapshotInvariants(analysis, topology)
    expect(failures.map((failure) => failure.kind)).toContain('underlying-study-reduced-profile-count-mismatch')
  })

  it('detects invalid primary-human collapse arithmetic', () => {
    const { analysis, topology } = fixture()
    topology.underlyingStudyIndependence.profiles[0].collapsedPrimaryHumanPublicationCount = 0
    const failures = validateUnderlyingStudySnapshotInvariants(analysis, topology)
    expect(failures.map((failure) => failure.kind)).toContain('underlying-study-primary-human-collapse-mismatch')
  })

  it('detects profile independence metadata coverage drift', () => {
    const { analysis, topology } = fixture()
    topology.underlyingStudyIndependence.profiles[0].primaryHumanPublicationsWithIndependenceMetadata = 1
    const kinds = validateUnderlyingStudySnapshotInvariants(analysis, topology).map((failure) => failure.kind)
    expect(kinds).toContain('underlying-study-profile-primary-human-metadata-gap-mismatch')
    expect(kinds).toContain('underlying-study-profile-primary-human-metadata-coverage-mismatch')
  })
})
