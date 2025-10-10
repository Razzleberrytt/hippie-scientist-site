import { useMemo, useState } from 'react'
import Meta from '../components/Meta'
import ErrorBoundary from '../components/ErrorBoundary'
import DatabaseHerbCard from '../components/DatabaseHerbCard'
import AdvancedSearch from '../components/AdvancedSearch'
import type { Herb } from '../types'
import herbsData from '../data/herbs/herbs.normalized.json'
import { ENABLE_ADVANCED_FILTERS } from '../config/ui'

export default function Database() {
  const herbs = herbsData as Herb[]
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
      <main className="container space-y-4 py-6">
        <header className="flex flex-col gap-3 pt-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="h1 bg-gradient-to-r from-lime-300 via-cyan-300 to-pink-400 bg-clip-text text-transparent">
              Herb Database
            </h1>
            <p className="small text-white/70">Search and explore the library.</p>
          </div>
          {ENABLE_ADVANCED_FILTERS && (
            <div className="flex flex-wrap items-center gap-2">
              {advancedResults && (
                <button
                  type="button"
                  className="rounded-lg border border-rose-300/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-100 transition hover:bg-rose-500/20"
                  onClick={() => setAdvancedResults(null)}
                >
                  Clear advanced filters
                </button>
              )}
              <button
                type="button"
                className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm transition hover:bg-white/10"
                onClick={() => setAdvancedOpen(true)}
              >
                Advanced search
              </button>
            </div>
          )}
        </header>

        <div
          className="sticky z-30"
          style={{
            top: "3.25rem",
            borderBottom: "1px solid var(--border-c)",
            background: "color-mix(in oklab, var(--bg-c) 85%, transparent 15%)",
            backdropFilter: "blur(6px)",
          }}
        >
          <div className="container py-3 flex items-center gap-3">
            <label className="sr-only" htmlFor="herb-search-input">
              Search herbs
            </label>
            <input
              id="herb-search-input"
              className="input focus-glow flex-1"
              placeholder="Search herbs, compounds, effects…"
              value={query}
              onChange={event => setQuery(event.target.value)}
            />
            <span className="text-sm" style={{ color: "var(--muted-c)" }}>
              {results.length} results
            </span>
          </div>
        </div>
        <div className="h-2" />

        <section className="grid gap-4 mt-6 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((herb, index) => (
            <DatabaseHerbCard key={herb.slug ?? herb.id ?? `herb-${index}`} herb={herb} />
          ))}
          {!results.length && (
            <div className="blur-panel p-6 text-center text-sub col-span-full">
              No herbs match that search.
            </div>
          )}
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
      </main>
    </ErrorBoundary>
  )
}
