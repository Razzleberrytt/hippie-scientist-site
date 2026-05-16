'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { cleanSummary, formatDisplayLabel, isClean, labelize, list, text, unique } from '@/lib/display-utils'
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

function normalizeEvidenceLabel(value: string) {
  if (/^none$/i.test(value)) return 'Insufficient evidence'
  if (/traditional/i.test(value)) return 'Traditional use'
  if (/preclinical|animal|cell|mechanistic/i.test(value)) return 'Preliminary evidence'
  if (/mixed|conflict/i.test(value)) return 'Mixed evidence'
  if (/review|unknown|tbd|profile/i.test(value)) return 'Needs review'

  return value
}

function getEvidence(item: any) {
  const label = labelize(
    item?.evidence_tier ||
      item?.evidenceTier ||
      item?.evidence_grade ||
      item?.evidenceLevel ||
      item?.humanEvidenceLevel ||
      item?.summary_quality,
    'Limited evidence'
  )

  return normalizeEvidenceLabel(label)
}

function getSafety(item: any) {
  const label = labelize(
    item?.safety_level ||
      item?.safetyLevel ||
      item?.safety?.confidence ||
      item?.safetyStatus ||
      item?.contraindicationLevel ||
      item?.profile_status,
    item?.safetyNotes ? 'Safety notes available' : 'Needs review'
  )

  if (/review|unknown|tbd|profile/i.test(label)) return 'Needs review'
  if (/^low$/i.test(label)) return 'Limited safety data'
  if (/^medium$/i.test(label)) return 'Some safety context'
  if (/^high$/i.test(label)) return 'Safety context'

  return label
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
    <div className="rounded-[1.1rem] border border-brand-900/10 bg-white/75 p-3 shadow-sm backdrop-blur sm:p-4">
      <p className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">{value}</p>
      <p className="mt-1 text-[0.68rem] font-bold uppercase tracking-[0.14em] text-[#5f6f66]">{label}</p>
    </div>
  )
}

function EmptyLibraryState() {
  return (
    <div className="rounded-[1.5rem] border border-brand-900/10 bg-white/85 p-6 shadow-[var(--shadow-card-calm)] sm:p-8">
      <div className="max-w-2xl space-y-3">
        <p className="eyebrow-label">Profiles unavailable</p>
        <h2 className="compact-heading">Compound profiles are temporarily unavailable.</h2>
        <p className="text-sm leading-6 text-[#46574d] sm:text-base">
          The compound library is still being generated or the runtime data did not return renderable profiles for this build. This is temporary and does not mean the compound database is empty.
        </p>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/search" className="button-primary min-h-11 px-4 py-2 text-sm">
          Search the site
        </Link>
        <Link href="/herbs" className="button-secondary min-h-11 px-4 py-2 text-sm">
          Browse herbs
        </Link>
        <Link href="/goals" className="button-secondary min-h-11 px-4 py-2 text-sm">
          Explore goals
        </Link>
      </div>
    </div>
  )
}

function EmptyFilteredState({ query, context }: { query: string; context: string }) {
  const activeContext = filterOptions.find(option => option.value === context)?.label

  return (
    <div className="rounded-[1.5rem] border border-brand-900/10 bg-white/85 p-6 shadow-sm sm:p-8">
      <div className="max-w-2xl space-y-3">
        <p className="eyebrow-label">No matching profiles</p>
        <h2 className="compact-heading">No compounds matched this scan.</h2>
        <p className="text-sm leading-6 text-[#46574d] sm:text-base">
          Try a broader compound name, mechanism, source herb, or pathway. Evidence and safety labels stay conservative when source data is incomplete.
        </p>
        {query || activeContext ? (
          <p className="text-sm leading-6 text-[#5f6f66]">
            Current scan: {[query ? `“${query}”` : '', activeContext || ''].filter(Boolean).join(' + ')}
          </p>
        ) : null}
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/compounds" className="button-primary min-h-11 px-4 py-2 text-sm">
          Reset filters
        </Link>
        <Link href="/herbs" className="button-secondary min-h-11 px-4 py-2 text-sm">
          Browse herbs
        </Link>
      </div>
    </div>
  )
}

function DecisionMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-[1rem] border border-brand-900/10 bg-[#fbfaf6]/85 px-3 py-2.5">
      <p className="text-[0.66rem] font-bold uppercase tracking-[0.13em] text-[#68786f]">{label}</p>
      <p className="mt-1 truncate text-sm font-semibold leading-5 text-[#26382f]">{value}</p>
    </div>
  )
}

