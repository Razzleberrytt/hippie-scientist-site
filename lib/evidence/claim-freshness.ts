import type { CanonicalEvidenceGrade } from '@/lib/evidence-grade'

export type ResearchVelocity = 'slow' | 'moderate' | 'fast'
export type FreshnessPriority = 'low' | 'normal' | 'high' | 'urgent'
export type ScientificSourceType =
  | 'randomized-trial'
  | 'systematic-review'
  | 'meta-analysis'
  | 'guideline'
  | 'regulatory'
  | 'observational'
  | 'preclinical'
  | 'mechanistic'
  | 'other'

export type EvidenceReference = {
  id: string
  publishedAt: string
  sourceType: ScientificSourceType
  clinicallyRelevant?: boolean
  supersededBy?: string | null
  outcomeIds?: string[]
  ingredientIds?: string[]
}

export type ClaimFreshnessInput = {
  claimId: string
  evaluatedAt?: string
  researchVelocity?: ResearchVelocity
  evidence: EvidenceReference[]
}

export type ClaimFreshnessResult = {
  claimId: string
  score: number
  priority: FreshnessPriority
  oldestEvidenceYears: number | null
  newestEvidenceYears: number | null
  staleEvidenceCount: number
  supersededEvidenceCount: number
  reviewAgeYears: number | null
  thresholdYears: number
  reasons: string[]
}

const VELOCITY_THRESHOLD_YEARS: Record<ResearchVelocity, number> = {
  slow: 10,
  moderate: 7,
  fast: 5,
}

const GRADE_ORDER: Record<CanonicalEvidenceGrade, number> = {
  'Avoid/Insufficient': 0,
  D: 1,
  C: 2,
  B: 3,
  A: 4,
}

function clamp(value: number, min = 0, max = 100) {
  return Math.min(max, Math.max(min, value))
}

