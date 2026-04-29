'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'

type LibraryItem = {
  slug: string
  title: string
  summary: string
  href: string
  typeLabel: string
  aTier?: boolean
}

type LibraryBrowserProps = {
  eyebrow: string
  title: string
  description: string
  searchPlaceholder: string
  emptyLabel: string
  items: LibraryItem[]
}

type SortMode = 'a-z' | 'z-a'
type LetterFilter = 'all' | '#'

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

const getFirstFilterChar = (value: string): string => {
  const trimmed = value.trim()
  if (!trimmed) return '#'

  const firstChar = trimmed.charAt(0).toUpperCase()
  return /[A-Z]/.test(firstChar) ? firstChar : '#'
}

const sortItems = (items: LibraryItem[], sortMode: SortMode): LibraryItem[] => {
  const sorted = [...items].sort((a, b) => a.title.localeCompare(b.title))
  return sortMode === 'a-z' ? sorted : sorted.reverse()
}

export default function LibraryBrowser({
  eyebrow,
  title,
  description,
  searchPlaceholder,
  emptyLabel,
  items,
}: LibraryBrowserProps) {
  const [query, setQuery] = useState('')
  const [sortMode, setSortMode] = useState<SortMode>('a-z')
  const [letterFilter, setLetterFilter] = useState<string | LetterFilter>('all')
  const [aTierOnly, setATierOnly] = useState(false)

  const availableLetters = useMemo(() => {
    const letters = new Set(items.map(item => getFirstFilterChar(item.title)))
    return {
      letters,
      hasSymbols: letters.has('#'),
    }
  }, [items])

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    const matchingItems = items.filter(item => {
      const matchesQuery = normalizedQuery
        ? `${item.title} ${item.summary} ${item.slug}`.toLowerCase().includes(normalizedQuery)
        : true

      const firstChar = getFirstFilterChar(item.title)
      const matchesLetter =
        letterFilter === 'all' ? true : firstChar === letterFilter

      const matchesATier = aTierOnly ? item.aTier === true : true

      return matchesQuery && matchesLetter && matchesATier
    })

    return sortItems(matchingItems, sortMode)
  }, [aTierOnly, items, letterFilter, query, sortMode])

  const clearFilters = () => {
    setQuery('')
    setSortMode('a-z')
    setLetterFilter('all')
    setATierOnly(false)
  }

  return (
    <div className='space-y-8'>
      <section className='rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8'>
        <p className='text-sm font-medium uppercase tracking-[0.2em] text-white/50'>
          {eyebrow}
        </p>

        <h1 className='mt-2 text-4xl font-bold tracking-tight'>{title}</h1>

        <p className='mt-4 max-w-3xl text-base leading-7 text-white/75'>
          {description}
        </p>

        <div className='mt-6 grid gap-3 sm:grid-cols-[1fr_auto]'>
          <label className='block'>
            <span className='mb-2 block text-sm font-medium text-white/70'>
              Search
            </span>
            <input
              type='search'
              value={query}
              onChange={event => setQuery(event.target.value)}
              placeholder={searchPlaceholder}
              className='w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-white/30 focus:bg-white/[0.06]'
            />
          </label>

          <label className='block'>
            <span className='mb-2 block text-sm font-medium text-white/70'>
              Sort
            </span>
            <select
              value={sortMode}
              onChange={event => setSortMode(event.target.value as SortMode)}
              className='w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition focus:border-white/30 focus:bg-white/[0.06] sm:min-w-40'
            >
              <option value='a-z'>A to Z</option>
              <option value='z-a'>Z to A</option>
            </select>
          </label>
        </div>

        <div className='mt-6'>
          <label className='inline-flex items-center gap-2 text-sm text-white/80'>
            <input
              type='checkbox'
              checked={aTierOnly}
              onChange={event => setATierOnly(event.target.checked)}
              className='h-4 w-4 rounded border-white/20 bg-white/[0.04] accent-blue-300'
            />
            A-tier only
          </label>
        </div>

        <div className='mt-6'>
          <p className='text-sm font-medium text-white/70'>Browse by letter</p>

          <div className='mt-3 flex flex-wrap gap-2'>
            <button
              type='button'
              onClick={() => setLetterFilter('all')}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                letterFilter === 'all'
                  ? 'border-white/30 bg-white/10 text-white'
                  : 'border-white/10 text-white/70 hover:border-white/25 hover:bg-white/5 hover:text-white'
              }`}
            >
              All
            </button>

            {alphabet.map(letter => {
              const disabled = !availableLetters.letters.has(letter)

              return (
                <button
                  key={letter}
                  type='button'
                  onClick={() => setLetterFilter(letter)}
                  disabled={disabled}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                    letterFilter === letter
                      ? 'border-white/30 bg-white/10 text-white'
                      : disabled
                        ? 'cursor-not-allowed border-white/5 text-white/20'
                        : 'border-white/10 text-white/70 hover:border-white/25 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {letter}
                </button>
              )
            })}

            {availableLetters.hasSymbols ? (
              <button
                type='button'
                onClick={() => setLetterFilter('#')}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                  letterFilter === '#'
                    ? 'border-white/30 bg-white/10 text-white'
                    : 'border-white/10 text-white/70 hover:border-white/25 hover:bg-white/5 hover:text-white'
                }`}
              >
                #
              </button>
            ) : null}
          </div>
        </div>

        <div className='mt-4 flex flex-wrap items-center gap-3 text-sm text-white/60'>
          <span>
            Showing {filteredItems.length} of {items.length}
          </span>

          {letterFilter !== 'all' ? <span>Letter: {letterFilter}</span> : null}
          {aTierOnly ? <span>A-tier only</span> : null}

          {(query.trim() || letterFilter !== 'all' || sortMode !== 'a-z' || aTierOnly) ? (
            <button
              type='button'
              onClick={clearFilters}
              className='rounded-full border border-white/10 px-3 py-1.5 text-xs font-medium text-white/75 transition hover:border-white/25 hover:bg-white/5 hover:text-white'
            >
              Clear filters
            </button>
          ) : null}
        </div>
      </section>

      {filteredItems.length > 0 ? (
        <section className='grid gap-4 sm:grid-cols-2 xl:grid-cols-3'>
          {filteredItems.map(item => (
            <Link
              key={item.slug}
              href={item.href}
              className='group ds-card flex h-full flex-col transition hover:border-white/30 hover:bg-white/5'
            >
              <p className='text-xs font-medium uppercase tracking-[0.2em] text-white/50'>
                {item.typeLabel}
              </p>

              <h2 className='mt-3 text-xl font-semibold'>{item.title}</h2>
              {item.aTier ? (
                <span className='mt-2 inline-flex w-fit rounded-full border border-blue-300/40 bg-blue-400/10 px-2 py-0.5 text-xs font-medium uppercase tracking-wide text-blue-200'>
                  A-tier
                </span>
              ) : null}

              <p className='mt-3 flex-1 text-sm leading-6 text-white/70'>
                {item.summary}
              </p>

              <span className='mt-4 inline-flex text-sm font-medium text-blue-300 transition group-hover:translate-x-0.5'>
                Read profile →
              </span>
            </Link>
          ))}
        </section>
      ) : (
        <section className='ds-card'>
          <h2 className='text-xl font-semibold'>No matches found</h2>
          <p className='mt-3 text-sm leading-6 text-white/70'>{emptyLabel}</p>
        </section>
      )}
    </div>
  )
}
