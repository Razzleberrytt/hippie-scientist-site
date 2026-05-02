import type { Metadata } from 'next'
import Link from 'next/link'
import stacksData from '@/public/data/stacks.json'
import { supplementComparisons } from '@/data/comparisons'
import { goalConfigs } from '@/data/goals'

const stacks = stacksData as any[]

export const metadata: Metadata = {
  title: 'The Hippie Scientist',
  description: 'Evidence-aware supplement decisions made simple.',
}

export default function HomePage() {
  return (
    <main className="space-y-12">
      <section className="relative overflow-hidden rounded-[2rem] border border-emerald-300/20 p-6 shadow-2xl shadow-black/30 sm:p-8 lg:p-10">
        <div className="max-w-3xl">
          <h1 className="text-4xl font-black tracking-tight text-white sm:text-6xl">
            Find the right supplements for your goal
          </h1>
          <p className="mt-5 text-base leading-8 text-white/75 sm:text-lg">
            Evidence-based compounds, real stacks, and safety-first decisions.
          </p>

          <div className="mt-7 flex flex-wrap gap-4">
            <Link href="/goals/focus" className="rounded-2xl bg-emerald-300 px-6 py-4 text-base font-black text-black">
              Improve Focus
            </Link>
            <Link href="/goals/sleep" className="rounded-2xl bg-white px-6 py-4 text-base font-black text-black">
              Sleep Better
            </Link>
            <Link href="/goals/fat-loss" className="rounded-2xl bg-amber-300 px-6 py-4 text-base font-black text-black">
              Lose Fat
            </Link>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 p-6">
        <h2 className="text-xl font-bold text-white">Start Here</h2>
        <p className="mt-2 text-white/70">
          New to supplements? Start with goal-based stacks instead of guessing compounds.
        </p>
        <Link href="/goals" className="mt-4 inline-block text-emerald-300 font-bold">
          Explore goals →
        </Link>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-white">Explore by goal</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {goalConfigs.map((goal) => (
            <Link key={goal.slug} href={`/goals/${goal.slug}`} className="rounded-2xl border border-white/10 p-5 hover:border-emerald-300/40">
              <h3 className="font-bold text-white">{goal.title}</h3>
              <p className="mt-2 text-sm text-white/65">{goal.summary}</p>
              <span className="mt-3 inline-block text-sm font-semibold text-emerald-300">Start here →</span>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-white">Practical stacks</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {stacks.slice(0, 6).map((stack) => (
            <Link key={stack.slug} href={`/stacks/${stack.slug}`} className="rounded-2xl border border-white/10 p-5 hover:border-emerald-300/40">
              <h3 className="font-bold text-white">{stack.title}</h3>
              <p className="mt-2 text-sm text-white/65">{stack.short_description}</p>
              <span className="mt-3 inline-block text-sm font-semibold text-emerald-300">See benefits, dosage & risks →</span>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-white">Popular comparisons</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {supplementComparisons.slice(0, 6).map((comparison) => (
            <Link key={comparison.slug} href={`/compare/${comparison.slug}`} className="rounded-2xl border border-white/10 p-5 hover:border-emerald-300/40">
              <h3 className="font-bold text-white">{comparison.title}</h3>
              <p className="mt-2 text-sm text-white/65">{comparison.summary}</p>
              <span className="mt-3 inline-block text-sm font-semibold text-emerald-300">Compare top brands →</span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  )
}
