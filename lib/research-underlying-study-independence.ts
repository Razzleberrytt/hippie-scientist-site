import {
  PRIMARY_HUMAN_STUDY_CLASSES,
  canonicalStudyClass,
  canonicalStudyGroups,
  crossProfileStudyIdentity,
  crossProfileStudyIdentityMap,
} from './research-coverage'
import type { EvidenceLineageAnalysis } from './research-evidence-lineage'
import type { ResearchQualityAnalysis, StructuredSupportTier } from './research-quality-analysis'
import type { TrialRegistrationIndependenceAnalysis } from './research-trial-registration-independence'

export type ClaimUnderlyingStudyIndependence = {
  url: string
  claimId: string
  predicate: string
  confidence: number
  apparentStudyCount: number
  underlyingStudyCount: number
  collapsedPublicationCount: number
  dependentPublicationGroups: string[][]
  publicationStructuredSupportTier: StructuredSupportTier
  independenceAdjustedStructuredSupportTier: StructuredSupportTier
  supportTierDowngradedByDependence: boolean
  independenceReduced: boolean
  pseudoMultiStudySupport: boolean
  highConfidencePseudoMultiStudySupport: boolean
}

export type ProfileUnderlyingStudyIndependence = {
  url: string
  supportedApprovedClaimCount: number
  /** Claim-linked canonical publications. */
  publicationStudyCount: number
  /** Claim-linked underlying evidence units after explicit dependence collapse. */
  underlyingStudyCount: number
  collapsedPublicationCount: number
  /** Full canonical inventory, including studies not linked to approved claims. */
  inventoryPublicationStudyCount: number
  inventoryUnderlyingStudyCount: number
  inventoryCollapsedPublicationCount: number
  primaryHumanPublicationCount: number
  primaryHumanUnderlyingStudyCount: number
  collapsedPrimaryHumanPublicationCount: number
  mostUsedUnderlyingStudyId: string | null
  mostUsedUnderlyingStudyClaimCount: number
  dominantUnderlyingStudySupportedClaimShare: number
  underlyingStudyConcentrationIndex: number
  effectiveUnderlyingStudyCount: number
  overDependentOnSingleUnderlyingStudy: boolean
  newlyOverDependentAfterIndependenceAdjustment: boolean
}

export type UnderlyingStudyIndependenceAnalysis = {
  claims: ClaimUnderlyingStudyIndependence[]
  reducedClaims: ClaimUnderlyingStudyIndependence[]
  pseudoMultiStudyClaims: ClaimUnderlyingStudyIndependence[]
  highConfidencePseudoMultiStudyClaims: ClaimUnderlyingStudyIndependence[]
  supportTierDowngrades: ClaimUnderlyingStudyIndependence[]
  profiles: ProfileUnderlyingStudyIndependence[]
  newlyOverDependentProfiles: ProfileUnderlyingStudyIndependence[]
  summary: {
    multiStudyApprovedClaims: number
    independenceReducedClaims: number
    pseudoMultiStudyClaims: number
    highConfidencePseudoMultiStudyClaims: number
    supportTierDowngrades: number
    collapsedPublicationCount: number
    profilesAnalyzed: number
    profilesWithSupportedClaims: number
    profilesWithReducedStudyCount: number
    profilesWithReducedHumanStudyCount: number
    /** Profile-study incidences; a publication reused on two profiles counts twice. */
    primaryHumanPublicationCount: number
    /** Profile-study incidences after profile-local independence adjustment. */
    primaryHumanUnderlyingStudyCount: number
    /** Profile-incidence collapse delta. */
    collapsedPrimaryHumanPublicationCount: number
    /** Site-wide unique publication identities after DOI/PMID alias collapse. */
    globalInventoryPublicationCount: number
    /** Site-wide underlying evidence units after cross-profile registry/lineage collapse. */
    globalInventoryUnderlyingStudyCount: number
    globalCollapsedInventoryPublicationCount: number
    /** Site-wide unique primary-human publication identities. */
    globalPrimaryHumanPublicationCount: number
    /** Site-wide independent primary-human evidence units. */
    globalPrimaryHumanUnderlyingStudyCount: number
    globalCollapsedPrimaryHumanPublicationCount: number
    overDependentProfiles: number
    newlyOverDependentProfiles: number
  }
}

