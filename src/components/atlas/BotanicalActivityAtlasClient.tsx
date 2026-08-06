'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'

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

const normalize = (value: string) => value.trim().toLowerCase()

export default function BotanicalActivityAtlasClient({ records }: Props) {
  const [query, setQuery] = useState('')
  const [effect, setEffect] = useState('all')
  const [evidence, setEvidence] = useState('all')
  const [intensity, setIntensity] = useState('all')

  const effects = useMemo(
    () => Array.from(new Set(records.flatMap((record) => record.effects))).sort(),
    [records],
  )

  const evidenceLevels = useMemo(
    () => Array.from(new Set(records.map((record) => record.evidence).filter(Boolean))).sort(),
    [records],
  )

  const intensityLevels = useMemo(
    () => Array.from(new Set(records.map((record) => record.intensity).filter(Boolean))).sort(),
    [records],
  )

  const filtered = useMemo(() => {
    const needle = normalize(query)
    return records.filter((record) => {
      const searchable = [
        record.name,
        record.scientificName ?? '',
        ...record.effects,
        ...record.compounds,
        ...record.compoundClasses,
        ...record.safety,
      ]
        .join(' ')
        .toLowerCase()

      return (
        (!needle || searchable.includes(needle)) &&
        (effect === 'all' || record.effects.includes(effect)) &&
        (evidence === 'all' || record.evidence === evidence) &&
        (intensity === 'all' || record.intensity === intensity)
      )
    })
  }, [records, query, effect, evidence, intensity])

  return (
    <section className='space-y-5'>
      <div className='grid gap-3 rounded-2xl border border-brand-900/10 bg-white/90 p-4 shadow-sm md:grid-cols-4'>
        <label className='md:col-span-1'>
          <span className='mb-1 block text-xs font-bold uppercase tracking-wide text-muted'>Search</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder='Herb, compound, effect…'
            className='w-full rounded-xl border border-brand-900/15 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-emerald-600'
          />
        </label>
        <label>
          <span className='mb-1 block text-xs font-bold uppercase tracking-wide text-muted'>Effect</span>
          <select value={effect} onChange={(event) => setEffect(event.target.value)} className='w-full rounded-xl border border-brand-900/15 bg-white px-3 py-2 text-sm text-ink'>
            <option value='all'>All effects</option>
            {effects.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>
        <label>
          <span className='mb-1 block text-xs font-bold uppercase tracking-wide text-muted'>Evidence</span>
          <select value={evidence} onChange={(event) => setEvidence(event.target.value)} className='w-full rounded-xl border border-brand-900/15 bg-white px-3 py-2 text-sm text-ink'>
            <option value='all'>All evidence</option>
            {evidenceLevels.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>
        <label>
          <span className='mb-1 block text-xs font-bold uppercase tracking-wide text-muted'>Noticeability</span>
          <select value={intensity} onChange={(event) => setIntensity(event.target.value)} className='w-full rounded-xl border border-brand-900/15 bg-white px-3 py-2 text-sm text-ink'>
            <option value='all'>All levels</option>
            {intensityLevels.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>
      </div>

      <div className='flex items-center justify-between gap-3 text-sm text-muted'>
        <p><strong className='text-ink'>{filtered.length}</strong> botanicals shown</p>
        <button type='button' onClick={() => { setQuery(''); setEffect('all'); setEvidence('all'); setIntensity('all') }} className='font-semibold text-emerald-800 hover:underline'>Reset filters</button>
      </div>

      <div className='overflow-x-auto rounded-2xl border border-brand-900/10 bg-white/90 shadow-sm'>
        <table className='min-w-[1100px] w-full border-collapse text-left text-sm'>
          <thead className='bg-brand-50/80 text-xs uppercase tracking-wide text-muted'>
            <tr>
              <th className='p-4'>Botanical</th>
              <th className='p-4'>Active chemistry</th>
              <th className='p-4'>Effect profile</th>
              <th className='p-4'>Noticeability</th>
              <th className='p-4'>Evidence</th>
              <th className='p-4'>Safety signals</th>
              <th className='p-4'>Timing</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((record) => (
              <tr key={record.slug} className='border-t border-brand-900/10 align-top'>
                <td className='p-4'>
                  <Link href={`/herbs/${record.slug}/`} className='font-bold text-emerald-900 hover:underline'>{record.name}</Link>
                  {record.scientificName ? <p className='mt-1 text-xs italic text-muted'>{record.scientificName}</p> : null}
                </td>
                <td className='p-4'>
                  <p className='font-medium text-ink'>{record.compounds.slice(0, 4).join(', ') || 'Not yet mapped'}</p>
                  {record.compoundClasses.length ? <p className='mt-1 text-xs text-muted'>{record.compoundClasses.join(', ')}</p> : null}
                </td>
                <td className='p-4 text-muted'>{record.effects.slice(0, 5).join(' · ') || 'Unclassified'}</td>
                <td className='p-4 font-semibold text-ink'>{record.intensity}</td>
                <td className='p-4'>{record.evidence}</td>
                <td className='p-4 text-muted'>{record.safety.slice(0, 4).join(' · ') || 'No structured flags'}</td>
                <td className='p-4 text-muted'>{[record.onset && `Onset: ${record.onset}`, record.duration && `Duration: ${record.duration}`].filter(Boolean).join(' · ') || 'Not established'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!filtered.length ? <div className='rounded-2xl border border-dashed border-brand-900/20 bg-white/70 p-8 text-center text-muted'>No botanicals match those filters.</div> : null}
    </section>
  )
}
