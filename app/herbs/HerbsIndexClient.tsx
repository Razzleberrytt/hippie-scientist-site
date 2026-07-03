'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { cleanSummary, formatDisplayLabel, isClean, list, text, unique } from '@/lib/display-utils'
import { normalizeDecisionEvidence, normalizeDecisionSafety } from '@/lib/decision-primitives'
import { DecisionEmptyState, DecisionFilterGroup, DecisionProfileCard } from '@/components/ui/DecisionPrimitives'
import '@/styles/premium-cards.css'
import type { RuntimeRecord } from '../../src/types/content'

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

function getName(item: RuntimeRecord) {
  return formatDisplayLabel(item?.displayName) || formatDisplayLabel(item?.name) || formatDisplayLabel(item?.slug)
}

function getSummary(item: RuntimeRecord) {
  const name = getName(item)
  const firstPrimaryEffect = Array.isArray(item?.primary_effects)
    ? item.primary_effects[0]
    : (typeof item?.primary_effects === 'string' ? item.primary_effects : '')
  const primaryUse = firstPrimaryEffect ? formatDisplayLabel(firstPrimaryEffect).toLowerCase() : ''
  const firstMech = Array.isArray(item?.mechanisms)
    ? item.mechanisms[0]
    : (typeof item?.mechanisms === 'string' ? item.mechanisms : '')
  const mech = firstMech ? formatDisplayLabel(firstMech).toLowerCase().replace(/\s+(signaling|modulation|context|response)/g, '') : ''
  const ev = item?.evidence_tier ? formatDisplayLabel(item.evidence_tier) : ''

  if (primaryUse || mech || ev) {
    let s = `${name} `
    if (primaryUse) s += `for ${primaryUse} `
    if (mech) s += `via ${mech} `
    if (ev) {
      const cleanEv = ev.toLowerCase().replace(/\s+evidence$/i, '')
      s += `(${cleanEv} evidence)`
    }
    return s.trim() + '.'
  }

  const summary =
    (item?.short_earthy_summary as string) ||
    (item?.shortEarthySummary as string) ||
    (item?.summary as string) ||
    (item?.coreInsight as string) ||
    (item?.hero as string) ||
    (item?.description as string) ||
    (item?.generated_description as string)

  const cleaned = cleanSummary(summary, 'herb')
  if (cleaned && cleaned.length > 15) return cleaned

  return `${name} profile summarizing available evidence, mechanisms, safety context, and practical research notes.`
}

function getEvidence(item: RuntimeRecord) {
  return normalizeDecisionEvidence(
    item?.evidence_tier ||
      item?.evidenceTier ||
      item?.safety?.evidenceTier ||
      item?.evidence_grade ||
      item?.evidenceLevel ||
      item?.summary_quality
  )
}

function getSafety(item: RuntimeRecord) {
  return normalizeDecisionSafety(
    item?.safety_level ||
      item?.safetyLevel ||
      item?.safety?.confidence ||
      item?.confidence ||
      item?.profile_status,
    {
      hasSafetyNotes: Boolean(item?.safetyNotes || item?.safety_notes || item?.safety),
      hasInteractions: Boolean(item?.interactions || item?.interaction_notes || item?.interaction_cautions),
      hasCautions: Boolean(item?.cautions || item?.contraindications || item?.side_effects),
      notes: text(item?.safetyNotes || item?.safety_notes || item?.safety),
      interactions: text(item?.interactions || item?.interaction_notes || item?.interaction_cautions),
    }
  )
}

function getEffects(item: RuntimeRecord) {
  return unique([
    ...list(item?.primary_effects),
    ...list(item?.primaryEffects),
    ...list(item?.primaryActions),
    ...list(item?.effects),
    ...list(item?.primaryDomain),
    ...list(item?.mechanisms),
  ])
    .filter(isClean)
    .slice(0, 2)
}

