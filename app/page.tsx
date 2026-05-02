import type { Metadata } from 'next'
import Link from 'next/link'
import stacksData from '@/public/data/stacks.json'
import { generatedComparisons } from '@/data/generated-comparisons'
import { goalConfigs } from '@/data/goals'

const stacks = stacksData as any[]

export const metadata: Metadata = {
  title: 'Best Supplements by Goal (Sleep, Focus, Fat Loss) | The Hippie Scientist',
  description: 'Find the best supplements for sleep, focus, fat loss, and performance. Evidence-based stacks and product recommendations.',
}

export default function HomePage() {
  return (
    <main className="space-y-12">

      <section className="rounded-[2rem] border border-emerald-300/20 p-6">
        <h1 className="text-4xl font-black text-white">
          Find the best supplements for your goal
        </h1>
        <p className="mt-4 text-white/70">
          Evidence-based stacks, real results, no guesswork.
        </p>

        <div className="mt-6 flex gap-3">
          <Link href="/goals/sleep" className="bg-emerald-300 px-4 py-3 font-bold text-black">
            Best supplements for sleep →
          </Link>
          <Link href="/goals/focus" className="bg-white px-4 py-3 font-bold text-black">
            Improve focus →
          </Link>
          <Link href="/goals/fat-loss" className="bg-amber-300 px-4 py-3 font-bold text-black">
            Lose fat →
          </Link>
        </div>

        <p className="mt-4 text-sm text-white/60">
          Evidence-based supplement recommendations. No hype.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-white">Most popular stacks</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {stacks.slice(0, 6).map((stack) => (
            <Link key={stack.slug} href={`/stacks/${stack.slug}`} className="rounded-2xl border border-white/10 p-5">
              <h3 className="font-bold text-white">{stack.title}</h3>
              <p className="mt-2 text-white/65">{stack.short_description}</p>
              <span className="mt-3 inline-block text-emerald-300 font-bold">
                View stack →
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-white">Popular comparisons</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {generatedComparisons.slice(0, 6).map((slug) => (
            <Link key={slug} href={`/compare/${slug}`} className="rounded-2xl border border-white/10 p-5">
              <h3 className="font-bold text-white">
                {slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()).replace(' Vs ', ' vs ')}
              </h3>
              <span className="mt-3 inline-block text-emerald-300 font-bold">
                Compare →
              </span>
            </Link>
          ))}
        </div>
      </section>

    </main>
  )
}
