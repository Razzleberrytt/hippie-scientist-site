import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getStacks, getCompounds } from '@/lib/runtime-data'
import { supplementComparisons } from '@/data/comparisons'
import { goalConfigs } from '@/data/goals'

type Params = { params: Promise<{ slug: string }> }

type CompoundRecord = {
  slug: string
  name?: string
  displayName?: string
  summary?: string
  description?: string
  best_for?: string
  bestFor?: string
  avoid_if?: string
  avoidIf?: string
  safety_notes?: string
  safetyNotes?: string
  safety_summary?: string
  safetySummary?: string
  fact_score_v2?: number | string
  factScore?: number | string
  net_score?: number | string
  evidence_grade?: string
  evidenceGrade?: string
  evidenceTier?: string | number
  tier_level?: string | number
}

const clean = (value: unknown): string => {
  if (value === null || value === undefined) return ''
  if (Array.isArray(value)) return value.map(clean).filter(Boolean).join(', ')
  if (typeof value === 'object') return ''
  return String(value).replace(/\s+/g, ' ').trim()
}

const normalize = (value?: string) => (value ?? '').toLowerCase().replace(/[^a-z0-9]/g, '')

const formatName = (slug: string) =>
  slug
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')

const getCompoundLabel = (compound: CompoundRecord) =>
  clean(compound.displayName) || clean(compound.name) || formatName(compound.slug)

const getScore = (compound: CompoundRecord) => {
  const value = Number(compound.fact_score_v2 ?? compound.factScore ?? compound.net_score ?? 0)
  return Number.isFinite(value) ? value : 0
}

const matchesCompound = (compound: CompoundRecord, candidates: string[]) => {
  const aliases = new Set([
    compound.slug,
    normalize(compound.slug),
    compound.name,
    compound.displayName,
    normalize(compound.name),
    normalize(compound.displayName),
  ].filter(Boolean))

  return candidates.some((candidate) => aliases.has(candidate) || aliases.has(normalize(candidate)))
}

const getTopCompounds = (compounds: CompoundRecord[], candidates: string[]) =>
  compounds
    .filter((compound) => matchesCompound(compound, candidates))
    .sort((a, b) => getScore(b) - getScore(a) || getCompoundLabel(a).localeCompare(getCompoundLabel(b)))

const getEvidenceLabel = (compound: CompoundRecord) => {
  const raw = clean(compound.evidence_grade ?? compound.evidenceGrade ?? compound.evidenceTier ?? compound.tier_level)
  if (!raw) return 'Evidence: review profile'

  const normalized = raw.toLowerCase()
  if (['a', 'strong', 'high'].includes(normalized)) return 'Strong evidence'
  if (['b', 'moderate', 'medium'].includes(normalized)) return 'Moderate evidence'
  if (['c', 'limited', 'preliminary'].includes(normalized)) return 'Limited evidence'
  if (['d', 'traditional', 'theoretical', 'low'].includes(normalized)) return 'Traditional / theoretical'

  return `Evidence: ${raw}`
}

const getBestFor = (compound: CompoundRecord) => clean(compound.best_for ?? compound.bestFor)

const getAvoidIf = (compound: CompoundRecord) => clean(compound.avoid_if ?? compound.avoidIf)

const getSafetySummary = (compound: CompoundRecord) =>
  clean(compound.safety_summary ?? compound.safetySummary ?? compound.safety_notes ?? compound.safetyNotes)

export function generateStaticParams() {
  return goalConfigs.map((goal) => ({ slug: goal.slug }))
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const goal = goalConfigs.find((item) => item.slug === slug)
  if (!goal) return { title: 'Goal Guide | The Hippie Scientist' }

  return {
    title: `${goal.title} Decision Guide | The Hippie Scientist`,
    description: goal.summary,
  }
}

