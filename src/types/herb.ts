import type { ConfidenceLevel } from './confidence'

export type CanonicalHerb = {
  name: string
  class: string
  activeCompounds: string[]
  mechanism: string
  effects: string[]
  contraindications: string[]
  description?: string
  confidence?: ConfidenceLevel
}

export type HerbRecord = {
  // Identity
  slug: string
  name?: string
  scientificName?: string
  category?: string
  plantPartUsed?: string
  commonNames?: string[]
  region?: string

  // Content
  summary?: string
  description?: string
  mechanism?: string
  mechanismTags?: string[]
  evidenceLevel?: string
  activeCompounds?: string[]
  markerCompounds?: string[]
  safetyNotes?: string
  interactions?: string[] | string
  contraindications?: string[] | string
  preparation?: string | null
  dosage?: string
  standardization?: string
  qualityConcerns?: string
  pathwayTargets?: string[]

  // Scores & metadata
  confidence?: ConfidenceLevel
  completenessPct?: number
  totalScore?: number
  priorityTier?: string
  evidence_tier?: string
  compound_count?: number
  pathway_count?: number

  // Publish status
  publishStatus?: string
  readinessFlag?: string
  frontendReadyFlag?: string

  // Sources
  sources?: Array<string | { title: string; url?: string; note?: string }>

  // Legacy fields kept for backwards compat
  image?: string
  affiliatelink?: string | null
  [key: string]: unknown
}

export type Herb = HerbRecord
