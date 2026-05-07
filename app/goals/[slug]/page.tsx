import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getStacks, getCompounds } from '@/lib/runtime-data'
import { supplementComparisons } from '@/data/comparisons'
import { goalConfigs } from '@/data/goals'
import { cleanSummary, editorialUseCaseLabel, formatDisplayLabel, isClean } from '@/lib/display-utils'

type Params = { params: Promise<{ slug: string }> }

type CompoundRecord = {
  slug: string
  name?: string
  displayName?: string
  summary?: string
  description?: string
  mechanism?: string
  effects?: string | string[]
  best_for?: string
  bestFor?: string
  avoid_if?: string
  avoidIf?: string
  safety_notes?: string
  safetyNotes?: string
  safety_summary?: string
  safetySummary?: string
  time_to_effect?: string
  timeToEffect?: string
  fact_score_v2?: number | string
  factScore?: number | string
  net_score?: number | string
  evidence_score?: number | string
  evidenceScore?: number | string
  evidence_grade?: string
  evidenceGrade?: string
  evidenceTier?: string | number
  tier_level?: string | number
  profile_status?: string
  summary_quality?: string
}

const INTENT_TERMS: Record<string, string[]> = {
  sleep: ['sleep', 'insomnia', 'night', 'melatonin', 'glycine', 'theanine', 'magnesium', 'relax', 'sedative', 'calm'],
  stress: ['stress', 'anxiety', 'calm', 'cortisol', 'adaptogen', 'ashwagandha', 'rhodiola', 'theanine', 'relax'],
  focus: ['focus', 'cognition', 'brain fog', 'mental clarity', 'nootropic', 'energy', 'caffeine', 'choline', 'attention'],
  'fat-loss': ['fat loss', 'weight', 'appetite', 'metabolism', 'thermogenic', 'berberine', 'fiber', 'caffeine'],
  'gut-health': ['gut', 'digestion', 'bloating', 'fiber', 'probiotic', 'prebiotic', 'psyllium', 'inulin'],
  'blood-pressure': ['blood pressure', 'cardiovascular', 'heart', 'circulation', 'magnesium', 'fiber', 'citrulline'],
  'joint-support': ['joint', 'mobility', 'inflammation', 'collagen', 'glucosamine', 'chondroitin', 'curcumin'],
  'testosterone-support': ['testosterone', 'libido', 'zinc', 'magnesium', 'ashwagandha', 'hormone', 'men'],
}

const clean = (value: unknown): string => {
  if (value === null || value === undefined) return ''
  if (Array.isArray(value)) return value.map(clean).filter(Boolean).join(', ')
  if (typeof value === 'object') return ''
  return String(value).replace(/\s+/g, ' ').trim()
}

const normalize = (value?: string) => (value ?? '').toLowerCase().replace(/[^a-z0-9]/g, '')
const formatName = (slug: string) => slug.split('-').filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ')
const getCompoundLabel = (compound: CompoundRecord) => clean(compound.displayName) || clean(compound.name) || formatName(compound.slug)

const textBlob = (compound: CompoundRecord) => [
  compound.slug,
  compound.name,
  compound.displayName,
  compound.summary,
  compound.description,
  compound.mechanism,
  compound.effects,
  compound.best_for,
  compound.bestFor,
  compound.evidence_grade,
  compound.evidenceGrade,
].map(clean).join(' ').toLowerCase()

const getScore = (compound: CompoundRecord) => {
  const value = Number(compound.evidence_score ?? compound.evidenceScore ?? compound.fact_score_v2 ?? compound.factScore ?? compound.net_score ?? 0)
  return Number.isFinite(value) ? value : 0
}

const getEvidenceRank = (compound: CompoundRecord) => {
  const raw = clean(compound.evidence_grade ?? compound.evidenceGrade ?? compound.evidenceTier ?? compound.tier_level).toLowerCase()
  const score = getScore(compound)
  if (score > 0) return score
  if (/strong|high|a\b/.test(raw)) return 8
  if (/moderate|medium|b\b/.test(raw)) return 6
  if (/limited|low|preliminary|c\b/.test(raw)) return 3
  return 1
}

const getSafetyRank = (compound: CompoundRecord) => {
  const text = clean(compound.avoid_if ?? compound.avoidIf ?? compound.safety_summary ?? compound.safetySummary ?? compound.safety_notes ?? compound.safetyNotes).toLowerCase()
  if (!text) return 5
  if (/avoid|contraindicat|do not|high risk/.test(text)) return 2
  if (/caution|interact|review/.test(text)) return 5
  return 8
}

