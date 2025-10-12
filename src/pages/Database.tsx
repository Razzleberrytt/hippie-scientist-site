import { useMemo, useState } from 'react'
import Meta from '../components/Meta'
import ErrorBoundary from '../components/ErrorBoundary'
import DatabaseHerbCard from '../components/DatabaseHerbCard'
import AdvancedSearch from '../components/AdvancedSearch'
import StatRow from '../components/StatRow'
import type { Herb } from '../types'
import herbsData from '../data/herbs/herbs.normalized.json'
import { decorateHerbs } from '../lib/herbs'
import { ENABLE_ADVANCED_FILTERS } from '../config/ui'
import { siteStats } from '../lib/stats'

const decoratedHerbs = decorateHerbs(herbsData as Herb[])

export default function Database() {
  const herbs = decoratedHerbs
  const [query, setQuery] = useState('')
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const [advancedResults, setAdvancedResults] = useState<Herb[] | null>(null)

  const scopedHerbs = useMemo(() => advancedResults ?? herbs, [advancedResults, herbs])

  const filtered = useMemo(() => {
    const q = String(query || '').trim().toLowerCase()
    return scopedHerbs.filter(herb => {
      if (!q) return true
      const haystack = [
        herb.common,
        herb.scientific,
        herb.description,
        herb.effects,
        (herb.tags || []).join(' '),
        (herb.compounds || []).join(' '),
      ]
        .join(' ')
        .toLowerCase()
      return haystack.includes(q)
    })
  }, [scopedHerbs, query])

  const results = filtered

  return (
    <ErrorBoundary>
      <Meta
        title='Herb Database | The Hippie Scientist'
        description='Browse psychoactive herb profiles with scientific and cultural context.'
        path='/database'
      />
      <div className='container-safe py-16 sm:py-24'>
        <section className='glass p-6 sm:p-8 md:p-10'>
          <h1 className='text-4xl sm:text-5xl font-extrabold tracking-tight mb-2'>Herb Database</h1>
          <p className='text-neutral-100/70'>Search and explore the library.</p>

          {ENABLE_ADVANCED_FILTERS && (
            <div className='mt-4 flex flex-wrap items-center gap-2'>
              {advancedResults && (
                <button
                  type='button'
                  className='pill border border-white/10 bg-white/10 text-white hover:bg-white/15'
                  onClick={() => setAdvancedResults(null)}
                >
                  Clear advanced filters
                </button>
              )}
              <button
                type='button'
                className='pill border border-white/10 bg-white/10 text-white hover:bg-white/15'
                onClick={() => setAdvancedOpen(true)}
              >
                Advanced search
              </button>
            </div>
          )}

          <div className='mt-4 rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-lg sm:p-4'>
            <label className='sr-only' htmlFor='herb-search-input'>
              Search herbs
            </label>
            <div className='flex flex-wrap items-center gap-3'>
              <input
                id='herb-search-input'
                className='flex-1 rounded-full border border-white/20 bg-black/20 px-4 py-2 text-sm text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/30'
                placeholder='Search herbs, compounds, effects…'
                value={query}
                onChange={event => setQuery(event.target.value)}
              />
              <span className='text-sm text-white/70'>{results.length} results</span>
            </div>
          </div>

          <StatRow
            herbs={siteStats.herbs}
            compounds={siteStats.compounds}
            posts={siteStats.posts}
            className='mt-6'
          />
        </section>

        <div className='mt-8 space-y-4 sm:space-y-6'>
          {results.map((herb, index) => (
            <DatabaseHerbCard key={herb.slug ?? herb.id ?? `herb-${index}`} herb={herb} />
          ))}
          {!results.length && (
            <div className='glass p-5 text-center text-neutral-100/70 sm:p-6'>
              No herbs match that search.
            </div>
          )}
        </div>
      </div>

      {ENABLE_ADVANCED_FILTERS && (
        <AdvancedSearch
          open={advancedOpen}
          onClose={() => setAdvancedOpen(false)}
          onApply={res => {
            const next = res as Herb[]
            setAdvancedResults(next.length === herbs.length ? null : next)
            setAdvancedOpen(false)
          }}
        />
      )}
    </ErrorBoundary>
  )
}
