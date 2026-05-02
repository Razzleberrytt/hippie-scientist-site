import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import stacksData from '@/public/data/stacks.json'
import compoundsData from '@/public/data/compounds.json'
import { supplementComparisons } from '@/data/comparisons'
import { goalConfigs } from '@/data/goals'
import StackCard from '@/components/StackCard'
import { getCompoundSearchLinks } from '@/lib/affiliate'

const stacks = stacksData as any[]
const compounds = ((compoundsData as any[]) || []).filter(Boolean)

const compoundMap = new Map(
  compounds
    .filter((compound) => compound?.slug)
    .map((compound) => [compound.slug as string, compound])
)

const budgetFriendlySlugs = new Set([
  'caffeine',
  'creatine',
  'magnesium',
  'glycine',
  'melatonin',
  'l-theanine',
  'capsaicin',
])

const formatName = (slug: string) =>
  slug
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')

const normalizeGoal = (goal?: string) => (goal || '').replace(/_/g, '-').toLowerCase()
const toNumber = (value: unknown) => (Number.isFinite(Number(value)) ? Number(value) : 0)

const evidenceRank = (compound: any) => {
  const text = `${compound?.evidence_grade ?? ''} ${compound?.evidenceTier ?? ''} ${compound?.tier_level ?? ''}`.toLowerCase()
  if (/strong|tier\s*1|\ba\b/.test(text)) return 4
  if (/moderate|tier\s*2|\bb\b/.test(text)) return 3
  if (/limited|tier\s*3|\bc\b/.test(text)) return 2
  return 1
}

const rankingLabelsFor = (items: any[]) => {
  const enriched = items.map((item) => ({ item, compound: compoundMap.get(item.compound) }))
  const labels = new Map<string, string[]>()
  const add = (slug: string | undefined, label: string) => {
    if (!slug) return
    const current = labels.get(slug) || []
    if (!current.includes(label)) labels.set(slug, [...current, label])
  }

  const bestOverall = [...enriched].sort((a, b) =>
    toNumber(b.compound?.fact_score_v2) - toNumber(a.compound?.fact_score_v2)
  )[0]
  add(bestOverall?.item?.compound, 'Best Overall')

  const mostStudied = [...enriched].sort((a, b) => evidenceRank(b.compound) - evidenceRank(a.compound))[0]
  add(mostStudied?.item?.compound, 'Most Studied')

  const bestBudget = enriched.find((entry) => budgetFriendlySlugs.has(entry.item.compound)) || enriched[0]
  add(bestBudget?.item?.compound, 'Best Budget')

  return labels
}

const relatedStacksFor = (stack: any) => {
  const goal = normalizeGoal(stack.goal)
  const sameGoal = stacks.filter((candidate) => candidate.slug !== stack.slug && normalizeGoal(candidate.goal) === goal)
  return sameGoal.length ? sameGoal : stacks.filter((candidate) => candidate.slug !== stack.slug).slice(0, 3)
}

const relatedGoalsFor = (stack: any) => {
  const stackGoal = normalizeGoal(stack.goal)
  const compoundSlugs = new Set((stack.stack || []).map((item: any) => item.compound))

  return goalConfigs
    .filter((goal) =>
      normalizeGoal(goal.slug) === stackGoal ||
      goal.stackSlugs.includes(stack.slug) ||
      goal.compoundCandidates.some((candidate) => compoundSlugs.has(candidate))
    )
    .slice(0, 2)
}

export function generateStaticParams() {
  return stacks.map((stack) => ({ slug: stack.slug }))
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const stack = stacks.find((item) => item.slug === params.slug)
  if (!stack) return { title: 'Supplement Stack | The Hippie Scientist' }

  const title = `${stack.title} | The Hippie Scientist`
  const description = `Compare evidence-backed compounds, key facts, and safety notes for ${stack.title}.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
    },
  }
}

export default function StackPage({ params }: { params: { slug: string } }) {
  const stack = stacks.find((item) => item.slug === params.slug)
  if (!stack) return notFound()

  const labels = rankingLabelsFor(stack.stack || [])
  const stackCompounds = (stack.stack || []).map((item: any) => ({ item, compound: compoundMap.get(item.compound) }))
  const compoundSlugs = new Set(stackCompounds.map(({ item }: any) => item.compound))

  const relatedComparisons = supplementComparisons
    .filter((comparison) =>
      comparison.a.candidates.some((candidate) => compoundSlugs.has(candidate)) ||
      comparison.b.candidates.some((candidate) => compoundSlugs.has(candidate))
    )
    .slice(0, 4)

  const relatedStacks = relatedStacksFor(stack)
  const relatedGoals = relatedGoalsFor(stack)

  return (
    <div className="space-y-10">
      <section>
        <h1 className="text-4xl font-black text-white">{stack.title}</h1>
        <p className="mt-3 max-w-3xl text-white/80">{stack.short_description}</p>
      </section>

      {relatedGoals.length > 0 ? (
        <section className="rounded-3xl border border-emerald-300/20 bg-emerald-300/[0.06] p-5">
          <h2 className="text-xl font-bold text-white">Explore goals related to this stack</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {relatedGoals.map((goal) => (
              <Link key={goal.slug} href={`/goals/${goal.slug}`} className="rounded-full border border-emerald-300/30 px-3 py-1 text-sm font-semibold text-emerald-200 hover:bg-emerald-300/10">
                {goal.title}
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {relatedComparisons.length > 0 ? (
        <section>
          <h2 className="text-xl font-bold text-white">Relevant comparisons</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {relatedComparisons.map((comparison) => (
              <Link key={comparison.slug} href={`/compare/${comparison.slug}`} className="text-sm text-emerald-300 hover:text-emerald-100">
                {comparison.title}
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-white">Stack Breakdown</h2>
        <div className="grid gap-5">
          {stackCompounds.map(({ item, compound }: any, index: number) => {
            const label = compound?.displayName || compound?.name || formatName(item.compound)
            const links = getCompoundSearchLinks(label)
            const badges = labels.get(item.compound) || []

            return (
              <div key={`${item.compound}-${index}`} className="space-y-4 rounded-2xl border border-white/10 p-5">
                <div className="flex flex-wrap gap-2">
                  {badges.map((badge) => (
                    <span key={badge} className="rounded-full border border-amber-200/30 px-2 py-1 text-xs font-semibold text-amber-200">
                      {badge}
                    </span>
                  ))}
                </div>
                <StackCard item={item} />
                <div className="flex flex-wrap gap-2">
                  {links.map((link: any) => (
                    <a key={link.label} href={link.url} target="_blank" rel="noopener noreferrer" className="text-sm text-white/70 hover:text-white">
                      {link.label}
                    </a>
                  ))}
                </div>
                {compound?.slug ? (
                  <Link href={`/compounds/${compound.slug}`} className="text-sm font-semibold text-emerald-300 hover:text-emerald-100">
                    Learn more →
                  </Link>
                ) : null}
              </div>
            )
          })}
        </div>
      </section>

      <section>
        <h2 className="font-bold text-white">Related stacks</h2>
        <div className="mt-2 flex flex-wrap gap-2">
          {relatedStacks.map((relatedStack: any) => (
            <Link key={relatedStack.slug} href={`/stacks/${relatedStack.slug}`} className="text-sm text-white/70 hover:text-white">
              {relatedStack.title}
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