function getMechanisms(item: RuntimeRecord) {
  const effects = getEffects(item)
  return unique([
    ...list(item?.mechanisms),
    ...list(item?.primary_mechanisms),
    ...list(item?.pathways),
    ...list(item?.activeCompounds),
  ])
    .filter(isClean)
    .filter((value: string) => !effects.includes(value))
    .slice(0, 2)
}

function getBestFor(item: RuntimeRecord) {
  const effects = getEffects(item)

  if (effects.length > 0) return text(effects.join(' • '))

  const traditionalUses = list(item?.traditionalUses || item?.traditional_uses)
    .filter(isClean)
    .slice(0, 2)

  return traditionalUses.length > 0 ? text(traditionalUses.join(' • ')) : 'Research context'
}

function scoreHerb(item: RuntimeRecord) {
  let score = 0

  const quality = text(item?.profile_status || item?.summary_quality || item?.safety?.confidence).toLowerCase()
  const evidence = text(item?.evidence_tier || item?.evidence_grade || item?.evidenceLevel).toLowerCase()

  if (/complete|strong|high|ready/.test(quality)) score += 5
  if (/strong|human|clinical|high/.test(evidence)) score += 4

  score += getEffects(item).length

  return score
}

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] || '' : value || ''
}

function getSearchCorpus(item: RuntimeRecord) {
  return [
    getName(item),
    getSummary(item),
    getBestFor(item),
    getEvidence(item),
    getSafety(item),
    item?.scientific,
    item?.common,
    item?.region,
    ...list(item?.primaryActions),
    ...list(item?.primary_effects),
    ...list(item?.mechanisms),
    ...list(item?.activeCompounds),
    ...list(item?.traditionalUses),
  ]
    .map(value => text(value).toLowerCase())
    .join(' ')
}

const EVIDENCE_FILTER_OPTIONS = [
  { label: 'Any evidence', value: 'all' },
  { label: 'Strong', value: 'strong' },
  { label: 'Moderate', value: 'moderate' },
  { label: 'Limited / prelim', value: 'limited' },
]

function matchesEvidence(herb: RuntimeRecord, evidenceValue: string): boolean {
  if (evidenceValue === 'all') return true
  const ev = getEvidence(herb).toLowerCase()
  if (evidenceValue === 'strong') return ev.includes('strong')
  if (evidenceValue === 'moderate') return ev.includes('moderate')
  if (evidenceValue === 'limited') return ev.includes('limited') || ev.includes('prelim') || ev.includes('traditional') || ev.includes('insufficient')
  return true
}

function filterHerbs(herbs: RuntimeRecord[], query: string, context: string, evidenceFilter: string) {
  const normalizedQuery = query.trim().toLowerCase()
  const option = filterOptions.find(item => item.value === context)

  return herbs.filter(herb => {
    const corpus = getSearchCorpus(herb)
    const queryMatches = !normalizedQuery || normalizedQuery.split(/\s+/).every(term => corpus.includes(term))
    const contextMatches = !option || option.terms.some(term => corpus.includes(term))
    const evMatches = matchesEvidence(herb, evidenceFilter)

    return queryMatches && contextMatches && evMatches
  })
}

function buildFilterHref(value: string, query: string, evidence?: string) {
  const params = new URLSearchParams()
  if (query.trim()) params.set('q', query.trim())
  if (value !== 'all') params.set('context', value)
  if (evidence && evidence !== 'all') params.set('evidence', evidence)

  const suffix = params.toString()
  return suffix ? `/herbs?${suffix}` : '/herbs'
}

function buildEvidenceHref(evidenceValue: string, query: string, context: string) {
  const params = new URLSearchParams()
  if (query.trim()) params.set('q', query.trim())
  if (context !== 'all') params.set('context', context)
  if (evidenceValue !== 'all') params.set('evidence', evidenceValue)

  const suffix = params.toString()
  return suffix ? `/herbs?${suffix}` : '/herbs'
}

