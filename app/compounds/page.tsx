import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import {
  DecisionEmptyState,
  DecisionProfileCard,
} from '@/components/ui/DecisionPrimitives'
import { cleanSummary, formatDisplayLabel, isClean, labelize, list, text, unique } from '@/lib/display-utils'
import { normalizeDecisionEvidence, normalizeDecisionSafety } from '@/lib/decision-primitives'
import { getCompounds } from '@/lib/runtime-data'
import { getRuntimeVisibility } from '@/lib/runtime-visibility'
import { buildPageMetadata, SITE_URL } from '@/lib/seo'
import { COMPOUNDS_PAGE_SIZE, paginateItems } from '@/lib/pagination'
import CompoundsIndexClient from './CompoundsIndexClient'

export const dynamic = 'force-static'

export const metadata: Metadata = buildPageMetadata({
  title: 'Compound & Nootropic Profiles',
  description:
    'Explore 500+ supplement and compound profiles with mechanisms, evidence strength, safety notes, and dosing context. Hype-free.',
  path: '/compounds',
})

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

function safeString(value: unknown) {
  return typeof value === 'string' ? value : ''
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
  if (effects.length > 0) return effects.join(' - ')

  const mechanisms = getMechanismSignals(item)
  if (mechanisms.length > 0) return mechanisms.join(' - ')

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

function matchesOption(item: any, option: FilterOption) {
  const corpus = getSearchCorpus(item)
  return option.terms.some(term => corpus.includes(term))
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

function StatCard({ value, label }: { value: number; label: string }) {
  return (
    <div className="min-w-0 rounded-[0.8rem] border border-brand-900/10 bg-white/80 p-2.5 shadow-sm sm:p-3">
      <p className="text-xl font-semibold tracking-tight text-ink sm:text-2xl">{value}</p>
      <p className="mt-0.5 text-[0.62rem] font-bold uppercase leading-snug tracking-[0.1em] text-[#5f6f66]">{label}</p>
    </div>
  )
}

function CompoundsItemListJsonLd({ compounds }: { compounds: any[] }) {
  const itemListElement = compounds.slice(0, 250).map((compound, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    url: `${SITE_URL}/compounds/${compound.slug}`,
    name: getName(compound),
  }))

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: 'Compound research library',
          description: metadata.description,
          numberOfItems: compounds.length,
          itemListElement,
        }),
      }}
    />
  )
}

function EmptyLibraryState() {
  return (
    <DecisionEmptyState
      eyebrow="Library unavailable"
      title="Compound profiles are being refreshed."
      description="The compound index did not load any publishable records. Check the runtime compound data build before publishing."
      actions={[
        { href: '/herbs', label: 'Browse herbs', variant: 'primary' },
        { href: '/goals', label: 'Browse goals' },
      ]}
    />
  )
}

