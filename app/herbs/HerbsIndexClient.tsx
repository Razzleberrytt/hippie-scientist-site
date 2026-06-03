'use client'

import Link from 'next/link'
import { cleanSummary, formatDisplayLabel, isClean, labelize, list, text, unique } from '@/lib/display-utils'
import { normalizeDecisionEvidence, normalizeDecisionSafety } from '@/lib/decision-primitives'
import { DecisionEmptyState, DecisionFilterGroup, DecisionProfileCard } from '@/components/ui/DecisionPrimitives'
import '@/styles/premium-cards.css'

type FilterOption = {
  label: string
  value: string
  hint: string
  terms: string[]
}

const filterOptions: FilterOption[] = [
  {
    label: 'Calm & stress',
    value: 'calm',
    hint: 'Anxiety, stress-response, and wind-down contexts.',
    terms: ['calm', 'stress', 'anxiety', 'anxiolytic', 'adaptogen', 'gaba', 'relaxation'],
  },
  {
    label: 'Sleep',
    value: 'sleep',
    hint: 'Sleep quality, sleep onset, and recovery framing.',
    terms: ['sleep', 'sedative', 'insomnia', 'recovery', 'wind-down'],
  },
  {
    label: 'Focus & fatigue',
    value: 'focus',
    hint: 'Attention, mental energy, and fatigue support.',
    terms: ['focus', 'cognition', 'cognitive', 'attention', 'fatigue', 'energy', 'stimulant'],
  },
  {
    label: 'Inflammation',
    value: 'inflammation',
    hint: 'Inflammatory, antioxidant, and pain-adjacent pathways.',
    terms: ['inflammation', 'inflammatory', 'anti-inflammatory', 'antioxidant', 'pain'],
  },
]

function getName(item: any) {
  return formatDisplayLabel(item.displayName) || formatDisplayLabel(item.name) || formatDisplayLabel(item.slug)
}

function getSummary(item: any) {
  const summary =
    item.short_earthy_summary ||
    item.shortEarthySummary ||
    item.summary ||
    item.coreInsight ||
    item.hero ||
    item.description

  return cleanSummary(summary, 'herb')
}

function getEvidence(item: any) {
  return normalizeDecisionEvidence(
    item.evidence_tier ||
      item.evidenceTier ||
      item.safety?.evidenceTier ||
      item.evidence_grade ||
      item.evidenceLevel ||
      item.summary_quality
  )
}

function getSafety(item: any) {
  return normalizeDecisionSafety(
    item.safety_level ||
      item.safetyLevel ||
      item.safety?.confidence ||
      item.confidence ||
      item.profile_status,
    { hasSafetyNotes: Boolean(item.safetyNotes || item.safety_notes || item.safety) }
  )
}

function getEffects(item: any) {
  return unique([
    ...list(item.primary_effects),
    ...list(item.primaryEffects),
    ...list(item.primaryActions),
    ...list(item.effects),
    ...list(item.primaryDomain),
    ...list(item.mechanisms),
  ])
    .filter(isClean)
    .slice(0, 2)
}

function getMechanisms(item: any) {
  return unique([
    ...list(item.mechanisms),
    ...list(item.primary_mechanisms),
    ...list(item.pathways),
    ...list(item.activeCompounds),
  ])
    .filter(isClean)
    .filter((value: string) => !getEffects(item).includes(value))
    .slice(0, 2)
}

function getBestFor(item: any) {
  const effects = getEffects(item)

  if (effects.length > 0) return effects.join(' • ')

  const traditionalUses = list(item.traditionalUses || item.traditional_uses)
    .filter(isClean)
    .slice(0, 2)

  return traditionalUses.length > 0 ? traditionalUses.join(' • ') : 'Research context'
}

function getTimeToEffect(item: any) {
  const value = labelize(
    item.time_to_effect ||
      item.timeToEffect ||
      item.onset ||
      item.practical?.timeToEffect ||
      item.timeline,
    ''
  )

  return value && isClean(value) ? value : ''
}

