import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import compoundsData from '@/public/data/compounds.json'
import stacksData from '@/public/data/stacks.json'
import { supplementComparisons } from '@/data/comparisons'
import { goalConfigs } from '@/data/goals'

const compounds = Array.isArray(compoundsData) ? compoundsData : []
const stacks = Array.isArray(stacksData) ? stacksData : []

const findCompound = (candidates: string[]) => {
  for (const candidate of candidates) {
    const found = compounds.find((compound: any) => compound?.slug === candidate)
    if (found) return found
  }
  return null
}

export function generateStaticParams() {
  return supplementComparisons.map((comparison) => ({ slug: comparison.slug }))
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const config = supplementComparisons.find((comparison) => comparison.slug === params.slug)
  if (!config) return {}

  return {
    title: `${config.title} — Which is better?`,
    description: config.summary,
  }
}

export default function Page({ params }: { params: { slug: string } }) {
  const config = supplementComparisons.find((comparison) => comparison.slug === params.slug)
  if (!config) return notFound()

  const a = findCompound(config.a.candidates)
  const b = findCompound(config.b.candidates)

  if (!a || !b) return notFound()

  const comparisonCandidates = new Set([...config.a.candidates, ...config.b.candidates])

  const relatedStacks = stacks.filter((stack: any) =>
    stack.stack?.some((item: any) => comparisonCandidates.has(item.compound))
  )

  const relatedGoals = goalConfigs.filter((goal) =>
    goal.comparisonSlugs.includes(config.slug) ||
    goal.compoundCandidates.some((candidate) => comparisonCandidates.has(candidate))
  )

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-black text-white">{config.title}</h1>
      <p className="text-white/80">{config.summary}</p>

      <section className="overflow-hidden rounded-2xl border border-white/10">
        <table className="w-full text-left text-sm">
          <thead className="text-white/60">
            <tr>
              <th className="p-4">Compound</th>
              <th className="p-4">Primary fact</th>
              <th className="p-4">Tier</th>
            </tr>
          </thead>
          <tbody>
            {[a, b].map((compound: any) => (
              <tr key={compound.slug} className="border-t border-white/10 text-white/80">
                <td className="p-4 font-bold">{compound.displayName || compound.name}</td>
                <td className="p-4">{compound.scispace_primary_fact_v2 || 'See compound page'}</td>
                <td className="p-4">{compound.tier_level || 'Unranked'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        {[a, b].map((compound: any) => (
          <div key={compound.slug} className="rounded-2xl border border-white/10 p-5">
            <h2 className="font-bold text-white">{compound.displayName || compound.name}</h2>
            <p className="mt-2 text-sm text-white/70">
              {compound.safety_notes || 'Review compound page for safety context.'}
            </p>
            <Link href={`/compounds/${compound.slug}`} className="mt-3 inline-block text-sm text-emerald-300">
              View details →
            </Link>
          </div>
        ))}
      </section>

      {relatedGoals.length > 0 && (
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <h2 className="text-xl font-bold text-white">Related goals</h2>
          <div className="mt-3 flex flex-wrap gap-3">
            {relatedGoals.map((goal) => (
              <Link key={goal.slug} href={`/goals/${goal.slug}`} className="text-sm font-semibold text-emerald-300">
                {goal.title}
              </Link>
            ))}
          </div>
        </section>
      )}

      {relatedStacks.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-white">Related stacks</h2>
          <div className="mt-2 flex flex-wrap gap-3">
            {relatedStacks.map((stack: any) => (
              <Link key={stack.slug} href={`/stacks/${stack.slug}`} className="text-sm text-emerald-300">
                {stack.title}
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="flex gap-4">
        <Link href={`/compounds/${a.slug}`} className="rounded-xl bg-emerald-300 px-4 py-2 font-bold text-black">
          View {a.slug}
        </Link>
        <Link href={`/compounds/${b.slug}`} className="rounded-xl bg-emerald-300 px-4 py-2 font-bold text-black">
          View {b.slug}
        </Link>
      </section>
    </div>
  )
}
