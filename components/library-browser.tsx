'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'

type BrowserItem = {
  slug: string
  title: string
  summary?: string
  href: string
  typeLabel?: string
  domain?: string
  isATier?: boolean
  meta?: string[]
}

type LibraryBrowserProps = {
  eyebrow?: string
  title: string
  description?: string
  searchPlaceholder?: string
  emptyLabel?: string
  items: BrowserItem[]
}

type QualityFilter = 'ready' | 'all' | 'drafts'
type SortMode = 'best' | 'a-z' | 'z-a'

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

const normalizeText = (value: unknown): string =>
  typeof value === 'string' ? value.trim() : ''

const isDraftProfile = (item: BrowserItem): boolean => {
  const summary = normalizeText(item.summary).toLowerCase()
  return !summary || summary.includes('profile coming soon') || summary.includes('coming soon') || summary.length < 24
}

const getPreview = (item: BrowserItem): string => {
  const text = normalizeText(item.summary)
  if (isDraftProfile(item)) return 'Summary is still being refined, but this profile may include useful library context.'
  return text.length > 165 ? `${text.slice(0, 164).trimEnd()}…` : text
}

const formatChip = (value: string): string =>
  value
    .split(/[-_,]/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part.trim().charAt(0).toUpperCase() + part.trim().slice(1))
    .join(' ')

const getBestFor = (item: BrowserItem): string => {
  const meta = item.meta ?? []
  const bestFor = meta.find(value => value.toLowerCase().startsWith('best for:'))
  if (bestFor) return bestFor.replace(/^best for:\s*/i, '').trim()
  if (item.domain) return formatChip(item.domain)
  return ''
}

const getEvidenceStrength = (item: BrowserItem): number => {
  const text = `${item.summary ?? ''} ${item.domain ?? ''} ${(item.meta ?? []).join(' ')}`.toLowerCase()
  if (item.isATier || /strong|high|tier 1|rct|meta/.test(text)) return 5
  if (/moderate|tier 2|human/.test(text)) return 4
  if (/limited|low|tier 3/.test(text)) return 2
  return 3
}

const getConversionBadge = (item: BrowserItem): string => {
  const text = `${item.title} ${item.slug} ${item.domain ?? ''} ${(item.meta ?? []).join(' ')}`.toLowerCase()
  if (item.isATier) return 'Top evidence pick'
  if (/sleep|stress|focus|fat loss|blood pressure|gut|joint|testosterone/.test(text)) return 'Goal-ready'
  if (/dose|onset|duration|best for/.test(text)) return 'Decision-ready'
  return 'Research profile'
}

const qualityRank = (item: BrowserItem): number => {
  if (item.isATier) return 0
  if (!isDraftProfile(item)) return 1
  return 2
}

function EvidenceDots({ score }: { score: number }) {
  return (
    <div className='flex items-center gap-1.5' aria-label={`Evidence signal ${score} out of 5`}>
      {[1, 2, 3, 4, 5].map(value => (
        <span key={value} className={`h-1.5 w-7 rounded-full ${value <= score ? 'bg-emerald-500' : 'bg-slate-200'}`} />
      ))}
    </div>
  )
}

