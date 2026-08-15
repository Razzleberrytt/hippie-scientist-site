'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import Fuse from 'fuse.js'
import { GitCompareArrows, Search, ShieldAlert, X } from 'lucide-react'
import { isRestrictedRecord } from '@/src/lib/restricted-ingredients'
import {
  buildOnDemandComparisonHref,
  comparisonKey,
  getCanonicalMatchNote,
  getComparisonSelection,
  getRecentlyViewedResearch,
  getSearchIntent,
  normalizeResearchSearchItem,
  recordFailedSearch,
  recordRecentlyViewedResearch,
  setComparisonSelection,
  weightedSearchScore,
  type RecentResearchItem,
  type ResearchSearchItem,
  type ResearchSearchType,
} from '@/lib/search/search-experience'
import { trackFailedSiteSearch } from '@/lib/search/search-analytics'
import {
  decisionChipClass,
  decisionMetricShellClass,
  decisionMicroLabelClass,
  decisionStatusBadgeClass,
  publicSafetyLabel,
} from '@/lib/decision-primitives'

const DosingSafetyChecker = dynamic(
  () => import('@/src/components/search/DosingSafetyChecker'),
  { ssr: false },
)

type FilterType = 'All' | ResearchSearchType

const GOAL_SYNONYMS: Record<string, string[]> = {
  sleep: ['insomnia', 'rest', 'wind down', 'sleep quality'],
  stress: ['cortisol', 'adaptation', 'calm', 'tension'],
  anxiety: ['calm', 'tension', 'stress'],
  focus: ['attention', 'concentration', 'cognition', 'alertness'],
  energy: ['fatigue', 'stamina', 'vitality'],
  pain: ['soreness', 'inflammation', 'joint'],
  cognition: ['memory', 'attention', 'learning'],
  recovery: ['sleep', 'soreness', 'fatigue', 'stress'],
}

const GUIDED_SEARCHES = [
  ['Sleep', 'sleep', 'Outcome and safety context for sleep-related research.'],
  ['Stress', 'stress', 'Calming and adaptation evidence without treating mechanisms as outcomes.'],
  ['Focus', 'focus', 'Attention, cognition, stimulation, and non-stimulant tradeoffs.'],
  ['Human evidence', 'human clinical trial evidence', 'Bias toward profiles with more complete human-evidence context.'],
] as const

function expandQuery(query: string): string {
  const normalized = query.toLowerCase().trim()
  if (!normalized) return ''
  const expanded = new Set(normalized.split(/\s+/).filter(Boolean))
  for (const word of Array.from(expanded)) {
    for (const [goal, synonyms] of Object.entries(GOAL_SYNONYMS)) {
      if (word === goal || goal.includes(word) || word.includes(goal)) synonyms.forEach((value) => expanded.add(value))
    }
  }
  return Array.from(expanded).join(' ')
}

function typeBadgeClass(type: ResearchSearchType): string {
  return type === 'Herb'
    ? `${decisionStatusBadgeClass} border-brand-700/10 bg-brand-50 text-brand-800`
    : `${decisionStatusBadgeClass} border-blue-700/10 bg-blue-50 text-blue-800`
}

function SearchMetric({ label, value }: { label: string; value: string }) {
  const display = label === 'Safety' ? publicSafetyLabel(value) : value
  if (!display) return null
  return (
    <div className={decisionMetricShellClass}>
      <p className={`${decisionMicroLabelClass} text-muted`}>{label}</p>
      <p className='mt-1 line-clamp-2 text-sm font-semibold leading-5 text-ink'>{display}</p>
    </div>
  )
}

