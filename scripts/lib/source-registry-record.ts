import type {
  EvidenceClass,
  SourceClass,
  SourceType as GovernedSourceType,
  StudyDesign as GovernedStudyDesign,
} from './source-class-governance'

export type SourceRegistrySourceType = GovernedSourceType | 'other'
export type SourceRegistryStudyDesign = GovernedStudyDesign | 'other'
export type SourcePublicationStatus = 'published' | 'preprint' | 'withdrawn' | 'superseded' | 'archived'
export type SourceReliabilityTier = 'tier-a' | 'tier-b' | 'tier-c' | 'tier-d'

/**
 * Script-side representation of one persisted source-registry row.
 * Runtime validity remains authoritative in schemas/source-registry.schema.json
 * plus validate-source-registry.mjs; this type exists to keep active TypeScript
 * consumers from redeclaring incompatible projections of the same record.
 */
export type SourceRegistryRecord = {
  sourceId: string
  title: string
  shortTitle?: string
  sourceType: SourceRegistrySourceType
  sourceClass: SourceClass
  organization?: string
  authors?: string[]
  publicationYear?: number
  citationText?: string
  doi?: string
  pmid?: string
  monographId?: string
  isbn?: string
  canonicalUrl?: string
  accessDate?: string
  language: string
  jurisdiction?: string
  region?: string
  evidenceClass: EvidenceClass
  studyDesign?: SourceRegistryStudyDesign
  publicationStatus: SourcePublicationStatus
  reliabilityTier: SourceReliabilityTier
  reviewer: string
  reviewedAt: string
  notes?: string
  active: boolean
}
