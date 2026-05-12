'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import Fuse from 'fuse.js'
import compoundsData from '@/public/data/compounds.json'
import herbsData from '@/public/data/herbs.json'
import { cleanSummary, formatDisplayLabel, isClean, labelize, list, text, unique } from '@/lib/display-utils'
import { getSemanticOrchestrationSignals } from '@/lib/semantic-orchestration'

type SearchType = 'Herb' | 'Compound'
type FilterType = 'All' | 'Herb' | 'Compound'
type SearchIntent = 'general' | 'evidence' | 'safety' | 'mechanism' | 'comparison'

type SearchItem = {
  slug: string
  name: string
  type: SearchType
  href: string
  summary: string
  effects: string[]
  evidence: string
  safety: string
  quality: string
  searchText: string
  authorityScore: number
  discoveryScore: number
  evidenceScore: number
  mechanismScore: number
  ecosystemScore: number
  safetyPenalty: number
  uncertaintyPenalty: number
  translationalPenalty: number
}

const suggestedSearches = ['sleep', 'stress', 'inflammation', 'focus', 'digestion', 'metabolism']
const filterOptions: FilterType[] = ['All', 'Herb', 'Compound']

function getName(item: any) {
  return formatDisplayLabel(item.displayName) || formatDisplayLabel(item.name) || formatDisplayLabel(item.slug)
}

function getSummary(item: any, type: SearchType) {
  const summary =
    item.short_earthy_summary ||
    item.shortEarthySummary ||
    item.summary ||
    item.coreInsight ||
    item.hero ||
    item.description

  return cleanSummary(summary, type === 'Herb' ? 'herb' : 'compound')
}

function getEffects(item: any) {
  return unique([
    ...list(item.primary_effects),
    ...list(item.primaryEffects),
    ...list(item.effects),
    ...list(item.mechanisms),
    ...list(item.primaryDomain),
  ])
    .filter(isClean)
    .slice(0, 4)
}

function getEvidence(item: any) {
  return labelize(
    item.evidence_tier ||
      item.evidenceTier ||
      item.safety?.evidenceTier ||
      item.evidence_grade ||
      item.evidenceLevel ||
      item.summary_quality,
    'Evidence Review'
  )
}

function getSafety(item: any) {
  return labelize(
    item.safety_level ||
      item.safetyLevel ||
      item.safety?.confidence ||
      item.confidenceTier ||
      item.profile_status,
    'Safety Review'
  )
}

function getQuality(item: any) {
  return labelize(item.profile_status || item.summary_quality || item.review_status || item.status, 'Profile Review')
}

function evidenceClass(level: string) {
  const value = level.toLowerCase()

  if (value.includes('strong') || value.includes('high')) return 'evidence-pill-strong'
  if (value.includes('moderate') || value.includes('human')) return 'evidence-pill-moderate'
  return 'chip-readable'
}

function safetyClass(level: string) {
  const value = level.toLowerCase()

  if (value.includes('safe') || value.includes('complete') || value.includes('high')) return 'evidence-pill-strong'
  if (value.includes('caution') || value.includes('review') || value.includes('partial') || value.includes('moderate')) return 'chip-readable'
  return 'rounded-full border border-red-700/10 bg-red-50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-red-800'
}

function typeClass(type: SearchType) {
  return type === 'Herb'
    ? 'rounded-full border border-brand-700/10 bg-brand-50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-800'
    : 'rounded-full border border-blue-700/10 bg-blue-50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-blue-800'
}

function compareAuthority(a: SearchItem, b: SearchItem) {
  if (b.discoveryScore !== a.discoveryScore) return b.discoveryScore - a.discoveryScore
  if (b.authorityScore !== a.authorityScore) return b.authorityScore - a.authorityScore
  return a.name.localeCompare(b.name)
}

function getSearchIntent(query: string): SearchIntent {
  const value = query.toLowerCase()

  if (/safe|safety|risk|avoid|interaction|contraindication|warning|pregnancy|side effect/.test(value)) return 'safety'
  if (/evidence|study|studies|clinical|human|trial|meta|systematic|strongest|proven|research/.test(value)) return 'evidence'
  if (/mechanism|pathway|receptor|target|how does|works|action|bioavailability/.test(value)) return 'mechanism'
  if (/compare|comparison|versus|vs\.?|alternative|similar|better|stronger/.test(value)) return 'comparison'

  return 'general'
}

