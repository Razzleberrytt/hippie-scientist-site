import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Listbox } from '@headlessui/react'
import Meta from './Meta'
import ErrorBoundary from './ErrorBoundary'
import HerbCard from './HerbCard'
import AdvancedSearch from './AdvancedSearch'
import StatBadges from './StatBadges'
import { pickRandomHerb } from '@/lib/discovery'
import type { Herb } from '@/types'
import { trackEvent } from '@/lib/growth'
import { CTA } from '@/lib/cta'
import { buildCardSummary } from '@/lib/summary'
import { extractPrimaryEffects } from '@/utils/extractPrimaryEffects'
import { hasVal } from '@/lib/pretty'
import { slugify } from '@/lib/slug'

const POPULAR_SEARCHES = ['ashwagandha', 'lion’s mane', 'kava', 'reishi', 'muscimol']
const SEARCH_SUGGESTIONS = ['gaba', 'adaptogen', 'sleep', 'focus', 'dream']

export type EntityDatabasePageProps = {
  title: string
  description: string
  metaPath: string
  items: Herb[]
  kind: 'herb' | 'compound'
  counters: {
    herbCount: number
    compoundCount: number
    articleCount: number
  }
  enableAdvancedFilters?: boolean
}

function scoreSearch(item: Herb, query: string) {
  if (!query) return 0
  const q = query.toLowerCase()
  const name = String(item.common || item.scientific || item.name || item.slug || '').toLowerCase()
  const effects = String(item.effects || '').toLowerCase()
  const description = String(item.description || '').toLowerCase()
  const tags = [
    ...(item.tags || []),
    ...(item.compoundClasses || []),
    ...(item.pharmCategories || []),
  ]
    .join(' ')
    .toLowerCase()

  let score = 0
  if (name === q) score += 120
  if (name.startsWith(q)) score += 80
  if (name.includes(q)) score += 50
  if (tags.includes(q)) score += 30
  if (effects.includes(q)) score += 20
  if (description.includes(q)) score += 10
  return score
}

