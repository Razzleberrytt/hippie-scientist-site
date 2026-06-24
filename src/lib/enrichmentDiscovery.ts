import type { EvidenceClass, EvidenceLabel, ResearchEnrichment } from '@/types/researchEnrichment'
import type { EnrichmentFilter, PublishSafeEnrichmentSummary } from '@/types/enrichmentDiscovery'

const HUMAN_EVIDENCE_CLASSES = new Set<EvidenceClass>(['human-clinical', 'human-observational'])

const EVIDENCE_LABEL_TITLES: Record<EvidenceLabel, string> = {
  stronger_human_support: 'Stronger human support',
  limited_human_support: 'Limited human support',
  observational_only: 'Observational only',
  preclinical_only: 'Preclinical only',
  traditional_use_only: 'Traditional use only',
  mixed_or_uncertain: 'Mixed or uncertain',
  conflicting_evidence: 'Conflicting evidence',
  insufficient_evidence: 'Insufficient evidence',
}

export function buildPublishSafeEnrichmentSummary(
  enrichment: ResearchEnrichment,
): PublishSafeEnrichmentSummary {
  const evidenceLabel = enrichment.pageEvidenceJudgment?.evidenceLabel ?? 'insufficient_evidence'
  const evidenceClasses = Array.isArray(enrichment.evidenceClassesPresent)
    ? enrichment.evidenceClassesPresent
    : []

  return {
    evidenceLabel,
    evidenceLabelTitle: EVIDENCE_LABEL_TITLES[evidenceLabel],
    hasHumanEvidence: evidenceClasses.some(evidenceClass => HUMAN_EVIDENCE_CLASSES.has(evidenceClass)),
    safetyCautionsPresent:
      (enrichment.safetyProfile?.summary?.total ?? 0) > 0 ||
      enrichment.interactions.length > 0 ||
      enrichment.contraindications.length > 0 ||
      enrichment.adverseEffects.length > 0,
    supportedUseCoveragePresent:
      enrichment.supportedUses.length > 0 || enrichment.unsupportedOrUnclearUses.length > 0,
    mechanismOrConstituentCoveragePresent:
      enrichment.mechanisms.length > 0 || enrichment.constituents.length > 0,
    traditionalUseOnly: evidenceLabel === 'traditional_use_only',
    conflictingEvidence:
      evidenceLabel === 'conflicting_evidence' ||
      enrichment.pageEvidenceJudgment?.grading?.conflictState === 'conflicting_evidence',
    enrichedAndReviewed: true,
    lastReviewedAt: enrichment.lastReviewedAt,
  }
}

export function matchesEnrichmentFilter(
  summary: PublishSafeEnrichmentSummary | null | undefined,
  filter: EnrichmentFilter,
) {
  if (filter === 'all') return true
  if (!summary) return false
  if (filter === 'human_clinical_or_limited') {
    return (
      summary.evidenceLabel === 'stronger_human_support' ||
      summary.evidenceLabel === 'limited_human_support'
    )
  }
  if (filter === 'has_human_evidence') return summary.hasHumanEvidence
  if (filter === 'safety_cautions') return summary.safetyCautionsPresent
  if (filter === 'traditional_only') return summary.traditionalUseOnly
  if (filter === 'conflicting_evidence') return summary.conflictingEvidence
  if (filter === 'mechanism_or_constituent_coverage') {
    return summary.mechanismOrConstituentCoveragePresent
  }
  if (filter === 'reviewed_recently') {
    return getReviewFreshnessState(summary.lastReviewedAt) === 'fresh'
  }
  return summary.enrichedAndReviewed
}

export type ReviewFreshnessState = 'fresh' | 'aging' | 'stale' | 'unknown'

const FRESH_WINDOW_DAYS = 180
const AGING_WINDOW_DAYS = 365

export function getReviewFreshnessState(lastReviewedAt: string | null | undefined): ReviewFreshnessState {
  const reviewedAt = Date.parse(String(lastReviewedAt || ''))
  if (!Number.isFinite(reviewedAt)) return 'unknown'
  const ageDays = (Date.now() - reviewedAt) / (1000 * 60 * 60 * 24)
  if (ageDays <= FRESH_WINDOW_DAYS) return 'fresh'
  if (ageDays <= AGING_WINDOW_DAYS) return 'aging'
  return 'stale'
}
