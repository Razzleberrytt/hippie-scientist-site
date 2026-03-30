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

  return (
    <div className='flex flex-wrap items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-3'>
      {state.query && (
        <button
          type='button'
          onClick={onClearQuery}
          className='rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs text-white/90'
        >
          Query: {state.query} ×
        </button>
      )}
      {state.selectedEffects.map(effect => (
        <button
          key={effect}
          type='button'
          onClick={() => onRemoveEffect(effect)}
          className='rounded-full border border-violet-300/40 bg-violet-500/15 px-3 py-1 text-xs text-violet-100'
        >
          Effect: {effect} ×
        </button>
      ))}
      {state.confidence !== 'all' && (
        <button
          type='button'
          onClick={onClearConfidence}
          className='rounded-full border border-cyan-300/40 bg-cyan-500/15 px-3 py-1 text-xs text-cyan-100'
        >
          Confidence: {state.confidence} ×
        </button>
      )}
      {state.type !== 'all' && (
        <button
          type='button'
          onClick={onClearType}
          className='rounded-full border border-emerald-300/40 bg-emerald-500/15 px-3 py-1 text-xs text-emerald-100'
        >
          {typeLabel}: {state.type} ×
        </button>
      )}
      {state.enrichment !== 'all' && (
        <button
          type='button'
          onClick={onClearEnrichment}
          className='rounded-full border border-amber-300/40 bg-amber-500/15 px-3 py-1 text-xs text-amber-100'
        >
          Research: {enrichmentLabel || state.enrichment} ×
        </button>
      )}
      <button
        type='button'
        onClick={onClear}
        className='ml-auto rounded-full border border-white/25 bg-white/5 px-3 py-1 text-xs font-semibold text-white/90 hover:bg-white/10'
      >
        Clear all
      </button>
    </div>
  )
}