function ResultCard({
  item,
  query,
  selected,
  compareDisabled,
  onToggleCompare,
  onOpen,
}: {
  item: ResearchSearchItem
  query: string
  selected: boolean
  compareDisabled: boolean
  onToggleCompare: () => void
  onOpen: () => void
}) {
  const matchNote = getCanonicalMatchNote(item, query)
  return (
    <article className='flex h-full flex-col rounded-[1.35rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm transition hover:border-brand-700/20 hover:shadow-[var(--shadow-card-calm)] sm:p-5'>
      <div className='flex items-start justify-between gap-3'>
        <span className={typeBadgeClass(item.type)}>{item.type}</span>
        <button
          type='button'
          onClick={onToggleCompare}
          disabled={compareDisabled && !selected}
          aria-pressed={selected}
          className={`inline-flex min-h-10 items-center gap-1.5 rounded-full border px-3 py-2 text-xs font-bold transition ${selected ? 'border-brand-800 bg-brand-800 text-white' : 'border-brand-900/10 bg-white text-brand-800 hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-40'}`}
        >
          <GitCompareArrows aria-hidden='true' className='h-4 w-4' />
          {selected ? 'Selected' : 'Compare'}
        </button>
      </div>

      <Link href={item.href} onClick={onOpen} className='mt-3 group'>
        <h2 className='text-[1.35rem] font-semibold leading-tight tracking-tight text-ink group-hover:text-brand-800 sm:text-2xl'>{item.name}</h2>
        {item.scientificNames[0] ? <p className='mt-1 text-xs italic text-muted'>{item.scientificNames[0]}</p> : null}
        {matchNote ? <p className='mt-2 text-xs font-semibold text-brand-700'>{matchNote}</p> : null}
        <p className='mt-3 line-clamp-3 text-sm leading-6 text-muted'>{item.summary || 'Evidence, safety, and research context for this profile.'}</p>
      </Link>

      {item.outcomes.length > 0 || item.conditions.length > 0 ? (
        <div className='mt-4 rounded-[1rem] border border-brand-900/10 bg-brand-50/45 p-3'>
          <p className={`${decisionMicroLabelClass} text-brand-800`}>Outcome / condition context</p>
          <p className='mt-1.5 text-sm font-semibold leading-6 text-ink'>{[...item.outcomes, ...item.conditions].slice(0, 3).join(' • ')}</p>
        </div>
      ) : null}

      {item.mechanisms.length > 0 ? (
        <div className='mt-3'>
          <p className={`${decisionMicroLabelClass} text-muted`}>Mechanisms / pathways — not proven benefits</p>
          <div className='mt-2 flex flex-wrap gap-1.5'>
            {item.mechanisms.slice(0, 3).map((mechanism) => <span key={mechanism} className={decisionChipClass}>{mechanism}</span>)}
          </div>
        </div>
      ) : null}

      <div className='mt-3 grid gap-2 sm:grid-cols-2'>
        <SearchMetric label='Evidence' value={item.evidence} />
        <SearchMetric label='Safety' value={item.safety} />
      </div>

      <Link href={item.href} onClick={onOpen} className='mt-auto pt-4 inline-flex min-h-11 items-center justify-center rounded-full bg-brand-800 px-4 py-2.5 text-sm font-bold text-white hover:bg-brand-900'>
        Investigate profile →
      </Link>
    </article>
  )
}

