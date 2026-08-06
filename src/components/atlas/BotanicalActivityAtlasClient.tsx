'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import AtlasEmptyResultRecovery from '@/components/atlas/AtlasEmptyResultRecovery'
import type { AtlasRecoveryAction } from '@/lib/botanical-atlas-recovery'
import { trackAtlasFilter, trackAtlasProfileClick, trackAtlasReset } from '@/lib/botanicalAtlasTracking'
import {
  DEFAULT_ATLAS_URL_STATE,
  parseAtlasUrlState,
  serializeAtlasUrlState,
  type AtlasEffectSource,
  type AtlasSortOption,
} from '@/lib/botanical-atlas-url-state'

export interface BotanicalAtlasRecord {
  slug: string
  name: string
  scientificName?: string
  effects: string[]
  explicitEffects?: string[]
  inferredEffects?: string[]
  compounds: string[]
  compoundClasses: string[]
  evidence: string
  intensity: string
  safety: string[]
  onset?: string
  duration?: string
}

interface Props { records: BotanicalAtlasRecord[] }
type AtlasFilters = {
  query: string
  effect: string
  effectSource: AtlasEffectSource
  evidence: string
  intensity: string
  compoundClass: string
  safety: string
}

const normalize = (value: string) => value.trim().toLowerCase()
const sortedUnique = (values: string[]) => Array.from(new Set(values.filter(Boolean))).sort()
const evidenceRank: Record<string, number> = { Strong: 5, Moderate: 4, Preliminary: 3, 'Traditional / preclinical': 2, Unclassified: 1 }
const intensityRank: Record<string, number> = { Pronounced: 5, Moderate: 4, Subtle: 3, Variable: 2, Unknown: 1 }

export function effectsForSource(record: BotanicalAtlasRecord, source: AtlasEffectSource): string[] {
  return source === 'explicit' ? (record.explicitEffects ?? record.effects) : record.effects
}

export function matchesFilters(record: BotanicalAtlasRecord, filters: AtlasFilters) {
  const availableEffects = effectsForSource(record, filters.effectSource)
  const searchable = [record.name, record.scientificName ?? '', ...availableEffects, ...record.compounds, ...record.compoundClasses, ...record.safety].join(' ').toLowerCase()
  const needle = normalize(filters.query)
  return (!needle || searchable.includes(needle))
    && (filters.effect === 'all' || availableEffects.includes(filters.effect))
    && (filters.evidence === 'all' || record.evidence === filters.evidence)
    && (filters.intensity === 'all' || record.intensity === filters.intensity)
    && (filters.compoundClass === 'all' || record.compoundClasses.includes(filters.compoundClass))
    && (filters.safety === 'all' || record.safety.includes(filters.safety))
}

function EffectTags({ record, limit = 5, source = 'all' }: { record: BotanicalAtlasRecord; limit?: number; source?: AtlasEffectSource }) {
  const visibleEffects = effectsForSource(record, source)
  const inferred = new Set(record.inferredEffects ?? [])
  if (!visibleEffects.length) return <span className='text-muted'>Unclassified</span>
  return <span className='flex flex-wrap gap-1.5'>{visibleEffects.slice(0, limit).map((effect) => {
    const pathwayDerived = source === 'all' && inferred.has(effect)
    return <span key={effect} title={pathwayDerived ? 'Pathway-derived category; not a clinical outcome claim' : 'Reported or explicitly assigned effect category'} className={pathwayDerived ? 'rounded-full border border-dashed border-sky-700/30 bg-sky-50 px-2 py-0.5 text-xs font-medium text-sky-950' : 'rounded-full border border-emerald-900/10 bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-950'}>{effect}{pathwayDerived ? ' · pathway' : ''}</span>
  })}</span>
}

