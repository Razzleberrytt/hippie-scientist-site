import { useMemo, useState } from 'react'
import SEO from '../components/SEO'
import ErrorBoundary from '../components/ErrorBoundary'
import HerbCard from '../components/HerbCard'
import type { Herb } from '../types'
import herbsData from '../data/herbs/herbs.normalized.json'
import { ENABLE_ADVANCED_FILTERS } from '../config/ui'

export default function Database() {
  const herbs = herbsData as Herb[]
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = String(query || '').trim().toLowerCase()
    return herbs.filter(herb => {
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
  }, [herbs, query])

  const results = filtered

  return (
    <ErrorBoundary>
      <SEO
        title="Herb Database | The Hippie Scientist"
        description="Browse psychoactive herb profiles with scientific and cultural context."
        canonical="https://thehippiescientist.net/database"
      />
      <main className="container space-y-4 py-6">
        <header className="pt-2">
          <h1 className="h1 bg-gradient-to-r from-lime-300 via-cyan-300 to-pink-400 bg-clip-text text-transparent">
            Herb Database
          </h1>
          <p className="small text-white/70">Search and explore the library.</p>
        </header>

        <section className="blur-panel rounded-2xl p-3 flex items-center gap-3 sticky top-[56px] z-20">
          <label className="sr-only" htmlFor="herb-search-input">
            Search herbs
          </label>
          <input
            id="herb-search-input"
            className="w-full rounded-lg px-3 py-2 bg-white/10 border border-white/10 placeholder-white/50"
            placeholder="Search herbs, compounds, effects…"
            value={query}
            onChange={event => setQuery(event.target.value)}
          />
          <span className="small text-white/65 whitespace-nowrap">{results.length} results</span>
        </section>

        {ENABLE_ADVANCED_FILTERS && (
          <section className="blur-panel rounded-2xl p-3">
            {/* (old facets UI would render here) */}
          </section>
        )}

        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {results.map((herb, index) => (
            <HerbCard key={herb.id ?? index} herb={herb} index={index} />
          ))}
          {!results.length && (
            <div className="blur-panel p-6 text-center text-sub col-span-full">
              No herbs match that search.
            </div>
          )}
        </section>
      </main>
    </ErrorBoundary>
  )
}
