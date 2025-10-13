import { useMemo, useState } from 'react'
import Meta from '../components/Meta'
import ErrorBoundary from '../components/ErrorBoundary'
import DatabaseHerbCard from '../components/DatabaseHerbCard'
import AdvancedSearch from '../components/AdvancedSearch'
import Stats from '@/components/Stats'
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
      <main className='mx-auto max-w-screen-md w-full px-4 py-6 space-y-6'>
        <section className='relative overflow-hidden rounded-3xl bg-white/6 backdrop-blur-xl ring-1 ring-white/15 shadow-[inset_0_1px_0_rgba(255,255,255,.25),0_20px_40px_-20px_rgba(0,0,0,.6)]'>
          <div aria-hidden className='pointer-events-none absolute inset-0 rounded-3xl'>
            <div className='absolute inset-px rounded-[calc(theme(borderRadius.3xl)-1px)] bg-gradient-to-br from-white/12 via-white/6 to-white/2' />
          </div>
          <div className='relative p-6 sm:p-8'>
            <h1 className='text-4xl font-extrabold tracking-tight text-white sm:text-5xl'>Herb Database</h1>
            <p className='mt-2 text-white/75'>Search and explore the library.</p>

            {ENABLE_ADVANCED_FILTERS && (
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

            <div className='mt-5 rounded-2xl border border-white/12 bg-white/5 p-4 backdrop-blur-xl'>
              <label className='sr-only' htmlFor='herb-search-input'>
                Search herbs
              </label>
              <div className='flex flex-wrap items-center gap-3'>
                <input
                  id='herb-search-input'
                  className='min-w-0 flex-1 rounded-2xl border border-white/15 bg-black/30 px-4 py-2 text-sm text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/30'
                  placeholder='Search herbs, compounds, effects…'
                  value={query}
                  onChange={event => setQuery(event.target.value)}
                />
                <span className='text-sm text-white/70'>{results.length} results</span>
              </div>
            </div>

            <div className='mt-6'>
              <Stats
                items={[
                  { value: siteStats.herbs, label: 'psychoactive herbs' },
                  { value: siteStats.compounds, label: 'active compounds' },
                  { value: siteStats.posts, label: 'articles' },
                ]}
              />
            </div>
          </div>
        </section>

        <section className='space-y-4 pb-8'>
          {results.map((herb, index) => (
            <DatabaseHerbCard key={herb.slug ?? herb.id ?? `herb-${index}`} herb={herb} />
          ))}
          {!results.length && (
            <div className='rounded-3xl border border-white/12 bg-white/5 p-6 text-center text-white/75 backdrop-blur-xl'>
              No herbs match that search.
            </div>
          )}
        </section>
      </main>

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
