import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Link } from 'react-router-dom'
import Meta from '@/components/Meta'
import ActiveFiltersBar from '@/components/filters/ActiveFiltersBar'
import ConfidenceFilter from '@/components/filters/ConfidenceFilter'
import EffectFilter from '@/components/filters/EffectFilter'
import SearchBar from '@/components/filters/SearchBar'
import SortSelect from '@/components/filters/SortSelect'
import TypeFilter from '@/components/filters/TypeFilter'
import Collapse from '@/components/ui/Collapse'
import { useCompoundData } from '@/lib/compound-data'
import { extractPrimaryEffects } from '@/lib/dataTrust'
import { useUrlFilterState } from '@/hooks/useUrlFilterState'
import { filterCompounds } from '@/utils/filterCompounds'
import { DEFAULT_FILTER_STATE } from '@/utils/filterModel'
import { extractFilterOptions } from '@/utils/extractFilterOptions'
import { calculateCompoundConfidence, type ConfidenceLevel } from '@/utils/calculateConfidence'
import type { EnrichmentFilter } from '@/types/enrichmentDiscovery'
import { trackGovernedEvent } from '@/lib/governedAnalytics'
import { formatBrowseTitle } from '@/utils/titleDisplay'

const ENRICHMENT_FILTER_OPTIONS: Array<{ value: EnrichmentFilter; label: string }> = [
  { value: 'all', label: 'All research states' },
  { value: 'enriched_reviewed', label: 'Enriched & reviewed' },
  { value: 'reviewed_recently', label: 'Reviewed recently' },
  { value: 'human_clinical_or_limited', label: 'Human clinical/limited support' },
  { value: 'has_human_evidence', label: 'Has human evidence' },
  { value: 'safety_cautions', label: 'Safety cautions present' },
  { value: 'mechanism_or_constituent_coverage', label: 'Mechanism/constituent coverage' },
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
  useEffect(() => {
    trackGovernedEvent({
      type: 'governed_card_summary_visible',
      eventAction: 'visible',
      pageType: 'compounds_index',
      entityType: 'compound',
      surfaceId: 'compounds_search_index',
      componentType: 'browse_cards',
      item: String(filtered.length),
      reviewedStatus: 'not_applicable',
      freshnessState: 'not_applicable',
    })
  }, [filtered.length])

  const toggleEffect = (effect: string) => {
    setFilters(prev => ({
      ...prev,
      selectedEffects: prev.selectedEffects.includes(effect)
        ? prev.selectedEffects.filter(item => item !== effect)
        : [...prev.selectedEffects, effect],
    }))
    trackGovernedEvent({
      type: 'governed_browse_filter_change',
      eventAction: 'change',
      pageType: 'compounds_index',
      entityType: 'compound',
      surfaceId: 'compounds_search_index',
      componentType: 'effect_filter',
      item: effect,
      reviewedStatus: 'not_applicable',
      freshnessState: 'not_applicable',
    })
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
          onChange={value => {
            setFilters(prev => ({ ...prev, query: value }))
            trackGovernedEvent({
              type: 'governed_browse_filter_change',
              eventAction: 'change',
              pageType: 'compounds_index',
              entityType: 'compound',
              surfaceId: 'compounds_search_index',
              componentType: 'search_bar',
              item: value ? 'query:set' : 'query:clear',
              reviewedStatus: 'not_applicable',
              freshnessState: 'not_applicable',
            })
          }}
          placeholder='Search compounds, effects, mechanisms...'
        />

        <div className='grid gap-3 lg:grid-cols-2'>
          <ConfidenceFilter
            value={filters.confidence}
            onChange={value => {
              setFilters(prev => ({ ...prev, confidence: value }))
              trackGovernedEvent({
                type: 'governed_browse_filter_change',
                eventAction: 'change',
                pageType: 'compounds_index',
                entityType: 'compound',
                surfaceId: 'compounds_search_index',
                componentType: 'confidence_filter',
                item: value,
                reviewedStatus: 'not_applicable',
                freshnessState: 'not_applicable',
              })
            }}
          />
          <SortSelect
            value={filters.sort}
            onChange={value => {
              setFilters(prev => ({ ...prev, sort: value }))
              trackGovernedEvent({
                type: 'governed_browse_filter_change',
                eventAction: 'change',
                pageType: 'compounds_index',
                entityType: 'compound',
                surfaceId: 'compounds_search_index',
                componentType: 'sort_select',
                item: value,
                reviewedStatus: 'not_applicable',
                freshnessState: 'not_applicable',
              })
            }}
          />
        </div>
        <Collapse title='More filters'>
          <div className='space-y-3 pt-2'>
            <TypeFilter
              label='Category'
              options={options.categories}
              value={filters.type}
              onChange={value => {
                setFilters(prev => ({ ...prev, type: value }))
                trackGovernedEvent({
                  type: 'governed_browse_filter_change',
                  eventAction: 'change',
                  pageType: 'compounds_index',
                  entityType: 'compound',
                  surfaceId: 'compounds_search_index',
                  componentType: 'type_filter',
                  item: value,
                  reviewedStatus: 'not_applicable',
                  freshnessState: 'not_applicable',
                })
              }}
            />
            <TypeFilter
              label='Research signal'
              options={ENRICHMENT_FILTER_OPTIONS.map(option => option.label)}
              value={
                ENRICHMENT_FILTER_OPTIONS.find(option => option.value === filters.enrichment)
                  ?.label || ENRICHMENT_FILTER_OPTIONS[0].label
              }
              onChange={label => {
                const next = ENRICHMENT_FILTER_OPTIONS.find(option => option.label === label)
                setFilters(prev => ({ ...prev, enrichment: next?.value || 'all' }))
                trackGovernedEvent({
                  type: 'governed_browse_filter_change',
                  eventAction: 'change',
                  pageType: 'compounds_index',
                  entityType: 'compound',
                  surfaceId: 'compounds_search_index',
                  componentType: 'enrichment_filter',
                  item: next?.value || 'all',
                  reviewedStatus: 'not_applicable',
                  freshnessState: 'not_applicable',
                })
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
          </div>
        </Collapse>
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

            const title = formatBrowseTitle(compound.name, 58)
            const chips = [
              ...primaryEffects.map(effect => ({ label: effect, tone: 'effect' as const })),
              ...(compound.researchEnrichmentSummary
                ? [
                    {
                      label: compound.researchEnrichmentSummary.evidenceLabelTitle,
                      tone: 'evidence' as const,
                    },
                    ...(compound.researchEnrichmentSummary.safetyCautionsPresent
                      ? [{ label: 'Safety cautions', tone: 'warning' as const }]
                      : []),
                  ]
                : []),
            ].slice(0, 2)

            return (
              <article key={compound.id} className='ds-card flex h-full flex-col gap-2.5 p-3.5'>
                <div className='flex items-start justify-between gap-2'>
                  <h2
                    title={compound.name}
                    className='line-clamp-2 min-h-[2.5rem] break-all text-base font-semibold leading-tight'
                  >
                    {title}
                  </h2>
                  <span
                    className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${confidenceBadgeClass(confidence)}`}
                  >
                    {confidence}
                  </span>
                </div>
                <p className='text-white/82 line-clamp-2 text-sm'>{summarize(compound)}</p>
                {chips.length > 0 && (
                  <div className='flex flex-wrap gap-1'>
                    {chips.map(chip => (
                      <span
                        key={`${compound.id}-${chip.label}`}
                        className={`rounded-full border px-2 py-0.5 text-[10px] ${
                          chip.tone === 'warning'
                            ? 'bg-amber-500/12 border-amber-300/35 text-amber-100'
                            : chip.tone === 'evidence'
                              ? 'border-cyan-300/35 bg-cyan-500/15 text-cyan-100'
                              : 'border-violet-300/35 bg-violet-500/15 text-violet-100'
                        }`}
                      >
                        {chip.label}
                      </span>
                    ))}
                  </div>
                )}
                <div className='flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px]'>
                  {confidence === 'low' && (
                    <span className='inline-flex items-center gap-1 rounded-full border border-amber-300/20 bg-amber-400/[0.06] px-1.5 py-0.5 text-amber-100/75'>
                      <AlertTriangle className='h-3 w-3' aria-hidden='true' />
                      Limited data
                    </span>
                  )}
                  <p className='text-white/70'>
                    {compound.herbs.length} {compound.herbs.length === 1 ? 'herb' : 'herbs'}{' '}
                    associated
                  </p>
                </div>
                <Link
                  to={`/compounds/${compound.slug}`}
                  className='mt-auto inline-flex w-fit items-center rounded-md border border-white/20 bg-white/[0.06] px-2.5 py-1.5 text-xs font-medium text-white/85 transition hover:border-white/35 hover:bg-white/[0.12]'
                >
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