export default function LibraryBrowser({
  eyebrow = 'Library',
  title,
  description,
  searchPlaceholder = 'Search by name, slug, summary, or effect',
  emptyLabel = 'No matching profiles found. Try a different search or clear the filters.',
  items,
}: LibraryBrowserProps) {
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [letter, setLetter] = useState('')
  const [qualityFilter, setQualityFilter] = useState<QualityFilter>('all')
  const [sortMode, setSortMode] = useState<SortMode>('best')

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query), 160)
    return () => window.clearTimeout(timer)
  }, [query])

  const cleanItems = useMemo(
    () => items.filter(item => normalizeText(item.slug) && normalizeText(item.title)),
    [items],
  )

  const stats = useMemo(() => {
    const ready = cleanItems.filter(item => !isDraftProfile(item)).length
    const aTier = cleanItems.filter(item => item.isATier).length
    return { total: cleanItems.length, ready, drafts: cleanItems.length - ready, aTier }
  }, [cleanItems])

  const filteredItems = useMemo(() => {
    const q = debouncedQuery.toLowerCase().trim()

    const filtered = cleanItems.filter(item => {
      const titleText = normalizeText(item.title)
      const searchable = `${item.title} ${item.slug} ${item.summary ?? ''} ${item.domain ?? ''} ${(item.meta ?? []).join(' ')}`.toLowerCase()
      const draft = isDraftProfile(item)
      const matchesQuality = qualityFilter === 'all' ? true : qualityFilter === 'ready' ? !draft : draft

      return (!letter || titleText.toUpperCase().startsWith(letter)) && (!q || searchable.includes(q)) && matchesQuality
    })

    return filtered.sort((a, b) => {
      if (sortMode === 'a-z') return a.title.localeCompare(b.title)
      if (sortMode === 'z-a') return b.title.localeCompare(a.title)
      return qualityRank(a) - qualityRank(b) || getEvidenceStrength(b) - getEvidenceStrength(a) || a.title.localeCompare(b.title)
    })
  }, [cleanItems, debouncedQuery, letter, qualityFilter, sortMode])

  const topPicks = useMemo(
    () => filteredItems.filter(item => !isDraftProfile(item) && (item.isATier || getEvidenceStrength(item) >= 5)).slice(0, 3),
    [filteredItems],
  )

  const resetFilters = () => {
    setQuery('')
    setDebouncedQuery('')
    setLetter('')
    setQualityFilter('all')
    setSortMode('best')
  }

  return (
    <div className='mx-auto w-full max-w-7xl space-y-8 py-2'>
      <section className='relative overflow-hidden rounded-[2rem] bg-slate-950 p-6 text-white shadow-xl shadow-slate-900/15 sm:p-8'>
        <div className='absolute -right-24 -top-24 h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl' />
        <div className='relative max-w-3xl'>
          <p className='text-xs font-black uppercase tracking-[0.26em] text-emerald-200/70'>{eyebrow}</p>
          <h1 className='mt-3 text-5xl font-black leading-[0.96] tracking-tight text-white sm:text-7xl'>{title}</h1>
          {description ? <p className='mt-4 max-w-2xl text-base leading-7 text-white/72 sm:text-lg'>{description}</p> : null}
          <div className='mt-6 flex flex-wrap gap-2 text-xs font-black'>
            <span className='rounded-full bg-white px-4 py-2 text-slate-950'>{filteredItems.length} of {stats.total} shown</span>
            <span className='rounded-full border border-white/10 bg-white/10 px-4 py-2 text-white/75'>{stats.ready} useful summaries</span>
            {stats.aTier > 0 ? <span className='rounded-full border border-amber-200/25 bg-amber-300/15 px-4 py-2 text-amber-100'>{stats.aTier} A-tier</span> : null}
          </div>
        </div>
      </section>

      <section className='space-y-4'>
        <div className='grid gap-3 md:grid-cols-[1fr_auto_auto]'>
          <input
            value={query}
            onChange={event => setQuery(event.target.value)}
            placeholder={searchPlaceholder}
            className='w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-950 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10'
          />
          <select value={qualityFilter} onChange={event => setQualityFilter(event.target.value as QualityFilter)} className='rounded-2xl border border-slate-300 bg-white px-3 py-3 text-sm font-black text-slate-800 shadow-sm'>
            <option value='all'>All profiles</option>
            <option value='ready'>Useful only</option>
            <option value='drafts'>Needs summary</option>
          </select>
          <select value={sortMode} onChange={event => setSortMode(event.target.value as SortMode)} className='rounded-2xl border border-slate-300 bg-white px-3 py-3 text-sm font-black text-slate-800 shadow-sm'>
            <option value='best'>Best first</option>
            <option value='a-z'>A to Z</option>
            <option value='z-a'>Z to A</option>
          </select>
        </div>

        <div className='flex gap-2 overflow-x-auto pb-1'>
          <button type='button' onClick={() => setLetter('')} className={`shrink-0 rounded-full px-4 py-2 text-sm font-black transition ${!letter ? 'bg-emerald-500 text-white shadow-sm' : 'border border-slate-300 bg-white text-slate-600 hover:border-emerald-500 hover:text-emerald-700'}`}>All</button>
          {LETTERS.map(currentLetter => (
            <button key={currentLetter} type='button' onClick={() => setLetter(activeLetter => activeLetter === currentLetter ? '' : currentLetter)} className={`shrink-0 rounded-full px-4 py-2 text-sm font-black transition ${letter === currentLetter ? 'bg-emerald-500 text-white shadow-sm' : 'border border-slate-300 bg-white text-slate-500 hover:border-emerald-500 hover:text-emerald-700'}`}>
              {currentLetter}
            </button>
          ))}
        </div>

        <div className='flex items-center justify-between gap-3 border-t border-slate-200 pt-3 text-xs text-slate-500'>
          <span>Showing <strong className='text-slate-950'>{filteredItems.length}</strong> of {stats.total}</span>
          <button type='button' onClick={resetFilters} className='rounded-full border border-slate-300 bg-white px-3 py-1.5 font-black text-slate-600 hover:border-emerald-500 hover:text-emerald-700'>Reset</button>
        </div>
      </section>

      {topPicks.length > 0 ? (
        <section className='rounded-[1.75rem] border border-amber-200 bg-amber-50/80 p-5 shadow-sm'>
          <div className='flex flex-wrap items-end justify-between gap-3'>
            <div>
              <p className='text-xs font-black uppercase tracking-[0.22em] text-amber-700/70'>Recommended first</p>
              <h2 className='mt-1 text-3xl font-black text-slate-950'>Top picks</h2>
            </div>
            <p className='max-w-md text-sm leading-6 text-slate-600'>Higher-confidence profiles worth checking before browsing the full library.</p>
          </div>
          <div className='mt-4 grid gap-3 md:grid-cols-3'>
            {topPicks.map(item => (
              <Link key={item.slug} href={item.href} className='group rounded-2xl border border-amber-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md'>
                <span className='rounded-full bg-amber-100 px-2.5 py-1 text-[0.68rem] font-black text-amber-800'>Top pick</span>
                <h3 className='mt-3 text-lg font-black text-slate-950 group-hover:text-emerald-800'>{item.title}</h3>
                <p className='mt-2 line-clamp-2 text-sm leading-6 text-slate-600'>{getPreview(item)}</p>
                <span className='mt-3 inline-flex text-sm font-black text-emerald-700 transition group-hover:translate-x-1'>Open profile →</span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {filteredItems.length > 0 ? (
        <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-3'>
          {filteredItems.map(item => {
            const draft = isDraftProfile(item)
            const meta = (item.meta ?? []).filter(Boolean).slice(0, 2)
            const bestFor = getBestFor(item)
            const evidenceStrength = getEvidenceStrength(item)

            return (
              <Link key={item.slug} href={item.href} className='group flex min-h-[220px] flex-col rounded-[1.6rem] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-lg'>
                <div className='flex flex-wrap items-center gap-2'>
                  <span className='rounded-full bg-emerald-50 px-2.5 py-1 text-[0.68rem] font-black text-emerald-700'>{getConversionBadge(item)}</span>
                  <span className='rounded-full bg-slate-100 px-2.5 py-1 text-[0.68rem] font-black uppercase tracking-[0.14em] text-slate-500'>{item.typeLabel || 'Profile'}</span>
                  {item.isATier ? <span className='rounded-full bg-amber-100 px-2.5 py-1 text-[0.68rem] font-black text-amber-800'>A-tier</span> : null}
                  {draft ? <span className='rounded-full bg-slate-100 px-2.5 py-1 text-[0.68rem] font-black text-slate-500'>Being refined</span> : null}
                </div>

                <div className='mt-4 flex-1'>
                  <h2 className='text-2xl font-black leading-tight tracking-tight text-slate-950 group-hover:text-emerald-800'>{item.title}</h2>
                  {item.domain ? <p className='mt-2 text-xs font-black uppercase tracking-[0.16em] text-emerald-700/60'>{formatChip(item.domain)}</p> : null}
                  {bestFor ? (
                    <p className='mt-3 rounded-2xl bg-emerald-50 px-3 py-2 text-sm font-bold leading-6 text-emerald-900'>
                      Best for: {bestFor}
                    </p>
                  ) : null}
                  <p className='mt-3 line-clamp-4 text-sm leading-6 text-slate-650 text-slate-600'>{getPreview(item)}</p>
                </div>

                {meta.length ? (
                  <div className='mt-4 flex flex-wrap gap-2'>
                    {meta.map(value => (
                      <span key={value} className='rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[0.72rem] font-semibold text-slate-500'>{value}</span>
                    ))}
                  </div>
                ) : null}

                <div className='mt-5 border-t border-slate-200 pt-4'>
                  <div className='flex items-center justify-between gap-3'>
                    <span className='text-[0.7rem] font-black uppercase tracking-[0.14em] text-slate-400'>Evidence signal</span>
                    <span className='text-xs font-black text-slate-500'>{evidenceStrength}/5</span>
                  </div>
                  <div className='mt-2'><EvidenceDots score={evidenceStrength} /></div>
                </div>

                <div className='mt-5 flex items-center justify-between gap-3'>
                  <span className='text-xs font-semibold text-slate-500'>Benefits, safety, and forms</span>
                  <span className='text-sm font-black text-emerald-700 transition group-hover:translate-x-1'>Open →</span>
                </div>
              </Link>
            )
          })}
        </div>
      ) : (
        <div className='rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-600 shadow-sm'>
          <p>{emptyLabel}</p>
          <button type='button' onClick={resetFilters} className='mt-4 premium-button'>Clear filters</button>
        </div>
      )}
    </div>
  )
}
