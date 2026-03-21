import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Meta from './Meta'
import ErrorBoundary from './ErrorBoundary'
import DatabaseHerbCard from './DatabaseHerbCard'
import AdvancedSearch from './AdvancedSearch'
import StatBadges from './StatBadges'
import { pickRandomHerb } from '@/lib/discovery'
import type { Herb } from '@/types'
import { trackEvent } from '@/lib/growth'
import { CTA } from '@/lib/cta'

const POPULAR_SEARCHES = ['ashwagandha', 'lion’s mane', 'kava', 'reishi', 'muscimol']
const SEARCH_SUGGESTIONS = ['gaba', 'adaptogen', 'sleep', 'focus', 'dream']

export type EntityDatabasePageProps = {
  title: string
  description: string
  metaPath: string
  items: Herb[]
  kind: 'herb' | 'compound'
  counters: {
    herbCount: number
    compoundCount: number
    articleCount: number
  }
  enableAdvancedFilters?: boolean
}

function scoreSearch(item: Herb, query: string) {
  if (!query) return 0
  const q = query.toLowerCase()
  const name = String(item.common || item.scientific || item.name || item.slug || '').toLowerCase()
  const effects = String(item.effects || '').toLowerCase()
  const description = String(item.description || '').toLowerCase()
  const tags = [
    ...(item.tags || []),
    ...(item.compoundClasses || []),
    ...(item.pharmCategories || []),
  ]
    .join(' ')
    .toLowerCase()

  let score = 0
  if (name === q) score += 120
  if (name.startsWith(q)) score += 80
  if (name.includes(q)) score += 50
  if (tags.includes(q)) score += 30
  if (effects.includes(q)) score += 20
  if (description.includes(q)) score += 10
  return score
}

