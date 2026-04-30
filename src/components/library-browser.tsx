'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'

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

export default function LibraryBrowser({
  eyebrow = 'Library',
  title,
  description,
  searchPlaceholder = 'Search by name, slug, or summary',
  emptyLabel = 'No matching profiles found.',
  items,
}: LibraryBrowserProps) {
  const [query, setQuery] = useState('')
  const [letter, setLetter] = useState('')

  const sortedItems = useMemo(
    () =>
      [...items]
        .filter(item => normalizeText(item.slug) && normalizeText(item.title))
        .sort((a, b) => a.title.localeCompare(b.title)),
    [items],
  )

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase()

    return sortedItems.filter(item => {
      const title = normalizeText(item.title)
      const matchesLetter = !letter || title.toUpperCase().startsWith(letter)
      const haystack = [item.title, item.slug, item.summary, item.domain, item.typeLabel]
        .map(normalizeText)
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      const matchesQuery = !q || haystack.includes(q)
      return matchesLetter && matchesQuery
    })
  }, [sortedItems, letter, query])

  return (
    <div className='mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8'>
      <section className='rounded-3xl border border-white/10 bg-white/[0.03] p-5 shadow-2xl shadow-black/20 sm:p-8'>
        <p className='text-xs font-semibold uppercase tracking-[0.22em] text-emerald-200/70'>
          {eyebrow}
        </p>

        <div className='mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between'>
          <div className='max-w-3xl'>
            <h1 className='text-4xl font-bold tracking-tight text-white sm:text-5xl'>
              {title}
            </h1>
            {description ? (
              <p className='mt-3 text-base leading-7 text-white/70 sm:text-lg'>
                {description}
              </p>
            ) : null}
          </div>

          <div className='rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/65'>
            <span className='font-semibold text-white'>{filteredItems.length}</span>{' '}
            shown / {sortedItems.length} total
          </div>
        </div>
      </section>

      <section className='sticky top-0 z-20 -mx-4 border-y border-white/10 bg-[#080a12]/95 px-4 py-4 backdrop-blur sm:mx-0 sm:rounded-3xl sm:border sm:bg-white/[0.03] sm:p-4'>
        <label className='sr-only' htmlFor='library-search'>
          Search {title}
        </label>
        <input
          id='library-search'
          value={query}
          onChange={event => setQuery(event.target.value)}
          placeholder={searchPlaceholder}
          className='w-full rounded-2xl border border-white/15 bg-white px-4 py-3 text-base text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-300 focus:ring-4 focus:ring-emerald-300/20'
        />

        <div className='mt-3 flex gap-2 overflow-x-auto pb-1'>
          <button
            type='button'
            onClick={() => setLetter('')}
            className={`shrink-0 rounded-full border px-3 py-2 text-sm font-medium transition ${
              letter === ''
                ? 'border-emerald-300 bg-emerald-300 text-slate-950'
                : 'border-white/10 bg-white/[0.03] text-white/70 hover:border-white/25 hover:text-white'
            }`}
          >
            All
          </button>
          {LETTERS.map(item => (
            <button
              key={item}
              type='button'
              onClick={() => setLetter(current => (current === item ? '' : item))}
              className={`shrink-0 rounded-full border px-3 py-2 text-sm font-medium transition ${
                letter === item
                  ? 'border-emerald-300 bg-emerald-300 text-slate-950'
                  : 'border-white/10 bg-white/[0.03] text-white/70 hover:border-white/25 hover:text-white'
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </section>

      {filteredItems.length > 0 ? (
        <section className='grid gap-4 sm:grid-cols-2 xl:grid-cols-3'>
          {filteredItems.map(item => (
            <Link
              key={item.slug}
              href={item.href}
              className='group block rounded-3xl border border-white/10 bg-white/[0.035] p-5 shadow-xl shadow-black/10 transition hover:-translate-y-0.5 hover:border-emerald-300/40 hover:bg-white/[0.06] focus:outline-none focus:ring-4 focus:ring-emerald-300/20'
            >
              <div className='flex flex-wrap items-center gap-2'>
                {item.typeLabel ? (
                  <span className='rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs font-medium text-white/60'>
                    {item.typeLabel}
                  </span>
                ) : null}
                {item.domain ? (
                  <span className='rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs font-medium capitalize text-emerald-100'>
                    {item.domain}
                  </span>
                ) : null}
                {item.isATier ? (
                  <span className='rounded-full border border-amber-300/25 bg-amber-300/10 px-3 py-1 text-xs font-semibold text-amber-100'>
                    A-tier
                  </span>
                ) : null}
              </div>

              <h2 className='mt-4 text-xl font-semibold leading-snug tracking-tight text-white group-hover:text-emerald-100'>
                {item.title}
              </h2>

              <p className='mt-3 text-sm leading-6 text-white/65'>
                {truncate(item.summary, 170)}
              </p>

              <div className='mt-5 inline-flex items-center text-sm font-semibold text-emerald-200 transition group-hover:translate-x-1'>
                Open profile <span aria-hidden='true' className='ml-1'>→</span>
              </div>
            </Link>
          ))}
        </section>
      ) : (
        <section className='rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-center'>
          <p className='text-base font-medium text-white'>{emptyLabel}</p>
          <button
            type='button'
            onClick={() => {
              setQuery('')
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