function weightedSearchScore(item: SearchItem, relevanceScore: number, intent: SearchIntent) {
  if (intent === 'evidence') {
    return relevanceScore * 0.58 + item.evidenceScore * 0.18 + item.authorityScore * 0.16 + item.discoveryScore * 0.08
  }

  if (intent === 'safety') {
    return relevanceScore * 0.58 + (1 - item.safetyPenalty) * 0.18 + item.authorityScore * 0.12 + (1 - item.uncertaintyPenalty) * 0.12
  }

  if (intent === 'mechanism') {
    return relevanceScore * 0.56 + item.mechanismScore * 0.2 + item.ecosystemScore * 0.14 + item.discoveryScore * 0.1
  }

  if (intent === 'comparison') {
    return relevanceScore * 0.54 + item.ecosystemScore * 0.18 + item.discoveryScore * 0.14 + item.authorityScore * 0.1 + (1 - item.translationalPenalty) * 0.04
  }

  return relevanceScore * 0.7 + item.discoveryScore * 0.2 + item.authorityScore * 0.1
}

function normalizeItem(item: any, type: SearchType): SearchItem | null {
  const slug = text(item.slug || item.id)
  if (!slug) return null

  const name = getName(item)
  if (!name || !isClean(name)) return null

  const summary = getSummary(item, type)
  const effects = getEffects(item)
  const evidence = getEvidence(item)
  const safety = getSafety(item)
  const quality = getQuality(item)
  const href = type === 'Herb' ? `/herbs/${slug}` : `/compounds/${slug}`
  const orchestration = getSemanticOrchestrationSignals(item)

  return {
    slug,
    name,
    type,
    href,
    summary,
    effects,
    evidence,
    safety,
    quality,
    authorityScore: orchestration.authorityScore,
    discoveryScore: orchestration.discoveryScore,
    evidenceScore: orchestration.evidenceScore,
    mechanismScore: orchestration.mechanismDensity,
    ecosystemScore: orchestration.ecosystemDensity,
    safetyPenalty: orchestration.safetyPenalty,
    uncertaintyPenalty: orchestration.uncertaintyPenalty,
    translationalPenalty: orchestration.translationalPenalty,
    searchText: [name, slug, summary, effects.join(' '), evidence, safety, quality].join(' '),
  }
}

