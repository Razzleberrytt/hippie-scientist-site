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
  if (isDraftProfile(item)) return 'Needs a clean public summary, but metadata may still be searchable.'
  return text.length > 110 ? `${text.slice(0, 109).trimEnd()}…` : text
}

const formatChip = (value: string): string =>
  value
    .split(/[-_,]/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part.trim().charAt(0).toUpperCase() + part.trim().slice(1))
    .join(' ')

const qualityRank = (item: BrowserItem): number => {
  if (item.isATier) return 0
  if (!isDraftProfile(item)) return 1
  return 2
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
      return qualityRank(a) - qualityRank(b) || a.title.localeCompare(b.title)
    })
  }, [cleanItems, debouncedQuery, letter, qualityFilter, sortMode])

  const resetFilters = () => {
    setQuery('')
    setDebouncedQuery('')
    setLetter('')
    setQualityFilter('all')
    setSortMode('best')
  }

  return (
    <div className='mx-auto w-full max-w-6xl space-y-4 py-2'>
      <section className='rounded-2xl border border-white/10 bg-white/[0.025] p-5'>
        <p className='text-xs font-bold uppercase tracking-[0.2em] text-emerald-100/60'>{eyebrow}</p>
        <h1 className='mt-3 text-4xl font-black tracking-tight text-white sm:text-5xl'>{title}</h1>
        {description ? <p className='mt-3 max-w-2xl text-sm leading-6 text-white/60 sm:text-base'>{description}</p> : null}
        <div className='mt-4 flex flex-wrap gap-2 text-xs font-bold text-white/55'>
          <span className='rounded-full border border-white/10 px-3 py-1.5'><span className='text-white'>{stats.total}</span> profiles</span>
          <span className='rounded-full border border-white/10 px-3 py-1.5'><span className='text-white'>{stats.ready}</span> useful summaries</span>
          {stats.aTier > 0 ? <span className='rounded-full border border-amber-200/20 px-3 py-1.5 text-amber-100'>{stats.aTier} A-tier</span> : null}
        </div>
      </section>

      <section className='rounded-2xl border border-white/10 bg-white/[0.02] p-3'>
        <div className='grid gap-2 md:grid-cols-[1fr_auto_auto]'>
          <input
            value={query}
            onChange={event => setQuery(event.target.value)}
            placeholder={searchPlaceholder}
            className='w-full rounded-xl border border-white/10 bg-[#101418] px-4 py-3 text-base text-white outline-none transition placeholder:text-white/35 focus:border-emerald-200/45'
          />
          <select value={qualityFilter} onChange={event => setQualityFilter(event.target.value as QualityFilter)} className='rounded-xl border border-white/10 bg-[#101418] px-3 py-3 text-sm text-white'>
            <option value='all'>All profiles</option>
            <option value='ready'>Useful only</option>
            <option value='drafts'>Needs summary</option>
          </select>
          <select value={sortMode} onChange={event => setSortMode(event.target.value as SortMode)} className='rounded-xl border border-white/10 bg-[#101418] px-3 py-3 text-sm text-white'>
            <option value='best'>Best first</option>
            <option value='a-z'>A to Z</option>
            <option value='z-a'>Z to A</option>
          </select>
        </div>

        <div className='mt-3 flex gap-1.5 overflow-x-auto pb-1'>
          <button type='button' onClick={() => setLetter('')} className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-bold transition ${!letter ? 'bg-emerald-200 text-slate-950' : 'border border-white/10 text-white/55 hover:text-white'}`}>All</button>
          {LETTERS.map(currentLetter => (
            <button key={currentLetter} type='button' onClick={() => setLetter(activeLetter => activeLetter === currentLetter ? '' : currentLetter)} className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-bold transition ${letter === currentLetter ? 'bg-emerald-200 text-slate-950' : 'border border-white/10 text-white/55 hover:text-white'}`}>
              {currentLetter}
            </button>
          ))}
        </div>

        <div className='mt-3 flex items-center justify-between gap-3 text-xs text-white/45'>
          <span>Showing <strong className='text-white'>{filteredItems.length}</strong> of {stats.total}</span>
          <button type='button' onClick={resetFilters} className='rounded-full border border-white/10 px-3 py-1.5 font-bold text-white/60 hover:text-white'>Reset</button>
        </div>
      </section>

      {filteredItems.length > 0 ? (
        <div className='overflow-hidden rounded-2xl border border-white/10 bg-white/[0.018]'>
          {filteredItems.map(item => {
            const draft = isDraftProfile(item)
            const meta = (item.meta ?? []).filter(Boolean).slice(0, 4)
            return (
              <Link key={item.slug} href={item.href} className='group block border-b border-white/8 px-4 py-3.5 text-white transition last:border-b-0 hover:bg-white/[0.035]'>
                <div className='flex items-start justify-between gap-4'>
                  <div className='min-w-0 flex-1'>
                    <div className='flex flex-wrap items-center gap-2'>
                      <h2 className='text-base font-black leading-tight tracking-tight text-white group-hover:text-emerald-100 sm:text-lg'>{item.title}</h2>
                      {item.isATier ? <span className='rounded-full border border-amber-200/20 px-2 py-0.5 text-[0.68rem] font-bold text-amber-100/75'>A-tier</span> : null}
                      {draft ? <span className='rounded-full border border-white/10 px-2 py-0.5 text-[0.68rem] font-bold text-white/35'>Needs summary</span> : null}
                    </div>
                    <p className='mt-1 line-clamp-2 text-sm leading-5 text-white/58'>{getPreview(item)}</p>
                    <div className='mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-white/45'>
                      {item.domain ? <span className='text-emerald-100/65'>{formatChip(item.domain)}</span> : null}
                      {meta.map(value => <span key={value}>{value}</span>)}
                    </div>
                  </div>
                  <span className='mt-0.5 shrink-0 text-sm font-bold text-emerald-200 transition group-hover:translate-x-1'>View →</span>
                </div>
              </Link>
            )
          })}
        </div>
      ) : (
        <div className='rounded-2xl border border-white/10 bg-white/[0.025] p-8 text-center text-white/65'>
          <p>{emptyLabel}</p>
          <button type='button' onClick={resetFilters} className='mt-4 premium-button'>Clear filters</button>
        </div>
      )}
    </div>
  )
}
