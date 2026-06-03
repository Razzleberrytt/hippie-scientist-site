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

function getName(item: any) {
  return (
    formatDisplayLabel(item?.displayName) ||
    formatDisplayLabel(item?.name) ||
    formatDisplayLabel(item?.compoundName) ||
    formatDisplayLabel(item?.canonicalCompoundName) ||
    formatDisplayLabel(item?.slug) ||
    'Unknown compound'
  )
}

function getSummary(item: any) {
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

function getEvidence(item: any) {
  return normalizeDecisionEvidence(
    item?.evidence_tier ||
      item?.evidenceTier ||
      item?.evidence_grade ||
      item?.evidenceLevel ||
      item?.humanEvidenceLevel ||
      item?.summary_quality
  )
}

function getSafety(item: any) {
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

function getEffects(item: any) {
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

function getMechanismSignals(item: any) {
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

function getBestFor(item: any) {
  const effects = getEffects(item)
  if (effects.length > 0) return effects.join(' • ')

  const mechanisms = getMechanismSignals(item)
  if (mechanisms.length > 0) return mechanisms.join(' • ')

  return 'Research context'
}

function getTimeToEffect(item: any) {
  const value = labelize(
    item?.time_to_effect ||
      item?.timeToEffect ||
      item?.onset ||
      item?.practical?.timeToEffect ||
      item?.timeline,
    ''
  )

  return value && isClean(value) ? value : ''
}

function scoreCompound(item: any) {
  let score = 0
  const profile = text(item?.profile_status || item?.summary_quality || item?.status).toLowerCase()
  const evidence = text(item?.evidence_tier || item?.evidence_grade || item?.evidenceLevel).toLowerCase()

  if (/complete|strong|high|ready/.test(profile)) score += 5
  if (/strong|human|clinical|high/.test(evidence)) score += 4

  score += getEffects(item).length
  score += getMechanismSignals(item).length

  return score
}

function getSearchCorpus(item: any) {
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

function filterCompounds(compounds: any[], query: string, context: string) {
  const normalizedQuery = query.trim().toLowerCase()
  const option = filterOptions.find(item => item.value === context)

  return compounds.filter(compound => {
    const corpus = getSearchCorpus(compound)
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
  return suffix ? `/compounds?${suffix}` : '/compounds'
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
      title="Compound profiles are temporarily unavailable."
      description="The compound library is still being generated or the runtime data did not return renderable profiles for this build. This is temporary and does not mean the compound database is empty."
      actions={[
        { href: '/search', label: 'Search the site', variant: 'primary' },
        { href: '/herbs', label: 'Browse herbs' },
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

function CompoundCard({ compound, featured = false }: { compound: any; featured?: boolean }) {
  return (
    <DecisionProfileCard
      href={`/compounds/${compound?.slug || ''}`}
      name={getName(compound)}
      summary={getSummary(compound)}
      bestFor={getBestFor(compound)}
      evidence={getEvidence(compound)}
      safety={getSafety(compound)}
      timeToEffect={getTimeToEffect(compound)}
      mechanisms={getMechanismSignals(compound)}
      featured={featured}
      fallbackSummary="A conservative compound profile with mechanism, evidence, and safety context."
    />
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
    href: '/goals',
    description: 'Use decision guides when the practical context matters more than the molecule.',
  },
  {
    label: 'Compare options',
    href: '/compare',
    description: 'Review alternatives without treating compound lists as recommendations.',
  },
]

export default function CompoundsIndexClient({ compounds: sourceCompounds, initialQuery = '', initialContext = ''}: { compounds: any[]; initialQuery?: string; initialContext?: string }) {
  const query = firstParam(initialQuery)
  const context = firstParam(initialContext)
  const activeFilter = filterOptions.some(option => option.value === context) ? context : 'all'

  const compounds = [...sourceCompounds].sort((a: any, b: any) => scoreCompound(b) - scoreCompound(a))
  const visibleCompounds = filterCompounds(compounds, query, activeFilter)
  const hasActiveFilters = Boolean(query.trim()) || activeFilter !== 'all'
  const totalProfiles = compounds.length
  const evidenceForward = compounds.filter((compound: any) => /human|clinical|strong|high/i.test(text(compound?.evidence_tier || compound?.evidence_grade || compound?.evidenceLevel))).length
  const featuredCompounds = hasActiveFilters ? [] : compounds.slice(0, 6)
  const libraryCompounds = hasActiveFilters ? visibleCompounds : compounds.slice(featuredCompounds.length)

  return (
    <div className="px-2 py-2 text-ink sm:px-3 sm:py-3">
      <div className="mx-auto max-w-7xl space-y-4 sm:space-y-4">
        <section className="hero-shell relative overflow-hidden rounded-[0.95rem] border border-brand-900/10 px-3 py-4 shadow-sm sm:px-4 sm:py-5">
          <div className="relative grid gap-3 lg:grid-cols-[1.05fr_.95fr] lg:items-end">
            <div className="max-w-3xl space-y-2">
              <p className="eyebrow-label">Compound decision library</p>
              <h1 className="max-w-[18ch] text-balance font-display text-2xl font-semibold leading-[1.08] tracking-tight text-ink sm:text-4xl">
                Compound research library
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-[#46574d]">
                Scan bioactive molecules by practical context first, then compare evidence, mechanism hints, and caution notes where source data supports them.
              </p>
            </div>

            <div className="rounded-[0.8rem] border border-brand-900/10 bg-white/80 p-2.5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-800">Library signal</p>
              <div className="mt-2 grid grid-cols-3 gap-2">
                <StatCard value={totalProfiles} label="Profiles" />
                <StatCard value={evidenceForward} label="Evidence-led" />
                <StatCard value={featuredCompounds.length || Math.min(totalProfiles, 6)} label="Start here" />
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[0.85rem] border border-brand-900/10 bg-white/85 p-3 shadow-sm sm:p-4" aria-labelledby="compound-search-heading">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl space-y-1.5">
              <p className="eyebrow-label">Search and filter</p>
              <h2 id="compound-search-heading" className="compact-heading">Start with the decision you need to make.</h2>
            </div>
            <Link href="/herbs" className="w-fit text-sm font-bold text-brand-800 transition hover:text-brand-900">Browse herb sources →</Link>
          </div>

          <form action="/compounds" className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto]">
            <label className="sr-only" htmlFor="compound-search">Search compounds</label>
            <input
              id="compound-search"
              name="q"
              type="search"
              defaultValue={query}
              placeholder="Search compound, mechanism, source herb, or safety note"
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
              <h2 className="compact-heading">Use broader guides if you are still orienting.</h2>
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

        {compounds.length === 0 ? (
          <EmptyLibraryState />
        ) : visibleCompounds.length === 0 ? (
          <EmptyFilteredState query={query} context={activeFilter} />
        ) : (
          <>
            {featuredCompounds.length > 0 ? (
              <section className="space-y-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                  <div className="max-w-2xl space-y-1.5">
                    <p className="eyebrow-label">Start here</p>
                    <h2 className="compact-heading">High-signal starting points.</h2>
                  </div>
                  <p className="max-w-md text-sm leading-6 text-[#5f6f66]">
                    Sorted by evidence, safety, and profile readiness.
                  </p>
                </div>

                <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                  {featuredCompounds.map((compound: any) => (
                    <CompoundCard key={compound.slug} compound={compound} featured />
                  ))}
                </div>
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
                  <span className="inline-flex w-fit rounded-full border border-brand-900/10 bg-white/70 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[#5f6f66]">
                    {hasActiveFilters ? visibleCompounds.length : totalProfiles} profiles
                  </span>
                </div>

                <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                  {libraryCompounds.map((compound: any) => (
                    <CompoundCard key={compound.slug} compound={compound} />
                  ))}
                </div>
              </section>
            ) : null}
          </>
        )}
      </div>
    </div>
  )
}
