import { useMemo, useState } from 'react'
import Fuse from 'fuse.js'
import SEO from '../components/SEO'
import StarfieldBackground from '../components/StarfieldBackground'
import HerbCardAccordion from '../components/HerbCardAccordion'
import ErrorBoundary from '../components/ErrorBoundary'
import type { Herb } from '../types'
import herbsData from '../data/herbs/herbs.normalized.json'

const formatLabel = (value: string) =>
  value
    .split(/\s+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

export default function Database() {
  const herbs = herbsData as Herb[]
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('')
  const [legal, setLegal] = useState('')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<string[]>([])
  function toggleSelect(slug: string) {
    setSelected(prev => {
      const exists = prev.includes(slug)
      if (exists) return prev.filter(s => s !== slug)
      if (prev.length >= 3) return prev
      return [...prev, slug]
    })
  }
  const compareHref = selected.length ? `/compare?ids=${selected.join(',')}` : ''
  const pageSize = 30

  const categories = useMemo(
    () =>
      Array.from(
        new Set(
          herbs
            .map(herb => herb.category?.trim())
            .filter((value): value is string => Boolean(value))
        )
      ).sort((a, b) => formatLabel(a).localeCompare(formatLabel(b))),
    [herbs]
  )

  const legals = useMemo(
    () =>
      Array.from(
        new Set(
          herbs
            .map(herb => herb.legalstatus?.trim())
            .filter((value): value is string => Boolean(value))
        )
      ).sort((a, b) => formatLabel(a).localeCompare(formatLabel(b))),
    [herbs]
  )

  const fuse = useMemo(
    () =>
      new Fuse(herbs, {
        keys: ['common', 'scientific', 'compounds', 'tags', 'region'],
        threshold: 0.3,
        ignoreLocation: true,
      }),
    [herbs]
  )

  const filtered = useMemo(() => {
    let results: Herb[] = query.trim() ? fuse.search(query).map(r => r.item) : herbs

    if (category) {
      results = results.filter(herb => herb.category === category)
    }

    if (legal) {
      results = results.filter(herb => herb.legalstatus === legal)
    }

    return results
  }, [query, category, legal, fuse, herbs])

  const paginated = useMemo(
    () => filtered.slice(0, page * pageSize),
    [filtered, page]
  )

  const topHerbs = useMemo(() => herbs.slice(0, 4), [herbs])

  const handleQueryChange = (value: string) => {
    setQuery(value)
    setPage(1)
  }

  const handleCategoryChange = (value: string) => {
    setCategory(value)
    setPage(1)
  }

  const handleLegalChange = (value: string) => {
    setLegal(value)
    setPage(1)
  }

  return (
    <ErrorBoundary>
      <div className='relative min-h-screen bg-space-dark/90 px-4 pt-20 text-sand'>
        <SEO
          title='Herb Database | The Hippie Scientist'
          description='Browse psychoactive herb profiles with scientific and cultural context.'
          canonical='https://thehippiescientist.net/database'
        />
        <StarfieldBackground />
        <div className='relative mx-auto max-w-6xl pb-12'>
        <header className='mb-10 text-center'>
          <h1 className='text-gradient mb-4 text-5xl font-bold'>
            Herb Database
            <span className='ml-2 text-sm opacity-70'>({herbs.length} items)</span>
          </h1>
          <p className='mx-auto max-w-3xl text-lg text-sand/80'>
            Explore our collection of psychoactive herbs. Use the search and filters below to quickly find herbs by
            name, compounds, or legal status.
          </p>
        </header>

        {topHerbs.length > 0 && (
          <div className='mb-8 overflow-x-auto pb-2'>
            <div className='flex min-w-full gap-4'>
              {topHerbs.map(herb => (
                <div
                  key={herb.id}
                  className='min-w-[14rem] rounded-xl bg-black/40 p-4 text-left shadow-lg backdrop-blur-md transition hover:bg-black/50'
                >
                  <p className='text-xs uppercase tracking-wide text-sand/60'>Top Herb</p>
                  <h2 className='mt-1 text-xl font-semibold text-lime-300'>{herb.common || herb.name}</h2>
                  <p className='text-sm italic text-sand/70'>{herb.scientific || herb.scientificname || 'Unknown'}</p>
                  {herb.category && (
                    <p className='mt-2 text-sm text-sand/80'>Category: {formatLabel(herb.category)}</p>
                  )}
                  {herb.legalstatus && (
                    <p className='text-sm text-sand/80'>Legal: {formatLabel(herb.legalstatus)}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className='flex flex-wrap items-center gap-2 rounded-xl bg-black/30 p-4 backdrop-blur-md'>
          <input
            value={query}
            onChange={event => handleQueryChange(event.target.value)}
            placeholder='Search herbs, compounds, tags...'
            className='w-full flex-1 rounded-md border border-white/10 bg-black/40 px-3 py-2 text-sm text-sand focus:border-lime-400 focus:outline-none focus:ring-1 focus:ring-lime-400 sm:w-64'
            aria-label='Search herbs'
          />
          <select
            value={category}
            onChange={event => handleCategoryChange(event.target.value)}
            className='w-full rounded-md border border-white/10 bg-black/40 px-3 py-2 text-sm text-sand focus:border-lime-400 focus:outline-none focus:ring-1 focus:ring-lime-400 sm:w-auto'
            aria-label='Filter by category'
          >
            <option value=''>All Categories</option>
            {categories.map(value => (
              <option key={value} value={value}>
                {formatLabel(value)}
              </option>
            ))}
          </select>
          <select
            value={legal}
            onChange={event => handleLegalChange(event.target.value)}
            className='w-full rounded-md border border-white/10 bg-black/40 px-3 py-2 text-sm text-sand focus:border-lime-400 focus:outline-none focus:ring-1 focus:ring-lime-400 sm:w-auto'
            aria-label='Filter by legal status'
          >
            <option value=''>All Legal Statuses</option>
            {legals.map(value => (
              <option key={value} value={value}>
                {formatLabel(value)}
              </option>
            ))}
          </select>
          <div className='flex items-center gap-2'>
            <button
              type='button'
              disabled={!selected.length}
              onClick={() => {
                if (compareHref) {
                  window.location.href = compareHref
                }
              }}
              className={`rounded-md px-3 py-1 ${selected.length ? 'bg-gray-900 text-white' : 'cursor-not-allowed bg-gray-300 text-gray-600'}`}
              title='Select up to 3 and compare'
            >
              Compare ({selected.length}/3)
            </button>
            {selected.length > 0 && (
              <button
                type='button'
                onClick={() => setSelected([])}
                className='rounded-md border px-2 py-1'
              >
                Clear
              </button>
            )}
          </div>
        </div>

        <div className='mt-6 flex flex-wrap items-center justify-between gap-2 text-sm text-sand/70'>
          <p>
            Showing <span className='font-semibold text-sand'>{paginated.length}</span> of{' '}
            <span className='font-semibold text-sand'>{filtered.length}</span> herbs
          </p>
          {(query || category || legal) && (
            <button
              type='button'
              onClick={() => {
                setQuery('')
                setCategory('')
                setLegal('')
                setPage(1)
              }}
              className='text-xs uppercase tracking-wide text-lime-300 hover:text-lime-200'
            >
              Clear Filters
            </button>
          )}
        </div>

        {paginated.length > 0 ? (
          <div className='mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
            {paginated.map(herb => (
              <div key={herb.id} className='space-y-2'>
                <div className='flex justify-end'>
                  <label className='flex items-center gap-2 text-xs text-sand/80'>
                    <input
                      type='checkbox'
                      checked={selected.includes(herb.slug)}
                      onChange={() => toggleSelect(herb.slug)}
                    />
                    Compare
                  </label>
                </div>
                <HerbCardAccordion herb={herb} />
              </div>
            ))}
          </div>
        ) : (
          <p className='mt-8 text-center text-sand/70'>No herbs match your current filters.</p>
        )}

        {filtered.length > page * pageSize && (
          <div className='mt-8 flex justify-center'>
            <button
              type='button'
              onClick={() => setPage(current => current + 1)}
              className='rounded-lg bg-gray-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-700'
            >
              Load More ({Math.min(filtered.length, (page + 1) * pageSize)} / {filtered.length})
            </button>
          </div>
        )}
        </div>
      </div>
    </ErrorBoundary>
  )
}
