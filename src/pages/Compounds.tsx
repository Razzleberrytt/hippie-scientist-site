import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import Meta from '@/components/Meta'
import ActiveFiltersBar from '@/components/filters/ActiveFiltersBar'
import ConfidenceFilter from '@/components/filters/ConfidenceFilter'
import EffectFilter from '@/components/filters/EffectFilter'
import SearchBar from '@/components/filters/SearchBar'
import SortSelect from '@/components/filters/SortSelect'
import TypeFilter from '@/components/filters/TypeFilter'
import { useCompoundData } from '@/lib/compound-data'
import {
  computeConfidenceLevel,
  confidenceBadgeClass,
  extractPrimaryEffects,
} from '@/lib/dataTrust'
import { useUrlFilterState } from '@/hooks/useUrlFilterState'
import { filterCompounds } from '@/utils/filterCompounds'
import { DEFAULT_FILTER_STATE } from '@/utils/filterModel'
import { extractFilterOptions } from '@/utils/extractFilterOptions'

function summarize(compound: { description: string; effects: string[] }) {
  if (compound.description) return compound.description
  if (compound.effects.length) return compound.effects.slice(0, 2).join(' · ')
  return 'Mechanism and effects are still being researched.'
}

export default function CompoundsPage() {
  const compounds = useCompoundData()
  const [filters, setFilters] = useUrlFilterState(DEFAULT_FILTER_STATE)

  const options = useMemo(() => extractFilterOptions({ compounds }), [compounds])
  const filtered = useMemo(() => filterCompounds(compounds, filters), [compounds, filters])

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
        title='Compound Reference | The Hippie Scientist'
        description='Explore active compounds, associated herbs, and safety context.'
        path='/compounds'
      />

      <header className='ds-card-lg mb-6'>
        <h1 className='text-3xl font-semibold sm:text-4xl'>Compounds</h1>
        <p className='mt-3 max-w-3xl text-white/80'>
          Search compounds by mechanism and effects, then filter by confidence and category.
        </p>
      </header>

      <section className='mb-4 space-y-3'>
        <SearchBar
          value={filters.query}
          onChange={value => setFilters(prev => ({ ...prev, query: value }))}
          placeholder='Search compounds, effects, mechanisms...'
        />

        <div className='grid gap-3 lg:grid-cols-3'>
          <ConfidenceFilter
            value={filters.confidence}
            onChange={value => setFilters(prev => ({ ...prev, confidence: value }))}
          />
          <TypeFilter
            label='Category'
            options={options.categories}
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
          typeLabel='Category'
          onRemoveEffect={toggleEffect}
          onClear={clearAll}
          onClearQuery={() => setFilters(prev => ({ ...prev, query: '' }))}
          onClearType={() => setFilters(prev => ({ ...prev, type: 'all' }))}
          onClearConfidence={() => setFilters(prev => ({ ...prev, confidence: 'all' }))}
        />
      </section>

      <p className='mb-4 text-sm text-white/70'>{filtered.length} results</p>

      {filtered.length === 0 ? (
        <div className='rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center text-white/80'>
          No compounds match your current filters.
        </div>
      ) : (
        <section className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          {filtered.map(compound => {
            const confidence = computeConfidenceLevel({
              mechanism: compound.mechanism,
              effects: compound.effects,
              compounds: compound.herbs,
            })
            const primaryEffects = extractPrimaryEffects(compound.effects, 3)

            return (
              <article key={compound.id} className='ds-card-lg flex h-full flex-col'>
                <div className='flex flex-wrap items-start justify-between gap-2'>
                  <h2 className='text-xl font-semibold'>{compound.name}</h2>
                  <span
                    className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${confidenceBadgeClass(confidence)}`}
                  >
                    {confidence}
                  </span>
                </div>
                <p className='mt-2 line-clamp-4 flex-1 text-sm text-white/85'>
                  {summarize(compound)}
                </p>
                {primaryEffects.length > 0 && (
                  <div className='mt-3 flex flex-wrap gap-1.5'>
                    {primaryEffects.map(effect => (
                      <span
                        key={`${compound.id}-${effect}`}
                        className='rounded-full border border-violet-300/35 bg-violet-500/15 px-2.5 py-1 text-[11px] text-violet-100'
                      >
                        {effect}
                      </span>
                    ))}
                  </div>
                )}
                {confidence === 'Low' && (
                  <p className='mt-3 rounded-lg border border-amber-300/35 bg-amber-500/10 px-3 py-2 text-xs text-amber-100'>
                    Data incomplete: mechanism/effects links are still sparse.
                  </p>
                )}
                <p className='mt-3 text-xs text-white/80'>
                  {compound.herbs.length} {compound.herbs.length === 1 ? 'herb' : 'herbs'}{' '}
                  associated
                </p>
                <Link to={`/compounds/${compound.slug}`} className='btn-primary mt-4 w-fit'>
                  View details
                </Link>
              </article>
            )
          })}
        </section>
      )}
    </main>
  )
}
