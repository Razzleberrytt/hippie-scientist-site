import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import stacksData from '@/public/data/stacks.json'
import { getCompounds } from '@/lib/runtime-data'
import { supplementComparisons } from '@/data/comparisons'
import { goalConfigs } from '@/data/goals'

const stacks = stacksData as any[]

const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, '')

export function generateStaticParams() {
  return goalConfigs.map((goal) => ({ slug: goal.slug }))
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const goal = goalConfigs.find((item) => item.slug === params.slug)
  if (!goal) return { title: 'Goal Supplements and Stacks | The Hippie Scientist' }

  const goalName = goal.title
  const title = `${goalName} Supplements and Stacks | The Hippie Scientist`
  const description = `Evidence-based supplements, stacks, and comparisons for ${goalName.toLowerCase()}. Explore key facts, safety notes, and practical options.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
    },
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

  const relatedComparisons = supplementComparisons.filter((comparison) =>
    goal.comparisonSlugs.includes(comparison.slug)
  )

  return (
    <main className="space-y-10">
      <section>
        <h1 className="text-4xl font-black text-white">{goal.title}</h1>
        <p className="text-white/80">{goal.summary}</p>
      </section>
    </main>
  )
}
