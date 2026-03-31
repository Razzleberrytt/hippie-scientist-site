import type { PublishSafeEnrichmentSummary } from '@/types/enrichmentDiscovery'
import { getReviewFreshnessState } from '@/lib/enrichmentDiscovery'

export type GovernedDiscoveryFilter =
  | 'all'
  | 'governed_reviewed'
  | 'human_support'
  | 'safety_present'
  | 'uncertainty_or_conflict'
  | 'review_fresh'
  | 'mechanism_or_constituent'

export type GovernedDiscoverySort =
  | 'default'
  | 'best_covered_first'
  | 'evidence_strength'
  | 'review_freshness'

export type GovernedDiscoveryMeta = {
  eligible: boolean
  evidenceLabel: string
  freshness: ReturnType<typeof getReviewFreshnessState>
  hasHumanSupport: boolean
  hasSafetySignals: boolean
  hasUncertaintyOrConflict: boolean
  hasMechanismOrConstituent: boolean
  bestCoveredScore: number
}

export type GovernedDiscoveryCandidate<T> = {
  item: T
  slug: string
  index: number
  summary?: PublishSafeEnrichmentSummary
  meta: GovernedDiscoveryMeta
}

const EVIDENCE_RANK: Record<string, number> = {
  stronger_human_support: 6,
  limited_human_support: 5,
  observational_only: 4,
  mixed_or_uncertain: 3,
  conflicting_evidence: 2,
  preclinical_only: 1,
  traditional_use_only: 1,
  insufficient_evidence: 0,
}

function toFreshnessRank(freshness: ReturnType<typeof getReviewFreshnessState>) {
  if (freshness === 'fresh') return 2
  if (freshness === 'aging') return 1
  if (freshness === 'stale') return 0
  return -1
}

function toMeta(summary: PublishSafeEnrichmentSummary | undefined): GovernedDiscoveryMeta {
  const eligible = Boolean(summary?.enrichedAndReviewed)
  const evidenceLabel = summary?.evidenceLabel || 'insufficient_evidence'
  const evidenceRank = EVIDENCE_RANK[evidenceLabel] ?? 0
  const freshness = getReviewFreshnessState(summary?.lastReviewedAt)
  const freshnessRank = toFreshnessRank(freshness)

  const hasHumanSupport = Boolean(
    summary &&
      (summary.evidenceLabel === 'stronger_human_support' ||
        summary.evidenceLabel === 'limited_human_support'),
  )

  const hasUncertaintyOrConflict = Boolean(
    summary &&
      (summary.conflictingEvidence ||
        summary.evidenceLabel === 'mixed_or_uncertain' ||
        summary.evidenceLabel === 'conflicting_evidence'),
  )

  const baseScore =
    (eligible ? 100 : 0) +
    evidenceRank * 10 +
    (summary?.mechanismOrConstituentCoveragePresent ? 6 : 0) +
    (summary?.safetyCautionsPresent ? 5 : 0) +
    (hasHumanSupport ? 8 : 0) +
    Math.max(freshnessRank, 0) * 3 -
    (hasUncertaintyOrConflict ? 4 : 0)

  return {
    eligible,
    evidenceLabel,
    freshness,
    hasHumanSupport,
    hasSafetySignals: Boolean(summary?.safetyCautionsPresent),
    hasUncertaintyOrConflict,
    hasMechanismOrConstituent: Boolean(summary?.mechanismOrConstituentCoveragePresent),
    bestCoveredScore: eligible ? baseScore : -1,
  }
}

function matchesFilter(meta: GovernedDiscoveryMeta, filter: GovernedDiscoveryFilter) {
  if (filter === 'all') return true
  if (filter === 'governed_reviewed') return meta.eligible
  if (!meta.eligible) return false
  if (filter === 'human_support') return meta.hasHumanSupport
  if (filter === 'safety_present') return meta.hasSafetySignals
  if (filter === 'uncertainty_or_conflict') return meta.hasUncertaintyOrConflict
  if (filter === 'review_fresh') return meta.freshness === 'fresh'
  if (filter === 'mechanism_or_constituent') return meta.hasMechanismOrConstituent
  return true
}

function compareCandidates<T>(
  a: GovernedDiscoveryCandidate<T>,
  b: GovernedDiscoveryCandidate<T>,
  sort: GovernedDiscoverySort,
) {
  if (sort === 'default') return a.index - b.index

  if (sort === 'review_freshness') {
    const freshnessDiff = toFreshnessRank(b.meta.freshness) - toFreshnessRank(a.meta.freshness)
    if (freshnessDiff !== 0) return freshnessDiff
  }

  if (sort === 'evidence_strength') {
    const evidenceDiff = (EVIDENCE_RANK[b.meta.evidenceLabel] ?? 0) - (EVIDENCE_RANK[a.meta.evidenceLabel] ?? 0)
    if (evidenceDiff !== 0) return evidenceDiff
  }

  const scoreDiff = b.meta.bestCoveredScore - a.meta.bestCoveredScore
  if (scoreDiff !== 0) return scoreDiff

  const evidenceDiff = (EVIDENCE_RANK[b.meta.evidenceLabel] ?? 0) - (EVIDENCE_RANK[a.meta.evidenceLabel] ?? 0)
  if (evidenceDiff !== 0) return evidenceDiff

  return a.index - b.index
}

export function buildGovernedDiscoveryCandidates<T extends { slug: string }>(
  items: T[],
  getSummary: (item: T) => PublishSafeEnrichmentSummary | undefined,
): GovernedDiscoveryCandidate<T>[] {
  return items.map((item, index) => {
    const summary = getSummary(item)
    return {
      item,
      slug: item.slug,
      index,
      summary,
      meta: toMeta(summary),
    }
  })
}

export function applyGovernedDiscoveryControls<T extends { slug: string }>(args: {
  items: T[]
  getSummary: (item: T) => PublishSafeEnrichmentSummary | undefined
  filter: GovernedDiscoveryFilter
  sort: GovernedDiscoverySort
}) {
  const candidates = buildGovernedDiscoveryCandidates(args.items, args.getSummary)
  const filtered = candidates.filter(candidate => matchesFilter(candidate.meta, args.filter))
  const sorted = filtered.slice().sort((a, b) => compareCandidates(a, b, args.sort))

  return {
    candidates,
    filteredCandidates: sorted,
    items: sorted.map(candidate => candidate.item),
    eligibility: {
      total: candidates.length,
      governedEligible: candidates.filter(candidate => candidate.meta.eligible).length,
      humanSupportEligible: candidates.filter(candidate => candidate.meta.hasHumanSupport).length,
      safetyPresent: candidates.filter(candidate => candidate.meta.hasSafetySignals).length,
      mechanismOrConstituent: candidates.filter(candidate => candidate.meta.hasMechanismOrConstituent)
        .length,
      uncertaintyOrConflict: candidates.filter(candidate => candidate.meta.hasUncertaintyOrConflict)
        .length,
      freshReviewed: candidates.filter(candidate => candidate.meta.freshness === 'fresh').length,
    },
  }
}
