'use client'

import { useEffect, useMemo } from 'react'
import { getAtlasRecoverySuggestions, type AtlasRecoveryAction, type AtlasRecoveryFilters, type AtlasRecoveryRecord } from '@/lib/botanical-atlas-recovery'
import { trackAtlasRecoveryAccepted, trackAtlasRecoveryShown } from '@/lib/botanicalAtlasTracking'

type Props = {
  records: AtlasRecoveryRecord[]
  filters: AtlasRecoveryFilters
  onRecover: (action: AtlasRecoveryAction) => void
  onReset: () => void
}

export default function AtlasEmptyResultRecovery({ records, filters, onRecover, onReset }: Props) {
  const suggestions = useMemo(() => getAtlasRecoverySuggestions(records, filters), [records, filters])
  const signature = suggestions.map((item) => `${item.action}:${item.recoveredCount}`).join('|')

  useEffect(() => {
    if (suggestions.length) trackAtlasRecoveryShown(suggestions)
  }, [signature]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <section className='rounded-2xl border border-dashed border-amber-900/25 bg-amber-50/60 p-6 text-amber-950' aria-live='polite'>
      <p className='text-xs font-bold uppercase tracking-wide'>No matching botanicals</p>
      <h2 className='mt-2 text-xl font-bold'>These filters are too narrow together</h2>
      <p className='mt-2 max-w-2xl text-sm leading-6'>Try the change that restores the most useful comparison results. Your other filters will stay in place.</p>

      {suggestions.length ? (
        <div className='mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.action}
              type='button'
              onClick={() => { trackAtlasRecoveryAccepted(suggestion); onRecover(suggestion.action) }}
              className='min-h-11 rounded-xl border border-amber-900/15 bg-white px-4 py-3 text-left font-semibold text-amber-950 shadow-sm transition hover:-translate-y-0.5 hover:border-amber-900/30'
            >
              <span className='block'>{suggestion.label}</span>
              <span className='mt-1 block text-xs font-medium text-amber-800'>Restore {suggestion.recoveredCount} result{suggestion.recoveredCount === 1 ? '' : 's'}</span>
            </button>
          ))}
        </div>
      ) : null}

      <button type='button' onClick={onReset} className='mt-4 min-h-11 font-semibold text-amber-900 underline-offset-4 hover:underline'>Reset all filters</button>
    </section>
  )
}