function StatCard({ value, label }: { value: number; label: string }) {
  return (
    <div className="min-w-0 rounded-[0.8rem] border border-brand-900/10 bg-[var(--surface-card)] p-2.5 shadow-sm sm:p-3">
      <p className="text-xl font-semibold tracking-tight text-ink sm:text-2xl">{value}</p>
      <p className="mt-0.5 text-[0.62rem] font-bold uppercase leading-snug tracking-[0.1em] text-[var(--text-muted)]">{label}</p>
    </div>
  )
}

// Unused local empty state
export function EmptyLibraryState() {
  return (
    <DecisionEmptyState
      eyebrow="Profiles unavailable"
      title="Herb profiles are temporarily unavailable."
      description="The herb library is still being generated or the runtime data did not return renderable profiles for this build. This is temporary and does not mean the herb database is empty."
      actions={[
        { href: '/search', label: 'Search the site', variant: 'primary' },
        { href: '/compounds', label: 'Browse compounds' },
        { href: '/guides', label: 'Explore guides' },
      ]}
    />
  )
}

function EmptyFilteredState({ query, context, evidence }: { query: string; context: string; evidence: string }) {
  const activeContext = filterOptions.find(option => option.value === context)?.label
  const activeEvLabel = EVIDENCE_FILTER_OPTIONS.find(o => o.value === evidence && evidence !== 'all')?.label
  const currentScan = [query ? `"${query}"` : '', activeContext || '', activeEvLabel || ''].filter(Boolean).join(' + ')

  return (
    <DecisionEmptyState
      eyebrow="No matching profiles"
      title="No herbs matched this scan."
      description="Try a broader herb name, mechanism, or goal. Evidence and safety labels stay conservative when source data is incomplete."
      currentScan={currentScan || undefined}
      actions={[
        { href: '/herbs', label: 'Reset filters', variant: 'primary' },
        { href: '/guides', label: 'Browse by goal' },
      ]}
    />
  )
}

function HerbCard({ herb, featured = false }: { herb: RuntimeRecord; featured?: boolean }) {
  return (
    <DecisionProfileCard
      href={`/herbs/${herb.slug}`}
      name={getName(herb)}
      summary={getSummary(herb)}
      bestFor={getBestFor(herb)}
      mechanisms={getMechanisms(herb)}
      featured={featured}
      fallbackSummary={`${getName(herb)} profile summarizing available evidence, mechanisms, safety context, and practical research notes.`}
    />
  )
}

const browsePaths = [
  {
    label: 'Stress & calm',
    href: '/guides/best/supplements-for-stress/',
    description: 'Calming herbs, adaptogens, and interaction context.',
  },
  {
    label: 'Sleep & recovery',
    href: '/guides/sleep',
    description: 'Wind-down support, sleep quality, and next-day fit.',
  },
  {
    label: 'Focus & cognition',
    href: '/guides/focus',
    description: 'Attention, fatigue, and non-jittery support paths.',
  },
]

