'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import {
  trackAtlasFilter,
  trackAtlasProfileClick,
  trackAtlasReset,
} from '@/lib/botanicalAtlasTracking'

export interface BotanicalAtlasRecord {
  slug: string
  name: string
  scientificName?: string
  effects: string[]
  compounds: string[]
  compoundClasses: string[]
  evidence: string
  intensity: string
  safety: string[]
  onset?: string
  duration?: string
}

interface Props {
  records: BotanicalAtlasRecord[]
}

type SortOption = 'name' | 'evidence' | 'noticeability'

const normalize = (value: string) => value.trim().toLowerCase()
const sortedUnique = (values: string[]) => Array.from(new Set(values.filter(Boolean))).sort()
const evidenceRank: Record<string, number> = { Strong: 5, Moderate: 4, Preliminary: 3, 'Traditional / preclinical': 2, Unclassified: 1 }
const intensityRank: Record<string, number> = { Pronounced: 5, Moderate: 4, Subtle: 3, Variable: 2, Unknown: 1 }

function matchesFilters(record: BotanicalAtlasRecord, filters: {
  query: string
  effect: string
  evidence: string
  intensity: string
  compoundClass: string
  safety: string
}) {
  const needle = normalize(filters.query)
  const searchable = [
    record.name,
    record.scientificName ?? '',
    ...record.effects,
    ...record.compounds,
    ...record.compoundClasses,
    ...record.safety,
  ].join(' ').toLowerCase()

  return (
    (!needle || searchable.includes(needle)) &&
    (filters.effect === 'all' || record.effects.includes(filters.effect)) &&
    (filters.evidence === 'all' || record.evidence === filters.evidence) &&
    (filters.intensity === 'all' || record.intensity === filters.intensity) &&
    (filters.compoundClass === 'all' || record.compoundClasses.includes(filters.compoundClass)) &&
    (filters.safety === 'all' || record.safety.includes(filters.safety))
  )
}

