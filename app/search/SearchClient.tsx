'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import Fuse from 'fuse.js'
import compoundsSummaryData from '@/public/data/compounds-summary.json'
import herbsSummaryData from '@/public/data/herbs-summary.json'
import { cleanSummary, formatDisplayLabel, isClean, labelize, list, text, unique } from '@/lib/display-utils'
import DosingSafetyChecker from '@/components/search/DosingSafetyChecker'
import { ShieldAlert } from 'lucide-react'
import clsx from 'clsx'
import {
  decisionChipClass,
  decisionMetadataClusterClass,
  decisionMetricShellClass,
  decisionMicroLabelClass,
  decisionStatusBadgeClass,
  normalizeDecisionEvidence,
  normalizeDecisionSafety,
} from '@/lib/decision-primitives'
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
  avoid_if?: string[]
  side_effects?: string[]
  contraindications?: string[]
  interactions?: string[]
  typical_dosage?: string
}

type DiscoveryPath = {
  label: string
  query: string
  description: string
}

type IntentPrompt = {
  label: string
  query: string
  helper: string
}

type DiscoveryLink = {
  label: string
  href: string
  description: string
}

const discoveryPaths: DiscoveryPath[] = [
  {
    label: 'Stress support',
    query: 'stress',
    description: 'Calm, adaptation, and safety context before choosing a profile.',
  },
  {
    label: 'Sleep',
    query: 'sleep',
    description: 'Wind-down, sleep quality, recovery, and next-day fit.',
  },
  {
    label: 'Cognition',
    query: 'cognition',
    description: 'Memory, mental performance, and mechanism-oriented evidence.',
  },
  {
    label: 'Inflammation',
    query: 'inflammation',
    description: 'Inflammatory, antioxidant, and pain-adjacent pathways.',
  },
  {
    label: 'Energy',
    query: 'energy',
    description: 'Fatigue, vitality, and stimulant-adjacent safety signals.',
  },
  {
    label: 'Focus',
    query: 'focus',
    description: 'Attention, fatigue, and non-jittery support paths.',
  },
  {
    label: 'Recovery',
    query: 'recovery',
    description: 'Sleep, soreness, stress load, and practical context.',
  },
]

const filterOptions: FilterType[] = ['All', 'Herb', 'Compound']

const intentPrompts: IntentPrompt[] = [
  { label: 'Focus without heavy stimulation', query: 'focus daytime non stimulant', helper: 'Daytime-friendly support with lower jitter risk.' },
  { label: 'Stress support with lower sedation', query: 'stress calm non sedating', helper: 'Calmer profiles that avoid heavy wind-down effects.' },
  { label: 'Beginner-friendly options', query: 'beginner safety low risk', helper: 'Conservative entries with practical safety context.' },
  { label: 'Compare calming vs stimulating approaches', query: 'calming vs stimulating compare', helper: 'Open compare pages before narrowing into profiles.' },
]

const discoveryFilters: IntentPrompt[] = [
  { label: 'Calming', query: 'calm anxiety stress', helper: 'Lower-arousal support paths.' },
  { label: 'Stimulating', query: 'energy motivation stimulation', helper: 'Activation-oriented profiles.' },
  { label: 'Beginner-friendly', query: 'beginner safety low risk', helper: 'Safer orientation for first-time exploration.' },
  { label: 'Low tolerance risk', query: 'low tolerance risk safety', helper: 'Prioritize conservative safety framing.' },
  { label: 'Evidence-informed', query: 'clinical evidence human trial', helper: 'Bias toward stronger study context.' },
  { label: 'Sleep-supportive', query: 'sleep recovery wind down', helper: 'Evening and sleep-adjacent support.' },
  { label: 'Daytime-friendly', query: 'daytime focus non sedating', helper: 'Use when you need calmer daytime function.' },
]

