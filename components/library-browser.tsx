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
  if (isDraftProfile(item)) return 'Research profile in progress. Start with ready profiles for stronger evidence and decision support.'
  return text.length > 180 ? `${text.slice(0, 179).trimEnd()}…` : text
}

const formatChip = (value: string): string =>
  value
    .split('-')
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
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
  searchPlaceholder = 'Search by name, slug, or summary',
  emptyLabel = 'No matching profiles found. Try a different search or clear the filters.',
  items,
}: LibraryBrowserProps) {
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [letter, setLetter] = useState('')
  const [qualityFilter, setQualityFilter] = useState<QualityFilter>('ready')
  const [sortMode, setSortMode] = useState<SortMode>('best')

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query), 200)
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

  const featuredItems = useMemo(
    () => [...cleanItems]
      .filter(item => !isDraftProfile(item))
      .sort((a, b) => qualityRank(a) - qualityRank(b) || a.title.localeCompare(b.title))
      .slice(0, 3),
    [cleanItems],
  )

  const filteredItems = useMemo(() => {
    const q = debouncedQuery.toLowerCase().trim()

    const filtered = cleanItems.filter(item => {
      const titleText = normalizeText(item.title)
      const searchable = `${item.title} ${item.slug} ${item.summary ?? ''} ${item.domain ?? ''}`.toLowerCase()
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
    setQualityFilter('ready')
    setSortMode('best')
  }

  return (
    <div className='mx-auto w-full max-w-7xl space-y-6 px-3 py-4'>
      <section className='rounded-[2rem] border border-emerald-300/15 bg-[radial-gradient(circle_at_top_left,rgba(52,211,153,0.16),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.07),rgba(255,255,255,0.025))] p-5 sm:p-7'>
        <p className='text-xs font-semibold uppercase tracking-[0.22em] text-emerald-100/65'>{eyebrow}</p>
        <div className='mt-3 grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end'>
          <div>
            <h1 className='text-3xl font-black tracking-tight text-white sm:text-5xl'>{title}</h1>
            {description ? <p className='mt-3 max-w-3xl text-sm leading-6 text-white/65 sm:text-base'>{description}</p> : null}
          </div>
          <div className='grid grid-cols-3 gap-2 rounded-3xl border border-white/10 bg-black/25 p-2 text-center'>
            <div className='rounded-2xl bg-emerald-300/10 px-3 py-3'>
              <div className='text-2xl font-black text-emerald-100'>{stats.ready}</div>
              <div className='text-[0.68rem] font-bold uppercase tracking-[0.16em] text-emerald-100/55'>Ready</div>
            </div>
            <div className='rounded-2xl bg-amber-300/10 px-3 py-3'>
              <div className='text-2xl font-black text-amber-100'>{stats.aTier}</div>
              <div className='text-[0.68rem] font-bold uppercase tracking-[0.16em] text-amber-100/55'>A-tier</div>
            </div>
            <div className='rounded-2xl bg-white/[0.055] px-3 py-3'>
              <div className='text-2xl font-black text-white'>{stats.total}</div>
              <div className='text-[0.68rem] font-bold uppercase tracking-[0.16em] text-white/45'>Total</div>
            </div>
          </div>
        </div>

        {featuredItems.length > 0 && (
          <div className='mt-6 grid gap-3 md:grid-cols-3'>
            {featuredItems.map(item => (
              <Link key={`featured-${item.slug}`} href={item.href} className='group rounded-3xl border border-emerald-300/18 bg-black/24 p-4 transition hover:-translate-y-0.5 hover:border-emerald-300/45 hover:bg-emerald-300/[0.06]'>
                <div className='flex items-center gap-2'>
                  <span className='rounded-full bg-emerald-300/14 px-2.5 py-1 text-[0.68rem] font-black uppercase tracking-[0.18em] text-emerald-100'>Start here</span>
                  {item.isATier ? <span className='rounded-full bg-amber-300/12 px-2.5 py-1 text-[0.68rem] font-black uppercase tracking-[0.18em] text-amber-100'>A-tier</span> : null}
                </div>
                <h2 className='mt-3 text-lg font-black text-white group-hover:text-emerald-100'>{item.title}</h2>
                <p className='mt-2 line-clamp-2 text-xs leading-5 text-white/58'>{getPreview(item)}</p>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className='rounded-3xl border border-white/10 bg-black/25 p-4'>
        <div className='grid gap-3 md:grid-cols-[1fr_auto_auto]'>
          <input
            value={query}
            onChange={event => setQuery(event.target.value)}
            placeholder={searchPlaceholder}
            className='w-full rounded-2xl border border-white/10 bg-white px-5 py-4 text-slate-950 outline-none ring-emerald-300/40 transition placeholder:text-slate-500 focus:border-emerald-300/60 focus:ring-4'
          />
          <select value={qualityFilter} onChange={event => setQualityFilter(event.target.value as QualityFilter)} className='rounded-2xl border border-white/10 bg-zinc-950 px-4 py-3 text-sm text-white'>
            <option value='ready'>Ready only</option>
            <option value='all'>All profiles</option>
            <option value='drafts'>Drafts only</option>
          </select>
          <select value={sortMode} onChange={event => setSortMode(event.target.value as SortMode)} className='rounded-2xl border border-white/10 bg-zinc-950 px-4 py-3 text-sm text-white'>
            <option value='best'>Best first</option>
            <option value='a-z'>A to Z</option>
            <option value='z-a'>Z to A</option>
          </select>
        </div>

        <div className='mt-4 flex gap-2 overflow-x-auto pb-1'>
          <button type='button' onClick={() => setLetter('')} className={`shrink-0 rounded-full px-3 py-2 text-sm font-bold transition ${!letter ? 'bg-emerald-300 text-slate-950' : 'border border-white/10 text-white/70 hover:bg-white/5 hover:text-white'}`}>All</button>
          {LETTERS.map(currentLetter => (
            <button key={currentLetter} type='button' onClick={() => setLetter(activeLetter => activeLetter === currentLetter ? '' : currentLetter)} className={`shrink-0 rounded-full px-3 py-2 text-sm font-bold transition ${letter === currentLetter ? 'bg-emerald-300 text-slate-950' : 'border border-white/10 text-white/70 hover:bg-white/5 hover:text-white'}`}>
              {currentLetter}
            </button>
          ))}
        </div>

        <div className='mt-4 flex items-center justify-between gap-3 text-xs text-white/50'>
          <span>Showing <strong className='text-white'>{filteredItems.length}</strong> of {stats.total}</span>
          <button type='button' onClick={resetFilters} className='rounded-full border border-white/10 px-3 py-2 font-bold text-white/70 hover:bg-white/5'>Reset</button>
        </div>
      </section>

      {filteredItems.length > 0 ? (
        <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
          {filteredItems.map(item => {
            const draft = isDraftProfile(item)
            return (
              <Link key={item.slug} href={item.href} className={`group flex min-h-52 flex-col rounded-3xl border p-5 text-white transition hover:-translate-y-0.5 ${draft ? 'border-white/8 bg-white/[0.025] opacity-80 hover:opacity-100' : 'border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.025] hover:border-emerald-300/35 hover:bg-white/[0.07]'}`}>
                <div className='flex flex-wrap gap-2'>
                  {item.typeLabel ? <span className='rounded-full border border-white/10 px-2.5 py-1 text-xs font-semibold text-white/55'>{item.typeLabel}</span> : null}
                  {item.domain ? <span className='rounded-full border border-emerald-300/20 bg-emerald-300/10 px-2.5 py-1 text-xs font-semibold text-emerald-100'>{formatChip(item.domain)}</span> : null}
                  {item.isATier ? <span className='rounded-full border border-amber-300/30 bg-amber-300/10 px-2.5 py-1 text-xs font-semibold text-amber-100'>A-tier</span> : null}
                  {!draft ? <span className='rounded-full bg-emerald-300/10 px-2.5 py-1 text-xs font-semibold text-emerald-100'>Ready</span> : <span className='rounded-full bg-white/5 px-2.5 py-1 text-xs font-semibold text-white/35'>Draft</span>}
                </div>
                <h2 className='mt-4 text-xl font-black tracking-tight group-hover:text-emerald-100'>{item.title}</h2>
                <p className='mt-3 grow text-sm leading-6 text-white/62'>{getPreview(item)}</p>
                <span className='mt-5 inline-flex text-sm font-bold text-emerald-200 transition group-hover:translate-x-1'>{draft ? 'Open draft →' : 'View evidence profile →'}</span>
              </Link>
            )
          })}
        </div>
      ) : (
        <div className='rounded-3xl border border-white/10 bg-white/[0.035] p-8 text-center text-white/70'>
          <p>{emptyLabel}</p>
          <button type='button' onClick={resetFilters} className='mt-4 rounded-2xl bg-emerald-300 px-5 py-3 text-sm font-black text-slate-950'>Clear filters</button>
        </div>
      )}
    </div>
  )
}
