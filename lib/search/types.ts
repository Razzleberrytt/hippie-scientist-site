/**
 * Shared types for the global search index.
 *
 * The index is a build-time generated artifact at
 * `public/data/search-index.json` (produced by
 * `scripts/data/build-search-index.mjs`). Both the `/search` page and the
 * global command-palette modal consume the same `SearchDoc[]` shape so ranking,
 * filtering, and rendering stay consistent.
 */

export type SearchContentType = 'Herb' | 'Compound' | 'Education'

/** Normalized evidence buckets shared across content types. */
export type EvidenceGrade =
  | 'Strong'
  | 'Moderate'
  | 'Limited'
  | 'Preliminary'
  | 'Educational'

/** Coarse safety signal used for the safety filter and badges. */
export type SafetySignal =
  | 'Generally well tolerated'
  | 'Use with caution'
  | 'Notable considerations'
  | 'Educational'

export interface SearchDoc {
  /** Stable id: `${type}:${slug}`. */
  id: string
  slug: string
  type: SearchContentType
  title: string
  /** Destination route, e.g. `/herbs/ashwagandha`. */
  href: string
  summary: string
  /** Goal/use-case facets, lowercased (e.g. `sleep`, `focus`, `stress`). */
  goals: string[]
  /** Mechanistic pathway facets, lowercased (e.g. `dopamine`, `gaba`). */
  pathways: string[]
  evidenceGrade: EvidenceGrade
  safety: SafetySignal
  /** Granular safety flags surfaced as filter chips. */
  safetyFlags: {
    hasInteractions: boolean
    hasContraindications: boolean
  }
  /** Short effect/topic chips for the result card. */
  tags: string[]
  /** Flattened, lowercased haystack used by fuzzy search. */
  searchText: string
}

export interface SearchFacetOption {
  value: string
  label: string
  count: number
}

export interface SearchFacets {
  types: SearchFacetOption[]
  goals: SearchFacetOption[]
  pathways: SearchFacetOption[]
  evidenceGrades: SearchFacetOption[]
  safety: SearchFacetOption[]
}

export interface SearchFilterState {
  types: SearchContentType[]
  goals: string[]
  pathways: string[]
  evidenceGrades: EvidenceGrade[]
  safety: SafetySignal[]
  /** Convenience flags layered on top of the facet filters. */
  hasInteractions: boolean
  hasContraindications: boolean
}

export const EMPTY_FILTERS: SearchFilterState = {
  types: [],
  goals: [],
  pathways: [],
  evidenceGrades: [],
  safety: [],
  hasInteractions: false,
  hasContraindications: false,
}
