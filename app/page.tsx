import type { Metadata } from 'next'
import Link from 'next/link'
import { getCompounds, getHerbs } from '@/lib/runtime-data'
import stacksData from '@/public/data/stacks.json'
import { supplementComparisons } from '@/data/comparisons'
import { goalConfigs } from '@/data/goals'
import { seoEntryPages } from './seo-entry-pages'

const stacks = stacksData as any[]

export const metadata: Metadata = {
  title: 'The Hippie Scientist',
  description: 'Evidence-aware supplement, herb, and compound guides built for practical decisions—not marketing hype.',
}

export default async function HomePage() {
  const herbs = await getHerbs()
  const compounds = await getCompounds()

  return (
    <main className="space-y-12">
      <section className="relative overflow-hidden rounded-[2rem] border border-emerald-300/20 bg-[radial-gradient(circle_at_20%_15%,rgba(16,185,129,0.22),transparent_32%),radial-gradient(circle_at_80%_0%,rgba(119,167,255,0.16),transparent_30%),linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0.025))] p-6 shadow-2xl shadow-black/30 sm:p-8 lg:p-10">
        <div className="max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-emerald-200">Evidence-aware supplement intelligence</p>
          <h1 className="mt-4 text-4xl font-black tracking-tight text-white sm:text-6xl">
            Choose herbs and supplements with less guesswork.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-white/75 sm:text-lg">
            The Hippie Scientist organizes herbs, compounds, stacks, comparisons, safety notes, and goal-based guides so you can make practical decisions without drowning in marketing claims.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/goals" className="rounded-full bg-emerald-300 px-5 py-3 text-sm font-black text-black shadow-lg shadow-emerald-950/30 hover:bg-emerald-200">Start with a Goal</Link>
            <Link href="/stacks" className="rounded-full border border-emerald-300/45 px-5 py-3 text-sm font-bold text-emerald-100 hover:bg-emerald-300/10">Browse Stacks</Link>
            <Link href="/compounds" className="rounded-full border border-white/15 px-5 py-3 text-sm font-bold text-white/80 hover:bg-white/10">Search Compounds</Link>
          </div>
        </div>

        <div className="mt-8 grid gap-3 text-sm sm:grid-cols-3">
          <Link href="/herbs" className="rounded-2xl border border-white/10 bg-black/20 p-4 hover:border-emerald-300/40">
            <span className="block text-2xl font-black text-white">{herbs.length}</span>
            <span className="text-white/60">herb profiles</span>
          </Link>
          <Link href="/compounds" className="rounded-2xl border border-white/10 bg-black/20 p-4 hover:border-emerald-300/40">
            <span className="block text-2xl font-black text-white">{compounds.length}</span>
            <span className="text-white/60">compound records</span>
          </Link>
          <Link href="/stacks" className="rounded-2xl border border-white/10 bg-black/20 p-4 hover:border-emerald-300/40">
            <span className="block text-2xl font-black text-white">{stacks.length}</span>
            <span className="text-white/60">practical stacks</span>
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
          <h2 className="font-bold text-white">Human-first evidence</h2>
          <p className="mt-2 text-sm leading-6 text-white/65">Designed around practical summaries, safety context, and evidence-aware filtering instead of vendor copy.</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
          <h2 className="font-bold text-white">Goal-based decisions</h2>
          <p className="mt-2 text-sm leading-6 text-white/65">Start with sleep, stress, focus, blood pressure, gut health, joint support, fat loss, or testosterone support.</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
          <h2 className="font-bold text-white">Safety before hype</h2>
          <p className="mt-2 text-sm leading-6 text-white/65">Every page is educational and should be checked against medications, conditions, pregnancy, surgery, and clinician guidance.</p>
        </div>
      </section>

      <section>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Start with a guide</h2>
            <p className="mt-1 text-sm text-white/55">High-intent entry pages for common supplement questions.</p>
          </div>
          <Link href="/guides/best-natural-sleep-aids-that-work" className="text-sm font-bold text-emerald-300 hover:text-emerald-200">Featured guide →</Link>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {seoEntryPages.slice(0, 8).map((page) => (
            <Link key={page.route} href={`/${page.route}`} className="rounded-2xl border border-emerald-300/20 bg-emerald-300/[0.05] p-5 hover:border-emerald-300/50">
              <h3 className="font-bold text-white">{page.h1}</h3>
              <p className="mt-2 line-clamp-3 text-sm text-white/65">{page.intro}</p>
              <span className="mt-3 inline-block text-sm font-semibold text-emerald-300">Read guide →</span>
            </Link>
          ))}
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
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Practical stacks</h2>
            <p className="mt-1 text-sm text-white/55">Compound combinations organized by goal, role, dosage, and timing.</p>
          </div>
          <Link href="/stacks" className="text-sm font-bold text-emerald-300 hover:text-emerald-200">View all stacks →</Link>
        </div>
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
