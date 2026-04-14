import { useEffect, useMemo, useState } from 'react'
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
import { cleanEffectChips, sanitizeSummaryText } from '@/lib/sanitize'

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
    return 'border-emerald-300/40 bg-emerald-500/12 text-emerald-100'
  if (level === 'medium')
    return 'border-amber-300/35 bg-amber-500/12 text-amber-100'
  return 'border-rose-300/35 bg-rose-500/10 text-rose-100/90'
}

function summarize(compound: { description: string; effects: string[] }) {
  const cleanedDescription = sanitizeSummaryText(compound.description, 1)
  if (cleanedDescription) return cleanedDescription
  const chipFallback = cleanEffectChips(compound.effects, 2)
  if (chipFallback.length) return chipFallback.join(' · ')
  return 'Profile in progress.'
}

function getStatusTag(level: ConfidenceLevel) {
  if (level === 'high') return 'Well supported'
  if (level === 'medium') return 'Moderate evidence'
  return 'Limited evidence'
}

function formatChipLabel(value: string) {
  const trimmed = String(value || '').trim()
  if (!trimmed) return ''

  let decoded = trimmed
  if (
    (decoded.startsWith('["') && decoded.endsWith('"]')) ||
    (decoded.startsWith("['") && decoded.endsWith("']"))
  ) {
    try {
      const parsed = JSON.parse(decoded.replace(/'/g, '"'))
      decoded = Array.isArray(parsed) ? String(parsed[0] || '') : decoded
    } catch {
      decoded = decoded.replace(/^\[+|\]+$/g, '')
    }
  }

  const normalized = decoded
    .replace(/^\[+|\]+$/g, '')
    .replace(/^['"]+|['"]+$/g, '')
    .replace(/\s*-\s*/g, '-')
    .replace(/\s+/g, ' ')
    .trim()

  if (!normalized) return ''
  return normalized.charAt(0).toUpperCase() + normalized.slice(1)
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

      <header className='ds-card-lg mb-8'>
        <h1 className='text-3xl font-semibold sm:text-4xl'>Compounds</h1>
        <p className='mt-2 max-w-3xl text-sm text-white/76 sm:text-base'>
          Search compounds by mechanism and effects, then filter by confidence and category.
        </p>
      </header>

      <section className='mb-8 space-y-2.5'>
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

        <div className='grid gap-2.5 lg:grid-cols-2'>
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
          </div>
        </Collapse>
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

      <p className='mb-4 text-xs text-white/60 sm:text-sm'>{filtered.length} results</p>

      {filtered.length === 0 ? (
        <div className='rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center text-white/80'>
          No compounds match your current filters.
        </div>
      ) : (
        <section className='grid gap-2 sm:grid-cols-2 lg:grid-cols-3'>
          {visibleCompounds.map(compound => {
            const confidence =
              compound.confidence ??
              calculateCompoundConfidence({
                mechanism: compound.mechanism,
                effects: compound.effects,
                compounds: compound.herbs,
              })
            const primaryEffects = cleanEffectChips(extractPrimaryEffects(compound.curatedData?.keyEffects || compound.effects, 8), 2)

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
            ]
              .map(chip => ({ ...chip, label: formatChipLabel(chip.label) }))
              .filter(chip => Boolean(chip.label))
              .slice(0, 2)

            return (
              <article key={compound.id} className='neo-card fade-in-surface ds-card flex h-full flex-col gap-2.5 rounded-lg p-4'>
                <h2
                  title={compound.name}
                  className='line-clamp-2 min-h-[2.4rem] break-all text-[1.04rem] font-semibold leading-tight text-white sm:text-[1.12rem]'
                >
                  {title}
                </h2>
                <p className='line-clamp-2 text-[0.74rem] leading-[1.5] text-white/72'>
                  {summarize({
                    description: compound.curatedData?.summary || '',
                    effects: compound.curatedData?.keyEffects || [],
                  })}
                </p>
                {chips.length > 0 && (
                  <div className='flex flex-wrap gap-1.5'>
                    {chips.map(chip => (
                      <span
                        key={`${compound.id}-${chip.label}`}
                        className='ds-pill neo-pill'
                      >
                        {chip.label}
                      </span>
                    ))}
                  </div>
                )}
                <span
                  className={`mt-1 inline-flex w-fit rounded-full border px-2 py-0.5 text-[9px] uppercase tracking-[0.11em] ${confidenceBadgeClass(confidence)}`}
                >
                  {getStatusTag(confidence)}
                </span>
                <Link
                  to={`/compounds/${compound.slug}`}
                  className='compound-context-link mt-auto inline-flex w-fit items-center rounded-md border border-white/20 bg-white/[0.04] px-2.5 py-1 text-[11px] font-medium text-white/82 transition duration-500 hover:border-cyan-200/75 hover:text-white'
                >
                  View context page
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
