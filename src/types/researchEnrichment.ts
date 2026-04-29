export type EvidenceClass =
  | 'human-clinical'
  | 'human-observational'
  | 'preclinical-mechanistic'
  | 'traditional-use'
  | 'regulatory-monograph'

export type EvidenceTier =
  | 'tier-1-strong'
  | 'tier-2-moderate'
  | 'tier-3-limited'
  | 'tier-4-insufficient'

export type EditorialStatus =
  | 'draft'
  | 'needs_review'
  | 'reviewed'
  | 'in-review'
  | 'approved'
  | 'published'
  | 'blocked'
  | 'needs-update'
  | 'deprecated'

export type SourceRefType =
  | 'rct'
  | 'systematic-review'
  | 'observational'
  | 'preclinical'
  | 'monograph'
  | 'traditional-text'
  | 'regulatory'
  | 'other'

export type ExtractConfidence = 'high' | 'medium' | 'low'

export type ResearchClaim = {
  claim: string
  evidenceClass: EvidenceClass
  sourceRefIds: string[]
  strengthNote?: string
  evidenceGrade?: 'A' | 'B'
  population?: string
  primaryPmids?: string[]
}

export type EvidenceLabel =
  | 'stronger_human_support'
  | 'limited_human_support'
  | 'observational_only'
  | 'preclinical_only'
  | 'traditional_use_only'
  | 'mixed_or_uncertain'
  | 'conflicting_evidence'
  | 'insufficient_evidence'

export type ConflictState = 'none' | 'mixed_or_uncertain' | 'conflicting_evidence'

export type EvidenceJudgment = {
  evidenceLabel: EvidenceLabel
  grading: {
    evidenceClass: EvidenceClass[]
    studyDesignWeight: number
    humanRelevance: 'none' | 'direct-human' | 'human-observational' | 'preclinical-proxy' | 'traditional-context'
    directnessToClaim: 'direct' | 'proximal' | 'indirect' | 'contextual'
    replicationDepth: number
    sourceReliabilityTier: 'tier-a' | 'tier-b' | 'tier-c' | 'tier-d'
    recencyWeight: number
    editorialConfidence: 'high' | 'medium' | 'low'
    conflictState: ConflictState
    confidenceIndex: number
  }
  conflictNotes: string[]
  uncertaintyNotes: string[]
  toneGuidance: string
}

export type ResearchSourceRef = {
  sourceId: string
  sourceType: SourceRefType
  title: string
  organization?: string
  publicationYear?: number
  url?: string
  citationKey?: string
  evidenceClass: EvidenceClass
  notes?: string
  extractConfidence: ExtractConfidence
  reviewer: string
}

export type RelatedEntityRef = {
  entityType: 'herb' | 'compound'
  slug: string
  relationshipType: string
  notes?: string
}

export type ResearchEnrichment = {
  evidenceSummary: string
  evidenceTier: EvidenceTier
  evidenceClassesPresent: EvidenceClass[]
  supportedUses: ResearchClaim[]
  unsupportedOrUnclearUses: ResearchClaim[]
  mechanisms: ResearchClaim[]
  constituents: ResearchClaim[]
  interactions: ResearchClaim[]
  contraindications: ResearchClaim[]
  adverseEffects: ResearchClaim[]
  dosageContextNotes: ResearchClaim[]
  populationSpecificNotes: ResearchClaim[]
  conflictNotes: ResearchClaim[]
  researchGaps: ResearchClaim[]
  safetyProfile?: {
    safetyEntries: Array<{
      safetyEntryId: string
      sourceId: string
      safetyTopicType:
        | 'interaction'
        | 'contraindication'
        | 'adverse_effect'
        | 'pregnancy_note'
        | 'lactation_note'
        | 'pediatric_note'
        | 'geriatric_note'
        | 'condition_caution'
        | 'surgery_caution'
        | 'medication_class_caution'
      targetType: 'drug' | 'drug_class' | 'herb' | 'condition' | 'population'
      targetName: string
      severityLabel: 'none_known' | 'low' | 'moderate' | 'high' | 'severe' | 'contraindicated'
      urgencyLabel: 'routine' | 'caution' | 'prompt_review' | 'urgent'
      evidenceClass: EvidenceClass
      findingTextShort: string
      findingTextNormalized: string
      mechanismKnown: boolean
      populationContext?: string
      medicationClassContext?: string
      uncertaintyNote?: string
      conflictNote?: string
      reviewer: string
      reviewedAt: string
      editorialStatus: EditorialStatus
      active: boolean
    }>
    summary: {
      total: number
      byTopicType: Record<string, number>
      bySeverity: Record<string, number>
    }
  }
  topicEvidenceJudgments: Partial<Record<string, EvidenceJudgment>>
  pageEvidenceJudgment: EvidenceJudgment
  editorialReadiness?: {
    publishable: boolean
    hasConflictOrWeakEvidence: boolean
    conflictLabelingPresent: boolean
    weakEvidenceClaimsLabeled: boolean
  }
  sourceRefs: ResearchSourceRef[]
  lastReviewedAt: string
  reviewedBy: string
  editorialStatus: EditorialStatus
  relatedEntities?: RelatedEntityRef[]
}
