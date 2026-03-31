export type ConfidenceFilter = 'all' | 'high' | 'medium' | 'low'
export type SortFilter =
  | 'az'
  | 'confidence'
  | 'effects'
  | 'governed_evidence'
  | 'review_freshness'
  | 'safety_first'
import type { EnrichmentFilter } from '@/types/enrichmentDiscovery'

export type EntryFilterState = {
  query: string
  selectedEffects: string[]
  confidence: ConfidenceFilter
  type: string
  enrichment: EnrichmentFilter
  sort: SortFilter
}

export const DEFAULT_FILTER_STATE: EntryFilterState = {
  query: '',
  selectedEffects: [],
  confidence: 'all',
  type: 'all',
  enrichment: 'all',
  sort: 'az',
}

export function parseFilterStateFromSearchParams(
  params: URLSearchParams,
  defaults: EntryFilterState = DEFAULT_FILTER_STATE
): EntryFilterState {
  const query = (params.get('q') || defaults.query).trim()
  const effects = (params.get('effects') || '')
    .split(',')
    .map(effect => effect.trim())
    .filter(Boolean)
  const confidenceRaw = (params.get('confidence') || defaults.confidence).toLowerCase()
  const confidence: ConfidenceFilter = ['all', 'high', 'medium', 'low'].includes(confidenceRaw)
    ? (confidenceRaw as ConfidenceFilter)
    : defaults.confidence

  const sortRaw = (params.get('sort') || defaults.sort).toLowerCase()
  const sort: SortFilter = [
    'az',
    'confidence',
    'effects',
    'governed_evidence',
    'review_freshness',
    'safety_first',
  ].includes(sortRaw)
    ? (sortRaw as SortFilter)
    : defaults.sort
  const enrichmentRaw = (params.get('enrichment') || defaults.enrichment).toLowerCase()
  const enrichment: EnrichmentFilter = [
    'all',
    'has_human_evidence',
    'safety_cautions',
    'traditional_only',
    'conflicting_evidence',
    'reviewed_recently',
    'mechanism_or_constituent_coverage',
    'human_clinical_or_limited',
    'enriched_reviewed',
  ].includes(enrichmentRaw)
    ? (enrichmentRaw as EnrichmentFilter)
    : defaults.enrichment

  return {
    query,
    selectedEffects: effects,
    confidence,
    type: (params.get('type') || defaults.type || 'all').trim() || 'all',
    enrichment,
    sort,
  }
}

export function toSearchParamsFromFilterState(state: EntryFilterState): URLSearchParams {
  const next = new URLSearchParams()

  if (state.query.trim()) next.set('q', state.query.trim())
  if (state.selectedEffects.length > 0) next.set('effects', state.selectedEffects.join(','))
  if (state.confidence !== 'all') next.set('confidence', state.confidence)
  if (state.type !== 'all') next.set('type', state.type)
  if (state.enrichment !== 'all') next.set('enrichment', state.enrichment)
  if (state.sort !== 'az') next.set('sort', state.sort)

  return next
}
