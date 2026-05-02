import type { Metadata } from 'next'
import Link from 'next/link'
import { getCompounds, getHerbs } from '@/lib/runtime-data'
import stacksData from '@/public/data/stacks.json'
import { supplementComparisons } from '@/data/comparisons'
import { goalConfigs } from '@/data/goals'

const stacks = stacksData as any[]

export const metadata: Metadata = {
  title: 'The Hippie Scientist',
  description: 'Explore evidence-aware herbs, compounds, stacks, and comparisons.',
}

export default async function HomePage() {
  const herbs = await getHerbs()
  const compounds = await getCompounds()

  return (
    <main className="space-y-10">
      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
        <h1 className="text-4xl font-black text-white">The Hippie Scientist</h1>
        <p className="mt-3 max-w-2xl text-white/70">
          Evidence-aware herbs, compounds, and supplement stacks—built for real decisions, not marketing fluff.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/stacks" className="rounded-full border border-emerald-300/40 px-4 py-2 text-sm font-semibold text-emerald-200 hover:bg-emerald-300/10">Browse Stacks</Link>
          <Link href="/compounds" className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-white/75 hover:bg-white/10">Browse Compounds</Link>
        </div>
        <div className="mt-6 flex gap-6 text-sm text-white/60">
          <span>{herbs.length} herbs</span>
          <span>{compounds.length} compounds</span>
          <span>{stacks.length} stacks</span>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-white">Explore by goal</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {goalConfigs.map((goal) => (
            <Link key={goal.slug} href={`/goals/${goal.slug}`} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 hover:border-emerald-300/40">
              <h3 className="font-bold text-white">{goal.title}</h3>
              <p className="mt-2 text-sm text-white/65">{goal.summary}</p>
              <span className="mt-3 inline-block text-sm font-semibold text-emerald-300">Explore →</span>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-white">Stacks</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {stacks.slice(0, 6).map((stack) => (
            <Link key={stack.slug} href={`/stacks/${stack.slug}`} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 hover:border-emerald-300/40">
              <h3 className="font-bold text-white">{stack.title}</h3>
              <p className="mt-2 text-sm text-white/65">{stack.short_description}</p>
              <span className="mt-3 inline-block text-sm font-semibold text-emerald-300">View stack →</span>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-white">Popular comparisons</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {supplementComparisons.slice(0, 6).map((comparison) => (
            <Link key={comparison.slug} href={`/compare/${comparison.slug}`} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 hover:border-emerald-300/40">
              <h3 className="font-bold text-white">{comparison.title}</h3>
              <p className="mt-2 text-sm text-white/65">{comparison.summary}</p>
              <span className="mt-3 inline-block text-sm font-semibold text-emerald-300">Compare →</span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  )
}
