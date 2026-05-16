import type { Metadata } from 'next'
import Link from 'next/link'
import { getHerbSummaryIndex } from '@/lib/runtime-summary-indexes'
import { cleanSummary, formatDisplayLabel, isClean, labelize, list, text, unique } from '@/lib/display-utils'
import { getRuntimeVisibility } from '@/lib/runtime-visibility'
import '@/styles/premium-cards.css'

export const metadata: Metadata = {
  title: 'Herbs | The Hippie Scientist',
  description: 'Browse evidence-aware herb profiles with mechanisms, safety context, traditional use, and practical supplement research.',
}

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
  const label = labelize(
    item.evidence_tier ||
      item.evidenceTier ||
      item.safety?.evidenceTier ||
      item.evidence_grade ||
      item.evidenceLevel ||
      item.summary_quality,
    'Limited evidence'
  )

  if (/^none$/i.test(label)) return 'Insufficient evidence'
  if (/^traditional$/i.test(label)) return 'Traditional use'
  if (/review|unknown|tbd/i.test(label)) return 'Needs review'

  return label
}

function getSafety(item: any) {
  const label = labelize(
    item.safety_level ||
      item.safetyLevel ||
      item.safety?.confidence ||
      item.confidence ||
      item.profile_status,
    'Needs review'
  )

  if (/review|unknown|tbd/i.test(label)) return 'Needs review'
  if (/^low$/i.test(label)) return 'Limited safety data'
  if (/^medium$/i.test(label)) return 'Some safety context'
  if (/^high$/i.test(label)) return 'Safety context'

  return label
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

function StatCard({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-[1.25rem] border border-brand-900/10 bg-white/70 p-4 shadow-sm backdrop-blur">
      <p className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">{value}</p>
      <p className="mt-1 text-[0.68rem] font-bold uppercase tracking-[0.16em] text-[#5f6f66]">{label}</p>
    </div>
  )
}

function EmptyLibraryState() {
  return (
    <div className="rounded-[2rem] border border-brand-900/10 bg-white/80 p-6 shadow-[var(--shadow-card-calm)] sm:p-8">
      <div className="max-w-2xl space-y-4">
        <p className="eyebrow-label">Profiles unavailable</p>
        <h2 className="compact-heading">Herb profiles are temporarily unavailable.</h2>
        <p className="text-sm leading-6 text-[#46574d] sm:text-base">
          The herb library is still being generated or the runtime data did not return renderable profiles for this build. This is temporary and does not mean the herb database is empty.
        </p>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/search" className="rounded-full bg-brand-800 px-4 py-2 text-sm font-bold text-white transition hover:bg-brand-900">
          Search the site
        </Link>
        <Link href="/compounds" className="rounded-full border border-brand-900/10 bg-white px-4 py-2 text-sm font-bold text-brand-800 transition hover:border-brand-700/20 hover:bg-brand-50">
          Browse compounds
        </Link>
        <Link href="/goals" className="rounded-full border border-brand-900/10 bg-white px-4 py-2 text-sm font-bold text-brand-800 transition hover:border-brand-700/20 hover:bg-brand-50">
          Explore goals
        </Link>
        <Link href="/learn" className="rounded-full border border-brand-900/10 bg-white px-4 py-2 text-sm font-bold text-brand-800 transition hover:border-brand-700/20 hover:bg-brand-50">
          Visit learn
        </Link>
      </div>
    </div>
  )
}

function DecisionRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-brand-900/10 bg-white/70 p-3">
      <p className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-[#68786f]">{label}</p>
      <p className="mt-1 text-sm font-semibold leading-5 text-[#26382f]">{value}</p>
    </div>
  )
}

function HerbCard({ herb, featured = false }: { herb: any; featured?: boolean }) {
  const evidence = getEvidence(herb)
  const safety = getSafety(herb)
  const bestFor = getBestFor(herb)
  const timeToEffect = getTimeToEffect(herb)
  const name = getName(herb)
  const summary = getSummary(herb) || 'A conservative botanical profile with research context and safety notes.'

  return (
    <Link
      href={`/herbs/${herb.slug}`}
      className="group flex h-full min-h-[18rem] flex-col rounded-[1.35rem] border border-brand-900/10 bg-white/85 p-5 shadow-[var(--shadow-card-calm)] transition duration-300 hover:-translate-y-0.5 hover:border-brand-700/20 hover:bg-white hover:shadow-[var(--shadow-card-calm-hover)] focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-700/40 sm:p-6"
    >
      <div className="flex flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-2xl font-semibold tracking-tight text-ink transition group-hover:text-brand-800">
            {name}
          </h3>
          {featured ? (
            <span className="shrink-0 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-bold text-brand-800">Featured</span>
          ) : null}
        </div>

        <p className="mt-3 line-clamp-2 text-[0.95rem] leading-6 text-[#46574d]">
          {summary}
        </p>

        <div className="mt-5 grid gap-2">
          <DecisionRow label="Best for" value={bestFor} />
          <div className="grid gap-2 sm:grid-cols-2">
            <DecisionRow label="Evidence" value={evidence} />
            <DecisionRow label="Safety" value={safety} />
          </div>
          {timeToEffect ? <DecisionRow label="Time to effect" value={timeToEffect} /> : null}
        </div>
      </div>

      <div className="mt-5 flex min-h-11 items-center justify-center rounded-full bg-brand-800 px-4 py-3 text-sm font-bold text-white transition group-hover:bg-brand-900 group-focus-visible:bg-brand-900">
        View herb profile <span className="ml-2 transition group-hover:translate-x-0.5" aria-hidden="true">→</span>
      </div>
    </Link>
  )
}