const crossContentLinks: { goals: DiscoveryLink[]; compare: DiscoveryLink[]; learn: DiscoveryLink[] } = {
  goals: [
    { label: 'Sleep support goals', href: '/goals/sleep-support', description: 'Start with outcome constraints before profile selection.' },
    { label: 'Non-stimulant focus goals', href: '/goals/non-stimulant-focus', description: 'Build focus plans with lower stimulation load.' },
  ],
  compare: [
    { label: 'Dynamic comparison matrix', href: '/compare/dynamic', description: 'Contrast common strategy patterns first.' },
    { label: 'L-theanine vs magnesium', href: '/compare/l-theanine-vs-magnesium', description: 'Compare calming support styles with practical tradeoffs.' },
  ],
  learn: [
    { label: 'Evidence levels', href: '/education/evidence-levels', description: 'Understand what confidence labels do and do not mean.' },
    { label: 'Safety and disclaimers', href: '/education/safety-and-disclaimers', description: 'Beginner-first safety framing and scope limits.' },
  ],
}

function getName(item: any) {
  return formatDisplayLabel(item.displayName) || formatDisplayLabel(item.name) || formatDisplayLabel(item.slug)
}

function getSummary(item: any, type: SearchType) {
  const summary =
    item.short_earthy_summary ||
    item.shortEarthySummary ||
    item.summaryShort ||
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
    ...list(item.primaryActions),
    ...list(item.effects),
    ...list(item.mechanisms),
    ...list(item.primaryDomain),
  ])
    .filter(isClean)
    .slice(0, 4)
}

function getEvidence(item: any) {
  return normalizeDecisionEvidence(
    item.evidence_tier ||
      item.evidenceTier ||
      item.safety?.evidenceTier ||
      item.evidence_grade ||
      item.evidenceLevel ||
      item.confidence ||
      item.summary_quality,
    'Needs review'
  )
}

function getSafety(item: any) {
  return normalizeDecisionSafety(
    item.safety_level ||
      item.safetyLevel ||
      item.safety?.confidence ||
      item.safetyNotes ||
      item.confidenceTier ||
      item.profile_status,
    { hasSafetyNotes: Boolean(item.safetyNotes || item.safety_notes || item.safety) }
  )
}

function getQuality(item: any) {
  return labelize(item.profile_status || item.summary_quality || item.review_status || item.status || item.confidence, 'Profile Review')
}

function typeClass(type: SearchType) {
  return type === 'Herb'
    ? `${decisionStatusBadgeClass} border-brand-700/10 bg-brand-50 text-brand-800`
    : `${decisionStatusBadgeClass} border-blue-700/10 bg-blue-50 text-blue-800`
}

function compareAuthority(a: SearchItem, b: SearchItem) {
  if (b.discoveryScore !== a.discoveryScore) return b.discoveryScore - a.discoveryScore
  if (b.authorityScore !== a.authorityScore) return b.authorityScore - a.authorityScore
  return a.name.localeCompare(b.name)
}

function getSearchIntent(query: string): SearchIntent {
  const value = query.toLowerCase()

  if (/safe|safety|risk|avoid|interaction|contraindication|warning|pregnancy|side effect/.test(value)) return 'safety'
  if (/evidence|study|studies|clinical|human|trial|meta|systematic|research/.test(value)) return 'evidence'
  if (/mechanism|pathway|receptor|target|how does|works|action|bioavailability/.test(value)) return 'mechanism'
  if (/compare|comparison|versus|vs\.?|alternative|similar/.test(value)) return 'comparison'

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
  const rawSlug = text(item.slug || item.id)
  if (!rawSlug) return null
  const slug = rawSlug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

  const name = getName(item)
  if (!name || !isClean(name)) return null

  const summary = getSummary(item, type)
  const effects = getEffects(item)
  const evidence = getEvidence(item)
  const safety = getSafety(item)
  const quality = getQuality(item)
  const href = type === 'Herb' ? `/herbs/${slug}` : `/compounds/${slug}`
  const orchestration = getSemanticOrchestrationSignals(item)
  const aliases = list(item.aliases).join(' ')

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
    searchText: [name, slug, aliases, summary, effects.join(' '), evidence, safety, quality].join(' '),
    typical_dosage: text(item.typical_dosage || item.typicalDosage || item.preparation || item.dosage),
    avoid_if: list(item.avoid_if || item.avoidIf || item.contraindications || item.interactions || item.safetyNotes || item.safety),
    side_effects: list(item.side_effects || item.sideEffects || item.safetyNotes),
    contraindications: list(item.contraindications || item.avoid_if || item.avoidIf),
    interactions: list(item.interactions),
  }
}