export default function HerbsIndexClient({ herbs: sourceHerbs, allHerbs, initialQuery = '', initialContext = '', paginated = false, page = 1, totalPages = 1}: { herbs: RuntimeRecord[]; allHerbs?: RuntimeRecord[]; initialQuery?: string; initialContext?: string; paginated?: boolean; page?: number; totalPages?: number }) {
  const urlParams = useSearchParams()
  const query = urlParams?.get('q') || firstParam(initialQuery)
  const context = urlParams?.get('context') || firstParam(initialContext)
  const evidenceFilter = urlParams?.get('evidence') || 'all'
  const activeFilter = filterOptions.some(option => option.value === context) ? context : 'all'
  const activeEvidence = EVIDENCE_FILTER_OPTIONS.some(o => o.value === evidenceFilter) ? evidenceFilter : 'all'

  const baseHerbs = [...(allHerbs || sourceHerbs)].sort((a: RuntimeRecord, b: RuntimeRecord) => scoreHerb(b) - scoreHerb(a))
  const herbs = [...sourceHerbs].sort((a: RuntimeRecord, b: RuntimeRecord) => scoreHerb(b) - scoreHerb(a))

  const visibleHerbs = filterHerbs(baseHerbs, query, activeFilter, activeEvidence)
  const hasActiveFilters = Boolean(query.trim()) || activeFilter !== 'all' || activeEvidence !== 'all'
  const totalProfiles = baseHerbs.length

  const pageSize = 36
  const showingFrom = paginated && totalProfiles > 0 ? (page - 1) * pageSize + 1 : 1
  const showingTo = paginated ? Math.min(page * pageSize, totalProfiles) : totalProfiles

  const countLabel = hasActiveFilters
    ? `Showing ${visibleHerbs.length} of ${totalProfiles}`
    : paginated
    ? `Showing ${showingFrom}–${showingTo} of ${totalProfiles}`
    : `${totalProfiles}`

  const readyProfiles = baseHerbs.filter((herb: RuntimeRecord) =>
    /complete|strong|high|ready/i.test(
      text(herb.profile_status || herb.summary_quality || herb.safety?.confidence)
    )
  ).length

  const evidenceForward = baseHerbs.filter((herb: RuntimeRecord) =>
    /human|clinical|strong|high/i.test(
      text(herb.evidence_tier || herb.evidence_grade || herb.evidenceLevel)
    )
  ).length

  const featuredHerbs = hasActiveFilters || paginated ? [] : baseHerbs.slice(0, 6)
  const libraryHerbs = hasActiveFilters ? visibleHerbs : paginated ? herbs : baseHerbs.slice(featuredHerbs.length)

  return (
    <div className="px-2 pb-28 pt-2 text-ink sm:px-3 sm:pt-3">
      <div className="mx-auto max-w-7xl space-y-4 sm:space-y-4">
        <section className="hero-shell relative overflow-hidden rounded-[0.95rem] border border-brand-900/10 px-3 py-4 shadow-sm sm:px-4 sm:py-5">
          <div className="relative grid gap-3 lg:grid-cols-[1.05fr_.95fr] lg:items-end">
            <div className="max-w-3xl space-y-2">
              <p className="eyebrow-label">Botanical research library</p>
              <h2 className="max-w-[18ch] text-balance font-display text-2xl font-semibold leading-[1.08] tracking-tight text-ink sm:text-4xl">
                Herbal research library
              </h2>
              <p className="max-w-2xl text-sm leading-6 text-muted">
                Scan by practical context first, then compare evidence, timing, and caution notes where source data supports them.
              </p>
            </div>

            <div className="rounded-[0.8rem] border border-brand-900/10 bg-[var(--surface-card)] p-2.5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-800">Library signal</p>
              <div className="mt-2 grid grid-cols-3 gap-2">
                <StatCard value={totalProfiles} label="Profiles" />
                <StatCard value={evidenceForward} label="Evidence-led" />
                <StatCard value={readyProfiles || 12} label="Safety expanding" />
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[0.85rem] border border-brand-900/10 bg-[var(--surface-card)] p-3 shadow-sm sm:p-4" aria-labelledby="herb-search-heading">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl space-y-1.5">
              <p className="eyebrow-label">Search and filter</p>
              <h2 id="herb-search-heading" className="compact-heading">Start with the question you need answered.</h2>
            </div>
            <Link href="/guides/" className="w-fit text-sm font-bold text-brand-800 transition hover:text-brand-900">Browse all goals →</Link>
          </div>

          <form action="/herbs" className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto]">
            <label className="sr-only" htmlFor="herb-search">Search herbs</label>
            <input
              id="herb-search"
              name="q"
              type="search"
              defaultValue={query}
              placeholder="Search herb, effect, mechanism, or safety note"
              className="min-h-10 w-full rounded-full border border-brand-900/10 bg-[var(--surface-card)] px-4 text-sm text-ink shadow-sm placeholder:text-muted/60 dark:placeholder:text-[var(--text-muted)]/50"
            />
            {activeFilter !== 'all' ? <input type="hidden" name="context" value={activeFilter} /> : null}
            {activeEvidence !== 'all' ? <input type="hidden" name="evidence" value={activeEvidence} /> : null}
            <button type="submit" className="button-primary min-h-10 px-4 py-2">
              Search
            </button>
          </form>

          <DecisionFilterGroup
            options={filterOptions}
            activeFilter={activeFilter}
            query={query}
            buildHref={(value, q) => buildFilterHref(value, q, activeEvidence)}
            open={hasActiveFilters}
          />

          <div className="mt-2">
            <div className="mb-1.5 text-xs font-bold uppercase tracking-[0.12em] text-muted">Evidence level</div>
            <div className="flex flex-wrap gap-2">
              {EVIDENCE_FILTER_OPTIONS.map(opt => {
                const href = buildEvidenceHref(opt.value, query, activeFilter)
                const active = activeEvidence === opt.value
                return (
                  <Link
                    key={opt.value}
                    href={href}
                    className={`rounded-full border px-2.5 py-1 text-xs font-semibold transition ${active ? 'border-brand-700/25 bg-brand-50 text-brand-900' : 'border-brand-900/10 bg-[var(--surface-card)] text-[#33443a] hover:border-brand-700/20'}`}
                  >
                    {opt.label}
                  </Link>
                )
              })}
            </div>
          </div>

          {hasActiveFilters && (
            <div className="pt-1">
              <Link href="/herbs/" className="text-xs font-semibold text-brand-800 underline-offset-2 hover:underline">
                Clear all filters
              </Link>
            </div>
          )}
        </section>

        <section className="rounded-[0.85rem] border border-brand-900/10 bg-[var(--surface-card)] p-3 shadow-sm">
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
                className="group rounded-[0.75rem] border border-brand-900/10 bg-[var(--surface-card)] p-2.5 shadow-sm transition hover:border-brand-700/20 hover:bg-[var(--surface-card-strong)]"
              >
                <h3 className="text-base font-semibold tracking-tight text-ink transition group-hover:text-brand-800">{path.label}</h3>
                <p className="mt-1 text-sm leading-5 text-muted">{path.description}</p>
              </Link>
            ))}
          </div>
        </section>

        {herbs.length === 0 ? (
          <EmptyLibraryState />
        ) : visibleHerbs.length === 0 ? (
          <EmptyFilteredState query={query} context={activeFilter} evidence={activeEvidence} />
        ) : (
          <>
            {featuredHerbs.length > 0 ? (
              <section className="space-y-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                  <div className="max-w-2xl space-y-1.5">
                    <p className="eyebrow-label">Start here</p>
                    <h2 className="compact-heading">High-signal starting points.</h2>
                  </div>
                  <p className="max-w-md text-sm leading-6 text-muted">
                    Sorted by evidence signals, profile readiness, and practical browse value—not by promised outcomes.
                  </p>
                </div>

                <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                  {featuredHerbs.map((herb: RuntimeRecord) => (
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
                  <span className="inline-flex w-fit rounded-full border border-brand-900/10 bg-[var(--surface-card)] px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[var(--text-muted)]">
                    {countLabel} profiles
                  </span>
                </div>

                <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                  {libraryHerbs.map((herb: RuntimeRecord) => (
                    <HerbCard key={herb.slug} herb={herb} />
                  ))}
                </div>
              </section>
            ) : null}
            {paginated && !hasActiveFilters && totalPages > 1 ? (
              <p className="text-sm text-muted">Showing page {page} of {totalPages}. Use previous/next links above for crawl-safe navigation.</p>
            ) : null}
          </>
        )}
      </div>
    </div>
  )
}
