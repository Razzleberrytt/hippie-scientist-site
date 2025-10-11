import { useMemo, useState } from 'react'
import Meta from '../components/Meta'
import ErrorBoundary from '../components/ErrorBoundary'
import DatabaseHerbCard from '../components/DatabaseHerbCard'
import AdvancedSearch from '../components/AdvancedSearch'
import type { Herb } from '../types'
import herbsData from '../data/herbs/herbs.normalized.json'
import { decorateHerbs } from '../lib/herbs'
import { ENABLE_ADVANCED_FILTERS } from '../config/ui'

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
      <div className="pt-6 md:pt-8 pb-10">
        <section className="mx-auto max-w-6xl px-4 pt-6 md:pt-8 pb-4">
          <h1 className="text-3xl md:text-4xl font-bold">Herb Database</h1>
          <p className="mt-2 text-white/70">Search and explore the library.</p>

          <div className="mt-4 flex flex-col gap-3">
            {ENABLE_ADVANCED_FILTERS && (
              <div className="flex flex-wrap items-center gap-2">
                {advancedResults && (
                  <button
                    type="button"
                    className="rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-sm text-white/80 transition hover:bg-white/20"
                    onClick={() => setAdvancedResults(null)}
                  >
                    Clear advanced filters
                  </button>
                )}
                <button
                  type="button"
                  className="rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-sm text-white/80 transition hover:bg-white/20"
                  onClick={() => setAdvancedOpen(true)}
                >
                  Advanced search
                </button>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-md">
              <label className="sr-only" htmlFor="herb-search-input">
                Search herbs
              </label>
              <input
                id="herb-search-input"
                className="flex-1 rounded-xl border border-white/10 bg-black/20 px-4 py-2 text-sm text-white/90 placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/20"
                placeholder="Search herbs, compounds, effects…"
                value={query}
                onChange={event => setQuery(event.target.value)}
              />
              <span className="text-sm text-white/60">{results.length} results</span>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-10">
          <div className="grid gap-4 md:gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((herb, index) => (
              <DatabaseHerbCard key={herb.slug ?? herb.id ?? `herb-${index}`} herb={herb} />
            ))}
            {!results.length && (
              <div className="col-span-full rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-white/60 backdrop-blur-sm">
                No herbs match that search.
              </div>
            )}
          </div>
        </section>

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
      </div>
    </ErrorBoundary>
  )
}