const getSpeedRank = (compound: CompoundRecord) => {
  const text = clean(compound.time_to_effect ?? compound.timeToEffect).toLowerCase()
  if (!text) return 0
  if (/minute|acute|same day|1\s*h|2\s*h|hour/.test(text)) return 8
  if (/day|week/.test(text)) return 5
  if (/month/.test(text)) return 2
  return 1
}

const intentScore = (compound: CompoundRecord, goalSlug: string, candidates: string[]) => {
  const blob = textBlob(compound)
  const exact = candidates.some(candidate => normalize(compound.slug) === normalize(candidate) || normalize(compound.name) === normalize(candidate) || normalize(compound.displayName) === normalize(candidate))
  const terms = INTENT_TERMS[goalSlug] ?? []
  const termMatches = terms.reduce((total, term) => total + (blob.includes(term.toLowerCase()) ? 1 : 0), 0)
  return (exact ? 80 : 0) + termMatches * 10
}

const decisionScore = (compound: CompoundRecord, goalSlug = '', candidates: string[] = []) => {
  let score = intentScore(compound, goalSlug, candidates)
  score += getEvidenceRank(compound) * 3
  score += getSafetyRank(compound) * 2
  score += getSpeedRank(compound)
  if (clean(compound.profile_status) === 'complete') score += 12
  if (clean(compound.summary_quality) === 'strong') score += 8
  if (clean(compound.best_for ?? compound.bestFor)) score += 4
  return score
}

const matchesCompound = (compound: CompoundRecord, candidates: string[], goalSlug: string) => {
  const aliases = new Set([compound.slug, normalize(compound.slug), compound.name, compound.displayName, normalize(compound.name), normalize(compound.displayName)].filter(Boolean))
  const exact = candidates.some((candidate) => aliases.has(candidate) || aliases.has(normalize(candidate)))
  return exact || intentScore(compound, goalSlug, candidates) >= 10
}

const getTopCompounds = (compounds: CompoundRecord[], candidates: string[], goalSlug: string) => compounds
  .filter((compound) => matchesCompound(compound, candidates, goalSlug))
  .sort((a, b) => decisionScore(b, goalSlug, candidates) - decisionScore(a, goalSlug, candidates) || getCompoundLabel(a).localeCompare(getCompoundLabel(b)))

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

const getBestFor = (compound: CompoundRecord) => {
  const value = clean(compound.best_for ?? compound.bestFor)
  return isClean(value) ? editorialUseCaseLabel(value) : ''
}
const getAvoidIf = (compound: CompoundRecord) => {
  const value = clean(compound.avoid_if ?? compound.avoidIf)
  return isClean(value) ? formatDisplayLabel(value) : ''
}
const getSafetySummary = (compound: CompoundRecord) => {
  const value = clean(compound.safety_summary ?? compound.safetySummary ?? compound.safety_notes ?? compound.safetyNotes)
  return isClean(value) ? value : ''
}

const getBestPickLabel = (compound: CompoundRecord, compounds: CompoundRecord[], index: number, goalSlug: string, candidates: string[]) => {
  if (index === 0) return 'Best Match'
  const strongestEvidence = compounds.reduce((best, item) => getEvidenceRank(item) > getEvidenceRank(best) ? item : best, compounds[0])
  if (compound.slug === strongestEvidence.slug) return 'Strongest Evidence'
  const safest = compounds.reduce((best, item) => getSafetyRank(item) > getSafetyRank(best) ? item : best, compounds[0])
  if (compound.slug === safest.slug) return 'Safety-forward'
  const strongestIntent = compounds.reduce((best, item) => intentScore(item, goalSlug, candidates) > intentScore(best, goalSlug, candidates) ? item : best, compounds[0])
  if (compound.slug === strongestIntent.slug) return 'Closest goal fit'
  const fastest = compounds.reduce((best, item) => getSpeedRank(item) > getSpeedRank(best) ? item : best, compounds[0])
  if (getSpeedRank(compound) > 0 && compound.slug === fastest.slug) return 'Fastest Acting'
  return ''
}

export function generateStaticParams() {
  return goalConfigs.map((goal) => ({ slug: goal.slug }))
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const goal = goalConfigs.find((item) => item.slug === slug)
  if (!goal) return { title: 'Goal Guide | The Hippie Scientist' }
  return { title: `${goal.title} Decision Guide | The Hippie Scientist`, description: goal.summary }
}

