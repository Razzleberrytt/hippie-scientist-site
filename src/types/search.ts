export type SearchType = 'Herb' | 'Compound'

export interface SearchRecord {
  slug: string
  name: string
  type: SearchType
  href: string
  summary: string
  effects: string[]
  evidence: string
  safety: string
  quality: string
  searchText: string
  authorityScore: number
  discoveryScore: number
  evidenceScore: number
  mechanismScore: number
  ecosystemScore: number
  safetyPenalty: number
  uncertaintyPenalty: number
  translationalPenalty: number
  avoid_if?: string[]
  side_effects?: string[]
  contraindications?: string[]
  interactions?: string[]
  typical_dosage?: string
}

export type SearchIndex = SearchRecord[]
export type FilterType = 'All' | 'Herb' | 'Compound'
export type SearchIntent = 'general' | 'evidence' | 'safety' | 'mechanism' | 'comparison'