export default async function GoalPage({ params }: Params) {
  const { slug } = await params
  const goal = goalConfigs.find((item) => item.slug === slug)
  if (!goal) return notFound()

  const compounds = (await getCompounds()) as CompoundRecord[]
  const stacks = await getStacks()
  const topCompounds = getTopCompounds(compounds, goal.compoundCandidates)

  const relatedStacks = stacks.filter((stack) =>
    goal.stackSlugs.includes(stack.slug) || (stack.goal_slug || stack.goal) === goal.slug
  )

  const relatedComparisons = supplementComparisons.filter((comparison) =>
    goal.comparisonSlugs.includes(comparison.slug)
  )

  return (
    <main className="space-y-8 sm:space-y-10">
      <section className="hero-panel">
        <div className="relative max-w-4xl">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-emerald-800/70">Goal guide</p>
          <h1 className="mt-3 text-5xl font-black leading-[0.95] text-slate-950 sm:text-7xl">{goal.title}</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-700">{goal.summary}</p>
          <div className="mt-6 flex flex-wrap gap-2">
            <span className="rounded-full bg-white/75 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-slate-700 shadow-sm ring-1 ring-slate-900/10">Evidence-aware</span>
            <span className="rounded-full bg-white/75 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-slate-700 shadow-sm ring-1 ring-slate-900/10">Safety-first</span>
            <span className="rounded-full bg-white/75 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-slate-700 shadow-sm ring-1 ring-slate-900/10">Compare before choosing</span>
          </div>
        </div>
      </section>

      {topCompounds.length > 0 ? (
        <section className="soft-section">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700/60">Start here</p>
              <h2 className="mt-1 text-3xl font-black text-slate-950">Top options for this goal</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                These are the most relevant candidates currently mapped to this goal. Use the profile pages for dose, timing, interactions, and source detail.
              </p>
            </div>
            <Link href="/compounds" className="text-sm font-black text-emerald-700">All compounds →</Link>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {topCompounds.slice(0, 6).map((compound) => {
              const label = getCompoundLabel(compound)
              const bestFor = getBestFor(compound)
              const avoidIf = getAvoidIf(compound)
              const safetySummary = getSafetySummary(compound)
              const summary = clean(compound.summary) || clean(compound.description)

              return (
                <Link key={compound.slug} href={`/compounds/${compound.slug}`} className="premium-card group block p-5 transition hover:-translate-y-0.5 hover:bg-white">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-emerald-800 ring-1 ring-emerald-900/10">
                      {getEvidenceLabel(compound)}
                    </span>
                    {getScore(compound) > 0 ? (
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-slate-600">
                        Score {getScore(compound)}
                      </span>
                    ) : null}
                  </div>

                  <h3 className="mt-3 text-xl font-black text-slate-950 group-hover:text-emerald-800">{label}</h3>

                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
                    {bestFor || summary || 'Useful candidate for this goal.'}
                  </p>

                  {(avoidIf || safetySummary) ? (
                    <div className="mt-4 rounded-2xl bg-amber-50/90 p-3 ring-1 ring-amber-900/10">
                      <p className="text-xs font-black uppercase tracking-[0.16em] text-amber-800">Safety check</p>
                      <p className="mt-1 line-clamp-2 text-sm font-semibold leading-6 text-slate-700">
                        {avoidIf ? `Avoid if: ${avoidIf}` : safetySummary}
                      </p>
                    </div>
                  ) : null}

                  <span className="mt-4 inline-flex text-sm font-black text-emerald-700 transition group-hover:translate-x-1">View full profile →</span>
                </Link>
              )
            })}
          </div>
        </section>
      ) : null}

      <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <article className="soft-section">
          <h2 className="text-2xl font-black text-slate-950">How to choose</h2>
          <ul className="mt-4 space-y-3">
            {[
              'Start with the option that matches your situation, not the loudest claim.',
              'Use comparisons if you are unsure between two choices.',
              'Use stacks when you want the simplest routine path.',
            ].map((item) => (
              <li key={item} className="flex gap-3 text-sm font-semibold leading-6 text-slate-700">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </article>

        <article className="soft-section bg-amber-50/80">
          <h2 className="text-2xl font-black text-slate-950">Safety note</h2>
          <p className="mt-3 text-sm leading-6 text-slate-700">{goal.safetyNote}</p>
        </article>
      </section>

      <section>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700/60">Easiest path</p>
            <h2 className="mt-1 text-3xl font-black text-slate-950">Simple routines that work</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              These combine multiple compounds into a single, practical routine.
            </p>
          </div>
          <Link href="/stacks" className="text-sm font-black text-emerald-700">All stacks →</Link>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {relatedStacks.length > 0 ? (
            relatedStacks.map((stack) => (
              <Link key={stack.slug} href={`/stacks/${stack.slug}`} className="premium-card group block p-5 transition hover:-translate-y-0.5 hover:bg-white">
                <h3 className="text-xl font-black text-slate-950 group-hover:text-emerald-800">{stack.title}</h3>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{stack.short_description}</p>
                <span className="mt-4 inline-flex text-sm font-black text-emerald-700 transition group-hover:translate-x-1">View routine →</span>
              </Link>
            ))
          ) : (
            <div className="soft-section md:col-span-2">
              <h3 className="text-xl font-black text-slate-950">Routine still being built</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">Start with the top compound options above, then use comparisons for context.</p>
            </div>
          )}
        </div>
      </section>

      {relatedComparisons.length > 0 ? (
        <section className="rounded-[2rem] bg-slate-950 p-5 text-white shadow-xl shadow-slate-900/10 sm:p-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-200/70">Decision support</p>
              <h2 className="mt-1 text-3xl font-black text-white">Not sure which to pick?</h2>
            </div>
            <Link href="/compare" className="text-sm font-black text-emerald-200">Compare all →</Link>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {relatedComparisons.map((comparison) => (
              <Link key={comparison.slug} href={`/compare/${comparison.slug}`} className="rounded-2xl border border-white/10 bg-white/[0.06] p-5 transition hover:-translate-y-0.5 hover:bg-white/[0.1]">
                <h3 className="text-xl font-black text-white">{comparison.title}</h3>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-white/65">{comparison.summary}</p>
                <span className="mt-4 inline-flex text-sm font-black text-emerald-200">Compare →</span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  )
}
