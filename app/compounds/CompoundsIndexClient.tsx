'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { cleanSummary, formatDisplayLabel, isClean, list, text, unique } from '@/lib/display-utils'
import { normalizeDecisionEvidence, normalizeDecisionSafety } from '@/lib/decision-primitives'
import { DecisionEmptyState, DecisionFilterGroup, DecisionProfileCard } from '@/components/ui/DecisionPrimitives'
import Skeleton from '@/src/components/ui/Skeleton'
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
    label: 'Calm & sleep',
    value: 'calm-sleep',
    hint: 'GABA, sleep chemistry, and wind-down research contexts.',
    terms: ['calm', 'sleep', 'gaba', 'sedative', 'anxiety', 'relaxation', 'melatonin'],
  },
  {
    label: 'Focus & neurobiology',
    value: 'focus',
    hint: 'Cognition, neurotransmitters, attention, and neuroactive pathways.',
    terms: ['focus', 'cognition', 'cognitive', 'neuro', 'dopamine', 'acetylcholine', 'serotonin', 'brain'],
  },
  {
    label: 'Inflammation',
    value: 'inflammation',
    hint: 'Inflammatory signaling, oxidative stress, and immune-adjacent mechanisms.',
    terms: ['inflammation', 'inflammatory', 'oxidative', 'antioxidant', 'nf-kb', 'nrf2', 'cytokine', 'immune'],
  },
  {
    label: 'Metabolism',
    value: 'metabolism',
    hint: 'Mitochondrial, glucose, lipid, and metabolic research pathways.',
    terms: ['metabolic', 'metabolism', 'mitochondria', 'mitochondrial', 'glucose', 'lipid', 'ampk', 'energy'],
  },
]

function safeString(value: unknown) {
  return typeof value === 'string' ? value : ''
}

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] || '' : value || ''
}

function getName(item: RuntimeRecord) {
  return (
    formatDisplayLabel(item?.displayName) ||
    formatDisplayLabel(item?.name) ||
    formatDisplayLabel(item?.compoundName) ||
    formatDisplayLabel(item?.canonicalCompoundName) ||
    formatDisplayLabel(item?.slug) ||
    'Unknown compound'
  )
}

function getSummary(item: RuntimeRecord) {
  return cleanSummary(
    item?.short_earthy_summary ||
      item?.shortEarthySummary ||
      item?.summary ||
      item?.coreInsight ||
      item?.hero ||
      item?.description ||
      '',
    'compound'
  )
}

function getEvidence(item: RuntimeRecord) {
  return normalizeDecisionEvidence(
    item?.evidence_tier ||
      item?.evidenceTier ||
      item?.evidence_grade ||
      item?.evidenceLevel ||
      item?.humanEvidenceLevel ||
      item?.summary_quality
  )
}

function getSafety(item: RuntimeRecord) {
  return normalizeDecisionSafety(
    item?.safety_level ||
      item?.safetyLevel ||
      item?.safety?.confidence ||
      item?.safetyStatus ||
      item?.contraindicationLevel ||
      item?.profile_status,
    { hasSafetyNotes: Boolean(item?.safetyNotes || item?.safety_notes || item?.safety) }
  )
}

function getEffects(item: RuntimeRecord) {
  return unique([
    ...list(item?.primary_effects),
    ...list(item?.primaryEffects),
    ...list(item?.primaryActions),
    ...list(item?.effects),
    ...list(item?.primaryDomain),
    ...list(item?.useContexts),
    ...list(item?.foundIn),
  ])
    .map(formatDisplayLabel)
    .filter(isClean)
    .slice(0, 2)
}

function getMechanismSignals(item: RuntimeRecord) {
  const effects = getEffects(item)

  return unique([
    ...list(item?.mechanisms),
    ...list(item?.primary_mechanisms),
    ...list(item?.pathways),
    ...list(item?.targets),
    ...list(item?.compoundClass),
    safeString(item?.class),
  ])
    .map(formatDisplayLabel)
    .filter(isClean)
    .filter((value: string) => !effects.includes(value))
    .slice(0, 2)
}

function getBestFor(item: RuntimeRecord) {
  const effects = getEffects(item)
  if (effects.length > 0) return effects.join(' • ')

  // Do not surface raw mechanism text (e.g. "Mechanism Unclear", "Potent
  // Mu-Opioid Receptor Agonism") as a "best for" use-case — mechanisms render
  // separately as labeled chips. Fall back to a neutral label instead.
  return 'Research context'
}

