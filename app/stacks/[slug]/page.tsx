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

const formatName = (slug: string) =>
  slug
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')

const normalizeGoal = (goal?: string) => (goal || '').replace(/_/g, '-').toLowerCase()

export function generateStaticParams() {
  return stacks.map((stack) => ({ slug: stack.slug }))
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const stack = stacks.find((item) => item.slug === params.slug)
  if (!stack) return { title: 'Stack Guide | Benefits, Facts, Safety' }

  const name = stack.title
  const title = `${name} Stack Guide | Benefits, Facts, Safety`
  const description = `Explore compounds, key facts, safety notes, and comparisons for the ${name.toLowerCase()} stack.`

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

  const stackItems = Array.isArray(stack.stack) ? stack.stack : []
  const compoundSlugs = new Set(stackItems.map((item: any) => item.compound).filter(Boolean))

  const relatedComparisons = supplementComparisons
    .filter((comparison) =>
      comparison.a.candidates.some((candidate) => compoundSlugs.has(candidate)) ||
      comparison.b.candidates.some((candidate) => compoundSlugs.has(candidate))
    )
    .slice(0, 4)

  const relatedGoals = goalConfigs.filter((goal) =>
    normalizeGoal(stack.goal) === goal.slug ||
    goal.stackSlugs.includes(stack.slug) ||
    goal.compoundCandidates.some((candidate) => compoundSlugs.has(candidate))
  )

  const relatedStacks = stacks
    .filter((candidate) => candidate.slug !== stack.slug && normalizeGoal(candidate.goal) === normalizeGoal(stack.goal))
    .slice(0, 3)

  return (
    <div className="space-y-10">
      <section>
        <h1 className="text-4xl font-black text-white">{stack.title}</h1>
        <p className="mt-3 max-w-3xl text-white/80">{stack.short_description}</p>
      </section>

      {relatedGoals.length > 0 && (
        <section className="rounded-2xl border border-emerald-300/20 bg-emerald-300/[0.06] p-5">
          <h2 className="text-xl font-bold text-white">Explore goals related to this stack</h2>
          <div className="mt-3 flex flex-wrap gap-3">
            {relatedGoals.map((goal) => (
              <Link key={goal.slug} href={`/goals/${goal.slug}`} className="text-sm font-semibold text-emerald-300">
                {goal.title}
              </Link>
            ))}
          </div>
        </section>
      )}

      {relatedComparisons.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-white">Relevant comparisons</h2>
          <div className="mt-3 flex flex-wrap gap-3">
            {relatedComparisons.map((comparison) => (
              <Link key={comparison.slug} href={`/compare/${comparison.slug}`} className="text-sm font-semibold text-emerald-300">
                {comparison.title}
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-white">Stack Breakdown</h2>
        <div className="grid gap-5">
          {stackItems.map((item: any, index: number) => {
            const compound = compoundMap.get(item.compound)
            const label = compound?.displayName || compound?.name || formatName(item.compound)
            const links = getCompoundSearchLinks(label)

            return (
              <div key={`${item.compound}-${index}`} className="space-y-4 rounded-2xl border border-white/10 p-5">
                <StackCard item={item} />

                <div className="flex flex-wrap gap-2">
                  {links.map((link) => (
                    <a
                      key={link.label}
                      href={link.url}
                      className="rounded-full border border-white/10 px-3 py-1.5 text-xs font-semibold text-white/70 hover:border-emerald-300/40 hover:text-emerald-300"
                      rel="nofollow sponsored noopener noreferrer"
                      target="_blank"
                    >
                      {link.label}
                    </a>
                  ))}
                </div>

                {compound?.slug && (
                  <Link href={`/compounds/${compound.slug}`} className="inline-block text-sm font-semibold text-emerald-300">
                    Learn more →
                  </Link>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {relatedStacks.length > 0 && (
        <section>
          <h2 className="font-bold text-white">Related stacks</h2>
          <div className="mt-3 flex flex-wrap gap-3">
            {relatedStacks.map((relatedStack: any) => (
              <Link key={relatedStack.slug} href={`/stacks/${relatedStack.slug}`} className="text-sm font-semibold text-emerald-300">
                {relatedStack.title}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
