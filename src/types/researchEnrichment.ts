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

export type EditorialStatus = 'draft' | 'in-review' | 'approved' | 'needs-update' | 'deprecated'

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
  topicEvidenceJudgments: Partial<Record<string, EvidenceJudgment>>
  pageEvidenceJudgment: EvidenceJudgment
  sourceRefs: ResearchSourceRef[]
  lastReviewedAt: string
  reviewedBy: string
  editorialStatus: EditorialStatus
  relatedEntities?: RelatedEntityRef[]
}
