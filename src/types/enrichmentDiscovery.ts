import type { EvidenceLabel } from './researchEnrichment'

export type EnrichmentFilter =
  | 'all'
  | 'has_human_evidence'
  | 'safety_cautions'
  | 'traditional_only'
  | 'conflicting_evidence'
  | 'enriched_reviewed'

export type PublishSafeEnrichmentSummary = {
  evidenceLabel: EvidenceLabel
  evidenceLabelTitle: string
  hasHumanEvidence: boolean
  safetyCautionsPresent: boolean
  supportedUseCoveragePresent: boolean
  mechanismOrConstituentCoveragePresent: boolean
  traditionalUseOnly: boolean
  conflictingEvidence: boolean
  enrichedAndReviewed: boolean
  lastReviewedAt: string
}
