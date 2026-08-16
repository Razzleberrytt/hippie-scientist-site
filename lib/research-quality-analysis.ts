import {
  approvedClaims,
  canonicalStudyClass,
  canonicalStudyGroups,
  canonicalStudyIdentityMap,
  listResearchProfiles,
  loadPubmedCache,
  NARRATIVE_STUDY_CLASSES,
  PRIMARY_HUMAN_STUDY_CLASSES,
  sourceMap,
  SYNTHESIS_STUDY_CLASSES,
  uniqueClaimStudyIdentities,
  uniqueSourceRefs,
  type PubmedCache,
  type ResearchClaim,
  type ResearchProfile,
} from './research-coverage'

export type ClaimSupportTier =
  | 'unsupported'
  | 'unclassified'
  | 'narrative-only'
  | 'indirect-only'
  | 'human-supported'
  | 'non-outcome'

export type ClaimQualityAnalysis = {
  url: string
  claimId: string
  predicate: string
  confidence: number
  sourceRefCount: number
  validSourceRefCount: number
  danglingSourceRefs: string[]
  studyCount: number
  classifiedStudyCount: number
  primaryHuman: number
  synthesis: number
  narrative: number
  designs: string[]
  outcomeClaim: boolean
  supportTier: ClaimSupportTier
  weakStructuredClaim: boolean
  highConfidenceWeakOutcome: boolean
  singleStudy: boolean
  aliasCollapsed: boolean
}

export type ProfileQualityAnalysis = {
  url: string
  sourceCount: number
  canonicalStudyCount: number
  claimCount: number
  approvedClaimCount: number
  supportedApprovedClaimCount: number
  weakStructuredClaimCount: number
  designMix: Record<string, number>
  primaryHuman: number
  synthesis: number
  narrativeReview: number
  narrativeToPrimaryHumanRatio: number | null
  narrativeDominatedVsPrimaryHuman: boolean
  unsupportedApprovedClaims: string[]
  weakStructuredClaims: string[]
  singleStudyApprovedClaims: string[]
  aliasCollapsedClaims: string[]
  danglingSourceRefs: Array<{ claimId: string; sourceRefId: string }>
  mostUsedStudyIdentity: string | null
  mostUsedStudyClaimCount: number
  studyDependencyShare: number
  dominantStudySupportedClaimCount: number
  dominantStudySupportedClaimShare: number
  studyConcentrationIndex: number
  effectiveStudyCount: number
  overDependentOnSingleStudy: boolean
  reviewDominated: boolean
  noPrimaryHuman: boolean
}

export type ResearchQualityAnalysis = {
  cache: PubmedCache
  profiles: ReturnType<typeof listResearchProfiles>
  profileAnalyses: ProfileQualityAnalysis[]
  claimAnalyses: ClaimQualityAnalysis[]
}

function analyzeClaim(
  url: string,
  claim: ResearchClaim,
  record: ResearchProfile,
  cache: PubmedCache,
): ClaimQualityAnalysis {
  const sourcesById = sourceMap(record)
  const identities = canonicalStudyIdentityMap(record)
  const groups = canonicalStudyGroups(record)
  const refs = uniqueSourceRefs(claim)
  const validRefs = refs.filter((ref) => sourcesById.has(ref))
  const danglingSourceRefs = refs.filter((ref) => !sourcesById.has(ref))
  const studyIds = uniqueClaimStudyIdentities(claim, identities)
  const designs = studyIds
    .map((studyId) => groups.get(studyId))
    .filter((group): group is NonNullable<typeof group> => Boolean(group))
    .map((group) => canonicalStudyClass(group, cache))
  const classified = designs.filter((design) => design !== 'unclassified')
  const primaryHuman = classified.filter((design) => PRIMARY_HUMAN_STUDY_CLASSES.has(design)).length
  const synthesis = classified.filter((design) => SYNTHESIS_STUDY_CLASSES.has(design)).length
  const narrative = classified.filter((design) => NARRATIVE_STUDY_CLASSES.has(design)).length
  const predicate = String(claim.predicate ?? '')
  const outcomeClaim = predicate === 'supports_outcome'
  const confidence = Number(claim.confidence ?? 0)
  const strongHumanSupport = primaryHuman + synthesis > 0

  let supportTier: ClaimSupportTier = 'non-outcome'
  if (studyIds.length === 0) supportTier = 'unsupported'
  else if (classified.length === 0) supportTier = 'unclassified'
  else if (outcomeClaim && narrative === classified.length) supportTier = 'narrative-only'
  else if (outcomeClaim && !strongHumanSupport) supportTier = 'indirect-only'
  else if (outcomeClaim) supportTier = 'human-supported'

  const weakStructuredClaim = outcomeClaim && supportTier !== 'human-supported'
  const weakOutcome = supportTier === 'narrative-only' || supportTier === 'indirect-only'

  return {
    url,
    claimId: String(claim.id ?? 'unknown-claim'),
    predicate,
    confidence,
    sourceRefCount: refs.length,
    validSourceRefCount: validRefs.length,
    danglingSourceRefs,
    studyCount: studyIds.length,
    classifiedStudyCount: classified.length,
    primaryHuman,
    synthesis,
    narrative,
    designs,
    outcomeClaim,
    supportTier,
    weakStructuredClaim,
    highConfidenceWeakOutcome:
      outcomeClaim && confidence >= 0.75 && (weakOutcome || supportTier === 'unclassified' || supportTier === 'unsupported'),
    singleStudy: studyIds.length === 1,
    aliasCollapsed: validRefs.length > studyIds.length && studyIds.length > 0,
  }
}

