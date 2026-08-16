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
  type ResearchSource,
} from './research-coverage'
import type { StudyClass } from './study-class'

export type ClaimSupportTier =
  | 'unsupported'
  | 'unclassified'
  | 'narrative-only'
  | 'indirect-only'
  | 'human-supported'
  | 'non-outcome'

export type StructuredSupportTier =
  | 'unsupported'
  | 'unclassified'
  | 'narrative-only'
  | 'single-study'
  | 'adequate'

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
  studyIds: string[]
  studyCount: number
  classifiedStudyCount: number
  primaryHuman: number
  synthesis: number
  narrative: number
  designs: StudyClass[]
  outcomeClaim: boolean
  supportTier: ClaimSupportTier
  structuredSupportTier: StructuredSupportTier
  weakStructuredClaim: boolean
  highConfidenceWeakStructured: boolean
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

type ProfileResearchContext = {
  record: ResearchProfile
  cache: PubmedCache
  sources: ResearchSource[]
  sourcesById: Map<string, ResearchSource>
  identities: Map<string, string>
  studyGroups: Map<string, ResearchSource[]>
  studyDesigns: Map<string, StudyClass>
}

function round(value: number, digits = 3): number {
  const scale = 10 ** digits
  return Math.round(value * scale) / scale
}

function buildProfileContext(record: ResearchProfile, cache: PubmedCache): ProfileResearchContext {
  const sources = Array.isArray(record.sources) ? record.sources : []
  const sourcesById = sourceMap(record)
  const identities = canonicalStudyIdentityMap(record)
  const studyGroups = canonicalStudyGroups(record)
  const studyDesigns = new Map<string, StudyClass>()

  for (const [studyId, group] of studyGroups) {
    studyDesigns.set(studyId, canonicalStudyClass(group, cache))
  }

  return { record, cache, sources, sourcesById, identities, studyGroups, studyDesigns }
}

function classifyStructuredSupport(
  studyCount: number,
  classifiedStudyCount: number,
  narrativeCount: number,
): StructuredSupportTier {
  if (studyCount === 0) return 'unsupported'
  if (classifiedStudyCount === 0) return 'unclassified'
  if (narrativeCount === classifiedStudyCount) return 'narrative-only'
  if (studyCount === 1) return 'single-study'
  return 'adequate'
}

function analyzeClaim(url: string, claim: ResearchClaim, context: ProfileResearchContext): ClaimQualityAnalysis {
  const refs = uniqueSourceRefs(claim)
  const validRefs = refs.filter((ref) => context.sourcesById.has(ref))
  const danglingSourceRefs = refs.filter((ref) => !context.sourcesById.has(ref))
  const studyIds = uniqueClaimStudyIdentities(claim, context.identities)
  const designs = studyIds.map((studyId) => context.studyDesigns.get(studyId) ?? 'unclassified')
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
  const structuredSupportTier = classifyStructuredSupport(studyIds.length, classified.length, narrative)

  let supportTier: ClaimSupportTier = 'non-outcome'
  if (studyIds.length === 0) supportTier = 'unsupported'
  else if (classified.length === 0) supportTier = 'unclassified'
  else if (outcomeClaim && narrative === classified.length) supportTier = 'narrative-only'
  else if (outcomeClaim && !strongHumanSupport) supportTier = 'indirect-only'
  else if (outcomeClaim) supportTier = 'human-supported'

  const weakStructuredClaim = structuredSupportTier !== 'adequate'
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
    studyIds,
    studyCount: studyIds.length,
    classifiedStudyCount: classified.length,
    primaryHuman,
    synthesis,
    narrative,
    designs,
    outcomeClaim,
    supportTier,
    structuredSupportTier,
    weakStructuredClaim,
    highConfidenceWeakStructured: confidence >= 0.75 && weakStructuredClaim,
    highConfidenceWeakOutcome:
      outcomeClaim && confidence >= 0.75 && (weakOutcome || supportTier === 'unclassified' || supportTier === 'unsupported'),
    singleStudy: studyIds.length === 1,
    aliasCollapsed: validRefs.length > studyIds.length && studyIds.length > 0,
  }
}

function analyzeProfile(
  url: string,
  context: ProfileResearchContext,
  claims: ClaimQualityAnalysis[],
): ProfileQualityAnalysis {
  const allClaims = Array.isArray(context.record.claimMap) ? context.record.claimMap : []
  const approved = approvedClaims(context.record)
  const approvedAnalyses = claims.filter((claim) => claim.approved)
  const designMix: Record<string, number> = {}
  let primaryHuman = 0
  let synthesis = 0
  let narrativeReview = 0

  for (const design of context.studyDesigns.values()) {
    designMix[design] = (designMix[design] ?? 0) + 1
    if (PRIMARY_HUMAN_STUDY_CLASSES.has(design)) primaryHuman += 1
    if (SYNTHESIS_STUDY_CLASSES.has(design)) synthesis += 1
    if (NARRATIVE_STUDY_CLASSES.has(design)) narrativeReview += 1
  }

  const unsupportedApprovedClaims: string[] = []
  const weakStructuredClaims: string[] = []
  const singleStudyApprovedClaims: string[] = []
  const aliasCollapsedClaims: string[] = []
  const danglingSourceRefs: Array<{ claimId: string; sourceRefId: string }> = []
  const studyUse = new Map<string, number>()
  let claimStudyEdges = 0
  let supportedApprovedClaimCount = 0

  for (const analysis of approvedAnalyses) {
    if (analysis.supportTier === 'unsupported') unsupportedApprovedClaims.push(analysis.claimId)
    if (analysis.weakStructuredClaim) weakStructuredClaims.push(analysis.claimId)
    if (analysis.singleStudy) singleStudyApprovedClaims.push(analysis.claimId)
    if (analysis.aliasCollapsed) aliasCollapsedClaims.push(analysis.claimId)
    for (const sourceRefId of analysis.danglingSourceRefs) {
      danglingSourceRefs.push({ claimId: analysis.claimId, sourceRefId })
    }

    if (analysis.studyIds.length > 0) supportedApprovedClaimCount += 1
    claimStudyEdges += analysis.studyIds.length
    for (const studyId of analysis.studyIds) {
      studyUse.set(studyId, (studyUse.get(studyId) ?? 0) + 1)
    }
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
    sourceCount: context.sources.length,
    canonicalStudyCount: context.studyGroups.size,
    claimCount: allClaims.length,
    approvedClaimCount: approved.length,
    supportedApprovedClaimCount,
    weakStructuredClaimCount: weakStructuredClaims.length,
    designMix,
    primaryHuman,
    synthesis,
    narrativeReview,
    narrativeToPrimaryHumanRatio: narrativeToPrimaryHumanRatio === null ? null : round(narrativeToPrimaryHumanRatio),
    narrativeDominatedVsPrimaryHuman,
    unsupportedApprovedClaims,
    weakStructuredClaims,
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
    const context = buildProfileContext(record, cache)
    const structuredClaims = (Array.isArray(record.claimMap) ? record.claimMap : []).map((claim) => analyzeClaim(url, claim, context))
    const approved = structuredClaims.filter((claim) => claim.approved)
    structuredClaimAnalyses.push(...structuredClaims)
    claimAnalyses.push(...approved)
    profileAnalyses.push(analyzeProfile(url, context, structuredClaims))
  }

  return { cache, profiles, profileAnalyses, claimAnalyses, structuredClaimAnalyses }
}
