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
  sourceRefs: ResearchSourceRef[]
  lastReviewedAt: string
  reviewedBy: string
  editorialStatus: EditorialStatus
  relatedEntities?: RelatedEntityRef[]
}
