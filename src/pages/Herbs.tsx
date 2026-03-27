import { useEffect, useMemo, useState } from 'react'
import Meta from '@/components/Meta'
import HerbCard from '@/components/HerbCard'
import ActiveFiltersBar from '@/components/filters/ActiveFiltersBar'
import ConfidenceFilter from '@/components/filters/ConfidenceFilter'
import EffectFilter from '@/components/filters/EffectFilter'
import SearchBar from '@/components/filters/SearchBar'
import SortSelect from '@/components/filters/SortSelect'
import TypeFilter from '@/components/filters/TypeFilter'
import { useHerbData } from '@/lib/herb-data'
import { decorateHerbs } from '@/lib/herbs'
import { useUrlFilterState } from '@/hooks/useUrlFilterState'
import { filterHerbs } from '@/utils/filterHerbs'
import { DEFAULT_FILTER_STATE } from '@/utils/filterModel'
import { extractFilterOptions } from '@/utils/extractFilterOptions'
import { buildEffectIndex } from '@/utils/effectSearch'
import EffectExplorer from '@/components/EffectExplorer'

export default function HerbsPage() {
  const INITIAL_RESULTS = 18
  const LOAD_MORE_STEP = 18
  const herbs = useHerbData()
  const decoratedHerbs = useMemo(() => decorateHerbs(herbs), [herbs])
  const [filters, setFilters] = useUrlFilterState(DEFAULT_FILTER_STATE)
  const [visibleCount, setVisibleCount] = useState(INITIAL_RESULTS)
  const [showEffectExplorer, setShowEffectExplorer] = useState(false)

  const options = useMemo(() => extractFilterOptions({ herbs: decoratedHerbs }), [decoratedHerbs])
  const effectIndex = useMemo(() => buildEffectIndex(decoratedHerbs), [decoratedHerbs])
  const filtered = useMemo(() => filterHerbs(decoratedHerbs, filters), [decoratedHerbs, filters])
  const visibleHerbs = useMemo(() => filtered.slice(0, visibleCount), [filtered, visibleCount])
  const hasMore = filtered.length > visibleCount
  const performanceMode = filtered.length > 24

  useEffect(() => {
    setVisibleCount(INITIAL_RESULTS)
  }, [filters])

  const toggleEffect = (effect: string) => {
    setFilters(prev => ({
      ...prev,
      selectedEffects: prev.selectedEffects.includes(effect)
        ? prev.selectedEffects.filter(item => item !== effect)
        : [...prev.selectedEffects, effect],
    }))
  }

  const clearAll = () => setFilters(DEFAULT_FILTER_STATE)

  return (
    <main className='container mx-auto max-w-6xl px-4 py-8 text-white'>
      <Meta
        title='Herb Knowledge Database | The Hippie Scientist'
        description='Search effects, classification, confidence, and safety context across the herb library.'
        path='/herbs'
      />

      <header className='ds-card-lg mb-6'>
        <h1 className='text-3xl font-semibold sm:text-4xl'>Herb Knowledge Database</h1>
        <p className='mt-3 max-w-3xl text-white/80'>
          Search and filter herbs by effect tags, confidence, and class to quickly compare entries.
        </p>
      </header>

      <section className='mb-4 rounded-2xl border border-violet-300/25 bg-violet-500/10 p-4'>
        <div className='flex flex-wrap items-center justify-between gap-3'>
          <div>
            <h2 className='text-lg font-semibold text-violet-100'>Effect Explorer</h2>
            <p className='text-sm text-white/75'>
              Open on demand for ranked matches by outcome (sleep, focus, relaxation).
            </p>
          </div>
          <button
            type='button'
            className='btn-secondary'
            onClick={() => setShowEffectExplorer(value => !value)}
            aria-expanded={showEffectExplorer}
          >
            {showEffectExplorer ? 'Hide explorer' : 'Open explorer'}
          </button>
        </div>
        {showEffectExplorer && <EffectExplorer herbs={decoratedHerbs} />}
      </section>

      <section className='mb-4 space-y-3'>
        <SearchBar
          value={filters.query}
          onChange={value => setFilters(prev => ({ ...prev, query: value }))}
          placeholder='Search herbs, effects, compounds...'
        />

        <div className='grid gap-3 lg:grid-cols-3'>
          <ConfidenceFilter
            value={filters.confidence}
            onChange={value => setFilters(prev => ({ ...prev, confidence: value }))}
          />
          <TypeFilter
            label='Class'
            options={options.classes}
            value={filters.type}
            onChange={value => setFilters(prev => ({ ...prev, type: value }))}
          />
          <SortSelect
            value={filters.sort}
            onChange={value => setFilters(prev => ({ ...prev, sort: value }))}
          />
        </div>

        <EffectFilter
          options={options.effects}
          selected={filters.selectedEffects}
          onToggle={toggleEffect}
        />

        <ActiveFiltersBar
          state={filters}
          typeLabel='Class'
          onRemoveEffect={toggleEffect}
          onClear={clearAll}
          onClearQuery={() => setFilters(prev => ({ ...prev, query: '' }))}
          onClearType={() => setFilters(prev => ({ ...prev, type: 'all' }))}
          onClearConfidence={() => setFilters(prev => ({ ...prev, confidence: 'all' }))}
        />
      </section>

      <p className='mb-4 text-sm text-white/70'>
        {filtered.length} results · {effectIndex.size} indexed effects
      </p>

      {filtered.length === 0 ? (
        <div className='rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center text-white/80'>
          No herbs match your current filters.
        </div>
      ) : (
        <section className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          {visibleHerbs.map((herb, index) => (
            <HerbCard
              key={herb.slug || herb.id || `${herb.common}-${index}`}
              herb={herb}
              index={index}
              performanceMode={performanceMode}
            />
          ))}
        </section>
      )}
      {hasMore && (
        <div className='mt-6 flex justify-center'>
          <button
            type='button'
            className='btn-primary'
            onClick={() => setVisibleCount(prev => prev + LOAD_MORE_STEP)}
          >
            Load more herbs ({filtered.length - visibleCount} remaining)
          </button>
        </div>
      )}
    </main>
  )
}