export default function EntityDatabasePage({
  title,
  description,
  metaPath,
  items,
  kind,
  counters,
  enableAdvancedFilters = false,
}: EntityDatabasePageProps) {
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const [advancedResults, setAdvancedResults] = useState<Herb[] | null>(null)
  const [effectFilter, setEffectFilter] = useState(searchParams.get('effect') || 'all')
  const [intensityFilter, setIntensityFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [tagFilter, setTagFilter] = useState(searchParams.get('tag') || 'all')

  const scopedItems = useMemo(
    () => (enableAdvancedFilters ? (advancedResults ?? items) : items),
    [advancedResults, enableAdvancedFilters, items]
  )

  const options = useMemo(() => {
    const effectSet = new Set<string>()
    const intensitySet = new Set<string>()
    const categorySet = new Set<string>()
    const tagSet = new Set<string>()

    items.forEach(item => {
      ;(item.pharmCategories || []).forEach(entry => effectSet.add(String(entry)))
      ;(item.tags || []).forEach(entry => {
        if (!entry?.startsWith('🧪')) {
          effectSet.add(String(entry))
          tagSet.add(String(entry).toLowerCase())
        }
      })
      ;(item.compoundClasses || []).forEach(entry => tagSet.add(String(entry).toLowerCase()))

      const intensity = item.intensityLabel || item.intensityLevel || item.intensity
      if (intensity) intensitySet.add(String(intensity))

      const categories = [
        ...(item.compoundClasses || []),
        item.category,
        item.category_label,
      ].filter(Boolean)
      categories.forEach(entry => categorySet.add(String(entry)))
    })

    return {
      effects: Array.from(effectSet).sort((a, b) => a.localeCompare(b)),
      intensities: Array.from(intensitySet).sort((a, b) => a.localeCompare(b)),
      categories: Array.from(categorySet).sort((a, b) => a.localeCompare(b)),
      tags: Array.from(tagSet).sort((a, b) => a.localeCompare(b)),
    }
  }, [items])

  const filtered = useMemo(() => {
    const q = String(query || '')
      .trim()
      .toLowerCase()

    const scored = scopedItems
      .map(item => {
        if (!q) return { item, score: 0 }
        const score = scoreSearch(item, q)
        return { item, score }
      })
      .filter(entry => !q || entry.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(entry => entry.item)

    return scored.filter(item => {
      if (effectFilter !== 'all') {
        const effects = [...(item.pharmCategories || []), ...(item.tags || []), item.effects || '']
          .join(' ')
          .toLowerCase()
        if (!effects.includes(effectFilter.toLowerCase())) return false
      }

      if (tagFilter !== 'all') {
        const tags = [
          ...(item.tags || []),
          ...(item.compoundClasses || []),
          ...(item.pharmCategories || []),
        ]
          .join(' ')
          .toLowerCase()
        if (!tags.includes(tagFilter.toLowerCase())) return false
      }

      if (intensityFilter !== 'all') {
        const label = String(
          item.intensityLabel || item.intensityLevel || item.intensity || ''
        ).toLowerCase()
        if (!label.includes(intensityFilter.toLowerCase())) return false
      }

      if (categoryFilter !== 'all') {
        const categories = [
          ...(item.compoundClasses || []),
          item.category || '',
          item.category_label || '',
        ]
          .join(' ')
          .toLowerCase()
        if (!categories.includes(categoryFilter.toLowerCase())) return false
      }

      return true
    })
  }, [scopedItems, query, effectFilter, intensityFilter, categoryFilter, tagFilter])
  const topMatches = useMemo(() => filtered.slice(0, 3), [filtered])

  const randomHerb = kind === 'herb' ? pickRandomHerb(items) : null

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams)
    if (!value || value === 'all') next.delete(key)
    else next.set(key, value)
    setSearchParams(next)
  }

  return (
    <ErrorBoundary>
      <Meta title={`${title} | The Hippie Scientist`} description={description} path={metaPath} />
      <main className='container mx-auto max-w-5xl px-4 py-6'>
        <section className='ds-card-lg ds-section text-white'>
          <h1 className='ds-heading text-4xl font-bold tracking-tight sm:text-5xl'>{title}</h1>
          <p className='text-white/78 mt-4 max-w-3xl text-base leading-7'>{description}</p>

          <div className='mt-5 flex flex-wrap items-center gap-3'>
            {enableAdvancedFilters && (
              <>
                {advancedResults && (
                  <button
                    type='button'
                    className='btn-secondary'
                    onClick={() => setAdvancedResults(null)}
                  >
                    Clear advanced filters
                  </button>
                )}
                <button
                  type='button'
                  className='btn-ghost text-sm'
                  onClick={() => setAdvancedOpen(true)}
                >
                  {CTA.primary.learn}
                </button>
              </>
            )}
            {randomHerb?.slug && (
              <Link to={`/herbs/${randomHerb.slug}`} className='btn-secondary'>
                {CTA.primary.explore}
              </Link>
            )}
          </div>

          <div className='ds-card mt-5 space-y-4 p-5'>
            <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4'>
              <input
                id={`${kind}-search-input`}
                className='min-w-0 flex-1 rounded-2xl border border-white/15 bg-black/30 px-4 py-2 text-sm text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/30'
                placeholder={`Search ${kind === 'herb' ? 'herbs' : 'compounds'}, effects…`}
                value={query}
                onChange={event => {
                  const next = event.target.value
                  setQuery(next)
                  updateParam('q', next.trim())
                  if (next.trim().length >= 2) {
                    trackEvent('search_used', {
                      kind,
                      query_length: next.trim().length,
                      query: next.trim().toLowerCase(),
                    })
                  }
                }}
              />
              <span className='text-sm text-white/65 sm:shrink-0'>{filtered.length} results</span>
            </div>
            <div className='flex flex-wrap gap-2 text-xs'>
              <span className='text-white/60'>Popular searches:</span>
              {POPULAR_SEARCHES.map(term => (
                <button
                  key={term}
                  className='rounded-full border border-white/15 px-2 py-1 text-white/80 hover:bg-white/10'
                  onClick={() => {
                    setQuery(term)
                    updateParam('q', term)
                    trackEvent('search_used', { kind, query: term })
                  }}
                >
                  {term}
                </button>
              ))}
            </div>
            {!query && (
              <p className='text-xs text-white/60'>
                Try searching for… {SEARCH_SUGGESTIONS.join(', ')}.
              </p>
            )}
            {query.trim().length > 0 && (
              <div className='rounded-xl border border-white/10 bg-white/[0.03] p-3'>
                <p className='text-xs uppercase tracking-[0.13em] text-white/60'>Top matches</p>
                <ul className='mt-2 space-y-1 text-sm text-white/85'>
                  {topMatches.map(item => (
                    <li key={item.slug}>
                      {item.common || item.scientific || item.name || item.slug}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
              <select
                value={effectFilter}
                onChange={event => {
                  const next = event.target.value
                  setEffectFilter(next)
                  updateParam('effect', next)
                }}
                className='rounded-xl border border-white/15 bg-black/25 px-3 py-2 text-sm text-white'
              >
                <option value='all'>All effects</option>
                {options.effects.map(option => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <select
                value={tagFilter}
                onChange={event => {
                  const next = event.target.value
                  setTagFilter(next)
                  updateParam('tag', next)
                }}
                className='rounded-xl border border-white/15 bg-black/25 px-3 py-2 text-sm text-white'
              >
                <option value='all'>All tags</option>
                {options.tags.map(option => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <select
                value={intensityFilter}
                onChange={event => setIntensityFilter(event.target.value)}
                className='rounded-xl border border-white/15 bg-black/25 px-3 py-2 text-sm text-white'
              >
                <option value='all'>All intensity levels</option>
                {options.intensities.map(option => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <select
                value={categoryFilter}
                onChange={event => setCategoryFilter(event.target.value)}
                className='rounded-xl border border-white/15 bg-black/25 px-3 py-2 text-sm text-white sm:col-span-2 lg:col-span-3'
              >
                <option value='all'>All classifications</option>
                {options.categories.map(option => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className='mt-6'>
            <StatBadges
              stats={[
                { label: 'psychoactive herbs', value: counters.herbCount },
                { label: 'active compounds', value: counters.compoundCount },
                { label: 'articles', value: counters.articleCount },
              ]}
            />
          </div>
        </section>

        <section className='ds-section ds-stack pb-8'>
          {filtered.map((item, index) => (
            <DatabaseHerbCard
              key={item.slug ?? item.id ?? `${kind}-${index}`}
              herb={item}
              kind={kind}
            />
          ))}
          {!filtered.length && (
            <div className='ds-card-lg text-center text-white/80'>
              No {kind === 'herb' ? 'herbs' : 'compounds'} match that search.
            </div>
          )}
        </section>
      </main>

      {enableAdvancedFilters && (
        <AdvancedSearch
          open={advancedOpen}
          onClose={() => setAdvancedOpen(false)}
          onApply={res => {
            const next = res as Herb[]
            setAdvancedResults(next.length === items.length ? null : next)
            setAdvancedOpen(false)
          }}
        />
      )}
    </ErrorBoundary>
  )
}