export type UnderlyingStudyIndependenceInputs = {
  analysis: ResearchQualityAnalysis
  trialRegistrationIndependence: TrialRegistrationIndependenceAnalysis
  evidenceLineage: EvidenceLineageAnalysis
}

type Union = ReturnType<typeof createUnion>

type GlobalInventoryIndependence = {
  publicationCount: number
  underlyingStudyCount: number
  collapsedPublicationCount: number
  primaryHumanPublicationCount: number
  primaryHumanUnderlyingStudyCount: number
  collapsedPrimaryHumanPublicationCount: number
}

function round(value: number, digits = 3): number {
  const scale = 10 ** digits
  return Math.round(value * scale) / scale
}

function createUnion(studyIds: string[]) {
  const parent = new Map(studyIds.map((studyId) => [studyId, studyId]))
  const find = (value: string): string => {
    const current = parent.get(value) ?? value
    if (current === value) return value
    const root = find(current)
    parent.set(value, root)
    return root
  }
  const union = (left: string, right: string) => {
    if (!parent.has(left) || !parent.has(right)) return
    const leftRoot = find(left)
    const rightRoot = find(right)
    if (leftRoot === rightRoot) return
    const [keep, merge] = [leftRoot, rightRoot].sort()
    parent.set(merge, keep)
  }
  return { find, union }
}

function unionGroups(union: Union, groups: Iterable<string[]>) {
  for (const studies of groups) {
    if (studies.length < 2) continue
    for (let index = 1; index < studies.length; index += 1) union.union(studies[0], studies[index])
  }
}

function addStudy(studyIdsByUrl: Map<string, Set<string>>, url: string, studyId: string) {
  const studies = studyIdsByUrl.get(url) ?? new Set<string>()
  studies.add(studyId)
  studyIdsByUrl.set(url, studies)
}

/**
 * Build one explicit dependence graph per profile. Every canonical inventory
 * study is registered before trial/cohort/dataset/parent-study relations are
 * applied. This prevents unclaimed/orphan studies from disappearing from
 * inventory-level independence counts while still keeping claim concentration
 * weighted only by approved claim edges.
 */
function buildProfileUnions(inputs: UnderlyingStudyIndependenceInputs): Map<string, Union> {
  const studyIdsByUrl = new Map<string, Set<string>>()
  for (const profile of inputs.analysis.profiles) {
    for (const studyId of canonicalStudyGroups(profile.record).keys()) {
      addStudy(studyIdsByUrl, profile.url, studyId)
    }
  }
  for (const claim of inputs.analysis.claimAnalyses) {
    for (const studyId of claim.studyIds) addStudy(studyIdsByUrl, claim.url, studyId)
  }
  for (const study of inputs.trialRegistrationIndependence.studies ?? []) {
    addStudy(studyIdsByUrl, study.url, study.studyId)
  }
  for (const study of inputs.evidenceLineage.studies) {
    addStudy(studyIdsByUrl, study.url, study.studyId)
  }

  const unions = new Map<string, Union>()
  for (const [url, studyIds] of studyIdsByUrl) unions.set(url, createUnion([...studyIds]))

  const registryGroups = new Map<string, string[]>()
  for (const study of inputs.trialRegistrationIndependence.studies ?? []) {
    if (!study.stableRegistryId) continue
    const key = `${study.url}::${study.stableRegistryId}`
    const group = registryGroups.get(key) ?? []
    group.push(study.studyId)
    registryGroups.set(key, group)
  }
  for (const [key, studies] of registryGroups) {
    const separator = key.lastIndexOf('::')
    const url = key.slice(0, separator)
    const union = unions.get(url)
    if (union) unionGroups(union, [studies])
  }

  for (const claim of inputs.trialRegistrationIndependence.claims) {
    const union = unions.get(claim.url)
    if (!union) continue
    for (const pair of claim.sameRegisteredTrialPairs) union.union(pair.leftStudyId, pair.rightStudyId)
  }

  const lineageGroups = new Map<string, string[]>()
  for (const study of inputs.evidenceLineage.studies) {
    for (const lineageId of study.lineageIds) {
      const key = `${study.url}::${lineageId}`
      const group = lineageGroups.get(key) ?? []
      group.push(study.studyId)
      lineageGroups.set(key, group)
    }
  }
  for (const [key, studies] of lineageGroups) {
    const separator = key.indexOf('::')
    const url = key.slice(0, separator)
    const union = unions.get(url)
    if (union) unionGroups(union, [studies])
  }

  return unions
}

