import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import stacksData from '@/public/data/stacks.json'
import { getCompounds } from '@/lib/runtime-data'
import { supplementComparisons } from '@/data/comparisons'
import { goalConfigs } from '@/data/goals'

const stacks = stacksData as any[]

const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, '')

const displayName = (value: string) =>
  value
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')

const evidenceRank = (compound: any) => {
  const text = `${compound?.evidence_grade ?? ''} ${compound?.evidenceTier ?? ''} ${compound?.tier_level ?? ''}`.toLowerCase()
  if (/strong|tier\s*1|\ba\b/.test(text)) return 4
  if (/moderate|tier\s*2|\bb\b/.test(text)) return 3
  if (/limited|tier\s*3|\bc\b/.test(text)) return 2
  return 1
}

const score = (compound: any) => {
  const factScore = Number(compound?.fact_score_v2 ?? compound?.factScore ?? compound?.net_score ?? 0)
  return evidenceRank(compound) * 100 + (Number.isFinite(factScore) ? factScore : 0)
}

export function generateStaticParams() {
  return goalConfigs.map((goal) => ({ slug: goal.slug }))
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const goal = goalConfigs.find((item) => item.slug === params.slug)
  if (!goal) return { title: 'Goal Guide' }

  return {
    title: `${goal.title} | The Hippie Scientist`,
    description: goal.summary,
  }
}

export default async function GoalPage({ params }: { params: { slug: string } }) {
  const goal = goalConfigs.find((item) => item.slug === params.slug)
  if (!goal) notFound()

  const compounds = await getCompounds()
  const compoundLookup = new Map<string, any>()

  for (const compound of compounds as any[]) {
    if (!compound?.slug) continue
    compoundLookup.set(compound.slug, compound)
    if (compound.name) compoundLookup.set(normalize(compound.name), compound)
    if (compound.displayName) compoundLookup.set(normalize(compound.displayName), compound)
  }

  const relatedStacks = stacks.filter((stack) =>
    goal.stackSlugs.includes(stack.slug) || normalize(stack.goal ?? '') === normalize(goal.slug)
  )

  const goalCompounds = goal.compoundCandidates
    .map((candidate) => compoundLookup.get(candidate) ?? compoundLookup.get(normalize(candidate)))
    .filter(Boolean)
    .filter((compound, index, list) => list.findIndex((item) => item.slug === compound.slug) === index)
    .sort((a, b) => score(b) - score(a))
    .slice(0, 8)

  const relatedComparisons = supplementComparisons.filter((comparison) =>
    goal.comparisonSlugs.includes(comparison.slug) ||
    goal.compoundCandidates.some((candidate) =>
      comparison.a.candidates.includes(candidate) || comparison.b.candidates.includes(candidate)
    )
  )

  return (
    <main className="space-y-10">
      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">Goal guide</p>
        <h1 className="mt-3 text-4xl font-black text-white">{goal.title}</h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-white/75">{goal.summary}</p>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-white">Related stacks</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {relatedStacks.length > 0 ? (
            relatedStacks.map((stack) => (
              <Link key={stack.slug} href={`/stacks/${stack.slug}`} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 hover:border-emerald-300/40">
                <h3 className="font-bold text-white">{stack.title}</h3>
                <p className="mt-2 text-sm text-white/65">{stack.short_description ?? 'Open this stack for dosage, timing, and compound context.'}</p>
                <span className="mt-3 inline-block text-sm font-semibold text-emerald-300">View stack →</span>
              </Link>
            ))
          ) : (
            <div className="rounded-2xl border border-white/10 p-5 text-sm text-white/65">No dedicated stack is published for this goal yet. Start with the compounds below.</div>
          )}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-white">Top compounds by tier and fact relevance</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {goalCompounds.map((compound) => (
            <Link key={compound.slug} href={`/compounds/${compound.slug}`} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 hover:border-emerald-300/40">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-bold text-white">{compound.displayName ?? compound.name ?? displayName(compound.slug)}</h3>
                <span className="rounded-full border border-white/10 px-2 py-1 text-xs text-white/60">Tier {evidenceRank(compound)}</span>
              </div>
              <p className="mt-2 line-clamp-3 text-sm text-white/65">{compound.summary ?? compound.description ?? 'Open the compound profile for mechanisms, evidence context, and safety notes.'}</p>
              <span className="mt-3 inline-block text-sm font-semibold text-emerald-300">View compound →</span>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-white">Related comparisons</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {relatedComparisons.map((comparison) => (
            <Link key={comparison.slug} href={`/compare/${comparison.slug}`} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 hover:border-emerald-300/40">
              <h3 className="font-bold text-white">{comparison.title}</h3>
              <p className="mt-2 text-sm text-white/65">{comparison.summary}</p>
              <span className="mt-3 inline-block text-sm font-semibold text-emerald-300">Compare →</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-amber-300/20 bg-amber-300/[0.06] p-5">
        <h2 className="font-bold text-amber-100">Safety note</h2>
        <p className="mt-2 text-sm leading-6 text-white/75">{goal.safetyNote}</p>
      </section>

      <section className="flex flex-wrap gap-3">
        <Link href="/stacks" className="rounded-full border border-emerald-300/40 px-4 py-2 text-sm font-semibold text-emerald-200 hover:bg-emerald-300/10">Browse all stacks</Link>
        <Link href="/compounds" className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-white/75 hover:bg-white/10">Browse compounds</Link>
      </section>
    </main>
  )
}
