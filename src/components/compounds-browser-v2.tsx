'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { motion } from '@/lib/motion'
import { safeArray, safeIncludes, safeJoin, safeLower, safeSlug, safeTrim } from '@/lib/search-safe'

type CompoundItem = {
  slug: string
  title: string
  summary?: string
  href: string
  typeLabel?: string
  domain?: string
  bestFor?: string
  evidence?: string
  safety?: string
  timeToEffect?: string
  isATier?: boolean
  tags?: string[]
}

type Props = {
  items: CompoundItem[]
}

const norm = (value: unknown): string => safeArray(value).map(safeTrim).filter(Boolean).join(' ')
const visible = (value: unknown): string => safeTrim(value)

export default function CompoundsBrowserV2({ items }: Props) {
  const [query, setQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('All')

  const safeItems = useMemo(
    () => safeArray<CompoundItem>(items)
      .filter(item => safeSlug(item?.slug) && safeTrim(item?.title) && safeTrim(item?.href))
      .sort((a, b) => safeLower(a?.title).localeCompare(safeLower(b?.title))),
    [items],
  )

  const filters = useMemo(() => {
    const pool = new Set<string>(['All'])
    for (const item of safeItems) {
      const label = norm(item.bestFor || item.domain).split(',')[0]
      if (label) pool.add(label)
      safeArray<string>(item.tags).slice(0, 2).map(safeTrim).filter(Boolean).forEach(tag => pool.add(tag))
    }
    return Array.from(pool).slice(0, 8)
  }, [safeItems])

  const filtered = useMemo(() => {
    const q = safeLower(query)
    const active = safeLower(activeFilter)

    return safeItems.filter(item => {
      const searchable = safeJoin([item.title, item.summary, item.domain, item.bestFor, item.evidence, item.safety, item.tags])

      const matchesFilter =
        activeFilter === 'All' ||
        safeIncludes(item.bestFor, active) ||
        safeIncludes(item.domain, active) ||
        safeArray<string>(item.tags).some(tag => safeLower(tag) === active)

      return (!q || safeIncludes(searchable, q)) && matchesFilter
    })
  }, [safeItems, query, activeFilter])

  return (
    <div className='mx-auto w-full max-w-7xl px-4 py-4 sm:px-5 sm:py-6'>
      <section className='relative overflow-hidden rounded-3xl border border-white/45 bg-white/60 p-5 shadow-[0_10px_40px_rgba(16,185,129,0.10)] backdrop-blur-xl sm:p-8'>
        <div className='pointer-events-none absolute -right-12 -top-10 h-40 w-40 rounded-full bg-emerald-300/35 blur-3xl' />
        <p className='text-[11px] font-black uppercase tracking-[0.24em] text-emerald-700'>Compounds v2.0</p>
        <h1 className='mt-2 text-3xl font-black leading-tight text-slate-900 sm:text-5xl'>Find compounds by outcome, not hype.</h1>
        <p className='mt-3 max-w-2xl text-sm leading-6 text-slate-700 sm:text-base'>Fast, thumb-friendly discovery for evidence-informed compounds. Filter, scan, and jump straight into detailed profiles.</p>
      </section>

      <section className='mt-4 space-y-3 rounded-2xl border border-white/50 bg-white/65 p-3.5 backdrop-blur-md sm:p-4'>
        <input
          value={query}
          onChange={event => setQuery(event.target.value)}
          placeholder='Search compounds, goals, evidence, or safety…'
          className='w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 outline-none ring-emerald-200 transition focus:border-emerald-400 focus:ring-2'
        />
        <div className='-mx-0.5 flex snap-x gap-2 overflow-x-auto pb-1'>
          {filters.map(filter => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`shrink-0 snap-start rounded-full border px-3.5 py-2 text-sm font-semibold transition ${
                activeFilter === filter
                  ? 'border-emerald-500 bg-emerald-500 text-white shadow-[0_6px_22px_rgba(16,185,129,0.35)]'
                  : 'border-slate-200 bg-white text-slate-700'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </section>

      <section className='mt-4 grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-3'>
        {filtered.map((item, index) => (
          <motion.article
            key={item.slug}
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 130, damping: 16, delay: index * 0.04 }}
          >
            <Link
              href={item.href}
              className='group flex h-full flex-col rounded-2xl border border-white/55 bg-white/70 p-4 shadow-[0_10px_30px_rgba(15,23,42,0.08)] backdrop-blur-lg transition duration-200 hover:border-emerald-300 hover:shadow-[0_12px_32px_rgba(16,185,129,0.20)] active:scale-[0.99]'
            >
              <div className='flex flex-wrap items-center gap-2'>
                <span className='rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-700'>{visible(item.typeLabel) || 'Compound'}</span>
                {item.isATier ? <span className='rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-emerald-800'>A-tier</span> : null}
              </div>
              <h2 className='mt-3 text-lg font-black leading-snug text-slate-900'>{item.title}</h2>
              <p className='mt-2 line-clamp-3 text-sm leading-6 text-slate-600'>{visible(item.summary) || 'Open profile for mechanisms, evidence, and safety caveats.'}</p>

              <div className='mt-3 flex flex-wrap gap-1.5'>
                {visible(item.bestFor) ? <span className='rounded-full bg-white/90 px-2 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200'>Best for: {visible(item.bestFor)}</span> : null}
                {visible(item.evidence) ? <span className='rounded-full bg-white/90 px-2 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200'>Evidence: {visible(item.evidence)}</span> : null}
                {visible(item.timeToEffect) ? <span className='rounded-full bg-white/90 px-2 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200'>Onset: {visible(item.timeToEffect)}</span> : null}
              </div>

              <span className='mt-4 text-sm font-bold text-emerald-700 transition group-hover:translate-x-0.5'>Open compound profile →</span>
            </Link>
          </motion.article>
        ))}
      </section>

      <section className='mt-5 rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-white p-5'>
        <p className='text-sm font-semibold text-emerald-900'>Need a faster starting point?</p>
        <p className='mt-1 text-sm text-slate-700'>Jump to goals to see compound options ranked by intent and evidence quality.</p>
        <Link href='/goals' className='mt-3 inline-flex rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-bold text-white shadow-[0_8px_24px_rgba(16,185,129,0.35)]'>Explore goal guides</Link>
      </section>
    </div>
  )
}