/**
 * Project the same explicit registry/lineage evidence onto site-wide publication
 * identities. DOI/PMID aliases establish publication identity across profiles;
 * registry/cohort/dataset/parent-study identifiers establish underlying-study
 * dependence across those publications. No fuzzy title/author similarity is used.
 */
function buildGlobalInventoryIndependence(
  inputs: UnderlyingStudyIndependenceInputs,
): GlobalInventoryIndependence {
  const identities = crossProfileStudyIdentityMap(inputs.analysis.profiles)
  const publicationIds = new Set<string>()
  const primaryHumanPublicationIds = new Set<string>()

  for (const profile of inputs.analysis.profiles) {
    for (const [localStudyId, group] of canonicalStudyGroups(profile.record)) {
      const globalStudyId = crossProfileStudyIdentity(profile.url, localStudyId, identities)
      publicationIds.add(globalStudyId)
      if (PRIMARY_HUMAN_STUDY_CLASSES.has(canonicalStudyClass(group, inputs.analysis.cache))) {
        primaryHumanPublicationIds.add(globalStudyId)
      }
    }
  }

  const union = createUnion([...publicationIds])
  const registryGroups = new Map<string, string[]>()
  for (const study of inputs.trialRegistrationIndependence.studies ?? []) {
    if (!study.stableRegistryId) continue
    const globalStudyId = crossProfileStudyIdentity(study.url, study.studyId, identities)
    if (!publicationIds.has(globalStudyId)) continue
    const group = registryGroups.get(study.stableRegistryId) ?? []
    group.push(globalStudyId)
    registryGroups.set(study.stableRegistryId, group)
  }
  unionGroups(union, registryGroups.values())

  // Compatibility path for synthetic/partial callers where claim diagnostics
  // carry same-trial pairs but the canonical study registry index is absent.
  for (const claim of inputs.trialRegistrationIndependence.claims) {
    for (const pair of claim.sameRegisteredTrialPairs) {
      union.union(
        crossProfileStudyIdentity(claim.url, pair.leftStudyId, identities),
        crossProfileStudyIdentity(claim.url, pair.rightStudyId, identities),
      )
    }
  }

  const lineageGroups = new Map<string, string[]>()
  for (const study of inputs.evidenceLineage.studies) {
    const globalStudyId = crossProfileStudyIdentity(study.url, study.studyId, identities)
    if (!publicationIds.has(globalStudyId)) continue
    for (const lineageId of study.lineageIds) {
      const group = lineageGroups.get(lineageId) ?? []
      group.push(globalStudyId)
      lineageGroups.set(lineageId, group)
    }
  }
  unionGroups(union, lineageGroups.values())

  const underlyingStudyIds = new Set([...publicationIds].map((studyId) => union.find(studyId)))
  const primaryHumanUnderlyingStudyIds = new Set(
    [...primaryHumanPublicationIds].map((studyId) => union.find(studyId)),
  )

  return {
    publicationCount: publicationIds.size,
    underlyingStudyCount: underlyingStudyIds.size,
    collapsedPublicationCount: Math.max(0, publicationIds.size - underlyingStudyIds.size),
    primaryHumanPublicationCount: primaryHumanPublicationIds.size,
    primaryHumanUnderlyingStudyCount: primaryHumanUnderlyingStudyIds.size,
    collapsedPrimaryHumanPublicationCount: Math.max(
      0,
      primaryHumanPublicationIds.size - primaryHumanUnderlyingStudyIds.size,
    ),
  }
}