function SearchMetric({ label, value }: { label: string; value?: string }) {
  if (!value) return null

  return (
    <div className={decisionMetricShellClass}>
      <p className={`${decisionMicroLabelClass} text-[#68786f]`}>{label}</p>
      <p className="mt-1 line-clamp-2 text-sm font-semibold leading-5 text-[#26382f]">{value}</p>
    </div>
  )
}

function ResultCard({ item }: { item: SearchItem }) {
  const bestFor = item.effects.slice(0, 2).join(' • ') || 'Research context'
  const mechanisms = item.effects.slice(2, 4)

  return (
    <Link
      href={item.href}
      className="group flex h-full min-h-[13.5rem] flex-col rounded-[1.3rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-brand-700/20 hover:bg-white hover:shadow-[var(--shadow-card-calm)] focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-700/40 sm:min-h-[15rem] sm:p-5"
    >
      <div className="flex flex-1 flex-col">
        <div className={decisionMetadataClusterClass}>
          <span className={typeClass(item.type)}>{item.type}</span>
        </div>

        <div className="mt-3 flex min-w-0 items-start justify-between gap-3">
          <h2 className="min-w-0 break-words text-[1.3rem] font-semibold leading-tight tracking-tight text-ink transition group-hover:text-brand-800 sm:text-2xl">
            {item.name}
          </h2>
        </div>

        <p className="mt-2.5 line-clamp-2 text-[0.95rem] leading-6 text-[#46574d]">
          {item.summary || 'A conservative profile with evidence, safety, and practical context.'}
        </p>

        <div className="mt-3 rounded-[1.1rem] border border-brand-900/10 bg-brand-50/45 p-2.5 sm:p-3">
          <p className={`${decisionMicroLabelClass} text-brand-800`}>May be relevant for</p>
          <p className="mt-1.5 text-base font-semibold leading-6 text-[#203329]">{bestFor}</p>
        </div>

        <div className="mt-2.5 grid gap-2 sm:grid-cols-2 sm:gap-2.5">
          <SearchMetric label="Evidence" value={item.evidence} />
          <SearchMetric label="Safety" value={item.safety} />
        </div>

        {mechanisms.length > 0 ? (
          <div className={`${decisionMetadataClusterClass} mt-2.5 border-t border-brand-900/10 pt-3`}>
            {mechanisms.map(effect => (
              <span key={effect} className={decisionChipClass}>
                {effect}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      <div className="mt-3 flex min-h-10 items-center justify-center rounded-full bg-brand-800 px-4 py-3 text-sm font-bold text-white transition group-hover:bg-brand-900 group-focus-visible:bg-brand-900">
        Investigate profile <span className="ml-2 transition group-hover:translate-x-0.5" aria-hidden="true">→</span>
      </div>
    </Link>
  )
}

function GuidedDiscovery({ onSelect }: { onSelect: (query: string) => void }) {
  return (
    <section className="rounded-[1.5rem] border border-brand-900/10 bg-white/70 p-3.5 sm:p-5 shadow-sm sm:p-5" aria-labelledby="guided-discovery-heading">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl space-y-2">
          <p className="eyebrow-label">Guided discovery</p>
          <h2 id="guided-discovery-heading" className="compact-heading">Start broad, then narrow only when useful.</h2>
          <p className="text-sm leading-6 text-[#46574d]">
            These entry points are orientation tools, not deterministic recommendations.
          </p>
        </div>
        <Link href="/goals" className="w-fit text-sm font-bold text-brand-800 transition hover:text-brand-900">Browse goal guides →</Link>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {discoveryPaths.map(path => (
          <button
            key={path.label}
            type="button"
            onClick={() => onSelect(path.query)}
            className="group rounded-xl border border-brand-900/10 bg-white/90 px-3 py-2.5 text-left transition hover:border-brand-700/20 hover:bg-white"
          >
            <span className="text-sm font-semibold tracking-tight text-ink transition group-hover:text-brand-800">{path.label}</span>
            <span className="mt-1 block text-xs leading-5 text-[#46574d]">{path.description}</span>
          </button>
        ))}
      </div>
    </section>
  )
}

function EmptySearchState({ onSelect, onReset }: { onSelect: (query: string) => void; onReset: () => void }) {
  return (
    <section className="rounded-[1.3rem] border border-brand-900/10 bg-white/85 p-4 sm:p-5 shadow-[var(--shadow-card-calm)]">
      <div className="max-w-2xl space-y-3">
        <p className="eyebrow-label">No matching profiles</p>
        <h2 className="compact-heading">Try a broader discovery path.</h2>
        <p className="text-sm leading-6 text-[#46574d] sm:text-base">
          Search by goal, mechanism, compound class, or common supplement name. Evidence and safety labels stay conservative when source data is incomplete.
        </p>
      </div>

      <div className="mt-5 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap">
        <button type="button" onClick={onReset} className="button-primary min-h-11 justify-center px-3.5 py-2 text-sm">
          Reset search
        </button>
        {discoveryPaths.slice(0, 4).map(path => (
          <button
            key={path.label}
            type="button"
            onClick={() => onSelect(path.query)}
            className="button-secondary min-h-11 justify-center px-3.5 py-2 text-sm"
          >
            {path.label}
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-2.5 lg:grid-cols-3">
        <div className="rounded-xl border border-brand-900/10 bg-white/90 p-3">
          <p className="eyebrow-label">Related goals</p>
          <ul className="mt-2 space-y-2">
            {crossContentLinks.goals.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-sm font-semibold text-brand-800 hover:text-brand-900">{item.label} →</Link>
                <p className="mt-0.5 text-xs leading-5 text-[#5f6f66]">{item.description}</p>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-brand-900/10 bg-white/90 p-3">
          <p className="eyebrow-label">Related compare pages</p>
          <ul className="mt-2 space-y-2">
            {crossContentLinks.compare.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-sm font-semibold text-brand-800 hover:text-brand-900">{item.label} →</Link>
                <p className="mt-0.5 text-xs leading-5 text-[#5f6f66]">{item.description}</p>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-brand-900/10 bg-white/90 p-3">
          <p className="eyebrow-label">Beginner guidance</p>
          <ul className="mt-2 space-y-2">
            {crossContentLinks.learn.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-sm font-semibold text-brand-800 hover:text-brand-900">{item.label} →</Link>
                <p className="mt-0.5 text-xs leading-5 text-[#5f6f66]">{item.description}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

const LAYPERSON_SYNONYMS: Record<string, string[]> = {
  sleep: ['insomnia', 'somnifera', 'melatonin', 'rest', 'gabaergic', 'wind down', 'relaxation'],
  stress: ['cortisol', 'adaptogen', 'adrenal', 'anxiety', 'calm'],
  anxiety: ['anxiolytic', 'nervous', 'calm', 'relax', 'tension', 'stress'],
  focus: ['attention', 'concentration', 'nootropic', 'caffeine', 'dopamine', 'alertness'],
  energy: ['fatigue', 'stamina', 'vitality', 'atp', 'mitochondrial', 'caffeine'],
  pain: ['analgesic', 'inflammation', 'inflammatory', 'antinociceptive', 'joint'],
  brain: ['cognition', 'nootropic', 'memory', 'acetylcholine', 'neurological'],
  aging: ['longevity', 'antioxidant', 'senescence', 'sirt1', 'autophagy'],
  heart: ['cardiovascular', 'blood pressure', 'circulation', 'cholesterol'],
  gut: ['digestion', 'probiotic', 'microbiome', 'gastrointestinal'],
}

function expandQuery(query: string): string {
  const normalized = query.toLowerCase().trim()
  if (!normalized) return ''
  const words = normalized.split(/\s+/)
  const expandedWords = new Set<string>(words)
  
  words.forEach(word => {
    if (LAYPERSON_SYNONYMS[word]) {
      LAYPERSON_SYNONYMS[word].forEach(syn => expandedWords.add(syn))
    }
    Object.keys(LAYPERSON_SYNONYMS).forEach(key => {
      if (word.includes(key) || key.includes(word)) {
        LAYPERSON_SYNONYMS[key].forEach(syn => expandedWords.add(syn))
      }
    })
  })
  
  return Array.from(expandedWords).join(' ')
}

export default function SearchClient() {
  const [query, setQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<FilterType>('All')
  const [trialsFilter, setTrialsFilter] = useState(false)
  const [safetyFilter, setSafetyFilter] = useState(false)
  const [mechanismFilter, setMechanismFilter] = useState(false)

  const normalizedQuery = query.trim()
  const searchIntent = getSearchIntent(normalizedQuery)

  const searchItems = useMemo(() => {
    const herbs = (herbsSummaryData as any[]).map(item => normalizeItem(item, 'Herb')).filter(Boolean) as SearchItem[]
    const compounds = (compoundsSummaryData as any[]).map(item => normalizeItem(item, 'Compound')).filter(Boolean) as SearchItem[]
    return [...herbs, ...compounds].sort(compareAuthority)
  }, [])

  const expandedQueryText = useMemo(() => {
    return expandQuery(normalizedQuery)
  }, [normalizedQuery])

  const suggestions = useMemo(() => {
    if (!normalizedQuery) return []
    const lowerQuery = normalizedQuery.toLowerCase()
    return searchItems
      .filter(item => {
        const matchesName = item.name.toLowerCase().includes(lowerQuery)
        const matchesText = item.searchText.toLowerCase().includes(lowerQuery)
        return matchesName || (matchesText && lowerQuery.length > 2)
      })
      .slice(0, 5)
  }, [normalizedQuery, searchItems])

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
    let baseResults = !normalizedQuery
      ? searchItems.slice(0, 18)
      : fuse.search(expandedQueryText)
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

    if (activeFilter !== 'All') {
      baseResults = baseResults.filter(item => item.type === activeFilter)
    }

    if (trialsFilter) {
      baseResults = baseResults.filter(item =>
        ['Strong evidence', 'Moderate evidence'].includes(item.evidence)
      )
    }

    if (safetyFilter) {
      baseResults = baseResults.filter(item =>
        item.safety === 'Generally well tolerated'
      )
    }

    if (mechanismFilter) {
      baseResults = baseResults.filter(item =>
        item.mechanismScore > 0.4 || item.effects.length > 2
      )
    }

    return baseResults.slice(0, 36)
  }, [normalizedQuery, expandedQueryText, searchIntent, fuse, searchItems, activeFilter, trialsFilter, safetyFilter, mechanismFilter])

  const herbs = results.filter(item => item.type === 'Herb')
  const compounds = results.filter(item => item.type === 'Compound')
  const hasResults = results.length > 0
  const hasActiveSearch = Boolean(normalizedQuery) || activeFilter !== 'All' || trialsFilter || safetyFilter || mechanismFilter
  const resultLabel = hasActiveSearch ? `${results.length} matches` : 'High-signal starting points'

  function selectDiscovery(queryValue: string) {
    setQuery(queryValue)
    setActiveFilter('All')
  }

  function resetSearch() {
    setQuery('')
    setActiveFilter('All')
    setTrialsFilter(false)
    setSafetyFilter(false)
    setMechanismFilter(false)
  }

  return (
    <main className="min-h-screen bg-background text-ink">
      <section className="container-page py-6 sm:py-10 lg:py-14">
        <div className="space-y-5 sm:space-y-7 lg:space-y-9">
          <section className="hero-shell rounded-[1.7rem] border border-brand-900/10 p-4 shadow-card sm:rounded-[2rem] sm:p-7 lg:p-9" aria-labelledby="search-heading">
            <div className="max-w-4xl space-y-4">
              <div className="space-y-2.5">
                <p className="eyebrow-label">Evidence discovery</p>
                <h1 id="search-heading" className="max-w-[13ch] text-balance">Search the library</h1>
              </div>

              <p className="max-w-2xl text-base leading-7 text-[#46574d] sm:text-lg sm:leading-8">
                Search herbs and compounds by name, goal, mechanism, evidence signal, or safety context. Start broad, then use light filters only when they help.
              </p>

              <div className="grid gap-2 sm:grid-cols-2">
                {intentPrompts.map((intent) => (
                  <button
                    key={intent.label}
                    type="button"
                    onClick={() => setQuery(intent.query)}
                    className="rounded-xl border border-brand-900/10 bg-white/90 px-3 py-2.5 text-left transition hover:border-brand-700/20 hover:bg-white"
                  >
                    <p className="text-sm font-semibold text-ink">{intent.label}</p>
                    <p className="mt-0.5 text-xs leading-5 text-[#5f6f66]">{intent.helper}</p>
                  </button>
                ))}
              </div>
              <div className="relative rounded-[1.5rem] border border-brand-900/10 bg-white/80 p-2.5 sm:p-4 shadow-sm">
                <label htmlFor="site-search" className="sr-only">Search herbs and compounds</label>
                <input
                  id="site-search"
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Try sleep, magnesium, stress, inflammation..."
                  className="min-h-12 w-full rounded-[1.1rem] border border-brand-900/10 bg-white px-4 py-3 text-base font-medium text-ink shadow-sm outline-none transition-all placeholder:text-[#7b887f] focus:border-brand-600/30 focus:bg-white focus:ring-4 focus:ring-brand-500/15 sm:px-5 sm:text-lg"
                  autoComplete="off"
                />

                {suggestions.length > 0 && (
                  <div className="absolute left-2.5 right-2.5 mt-2 z-50 rounded-xl border border-brand-900/10 bg-white/95 p-2 shadow-lg backdrop-blur-xl">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted px-2 py-1">Quick match suggestions</p>
                    <ul className="space-y-0.5">
                      {suggestions.map((suggestion) => (
                        <li key={suggestion.slug}>
                          <button
                            type="button"
                            onClick={() => {
                              setQuery(suggestion.name)
                            }}
                            className="w-full text-left px-2.5 py-2 text-sm rounded-lg hover:bg-slate-50 transition flex items-center justify-between"
                          >
                            <span className="font-semibold text-ink">{suggestion.name}</span>
                            <span className={clsx(
                              "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border",
                              suggestion.type === 'Herb'
                                ? "border-emerald-700/10 bg-emerald-50 text-emerald-800"
                                : "border-blue-700/10 bg-blue-50 text-blue-800"
                            )}>
                              {suggestion.type}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <details className="rounded-[1.2rem] border border-brand-900/10 bg-[#fbfaf6]/80 p-2.5 sm:p-4" open={hasActiveSearch || undefined}>
                <summary className="flex min-h-12 cursor-pointer items-center justify-between gap-4 text-sm font-bold text-ink">
                  <span>Refine results</span>
                  <span className="text-brand-800" aria-hidden="true">↓</span>
                </summary>
                <div className="mt-3 space-y-3.5">
                  <div className="grid gap-2 sm:flex sm:flex-wrap">
                    {filterOptions.map(filter => (
                      <button
                        key={filter}
                        type="button"
                        onClick={() => setActiveFilter(filter)}
                        className={activeFilter === filter
                          ? 'button-primary min-h-11 rounded-full px-3.5 py-2 text-sm'
                          : 'min-h-11 rounded-full border border-brand-900/10 bg-white/80 px-3.5 py-2 text-sm font-semibold text-[#33443a] transition hover:border-brand-700/20 hover:bg-white hover:text-brand-800'}
                      >
                        {filter === 'All' ? 'All profiles' : `${filter}s only`}
                      </button>
                    ))}
                  </div>
                  <p className="text-sm leading-6 text-[#5f6f66]">
                    Filters are intentionally light: use profile type when you already know whether you want a botanical profile or a constituent profile.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {discoveryFilters.map((filter) => (
                      <button
                        key={filter.label}
                        type="button"
                        onClick={() => setQuery(filter.query)}
                        className="rounded-full border border-brand-900/10 bg-white/90 px-3 py-2 text-xs font-semibold tracking-wide text-[#33443a] transition hover:border-brand-700/20 hover:text-brand-800"
                        aria-label={`Search for ${filter.label.toLowerCase()} profiles`}
                      >
                        {filter.label}
                      </button>
                    ))}
                  </div>
                  <div className="border-t border-brand-900/10 pt-3.5 space-y-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-brand-800">Advanced Safety & Evidence filters</p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setTrialsFilter(v => !v)}
                        className={clsx(
                          "min-h-9 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition",
                          trialsFilter
                            ? "bg-brand-800 border-brand-800 text-white shadow-sm"
                            : "bg-white border-brand-900/10 text-brand-900 hover:bg-slate-50"
                        )}
                      >
                        Human Trials Available
                      </button>
                      <button
                        type="button"
                        onClick={() => setSafetyFilter(v => !v)}
                        className={clsx(
                          "min-h-9 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition",
                          safetyFilter
                            ? "bg-brand-800 border-brand-800 text-white shadow-sm"
                            : "bg-white border-brand-900/10 text-brand-900 hover:bg-slate-50"
                        )}
                      >
                        High Safety Rating
                      </button>
                      <button
                        type="button"
                        onClick={() => setMechanismFilter(v => !v)}
                        className={clsx(
                          "min-h-9 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition",
                          mechanismFilter
                            ? "bg-brand-800 border-brand-800 text-white shadow-sm"
                            : "bg-white border-brand-900/10 text-brand-900 hover:bg-slate-50"
                        )}
                      >
                        Clear Mechanisms Mapped
                      </button>
                    </div>
                  </div>
                </div>
              </details>

              <div className="flex flex-wrap gap-1.5">
                <span className="chip-readable">{searchItems.length} searchable profiles</span>
                <span className="chip-readable">Evidence-weighted ranking</span>
                <span className="chip-readable">Conservative safety labels</span>
              </div>
            </div>
          </section>

          {/* Dosing safety checker */}
          <details className="rounded-[1.5rem] border border-amber-200 bg-[#fffdf7] p-2.5 sm:p-4 shadow-sm">
            <summary className="flex min-h-12 cursor-pointer items-center justify-between gap-4 text-sm font-bold text-amber-900">
              <span className="flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-amber-700 shrink-0" />
                <span>Personalized Dosing & Safety Reference Checker</span>
              </span>
              <span className="text-amber-700">Open Dosing Checker →</span>
            </summary>
            <div className="mt-4">
              <DosingSafetyChecker items={searchItems} />
            </div>
          </details>

          <GuidedDiscovery onSelect={selectDiscovery} />

          <section className="space-y-4" aria-labelledby="search-results-heading">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div className="max-w-2xl space-y-2">
                <p className="eyebrow-label">Results</p>
                <h2 id="search-results-heading" className="compact-heading">
                  {hasActiveSearch ? 'Profiles matching your scan.' : 'High-confidence profiles to learn the pattern.'}
                </h2>
                <p className="text-sm leading-6 text-[#5f6f66]">
                  {hasActiveSearch
                    ? 'Open a profile when the evidence and safety context look worth investigating further.'
                    : 'These are starting points sorted by discovery and authority signals, not promised outcomes.'}
                </p>
              </div>
              <span className="inline-flex w-fit rounded-full border border-brand-900/10 bg-white/70 px-3.5 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[#5f6f66]">
                {resultLabel}
              </span>
            </div>

            {!hasResults ? (
              <EmptySearchState onSelect={selectDiscovery} onReset={resetSearch} />
            ) : (
              <div className="detail-stack">
                {results.length > 0 && results.length < 4 ? (
                  <div className="rounded-[1.2rem] border border-brand-900/10 bg-white/80 p-4 text-sm leading-6 text-[#46574d] shadow-sm">
                    Sparse match set. Try a broader term such as stress, sleep, focus, inflammation, or recovery if you want more profiles to compare.
                  </div>
                ) : null}

                {herbs.length > 0 ? (
                  <section className="space-y-4">
                    <div className="flex flex-wrap items-end justify-between gap-3">
                      <div>
                        <p className="eyebrow-label">Herbs</p>
                        <h3 className="mt-2 max-w-none text-2xl font-semibold tracking-tight text-ink sm:text-3xl">Botanical matches</h3>
                      </div>
                      <span className="chip-readable">{herbs.length} results</span>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                      {herbs.map(item => <ResultCard key={`${item.type}-${item.slug}`} item={item} />)}
                    </div>
                  </section>
                ) : null}

                {compounds.length > 0 ? (
                  <section className="space-y-4">
                    <div className="flex flex-wrap items-end justify-between gap-3">
                      <div>
                        <p className="eyebrow-label">Compounds</p>
                        <h3 className="mt-2 max-w-none text-2xl font-semibold tracking-tight text-ink sm:text-3xl">Compound matches</h3>
                      </div>
                      <span className="chip-readable">{compounds.length} results</span>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                      {compounds.map(item => <ResultCard key={`${item.type}-${item.slug}`} item={item} />)}
                    </div>
                  </section>
                ) : null}
              </div>
            )}
          </section>
        </div>
      </section>
    </main>
  )
}