function scoreCompound(item: RuntimeRecord) {
  let score = 0
  const profile = text(item?.profile_status || item?.summary_quality || item?.status).toLowerCase()
  const evidence = text(item?.evidence_tier || item?.evidence_grade || item?.evidenceLevel).toLowerCase()

  if (/complete|strong|high|ready/.test(profile)) score += 5
  if (/strong|human|clinical|high/.test(evidence)) score += 4

  score += getEffects(item).length
  score += getMechanismSignals(item).length

  return score
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
    item?.compoundName,
    item?.canonicalCompoundName,
    item?.safetyNotes,
    ...list(item?.primaryActions),
    ...list(item?.primary_effects),
    ...list(item?.effects),
    ...list(item?.mechanisms),
    ...list(item?.pathways),
    ...list(item?.targets),
    ...list(item?.compoundClass),
    ...list(item?.foundIn),
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

function matchesEvidence(compound: RuntimeRecord, evidenceValue: string): boolean {
  if (evidenceValue === 'all') return true
  const ev = getEvidence(compound).toLowerCase()
  if (evidenceValue === 'strong') return ev.includes('strong')
  if (evidenceValue === 'moderate') return ev.includes('moderate')
  if (evidenceValue === 'limited') return ev.includes('limited') || ev.includes('prelim') || ev.includes('traditional') || ev.includes('insufficient')
  return true
}

function filterCompounds(compounds: RuntimeRecord[], query: string, context: string, evidenceFilter: string) {
  const normalizedQuery = query.trim().toLowerCase()
  const option = filterOptions.find(item => item.value === context)

  return compounds.filter(compound => {
    const corpus = getSearchCorpus(compound)
    const queryMatches = !normalizedQuery || normalizedQuery.split(/\s+/).every(term => corpus.includes(term))
    const contextMatches = !option || option.terms.some(term => corpus.includes(term))
    const evMatches = matchesEvidence(compound, evidenceFilter)

    return queryMatches && contextMatches && evMatches
  })
}

function buildFilterHref(value: string, query: string, evidence?: string) {
  const params = new URLSearchParams()
  if (query.trim()) params.set('q', query.trim())
  if (value !== 'all') params.set('context', value)
  if (evidence && evidence !== 'all') params.set('evidence', evidence)

  const suffix = params.toString()
  return suffix ? `/compounds?${suffix}` : '/compounds'
}

function buildEvidenceHref(evidenceValue: string, query: string, context: string) {
  const params = new URLSearchParams()
  if (query.trim()) params.set('q', query.trim())
  if (context !== 'all') params.set('context', context)
  if (evidenceValue !== 'all') params.set('evidence', evidenceValue)

  const suffix = params.toString()
  return suffix ? `/compounds?${suffix}` : '/compounds'
}

function StatCard({ value, label }: { value: number; label: string }) {
  return (
    <div className="min-w-0 rounded-[0.8rem] border border-brand-900/10 bg-white/80 p-2.5 shadow-sm sm:p-3">
      <p className="text-xl font-semibold tracking-tight text-ink sm:text-2xl">{value}</p>
      <p className="mt-0.5 text-[0.62rem] font-bold uppercase leading-snug tracking-[0.1em] text-muted">{label}</p>
    </div>
  )
}

function EmptyLibraryState() {
  return (
    <DecisionEmptyState
      eyebrow="Profiles unavailable"
      title="Compound profiles are temporarily unavailable."
      description="The compound library is still being generated or the runtime data did not return renderable profiles for this build. This is temporary and does not mean the compound database is empty."
      actions={[
        { href: '/search', label: 'Search the site', variant: 'primary' },
        { href: '/herbs', label: 'Browse herbs' },
        { href: '/guides', label: 'Explore guides' },
      ]}
    />
  )
}

function EmptyFilteredState({ query, context, evidence }: { query: string; context: string; evidence: string }) {
  const activeContext = filterOptions.find(option => option.value === context)?.label
  const activeEvLabel = EVIDENCE_FILTER_OPTIONS.find(option => option.value === evidence && evidence !== 'all')?.label
  const currentScan = [query ? `“${query}”` : '', activeContext || '', activeEvLabel || ''].filter(Boolean).join(' + ')

  return (
    <DecisionEmptyState
      eyebrow="No matching profiles"
      title="No compounds matched this scan."
      description="Try a broader compound name, mechanism, source herb, or pathway. Evidence and safety labels stay conservative when source data is incomplete."
      currentScan={currentScan || undefined}
      actions={[
        { href: '/compounds', label: 'Reset filters', variant: 'primary' },
        { href: '/herbs', label: 'Browse herbs' },
      ]}
    />
  )
}

function CompoundCard({ compound, featured = false }: { compound: RuntimeRecord; featured?: boolean }) {
  return (
    <DecisionProfileCard
      href={`/compounds/${compound?.slug || ''}`}
      name={getName(compound)}
      summary={getSummary(compound)}
      bestFor={getBestFor(compound)}
      mechanisms={getMechanismSignals(compound)}
      featured={featured}
      fallbackSummary="A conservative compound profile with mechanism, evidence, and safety context."
    />
  )
}

function CompoundCardSkeleton() {
  return (
    <div className="flex h-full flex-col gap-2.5 rounded-[var(--radius-lg)] border border-brand-900/10 bg-white/80 p-4">
      <Skeleton variant="line" className="h-5 w-3/4" />
      <Skeleton variant="line" className="mt-2 h-3 w-full" />
      <Skeleton variant="line" className="h-3 w-5/6" />
      <div className="mt-3 flex gap-1.5">
        <Skeleton variant="line" className="h-5 w-16 rounded-full" />
        <Skeleton variant="line" className="h-5 w-20 rounded-full" />
      </div>
    </div>
  )
}

function CompoundSkeletonGrid() {
  return (
    <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 12 }).map((_, i) => (
        <CompoundCardSkeleton key={i} />
      ))}
    </div>
  )
}