export default async function CompoundsPage() {
  const runtimeCompounds = await getCompounds()
  const compounds = runtimeCompounds
    .filter((compound: any) => {
      try {
        return compound?.slug && getRuntimeVisibility(compound).canRender
      } catch {
        return Boolean(compound?.slug)
      }
    })
    .sort((a: any, b: any) => scoreCompound(b) - scoreCompound(a))

  const totalProfiles = compounds.length
  const evidenceForward = compounds.filter((compound: any) => /human|clinical|strong|high/i.test(text(compound?.evidence_tier || compound?.evidence_grade || compound?.evidenceLevel))).length
  const featuredCompounds = compounds.slice(0, 6)
  const libraryCompounds = compounds.slice(featuredCompounds.length)
  const contextSections = filterOptions
    .map(option => ({
      ...option,
      compounds: compounds.filter(compound => matchesOption(compound, option)).slice(0, 6),
    }))
    .filter(option => option.compounds.length > 0)

  const pageData = paginateItems(compounds, 1, COMPOUNDS_PAGE_SIZE)

  return (
    <div className="mx-auto max-w-6xl space-y-5 px-4 py-4 sm:py-6">
      <CompoundsItemListJsonLd compounds={compounds} />

      <section className="rounded-[0.95rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm sm:p-5">
        <p className="eyebrow-label">Compound decision library</p>
        <h1 className="mt-2 max-w-3xl text-3xl font-semibold tracking-tight text-ink sm:text-5xl">
          Compound research library
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-muted">
          Browse published compound profiles with mechanism context, evidence strength, safety notes, and practical supplement framing.
        </p>
        <p className="mt-2 text-sm font-semibold text-[#46574d]">{totalProfiles} compound profiles available</p>
      </section>

      <nav className="rounded-[0.8rem] border border-brand-900/10 bg-white/80 p-3 text-sm">
        <p className="font-semibold">Page 1 of {pageData.totalPages}</p>
        {pageData.hasNext ? <Link rel="next" href="/compounds/page/2">Next page →</Link> : null}
      </nav>

      <nav aria-label="Compound profiles index" className="sr-only">
        <ul>
          {compounds.slice(0, 300).map((c: any) => (
            <li key={c.slug}>
              <Link href={`/compounds/${c.slug}`}>{getName(c)}</Link>
            </li>
          ))}
        </ul>
      </nav>

      <section className="hero-shell relative overflow-hidden rounded-[0.95rem] border border-brand-900/10 px-3 py-4 shadow-sm sm:px-4 sm:py-5">
        <div className="relative grid gap-3 lg:grid-cols-[1.05fr_.95fr] lg:items-end">
          <div className="max-w-3xl space-y-2">
            <p className="eyebrow-label">Static compound index</p>
            <h2 className="max-w-[18ch] text-balance font-display text-2xl font-semibold leading-[1.08] tracking-tight text-ink sm:text-4xl">
              Explore compound profiles
            </h2>
            <p className="max-w-2xl text-sm leading-6 text-[#46574d]">
              Scan bioactive molecules by practical context first, then compare evidence, mechanism hints, and caution notes where source data supports them.
            </p>
          </div>

          <div className="rounded-[0.8rem] border border-brand-900/10 bg-white/80 p-2.5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-800">Library signal</p>
            <div className="mt-2 grid grid-cols-3 gap-2">
              <StatCard value={totalProfiles} label="Profiles" />
              <StatCard value={evidenceForward} label="Evidence-led" />
              <StatCard value={Math.max(featuredCompounds.length, 8)} label="Safety expanding" />
            </div>
          </div>
        </div>
      </section>

      {contextSections.length > 0 ? (
        <section className="rounded-[0.85rem] border border-brand-900/10 bg-white/85 p-3 shadow-sm sm:p-4" aria-labelledby="compound-context-heading">
          <div className="max-w-2xl space-y-1.5">
            <p className="eyebrow-label">Browse by context</p>
            <h2 id="compound-context-heading" className="compact-heading">Start with the decision you need to make.</h2>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <a href="#all-compounds" className="rounded-full border border-brand-700/25 bg-brand-50 px-2.5 py-1.5 text-xs font-semibold leading-tight text-brand-900">
              All compounds
            </a>
            {contextSections.map(option => (
              <a
                key={option.value}
                href={`#${option.value}`}
                className="rounded-full border border-brand-900/10 bg-white/80 px-2.5 py-1.5 text-xs font-semibold leading-tight text-[#33443a] transition hover:border-brand-700/20"
              >
                {option.label}
              </a>
            ))}
          </div>
        </section>
      ) : null}

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

      <Suspense fallback={
        <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
          {compounds.slice(0, 12).map((c: any) => (
            <div key={c.slug} className="h-48 animate-pulse rounded-[0.85rem] bg-white/50 border border-brand-900/5" />
          ))}
        </div>
      }>
        <CompoundsIndexClient compounds={pageData.pageItems} allCompounds={compounds} paginated page={1} totalPages={pageData.totalPages} />
      </Suspense>
    </div>
  )
}
