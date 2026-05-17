'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
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
]

function safeString(value: unknown) {
  return typeof value === 'string' ? value : ''
}

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] || '' : value || ''
}

function getName(item: any) {
  return formatDisplayLabel(item?.displayName) || formatDisplayLabel(item?.name) || formatDisplayLabel(item?.slug) || 'Unknown compound'
}

function getSummary(item: any) {
  return cleanSummary(item?.summary || item?.description || '', 'compound')
}

function getEvidence(item: any) {
  return normalizeDecisionEvidence(item?.evidence_tier || item?.evidenceLevel)
}

function getSafety(item: any) {
  return normalizeDecisionSafety(item?.safety_level || item?.safetyLevel, {
    hasSafetyNotes: Boolean(item?.safetyNotes || item?.safety_notes || item?.safety),
  })
}

function getEffects(item: any) {
  return unique([
    ...list(item?.primary_effects),
    ...list(item?.effects),
  ])
    .map(formatDisplayLabel)
    .filter(isClean)
    .slice(0, 2)
}

function getMechanismSignals(item: any) {
  return unique([
    ...list(item?.mechanisms),
    ...list(item?.targets),
    safeString(item?.class),
  ])
    .map(formatDisplayLabel)
    .filter(isClean)
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
  const value = labelize(item?.time_to_effect || item?.timeToEffect || item?.onset, '')
  return value && isClean(value) ? value : ''
}

function filterCompounds(compounds: any[], query: string) {
  const normalizedQuery = query.trim().toLowerCase()

  return compounds.filter(compound => {
    const corpus = [getName(compound), getSummary(compound), getBestFor(compound)]
      .join(' ')
      .toLowerCase()

    return !normalizedQuery || corpus.includes(normalizedQuery)
  })
}

function buildFilterHref(value: string, query: string) {
  const params = new URLSearchParams()
  if (query.trim()) params.set('q', query.trim())
  if (value !== 'all') params.set('context', value)

  const suffix = params.toString()
  return suffix ? `/compounds?${suffix}` : '/compounds'
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

export default function CompoundsIndexClient({ compounds: sourceCompounds }: { compounds: any[] }) {
  const searchParams = useSearchParams()
  const query = firstParam(searchParams.get('q') || undefined)
  const context = firstParam(searchParams.get('context') || undefined)
  const activeFilter = filterOptions.some(option => option.value === context) ? context : 'all'

  const compounds = [...sourceCompounds]
  const visibleCompounds = filterCompounds(compounds, query)

  return (
    <div className="min-h-screen px-3 pb-24 pt-4 text-ink sm:px-4 sm:py-8">
      <div className="mx-auto max-w-7xl space-y-6 sm:space-y-10 lg:space-y-12">
        <section className="hero-shell relative overflow-hidden rounded-[1.45rem] border border-white/50 px-4 py-6 shadow-sm sm:px-8 sm:py-10">
          <div className="relative grid gap-5 lg:grid-cols-[1.05fr_.95fr] lg:items-end">
            <div className="max-w-3xl space-y-3.5">
              <p className="eyebrow-label">Compound decision library</p>
              <h1 className="max-w-[13ch] text-balance font-display text-4xl font-semibold leading-[1.04] tracking-tight text-ink sm:text-6xl">
                Compound research library
              </h1>
              <p className="max-w-2xl text-base leading-7 text-[#46574d] sm:text-lg sm:leading-8">
                Start with practical context, then compare evidence, safety, and mechanisms before opening a full compound profile.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-[1.3rem] border border-brand-900/10 bg-white/85 p-4 shadow-[var(--shadow-card-calm)] sm:p-6">
          <form action="/compounds" className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <input
              name="q"
              type="search"
              defaultValue={query}
              placeholder="Search compound, mechanism, or safety note"
              className="min-h-13 w-full rounded-full border border-brand-900/10 bg-white px-4 text-base text-ink shadow-sm"
            />
            {activeFilter !== 'all' ? <input type="hidden" name="context" value={activeFilter} /> : null}
            <button type="submit" className="button-primary min-h-12 px-6 py-3">
              Search
            </button>
          </form>

          <DecisionFilterGroup
            options={filterOptions}
            activeFilter={activeFilter}
            query={query}
            buildHref={buildFilterHref}
          />
        </section>

        {visibleCompounds.length === 0 ? (
          <DecisionEmptyState
            eyebrow="No matching profiles"
            title="No compounds matched this focus."
            description="Try a broader compound name, mechanism, or pathway."
            actions={[
              { href: '/compounds', label: 'Reset filters', variant: 'primary' },
              { href: '/herbs', label: 'Browse herbs' },
            ]}
          />
        ) : (
          <section className="space-y-4 sm:space-y-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div className="max-w-2xl space-y-2">
                <p className="eyebrow-label">Compound profiles</p>
                <h2 className="compact-heading">Browse published compound profiles.</h2>
              </div>
              <span className="inline-flex min-h-9 w-fit items-center rounded-full border border-brand-900/10 bg-white/70 px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-[#5f6f66]">
                {visibleCompounds.length} profiles
              </span>
            </div>

            <div className="grid gap-3.5 md:grid-cols-2 xl:grid-cols-3">
              {visibleCompounds.map((compound: any) => (
                <CompoundCard key={compound.slug} compound={compound} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