function scoreHerb(item: any) {
  let score = 0

  const quality = text(item.profile_status || item.summary_quality || item.safety?.confidence).toLowerCase()
  const evidence = text(item.evidence_tier || item.evidence_grade || item.evidenceLevel).toLowerCase()

  if (/complete|strong|high|ready/.test(quality)) score += 5
  if (/strong|human|clinical|high/.test(evidence)) score += 4

  score += getEffects(item).length

  return score
}

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] || '' : value || ''
}

function getSearchCorpus(item: any) {
  return [
    getName(item),
    getSummary(item),
    getBestFor(item),
    getEvidence(item),
    getSafety(item),
    item.scientific,
    item.common,
    item.region,
    ...list(item.primaryActions),
    ...list(item.primary_effects),
    ...list(item.mechanisms),
    ...list(item.activeCompounds),
    ...list(item.traditionalUses),
  ]
    .map(value => text(value).toLowerCase())
    .join(' ')
}

function filterHerbs(herbs: any[], query: string, context: string) {
  const normalizedQuery = query.trim().toLowerCase()
  const option = filterOptions.find(item => item.value === context)

  return herbs.filter(herb => {
    const corpus = getSearchCorpus(herb)
    const queryMatches = !normalizedQuery || normalizedQuery.split(/\s+/).every(term => corpus.includes(term))
    const contextMatches = !option || option.terms.some(term => corpus.includes(term))

    return queryMatches && contextMatches
  })
}

function buildFilterHref(value: string, query: string) {
  const params = new URLSearchParams()
  if (query.trim()) params.set('q', query.trim())
  if (value !== 'all') params.set('context', value)

  const suffix = params.toString()
  return suffix ? `/herbs?${suffix}` : '/herbs'
}

function StatCard({ value, label }: { value: number; label: string }) {
  return (
    <div className="min-w-0 rounded-[0.8rem] border border-brand-900/10 bg-white/80 p-2.5 shadow-sm sm:p-3">
      <p className="text-xl font-semibold tracking-tight text-ink sm:text-2xl">{value}</p>
      <p className="mt-0.5 text-[0.62rem] font-bold uppercase leading-snug tracking-[0.1em] text-[#5f6f66]">{label}</p>
    </div>
  )
}

function EmptyLibraryState() {
  return (
    <DecisionEmptyState
      eyebrow="Profiles unavailable"
      title="Herb profiles are temporarily unavailable."
      description="The herb library is still being generated or the runtime data did not return renderable profiles for this build. This is temporary and does not mean the herb database is empty."
      actions={[
        { href: '/search', label: 'Search the site', variant: 'primary' },
        { href: '/compounds', label: 'Browse compounds' },
        { href: '/goals', label: 'Explore goals' },
      ]}
    />
  )
}

function EmptyFilteredState({ query, context }: { query: string; context: string }) {
  const activeContext = filterOptions.find(option => option.value === context)?.label
  const currentScan = [query ? `“${query}”` : '', activeContext || ''].filter(Boolean).join(' + ')

  return (
    <DecisionEmptyState
      eyebrow="No matching profiles"
      title="No herbs matched this scan."
      description="Try a broader herb name, mechanism, or goal. Evidence and safety labels stay conservative when source data is incomplete."
      currentScan={currentScan || undefined}
      actions={[
        { href: '/herbs', label: 'Reset filters', variant: 'primary' },
        { href: '/goals', label: 'Browse by goal' },
      ]}
    />
  )
}

function HerbCard({ herb, featured = false }: { herb: any; featured?: boolean }) {
  return (
    <DecisionProfileCard
      href={`/herbs/${herb.slug}`}
      name={getName(herb)}
      summary={getSummary(herb)}
      bestFor={getBestFor(herb)}
      evidence={getEvidence(herb)}
      safety={getSafety(herb)}
      timeToEffect={getTimeToEffect(herb)}
      mechanisms={getMechanisms(herb)}
      featured={featured}
      fallbackSummary="A conservative botanical profile with research context and safety notes."
    />
  )
}