export default function BotanicalActivityAtlasClient({ records }: Props) {
  const [query, setQuery] = useState('')
  const [effect, setEffect] = useState('all')
  const [evidence, setEvidence] = useState('all')
  const [intensity, setIntensity] = useState('all')
  const [compoundClass, setCompoundClass] = useState('all')
  const [safety, setSafety] = useState('all')
  const [sort, setSort] = useState<SortOption>('name')

  const effects = useMemo(() => sortedUnique(records.flatMap((record) => record.effects)), [records])
  const evidenceLevels = useMemo(() => sortedUnique(records.map((record) => record.evidence)), [records])
  const intensityLevels = useMemo(() => sortedUnique(records.map((record) => record.intensity)), [records])
  const compoundClasses = useMemo(() => sortedUnique(records.flatMap((record) => record.compoundClasses)), [records])
  const safetySignals = useMemo(() => sortedUnique(records.flatMap((record) => record.safety)), [records])

  const filters = useMemo(() => ({ query, effect, evidence, intensity, compoundClass, safety }), [query, effect, evidence, intensity, compoundClass, safety])

  const filtered = useMemo(() => {
    const matches = records.filter((record) => matchesFilters(record, filters))
    return matches.sort((a, b) => {
      if (sort === 'evidence') return (evidenceRank[b.evidence] ?? 0) - (evidenceRank[a.evidence] ?? 0) || a.name.localeCompare(b.name)
      if (sort === 'noticeability') return (intensityRank[b.intensity] ?? 0) - (intensityRank[a.intensity] ?? 0) || a.name.localeCompare(b.name)
      return a.name.localeCompare(b.name)
    })
  }, [records, filters, sort])

  const activeFilters = [
    query && `Search: ${query}`,
    effect !== 'all' && `Effect: ${effect}`,
    evidence !== 'all' && `Evidence: ${evidence}`,
    intensity !== 'all' && `Noticeability: ${intensity}`,
    compoundClass !== 'all' && `Chemistry: ${compoundClass}`,
    safety !== 'all' && `Safety: ${safety}`,
  ].filter(Boolean) as string[]

  const setTrackedFilter = (
    filter: 'effect' | 'chemistry' | 'evidence' | 'noticeability' | 'safety',
    value: string,
    setter: (value: string) => void,
  ) => {
    const nextFilters = {
      ...filters,
      effect: filter === 'effect' ? value : effect,
      compoundClass: filter === 'chemistry' ? value : compoundClass,
      evidence: filter === 'evidence' ? value : evidence,
      intensity: filter === 'noticeability' ? value : intensity,
      safety: filter === 'safety' ? value : safety,
    }
    setter(value)
    trackAtlasFilter({ filter, value, resultCount: records.filter((record) => matchesFilters(record, nextFilters)).length })
  }

  const reset = () => {
    trackAtlasReset(activeFilters.length)
    setQuery('')
    setEffect('all')
    setEvidence('all')
    setIntensity('all')
    setCompoundClass('all')
    setSafety('all')
    setSort('name')
  }

  const trackProfile = (record: BotanicalAtlasRecord, index: number) => {
    trackAtlasProfileClick({ slug: record.slug, position: index + 1, activeFilterCount: activeFilters.length })
  }

  return (
    <section className='space-y-5'>
      <div className='grid gap-3 rounded-2xl border border-brand-900/10 bg-white/90 p-4 shadow-sm md:grid-cols-2 xl:grid-cols-6'>
        <label>
          <span className='mb-1 block text-xs font-bold uppercase tracking-wide text-muted'>Search</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} onBlur={() => query.trim() && trackAtlasFilter({ filter: 'search', value: query.trim(), resultCount: filtered.length })} placeholder='Herb, compound, effect…' className='w-full rounded-xl border border-brand-900/15 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-emerald-600' />
        </label>
        <label>
          <span className='mb-1 block text-xs font-bold uppercase tracking-wide text-muted'>Effect</span>
          <select value={effect} onChange={(event) => setTrackedFilter('effect', event.target.value, setEffect)} className='w-full rounded-xl border border-brand-900/15 bg-white px-3 py-2 text-sm text-ink'><option value='all'>All effects</option>{effects.map((item) => <option key={item} value={item}>{item}</option>)}</select>
        </label>
        <label>
          <span className='mb-1 block text-xs font-bold uppercase tracking-wide text-muted'>Chemistry</span>
          <select value={compoundClass} onChange={(event) => setTrackedFilter('chemistry', event.target.value, setCompoundClass)} className='w-full rounded-xl border border-brand-900/15 bg-white px-3 py-2 text-sm text-ink'><option value='all'>All classes</option>{compoundClasses.map((item) => <option key={item} value={item}>{item}</option>)}</select>
        </label>
        <label>
          <span className='mb-1 block text-xs font-bold uppercase tracking-wide text-muted'>Evidence</span>
          <select value={evidence} onChange={(event) => setTrackedFilter('evidence', event.target.value, setEvidence)} className='w-full rounded-xl border border-brand-900/15 bg-white px-3 py-2 text-sm text-ink'><option value='all'>All evidence</option>{evidenceLevels.map((item) => <option key={item} value={item}>{item}</option>)}</select>
        </label>
        <label>
          <span className='mb-1 block text-xs font-bold uppercase tracking-wide text-muted'>Noticeability</span>
          <select value={intensity} onChange={(event) => setTrackedFilter('noticeability', event.target.value, setIntensity)} className='w-full rounded-xl border border-brand-900/15 bg-white px-3 py-2 text-sm text-ink'><option value='all'>All levels</option>{intensityLevels.map((item) => <option key={item} value={item}>{item}</option>)}</select>
        </label>
        <label>
          <span className='mb-1 block text-xs font-bold uppercase tracking-wide text-muted'>Safety concern</span>
          <select value={safety} onChange={(event) => setTrackedFilter('safety', event.target.value, setSafety)} className='w-full rounded-xl border border-brand-900/15 bg-white px-3 py-2 text-sm text-ink'><option value='all'>All signals</option>{safetySignals.map((item) => <option key={item} value={item}>{item}</option>)}</select>
        </label>
      </div>

      <div className='flex flex-wrap items-end justify-between gap-3 text-sm text-muted'>
        <p><strong className='text-ink'>{filtered.length}</strong> of {records.length} botanicals shown</p>
        <div className='flex items-end gap-3'>
          <label>
            <span className='mb-1 block text-xs font-bold uppercase tracking-wide text-muted'>Sort</span>
            <select value={sort} onChange={(event) => setSort(event.target.value as SortOption)} className='rounded-xl border border-brand-900/15 bg-white px-3 py-2 text-sm text-ink'>
              <option value='name'>Name A–Z</option>
              <option value='evidence'>Strongest evidence</option>
              <option value='noticeability'>Most noticeable</option>
            </select>
          </label>
          <button type='button' onClick={reset} disabled={!activeFilters.length && sort === 'name'} className='mb-2 font-semibold text-emerald-800 hover:underline disabled:cursor-not-allowed disabled:opacity-40'>Reset</button>
        </div>
      </div>

      {activeFilters.length ? <div className='flex flex-wrap gap-2' aria-label='Active filters'>{activeFilters.map((item) => <span key={item} className='rounded-full border border-emerald-900/10 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-950'>{item}</span>)}</div> : null}

      <div className='grid gap-4 md:hidden'>
        {filtered.map((record, index) => (
          <article key={record.slug} className='rounded-2xl border border-brand-900/10 bg-white/90 p-4 shadow-sm'>
            <div className='flex items-start justify-between gap-3'>
              <div>
                <Link href={`/herbs/${record.slug}/`} onClick={() => trackProfile(record, index)} className='text-lg font-bold text-emerald-900 hover:underline'>{record.name}</Link>
                {record.scientificName ? <p className='mt-1 text-xs italic text-muted'>{record.scientificName}</p> : null}
              </div>
              <span className='rounded-full bg-brand-50 px-2.5 py-1 text-xs font-bold text-ink'>{record.evidence}</span>
            </div>
            <div className='mt-4 grid grid-cols-2 gap-3 text-sm'>
              <div><p className='text-xs font-bold uppercase tracking-wide text-muted'>Noticeability</p><p className='mt-1 font-semibold text-ink'>{record.intensity}</p></div>
              <div><p className='text-xs font-bold uppercase tracking-wide text-muted'>Chemistry</p><p className='mt-1 text-ink'>{record.compoundClasses.slice(0, 2).join(', ') || 'Not mapped'}</p></div>
            </div>
            <div className='mt-4'><p className='text-xs font-bold uppercase tracking-wide text-muted'>Effects</p><p className='mt-1 text-sm text-muted'>{record.effects.slice(0, 4).join(' · ') || 'Unclassified'}</p></div>
            {record.safety.length ? <div className='mt-4 rounded-xl bg-amber-50 p-3'><p className='text-xs font-bold uppercase tracking-wide text-amber-950'>Safety signals</p><p className='mt-1 text-sm text-amber-950'>{record.safety.slice(0, 3).join(' · ')}</p></div> : null}
            <Link href={`/herbs/${record.slug}/`} onClick={() => trackProfile(record, index)} className='mt-4 inline-flex font-semibold text-emerald-800 hover:underline'>Open full profile →</Link>
          </article>
        ))}
      </div>

      <div className='hidden overflow-x-auto rounded-2xl border border-brand-900/10 bg-white/90 shadow-sm md:block'>
        <table className='min-w-[1100px] w-full border-collapse text-left text-sm'>
          <thead className='bg-brand-50/80 text-xs uppercase tracking-wide text-muted'><tr><th className='p-4'>Botanical</th><th className='p-4'>Active chemistry</th><th className='p-4'>Effect profile</th><th className='p-4'>Noticeability</th><th className='p-4'>Evidence</th><th className='p-4'>Safety signals</th><th className='p-4'>Timing</th></tr></thead>
          <tbody>{filtered.map((record, index) => <tr key={record.slug} className='border-t border-brand-900/10 align-top'><td className='p-4'><Link href={`/herbs/${record.slug}/`} onClick={() => trackProfile(record, index)} className='font-bold text-emerald-900 hover:underline'>{record.name}</Link>{record.scientificName ? <p className='mt-1 text-xs italic text-muted'>{record.scientificName}</p> : null}</td><td className='p-4'><p className='font-medium text-ink'>{record.compounds.slice(0, 4).join(', ') || 'Not yet mapped'}</p>{record.compoundClasses.length ? <p className='mt-1 text-xs text-muted'>{record.compoundClasses.join(', ')}</p> : null}</td><td className='p-4 text-muted'>{record.effects.slice(0, 5).join(' · ') || 'Unclassified'}</td><td className='p-4 font-semibold text-ink'>{record.intensity}</td><td className='p-4'>{record.evidence}</td><td className='p-4 text-muted'>{record.safety.slice(0, 4).join(' · ') || 'No structured flags'}</td><td className='p-4 text-muted'>{[record.onset && `Onset: ${record.onset}`, record.duration && `Duration: ${record.duration}`].filter(Boolean).join(' · ') || 'Not established'}</td></tr>)}</tbody>
        </table>
      </div>

      {!filtered.length ? <div className='rounded-2xl border border-dashed border-brand-900/20 bg-white/70 p-8 text-center text-muted'>No botanicals match those filters. Try removing one filter or using a broader search term.</div> : null}
    </section>
  )
}