const browsePaths = [
  {
    label: 'Stress & calm',
    href: '/goals/anxiety',
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
  {
    label: 'Inflammation',
    href: '/pathways/inflammation',
    description: 'Botanical compounds mapped to inflammatory pathways.',
  },
  {
    label: 'Metabolic health',
    href: '/search?q=metabolic%20health',
    description: 'Glucose, lipid, and energy-metabolism research leads.',
  },
  {
    label: 'Traditional use',
    href: '/search?q=traditional%20use',
    description: 'Historical context alongside modern evidence limits.',
  },
]

export default async function HerbsPage() {
  const allHerbs = await getHerbSummaryIndex()

  const herbs = allHerbs
    .filter((herb: any) => getRuntimeVisibility(herb).canRender)
    .sort((a: any, b: any) => scoreHerb(b) - scoreHerb(a))

  const totalProfiles = herbs.length

  const readyProfiles = herbs.filter((herb: any) =>
    /complete|strong|high|ready/i.test(
      text(herb.profile_status || herb.summary_quality || herb.safety?.confidence)
    )
  ).length

  const evidenceForward = herbs.filter((herb: any) =>
    /human|clinical|strong|high/i.test(
      text(herb.evidence_tier || herb.evidence_grade || herb.evidenceLevel)
    )
  ).length

  const safetyMapped = herbs.filter((herb: any) => getSafety(herb) !== 'Safety Review').length
  const featuredHerbs = herbs.slice(0, 6)

  return (
    <div className="min-h-screen px-4 py-5 text-ink sm:py-8">
      <div className="mx-auto max-w-7xl space-y-10 sm:space-y-16">
        <section className="hero-shell relative overflow-hidden rounded-[2rem] border border-white/50 px-5 py-9 shadow-[var(--shadow-card-calm)] sm:rounded-[2.5rem] sm:px-10 sm:py-14 lg:px-14">
          <div className="!absolute left-[-8rem] top-[-8rem] h-72 w-72 rounded-full bg-emerald-200/30 blur-3xl" />
          <div className="!absolute bottom-[-10rem] right-[-8rem] h-96 w-96 rounded-full bg-amber-200/30 blur-3xl" />

          <div className="relative grid gap-7 lg:grid-cols-[1.08fr_.92fr] lg:items-center">
            <div className="max-w-4xl space-y-5">
              <div className="inline-flex rounded-full border border-brand-700/10 bg-white/80 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-brand-800 backdrop-blur-md">
                Botanical profiles
              </div>

              <div className="space-y-5">
                <h1 className="max-w-[13ch] text-balance font-display text-4xl font-semibold leading-[1.04] tracking-tight text-ink sm:text-6xl lg:text-7xl">
                  Herbal research library
                </h1>

                <p className="max-w-2xl text-base leading-7 text-[#46574d] sm:text-xl sm:leading-8">
                  Scan herbs by use case, evidence, and safety context before opening a full profile. Conservative summaries first; deeper mechanisms after the click.
                </p>
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-brand-900/10 bg-white/70 p-4 shadow-[var(--shadow-card-calm)] backdrop-blur sm:p-5">
              <div className="rounded-[1.5rem] bg-gradient-to-br from-[#fbfaf6] via-white to-[#eef6ee] p-5 sm:p-7">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-800">Library at a glance</p>
                <div className="mt-5 grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                  <StatCard value={totalProfiles} label="Profiles" />
                  <StatCard value={evidenceForward} label="Human evidence" />
                  <StatCard value={safetyMapped || readyProfiles} label="Safety context" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-brand-900/10 bg-white/75 p-5 shadow-[var(--shadow-card-calm)] sm:p-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl space-y-3">
              <p className="eyebrow-label">Start with a goal</p>
              <h2 className="compact-heading">Find the botanical path that matches the question you came with.</h2>
            </div>
            <Link href="/goals" className="text-sm font-bold text-brand-800 transition hover:text-brand-900">All goals →</Link>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {browsePaths.map(path => (
              <Link
                key={path.label}
                href={path.href}
                className="group rounded-[1.25rem] border border-brand-900/10 bg-white/80 p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-700/20 hover:bg-white hover:shadow-[var(--shadow-card-calm)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold tracking-tight text-ink transition group-hover:text-brand-800">{path.label}</h3>
                    <p className="mt-2 text-sm leading-[1.65] text-[#46574d]">{path.description}</p>
                  </div>
                  <span className="mt-1 text-brand-800 transition group-hover:translate-x-1" aria-hidden="true">→</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {herbs.length === 0 ? (
          <EmptyLibraryState />
        ) : (
          <>
            {featuredHerbs.length > 0 ? (
              <section className="space-y-8">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                  <div className="max-w-2xl space-y-3">
                    <p className="eyebrow-label">Featured herbs</p>
                    <h2 className="compact-heading">Strong starting points for deeper botanical research.</h2>
                  </div>
                  <p className="max-w-md text-sm leading-6 text-[#5f6f66]">
                    Featured profiles are prioritized by evidence, profile readiness, and practical browse value.
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {featuredHerbs.map((herb: any) => (
                    <HerbCard key={herb.slug} herb={herb} featured />
                  ))}
                </div>
              </section>
            ) : null}

            <section className="space-y-8">
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div className="max-w-2xl space-y-3">
                  <p className="eyebrow-label">All herbs</p>
                  <h2 className="compact-heading">Browse every published herb profile.</h2>
                </div>
                <span className="inline-flex w-fit rounded-full border border-brand-900/10 bg-white/70 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[#5f6f66]">
                  {totalProfiles} profiles
                </span>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {herbs.map((herb: any) => (
                  <HerbCard key={herb.slug} herb={herb} />
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  )
}
