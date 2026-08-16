import type { ResearchQualityAnalysis } from './research-quality-analysis'
import type { ResearchQualityTopology } from './research-quality-topology'

export type UnderlyingStudySnapshotInvariantFailure = {
  kind: string
  detail: string
}

function claimKey(url: string, claimId: string): string {
  return `${url}::${claimId}`
}

function validAdjustedCount(publicationCount: number, underlyingCount: number): boolean {
  if (publicationCount === 0) return underlyingCount === 0
  return underlyingCount >= 1 && underlyingCount <= publicationCount
}

/**
 * Validate arithmetic and ownership for the canonical underlying-study graph.
 * These checks are implementation invariants, not scientific judgments.
 */
export function validateUnderlyingStudySnapshotInvariants(
  analysis: ResearchQualityAnalysis,
  topology: ResearchQualityTopology,
): UnderlyingStudySnapshotInvariantFailure[] {
  const failures: UnderlyingStudySnapshotInvariantFailure[] = []
  const add = (kind: string, detail: string) => failures.push({ kind, detail })
  const product = topology.underlyingStudyIndependence
  const analysisClaims = new Map(
    analysis.claimAnalyses.map((claim) => [claimKey(claim.url, claim.claimId), claim] as const),
  )
  const multiStudyClaimKeys = new Set(
    analysis.claimAnalyses
      .filter((claim) => claim.studyCount >= 2)
      .map((claim) => claimKey(claim.url, claim.claimId)),
  )
  const profileByUrl = new Map(analysis.profileAnalyses.map((profile) => [profile.url, profile] as const))

  const claimSubsets: Array<[string, typeof product.claims]> = [
    ['reduced', product.reducedClaims],
    ['pseudo', product.pseudoMultiStudyClaims],
    ['high-confidence-pseudo', product.highConfidencePseudoMultiStudyClaims],
    ['support-tier-downgrade', product.supportTierDowngrades],
  ]

  if (product.summary.multiStudyApprovedClaims !== product.claims.length) {
    add('underlying-study-claim-count-mismatch', `summary=${product.summary.multiStudyApprovedClaims}; rows=${product.claims.length}`)
  }
  if (product.claims.length !== multiStudyClaimKeys.size) {
    add('underlying-study-analysis-claim-count-mismatch', `rows=${product.claims.length}; analysis=${multiStudyClaimKeys.size}`)
  }
  if (product.summary.independenceReducedClaims !== product.reducedClaims.length) {
    add('underlying-study-reduced-count-mismatch', `summary=${product.summary.independenceReducedClaims}; rows=${product.reducedClaims.length}`)
  }
  if (product.summary.pseudoMultiStudyClaims !== product.pseudoMultiStudyClaims.length) {
    add('underlying-study-pseudo-count-mismatch', `summary=${product.summary.pseudoMultiStudyClaims}; rows=${product.pseudoMultiStudyClaims.length}`)
  }
  if (product.summary.highConfidencePseudoMultiStudyClaims !== product.highConfidencePseudoMultiStudyClaims.length) {
    add('underlying-study-high-confidence-pseudo-count-mismatch', `summary=${product.summary.highConfidencePseudoMultiStudyClaims}; rows=${product.highConfidencePseudoMultiStudyClaims.length}`)
  }
  if (product.summary.supportTierDowngrades !== product.supportTierDowngrades.length) {
    add('underlying-study-tier-downgrade-count-mismatch', `summary=${product.summary.supportTierDowngrades}; rows=${product.supportTierDowngrades.length}`)
  }
  const collapsedClaimPublications = product.reducedClaims.reduce((sum, claim) => sum + claim.collapsedPublicationCount, 0)
  if (product.summary.collapsedPublicationCount !== collapsedClaimPublications) {
    add('underlying-study-collapsed-publication-count-mismatch', `summary=${product.summary.collapsedPublicationCount}; computed=${collapsedClaimPublications}`)
  }

  const claimKeys = new Set<string>()
  for (const claim of product.claims) {
    const key = claimKey(claim.url, claim.claimId)
    if (claimKeys.has(key)) add('underlying-study-duplicate-claim', key)
    claimKeys.add(key)
    const source = analysisClaims.get(key)
    if (!source) {
      add('underlying-study-unknown-claim', key)
      continue
    }
    if (!multiStudyClaimKeys.has(key)) add('underlying-study-non-multistudy-claim', key)
    if (claim.apparentStudyCount !== source.studyCount) {
      add('underlying-study-apparent-count-mismatch', `${key}: product=${claim.apparentStudyCount}; analysis=${source.studyCount}`)
    }
    if (!validAdjustedCount(claim.apparentStudyCount, claim.underlyingStudyCount)) {
      add('underlying-study-invalid-adjusted-count', `${key}: apparent=${claim.apparentStudyCount}; underlying=${claim.underlyingStudyCount}`)
    }
    const expectedCollapsed = Math.max(0, claim.apparentStudyCount - claim.underlyingStudyCount)
    if (claim.collapsedPublicationCount !== expectedCollapsed) {
      add('underlying-study-claim-collapse-mismatch', `${key}: rows=${claim.collapsedPublicationCount}; expected=${expectedCollapsed}`)
    }
    if (claim.independenceReduced !== (expectedCollapsed > 0)) {
      add('underlying-study-reduced-state-mismatch', `${key}: reduced=${claim.independenceReduced}; collapsed=${expectedCollapsed}`)
    }
    const expectedPseudo = claim.apparentStudyCount >= 2 && claim.underlyingStudyCount === 1
    if (claim.pseudoMultiStudySupport !== expectedPseudo) {
      add('underlying-study-pseudo-state-mismatch', `${key}: pseudo=${claim.pseudoMultiStudySupport}; underlying=${claim.underlyingStudyCount}`)
    }
    if (claim.highConfidencePseudoMultiStudySupport !== (expectedPseudo && claim.confidence >= 0.75)) {
      add('underlying-study-high-confidence-pseudo-state-mismatch', key)
    }
    if (claim.supportTierDowngradedByDependence !== (claim.publicationStructuredSupportTier !== claim.independenceAdjustedStructuredSupportTier)) {
      add('underlying-study-tier-downgrade-state-mismatch', key)
    }
    const sourceStudyIds = new Set(source.studyIds)
    for (const group of claim.dependentPublicationGroups) {
      if (group.length < 2 || group.some((studyId) => !sourceStudyIds.has(studyId))) {
        add('underlying-study-invalid-dependent-group', `${key}: ${group.join(',')}`)
      }
    }
  }

  for (const [label, subset] of claimSubsets) {
    for (const claim of subset) {
      if (!claimKeys.has(claimKey(claim.url, claim.claimId))) {
        add('underlying-study-orphan-subset-claim', `${label}: ${claim.url}::${claim.claimId}`)
      }
    }
  }

  if (product.summary.profilesAnalyzed !== product.profiles.length) {
    add('underlying-study-profile-count-mismatch', `summary=${product.summary.profilesAnalyzed}; rows=${product.profiles.length}`)
  }
  const supportedProfileCount = product.profiles.filter((profile) => profile.supportedApprovedClaimCount > 0).length
  if (product.summary.profilesWithSupportedClaims !== supportedProfileCount) {
    add('underlying-study-supported-profile-count-mismatch', `summary=${product.summary.profilesWithSupportedClaims}; computed=${supportedProfileCount}`)
  }
  const reducedInventoryProfiles = product.profiles.filter((profile) => profile.inventoryCollapsedPublicationCount > 0).length
  if (product.summary.profilesWithReducedStudyCount !== reducedInventoryProfiles) {
    add('underlying-study-reduced-profile-count-mismatch', `summary=${product.summary.profilesWithReducedStudyCount}; computed=${reducedInventoryProfiles}`)
  }
  const reducedHumanProfiles = product.profiles.filter((profile) => profile.collapsedPrimaryHumanPublicationCount > 0).length
  if (product.summary.profilesWithReducedHumanStudyCount !== reducedHumanProfiles) {
    add('underlying-study-reduced-human-profile-count-mismatch', `summary=${product.summary.profilesWithReducedHumanStudyCount}; computed=${reducedHumanProfiles}`)
  }
  const primaryHumanPublicationCount = product.profiles.reduce((sum, profile) => sum + profile.primaryHumanPublicationCount, 0)
  if (product.summary.primaryHumanPublicationCount !== primaryHumanPublicationCount) {
    add('underlying-study-primary-human-publication-count-mismatch', `summary=${product.summary.primaryHumanPublicationCount}; computed=${primaryHumanPublicationCount}`)
  }
  const primaryHumanUnderlyingStudyCount = product.profiles.reduce((sum, profile) => sum + profile.primaryHumanUnderlyingStudyCount, 0)
  if (product.summary.primaryHumanUnderlyingStudyCount !== primaryHumanUnderlyingStudyCount) {
    add('underlying-study-primary-human-adjusted-count-mismatch', `summary=${product.summary.primaryHumanUnderlyingStudyCount}; computed=${primaryHumanUnderlyingStudyCount}`)
  }
  const collapsedPrimaryHumanPublicationCount = product.profiles.reduce((sum, profile) => sum + profile.collapsedPrimaryHumanPublicationCount, 0)
  if (product.summary.collapsedPrimaryHumanPublicationCount !== collapsedPrimaryHumanPublicationCount) {
    add('underlying-study-primary-human-collapse-count-mismatch', `summary=${product.summary.collapsedPrimaryHumanPublicationCount}; computed=${collapsedPrimaryHumanPublicationCount}`)
  }
  if (product.summary.overDependentProfiles !== product.profiles.filter((profile) => profile.overDependentOnSingleUnderlyingStudy).length) {
    add('underlying-study-overdependent-profile-count-mismatch', `summary=${product.summary.overDependentProfiles}`)
  }
  if (product.summary.newlyOverDependentProfiles !== product.newlyOverDependentProfiles.length) {
    add('underlying-study-new-overdependent-count-mismatch', `summary=${product.summary.newlyOverDependentProfiles}; rows=${product.newlyOverDependentProfiles.length}`)
  }

  const profileUrls = new Set<string>()
  for (const profile of product.profiles) {
    if (profileUrls.has(profile.url)) add('underlying-study-duplicate-profile', profile.url)
    profileUrls.add(profile.url)
    const source = profileByUrl.get(profile.url)
    if (!source) {
      add('underlying-study-unknown-profile', profile.url)
      continue
    }
    if (profile.supportedApprovedClaimCount !== source.supportedApprovedClaimCount) {
      add('underlying-study-profile-supported-claim-count-mismatch', `${profile.url}: product=${profile.supportedApprovedClaimCount}; analysis=${source.supportedApprovedClaimCount}`)
    }

    if (!validAdjustedCount(profile.publicationStudyCount, profile.underlyingStudyCount)) {
      add('underlying-study-invalid-profile-adjusted-count', `${profile.url}: publication=${profile.publicationStudyCount}; underlying=${profile.underlyingStudyCount}`)
    }
    const expectedClaimCollapsed = Math.max(0, profile.publicationStudyCount - profile.underlyingStudyCount)
    if (profile.collapsedPublicationCount !== expectedClaimCollapsed) {
      add('underlying-study-profile-collapse-mismatch', `${profile.url}: rows=${profile.collapsedPublicationCount}; expected=${expectedClaimCollapsed}`)
    }

    if (!validAdjustedCount(profile.inventoryPublicationStudyCount, profile.inventoryUnderlyingStudyCount)) {
      add('underlying-study-invalid-inventory-adjusted-count', `${profile.url}: publication=${profile.inventoryPublicationStudyCount}; underlying=${profile.inventoryUnderlyingStudyCount}`)
    }
    const expectedInventoryCollapsed = Math.max(0, profile.inventoryPublicationStudyCount - profile.inventoryUnderlyingStudyCount)
    if (profile.inventoryCollapsedPublicationCount !== expectedInventoryCollapsed) {
      add('underlying-study-inventory-collapse-mismatch', `${profile.url}: rows=${profile.inventoryCollapsedPublicationCount}; expected=${expectedInventoryCollapsed}`)
    }

    if (!validAdjustedCount(profile.primaryHumanPublicationCount, profile.primaryHumanUnderlyingStudyCount)) {
      add('underlying-study-invalid-primary-human-adjusted-count', `${profile.url}: publication=${profile.primaryHumanPublicationCount}; underlying=${profile.primaryHumanUnderlyingStudyCount}`)
    }
    const expectedPrimaryHumanCollapsed = Math.max(0, profile.primaryHumanPublicationCount - profile.primaryHumanUnderlyingStudyCount)
    if (profile.collapsedPrimaryHumanPublicationCount !== expectedPrimaryHumanCollapsed) {
      add('underlying-study-primary-human-collapse-mismatch', `${profile.url}: rows=${profile.collapsedPrimaryHumanPublicationCount}; expected=${expectedPrimaryHumanCollapsed}`)
    }

    if (profile.newlyOverDependentAfterIndependenceAdjustment !== (profile.overDependentOnSingleUnderlyingStudy && !source.overDependentOnSingleStudy)) {
      add('underlying-study-new-overdependent-state-mismatch', profile.url)
    }
  }

  for (const profile of product.newlyOverDependentProfiles) {
    if (!profileUrls.has(profile.url) || !profile.newlyOverDependentAfterIndependenceAdjustment) {
      add('underlying-study-invalid-new-overdependent-profile', profile.url)
    }
  }

  return failures
}
