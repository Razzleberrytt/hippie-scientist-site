import { useEffect, useMemo, useState } from 'react'
import Meta from '@/components/Meta'
import ActiveFiltersBar from '@/components/filters/ActiveFiltersBar'
import ConfidenceFilter from '@/components/filters/ConfidenceFilter'
import EffectFilter from '@/components/filters/EffectFilter'
import SearchBar from '@/components/filters/SearchBar'
import SortSelect from '@/components/filters/SortSelect'
import TypeFilter from '@/components/filters/TypeFilter'
import Collapse from '@/components/ui/Collapse'
import { useHerbData } from '@/lib/herb-data'
import { decorateHerbs } from '@/lib/herbs'
import { useUrlFilterState } from '@/hooks/useUrlFilterState'
import { filterHerbs } from '@/utils/filterHerbs'
import { DEFAULT_FILTER_STATE } from '@/utils/filterModel'
import { extractFilterOptions } from '@/utils/extractFilterOptions'
import { buildEffectIndex } from '@/utils/effectSearch'
import EffectExplorer from '@/components/EffectExplorer'
import type { EnrichmentFilter } from '@/types/enrichmentDiscovery'
import { trackGovernedEvent } from '@/lib/governedAnalytics'
import { slugify } from '@/lib/slug'
import { dedupePresentationList, sanitizeSummaryText } from '@/lib/sanitize'
import { Link } from 'react-router-dom'
import { getPrimaryEffects, getProfileStatus, getSummaryQuality, resolveCoreInsight, resolveHeroSummary, shouldRenderSummary } from '@/lib/workbookRender'

function isPlaceholder(text: string, herbName = ''): boolean {
  const value = String(text || '').trim().toLowerCase()
  if (!value) return false
  const escaped = String(herbName || '').trim().toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const patterns = [/^herb profile\.?$/i, /^reference profile\.?$/i, /^no direct/i, /^contextual inference/i, escaped ? new RegExp(`^${escaped}\\s+herb\\s+profile\\.?$`, 'i') : null, escaped ? new RegExp(`^${escaped}\\s+reference\\s+profile\\.?$`, 'i') : null].filter(Boolean) as RegExp[]
  return patterns.some(pattern => pattern.test(value))
}

const toTitleCase = (value: string) => String(value || '').trim().toLowerCase().replace(/\b\w/g, letter => letter.toUpperCase())

const cleanSummary = (value: string, herbName = '') => {
  const normalized = sanitizeSummaryText(value, 2)
  if (!normalized || isPlaceholder(normalized, herbName)) return ''
  if (normalized.length <= 130) return normalized
  return `${normalized.slice(0, 127).trimEnd()}...`
}

const getKeyEffects = (herb: Record<string, unknown>) =>
  dedupePresentationList(getPrimaryEffects(herb, 3), 3)
    .map(toTitleCase)
    .slice(0, 3)

