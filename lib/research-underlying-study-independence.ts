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
  publicationStudyCount: number
  underlyingStudyCount: number
  collapsedPublicationCount: number
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
    profilesWithSupportedClaims: number
    profilesWithReducedStudyCount: number
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

/**
 * Build one explicit dependence graph per profile. Registry, cohort, dataset,
 * and parent-study relations are resolved before claims are projected onto the
 * graph, so dependence proven by different claims can combine transitively.
 */
function buildProfileUnions(inputs: UnderlyingStudyIndependenceInputs): Map<string, Union> {
  const studyIdsByUrl = new Map<string, Set<string>>()
  for (const claim of inputs.analysis.claimAnalyses) {
    const studies = studyIdsByUrl.get(claim.url) ?? new Set<string>()
    for (const studyId of claim.studyIds) studies.add(studyId)
    studyIdsByUrl.set(claim.url, studies)
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

  // Preserve explicit same-trial claim relations as a compatibility/fallback
  // path for synthetic callers that supply claim diagnostics without the study
  // registry index. Production analysis supplies both and the union is idempotent.
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

/**
 * Collapse publication-level study IDs only when canonical lineage analyzers
 * positively prove that publications belong to the same underlying
 * trial/cohort/dataset/parent study. Missing independence metadata is never
 * treated as dependence.
 *
 * Dependence is resolved once per profile, then projected onto each claim. This
 * captures transitive evidence relationships even when the publications proving
 * the chain never all co-occur on the same claim.
 */
export function analyzeUnderlyingStudyIndependence(
  inputs: UnderlyingStudyIndependenceInputs,
): UnderlyingStudyIndependenceAnalysis {
  const unions = buildProfileUnions(inputs)
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
  for (const [url, profileClaims] of claimsByUrl) {
    const union = unions.get(url) ?? createUnion([...new Set(profileClaims.flatMap((claim) => claim.studyIds))])
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
      profilesWithSupportedClaims: profiles.length,
      profilesWithReducedStudyCount: profiles.filter((profile) => profile.collapsedPublicationCount > 0).length,
      overDependentProfiles: profiles.filter((profile) => profile.overDependentOnSingleUnderlyingStudy).length,
      newlyOverDependentProfiles: newlyOverDependentProfiles.length,
    },
  }
}
