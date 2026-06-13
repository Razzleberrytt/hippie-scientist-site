import type Fuse from 'fuse.js'
import type {
  SearchDoc,
  SearchFacets,
  SearchFacetOption,
  SearchFilterState,
} from './types'

/**
 * Client-side search engine over the precomputed `search-index.json`.
 *
 * The index (~1k docs) and Fuse are loaded lazily via dynamic import so they
 * are code-split out of the base bundle and only fetched when the user actually
 * opens search. Everything is fully static (no runtime server).
 */

export interface SearchEngine {
  docs: SearchDoc[]
  facets: SearchFacets
  fuse: Fuse<SearchDoc>
}

let enginePromise: Promise<SearchEngine> | null = null

const GOAL_LABELS: Record<string, string> = {
  sleep: 'Sleep',
  stress: 'Stress',
  anxiety: 'Anxiety',
  focus: 'Focus',
  energy: 'Energy',
  mood: 'Mood',
  cognition: 'Cognition',
  recovery: 'Recovery',
  inflammation: 'Inflammation',
  pain: 'Pain',
  immune: 'Immune',
  'gut-health': 'Gut health',
  longevity: 'Longevity',
  'heart-health': 'Heart health',
}

const PATHWAY_LABELS: Record<string, string> = {
  dopamine: 'Dopamine',
  serotonin: 'Serotonin',
  gaba: 'GABA',
  glutamate: 'Glutamate',
  acetylcholine: 'Acetylcholine',
  'hpa-axis': 'HPA axis',
  inflammation: 'Inflammation',
  'oxidative-stress': 'Oxidative stress',
  bdnf: 'BDNF',
  endocannabinoid: 'Endocannabinoid',
}

function labelFor(value: string, map: Record<string, string>): string {
  return map[value] ?? value.replace(/-/g, ' ').replace(/^./, (c) => c.toUpperCase())
}

function tally(
  docs: SearchDoc[],
  pick: (doc: SearchDoc) => string[],
  label: (value: string) => string,
): SearchFacetOption[] {
  const counts = new Map<string, number>()
  for (const doc of docs) {
    for (const value of pick(doc)) {
      counts.set(value, (counts.get(value) ?? 0) + 1)
    }
  }
  return Array.from(counts.entries())
    .map(([value, count]) => ({ value, label: label(value), count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
}

export function computeFacets(docs: SearchDoc[]): SearchFacets {
  return {
    types: tally(docs, (d) => [d.type], (v) => v),
    goals: tally(docs, (d) => d.goals, (v) => labelFor(v, GOAL_LABELS)),
    pathways: tally(docs, (d) => d.pathways, (v) => labelFor(v, PATHWAY_LABELS)),
    evidenceGrades: tally(docs, (d) => [d.evidenceGrade], (v) => v),
    safety: tally(docs, (d) => [d.safety], (v) => v),
  }
}

export async function loadSearchEngine(): Promise<SearchEngine> {
  if (!enginePromise) {
    enginePromise = (async () => {
      const [{ default: FuseCtor }, indexModule] = await Promise.all([
        import('fuse.js'),
        import('@/public/data/search-index.json'),
      ])
      const docs = (indexModule.default ?? indexModule) as unknown as SearchDoc[]
      const fuse = new FuseCtor(docs, {
        keys: [
          { name: 'title', weight: 0.45 },
          { name: 'tags', weight: 0.2 },
          { name: 'summary', weight: 0.15 },
          { name: 'searchText', weight: 0.2 },
        ],
        threshold: 0.34,
        ignoreLocation: true,
        includeScore: true,
        minMatchCharLength: 2,
      })
      return { docs, facets: computeFacets(docs), fuse }
    })()
  }
  return enginePromise
}

/** Ranks type so monographs surface above education for equal relevance. */
const TYPE_RANK: Record<SearchDoc['type'], number> = { Herb: 0, Compound: 0, Education: 1 }

export function filterDocs(docs: SearchDoc[], filters: SearchFilterState): SearchDoc[] {
  return docs.filter((doc) => {
    if (filters.types.length && !filters.types.includes(doc.type)) return false
    if (filters.goals.length && !filters.goals.some((g) => doc.goals.includes(g))) return false
    if (filters.pathways.length && !filters.pathways.some((p) => doc.pathways.includes(p))) return false
    if (filters.evidenceGrades.length && !filters.evidenceGrades.includes(doc.evidenceGrade)) return false
    if (filters.safety.length && !filters.safety.includes(doc.safety)) return false
    if (filters.hasInteractions && !doc.safetyFlags.hasInteractions) return false
    if (filters.hasContraindications && !doc.safetyFlags.hasContraindications) return false
    return true
  })
}

export interface SearchParams {
  query: string
  filters: SearchFilterState
  limit?: number
}

/**
 * Runs a query against the engine and applies facet filters. With no query,
 * returns a stable browse list (filtered) so the UI always shows something.
 */
export function runSearch(engine: SearchEngine, params: SearchParams): SearchDoc[] {
  const { query, filters, limit = 50 } = params
  const trimmed = query.trim()

  let results: SearchDoc[]
  if (!trimmed) {
    results = [...engine.docs].sort(
      (a, b) => TYPE_RANK[a.type] - TYPE_RANK[b.type] || a.title.localeCompare(b.title),
    )
  } else {
    results = engine.fuse
      .search(trimmed)
      .sort((a, b) => {
        const score = (a.score ?? 1) - (b.score ?? 1)
        if (Math.abs(score) > 0.0001) return score
        return TYPE_RANK[a.item.type] - TYPE_RANK[b.item.type]
      })
      .map((r) => r.item)
  }

  return filterDocs(results, filters).slice(0, limit)
}

export function activeFilterCount(filters: SearchFilterState): number {
  return (
    filters.types.length +
    filters.goals.length +
    filters.pathways.length +
    filters.evidenceGrades.length +
    filters.safety.length +
    (filters.hasInteractions ? 1 : 0) +
    (filters.hasContraindications ? 1 : 0)
  )
}
