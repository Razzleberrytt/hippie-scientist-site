import type { AtlasEffectSource } from '@/lib/botanical-atlas-url-state'

export type AtlasRecoveryRecord = {
  name: string
  scientificName?: string
  effects: string[]
  explicitEffects?: string[]
  compounds: string[]
  compoundClasses: string[]
  evidence: string
  intensity: string
  safety: string[]
}

export type AtlasRecoveryFilters = {
  query: string
  effect: string
  effectSource: AtlasEffectSource
  evidence: string
  intensity: string
  compoundClass: string
  safety: string
}

export type AtlasRecoveryAction =
  | 'clear-query'
  | 'include-pathways'
  | 'clear-effect'
  | 'clear-evidence'
  | 'clear-intensity'
  | 'clear-chemistry'
  | 'clear-safety'

export type AtlasRecoverySuggestion = {
  action: AtlasRecoveryAction
  label: string
  recoveredCount: number
}

const normalize = (value: string) => value.trim().toLowerCase()

function effectsForSource(record: AtlasRecoveryRecord, source: AtlasEffectSource) {
  return source === 'explicit' ? (record.explicitEffects ?? record.effects) : record.effects
}

function matches(record: AtlasRecoveryRecord, filters: AtlasRecoveryFilters) {
  const effects = effectsForSource(record, filters.effectSource)
  const searchable = [record.name, record.scientificName ?? '', ...effects, ...record.compounds, ...record.compoundClasses, ...record.safety].join(' ').toLowerCase()
  const needle = normalize(filters.query)

  return (!needle || searchable.includes(needle))
    && (filters.effect === 'all' || effects.includes(filters.effect))
    && (filters.evidence === 'all' || record.evidence === filters.evidence)
    && (filters.intensity === 'all' || record.intensity === filters.intensity)
    && (filters.compoundClass === 'all' || record.compoundClasses.includes(filters.compoundClass))
    && (filters.safety === 'all' || record.safety.includes(filters.safety))
}

export function getAtlasRecoverySuggestions(
  records: AtlasRecoveryRecord[],
  filters: AtlasRecoveryFilters,
  limit = 3,
): AtlasRecoverySuggestion[] {
  const candidates: Array<{ action: AtlasRecoveryAction; label: string; filters: AtlasRecoveryFilters }> = []

  if (filters.query.trim()) candidates.push({ action: 'clear-query', label: 'Clear search term', filters: { ...filters, query: '' } })
  if (filters.effectSource === 'explicit') candidates.push({ action: 'include-pathways', label: 'Include pathway-derived effects', filters: { ...filters, effectSource: 'all' } })
  if (filters.effect !== 'all') candidates.push({ action: 'clear-effect', label: 'Show all effects', filters: { ...filters, effect: 'all' } })
  if (filters.evidence !== 'all') candidates.push({ action: 'clear-evidence', label: 'Show all evidence levels', filters: { ...filters, evidence: 'all' } })
  if (filters.intensity !== 'all') candidates.push({ action: 'clear-intensity', label: 'Show all noticeability levels', filters: { ...filters, intensity: 'all' } })
  if (filters.compoundClass !== 'all') candidates.push({ action: 'clear-chemistry', label: 'Show all chemistry classes', filters: { ...filters, compoundClass: 'all' } })
  if (filters.safety !== 'all') candidates.push({ action: 'clear-safety', label: 'Show all safety signals', filters: { ...filters, safety: 'all' } })

  return candidates
    .map(({ action, label, filters: next }) => ({
      action,
      label,
      recoveredCount: records.filter((record) => matches(record, next)).length,
    }))
    .filter((suggestion) => suggestion.recoveredCount > 0)
    .sort((a, b) => b.recoveredCount - a.recoveredCount || a.label.localeCompare(b.label))
    .slice(0, limit)
}