function ComparisonTray({
  selectedItems,
  onRemove,
  onClear,
}: {
  selectedItems: ResearchSearchItem[]
  onRemove: (key: string) => void
  onClear: () => void
}) {
  if (selectedItems.length === 0) return null
  const keys = selectedItems.map(comparisonKey)
  const ready = selectedItems.length === 2
  const href = buildOnDemandComparisonHref(keys)

  return (
    <>
      <aside className='fixed bottom-5 right-5 z-[80] hidden w-[23rem] rounded-[1.4rem] border border-brand-900/15 bg-white/95 p-4 shadow-xl backdrop-blur md:block' aria-label='Comparison tray'>
        <div className='flex items-center justify-between gap-3'>
          <div>
            <p className='eyebrow-label'>Compare these</p>
            <p className='mt-1 text-sm font-semibold text-ink'>{selectedItems.length}/2 selected</p>
          </div>
          <button type='button' onClick={onClear} className='text-xs font-bold text-muted hover:text-ink'>Clear</button>
        </div>
        <div className='mt-3 space-y-2'>
          {selectedItems.map((item) => (
            <div key={comparisonKey(item)} className='flex items-center justify-between gap-3 rounded-xl border border-brand-900/10 bg-brand-50/45 px-3 py-2'>
              <span className='min-w-0 truncate text-sm font-semibold text-ink'>{item.name}</span>
              <button type='button' onClick={() => onRemove(comparisonKey(item))} aria-label={`Remove ${item.name} from comparison`} className='shrink-0 rounded-full p-1 text-muted hover:bg-white hover:text-ink'><X aria-hidden='true' className='h-4 w-4' /></button>
            </div>
          ))}
        </div>
        {ready ? <Link href={href} className='mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-brand-800 px-4 py-2 text-sm font-bold text-white hover:bg-brand-900'>Compare selected →</Link> : <p className='mt-3 text-xs leading-5 text-muted'>Select one more ingredient. On-demand comparison URLs stay noindex unless an editorial comparison is approved.</p>}
      </aside>

      <div className='sticky bottom-3 z-50 mx-3 rounded-2xl border border-brand-900/15 bg-white/95 p-3 shadow-lg backdrop-blur md:hidden'>
        <div className='flex items-center justify-between gap-3'>
          <p className='min-w-0 truncate text-xs font-bold text-ink'>{selectedItems.map((item) => item.name).join(' vs ')}</p>
          {ready ? <Link href={href} className='shrink-0 rounded-full bg-brand-800 px-3 py-2 text-xs font-bold text-white'>Compare</Link> : <span className='shrink-0 text-xs text-muted'>Pick 1 more</span>}
        </div>
      </div>
    </>
  )
}

