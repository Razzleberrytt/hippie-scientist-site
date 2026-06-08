import type { EvidenceMetrics } from './relational'

export type EvidenceLevel =
  | 'Strong Human Evidence'
  | 'Moderate Human Evidence'
  | 'Limited Human Evidence'
  | 'Mechanistic Evidence'
  | 'Evidence-Limited'
  | 'Traditional Use Context'
  | 'Preliminary Evidence'
  | 'mixed'
  | 'insufficient'

export type EvidenceTier = EvidenceLevel

export interface EvidenceSource {
  title: string
  url?: string
  note?: string
  year?: number | string
  pubmed_id?: string
  doi?: string
}

export interface EvidenceSummary {
  evidenceWeight: number
  provenanceSignals: string[]
  summary: string
}

export interface EvidenceAggregate {
  metrics: EvidenceMetrics
  sources: EvidenceSource[]
  summary?: string
}

export interface StudyRegistryEntry {
  slug: string
  entityType: 'herb' | 'compound'
  claim: string
  effect: string
  evidenceLevel: EvidenceLevel
  studyDesign?: string
  pubmedId?: string
  citationTitle?: string
  citationAuthor?: string
  citationYear?: number | string
  citationJournal?: string
}

export interface SourceRegistryEntry {
  id: string
  title: string
  url?: string
  note?: string
}
