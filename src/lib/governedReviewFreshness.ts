import { getReviewFreshnessState } from '@/lib/enrichmentDiscovery'
import type { ResearchEnrichment } from '@/types/researchEnrichment'

export type GovernedFreshnessState = 'fresh' | 'aging' | 'review_due' | 'partial'

export type GovernedReviewFreshnessDecision = {
  mode: 'governed' | 'hidden'
  state: GovernedFreshnessState
  reviewedLabel: string
  statusLabel: string
  statusTone: 'positive' | 'caution' | 'warning'
  uncertaintyVisible: boolean
  whatChangedRecently: string[]
  usedSignals: string[]
  excludedSignals: Array<{ signal: string; reason: string }>
}

function formatDate(isoDate: string) {
  const value = Date.parse(isoDate)
  if (!Number.isFinite(value)) return 'review date unavailable'
  return new Date(value).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function hasCoverage(enrichment: ResearchEnrichment, topic: 'supported' | 'safety' | 'mechanism') {
  if (topic === 'supported') {
    return enrichment.supportedUses.length > 0 || enrichment.unsupportedOrUnclearUses.length > 0
  }
  if (topic === 'safety') {
    return (
      (enrichment.safetyProfile?.summary?.total ?? 0) > 0 ||
      enrichment.interactions.length > 0 ||
      enrichment.contraindications.length > 0 ||
      enrichment.adverseEffects.length > 0
    )
  }
  return enrichment.mechanisms.length > 0 || enrichment.constituents.length > 0
}

export function buildGovernedReviewFreshness(
  enrichment: ResearchEnrichment | null | undefined,
): GovernedReviewFreshnessDecision {
  if (!enrichment) {
    return {
      mode: 'hidden',
      state: 'review_due',
      reviewedLabel: 'Governed review pending',
      statusLabel: 'No approved governed review yet',
      statusTone: 'warning',
      uncertaintyVisible: false,
      whatChangedRecently: [],
      usedSignals: [],
      excludedSignals: [{ signal: 'publishable_governed_enrichment', reason: 'no_publishable_governed_enrichment' }],
    }
  }

  const usedSignals = [
    'publishable_governed_enrichment',
    'last_reviewed_at',
    'topic_coverage_supported_use',
    'topic_coverage_safety',
    'topic_coverage_mechanism_or_constituent',
    'uncertainty_or_conflict_visibility',
  ]

  const excludedSignals: GovernedReviewFreshnessDecision['excludedSignals'] = [
    {
      signal: 'blocked_or_unapproved_submission_states',
      reason: 'excluded_by_publishable_governance_gate',
    },
    {
      signal: 'internal_review_queue_notes',
      reason: 'internal_only_workflow_detail',
    },
  ]

  const freshness = getReviewFreshnessState(enrichment.lastReviewedAt)
  const supportedCoverage = hasCoverage(enrichment, 'supported')
  const safetyCoverage = hasCoverage(enrichment, 'safety')
  const mechanismCoverage = hasCoverage(enrichment, 'mechanism')
  const missingCoverageCount = [supportedCoverage, safetyCoverage, mechanismCoverage].filter(
    value => !value,
  ).length

  const uncertaintyVisible =
    enrichment.conflictNotes.length > 0 ||
    enrichment.unsupportedOrUnclearUses.length > 0 ||
    enrichment.pageEvidenceJudgment.grading.conflictState !== 'none' ||
    enrichment.pageEvidenceJudgment.uncertaintyNotes.length > 0 ||
    enrichment.pageEvidenceJudgment.conflictNotes.length > 0

  let state: GovernedFreshnessState = 'review_due'
  let statusLabel = 'Review due'
  let statusTone: GovernedReviewFreshnessDecision['statusTone'] = 'warning'

  if (missingCoverageCount > 0) {
    state = 'partial'
    statusLabel = 'Partial coverage'
    statusTone = 'caution'
  } else if (freshness === 'fresh') {
    state = 'fresh'
    statusLabel = 'Fresh review'
    statusTone = 'positive'
  } else if (freshness === 'aging') {
    state = 'aging'
    statusLabel = 'Aging review'
    statusTone = 'caution'
  }

  const reviewedDate = formatDate(enrichment.lastReviewedAt)
  const reviewedLabel = `Reviewed ${reviewedDate}`

  const whatChangedRecently: string[] = []
  whatChangedRecently.push(`Last governed review cycle: ${reviewedDate}.`)

  if (freshness === 'fresh') {
    whatChangedRecently.push('This page was reviewed within the current freshness window.')
  } else if (freshness === 'aging') {
    whatChangedRecently.push('This page is aging and may need re-review soon.')
  } else {
    whatChangedRecently.push('This page is due for re-review before stronger recency claims are made.')
  }

  if (!safetyCoverage) {
    whatChangedRecently.push('Key safety areas remain under review, so coverage is intentionally conservative.')
  }
  if (uncertaintyVisible) {
    whatChangedRecently.push('Uncertainty or conflicting signals are explicitly noted in governed evidence sections.')
  }

  return {
    mode: 'governed',
    state,
    reviewedLabel,
    statusLabel,
    statusTone,
    uncertaintyVisible,
    whatChangedRecently,
    usedSignals,
    excludedSignals,
  }
}
