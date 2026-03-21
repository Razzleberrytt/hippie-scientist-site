import { useMemo, useState } from 'react'
import Meta from './Meta'
import ErrorBoundary from './ErrorBoundary'
import DatabaseHerbCard from './DatabaseHerbCard'
import AdvancedSearch from './AdvancedSearch'
import StatBadges from './StatBadges'
import type { Herb } from '@/types'

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

export default function EntityDatabasePage({
  title,
  description,
  metaPath,
  items,
  kind,
  counters,
  enableAdvancedFilters = false,
}: EntityDatabasePageProps) {
  const [query, setQuery] = useState('')
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const [advancedResults, setAdvancedResults] = useState<Herb[] | null>(null)
  const [effectFilter, setEffectFilter] = useState('all')
  const [intensityFilter, setIntensityFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')

  const scopedItems = useMemo(
    () => (enableAdvancedFilters ? (advancedResults ?? items) : items),
    [advancedResults, enableAdvancedFilters, items]
  )

  const options = useMemo(() => {
    const effectSet = new Set<string>()
    const intensitySet = new Set<string>()
    const categorySet = new Set<string>()

    items.forEach(item => {
      ;(item.pharmCategories || []).forEach(entry => effectSet.add(String(entry)))
      ;(item.tags || []).forEach(entry => {
        if (!entry?.startsWith('🧪')) effectSet.add(String(entry))
      })

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
    }
  }, [items])

  const filtered = useMemo(() => {
    const q = String(query || '')
      .trim()
      .toLowerCase()
    const queryFiltered = q
      ? scopedItems.filter(item => {
          const haystack = [
            item.common,
            item.scientific,
            item.description,
            item.effects,
            (item.tags || []).join(' '),
            (item.compounds || []).join(' '),
          ]
            .join(' ')
            .toLowerCase()
          return haystack.includes(q)
        })
      : scopedItems

    if (kind !== 'herb') return queryFiltered

    return queryFiltered.filter(item => {
      if (effectFilter !== 'all') {
        const effects = [...(item.pharmCategories || []), ...(item.tags || []), item.effects || '']
          .join(' ')
          .toLowerCase()
        if (!effects.includes(effectFilter.toLowerCase())) return false
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
  }, [scopedItems, query, kind, effectFilter, intensityFilter, categoryFilter])

  const results = filtered

  return (
    <ErrorBoundary>
      <Meta title={`${title} | The Hippie Scientist`} description={description} path={metaPath} />
      <main className='container mx-auto max-w-5xl space-y-6 px-4 py-6'>
        <section className='rounded-[28px] border border-white/10 bg-white/[0.03] p-6 text-white shadow-[0_20px_80px_-20px_rgba(0,0,0,0.6)] backdrop-blur-xl md:p-8'>
          <h1 className='text-4xl font-extrabold tracking-tight text-white sm:text-5xl'>{title}</h1>
          <p className='mt-2 text-white/85'>{description}</p>

          {enableAdvancedFilters && (
            <div className='mt-4 flex flex-wrap items-center gap-2'>
              {advancedResults && (
                <button
                  type='button'
                  className='inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-3 py-1.5 text-sm text-white transition hover:bg-white/15'
                  onClick={() => setAdvancedResults(null)}
                >
                  Clear advanced filters
                </button>
              )}
              <button
                type='button'
                className='inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-3 py-1.5 text-sm text-white transition hover:bg-white/15'
                onClick={() => setAdvancedOpen(true)}
              >
                Advanced search
              </button>
            </div>
          )}

          <div className='mt-5 space-y-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-xl'>
            <div className='flex flex-wrap items-center gap-3'>
              <input
                id={`${kind}-search-input`}
                className='min-w-0 flex-1 rounded-2xl border border-white/15 bg-black/30 px-4 py-2 text-sm text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/30'
                placeholder={`Search ${kind === 'herb' ? 'herbs' : 'compounds'}, effects…`}
                value={query}
                onChange={event => setQuery(event.target.value)}
              />
              <span className='text-sm text-white/70'>{results.length} results</span>
            </div>
            {kind === 'herb' && (
              <div className='grid gap-2 sm:grid-cols-3'>
                <select
                  value={effectFilter}
                  onChange={event => setEffectFilter(event.target.value)}
                  className='rounded-xl border border-white/15 bg-black/25 px-3 py-2 text-sm text-white'
                  aria-label='Filter by key effect'
                >
                  <option value='all'>All effects</option>
                  {options.effects.map(option => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <select
                  value={intensityFilter}
                  onChange={event => setIntensityFilter(event.target.value)}
                  className='rounded-xl border border-white/15 bg-black/25 px-3 py-2 text-sm text-white'
                  aria-label='Filter by intensity'
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
                  className='rounded-xl border border-white/15 bg-black/25 px-3 py-2 text-sm text-white'
                  aria-label='Filter by classification'
                >
                  <option value='all'>All classifications</option>
                  {options.categories.map(option => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <StatBadges
            stats={[
              { label: 'psychoactive herbs', value: counters.herbCount },
              { label: 'active compounds', value: counters.compoundCount },
              { label: 'articles', value: counters.articleCount },
            ]}
          />
        </section>

        <section className='space-y-4 pb-8'>
          {results.map((item, index) => (
            <DatabaseHerbCard
              key={item.slug ?? item.id ?? `${kind}-${index}`}
              herb={item}
              kind={kind}
            />
          ))}
          {!results.length && (
            <div className='rounded-[28px] border border-white/10 bg-white/[0.03] p-6 text-center text-white/80 shadow-[0_20px_80px_-20px_rgba(0,0,0,0.6)] backdrop-blur-xl'>
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
