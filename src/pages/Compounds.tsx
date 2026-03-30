import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Meta from '@/components/Meta'
import ActiveFiltersBar from '@/components/filters/ActiveFiltersBar'
import ConfidenceFilter from '@/components/filters/ConfidenceFilter'
import EffectFilter from '@/components/filters/EffectFilter'
import SearchBar from '@/components/filters/SearchBar'
import SortSelect from '@/components/filters/SortSelect'
import TypeFilter from '@/components/filters/TypeFilter'
import { useCompoundData } from '@/lib/compound-data'
import { extractPrimaryEffects } from '@/lib/dataTrust'
import { useUrlFilterState } from '@/hooks/useUrlFilterState'
import { filterCompounds } from '@/utils/filterCompounds'
import { DEFAULT_FILTER_STATE } from '@/utils/filterModel'
import { extractFilterOptions } from '@/utils/extractFilterOptions'
import { calculateCompoundConfidence, type ConfidenceLevel } from '@/utils/calculateConfidence'
import type { EnrichmentFilter } from '@/types/enrichmentDiscovery'

const ENRICHMENT_FILTER_OPTIONS: Array<{ value: EnrichmentFilter; label: string }> = [
  { value: 'all', label: 'All research states' },
  { value: 'enriched_reviewed', label: 'Enriched & reviewed' },
  { value: 'has_human_evidence', label: 'Has human evidence' },
  { value: 'safety_cautions', label: 'Safety cautions present' },
  { value: 'traditional_only', label: 'Traditional-use only' },
  { value: 'conflicting_evidence', label: 'Conflicting evidence' },
]

function confidenceBadgeClass(level: ConfidenceLevel) {
  if (level === 'high')
    return 'border-emerald-300/50 bg-emerald-500/15 text-emerald-100 shadow-[0_0_18px_rgba(16,185,129,0.35)]'
  if (level === 'medium')
    return 'border-amber-300/45 bg-amber-500/15 text-amber-100 shadow-[0_0_18px_rgba(245,158,11,0.35)]'
  return 'border-rose-300/50 bg-rose-500/15 text-rose-100 shadow-[0_0_18px_rgba(244,63,94,0.35)]'
}

function summarize(compound: { description: string; effects: string[] }) {
  if (compound.description) return compound.description
  if (compound.effects.length) return compound.effects.slice(0, 2).join(' · ')
  return 'Mechanism and effects are still being researched.'
}

export default function CompoundsPage() {
  const INITIAL_RESULTS = 18
  const LOAD_MORE_STEP = 18
  const compounds = useCompoundData()
  const [filters, setFilters] = useUrlFilterState(DEFAULT_FILTER_STATE)
  const [visibleCount, setVisibleCount] = useState(INITIAL_RESULTS)

  const options = useMemo(() => extractFilterOptions({ compounds }), [compounds])
  const filtered = useMemo(() => filterCompounds(compounds, filters), [compounds, filters])
  const visibleCompounds = useMemo(() => filtered.slice(0, visibleCount), [filtered, visibleCount])
  const hasMore = filtered.length > visibleCount

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
        <TypeFilter
          label='Research signal'
          options={ENRICHMENT_FILTER_OPTIONS.map(option => option.label)}
          value={ENRICHMENT_FILTER_OPTIONS.find(option => option.value === filters.enrichment)?.label || ENRICHMENT_FILTER_OPTIONS[0].label}
          onChange={label => {
            const next = ENRICHMENT_FILTER_OPTIONS.find(option => option.label === label)
            setFilters(prev => ({ ...prev, enrichment: next?.value || 'all' }))
          }}
        />

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
          onClearEnrichment={() => setFilters(prev => ({ ...prev, enrichment: 'all' }))}
          enrichmentLabel={
            ENRICHMENT_FILTER_OPTIONS.find(option => option.value === filters.enrichment)?.label
          }
        />
      </section>

      <p className='mb-4 text-sm text-white/70'>{filtered.length} results</p>

      {filtered.length === 0 ? (
        <div className='rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center text-white/80'>
          No compounds match your current filters.
        </div>
      ) : (
        <section className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          {visibleCompounds.map(compound => {
            const confidence =
              compound.confidence ??
              calculateCompoundConfidence({
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
                {compound.researchEnrichmentSummary && (
                  <div className='mt-3 flex flex-wrap gap-1.5'>
                    <span className='rounded-full border border-cyan-300/35 bg-cyan-500/15 px-2.5 py-1 text-[11px] text-cyan-100'>
                      {compound.researchEnrichmentSummary.evidenceLabelTitle}
                    </span>
                    {compound.researchEnrichmentSummary.safetyCautionsPresent && (
                      <span className='rounded-full border border-amber-300/35 bg-amber-500/15 px-2.5 py-1 text-[11px] text-amber-100'>
                        Safety cautions noted
                      </span>
                    )}
                    {compound.researchEnrichmentSummary.conflictingEvidence && (
                      <span className='rounded-full border border-rose-300/35 bg-rose-500/15 px-2.5 py-1 text-[11px] text-rose-100'>
                        Conflicting evidence
                      </span>
                    )}
                    {compound.researchEnrichmentSummary.traditionalUseOnly && (
                      <span className='rounded-full border border-yellow-300/35 bg-yellow-500/15 px-2.5 py-1 text-[11px] text-yellow-100'>
                        Traditional-use context
                      </span>
                    )}
                  </div>
                )}
                {confidence === 'low' && (
                  <p className='mt-3 rounded-lg border border-amber-300/35 bg-amber-500/10 px-3 py-2 text-xs text-amber-100'>
                    ⚠️ This entry has limited verified data.
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
      {hasMore && (
        <div className='mt-6 flex justify-center'>
          <button
            type='button'
            className='btn-primary'
            onClick={() => setVisibleCount(prev => prev + LOAD_MORE_STEP)}
          >
            Load more compounds ({filtered.length - visibleCount} remaining)
          </button>
        </div>
      )}
    </main>
  )
}
