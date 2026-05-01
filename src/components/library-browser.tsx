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

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

const normalizeText = (value: unknown): string =>
  typeof value === 'string' ? value.trim() : ''

const getPreview = (value: unknown): string => {
  const text = normalizeText(value)
  if (!text) return 'Profile summary coming soon.'
  return text.length > 180 ? `${text.slice(0, 179).trimEnd()}…` : text
}

const formatChip = (value: string): string =>
  value
    .split('-')
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')

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

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query), 250)
    return () => window.clearTimeout(timer)
  }, [query])

  const sortedItems = useMemo(
    () =>
      [...items]
        .filter(item => normalizeText(item.slug) && normalizeText(item.title))
        .sort((a, b) => a.title.localeCompare(b.title)),
    [items],
  )

  const filteredItems = useMemo(() => {
    const q = debouncedQuery.toLowerCase().trim()

    return sortedItems.filter(item => {
      const title = normalizeText(item.title)
      const searchable = `${item.title} ${item.slug} ${item.summary ?? ''} ${item.domain ?? ''}`.toLowerCase()
      return (!letter || title.toUpperCase().startsWith(letter)) && (!q || searchable.includes(q))
    })
  }, [sortedItems, letter, debouncedQuery])

  const resetFilters = () => {
    setQuery('')
    setDebouncedQuery('')
    setLetter('')
  }

  return (
    <div className='mx-auto w-full max-w-7xl space-y-6 px-3 py-4'>
      <section className='rounded-[2rem] border border-white/10 bg-white/[0.035] p-5 sm:p-7'>
        <p className='text-xs font-semibold uppercase tracking-[0.22em] text-emerald-100/65'>{eyebrow}</p>
        <div className='mt-3 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end'>
          <div>
            <h1 className='text-3xl font-black tracking-tight text-white sm:text-5xl'>{title}</h1>
            {description ? <p className='mt-3 max-w-3xl text-sm leading-6 text-white/65 sm:text-base'>{description}</p> : null}
          </div>
          <div className='rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/70'>
            <span className='font-bold text-white'>{filteredItems.length}</span> of {sortedItems.length} profiles shown
          </div>
        </div>
      </section>

      <section className='rounded-3xl border border-white/10 bg-black/20 p-4'>
        <label className='sr-only' htmlFor={`${title}-library-search`}>Search {title}</label>
        <input
          id={`${title}-library-search`}
          value={query}
          onChange={event => setQuery(event.target.value)}
          placeholder={searchPlaceholder}
          className='w-full rounded-2xl border border-white/10 bg-white px-5 py-4 text-slate-950 outline-none ring-emerald-300/40 transition placeholder:text-slate-500 focus:border-emerald-300/60 focus:ring-4'
        />

        <div className='mt-4 flex gap-2 overflow-x-auto pb-1'>
          <button
            type='button'
            onClick={() => setLetter('')}
            aria-pressed={!letter}
            className={`shrink-0 rounded-full px-3 py-2 text-sm font-bold transition ${!letter ? 'bg-emerald-300 text-slate-950' : 'border border-white/10 text-white/70 hover:bg-white/5 hover:text-white'}`}
          >
            All
          </button>
          {LETTERS.map(currentLetter => (
            <button
              key={currentLetter}
              type='button'
              onClick={() => setLetter(activeLetter => activeLetter === currentLetter ? '' : currentLetter)}
              aria-pressed={letter === currentLetter}
              className={`shrink-0 rounded-full px-3 py-2 text-sm font-bold transition ${letter === currentLetter ? 'bg-emerald-300 text-slate-950' : 'border border-white/10 text-white/70 hover:bg-white/5 hover:text-white'}`}
            >
              {currentLetter}
            </button>
          ))}
        </div>
      </section>

      {filteredItems.length > 0 ? (
        <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
          {filteredItems.map(item => (
            <Link
              key={item.slug}
              href={item.href}
              className='group flex min-h-52 flex-col rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.025] p-5 text-white transition hover:-translate-y-0.5 hover:border-emerald-300/35 hover:bg-white/[0.07]'
            >
              <div className='flex flex-wrap gap-2'>
                {item.typeLabel ? <span className='rounded-full border border-white/10 px-2.5 py-1 text-xs font-semibold text-white/55'>{item.typeLabel}</span> : null}
                {item.domain ? <span className='rounded-full border border-emerald-300/20 bg-emerald-300/10 px-2.5 py-1 text-xs font-semibold text-emerald-100'>{formatChip(item.domain)}</span> : null}
                {item.isATier ? <span className='rounded-full border border-amber-300/30 bg-amber-300/10 px-2.5 py-1 text-xs font-semibold text-amber-100'>A-tier</span> : null}
              </div>

              <h2 className='mt-4 text-xl font-black tracking-tight group-hover:text-emerald-100'>{item.title}</h2>
              <p className='mt-3 grow text-sm leading-6 text-white/62'>{getPreview(item.summary)}</p>
              <span className='mt-5 inline-flex text-sm font-bold text-emerald-200 transition group-hover:translate-x-1'>Open profile →</span>
            </Link>
          ))}
        </div>
      ) : (
        <div className='rounded-3xl border border-white/10 bg-white/[0.035] p-8 text-center text-white/70'>
          <p>{emptyLabel}</p>
          <button type='button' onClick={resetFilters} className='mt-4 rounded-2xl bg-emerald-300 px-5 py-3 text-sm font-black text-slate-950'>
            Clear filters
          </button>
        </div>
      )}
    </div>
  )
}