function ResultCard({ item }: { item: SearchItem }) {
  return (
    <article className="card-premium group flex h-full flex-col p-5 sm:p-6">
      <div className="metadata-row">
        <span className={typeClass(item.type)}>{item.type}</span>
        <span className={evidenceClass(item.evidence)}>{item.evidence}</span>
        <span className={safetyClass(item.safety)}>{item.safety}</span>
      </div>

      <div className="mt-5 flex flex-1 flex-col">
        <div className="space-y-3">
          <div className="space-y-2">
            <p className="text-[0.7rem] font-bold uppercase tracking-[0.16em] text-brand-700">
              {item.quality}
            </p>
            <h2 className="max-w-[20ch] text-[1.45rem] font-semibold leading-tight tracking-tight text-ink transition-colors duration-300 group-hover:text-brand-700">
              {item.name}
            </h2>
          </div>

          <p className="line-clamp-4 text-sm leading-7 text-[#46574d]">
            {item.summary}
          </p>
        </div>

        {item.effects.length > 0 ? (
          <div className="mt-5 border-t border-brand-900/10 pt-4">
            <p className="mb-2 text-[0.68rem] font-bold uppercase tracking-[0.16em] text-[#66756d]">
              Signals
            </p>
            <div className="flex flex-wrap gap-2">
              {item.effects.map(effect => (
                <span key={effect} className="rounded-full border border-brand-900/10 bg-paper-50 px-3 py-1 text-xs font-medium text-[#33443a]">
                  {effect}
                </span>
              ))}
            </div>
          </div>
        ) : null}

        <div className="mt-auto pt-6">
          <Link href={item.href} className="button-secondary w-full rounded-full px-4 py-2.5 text-sm sm:w-auto">
            Open Profile
          </Link>
        </div>
      </div>
    </article>
  )
}

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<FilterType>('All')

  const normalizedQuery = query.trim()
  const searchIntent = getSearchIntent(normalizedQuery)

  const searchItems = useMemo(() => {
    const herbs = (herbsData as any[]).map(item => normalizeItem(item, 'Herb')).filter(Boolean) as SearchItem[]
    const compounds = (compoundsData as any[]).map(item => normalizeItem(item, 'Compound')).filter(Boolean) as SearchItem[]
    return [...herbs, ...compounds].sort(compareAuthority)
  }, [])

  const fuse = useMemo(() => new Fuse(searchItems, {
    keys: [
      { name: 'name', weight: 0.4 },
      { name: 'summary', weight: 0.2 },
      { name: 'effects', weight: 0.25 },
      { name: 'searchText', weight: 0.15 },
    ],
    threshold: 0.34,
    ignoreLocation: true,
    includeScore: true,
  }), [searchItems])

  const results = useMemo(() => {
    const baseResults = !normalizedQuery
      ? searchItems.slice(0, 36)
      : fuse.search(normalizedQuery)
          .map(result => ({
            item: result.item,
            relevanceScore: 1 - (result.score ?? 1),
          }))
          .sort((a, b) => {
            const weightedB = weightedSearchScore(b.item, b.relevanceScore, searchIntent)
            const weightedA = weightedSearchScore(a.item, a.relevanceScore, searchIntent)
            if (weightedB !== weightedA) return weightedB - weightedA
            return compareAuthority(a.item, b.item)
          })
          .map(result => result.item)
          .slice(0, 60)

    if (activeFilter === 'All') return baseResults

    return baseResults.filter(item => item.type === activeFilter)
  }, [normalizedQuery, searchIntent, fuse, searchItems, activeFilter])

  const herbs = results.filter(item => item.type === 'Herb')
  const compounds = results.filter(item => item.type === 'Compound')
  const hasResults = results.length > 0

  return (
    <main className="min-h-screen bg-background text-ink">
      <section className="container-page py-12 sm:py-16 lg:py-20">
        <div className="section-spacing">
          <section className="hero-shell rounded-[2rem] border border-brand-900/10 p-6 shadow-card sm:p-8 lg:p-10">
            <div className="max-w-4xl space-y-6">
              <div className="space-y-3">
                <p className="eyebrow-label">Scientific Discovery</p>
                <h1 className="max-w-[13ch]">Search the Library</h1>
              </div>

              <p className="detail-reading text-[1.05rem] sm:text-lg">
                Search herbs and compounds by name, mechanism, evidence signal, safety context, or wellness target.
              </p>

              <div className="surface-depth rounded-[1.75rem] p-3 sm:p-4">
                <label htmlFor="site-search" className="sr-only">Search herbs and compounds</label>
                <input
                  id="site-search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search sleep, magnesium, stress, inflammation..."
                  className="min-h-14 w-full rounded-2xl border border-brand-900/10 bg-white/90 px-5 py-4 text-base font-medium text-ink shadow-sm outline-none transition-all placeholder:text-[#7b887f] focus:border-brand-600/30 focus:bg-white focus:ring-4 focus:ring-brand-500/15 sm:text-lg"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {filterOptions.map(filter => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setActiveFilter(filter)}
                    className={activeFilter === filter
                      ? 'button-primary rounded-full px-4 py-2 text-sm'
                      : 'chip-readable'}
                  >
                    {filter}
                  </button>
                ))}
              </div>

              <div className="metadata-row">
                <span className="chip-readable">{searchItems.length} searchable profiles</span>
                <span className="chip-readable">Semantic retrieval enabled</span>
                <span className="chip-readable">Evidence-weighted discovery</span>
              </div>
            </div>
          </section>

          <section className="surface-subtle rounded-[2rem] p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="eyebrow-label">Suggested searches</p>
                <p className="mt-2 text-sm leading-7 text-[#46574d]">Start with a wellness target, pathway, compound, or mechanism.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {suggestedSearches.map(term => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => setQuery(term)}
                    className="rounded-full border border-brand-900/10 bg-white/80 px-4 py-2 text-sm font-semibold text-[#33443a] shadow-sm transition hover:border-brand-700/20 hover:bg-white hover:text-brand-800"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {hasResults ? (
            <div className="detail-stack">
              {herbs.length > 0 ? (
                <section className="space-y-5">
                  <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                      <p className="eyebrow-label">Herbs</p>
                      <h2 className="mt-2 max-w-none text-2xl font-semibold tracking-tight text-ink sm:text-3xl">Botanical matches</h2>
                    </div>
                    <span className="chip-readable">{herbs.length} results</span>
                  </div>
                  <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {herbs.map(item => <ResultCard key={`${item.type}-${item.slug}`} item={item} />)}
                  </div>
                </section>
              ) : null}

              {compounds.length > 0 ? (
                <section className="space-y-5">
                  <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                      <p className="eyebrow-label">Compounds</p>
                      <h2 className="mt-2 max-w-none text-2xl font-semibold tracking-tight text-ink sm:text-3xl">Compound matches</h2>
                    </div>
                    <span className="chip-readable">{compounds.length} results</span>
                  </div>
                  <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {compounds.map(item => <ResultCard key={`${item.type}-${item.slug}`} item={item} />)}
                  </div>
                </section>
              ) : null}
            </div>
          ) : (
            <section className="section-frame text-center">
              <p className="eyebrow-label mx-auto">No matches found</p>
              <h2 className="mx-auto mt-3 max-w-[16ch] text-3xl font-semibold tracking-tight text-ink">Try a broader discovery path</h2>
              <p className="mx-auto mt-4 max-w-reading text-sm leading-7 text-[#46574d] sm:text-base">
                Search by outcome, mechanism, compound class, or common supplement name.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                {suggestedSearches.slice(0, 4).map(term => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => setQuery(term)}
                    className="chip-readable hover:text-brand-800"
                  >
                    {term}
                  </button>
                ))}
              </div>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Link href="/herbs" className="button-secondary rounded-full">Browse Herbs</Link>
                <Link href="/compounds" className="button-primary rounded-full">Browse Compounds</Link>
              </div>
            </section>
          )}
        </div>
      </section>
    </main>
  )
}