export default function BotanicalActivityAtlasClient({ records }: Props) {
  const [query, setQuery] = useState('')
  const [effect, setEffect] = useState('all')
  const [effectSource, setEffectSource] = useState<AtlasEffectSource>('all')
  const [evidence, setEvidence] = useState('all')
  const [intensity, setIntensity] = useState('all')
  const [compoundClass, setCompoundClass] = useState('all')
  const [safety, setSafety] = useState('all')
  const [sort, setSort] = useState<AtlasSortOption>('name')
  const [urlReady, setUrlReady] = useState(false)
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'failed'>('idle')

  useEffect(() => {
    const initial = parseAtlasUrlState(window.location.search)
    setQuery(initial.query)
    setEffect(initial.effect)
    setEffectSource(initial.effectSource)
    setEvidence(initial.evidence)
    setIntensity(initial.intensity)
    setCompoundClass(initial.compoundClass)
    setSafety(initial.safety)
    setSort(initial.sort)
    setUrlReady(true)
  }, [])

  useEffect(() => {
    if (!urlReady) return
    const search = serializeAtlasUrlState({ query, effect, effectSource, evidence, intensity, compoundClass, safety, sort })
    window.history.replaceState(null, '', `${window.location.pathname}${search}${window.location.hash}`)
  }, [urlReady, query, effect, effectSource, evidence, intensity, compoundClass, safety, sort])

  const effects = useMemo(() => sortedUnique(records.flatMap((record) => effectsForSource(record, effectSource))), [records, effectSource])
  const evidenceLevels = useMemo(() => sortedUnique(records.map((record) => record.evidence)), [records])
  const intensityLevels = useMemo(() => sortedUnique(records.map((record) => record.intensity)), [records])
  const compoundClasses = useMemo(() => sortedUnique(records.flatMap((record) => record.compoundClasses)), [records])
  const safetySignals = useMemo(() => sortedUnique(records.flatMap((record) => record.safety)), [records])
  const filters = useMemo(() => ({ query, effect, effectSource, evidence, intensity, compoundClass, safety }), [query, effect, effectSource, evidence, intensity, compoundClass, safety])

  const filtered = useMemo(() => records.filter((record) => matchesFilters(record, filters)).sort((a, b) => {
    if (sort === 'evidence') return (evidenceRank[b.evidence] ?? 0) - (evidenceRank[a.evidence] ?? 0) || a.name.localeCompare(b.name)
    if (sort === 'noticeability') return (intensityRank[b.intensity] ?? 0) - (intensityRank[a.intensity] ?? 0) || a.name.localeCompare(b.name)
    return a.name.localeCompare(b.name)
  }), [records, filters, sort])

  const activeFilters = [query && `Search: ${query}`, effect !== 'all' && `Effect: ${effect}`, effectSource === 'explicit' && 'Effect source: explicit only', evidence !== 'all' && `Evidence: ${evidence}`, intensity !== 'all' && `Noticeability: ${intensity}`, compoundClass !== 'all' && `Chemistry: ${compoundClass}`, safety !== 'all' && `Safety: ${safety}`].filter(Boolean) as string[]

  const setTrackedFilter = (filter: 'effect' | 'chemistry' | 'evidence' | 'noticeability' | 'safety', value: string, setter: (value: string) => void) => {
    const nextFilters = { ...filters, effect: filter === 'effect' ? value : effect, compoundClass: filter === 'chemistry' ? value : compoundClass, evidence: filter === 'evidence' ? value : evidence, intensity: filter === 'noticeability' ? value : intensity, safety: filter === 'safety' ? value : safety }
    setter(value)
    trackAtlasFilter({ filter, value, resultCount: records.filter((record) => matchesFilters(record, nextFilters)).length })
  }

  const changeEffectSource = (value: AtlasEffectSource) => {
    const available = sortedUnique(records.flatMap((record) => effectsForSource(record, value)))
    const nextEffect = effect === 'all' || available.includes(effect) ? effect : 'all'
    setEffectSource(value)
    setEffect(nextEffect)
    trackAtlasFilter({ filter: 'effect', value: value === 'explicit' ? 'explicit-only' : 'include-pathways', resultCount: records.filter((record) => matchesFilters(record, { ...filters, effectSource: value, effect: nextEffect })).length })
  }

  const reset = () => {
    trackAtlasReset(activeFilters.length)
    setQuery(DEFAULT_ATLAS_URL_STATE.query); setEffect(DEFAULT_ATLAS_URL_STATE.effect); setEffectSource(DEFAULT_ATLAS_URL_STATE.effectSource); setEvidence(DEFAULT_ATLAS_URL_STATE.evidence); setIntensity(DEFAULT_ATLAS_URL_STATE.intensity); setCompoundClass(DEFAULT_ATLAS_URL_STATE.compoundClass); setSafety(DEFAULT_ATLAS_URL_STATE.safety); setSort(DEFAULT_ATLAS_URL_STATE.sort)
  }

  const recover = (action: AtlasRecoveryAction) => {
    if (action === 'clear-query') setQuery('')
    if (action === 'include-pathways') changeEffectSource('all')
    if (action === 'clear-effect') setTrackedFilter('effect', 'all', setEffect)
    if (action === 'clear-evidence') setTrackedFilter('evidence', 'all', setEvidence)
    if (action === 'clear-intensity') setTrackedFilter('noticeability', 'all', setIntensity)
    if (action === 'clear-chemistry') setTrackedFilter('chemistry', 'all', setCompoundClass)
    if (action === 'clear-safety') setTrackedFilter('safety', 'all', setSafety)
  }

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopyStatus('copied')
    } catch {
      setCopyStatus('failed')
    }
    window.setTimeout(() => setCopyStatus('idle'), 1800)
  }

  const trackProfile = (record: BotanicalAtlasRecord, index: number) => trackAtlasProfileClick({ slug: record.slug, position: index + 1, activeFilterCount: activeFilters.length })
  const selectClass = 'w-full rounded-xl border border-brand-900/15 bg-white px-3 py-2 text-sm text-ink'
  const labelClass = 'mb-1 block text-xs font-bold uppercase tracking-wide text-muted'

  return <section className='space-y-5'>
    <div className='grid gap-3 rounded-2xl border border-brand-900/10 bg-white/90 p-4 shadow-sm md:grid-cols-2 xl:grid-cols-4'>
      <label><span className={labelClass}>Search</span><input value={query} onChange={(event) => setQuery(event.target.value)} onBlur={() => query.trim() && trackAtlasFilter({ filter: 'search', value: query.trim(), resultCount: filtered.length })} placeholder='Herb, compound, effect…' className={selectClass} /></label>
      <label><span className={labelClass}>Effect source</span><select value={effectSource} onChange={(event) => changeEffectSource(event.target.value as AtlasEffectSource)} className={selectClass}><option value='all'>Include pathway-derived</option><option value='explicit'>Explicit effects only</option></select></label>
      <label><span className={labelClass}>Effect</span><select value={effect} onChange={(event) => setTrackedFilter('effect', event.target.value, setEffect)} className={selectClass}><option value='all'>All effects</option>{effects.map((item) => <option key={item}>{item}</option>)}</select></label>
      <label><span className={labelClass}>Chemistry</span><select value={compoundClass} onChange={(event) => setTrackedFilter('chemistry', event.target.value, setCompoundClass)} className={selectClass}><option value='all'>All classes</option>{compoundClasses.map((item) => <option key={item}>{item}</option>)}</select></label>
      <label><span className={labelClass}>Evidence</span><select value={evidence} onChange={(event) => setTrackedFilter('evidence', event.target.value, setEvidence)} className={selectClass}><option value='all'>All evidence</option>{evidenceLevels.map((item) => <option key={item}>{item}</option>)}</select></label>
      <label><span className={labelClass}>Noticeability</span><select value={intensity} onChange={(event) => setTrackedFilter('noticeability', event.target.value, setIntensity)} className={selectClass}><option value='all'>All levels</option>{intensityLevels.map((item) => <option key={item}>{item}</option>)}</select></label>
      <label><span className={labelClass}>Safety concern</span><select value={safety} onChange={(event) => setTrackedFilter('safety', event.target.value, setSafety)} className={selectClass}><option value='all'>All signals</option>{safetySignals.map((item) => <option key={item}>{item}</option>)}</select></label>
    </div>

    <div className='rounded-xl border border-sky-900/10 bg-sky-50/70 px-4 py-3 text-sm text-sky-950'><strong>Effect provenance:</strong> solid green labels come from explicit effect data. Dashed blue “pathway” labels are inferred from structured mechanisms and should not be read as demonstrated clinical outcomes.</div>

    <div className='flex flex-wrap items-end justify-between gap-3 text-sm text-muted'>
      <p><strong className='text-ink'>{filtered.length}</strong> of {records.length} botanicals shown</p>
      <div className='flex flex-wrap items-end gap-3'>
        <label><span className={labelClass}>Sort</span><select value={sort} onChange={(event) => setSort(event.target.value as AtlasSortOption)} className={selectClass}><option value='name'>Name A–Z</option><option value='evidence'>Strongest evidence</option><option value='noticeability'>Most noticeable</option></select></label>
        <button type='button' onClick={copyLink} className='mb-2 font-semibold text-emerald-800 hover:underline' aria-live='polite'>{copyStatus === 'copied' ? 'Link copied ✓' : copyStatus === 'failed' ? 'Copy failed' : 'Copy link'}</button>
        <button type='button' onClick={reset} disabled={!activeFilters.length && sort === 'name'} className='mb-2 font-semibold text-emerald-800 hover:underline disabled:opacity-40'>Reset</button>
      </div>
    </div>

    {activeFilters.length ? <div className='flex flex-wrap gap-2' aria-label='Active filters'>{activeFilters.map((item) => <span key={item} className='rounded-full border border-emerald-900/10 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-950'>{item}</span>)}</div> : null}

    {!filtered.length ? <AtlasEmptyResultRecovery records={records} filters={filters} onRecover={recover} onReset={reset} /> : null}

    <div className='grid gap-4 md:hidden'>{filtered.map((record, index) => <article key={record.slug} className='rounded-2xl border border-brand-900/10 bg-white/90 p-4 shadow-sm'>
      <div className='flex items-start justify-between gap-3'><div><Link href={`/herbs/${record.slug}/`} onClick={() => trackProfile(record, index)} className='text-lg font-bold text-emerald-900 hover:underline'>{record.name}</Link>{record.scientificName ? <p className='mt-1 text-xs italic text-muted'>{record.scientificName}</p> : null}</div><span className='rounded-full bg-brand-50 px-2.5 py-1 text-xs font-bold text-ink'>{record.evidence}</span></div>
      <div className='mt-4 grid grid-cols-2 gap-3 text-sm'><div><p className={labelClass}>Noticeability</p><p className='font-semibold text-ink'>{record.intensity}</p></div><div><p className={labelClass}>Chemistry</p><p className='text-ink'>{record.compoundClasses.slice(0, 2).join(', ') || 'Not mapped'}</p></div></div>
      <div className='mt-4'><p className={labelClass}>Effects</p><EffectTags record={record} limit={4} source={effectSource} /></div>
      {record.safety.length ? <div className='mt-4 rounded-xl bg-amber-50 p-3'><p className='text-xs font-bold uppercase tracking-wide text-amber-950'>Safety signals</p><p className='mt-1 text-sm text-amber-950'>{record.safety.slice(0, 3).join(' · ')}</p></div> : null}
      <Link href={`/herbs/${record.slug}/`} onClick={() => trackProfile(record, index)} className='mt-4 inline-flex font-semibold text-emerald-800 hover:underline'>Open full profile →</Link>
    </article>)}</div>

    <div className='hidden overflow-x-auto rounded-2xl border border-brand-900/10 bg-white/90 shadow-sm md:block'><table className='min-w-[1100px] w-full border-collapse text-left text-sm'><thead className='bg-brand-50/80 text-xs uppercase tracking-wide text-muted'><tr><th className='p-4'>Botanical</th><th className='p-4'>Active chemistry</th><th className='p-4'>Effect profile</th><th className='p-4'>Noticeability</th><th className='p-4'>Evidence</th><th className='p-4'>Safety signals</th><th className='p-4'>Timing</th></tr></thead><tbody>{filtered.map((record, index) => <tr key={record.slug} className='border-t border-brand-900/10 align-top'><td className='p-4'><Link href={`/herbs/${record.slug}/`} onClick={() => trackProfile(record, index)} className='font-bold text-emerald-900 hover:underline'>{record.name}</Link>{record.scientificName ? <p className='mt-1 text-xs italic text-muted'>{record.scientificName}</p> : null}</td><td className='p-4'><p className='font-medium text-ink'>{record.compounds.slice(0, 4).join(', ') || 'Not yet mapped'}</p>{record.compoundClasses.length ? <p className='mt-1 text-xs text-muted'>{record.compoundClasses.join(', ')}</p> : null}</td><td className='p-4'><EffectTags record={record} source={effectSource} /></td><td className='p-4 font-semibold text-ink'>{record.intensity}</td><td className='p-4'>{record.evidence}</td><td className='p-4 text-muted'>{record.safety.slice(0, 4).join(' · ') || 'No structured flags'}</td><td className='p-4 text-muted'>{[record.onset && `Onset: ${record.onset}`, record.duration && `Duration: ${record.duration}`].filter(Boolean).join(' · ') || 'Not established'}</td></tr>)}</tbody></table></div>
  </section>
}