export default function ResearchSearchExperience() {
  const [compounds, setCompounds] = useState<Record<string, unknown>[]>([])
  const [herbs, setHerbs] = useState<Record<string, unknown>[]>([])
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<FilterType>('All')
  const [humanEvidenceOnly, setHumanEvidenceOnly] = useState(false)
  const [mechanismOnly, setMechanismOnly] = useState(false)
  const [compareKeys, setCompareKeysState] = useState<string[]>([])
  const [recent, setRecent] = useState<RecentResearchItem[]>([])
  const failedTrackedRef = useRef('')

  useEffect(() => {
    let active = true
    Promise.all([
      fetch('/data/compounds-summary.json').then((response) => response.json()),
      fetch('/data/herbs-summary.json').then((response) => response.json()),
    ]).then(([compoundData, herbData]) => {
      if (!active) return
      setCompounds(Array.isArray(compoundData) ? compoundData as Record<string, unknown>[] : [])
      setHerbs(Array.isArray(herbData) ? herbData as Record<string, unknown>[] : [])
    }).catch(() => {
      if (!active) return
      setCompounds([])
      setHerbs([])
    })
    return () => { active = false }
  }, [])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const initialQuery = params.get('q')?.trim()
    if (initialQuery) setQuery(initialQuery)
    setRecent(getRecentlyViewedResearch())
    setCompareKeysState(getComparisonSelection())
  }, [])

  const searchItems = useMemo(() => {
    const herbItems = herbs
      .filter((record) => !isRestrictedRecord(record))
      .map((record) => normalizeResearchSearchItem(record, 'Herb'))
      .filter((item): item is ResearchSearchItem => Boolean(item))
    const compoundItems = compounds
      .filter((record) => !isRestrictedRecord(record))
      .map((record) => normalizeResearchSearchItem(record, 'Compound'))
      .filter((item): item is ResearchSearchItem => Boolean(item))
    return [...herbItems, ...compoundItems].sort((a, b) => b.discoveryScore - a.discoveryScore || b.authorityScore - a.authorityScore || a.name.localeCompare(b.name))
  }, [compounds, herbs])

  const fuse = useMemo(() => new Fuse(searchItems, {
    keys: [
      { name: 'name', weight: 0.28 },
      { name: 'aliases', weight: 0.16 },
      { name: 'scientificNames', weight: 0.13 },
      { name: 'extractNames', weight: 0.1 },
      { name: 'outcomes', weight: 0.1 },
      { name: 'conditions', weight: 0.09 },
      { name: 'mechanisms', weight: 0.06 },
      { name: 'searchText', weight: 0.08 },
    ],
    threshold: 0.36,
    ignoreLocation: true,
    includeScore: true,
    minMatchCharLength: 2,
  }), [searchItems])

  const suggestionFuse = useMemo(() => new Fuse(searchItems, {
    keys: [
      { name: 'name', weight: 0.45 },
      { name: 'aliases', weight: 0.22 },
      { name: 'scientificNames', weight: 0.2 },
      { name: 'extractNames', weight: 0.13 },
    ],
    threshold: 0.48,
    ignoreLocation: true,
    includeScore: true,
    minMatchCharLength: 2,
  }), [searchItems])

  const normalizedQuery = query.trim()
  const expandedQuery = useMemo(() => expandQuery(normalizedQuery), [normalizedQuery])
  const intent = getSearchIntent(normalizedQuery)

  const results = useMemo(() => {
    let base = normalizedQuery
      ? fuse.search(expandedQuery).map((match) => ({ item: match.item, relevance: 1 - (match.score ?? 1) }))
          .sort((a, b) => weightedSearchScore(b.item, b.relevance, intent) - weightedSearchScore(a.item, a.relevance, intent))
          .map((match) => match.item)
      : searchItems.slice(0, 24)

    if (filter !== 'All') base = base.filter((item) => item.type === filter)
    if (humanEvidenceOnly) base = base.filter((item) => item.evidenceCompleteness >= 0.5 || item.evidenceScore >= 0.68)
    if (mechanismOnly) base = base.filter((item) => item.mechanisms.length > 0)
    return base.slice(0, 36)
  }, [expandedQuery, filter, fuse, humanEvidenceOnly, intent, mechanismOnly, normalizedQuery, searchItems])

  const didYouMean = useMemo(() => {
    if (!normalizedQuery || results.length > 0 || normalizedQuery.length < 3) return null
    const candidate = suggestionFuse.search(normalizedQuery)[0]?.item
    return candidate && candidate.name.toLowerCase() !== normalizedQuery.toLowerCase() ? candidate : null
  }, [normalizedQuery, results.length, suggestionFuse])

  const quickSuggestions = useMemo(() => {
    if (normalizedQuery.length < 2) return []
    return suggestionFuse.search(normalizedQuery).slice(0, 5).map((match) => match.item)
  }, [normalizedQuery, suggestionFuse])

  useEffect(() => {
    if (searchItems.length === 0 || normalizedQuery.length < 2 || results.length > 0) return
    if (failedTrackedRef.current === normalizedQuery.toLowerCase()) return
    const timeout = window.setTimeout(() => {
      recordFailedSearch(normalizedQuery)
      trackFailedSiteSearch(normalizedQuery)
      failedTrackedRef.current = normalizedQuery.toLowerCase()
    }, 700)
    return () => window.clearTimeout(timeout)
  }, [normalizedQuery, results.length, searchItems.length])

  const selectedItems = useMemo(() => {
    const byKey = new Map(searchItems.map((item) => [comparisonKey(item), item]))
    return compareKeys.map((key) => byKey.get(key)).filter((item): item is ResearchSearchItem => Boolean(item))
  }, [compareKeys, searchItems])

  const dosingItems = useMemo(() => searchItems.map((item) => ({
    slug: item.slug,
    name: item.name,
    type: item.type,
    effects: item.outcomes,
    evidence: item.evidence,
    safety: item.safety,
    typical_dosage: item.typicalDosage,
    avoid_if: item.avoidIf,
    side_effects: item.sideEffects,
    contraindications: item.contraindications,
    interactions: item.interactions,
  })), [searchItems])

  function setCompare(keys: string[]) {
    const next = setComparisonSelection(keys)
    setCompareKeysState(next)
  }

  function toggleCompare(item: ResearchSearchItem) {
    const key = comparisonKey(item)
    if (compareKeys.includes(key)) setCompare(compareKeys.filter((value) => value !== key))
    else if (compareKeys.length < 2) setCompare([...compareKeys, key])
  }

  function openItem(item: ResearchSearchItem) {
    setRecent(recordRecentlyViewedResearch(item))
  }

  function reset() {
    setQuery('')
    setFilter('All')
    setHumanEvidenceOnly(false)
    setMechanismOnly(false)
  }

  return (
    <div className='min-h-screen bg-background text-ink'>
      <section className='container-page py-7 sm:py-11 lg:py-14'>
        <div className='space-y-7'>
          <header className='hero-shell rounded-[2rem] border border-brand-900/10 p-5 shadow-card sm:p-8'>
            <p className='eyebrow-label'>Evidence discovery</p>
            <h1 className='mt-2 max-w-3xl text-4xl font-bold tracking-tight text-ink sm:text-5xl'>Search ingredients, outcomes, and research context</h1>
            <p className='mt-4 max-w-3xl text-base leading-7 text-muted sm:text-lg'>
              Search common names, scientific names, synonyms, standardized extracts, conditions, or mechanisms. Outcome evidence and mechanism data are kept visually separate.
            </p>

            <div className='relative mt-6'>
              <label htmlFor='research-search' className='sr-only'>Search herbs and compounds</label>
              <Search aria-hidden='true' className='pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted' />
              <input
                id='research-search'
                type='search'
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder='Try magnesium glycinate, Withania somnifera, sleep, or GABA...'
                autoComplete='off'
                className='min-h-14 w-full rounded-2xl border border-brand-900/10 bg-white pl-12 pr-4 text-base font-medium text-ink shadow-sm outline-none transition focus:border-brand-700/30 focus:ring-4 focus:ring-brand-700/15 sm:text-lg'
              />
              {quickSuggestions.length > 0 && normalizedQuery.length >= 2 ? (
                <div className='absolute left-0 right-0 top-[calc(100%+0.5rem)] z-40 rounded-2xl border border-brand-900/10 bg-white p-2 shadow-xl'>
                  <p className='px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted'>Quick matches</p>
                  {quickSuggestions.map((item) => (
                    <button key={comparisonKey(item)} type='button' onClick={() => setQuery(item.name)} className='flex min-h-11 w-full items-center justify-between rounded-xl px-3 py-2 text-left hover:bg-brand-50'>
                      <span>
                        <span className='block text-sm font-semibold text-ink'>{item.name}</span>
                        {item.scientificNames[0] ? <span className='block text-xs italic text-muted'>{item.scientificNames[0]}</span> : null}
                      </span>
                      <span className={typeBadgeClass(item.type)}>{item.type}</span>
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            <div className='mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4'>
              {GUIDED_SEARCHES.map(([label, value, description]) => (
                <button key={label} type='button' onClick={() => setQuery(value)} className='rounded-xl border border-brand-900/10 bg-white/85 p-3 text-left hover:border-brand-700/20 hover:bg-white'>
                  <span className='block text-sm font-bold text-ink'>{label}</span>
                  <span className='mt-1 block text-xs leading-5 text-muted'>{description}</span>
                </button>
              ))}
            </div>
          </header>

          <section className='rounded-[1.4rem] border border-brand-900/10 bg-white/80 p-4 shadow-sm'>
            <div className='flex flex-wrap gap-2'>
              {(['All', 'Herb', 'Compound'] as const).map((value) => (
                <button key={value} type='button' onClick={() => setFilter(value)} className={filter === value ? 'button-primary min-h-10 px-4 py-2 text-sm' : 'button-secondary min-h-10 px-4 py-2 text-sm'}>{value === 'All' ? 'All profiles' : `${value}s`}</button>
              ))}
              <button type='button' onClick={() => setHumanEvidenceOnly((value) => !value)} className={humanEvidenceOnly ? 'button-primary min-h-10 px-4 py-2 text-sm' : 'button-secondary min-h-10 px-4 py-2 text-sm'}>More complete human evidence</button>
              <button type='button' onClick={() => setMechanismOnly((value) => !value)} className={mechanismOnly ? 'button-primary min-h-10 px-4 py-2 text-sm' : 'button-secondary min-h-10 px-4 py-2 text-sm'}>Mechanisms mapped</button>
              {(normalizedQuery || filter !== 'All' || humanEvidenceOnly || mechanismOnly) ? <button type='button' onClick={reset} className='min-h-10 rounded-full px-3 text-sm font-bold text-muted hover:text-ink'>Reset</button> : null}
            </div>
            <p className='mt-3 text-xs leading-5 text-muted'>Ranking combines textual relevance, evidence completeness, measured popularity when available, and authority signals. Popularity never overrides safety or evidence labeling.</p>
          </section>

          {!normalizedQuery && recent.length > 0 ? (
            <section className='rounded-[1.4rem] border border-brand-900/10 bg-white/80 p-4 shadow-sm'>
              <p className='eyebrow-label'>Recently viewed on this device</p>
              <div className='mt-3 flex flex-wrap gap-2'>
                {recent.map((item) => <Link key={`${item.type}:${item.slug}`} href={item.href} className='rounded-full border border-brand-900/10 bg-white px-3 py-2 text-sm font-semibold text-brand-800 hover:bg-brand-50'>{item.name}</Link>)}
              </div>
              <p className='mt-3 text-xs text-muted'>Stored only in this browser for convenience.</p>
            </section>
          ) : null}

          <details className='rounded-[1.4rem] border border-amber-200 bg-white p-4 shadow-sm'>
            <summary className='flex min-h-11 cursor-pointer items-center justify-between gap-3 text-sm font-bold text-amber-900'>
              <span className='flex items-center gap-2'><ShieldAlert aria-hidden='true' className='h-5 w-5 text-amber-700' />Dose context &amp; safety reference</span>
              <span className='text-amber-700'>Open →</span>
            </summary>
            <div className='mt-4'><DosingSafetyChecker items={dosingItems} /></div>
          </details>

          <section aria-labelledby='research-results-heading' className='space-y-5'>
            <div className='flex flex-wrap items-end justify-between gap-3'>
              <div>
                <p className='eyebrow-label'>Results</p>
                <h2 id='research-results-heading' className='mt-2 text-3xl font-bold tracking-tight text-ink'>{normalizedQuery ? `Research matches for “${normalizedQuery}”` : 'High-signal starting points'}</h2>
              </div>
              <span className='chip-readable'>{results.length} shown</span>
            </div>

            {results.length === 0 ? (
              <div className='rounded-[1.4rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm'>
                <h3 className='text-2xl font-bold text-ink'>No matching canonical profile yet.</h3>
                <p className='mt-3 max-w-2xl text-sm leading-7 text-muted'>This failed search is counted locally so repeated misses can become data/content backlog candidates. Only privacy-screened, non-sensitive terms are eligible for analytics attribution.</p>
                {didYouMean ? (
                  <button type='button' onClick={() => setQuery(didYouMean.name)} className='mt-4 rounded-full border border-brand-700/20 bg-brand-50 px-4 py-2 text-sm font-bold text-brand-800 hover:bg-white'>Did you mean {didYouMean.name}?</button>
                ) : null}
                <div className='mt-5 flex flex-wrap gap-2'>
                  {GUIDED_SEARCHES.slice(0, 3).map(([label, value]) => <button key={label} type='button' onClick={() => setQuery(value)} className='button-secondary min-h-10 px-4 py-2 text-sm'>{label}</button>)}
                </div>
              </div>
            ) : (
              <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
                {results.map((item) => {
                  const key = comparisonKey(item)
                  return <ResultCard key={key} item={item} query={normalizedQuery} selected={compareKeys.includes(key)} compareDisabled={compareKeys.length >= 2} onToggleCompare={() => toggleCompare(item)} onOpen={() => openItem(item)} />
                })}
              </div>
            )}
          </section>
        </div>
      </section>

      <ComparisonTray selectedItems={selectedItems} onRemove={(key) => setCompare(compareKeys.filter((value) => value !== key))} onClear={() => setCompare([])} />
    </div>
  )
}
