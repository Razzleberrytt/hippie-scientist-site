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
      <div className="aurora relative isolate min-h-screen text-text">
        <section className="relative z-20">
          <div className="mx-auto max-w-6xl px-4 pb-16 pt-6 sm:pt-8">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Herb Database</h1>
            <p className="mt-2 text-white/70">Search and explore the library.</p>

            {ENABLE_ADVANCED_FILTERS && (
              <div className="mt-4 flex flex-wrap items-center gap-2">
                {advancedResults && (
                  <button
                    type="button"
                    className="rounded-full border border-white/10 bg-card/60 px-4 py-2 text-sm font-medium text-text/80 shadow-soft transition hover:border-white/20 hover:bg-card/70"
                    onClick={() => setAdvancedResults(null)}
                  >
                    Clear advanced filters
                  </button>
                )}
                <button
                  type="button"
                  className="rounded-full border border-white/10 bg-card/70 px-4 py-2 text-sm font-medium text-text shadow-ring transition hover:border-white/20 hover:bg-card/80"
                  onClick={() => setAdvancedOpen(true)}
                >
                  Advanced search
                </button>
              </div>
            )}

            <div className="mt-4 rounded-2xl bg-card/70 p-2 shadow-ring ring-1 ring-white/10 sm:p-3">
              <label className="sr-only" htmlFor="herb-search-input">
                Search herbs
              </label>
              <div className="flex flex-wrap items-center gap-3">
                <input
                  id="herb-search-input"
                  className="flex-1 rounded-full border border-white/10 bg-black/30 px-4 py-2 text-sm text-text placeholder:text-text/50 focus:outline-none focus:ring-2 focus:ring-white/20"
                  placeholder="Search herbs, compounds, effects…"
                  value={query}
                  onChange={event => setQuery(event.target.value)}
                />
                <span className="text-sm text-mute">{results.length} results</span>
              </div>
            </div>

            <StatRow
              herbs={siteStats.herbs}
              compounds={siteStats.compounds}
              posts={siteStats.posts}
            />

            <div className="mt-6 space-y-4 sm:space-y-6">
              {results.map((herb, index) => (
                <DatabaseHerbCard key={herb.slug ?? herb.id ?? `herb-${index}`} herb={herb} />
              ))}
              {!results.length && (
                <div className="rounded-2xl bg-card/80 p-6 text-center text-text/70 shadow-soft ring-1 ring-white/10">
                  No herbs match that search.
                </div>
              )}
            </div>
          </div>
        </section>
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
