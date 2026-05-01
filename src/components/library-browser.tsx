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

const truncate = (value: string | undefined, maxLength: number): string => {
  const text = normalizeText(value)
  if (!text) return 'Profile summary coming soon.'
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength - 1).trimEnd()}…`
}

const titleInitial = (title: string): string => {
  const first = title.trim().charAt(0).toUpperCase()
  return /[A-Z0-9]/.test(first) ? first : '•'
}

const fallbackTag = (item: BrowserItem): string => {
  if (item.domain) return item.domain
  return item.typeLabel?.replace(' profile', '') || 'Profile'
}

export default function LibraryBrowser({
  eyebrow = 'Library',
  title,
  description,
  searchPlaceholder = 'Search by name, slug, or summary',
  emptyLabel = 'No herbs found',
  items,
}: LibraryBrowserProps) {
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [letter, setLetter] = useState('')

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query), 300)
    return () => window.clearTimeout(timer)
  }, [query])

  const sortedItems = useMemo(
    () =>
      [...items]
        .filter(item => normalizeText(item.slug) && normalizeText(item.title))
        .sort((a, b) => {
          if (a.isATier !== b.isATier) return a.isATier ? -1 : 1
          return a.title.localeCompare(b.title)
        }),
    [items],
  )

  const filteredItems = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase()

    return sortedItems.filter(item => {
      const title = normalizeText(item.title)
      const matchesLetter = !letter || title.toUpperCase().startsWith(letter)
      const haystack = [item.title, item.slug, item.summary, item.domain, item.typeLabel, item.isATier ? 'top pick a tier' : '']
        .map(normalizeText)
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      const matchesQuery = !q || haystack.includes(q)
      return matchesLetter && matchesQuery
    })
  }, [sortedItems, letter, debouncedQuery])

  return (
    <div className='mx-auto w-full max-w-7xl space-y-4 px-3 py-4 sm:px-6 lg:px-8'>
      <section className='overflow-hidden rounded-3xl border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.16),transparent_35%),linear-gradient(135deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-4 shadow-xl shadow-black/20 sm:p-6'>
        <div className='flex items-start justify-between gap-3'>
          <div className='min-w-0'>
            <p className='text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-emerald-200/75'>
              {eyebrow}
            </p>
            <h1 className='mt-2 text-3xl font-bold tracking-tight text-white sm:text-5xl'>
              {title}
            </h1>
          </div>

          <div className='shrink-0 rounded-2xl border border-white/10 bg-black/25 px-3 py-2 text-right text-xs text-white/60'>
            <div className='text-lg font-bold leading-none text-white'>{filteredItems.length}</div>
            <div>of {sortedItems.length}</div>
          </div>
        </div>

        {description ? (
          <p className='mt-3 max-w-3xl text-sm leading-6 text-white/65 sm:text-base'>
            {description}
          </p>
        ) : null}
      </section>

      <section className='sticky top-0 z-20 -mx-3 border-y border-white/10 bg-[#080a12]/95 px-3 py-3 backdrop-blur sm:mx-0 sm:rounded-3xl sm:border sm:bg-white/[0.035] sm:p-3'>
        <label className='sr-only' htmlFor='library-search'>
          Search {title}
        </label>
        <input
          id='library-search'
          value={query}
          onChange={event => setQuery(event.target.value)}
          placeholder={searchPlaceholder}
          className='w-full rounded-2xl border border-white/15 bg-white/95 px-4 py-3 text-base text-slate-950 outline-none transition placeholder:text-slate-500 focus:border-emerald-300 focus:ring-4 focus:ring-emerald-300/20'
        />

        <div className='mt-3 flex gap-2 overflow-x-auto pb-2 [-webkit-overflow-scrolling:touch] scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/15'>
          <button
            type='button'
            onClick={() => setLetter('')}
            className={`min-h-10 shrink-0 rounded-full border px-4 py-2 text-xs font-bold transition ${
              letter === ''
                ? 'border-emerald-200 bg-emerald-300 text-slate-950 shadow-[0_0_18px_rgba(110,231,183,0.22)]'
                : 'border-white/10 bg-white/[0.04] text-white/72 hover:border-emerald-300/35 hover:bg-white/[0.08] hover:text-white'
            }`}
          >
            All
          </button>
          {LETTERS.map(item => (
            <button
              key={item}
              type='button'
              onClick={() => setLetter(current => (current === item ? '' : item))}
              className={`min-h-10 min-w-10 shrink-0 rounded-full border px-3 py-2 text-xs font-bold transition ${
                letter === item
                  ? 'border-emerald-200 bg-emerald-300 text-slate-950 shadow-[0_0_18px_rgba(110,231,183,0.22)]'
                  : 'border-white/10 bg-white/[0.04] text-white/72 hover:border-emerald-300/35 hover:bg-white/[0.08] hover:text-white'
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </section>

      {filteredItems.length > 0 ? (
        <section className='grid gap-3 sm:grid-cols-2 xl:grid-cols-3'>
          {filteredItems.map(item => {
            const tag = fallbackTag(item)
            return (
              <Link
                key={item.slug}
                href={item.href}
                className='group relative block overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.065] to-white/[0.025] p-4 shadow-lg shadow-black/10 transition hover:-translate-y-0.5 hover:border-emerald-300/40 hover:from-white/[0.09] hover:to-emerald-300/[0.035] focus:outline-none focus:ring-4 focus:ring-emerald-300/20'
              >
                <div className='absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-2xl border border-white/10 bg-black/20 text-sm font-bold text-emerald-100/80'>
                  {titleInitial(item.title)}
                </div>

                <div className='flex max-w-[calc(100%-3rem)] flex-wrap items-center gap-1.5'>
                  {item.isATier ? (
                    <span className='rounded-full border border-amber-300/30 bg-amber-300/10 px-2.5 py-1 text-[0.68rem] font-black uppercase leading-none tracking-[0.12em] text-amber-100'>
                      ★ Top Pick
                    </span>
                  ) : null}
                  <span className='rounded-full border border-emerald-300/20 bg-emerald-300/10 px-2.5 py-1 text-[0.68rem] font-semibold capitalize leading-none text-emerald-100'>
                    {tag}
                  </span>
                  {item.typeLabel ? (
                    <span className='rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-[0.68rem] font-medium leading-none text-white/55'>
                      {item.typeLabel}
                    </span>
                  ) : null}
                </div>

                <h2 className='mt-3 pr-10 text-lg font-semibold leading-snug tracking-tight text-white group-hover:text-emerald-100 sm:text-xl'>
                  {item.title}
                </h2>

                <p className='mt-2 line-clamp-3 min-h-[4.5rem] text-sm leading-6 text-white/62'>
                  {truncate(item.summary, 140)}
                </p>

                <div className='mt-3 flex items-center justify-between border-t border-white/10 pt-3'>
                  <span className='text-xs text-white/40'>/{item.slug}</span>
                  <span className='text-sm font-semibold text-emerald-200 transition group-hover:translate-x-1'>
                    Open →
                  </span>
                </div>
              </Link>
            )
          })}
        </section>
      ) : (
        <section className='rounded-3xl border border-white/10 bg-white/[0.03] p-6 text-center'>
          <p className='text-base font-semibold text-white'>No herbs found</p>
          <p className='mt-2 text-sm text-white/60'>{emptyLabel}</p>
          <button
            type='button'
            onClick={() => {
              setQuery('')
              setDebouncedQuery('')
              setLetter('')
            }}
            className='mt-4 rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-white/75 transition hover:border-white/30 hover:bg-white/5 hover:text-white'
          >
            Clear filters
          </button>
        </section>
      )}
    </div>
  )
}