const browsePaths = [
  {
    label: 'Stress & calm',
    href: '/guides/best-supplements-for-stress',
    description: 'Calming herbs, adaptogens, and interaction context.',
  },
  {
    label: 'Sleep & recovery',
    href: '/goals/sleep',
    description: 'Wind-down support, sleep quality, and next-day fit.',
  },
  {
    label: 'Focus & cognition',
    href: '/goals/focus',
    description: 'Attention, fatigue, and non-jittery support paths.',
  },
]

export default function HerbsIndexClient({ herbs: sourceHerbs, allHerbs, initialQuery = '', initialContext = '', paginated = false, page = 1, totalPages = 1}: { herbs: any[]; allHerbs?: any[]; initialQuery?: string; initialContext?: string; paginated?: boolean; page?: number; totalPages?: number }) {
  const query = firstParam(initialQuery)
  const context = firstParam(initialContext)
  const activeFilter = filterOptions.some(option => option.value === context) ? context : 'all'

  const baseHerbs = [...(allHerbs || sourceHerbs)].sort((a: any, b: any) => scoreHerb(b) - scoreHerb(a))
  const herbs = [...sourceHerbs].sort((a: any, b: any) => scoreHerb(b) - scoreHerb(a))

  const visibleHerbs = filterHerbs(baseHerbs, query, activeFilter)
  const hasActiveFilters = Boolean(query.trim()) || activeFilter !== 'all'
  const totalProfiles = baseHerbs.length

  const readyProfiles = baseHerbs.filter((herb: any) =>
    /complete|strong|high|ready/i.test(
      text(herb.profile_status || herb.summary_quality || herb.safety?.confidence)
    )
  ).length

  const evidenceForward = baseHerbs.filter((herb: any) =>
    /human|clinical|strong|high/i.test(
      text(herb.evidence_tier || herb.evidence_grade || herb.evidenceLevel)
    )
  ).length

  const safetyMapped = baseHerbs.length
  const featuredHerbs = hasActiveFilters || paginated ? [] : baseHerbs.slice(0, 6)
  const libraryHerbs = hasActiveFilters ? visibleHerbs : paginated ? herbs : baseHerbs.slice(featuredHerbs.length)

  return (
    <div className="px-2 py-2 text-ink sm:px-3 sm:py-3">
      <div className="mx-auto max-w-7xl space-y-4 sm:space-y-4">
        <section className="hero-shell relative overflow-hidden rounded-[0.95rem] border border-brand-900/10 px-3 py-4 shadow-sm sm:px-4 sm:py-5">
          <div className="relative grid gap-3 lg:grid-cols-[1.05fr_.95fr] lg:items-end">
            <div className="max-w-3xl space-y-2">
              <p className="eyebrow-label">Botanical decision library</p>
              <h1 className="max-w-[18ch] text-balance font-display text-2xl font-semibold leading-[1.08] tracking-tight text-ink sm:text-4xl">
                Herbal research library
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-[#46574d]">
                Scan by practical context first, then compare evidence, safety, and timing before opening a full herb profile.
              </p>
            </div>

            <div className="rounded-[0.8rem] border border-brand-900/10 bg-white/80 p-2.5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-800">Library signal</p>
              <div className="mt-2 grid grid-cols-3 gap-2">
                <StatCard value={totalProfiles} label="Profiles" />
                <StatCard value={evidenceForward} label="Evidence-led" />
                <StatCard value={safetyMapped || readyProfiles} label="Safety mapped" />
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[0.85rem] border border-brand-900/10 bg-white/85 p-3 shadow-sm sm:p-4" aria-labelledby="herb-search-heading">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl space-y-1.5">
              <p className="eyebrow-label">Search and filter</p>
              <h2 id="herb-search-heading" className="compact-heading">Start with the decision you need to make.</h2>
            </div>
            <Link href="/goals" className="w-fit text-sm font-bold text-brand-800 transition hover:text-brand-900">Browse all goals →</Link>
          </div>

          <form action="/herbs" className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto]">
            <label className="sr-only" htmlFor="herb-search">Search herbs</label>
            <input
              id="herb-search"
              name="q"
              type="search"
              defaultValue={query}
              placeholder="Search herb, effect, mechanism, or safety note"
              className="min-h-10 w-full rounded-full border border-brand-900/10 bg-white px-4 text-sm text-ink shadow-sm placeholder:text-[#7b8a81]"
            />
            {activeFilter !== 'all' ? <input type="hidden" name="context" value={activeFilter} /> : null}
            <button type="submit" className="button-primary min-h-10 px-4 py-2">
              Search
            </button>
          </form>

          <DecisionFilterGroup
            options={filterOptions}
            activeFilter={activeFilter}
            query={query}
            buildHref={buildFilterHref}
            open={hasActiveFilters}
          />
        </section>

        <section className="rounded-[0.85rem] border border-brand-900/10 bg-white/75 p-3 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl space-y-1.5">
              <p className="eyebrow-label">Common starting points</p>
              <h2 className="compact-heading">Goal guides if you are still orienting.</h2>
            </div>
          </div>

          <div className="mt-3 grid gap-2 md:grid-cols-3">
            {browsePaths.map(path => (
              <Link
                key={path.label}
                href={path.href}
                className="group rounded-[0.75rem] border border-brand-900/10 bg-white/85 p-2.5 shadow-sm transition hover:border-brand-700/20 hover:bg-white"
              >
                <h3 className="text-base font-semibold tracking-tight text-ink transition group-hover:text-brand-800">{path.label}</h3>
                <p className="mt-1 text-sm leading-5 text-[#46574d]">{path.description}</p>
              </Link>
            ))}
          </div>
        </section>

        {herbs.length === 0 ? (
          <EmptyLibraryState />
        ) : visibleHerbs.length === 0 ? (
          <EmptyFilteredState query={query} context={activeFilter} />
        ) : (
          <>
            {featuredHerbs.length > 0 ? (
              <section className="space-y-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                  <div className="max-w-2xl space-y-1.5">
                    <p className="eyebrow-label">Start here</p>
                    <h2 className="compact-heading">High-signal starting points.</h2>
                  </div>
                  <p className="max-w-md text-sm leading-6 text-[#5f6f66]">
                    Sorted by evidence signals, profile readiness, and practical browse value—not by promised outcomes.
                  </p>
                </div>

                <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                  {featuredHerbs.map((herb: any) => (
                    <HerbCard key={herb.slug} herb={herb} featured />
                  ))}
                </div>
              </section>
            ) : null}

            {libraryHerbs.length > 0 ? (
              <section className="space-y-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                  <div className="max-w-2xl space-y-1.5">
                    <p className="eyebrow-label">{hasActiveFilters ? 'Matching herbs' : 'All herbs'}</p>
                    <h2 className="compact-heading">
                      {hasActiveFilters ? 'Profiles matching your scan.' : 'Browse every published herb profile.'}
                    </h2>
                  </div>
                  <span className="inline-flex w-fit rounded-full border border-brand-900/10 bg-white/70 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[#5f6f66]">
                    {hasActiveFilters ? visibleHerbs.length : paginated ? herbs.length : totalProfiles} profiles
                  </span>
                </div>

                <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                  {libraryHerbs.map((herb: any) => (
                    <HerbCard key={herb.slug} herb={herb} />
                  ))}
                </div>
              </section>
            ) : null}
            {paginated && !hasActiveFilters && totalPages > 1 ? (
              <p className="text-sm text-[#5f6f66]">Showing page {page} of {totalPages}. Use previous/next links above for crawl-safe navigation.</p>
            ) : null}
          </>
        )}
      </div>
    </div>
  )
}
