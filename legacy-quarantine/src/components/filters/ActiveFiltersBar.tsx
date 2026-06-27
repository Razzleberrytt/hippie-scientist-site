import type { EntryFilterState } from '@/utils/filterModel'

type ActiveFiltersBarProps = {
  state: EntryFilterState
  typeLabel: string
  onRemoveEffect: (value: string) => void
  onClear: () => void
  onClearQuery: () => void
  onClearType: () => void
  onClearConfidence: () => void
  onClearEnrichment: () => void
  enrichmentLabel?: string
}

export default function ActiveFiltersBar({
  state,
  typeLabel,
  onRemoveEffect,
  onClear,
  onClearQuery,
  onClearType,
  onClearConfidence,
  onClearEnrichment,
  enrichmentLabel,
}: ActiveFiltersBarProps) {
  const hasActive =
    Boolean(state.query) ||
    state.selectedEffects.length > 0 ||
    state.confidence !== 'all' ||
    state.type !== 'all' ||
    state.enrichment !== 'all'

  if (!hasActive) return null

  const chipClass = 'rounded-full border border-white/20 bg-white/[0.03] px-2.5 py-1 text-xs text-white/84'

  return (
    <div className='browse-shell flex flex-wrap items-center gap-1.5 p-2.5'>
      <span className='mr-1 text-[11px] uppercase tracking-wide text-white/55'>Active</span>
      {state.query && (
        <button type='button' onClick={onClearQuery} className={chipClass}>
          Query: {state.query} ×
        </button>
      )}
      {state.selectedEffects.slice(0, 2).map(effect => (
        <button key={effect} type='button' onClick={() => onRemoveEffect(effect)} className={chipClass}>
          {effect} ×
        </button>
      ))}
      {state.confidence !== 'all' && (
        <button type='button' onClick={onClearConfidence} className={chipClass}>
          Confidence: {state.confidence} ×
        </button>
      )}
      {state.type !== 'all' && (
        <button type='button' onClick={onClearType} className={chipClass}>
          {typeLabel}: {state.type} ×
        </button>
      )}
      {state.enrichment !== 'all' && (
        <button type='button' onClick={onClearEnrichment} className={chipClass}>
          Research: {enrichmentLabel || state.enrichment} ×
        </button>
      )}
      <button type='button' onClick={onClear} className='btn-primary ml-auto px-3 py-1 text-xs'>
        Clear all
      </button>
    </div>
  )
}