function claimGroups(studyIds: string[], union: Union): Map<string, string[]> {
  const groups = new Map<string, string[]>()
  for (const studyId of studyIds) {
    const root = union.find(studyId)
    const studies = groups.get(root) ?? []
    studies.push(studyId)
    groups.set(root, studies)
  }
  return groups
}

export function analyzeUnderlyingStudyIndependence(
  inputs: UnderlyingStudyIndependenceInputs,
): UnderlyingStudyIndependenceAnalysis {
  const unions = buildProfileUnions(inputs)
  const globalInventory = buildGlobalInventoryIndependence(inputs)
  const claims: ClaimUnderlyingStudyIndependence[] = []

  for (const claim of inputs.analysis.claimAnalyses) {
    if (claim.studyCount < 2) continue
    const union = unions.get(claim.url) ?? createUnion(claim.studyIds)
    const groups = claimGroups(claim.studyIds, union)
    const dependentPublicationGroups = [...groups.values()]
      .filter((studies) => studies.length > 1)
      .map((studies) => [...studies].sort())
      .sort((a, b) => b.length - a.length || a[0].localeCompare(b[0]))
    const underlyingStudyCount = groups.size
    const collapsedPublicationCount = Math.max(0, claim.studyCount - underlyingStudyCount)
    const independenceReduced = collapsedPublicationCount > 0
    const pseudoMultiStudySupport = claim.studyCount >= 2 && underlyingStudyCount === 1
    const publicationStructuredSupportTier = claim.structuredSupportTier
    const independenceAdjustedStructuredSupportTier: StructuredSupportTier =
      pseudoMultiStudySupport && publicationStructuredSupportTier === 'adequate'
        ? 'single-study'
        : publicationStructuredSupportTier
    const supportTierDowngradedByDependence =
      independenceAdjustedStructuredSupportTier !== publicationStructuredSupportTier

    claims.push({
      url: claim.url,
      claimId: claim.claimId,
      predicate: claim.predicate,
      confidence: claim.confidence,
      apparentStudyCount: claim.studyCount,
      underlyingStudyCount,
      collapsedPublicationCount,
      dependentPublicationGroups,
      publicationStructuredSupportTier,
      independenceAdjustedStructuredSupportTier,
      supportTierDowngradedByDependence,
      independenceReduced,
      pseudoMultiStudySupport,
      highConfidencePseudoMultiStudySupport: pseudoMultiStudySupport && claim.confidence >= 0.75,
    })
  }

  claims.sort((a, b) =>
    Number(b.supportTierDowngradedByDependence) - Number(a.supportTierDowngradedByDependence)
    || Number(b.highConfidencePseudoMultiStudySupport) - Number(a.highConfidencePseudoMultiStudySupport)
    || Number(b.pseudoMultiStudySupport) - Number(a.pseudoMultiStudySupport)
    || b.collapsedPublicationCount - a.collapsedPublicationCount
    || b.apparentStudyCount - a.apparentStudyCount
    || b.confidence - a.confidence
    || a.url.localeCompare(b.url)
    || a.claimId.localeCompare(b.claimId),
  )
  const reducedClaims = claims.filter((claim) => claim.independenceReduced)
  const pseudoMultiStudyClaims = claims.filter((claim) => claim.pseudoMultiStudySupport)
  const highConfidencePseudoMultiStudyClaims = claims.filter((claim) => claim.highConfidencePseudoMultiStudySupport)
  const supportTierDowngrades = claims.filter((claim) => claim.supportTierDowngradedByDependence)

  const rawProfileByUrl = new Map(inputs.analysis.profileAnalyses.map((profile) => [profile.url, profile] as const))
  const claimsByUrl = new Map<string, typeof inputs.analysis.claimAnalyses>()
  for (const claim of inputs.analysis.claimAnalyses) {
    if (!claim.studyIds.length) continue
    const values = claimsByUrl.get(claim.url) ?? []
    values.push(claim)
    claimsByUrl.set(claim.url, values)
  }

  const profiles: ProfileUnderlyingStudyIndependence[] = []
  for (const profile of inputs.analysis.profiles) {
    const { url, record } = profile
    const profileClaims = claimsByUrl.get(url) ?? []
    const inventoryGroups = canonicalStudyGroups(record)
    const inventoryPublicationStudyIds = [...inventoryGroups.keys()]
    const union = unions.get(url) ?? createUnion(inventoryPublicationStudyIds)
    const inventoryUnderlyingStudyIds = [...new Set(inventoryPublicationStudyIds.map((studyId) => union.find(studyId)))]
    const primaryHumanPublicationIds = [...inventoryGroups.entries()]
      .filter(([, group]) => PRIMARY_HUMAN_STUDY_CLASSES.has(canonicalStudyClass(group, inputs.analysis.cache)))
      .map(([studyId]) => studyId)
    const primaryHumanUnderlyingStudyIds = [...new Set(primaryHumanPublicationIds.map((studyId) => union.find(studyId)))]

    const publicationStudyIds = [...new Set(profileClaims.flatMap((claim) => claim.studyIds))]
    const underlyingStudyIds = [...new Set(publicationStudyIds.map((studyId) => union.find(studyId)))]
    const use = new Map<string, number>()
    let claimUnderlyingEdges = 0

    for (const claim of profileClaims) {
      const roots = new Set(claim.studyIds.map((studyId) => union.find(studyId)))
      claimUnderlyingEdges += roots.size
      for (const root of roots) use.set(root, (use.get(root) ?? 0) + 1)
    }

    const ranked = [...use.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    const mostUsed = ranked[0] ?? null
    const mostUsedUnderlyingStudyClaimCount = mostUsed?.[1] ?? 0
    const supportedApprovedClaimCount = profileClaims.length
    const dominantUnderlyingStudySupportedClaimShare = supportedApprovedClaimCount
      ? mostUsedUnderlyingStudyClaimCount / supportedApprovedClaimCount
      : 0
    const edgeShares = claimUnderlyingEdges ? ranked.map(([, count]) => count / claimUnderlyingEdges) : []
    const underlyingStudyConcentrationIndex = edgeShares.reduce((sum, share) => sum + share * share, 0)
    const effectiveUnderlyingStudyCount = underlyingStudyConcentrationIndex > 0 ? 1 / underlyingStudyConcentrationIndex : 0
    const overDependentOnSingleUnderlyingStudy =
      supportedApprovedClaimCount >= 3
      && dominantUnderlyingStudySupportedClaimShare >= 0.5
      && effectiveUnderlyingStudyCount < 2.5
    const rawProfile = rawProfileByUrl.get(url)

    profiles.push({
      url,
      supportedApprovedClaimCount,
      publicationStudyCount: publicationStudyIds.length,
      underlyingStudyCount: underlyingStudyIds.length,
      collapsedPublicationCount: Math.max(0, publicationStudyIds.length - underlyingStudyIds.length),
      inventoryPublicationStudyCount: inventoryPublicationStudyIds.length,
      inventoryUnderlyingStudyCount: inventoryUnderlyingStudyIds.length,
      inventoryCollapsedPublicationCount: Math.max(0, inventoryPublicationStudyIds.length - inventoryUnderlyingStudyIds.length),
      primaryHumanPublicationCount: primaryHumanPublicationIds.length,
      primaryHumanUnderlyingStudyCount: primaryHumanUnderlyingStudyIds.length,
      collapsedPrimaryHumanPublicationCount: Math.max(0, primaryHumanPublicationIds.length - primaryHumanUnderlyingStudyIds.length),
      mostUsedUnderlyingStudyId: mostUsed?.[0] ?? null,
      mostUsedUnderlyingStudyClaimCount,
      dominantUnderlyingStudySupportedClaimShare: round(dominantUnderlyingStudySupportedClaimShare),
      underlyingStudyConcentrationIndex: round(underlyingStudyConcentrationIndex),
      effectiveUnderlyingStudyCount: round(effectiveUnderlyingStudyCount),
      overDependentOnSingleUnderlyingStudy,
      newlyOverDependentAfterIndependenceAdjustment:
        overDependentOnSingleUnderlyingStudy && !Boolean(rawProfile?.overDependentOnSingleStudy),
    })
  }
  profiles.sort((a, b) =>
    Number(b.newlyOverDependentAfterIndependenceAdjustment) - Number(a.newlyOverDependentAfterIndependenceAdjustment)
    || Number(b.overDependentOnSingleUnderlyingStudy) - Number(a.overDependentOnSingleUnderlyingStudy)
    || b.dominantUnderlyingStudySupportedClaimShare - a.dominantUnderlyingStudySupportedClaimShare
    || a.effectiveUnderlyingStudyCount - b.effectiveUnderlyingStudyCount
    || a.url.localeCompare(b.url),
  )
  const newlyOverDependentProfiles = profiles.filter((profile) => profile.newlyOverDependentAfterIndependenceAdjustment)

  return {
    claims,
    reducedClaims,
    pseudoMultiStudyClaims,
    highConfidencePseudoMultiStudyClaims,
    supportTierDowngrades,
    profiles,
    newlyOverDependentProfiles,
    summary: {
      multiStudyApprovedClaims: claims.length,
      independenceReducedClaims: reducedClaims.length,
      pseudoMultiStudyClaims: pseudoMultiStudyClaims.length,
      highConfidencePseudoMultiStudyClaims: highConfidencePseudoMultiStudyClaims.length,
      supportTierDowngrades: supportTierDowngrades.length,
      collapsedPublicationCount: reducedClaims.reduce((sum, claim) => sum + claim.collapsedPublicationCount, 0),
      profilesAnalyzed: profiles.length,
      profilesWithSupportedClaims: profiles.filter((profile) => profile.supportedApprovedClaimCount > 0).length,
      profilesWithReducedStudyCount: profiles.filter((profile) => profile.inventoryCollapsedPublicationCount > 0).length,
      profilesWithReducedHumanStudyCount: profiles.filter((profile) => profile.collapsedPrimaryHumanPublicationCount > 0).length,
      primaryHumanPublicationCount: profiles.reduce((sum, profile) => sum + profile.primaryHumanPublicationCount, 0),
      primaryHumanUnderlyingStudyCount: profiles.reduce((sum, profile) => sum + profile.primaryHumanUnderlyingStudyCount, 0),
      collapsedPrimaryHumanPublicationCount: profiles.reduce((sum, profile) => sum + profile.collapsedPrimaryHumanPublicationCount, 0),
      globalInventoryPublicationCount: globalInventory.publicationCount,
      globalInventoryUnderlyingStudyCount: globalInventory.underlyingStudyCount,
      globalCollapsedInventoryPublicationCount: globalInventory.collapsedPublicationCount,
      globalPrimaryHumanPublicationCount: globalInventory.primaryHumanPublicationCount,
      globalPrimaryHumanUnderlyingStudyCount: globalInventory.primaryHumanUnderlyingStudyCount,
      globalCollapsedPrimaryHumanPublicationCount: globalInventory.collapsedPrimaryHumanPublicationCount,
      overDependentProfiles: profiles.filter((profile) => profile.overDependentOnSingleUnderlyingStudy).length,
      newlyOverDependentProfiles: newlyOverDependentProfiles.length,
    },
  }
}
