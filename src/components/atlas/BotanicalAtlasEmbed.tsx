'use client'

import { useEffect, useMemo, useState } from 'react'
import BotanicalAtlasGraph from '@/components/atlas/BotanicalAtlasGraph'
import { matchesFilters, type AtlasFilters, type BotanicalAtlasRecord } from '@/components/atlas/BotanicalActivityAtlasClient'
import { DEFAULT_ATLAS_URL_STATE, parseAtlasUrlState } from '@/lib/botanical-atlas-url-state'

export default function BotanicalAtlasEmbed({ records }: { records: BotanicalAtlasRecord[] }) {
  const [filters, setFilters] = useState<AtlasFilters>({
    query: DEFAULT_ATLAS_URL_STATE.query,
    effect: DEFAULT_ATLAS_URL_STATE.effect,
    effectSource: DEFAULT_ATLAS_URL_STATE.effectSource,
    evidence: DEFAULT_ATLAS_URL_STATE.evidence,
    intensity: DEFAULT_ATLAS_URL_STATE.intensity,
    compoundClass: DEFAULT_ATLAS_URL_STATE.compoundClass,
    safety: DEFAULT_ATLAS_URL_STATE.safety,
  })

  useEffect(() => {
    const state = parseAtlasUrlState(window.location.search)
    setFilters({
      query: state.query,
      effect: state.effect,
      effectSource: state.effectSource,
      evidence: state.evidence,
      intensity: state.intensity,
      compoundClass: state.compoundClass,
      safety: state.safety,
    })
  }, [])

  const filtered = useMemo(() => records.filter((record) => matchesFilters(record, filters)), [records, filters])
  const filterSummary = [
    filters.query && `Search: ${filters.query}`,
    filters.effect !== 'all' && `Effect: ${filters.effect}`,
    filters.evidence !== 'all' && `Evidence: ${filters.evidence}`,
    filters.compoundClass !== 'all' && `Chemistry: ${filters.compoundClass}`,
    filters.safety !== 'all' && `Safety: ${filters.safety}`,
  ].filter(Boolean).join(' · ')

  return (
    <main className='mx-auto max-w-5xl p-4'>
      <header className='mb-3 flex flex-wrap items-end justify-between gap-3'>
        <div>
          <p className='text-xs font-bold uppercase tracking-wide text-muted'>The Hippie Scientist</p>
          <h1 className='text-xl font-bold text-ink'>Botanical Activity Atlas</h1>
          <p className='mt-1 text-xs text-muted'>{filterSummary || 'Unfiltered atlas visualization'} · {filtered.length} matching botanicals</p>
        </div>
        <a href='/tools/botanical-activity-atlas/' target='_blank' rel='noreferrer' className='text-sm font-semibold text-indigo-800 hover:underline'>Open full atlas ↗</a>
      </header>
      {filtered.length ? <BotanicalAtlasGraph records={filtered.slice(0, 150)} compact /> : <p className='rounded-xl border border-brand-900/10 bg-white p-4 text-sm text-muted'>No botanicals match this embedded filter state.</p>}
      <p className='mt-3 text-[11px] leading-4 text-muted'>Mechanism nodes are context, not clinical outcome claims. Educational reference only.</p>
    </main>
  )
}