export default async function GoalPage({ params }: Params) {
  const { slug } = await params
  const goal = goalConfigs.find((item) => item.slug === slug)
  if (!goal) return notFound()

  const compounds = (await getCompounds()) as CompoundRecord[]
  const stacks = await getStacks()
  const topCompounds = getTopCompounds(compounds, goal.compoundCandidates, goal.slug)
  const relatedStacks = stacks.filter((stack) => goal.stackSlugs.includes(stack.slug) || (stack.goal_slug || stack.goal) === goal.slug)
  const relatedComparisons = supplementComparisons.filter((comparison) => goal.comparisonSlugs.includes(comparison.slug))

  return (
    <main className="space-y-8 sm:space-y-10">
      <section className="hero-panel">
        <div className="relative max-w-4xl">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-emerald-800/70">Goal guide</p>
          <h1 className="mt-3 text-5xl font-black leading-[0.95] text-slate-950 sm:text-7xl">{goal.title}</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-700">{goal.summary}</p>
        </div>
      </section>

      {topCompounds.length > 0 ? (
        <section className="soft-section">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700/60">Intent-ranked picks</p>
              <h2 className="mt-1 text-3xl font-black text-slate-950">Most relevant options for this goal</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Ranked by goal fit, evidence, safety, speed, and completeness. Missing data is never guessed.</p>
            </div>
            <Link href="/compounds" className="text-sm font-black text-emerald-700">All compounds →</Link>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {topCompounds.slice(0, 6).map((compound, index) => {
              const label = getCompoundLabel(compound)
              const bestFor = getBestFor(compound)
              const avoidIf = getAvoidIf(compound)
              const safetySummary = getSafetySummary(compound)
              const summary = cleanSummary(compound.summary || compound.description, 'compound')
              const pickLabel = getBestPickLabel(compound, topCompounds, index, goal.slug, goal.compoundCandidates)

              return (
                <Link key={compound.slug} href={`/compounds/${compound.slug}`} className={index === 0 ? "premium-card group block border-emerald-300 bg-emerald-50/70 p-5 transition hover:-translate-y-0.5 hover:bg-white" : "premium-card group block p-5 transition hover:-translate-y-0.5 hover:bg-white"}>
                  <div className="flex flex-wrap items-center gap-2">
                    {pickLabel ? <span className="rounded-full bg-emerald-600 px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-white">{pickLabel}</span> : null}
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-emerald-800 ring-1 ring-emerald-900/10">{getEvidenceLabel(compound)}</span>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-slate-600">Fit {intentScore(compound, goal.slug, goal.compoundCandidates)}</span>
                  </div>

                  <h3 className="mt-3 text-xl font-black text-slate-950 group-hover:text-emerald-800">{label}</h3>
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{bestFor || summary || 'Useful candidate for this goal.'}</p>

                  {(avoidIf || safetySummary) ? (
                    <div className="mt-4 rounded-2xl bg-amber-50/90 p-3 ring-1 ring-amber-900/10">
                      <p className="text-xs font-black uppercase tracking-[0.16em] text-amber-800">Safety check</p>
                      <p className="mt-1 line-clamp-2 text-sm font-semibold leading-6 text-slate-700">{avoidIf ? `Use caution with ${avoidIf}.` : safetySummary}</p>
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
            {['Start with Best Match if you want the default intent-aware pick.', 'Choose Best for Safety when caution matters most.', 'Use comparisons if you are unsure between two choices.'].map((item) => (
              <li key={item} className="flex gap-3 text-sm font-semibold leading-6 text-slate-700"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" /><span>{item}</span></li>
            ))}
          </ul>
        </article>
        <article className="soft-section bg-amber-50/80"><h2 className="text-2xl font-black text-slate-950">Safety note</h2><p className="mt-3 text-sm leading-6 text-slate-700">{goal.safetyNote}</p></article>
      </section>

      {relatedStacks.length > 0 || relatedComparisons.length > 0 ? (
        <section className="surface-depth rounded-[2rem] p-5 shadow-card sm:p-6">
          <h2 className="text-3xl font-black text-ink">Next decision step</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {relatedStacks.slice(0, 2).map((stack) => <Link key={stack.slug} href={`/stacks/${stack.slug}`} className="rounded-2xl border border-brand-900/10 bg-white/75 p-5 transition hover:bg-white"><h3 className="text-xl font-black text-ink">{stack.title}</h3><span className="mt-4 inline-flex text-sm font-black text-emerald-700">View routine →</span></Link>)}
            {relatedComparisons.slice(0, 2).map((comparison) => <Link key={comparison.slug} href={`/compare/${comparison.slug}`} className="rounded-2xl border border-brand-900/10 bg-white/75 p-5 transition hover:bg-white"><h3 className="text-xl font-black text-ink">{comparison.title}</h3><span className="mt-4 inline-flex text-sm font-black text-emerald-700">Compare →</span></Link>)}
          </div>
        </section>
      ) : null}
    </main>
  )
}