const getStatusTag = (herb: Record<string, unknown>) => {
  const status = getProfileStatus(herb)
  if (status === 'minimal') return 'Minimal profile'
  if (status === 'partial') return 'Partial profile'
  const tier = String(herb.qualityTier || herb.evidenceLevel || '').toLowerCase()
  if (tier.includes('strong') || tier.includes('high')) return 'Well documented'
  if (tier.includes('medium') || tier.includes('moderate')) return 'Moderate evidence'
  return 'Limited evidence'
}

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
  useEffect(() => setVisibleCount(INITIAL_RESULTS), [filters])

  useEffect(() => {
    trackGovernedEvent({ type: 'governed_card_summary_visible', eventAction: 'visible', pageType: 'herbs_index', entityType: 'herb', surfaceId: 'herbs_search_index', componentType: 'browse_cards', item: String(filtered.length), reviewedStatus: 'not_applicable', freshnessState: 'not_applicable' })
  }, [filtered.length])

  const toggleEffect = (effect: string) => setFilters(prev => ({ ...prev, selectedEffects: prev.selectedEffects.includes(effect) ? prev.selectedEffects.filter(item => item !== effect) : [...prev.selectedEffects, effect] }))

  return (
    <main className='container mx-auto max-w-6xl px-4 py-8 text-white sm:py-10'>
      <Meta title='Herb Knowledge Database | The Hippie Scientist' description='Search effects, classification, confidence, and safety context across the herb library.' path='/herbs' />

      <header className='premium-panel mb-8 p-5 sm:p-7'>
        <p className='section-label'>Botanical Archive</p>
        <h1 className='mt-2 text-3xl font-semibold sm:text-5xl'>Herb knowledge database</h1>
        <p className='mt-3 max-w-3xl text-sm text-white/76 sm:text-base'>Search and compare herbs by effects, confidence, and class with an evidence-first view.</p>
      </header>

      <section className='browse-shell mb-6 p-4 sm:p-5'>
        <div className='flex flex-wrap items-center justify-between gap-3'>
          <div>
            <p className='section-label'>Decision tool</p>
            <h2 className='mt-1 text-xl text-white'>Effect Explorer</h2>
          </div>
          <button type='button' className='btn-secondary' onClick={() => setShowEffectExplorer(value => !value)} aria-expanded={showEffectExplorer}>
            {showEffectExplorer ? 'Hide explorer' : 'Open explorer'}
          </button>
        </div>
        {showEffectExplorer && <div className='mt-4'><EffectExplorer herbs={decoratedHerbs} /></div>}
      </section>

      <section className='mb-8 space-y-2.5'>
        <SearchBar value={filters.query} onChange={value => setFilters(prev => ({ ...prev, query: value }))} placeholder='Search herbs, effects, compounds...' />

        <div className='grid gap-2.5 lg:grid-cols-2'>
          <ConfidenceFilter value={filters.confidence} onChange={value => setFilters(prev => ({ ...prev, confidence: value }))} />
          <SortSelect value={filters.sort} onChange={value => setFilters(prev => ({ ...prev, sort: value }))} />
        </div>
        <Collapse title='More filters'>
          <div className='space-y-3 pt-2'>
            <TypeFilter label='Class' options={options.classes} value={filters.type} onChange={value => setFilters(prev => ({ ...prev, type: value }))} />
            <TypeFilter
              label='Research signal'
              options={ENRICHMENT_FILTER_OPTIONS.map(option => option.label)}
              value={ENRICHMENT_FILTER_OPTIONS.find(option => option.value === filters.enrichment)?.label || ENRICHMENT_FILTER_OPTIONS[0].label}
              onChange={label => {
                const next = ENRICHMENT_FILTER_OPTIONS.find(option => option.label === label)
                setFilters(prev => ({ ...prev, enrichment: next?.value || 'all' }))
              }}
            />

            <EffectFilter options={options.effects} selected={filters.selectedEffects} onToggle={toggleEffect} />
          </div>
        </Collapse>
        <ActiveFiltersBar
          state={filters}
          typeLabel='Class'
          onRemoveEffect={toggleEffect}
          onClear={() => setFilters(DEFAULT_FILTER_STATE)}
          onClearQuery={() => setFilters(prev => ({ ...prev, query: '' }))}
          onClearType={() => setFilters(prev => ({ ...prev, type: 'all' }))}
          onClearConfidence={() => setFilters(prev => ({ ...prev, confidence: 'all' }))}
          onClearEnrichment={() => setFilters(prev => ({ ...prev, enrichment: 'all' }))}
          enrichmentLabel={ENRICHMENT_FILTER_OPTIONS.find(option => option.value === filters.enrichment)?.label}
        />
      </section>

      <p className='mb-4 text-xs text-white/60 sm:text-sm'>{filtered.length} results · {effectIndex.size} indexed effects</p>

      {filtered.length === 0 ? (
        <div className='browse-shell p-6 text-center text-white/80'>No herbs match your current filters.</div>
      ) : (
        <section className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
          {visibleHerbs.map((herb, index) => (
            <article key={herb.slug || herb.id || `${herb.common}-${index}`} className='premium-panel fade-in-surface flex h-full flex-col p-4'>
              {(() => {
                const rawHerb = herb as unknown as Record<string, unknown>
                const profileStatus = getProfileStatus(rawHerb)
                const summaryQuality = getSummaryQuality(rawHerb)
                const hero = cleanSummary(resolveHeroSummary(rawHerb, 2), String(herb.common || herb.name || ''))
                const coreInsight = cleanSummary(resolveCoreInsight(rawHerb, 1), String(herb.common || herb.name || ''))
                const summary = hero || (summaryQuality === 'strong' ? coreInsight : '')
                const keyEffects = getKeyEffects(rawHerb)
                const showSummary = shouldRenderSummary(profileStatus, summaryQuality) && Boolean(summary)
                const chips = profileStatus === 'minimal' ? keyEffects.slice(0, 1) : keyEffects
                return (
                  <>
              <p className='section-label'>{getStatusTag(herb)}</p>
              <h2 className='mt-2 text-xl leading-tight text-white'>{toTitleCase(String(herb.common || herb.scientific || herb.name || 'Herb'))}</h2>
              {showSummary && <p className='mt-2 line-clamp-3 text-sm text-white/75'>{summary}</p>}
              <div className='mt-3 flex flex-wrap gap-1.5'>
                {chips.map(effect => (
                  <span key={`${herb.slug}-${effect}`} className='neo-pill inline-flex rounded-full border px-2 py-0.5 text-[10px]'>{effect}</span>
                ))}
              </div>
              <div className='mt-auto pt-4'>
                <Link
                  to={herb.slug ? `/herbs/${encodeURIComponent(String(herb.slug))}` : `/herbs/${encodeURIComponent(slugify(String(herb.common || herb.scientific || herb.name || '')))}`}
                  className='btn-secondary inline-flex w-fit'
                >
                  View decision page
                </Link>
              </div>
                  </>
                )
              })()}
            </article>
          ))}
        </section>
      )}
      {hasMore && (
        <div className='mt-8 flex justify-center'>
          <button type='button' className='btn-primary' onClick={() => setVisibleCount(prev => prev + LOAD_MORE_STEP)}>
            Load more herbs ({filtered.length - visibleCount} remaining)
          </button>
        </div>
      )}
    </main>
  )
}