const browsePaths = [
  {
    label: 'Herb sources',
    href: '/herbs',
    description: 'Start from whole-plant profiles before isolating constituent chemistry.',
  },
  {
    label: 'Goal guides',
    href: '/guides',
    description: 'Use goal guides when the practical context matters more than the molecule.',
  },
  {
    label: 'Compare options',
    href: '/compare',
    description: 'Review alternatives without treating compound lists as recommendations.',
  },
]

export default function CompoundsIndexClient({ compounds: sourceCompounds, allCompounds, initialQuery = '', initialContext = '', paginated = false, page: _page = 1, totalPages: _totalPages = 1}: { compounds: RuntimeRecord[]; allCompounds?: RuntimeRecord[]; initialQuery?: string; initialContext?: string; paginated?: boolean; page?: number; totalPages?: number }) {
  const urlParams = useSearchParams()
  const query = urlParams?.get('q') || firstParam(initialQuery)
  const context = urlParams?.get('context') || firstParam(initialContext)
  const evidenceFilter = urlParams?.get('evidence') || 'all'
  const activeFilter = filterOptions.some(option => option.value === context) ? context : 'all'
  const activeEvidence = EVIDENCE_FILTER_OPTIONS.some(option => option.value === evidenceFilter) ? evidenceFilter : 'all'

  const baseCompounds = [...(allCompounds || sourceCompounds)].sort((a: RuntimeRecord, b: RuntimeRecord) => scoreCompound(b) - scoreCompound(a))
  const compounds = [...sourceCompounds].sort((a: RuntimeRecord, b: RuntimeRecord) => scoreCompound(b) - scoreCompound(a))

  const visibleCompounds = filterCompounds(baseCompounds, query, activeFilter, activeEvidence)
  const hasActiveFilters = Boolean(query.trim()) || activeFilter !== 'all' || activeEvidence !== 'all'
  const totalProfiles = baseCompounds.length
  const evidenceForward = baseCompounds.filter((compound: RuntimeRecord) => /human|clinical|strong|high/i.test(text(compound?.evidence_tier || compound?.evidence_grade || compound?.evidenceLevel))).length
  const safetyMapped = baseCompounds.filter((compound: RuntimeRecord) => getSafety(compound) !== 'Safety review pending').length
  const featuredCompounds = hasActiveFilters || paginated ? [] : baseCompounds.slice(0, 6)
  const libraryCompounds = hasActiveFilters ? visibleCompounds : paginated ? compounds : baseCompounds.slice(featuredCompounds.length)

  return (
    <div className="px-2 py-2 text-ink sm:px-3 sm:py-3">
      <div className="mx-auto max-w-7xl space-y-4 sm:space-y-4">
        <section className="hero-shell relative overflow-hidden rounded-[0.95rem] border border-brand-900/10 px-3 py-4 shadow-sm sm:px-4 sm:py-5">
          <div className="relative grid gap-3 lg:grid-cols-[1.05fr_.95fr] lg:items-end">
            <div className="max-w-3xl space-y-2">
              <p className="eyebrow-label">Compound research library</p>
              <h2 className="max-w-[18ch] text-balance font-display text-2xl font-semibold leading-[1.08] tracking-tight text-ink sm:text-4xl">
                Explore compound profiles
              </h2>
              <p className="max-w-2xl text-sm leading-6 text-muted">
                Scan bioactive molecules by practical context first, then compare evidence, mechanism hints, and caution notes where source data supports them.
              </p>
            </div>

            <div className="rounded-[0.8rem] border border-brand-900/10 bg-white/80 p-2.5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-800">Library signal</p>
              <div className="mt-2 grid grid-cols-3 gap-2">
                <StatCard value={totalProfiles} label="Profiles" />
                <StatCard value={evidenceForward} label="Evidence-led" />
                <StatCard value={safetyMapped} label="Safety mapped" />
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[0.85rem] border border-brand-900/10 bg-[var(--surface-card)] p-3 shadow-sm sm:p-4" aria-labelledby="compound-search-heading">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl space-y-1.5">
              <p className="eyebrow-label">Search and filter</p>
              <h2 id="compound-search-heading" className="compact-heading">Start with the question you need answered.</h2>
            </div>
            <Link href="/herbs/" className="w-fit text-sm font-bold text-brand-800 transition hover:text-brand-900">Browse herb sources →</Link>
          </div>

          <form action="/compounds" className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto]">
            <label className="sr-only" htmlFor="compound-search">Search compounds</label>
            <input
              id="compound-search"
              name="q"
              type="search"
              defaultValue={query}
              placeholder="Search compound, mechanism, source herb, or safety note"
              className="min-h-11 w-full rounded-full border border-brand-900/10 bg-[var(--surface-card)] px-4 text-base text-ink shadow-sm placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-brand-700/30 dark:placeholder:text-[var(--text-muted)]/50"
            />
            {activeFilter !== 'all' ? <input type="hidden" name="context" value={activeFilter} /> : null}
            {activeEvidence !== 'all' ? <input type="hidden" name="evidence" value={activeEvidence} /> : null}
            <button type="submit" className="button-primary min-h-11 px-5 py-2.5 text-sm">
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

          <div className="mt-3 rounded-[0.8rem] border border-brand-900/10 bg-[#fbfaf6]/80 p-3 shadow-none">
            <div className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-muted">Evidence level</div>
            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
              {EVIDENCE_FILTER_OPTIONS.map(opt => {
                const href = buildEvidenceHref(opt.value, query, activeFilter)
                const active = activeEvidence === opt.value
                return (
                  <Link
                    key={opt.value}
                    href={href}
                    className={`rounded-full border px-2.5 py-1.5 text-center text-xs font-semibold transition ${active ? 'border-brand-700/25 bg-brand-50 text-brand-900' : 'border-brand-900/10 bg-white/80 text-[#33443a] hover:border-brand-700/20'}`}
                  >
                    {opt.label}
                  </Link>
                )
              })}
            </div>
          </div>
        </section>

        <section className="rounded-[0.85rem] border border-brand-900/10 bg-[var(--surface-card)] p-3 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl space-y-1.5">
              <p className="eyebrow-label">Common starting points</p>
              <h2 className="compact-heading">Use broader guides if you are still orienting.</h2>
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

        {compounds.length === 0 ? (
          <EmptyLibraryState />
        ) : visibleCompounds.length === 0 ? (
          <EmptyFilteredState query={query} context={activeFilter} evidence={activeEvidence} />
        ) : (
          <>
            {featuredCompounds.length > 0 ? (
              <section className="space-y-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                  <div className="max-w-2xl space-y-1.5">
                    <p className="eyebrow-label">Start here</p>
                    <h2 className="compact-heading">High-signal starting points.</h2>
                  </div>
                  <p className="max-w-md text-sm leading-6 text-muted">
                    Sorted by evidence, safety, and profile readiness.
                  </p>
                </div>

                <Suspense fallback={<CompoundSkeletonGrid />}>
                  <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                    {featuredCompounds.map((compound: RuntimeRecord) => (
                      <CompoundCard key={compound.slug} compound={compound} featured />
                    ))}
                  </div>
                </Suspense>
              </section>
            ) : null}

            {libraryCompounds.length > 0 ? (
              <section className="space-y-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                  <div className="max-w-2xl space-y-1.5">
                    <p className="eyebrow-label">{hasActiveFilters ? 'Matching compounds' : 'All compounds'}</p>
                    <h2 className="compact-heading">
                      {hasActiveFilters ? 'Profiles matching your scan.' : 'Browse every published compound profile.'}
                    </h2>
                  </div>
                  <span className="inline-flex w-fit rounded-full border border-brand-900/10 bg-white/70 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-muted">
                    {hasActiveFilters ? visibleCompounds.length : paginated ? compounds.length : totalProfiles} profiles
                  </span>
                </div>

                <Suspense fallback={<CompoundSkeletonGrid />}>
                  <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                    {libraryCompounds.map((compound: RuntimeRecord) => (
                      <CompoundCard key={compound.slug} compound={compound} />
                    ))}
                  </div>
                </Suspense>
              </section>
            ) : null}
          </>
        )}
      </div>
    </div>
  )
}
