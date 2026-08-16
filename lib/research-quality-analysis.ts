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
  reviewStatus: string
  approved: boolean
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
  designMix: Record<string, number>
  primaryHuman: number
  synthesis: number
  narrativeReview: number
  narrativeToPrimaryHumanRatio: number | null
  narrativeDominatedVsPrimaryHuman: boolean
  unsupportedApprovedClaims: string[]
  singleStudyApprovedClaims: string[]
  aliasCollapsedClaims: string[]
  danglingSourceRefs: Array<{ claimId: string; sourceRefId: string }>
  claimStudyEdges: number
  mostUsedStudyIdentity: string | null
  mostUsedStudyClaimCount: number
  studyDependencyShare: number
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
  structuredClaimAnalyses: ClaimQualityAnalysis[]
}

function round(value: number, digits = 3): number {
  const scale = 10 ** digits
  return Math.round(value * scale) / scale
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
  const reviewStatus = String(claim.reviewStatus ?? '').trim().toLowerCase()
  const approved = reviewStatus === 'approved'
  const strongHumanSupport = primaryHuman + synthesis > 0

  let supportTier: ClaimSupportTier = 'non-outcome'
  if (studyIds.length === 0) supportTier = 'unsupported'
  else if (classified.length === 0) supportTier = 'unclassified'
  else if (outcomeClaim && narrative === classified.length) supportTier = 'narrative-only'
  else if (outcomeClaim && !strongHumanSupport) supportTier = 'indirect-only'
  else if (outcomeClaim) supportTier = 'human-supported'

  const weakOutcome = supportTier === 'narrative-only' || supportTier === 'indirect-only'

  return {
    url,
    claimId: String(claim.id ?? 'unknown-claim'),
    reviewStatus,
    approved,
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
  const singleStudyApprovedClaims: string[] = []
  const aliasCollapsedClaims: string[] = []
  const danglingSourceRefs: Array<{ claimId: string; sourceRefId: string }> = []
  const studyUse = new Map<string, number>()
  const identities = canonicalStudyIdentityMap(record)
  let claimStudyEdges = 0
  let supportedApprovedClaimCount = 0

  for (const claim of approved) {
    const claimId = String(claim.id ?? 'unknown-claim')
    const analysis = claimById.get(claimId)
    if (!analysis) continue

    if (analysis.supportTier === 'unsupported') unsupportedApprovedClaims.push(claimId)
    if (analysis.singleStudy) singleStudyApprovedClaims.push(claimId)
    if (analysis.aliasCollapsed) aliasCollapsedClaims.push(claimId)
    for (const sourceRefId of analysis.danglingSourceRefs) danglingSourceRefs.push({ claimId, sourceRefId })

    const studies = uniqueClaimStudyIdentities(claim, identities)
    if (studies.length > 0) supportedApprovedClaimCount += 1
    claimStudyEdges += studies.length
    for (const study of studies) studyUse.set(study, (studyUse.get(study) ?? 0) + 1)
  }

  const rankedStudyUse = [...studyUse.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
  const mostUsed = rankedStudyUse[0] ?? null
  const mostUsedStudyClaimCount = mostUsed?.[1] ?? 0
  const studyDependencyShare = approved.length ? mostUsedStudyClaimCount / approved.length : 0
  const dominantStudySupportedClaimShare = supportedApprovedClaimCount
    ? mostUsedStudyClaimCount / supportedApprovedClaimCount
    : 0
  const edgeShares = claimStudyEdges ? rankedStudyUse.map(([, count]) => count / claimStudyEdges) : []
  const studyConcentrationIndex = edgeShares.reduce((sum, share) => sum + share * share, 0)
  const effectiveStudyCount = studyConcentrationIndex > 0 ? 1 / studyConcentrationIndex : 0
  const narrativeToPrimaryHumanRatio = primaryHuman > 0 ? narrativeReview / primaryHuman : narrativeReview > 0 ? null : 0
  const narrativeDominatedVsPrimaryHuman =
    narrativeReview >= 2 && (primaryHuman === 0 || narrativeReview >= primaryHuman * 2)
  const overDependentOnSingleStudy =
    supportedApprovedClaimCount >= 3 &&
    dominantStudySupportedClaimShare >= 0.5 &&
    effectiveStudyCount < 2.5

  return {
    url,
    sourceCount: sources.length,
    canonicalStudyCount: studyGroups.size,
    claimCount: allClaims.length,
    approvedClaimCount: approved.length,
    supportedApprovedClaimCount,
    designMix,
    primaryHuman,
    synthesis,
    narrativeReview,
    narrativeToPrimaryHumanRatio: narrativeToPrimaryHumanRatio === null ? null : round(narrativeToPrimaryHumanRatio),
    narrativeDominatedVsPrimaryHuman,
    unsupportedApprovedClaims,
    singleStudyApprovedClaims,
    aliasCollapsedClaims,
    danglingSourceRefs,
    claimStudyEdges,
    mostUsedStudyIdentity: mostUsed?.[0] ?? null,
    mostUsedStudyClaimCount,
    studyDependencyShare: round(studyDependencyShare),
    dominantStudySupportedClaimShare: round(dominantStudySupportedClaimShare),
    studyConcentrationIndex: round(studyConcentrationIndex),
    effectiveStudyCount: round(effectiveStudyCount),
    overDependentOnSingleStudy,
    reviewDominated: narrativeDominatedVsPrimaryHuman,
    noPrimaryHuman: approved.length > 0 && primaryHuman === 0,
  }
}

export function analyzeResearchQuality(root = process.cwd()): ResearchQualityAnalysis {
  const cache = loadPubmedCache(root)
  const profiles = listResearchProfiles(root)
  const claimAnalyses: ClaimQualityAnalysis[] = []
  const structuredClaimAnalyses: ClaimQualityAnalysis[] = []
  const profileAnalyses: ProfileQualityAnalysis[] = []

  for (const { url, record } of profiles) {
    const allClaims = Array.isArray(record.claimMap) ? record.claimMap : []
    const structuredClaims = allClaims.map((claim) => analyzeClaim(url, claim, record, cache))
    const approved = structuredClaims.filter((claim) => claim.approved)
    structuredClaimAnalyses.push(...structuredClaims)
    claimAnalyses.push(...approved)
    profileAnalyses.push(analyzeProfile(url, record, cache, structuredClaims))
  }

  return { cache, profiles, profileAnalyses, claimAnalyses, structuredClaimAnalyses }
}