export default function EntityDatabasePage({
  title,
  description,
  metaPath,
  items,
  kind,
  counters,
  enableAdvancedFilters = false,
}: EntityDatabasePageProps) {
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const [advancedResults, setAdvancedResults] = useState<Herb[] | null>(null)
  const [effectFilter, setEffectFilter] = useState(searchParams.get('effect') || 'all')
  const [intensityFilter, setIntensityFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [tagFilter, setTagFilter] = useState(searchParams.get('tag') || 'all')
  const [regionFilter, setRegionFilter] = useState('all')
  const [mechanismFilter, setMechanismFilter] = useState<string[]>([])
  const [compoundFilter, setCompoundFilter] = useState<string[]>([])
  const [interactionFilter, setInteractionFilter] = useState<string[]>([])
  const [legalFilter, setLegalFilter] = useState<string[]>([])

  const scopedItems = useMemo(
    () => (enableAdvancedFilters ? (advancedResults ?? items) : items),
    [advancedResults, enableAdvancedFilters, items]
  )

  const options = useMemo(() => {
    const effectSet = new Set<string>()
    const intensitySet = new Set<string>()
    const categorySet = new Set<string>()
    const tagSet = new Set<string>()
    const regionSet = new Set<string>()
    const mechanismSet = new Set<string>()
    const activeCompoundSet = new Set<string>()
    const interactionSet = new Set<string>()
    const legalSet = new Set<string>()

    items.forEach(item => {
      ;(item.pharmCategories || []).forEach(entry => effectSet.add(String(entry)))
      ;(item.tags || []).forEach(entry => {
        if (!entry?.startsWith('🧪')) {
          effectSet.add(String(entry))
          tagSet.add(String(entry).toLowerCase())
        }
      })
      ;(item.compoundClasses || []).forEach(entry => tagSet.add(String(entry).toLowerCase()))

      const intensity = item.intensityLabel || item.intensityLevel || item.intensity
      if (intensity) intensitySet.add(String(intensity))

      const regions = [item.region, ...(item.regiontags || [])].filter(Boolean)
      regions.forEach(entry => regionSet.add(String(entry)))

      const mechanisms = String(item.mechanism || (item as any).mechanismOfAction || '')
        .split(/[;|]/)
        .map(entry => entry.trim())
        .filter(Boolean)
      mechanisms.forEach(entry => mechanismSet.add(entry))

      const compounds = [
        ...((item as any).activeCompounds || []),
        ...(item.active_compounds || []),
        ...(item.compounds || []),
      ]
        .map(entry => String(entry).trim())
        .filter(Boolean)
      compounds.forEach(entry => activeCompoundSet.add(entry))

      const interactions = [
        ...(Array.isArray(item.interactions)
          ? item.interactions
          : String(item.interactions || '')
              .split(/[;|,]/)
              .map(entry => entry.trim())),
      ].filter(Boolean)
      interactions.forEach(entry => interactionSet.add(String(entry)))

      const legalValues = [item.legalStatus, item.legalstatus, item.legal].filter(Boolean)
      legalValues.forEach(entry => legalSet.add(String(entry)))

      const categories = [
        ...(item.compoundClasses || []),
        item.category,
        item.category_label,
      ].filter(Boolean)
      categories.forEach(entry => categorySet.add(String(entry)))
    })

    return {
      effects: Array.from(effectSet).sort((a, b) => a.localeCompare(b)),
      intensities: Array.from(intensitySet).sort((a, b) => a.localeCompare(b)),
      categories: Array.from(categorySet).sort((a, b) => a.localeCompare(b)),
      tags: Array.from(tagSet).sort((a, b) => a.localeCompare(b)),
      regions: Array.from(regionSet).sort((a, b) => a.localeCompare(b)),
      mechanisms: Array.from(mechanismSet).sort((a, b) => a.localeCompare(b)),
      activeCompounds: Array.from(activeCompoundSet).sort((a, b) => a.localeCompare(b)),
      interactions: Array.from(interactionSet).sort((a, b) => a.localeCompare(b)),
      legalStatuses: Array.from(legalSet).sort((a, b) => a.localeCompare(b)),
    }
  }, [items])

  const filtered = useMemo(() => {
    const q = String(query || '')
      .trim()
      .toLowerCase()

    const scored = scopedItems
      .map(item => {
        if (!q) return { item, score: 0 }
        const score = scoreSearch(item, q)
        return { item, score }
      })
      .filter(entry => !q || entry.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(entry => entry.item)

    return scored.filter(item => {
      if (effectFilter !== 'all') {
        const effects = [...(item.pharmCategories || []), ...(item.tags || []), item.effects || '']
          .join(' ')
          .toLowerCase()
        if (!effects.includes(effectFilter.toLowerCase())) return false
      }

      if (tagFilter !== 'all') {
        const tags = [
          ...(item.tags || []),
          ...(item.compoundClasses || []),
          ...(item.pharmCategories || []),
        ]
          .join(' ')
          .toLowerCase()
        if (!tags.includes(tagFilter.toLowerCase())) return false
      }

      if (intensityFilter !== 'all') {
        const label = String(
          item.intensityLabel || item.intensityLevel || item.intensity || ''
        ).toLowerCase()
        if (!label.includes(intensityFilter.toLowerCase())) return false
      }

      if (regionFilter !== 'all') {
        const regions = [item.region || '', ...(item.regiontags || [])].join(' ').toLowerCase()
        if (!regions.includes(regionFilter.toLowerCase())) return false
      }

      if (mechanismFilter.length > 0) {
        const mechanism = String(
          item.mechanism || (item as any).mechanismOfAction || ''
        ).toLowerCase()
        const hasAny = mechanismFilter.some(entry => mechanism.includes(entry.toLowerCase()))
        if (!hasAny) return false
      }

      if (compoundFilter.length > 0) {
        const compounds = [
          ...((item as any).activeCompounds || []),
          ...(item.active_compounds || []),
          ...(item.compounds || []),
        ]
          .join(' ')
          .toLowerCase()
        const hasAny = compoundFilter.some(entry => compounds.includes(entry.toLowerCase()))
        if (!hasAny) return false
      }

      if (interactionFilter.length > 0) {
        const interactions = Array.isArray(item.interactions)
          ? item.interactions.join(' ').toLowerCase()
          : String(item.interactions || '').toLowerCase()
        const hasAny = interactionFilter.some(entry => interactions.includes(entry.toLowerCase()))
        if (!hasAny) return false
      }

      if (legalFilter.length > 0) {
        const legal = String(item.legalStatus || item.legalstatus || item.legal || '').toLowerCase()
        const hasAny = legalFilter.some(entry => legal.includes(entry.toLowerCase()))
        if (!hasAny) return false
      }

      if (categoryFilter !== 'all') {
        const categories = [
          ...(item.compoundClasses || []),
          item.category || '',
          item.category_label || '',
        ]
          .join(' ')
          .toLowerCase()
        if (!categories.includes(categoryFilter.toLowerCase())) return false
      }

      return true
    })
  }, [
    scopedItems,
    query,
    effectFilter,
    intensityFilter,
    categoryFilter,
    tagFilter,
    regionFilter,
    mechanismFilter,
    compoundFilter,
    interactionFilter,
    legalFilter,
  ])
  const topMatches = useMemo(() => filtered.slice(0, 3), [filtered])

  const randomHerb = kind === 'herb' ? pickRandomHerb(items) : null

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams)
    if (!value || value === 'all') next.delete(key)
    else next.set(key, value)
    setSearchParams(next)
  }

  return (
    <ErrorBoundary>
      <Meta title={`${title} | The Hippie Scientist`} description={description} path={metaPath} />
      <main className='container mx-auto max-w-5xl px-4 py-6'>
        <section className='ds-card-lg ds-section text-white'>
          <h1 className='ds-heading text-4xl font-bold tracking-tight sm:text-5xl'>{title}</h1>
          <p className='text-white/78 mt-4 max-w-3xl text-base leading-7'>{description}</p>

          <div className='mt-5 flex flex-wrap items-center gap-3'>
            {enableAdvancedFilters && (
              <>
                {advancedResults && (
                  <button
                    type='button'
                    className='btn-secondary'
                    onClick={() => setAdvancedResults(null)}
                  >
                    Clear advanced filters
                  </button>
                )}
                <button
                  type='button'
                  className='btn-ghost text-sm'
                  onClick={() => setAdvancedOpen(true)}
                >
                  {CTA.primary.learn}
                </button>
              </>
            )}
            {randomHerb?.slug && (
              <Link to={`/herbs/${randomHerb.slug}`} className='btn-secondary'>
                {CTA.primary.explore}
              </Link>
            )}
          </div>

          <div className='ds-card mt-5 space-y-4 p-5'>
            <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4'>
              <label htmlFor={`${kind}-search-input`} className='sr-only'>
                Search {kind}
              </label>
              <input
                id={`${kind}-search-input`}
                className='min-w-0 flex-1 rounded-2xl border border-white/15 bg-black/30 px-4 py-2 text-sm text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/30'
                placeholder={`Search ${kind === 'herb' ? 'herbs' : 'compounds'}, effects…`}
                value={query}
                onChange={event => {
                  const next = event.target.value
                  setQuery(next)
                  updateParam('q', next.trim())
                  if (next.trim().length >= 2) {
                    trackEvent('search_used', {
                      kind,
                      query_length: next.trim().length,
                      query: next.trim().toLowerCase(),
                    })
                  }
                }}
              />
              <span className='text-sm text-white/80 sm:shrink-0'>{filtered.length} results</span>
            </div>
            <div className='flex flex-wrap gap-2 text-xs'>
              <span className='text-white/75'>Popular searches:</span>
              {POPULAR_SEARCHES.map(term => (
                <button
                  key={term}
                  className='rounded-full border border-white/15 px-2 py-1 text-white/80 hover:bg-white/10'
                  onClick={() => {
                    setQuery(term)
                    updateParam('q', term)
                    trackEvent('search_used', { kind, query: term })
                  }}
                >
                  {term}
                </button>
              ))}
            </div>
            {!query && (
              <p className='text-xs text-white/60'>
                Try searching for {SEARCH_SUGGESTIONS.join(', ')}.
              </p>
            )}
            {query.trim().length > 0 && (
              <div className='rounded-xl border border-white/10 bg-white/[0.03] p-3'>
                <p className='text-xs uppercase tracking-[0.13em] text-white/60'>Top matches</p>
                <ul className='mt-2 space-y-1 text-sm text-white/85'>
                  {topMatches.map(item => (
                    <li key={item.slug}>
                      {item.common || item.scientific || item.name || item.slug}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
              {options.effects.length > 0 && (
                <div className='space-y-1'>
                  <label className='text-xs text-white/80' htmlFor={`${kind}-effect-filter`}>
                    Effect
                  </label>
                  <select
                    id={`${kind}-effect-filter`}
                    aria-label='Filter by effect'
                    value={effectFilter}
                    onChange={event => {
                      const next = event.target.value
                      setEffectFilter(next)
                      updateParam('effect', next)
                    }}
                    className='w-full rounded-xl border border-white/15 bg-black/25 px-3 py-2 text-sm text-white'
                  >
                    <option value='all'>All effects</option>
                    {options.effects.map(option => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {options.tags.length > 0 && (
                <div className='space-y-1'>
                  <label className='text-xs text-white/80' htmlFor={`${kind}-tag-filter`}>
                    Tag
                  </label>
                  <select
                    id={`${kind}-tag-filter`}
                    aria-label='Filter by tag'
                    value={tagFilter}
                    onChange={event => {
                      const next = event.target.value
                      setTagFilter(next)
                      updateParam('tag', next)
                    }}
                    className='w-full rounded-xl border border-white/15 bg-black/25 px-3 py-2 text-sm text-white'
                  >
                    <option value='all'>All tags</option>
                    {options.tags.map(option => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {options.intensities.length > 0 && (
                <div className='space-y-1'>
                  <label className='text-xs text-white/80' htmlFor={`${kind}-intensity-filter`}>
                    Intensity
                  </label>
                  <select
                    id={`${kind}-intensity-filter`}
                    aria-label='Filter by intensity'
                    value={intensityFilter}
                    onChange={event => setIntensityFilter(event.target.value)}
                    className='w-full rounded-xl border border-white/15 bg-black/25 px-3 py-2 text-sm text-white'
                  >
                    <option value='all'>All intensity levels</option>
                    {options.intensities.map(option => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {options.categories.length > 0 && (
                <div className='space-y-1'>
                  <label className='text-xs text-white/80' htmlFor={`${kind}-class-filter`}>
                    Class
                  </label>
                  <select
                    id={`${kind}-class-filter`}
                    aria-label='Filter by class'
                    value={categoryFilter}
                    onChange={event => setCategoryFilter(event.target.value)}
                    className='w-full rounded-xl border border-white/15 bg-black/25 px-3 py-2 text-sm text-white'
                  >
                    <option value='all'>All classifications</option>
                    {options.categories.map(option => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {kind === 'herb' && (
                <>
                  {options.regions.length > 0 && (
                    <div className='space-y-1'>
                      <label className='text-xs text-white/80' htmlFor={`${kind}-region-filter`}>
                        Region
                      </label>
                      <select
                        id={`${kind}-region-filter`}
                        aria-label='Filter by region'
                        value={regionFilter}
                        onChange={event => setRegionFilter(event.target.value)}
                        className='w-full rounded-xl border border-white/15 bg-black/25 px-3 py-2 text-sm text-white'
                      >
                        <option value='all'>All regions</option>
                        {options.regions.map(option => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {options.mechanisms.length > 0 && (
                    <MultiSelectFilter
                      label='Mechanism'
                      selected={mechanismFilter}
                      options={options.mechanisms}
                      onChange={setMechanismFilter}
                    />
                  )}

                  {options.activeCompounds.length > 0 && (
                    <MultiSelectFilter
                      label='Active compounds'
                      selected={compoundFilter}
                      options={options.activeCompounds}
                      onChange={setCompoundFilter}
                      className='sm:col-span-2 lg:col-span-3'
                    />
                  )}
                  {options.interactions.length > 0 && (
                    <MultiSelectFilter
                      label='Interactions'
                      selected={interactionFilter}
                      options={options.interactions}
                      onChange={setInteractionFilter}
                    />
                  )}
                  {options.legalStatuses.length > 0 && (
                    <MultiSelectFilter
                      label='Legal status'
                      selected={legalFilter}
                      options={options.legalStatuses}
                      onChange={setLegalFilter}
                    />
                  )}
                </>
              )}
            </div>
          </div>

          <div className='mt-6'>
            <StatBadges
              stats={[
                { label: 'psychoactive herbs', value: counters.herbCount },
                { label: 'active compounds', value: counters.compoundCount },
                { label: 'articles', value: counters.articleCount },
              ]}
            />
          </div>
        </section>

        <section className='ds-section grid gap-4 pb-8 md:grid-cols-2'>
          {filtered.map((item, index) => (
            <HerbCard
              key={item.slug ?? item.id ?? `${kind}-${index}`}
              name={String(item.common || item.scientific || item.name || 'Herb')}
              summary={
                buildCardSummary({
                  effects: (item.curatedData?.keyEffects || item.effects) as unknown,
                  mechanism: item.curatedData?.mechanism || item.mechanism,
                  description: item.curatedData?.summary || '',
                  maxLen: 130,
                }) || 'Learn more about this herb and its potential uses.'
              }
              tags={extractPrimaryEffects(Array.isArray(item.curatedData?.keyEffects) ? item.curatedData.keyEffects : [], 2)}
              detailUrl={
                hasVal(item.slug)
                  ? `${kind === 'compound' ? '/compounds' : '/herbs'}/${encodeURIComponent(String(item.slug))}`
                  : `${kind === 'compound' ? '/compounds' : '/herbs'}/${encodeURIComponent(
                      slugify(String(item.common || item.scientific || item.name || ''))
                    )}`
              }
            />
          ))}
          {!filtered.length && (
            <div className='ds-card-lg text-center text-white/80'>
              No {kind === 'herb' ? 'herbs' : 'compounds'} match that search.
            </div>
          )}
        </section>
      </main>

      {enableAdvancedFilters && (
        <AdvancedSearch
          open={advancedOpen}
          onClose={() => setAdvancedOpen(false)}
          onApply={res => {
            const next = res as Herb[]
            setAdvancedResults(next.length === items.length ? null : next)
            setAdvancedOpen(false)
          }}
        />
      )}
    </ErrorBoundary>
  )
}

function MultiSelectFilter({
  label,
  selected,
  options,
  onChange,
  className = '',
}: {
  label: string
  selected: string[]
  options: string[]
  onChange: (value: string[]) => void
  className?: string
}) {
  return (
    <div className={`space-y-1 ${className}`}>
      <label className='text-xs text-white/80'>{label} (multi-select)</label>
      <Listbox value={selected} onChange={onChange} multiple>
        <div className='relative'>
          <Listbox.Button className='w-full rounded-xl border border-white/15 bg-black/25 px-3 py-2 text-left text-sm text-white'>
            {selected.length > 0 ? `${selected.length} selected` : `All ${label.toLowerCase()}`}
          </Listbox.Button>
          <Listbox.Options className='absolute z-30 mt-2 max-h-60 w-full overflow-auto rounded-xl border border-white/15 bg-slate-950 p-2 text-sm text-white shadow-2xl'>
            {options.map(option => (
              <Listbox.Option
                key={option}
                value={option}
                className='ui-active:bg-white/10 cursor-pointer rounded-md px-2 py-1'
              >
                {({ selected: isSelected }) => (
                  <span className={isSelected ? 'text-cyan-300' : 'text-white/85'}>
                    {isSelected ? '✓ ' : ''}
                    {option}
                  </span>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </div>
      </Listbox>
    </div>
  )
}