function CompoundCard({ compound, featured = false }: { compound: any; featured?: boolean }) {
  const evidence = getEvidence(compound)
  const safety = getSafety(compound)
  const bestFor = getBestFor(compound)
  const timeToEffect = getTimeToEffect(compound)
  const mechanisms = getMechanismSignals(compound)
  const name = getName(compound)
  const summary = getSummary(compound) || 'A conservative compound profile with mechanism, evidence, and safety context.'

  return (
    <Link
      href={`/compounds/${compound?.slug || ''}`}
      className="group flex h-full min-h-[16rem] flex-col rounded-[1.3rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-brand-700/20 hover:bg-white hover:shadow-[var(--shadow-card-calm)] focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-700/40 sm:p-5"
    >
      <div className="flex flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-[1.35rem] font-semibold leading-tight tracking-tight text-ink transition group-hover:text-brand-800 sm:text-2xl">
            {name}
          </h3>
          {featured ? (
            <span className="shrink-0 rounded-full border border-brand-700/10 bg-brand-50 px-2.5 py-1 text-[0.68rem] font-bold text-brand-800">Start here</span>
          ) : null}
        </div>

        <p className="mt-3 line-clamp-2 text-[0.95rem] leading-6 text-[#46574d]">
          {summary}
        </p>

        <div className="mt-4 rounded-[1.1rem] border border-brand-900/10 bg-brand-50/45 p-3">
          <p className="text-[0.66rem] font-bold uppercase tracking-[0.13em] text-brand-800">Best-for context</p>
          <p className="mt-1.5 text-base font-semibold leading-6 text-[#203329]">{bestFor}</p>
        </div>

        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <DecisionMetric label="Evidence" value={evidence} />
          <DecisionMetric label="Safety" value={safety} />
          {timeToEffect ? <DecisionMetric label="Time" value={timeToEffect} /> : null}
        </div>

        {mechanisms.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2 border-t border-brand-900/10 pt-3">
            {mechanisms.map((mechanism: string) => (
              <span key={mechanism} className="rounded-full bg-white/70 px-2.5 py-1 text-xs font-semibold text-[#64746a]">
                {mechanism}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      <div className="mt-4 flex min-h-11 items-center justify-center rounded-full bg-brand-800 px-4 py-3 text-sm font-bold text-white transition group-hover:bg-brand-900 group-focus-visible:bg-brand-900">
        View profile <span className="ml-2 transition group-hover:translate-x-0.5" aria-hidden="true">→</span>
      </div>
    </Link>
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

export default function CompoundsIndexClient({ compounds: sourceCompounds }: { compounds: any[] }) {
  const searchParams = useSearchParams()
  const query = firstParam(searchParams.get('q') || undefined)
  const context = firstParam(searchParams.get('context') || undefined)
  const activeFilter = filterOptions.some(option => option.value === context) ? context : 'all'

  const compounds = [...sourceCompounds].sort((a: any, b: any) => scoreCompound(b) - scoreCompound(a))
  const visibleCompounds = filterCompounds(compounds, query, activeFilter)
  const hasActiveFilters = Boolean(query.trim()) || activeFilter !== 'all'
  const totalProfiles = compounds.length
  const evidenceForward = compounds.filter((compound: any) => /human|clinical|strong|high/i.test(text(compound?.evidence_tier || compound?.evidence_grade || compound?.evidenceLevel))).length
  const safetyMapped = compounds.filter((compound: any) => getSafety(compound) !== 'Needs review').length
  const featuredCompounds = hasActiveFilters ? [] : compounds.slice(0, 6)
  const libraryCompounds = hasActiveFilters ? visibleCompounds : compounds.slice(featuredCompounds.length)

  return (
    <div className="min-h-screen px-4 py-5 text-ink sm:py-8">
      <div className="mx-auto max-w-7xl space-y-8 sm:space-y-12">
        <section className="hero-shell relative overflow-hidden rounded-[1.7rem] border border-white/50 px-5 py-7 shadow-sm sm:rounded-[2.2rem] sm:px-8 sm:py-10 lg:px-12">
          <div className="!absolute right-[-8rem] top-[-8rem] h-72 w-72 rounded-full bg-emerald-200/25 blur-3xl" />

          <div className="relative grid gap-6 lg:grid-cols-[1.05fr_.95fr] lg:items-end">
            <div className="max-w-3xl space-y-4">
              <p className="eyebrow-label">Compound decision library</p>
              <h1 className="max-w-[13ch] text-balance font-display text-4xl font-semibold leading-[1.04] tracking-tight text-ink sm:text-6xl lg:text-7xl">
                Compound research library
              </h1>
              <p className="max-w-2xl text-base leading-7 text-[#46574d] sm:text-lg sm:leading-8">
                Scan bioactive molecules by practical context first, then compare evidence, safety notes, and mechanism hints before opening a full compound profile.
              </p>
            </div>

            <div className="rounded-[1.35rem] border border-brand-900/10 bg-white/75 p-3 shadow-sm backdrop-blur sm:p-4">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-800">Library signal</p>
              <div className="mt-3 grid grid-cols-3 gap-2">
                <StatCard value={totalProfiles} label="Profiles" />
                <StatCard value={evidenceForward} label="Evidence-led" />
                <StatCard value={safetyMapped} label="Safety notes" />
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[1.5rem] border border-brand-900/10 bg-white/85 p-4 shadow-[var(--shadow-card-calm)] sm:p-6" aria-labelledby="compound-search-heading">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl space-y-2">
              <p className="eyebrow-label">Search and filter</p>
              <h2 id="compound-search-heading" className="compact-heading">Start with the decision you need to make.</h2>
            </div>
            <Link href="/herbs" className="w-fit text-sm font-bold text-brand-800 transition hover:text-brand-900">Browse herb sources →</Link>
          </div>

          <form action="/compounds" className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto]">
            <label className="sr-only" htmlFor="compound-search">Search compounds</label>
            <input
              id="compound-search"
              name="q"
              type="search"
              defaultValue={query}
              placeholder="Search compound, mechanism, source herb, or safety note"
              className="min-h-12 w-full rounded-full border border-brand-900/10 bg-white px-4 text-base text-ink shadow-sm placeholder:text-[#7b8a81]"
            />
            {activeFilter !== 'all' ? <input type="hidden" name="context" value={activeFilter} /> : null}
            <button type="submit" className="button-primary min-h-12 px-6 py-3">
              Search
            </button>
          </form>

          <details className="mt-4 rounded-[1.2rem] border-brand-900/10 bg-[#fbfaf6]/80 p-4 shadow-none" open={hasActiveFilters || undefined}>
            <summary className="flex min-h-11 items-center justify-between gap-4 text-sm font-bold text-ink">
              <span>Refine by context</span>
              <span className="text-brand-800" aria-hidden="true">↓</span>
            </summary>
            <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
              <Link
                href={buildFilterHref('all', query)}
                className={`rounded-[1rem] border px-3 py-3 text-sm font-semibold transition ${activeFilter === 'all' ? 'border-brand-700/25 bg-brand-50 text-brand-900' : 'border-brand-900/10 bg-white/80 text-[#33443a] hover:border-brand-700/20'}`}
              >
                All contexts
                <span className="mt-1 block text-xs font-medium leading-5 text-[#64746a]">Keep the scan broad.</span>
              </Link>
              {filterOptions.map(option => (
                <Link
                  key={option.value}
                  href={buildFilterHref(option.value, query)}
                  className={`rounded-[1rem] border px-3 py-3 text-sm font-semibold transition ${activeFilter === option.value ? 'border-brand-700/25 bg-brand-50 text-brand-900' : 'border-brand-900/10 bg-white/80 text-[#33443a] hover:border-brand-700/20'}`}
                >
                  {option.label}
                  <span className="mt-1 block text-xs font-medium leading-5 text-[#64746a]">{option.hint}</span>
                </Link>
              ))}
            </div>
          </details>
        </section>

        <section className="rounded-[1.5rem] border border-brand-900/10 bg-white/70 p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl space-y-2">
              <p className="eyebrow-label">Common starting points</p>
              <h2 className="compact-heading">Use broader guides if you are still orienting.</h2>
            </div>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {browsePaths.map(path => (
              <Link
                key={path.label}
                href={path.href}
                className="group rounded-[1.1rem] border border-brand-900/10 bg-white/80 p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-700/20 hover:bg-white"
              >
                <h3 className="text-lg font-semibold tracking-tight text-ink transition group-hover:text-brand-800">{path.label}</h3>
                <p className="mt-2 text-sm leading-6 text-[#46574d]">{path.description}</p>
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
              <section className="space-y-5">
                <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                  <div className="max-w-2xl space-y-2">
                    <p className="eyebrow-label">Start here</p>
                    <h2 className="compact-heading">High-signal profiles for learning the card pattern.</h2>
                  </div>
                  <p className="max-w-md text-sm leading-6 text-[#5f6f66]">
                    Sorted by evidence signals, profile readiness, and mechanism mapping—not by promised outcomes.
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {featuredCompounds.map((compound: any) => (
                    <CompoundCard key={compound.slug} compound={compound} featured />
                  ))}
                </div>
              </section>
            ) : null}

            {libraryCompounds.length > 0 ? (
              <section className="space-y-5">
                <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                  <div className="max-w-2xl space-y-2">
                    <p className="eyebrow-label">{hasActiveFilters ? 'Matching compounds' : 'All compounds'}</p>
                    <h2 className="compact-heading">
                      {hasActiveFilters ? 'Profiles matching your scan.' : 'Browse every published compound profile.'}
                    </h2>
                  </div>
                  <span className="inline-flex w-fit rounded-full border border-brand-900/10 bg-white/70 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[#5f6f66]">
                    {hasActiveFilters ? visibleCompounds.length : totalProfiles} profiles
                  </span>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
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
