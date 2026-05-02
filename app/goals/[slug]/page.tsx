import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getStacks, getCompounds } from '@/lib/runtime-data'
import { getCompoundSearchLinks } from '@/lib/affiliate'
import { supplementComparisons } from '@/data/comparisons'
import { goalConfigs } from '@/data/goals'

type Params = { params: Promise<{ slug: string }> }

type CompoundRecord = {
  slug: string
  name?: string
  displayName?: string
  summary?: string
  description?: string
  safety_notes?: string
  safetyNotes?: string
  fact_score_v2?: number | string
  factScore?: number | string
  net_score?: number | string
  evidence_grade?: string
  evidenceTier?: string | number
  tier_level?: string | number
}

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

  const relatedStacks = stacks.filter((stack) =>
    goal.stackSlugs.includes(stack.slug) || (stack.goal_slug || stack.goal) === goal.slug
  )

  const relatedComparisons = supplementComparisons.filter((comparison) =>
    goal.comparisonSlugs.includes(comparison.slug)
  )

  return (
    <main className="space-y-10">
      <section>
        <h1 className="text-4xl font-black text-white">{goal.title}</h1>
        <p className="mt-4 text-white/75">{goal.summary}</p>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-white">Related stacks</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {relatedStacks.length > 0 ? (
            relatedStacks.map((stack) => (
              <Link key={stack.slug} href={`/stacks/${stack.slug}`} className="rounded-2xl border border-white/10 p-5">
                <h3 className="font-bold text-white">{stack.title}</h3>
                <p className="mt-2 text-white/65">{stack.short_description}</p>
              </Link>
            ))
          ) : (
            <div className="text-white/60">No stacks available yet.</div>
          )}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-white">Related comparisons</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {relatedComparisons.map((comparison) => (
            <Link key={comparison.slug} href={`/compare/${comparison.slug}`} className="rounded-2xl border border-white/10 p-5">
              <h3 className="font-bold text-white">{comparison.title}</h3>
              <p className="text-white/65">{comparison.summary}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-amber-300/20 p-5">
        <h2 className="font-bold text-amber-200">Safety note</h2>
        <p className="mt-2 text-white/70">{goal.safetyNote}</p>
      </section>
    </main>
  )
}
