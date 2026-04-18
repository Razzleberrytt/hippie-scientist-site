import type { ResearchEnrichment } from './researchEnrichment'
import type { ConfidenceLevel } from './confidence'
import type { PublishSafeEnrichmentSummary } from './enrichmentDiscovery'

export type CanonicalCompound = {
  name: string
  slug: string
  summary: string
  description: string
  compoundClass: string
  mechanisms: string[]
  targets: string[]
  pathways: string[]
  foundIn: string[]
  bioavailability: string
  safetyNotes: string
  evidenceLevel: string
  relatedCompounds: string[]
  confidence?: ConfidenceLevel
}

export type CompoundRecord = {
  name: string
  category?: string
  mechanism?: string
  effects?: string[]
  safety?: string[]
  interactionTags?: string[]
  interactionNotes?: string[]
  herbs?: string[]
  confidence?: ConfidenceLevel
  type?: string
  identity?: string
  categoryUseContext?: string
  evidenceLevel?: string
  relatedEntities?: string[]
  relatedCompounds?: string[]
  linkedHerbs?: string[]
  researchEnrichment?: ResearchEnrichment
  researchEnrichmentSummary?: PublishSafeEnrichmentSummary
  foundIn?: string[]
  [key: string]: unknown
}

export type Compound = CompoundRecord
