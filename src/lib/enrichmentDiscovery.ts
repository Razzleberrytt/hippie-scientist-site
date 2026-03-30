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
  if (filter === 'has_human_evidence') return summary.hasHumanEvidence
  if (filter === 'safety_cautions') return summary.safetyCautionsPresent
  if (filter === 'traditional_only') return summary.traditionalUseOnly
  if (filter === 'conflicting_evidence') return summary.conflictingEvidence
  return summary.enrichedAndReviewed
}