function analyzeProfile(
  url: string,
  record: ResearchProfile,
  cache: PubmedCache,
  claims: ClaimQualityAnalysis[],
): ProfileQualityAnalysis {
  const sources = Array.isArray(record.sources) ? record.sources : []
  const allClaims = Array.isArray(record.claimMap) ? record.claimMap : []
  const approved = approvedClaims(record)
  const studyGroups = canonicalStudyGroups(record)
  const designMix: Record<string, number> = {}
  let primaryHuman = 0
  let synthesis = 0
  let narrativeReview = 0

  for (const group of studyGroups.values()) {
    const design = canonicalStudyClass(group, cache)
    designMix[design] = (designMix[design] ?? 0) + 1
    if (PRIMARY_HUMAN_STUDY_CLASSES.has(design)) primaryHuman += 1
    if (SYNTHESIS_STUDY_CLASSES.has(design)) synthesis += 1
    if (NARRATIVE_STUDY_CLASSES.has(design)) narrativeReview += 1
  }

  const claimById = new Map(claims.map((claim) => [claim.claimId, claim]))
  const unsupportedApprovedClaims: string[] = []
  const weakStructuredClaims: string[] = []
  const singleStudyApprovedClaims: string[] = []
  const aliasCollapsedClaims: string[] = []
  const danglingSourceRefs: Array<{ claimId: string; sourceRefId: string }> = []
  const studyUse = new Map<string, number>()
  const identities = canonicalStudyIdentityMap(record)

  for (const claim of approved) {
    const claimId = String(claim.id ?? 'unknown-claim')
    const analysis = claimById.get(claimId)
    if (!analysis) continue

    if (analysis.supportTier === 'unsupported') unsupportedApprovedClaims.push(claimId)
    if (analysis.weakStructuredClaim) weakStructuredClaims.push(claimId)
    if (analysis.singleStudy) singleStudyApprovedClaims.push(claimId)
    if (analysis.aliasCollapsed) aliasCollapsedClaims.push(claimId)
    for (const sourceRefId of analysis.danglingSourceRefs) danglingSourceRefs.push({ claimId, sourceRefId })
    for (const study of uniqueClaimStudyIdentities(claim, identities)) {
      studyUse.set(study, (studyUse.get(study) ?? 0) + 1)
    }
  }

  const mostUsed = [...studyUse.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0] ?? null
  const mostUsedStudyClaimCount = mostUsed?.[1] ?? 0
  const studyDependencyShare = approved.length ? mostUsedStudyClaimCount / approved.length : 0
  const supportedApprovedClaimCount = claims.filter((claim) => claim.studyCount > 0).length
  const dominantStudySupportedClaimCount = mostUsedStudyClaimCount
  const dominantStudySupportedClaimShare = supportedApprovedClaimCount
    ? dominantStudySupportedClaimCount / supportedApprovedClaimCount
    : 0
  const totalStudyAssignments = [...studyUse.values()].reduce((sum, count) => sum + count, 0)
  const studyConcentrationIndex = totalStudyAssignments
    ? [...studyUse.values()].reduce((sum, count) => sum + (count / totalStudyAssignments) ** 2, 0)
    : 0
  const effectiveStudyCount = studyConcentrationIndex ? 1 / studyConcentrationIndex : 0
  const classified = primaryHuman + synthesis + narrativeReview
  const narrativeToPrimaryHumanRatio = primaryHuman > 0
    ? narrativeReview / primaryHuman
    : narrativeReview > 0 ? null : 0
  const narrativeDominatedVsPrimaryHuman = narrativeReview >= 2 && (primaryHuman === 0 || narrativeReview >= primaryHuman * 2)

  return {
    url,
    sourceCount: sources.length,
    canonicalStudyCount: studyGroups.size,
    claimCount: allClaims.length,
    approvedClaimCount: approved.length,
    supportedApprovedClaimCount,
    weakStructuredClaimCount: weakStructuredClaims.length,
    designMix,
    primaryHuman,
    synthesis,
    narrativeReview,
    narrativeToPrimaryHumanRatio: narrativeToPrimaryHumanRatio === null ? null : Number(narrativeToPrimaryHumanRatio.toFixed(3)),
    narrativeDominatedVsPrimaryHuman,
    unsupportedApprovedClaims,
    weakStructuredClaims,
    singleStudyApprovedClaims,
    aliasCollapsedClaims,
    danglingSourceRefs,
    mostUsedStudyIdentity: mostUsed?.[0] ?? null,
    mostUsedStudyClaimCount,
    studyDependencyShare: Number(studyDependencyShare.toFixed(3)),
    dominantStudySupportedClaimCount,
    dominantStudySupportedClaimShare: Number(dominantStudySupportedClaimShare.toFixed(3)),
    studyConcentrationIndex: Number(studyConcentrationIndex.toFixed(3)),
    effectiveStudyCount: Number(effectiveStudyCount.toFixed(2)),
    overDependentOnSingleStudy: supportedApprovedClaimCount >= 3 && dominantStudySupportedClaimShare >= 0.5,
    reviewDominated: classified >= 3 && narrativeReview / classified >= 0.6,
    noPrimaryHuman: approved.length > 0 && primaryHuman === 0,
  }
}

export function analyzeResearchQuality(root = process.cwd()): ResearchQualityAnalysis {
  const cache = loadPubmedCache(root)
  const profiles = listResearchProfiles(root)
  const claimAnalyses: ClaimQualityAnalysis[] = []
  const profileAnalyses: ProfileQualityAnalysis[] = []

  for (const { url, record } of profiles) {
    const claims = approvedClaims(record).map((claim) => analyzeClaim(url, claim, record, cache))
    claimAnalyses.push(...claims)
    profileAnalyses.push(analyzeProfile(url, record, cache, claims))
  }

  return { cache, profiles, profileAnalyses, claimAnalyses }
}