function parseDate(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function ageInYears(publishedAt: string, evaluatedAt: string) {
  const published = parseDate(publishedAt)
  const evaluated = parseDate(evaluatedAt)
  if (!published || !evaluated) return null
  const ageMs = Math.max(0, evaluated.getTime() - published.getTime())
  return ageMs / (365.2425 * 24 * 60 * 60 * 1000)
}

function sourceFreshnessWeight(sourceType: ScientificSourceType) {
  if (sourceType === 'systematic-review' || sourceType === 'meta-analysis') return 1.35
  if (sourceType === 'guideline' || sourceType === 'regulatory') return 1.5
  if (sourceType === 'randomized-trial') return 1
  if (sourceType === 'observational') return 0.8
  return 0.6
}

export function scoreClaimFreshness(input: ClaimFreshnessInput): ClaimFreshnessResult {
  const evaluatedAt = input.evaluatedAt ?? new Date().toISOString()
  const velocity = input.researchVelocity ?? 'moderate'
  const thresholdYears = VELOCITY_THRESHOLD_YEARS[velocity]
  const ages = input.evidence
    .map((reference) => ({ reference, years: ageInYears(reference.publishedAt, evaluatedAt) }))
    .filter((entry): entry is { reference: EvidenceReference; years: number } => entry.years !== null)

  if (!ages.length) {
    return {
      claimId: input.claimId,
      score: 0,
      priority: 'urgent',
      oldestEvidenceYears: null,
      newestEvidenceYears: null,
      staleEvidenceCount: 0,
      supersededEvidenceCount: input.evidence.filter((item) => Boolean(item.supersededBy)).length,
      reviewAgeYears: null,
      thresholdYears,
      reasons: ['No dated supporting evidence is available for freshness review.'],
    }
  }

  const weightedAges = ages.map(({ reference, years }) => ({
    years,
    weight: sourceFreshnessWeight(reference.sourceType),
    clinicallyRelevant: Boolean(reference.clinicallyRelevant),
  }))
  const totalWeight = weightedAges.reduce((sum, item) => sum + item.weight, 0)
  const weightedMeanAge = weightedAges.reduce((sum, item) => sum + item.years * item.weight, 0) / totalWeight
  const stale = ages.filter(({ years }) => years > thresholdYears)
  const superseded = input.evidence.filter((item) => Boolean(item.supersededBy))
  const reviewAges = ages
    .filter(({ reference }) => reference.sourceType === 'systematic-review' || reference.sourceType === 'meta-analysis')
    .map(({ years }) => years)
  const currentRelevantOldEvidence = weightedAges.filter(
    (item) => item.years > thresholdYears && item.clinicallyRelevant,
  ).length

  const agePenalty = clamp((weightedMeanAge / thresholdYears) * 42, 0, 48)
  const stalePenalty = clamp((stale.length / ages.length) * 25, 0, 25)
  const supersededPenalty = clamp((superseded.length / input.evidence.length) * 35, 0, 35)
  const relevanceCredit = clamp(currentRelevantOldEvidence * 4, 0, 12)
  const score = Math.round(clamp(100 - agePenalty - stalePenalty - supersededPenalty + relevanceCredit))

  const reasons: string[] = []
  if (stale.length) {
    reasons.push(`${stale.length} supporting source${stale.length === 1 ? '' : 's'} exceed the ${thresholdYears}-year freshness threshold for a ${velocity}-moving field.`)
  }
  if (superseded.length) reasons.push(`${superseded.length} source${superseded.length === 1 ? '' : 's'} are marked as superseded.`)
  if (currentRelevantOldEvidence) {
    reasons.push(`${currentRelevantOldEvidence} older source${currentRelevantOldEvidence === 1 ? '' : 's'} remain explicitly marked clinically relevant and are not treated as automatically invalid.`)
  }
  if (!reasons.length) reasons.push('Supporting evidence is within the expected freshness window for this research area.')

  const priority: FreshnessPriority = superseded.length > 0 || score < 35
    ? 'urgent'
    : score < 55
      ? 'high'
      : score < 75
        ? 'normal'
        : 'low'

  return {
    claimId: input.claimId,
    score,
    priority,
    oldestEvidenceYears: Math.max(...ages.map((item) => item.years)),
    newestEvidenceYears: Math.min(...ages.map((item) => item.years)),
    staleEvidenceCount: stale.length,
    supersededEvidenceCount: superseded.length,
    reviewAgeYears: reviewAges.length ? Math.min(...reviewAges) : null,
    thresholdYears,
    reasons,
  }
}

function setsOverlap(left: string[] | undefined, right: string[] | undefined) {
  if (!left?.length || !right?.length) return true
  const rightSet = new Set(right)
  return left.some((value) => rightSet.has(value))
}

export function findSupersedingReviews(references: EvidenceReference[]) {
  const reviews = references.filter(
    (reference) => reference.sourceType === 'systematic-review' || reference.sourceType === 'meta-analysis',
  )

  return references.flatMap((reference) => {
    const published = parseDate(reference.publishedAt)
    if (!published) return []

    const candidates = reviews
      .filter((review) => review.id !== reference.id)
      .filter((review) => {
        const reviewDate = parseDate(review.publishedAt)
        return Boolean(reviewDate && reviewDate.getTime() > published.getTime())
      })
      .filter((review) => setsOverlap(reference.ingredientIds, review.ingredientIds))
      .filter((review) => setsOverlap(reference.outcomeIds, review.outcomeIds))
      .sort((a, b) => (parseDate(b.publishedAt)?.getTime() ?? 0) - (parseDate(a.publishedAt)?.getTime() ?? 0))

    return candidates.length ? [{ evidenceId: reference.id, supersedingReviewId: candidates[0].id }] : []
  })
}

export function surfaceUpdatedReviews(references: EvidenceReference[]) {
  return [...references]
    .filter((reference) => reference.sourceType === 'systematic-review' || reference.sourceType === 'meta-analysis')
    .sort((a, b) => (parseDate(b.publishedAt)?.getTime() ?? 0) - (parseDate(a.publishedAt)?.getTime() ?? 0))
}

export type RegulatoryAuthority = 'FDA' | 'NCCIH' | 'EFSA' | 'HEALTH_CANADA'
export type ExternalUpdateKind = 'safety' | 'guideline' | 'monograph' | 'systematic-review' | 'other'

export type ExternalEvidenceUpdate = {
  id: string
  authority?: RegulatoryAuthority
  ingredientIds: string[]
  kind: ExternalUpdateKind
  publishedAt: string
  title: string
  materiallyChangesPosition?: boolean
  contradictsCurrentConclusion?: boolean
  safetyRelevant?: boolean
  sourceUrl?: string
}

export type EditorialReviewQueueItem = {
  updateId: string
  ingredientIds: string[]
  priority: 'high' | 'urgent'
  reason: string
  requiresHumanReview: true
  allowAutomaticConclusionRewrite: false
}

export function routeExternalUpdate(update: ExternalEvidenceUpdate): EditorialReviewQueueItem | null {
  const regulatorSafety = update.safetyRelevant && Boolean(update.authority)
  const changedAuthorityPosition = update.materiallyChangesPosition && Boolean(update.authority)
  const contradictoryReview = update.kind === 'systematic-review' && update.contradictsCurrentConclusion
  if (!regulatorSafety && !changedAuthorityPosition && !contradictoryReview) return null

  const priority = regulatorSafety || contradictoryReview ? 'urgent' : 'high'
  const reason = regulatorSafety
    ? `${update.authority} safety information may affect published ingredient guidance.`
    : contradictoryReview
      ? 'A major systematic review may contradict the current site conclusion.'
      : `${update.authority} materially changed its published position.`

  return {
    updateId: update.id,
    ingredientIds: update.ingredientIds,
    priority,
    reason,
    requiresHumanReview: true,
    allowAutomaticConclusionRewrite: false,
  }
}

export const REGULATORY_WATCH_SOURCES: Record<RegulatoryAuthority, { label: string; changeTypes: ExternalUpdateKind[] }> = {
  FDA: { label: 'U.S. Food and Drug Administration', changeTypes: ['safety', 'guideline'] },
  NCCIH: { label: 'National Center for Complementary and Integrative Health', changeTypes: ['monograph', 'safety'] },
  EFSA: { label: 'European Food Safety Authority', changeTypes: ['safety', 'guideline'] },
  HEALTH_CANADA: { label: 'Health Canada', changeTypes: ['monograph', 'safety'] },
}

export type EvidenceVersionSnapshot = {
  versionId: string
  claimId: string
  ingredientId: string
  grade: CanonicalEvidenceGrade
  evidenceScore?: number
  createdAt: string
  gradingVersion: string
  studyIds: string[]
  triggeredByStudyIds: string[]
  previousVersionId?: string
  changeReason?: string
}

export function createEvidenceVersionSnapshot(input: Omit<EvidenceVersionSnapshot, 'versionId'>): EvidenceVersionSnapshot {
  const stamp = input.createdAt.replace(/[^0-9]/g, '').slice(0, 14)
  return {
    ...input,
    studyIds: [...new Set(input.studyIds)].sort(),
    triggeredByStudyIds: [...new Set(input.triggeredByStudyIds)].sort(),
    versionId: `${input.claimId}:${input.gradingVersion}:${stamp}`,
  }
}

export function validateGradeChange(previous: EvidenceVersionSnapshot | null, next: EvidenceVersionSnapshot) {
  if (!previous || previous.grade === next.grade) return { valid: true, errors: [] as string[] }
  const errors: string[] = []
  if (!next.previousVersionId) errors.push('Grade changes must preserve a pointer to the previous evidence version.')
  if (!next.triggeredByStudyIds.length) errors.push('Grade changes must record the new or changed studies that triggered the revision.')
  if (!next.changeReason?.trim()) errors.push('Grade changes must include an editorial change reason.')
  return { valid: errors.length === 0, errors }
}

export function gradeDistance(previous: CanonicalEvidenceGrade, next: CanonicalEvidenceGrade) {
  return Math.abs(GRADE_ORDER[previous] - GRADE_ORDER[next])
}

export function isMajorGradeChange(previous: CanonicalEvidenceGrade, next: CanonicalEvidenceGrade) {
  return previous !== next && (
    gradeDistance(previous, next) >= 2 ||
    previous === 'Avoid/Insufficient' ||
    next === 'Avoid/Insufficient'
  )
}

export function evidenceChangedBadge(previous: EvidenceVersionSnapshot | null, next: EvidenceVersionSnapshot) {
  if (!previous || previous.grade === next.grade) return null
  return {
    label: 'Evidence changed',
    previousGrade: previous.grade,
    currentGrade: next.grade,
    changedAt: next.createdAt,
    major: isMajorGradeChange(previous.grade, next.grade),
  }
}

export function distributionEligibility(previous: EvidenceVersionSnapshot | null, next: EvidenceVersionSnapshot) {
  const major = Boolean(previous && isMajorGradeChange(previous.grade, next.grade))
  return {
    newsletter: major,
    pressOutreach: major,
    socialDistribution: major,
  }
}

export function buildAnnualEvidenceHistory(snapshots: EvidenceVersionSnapshot[]) {
  const byYear = new Map<number, EvidenceVersionSnapshot[]>()
  for (const snapshot of snapshots) {
    const year = parseDate(snapshot.createdAt)?.getUTCFullYear()
    if (!year) continue
    const entries = byYear.get(year) ?? []
    entries.push(snapshot)
    byYear.set(year, entries)
  }

  return [...byYear.entries()]
    .sort(([left], [right]) => left - right)
    .map(([year, entries]) => ({
      year,
      snapshots: entries.sort(
        (a, b) => (parseDate(a.createdAt)?.getTime() ?? 0) - (parseDate(b.createdAt)?.getTime() ?? 0),
      ),
    }))
}
