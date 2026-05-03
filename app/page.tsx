import type { Metadata } from 'next'
import Link from 'next/link'
import stacksData from '@/public/data/stacks.json'
import { generatedComparisons } from '@/data/generated-comparisons'

const stacks = stacksData as any[]

export const metadata: Metadata = {
  title: 'Best Supplements by Goal (Sleep, Focus, Fat Loss) | The Hippie Scientist',
  description: 'Find the best supplements for sleep, focus, fat loss, and performance. Evidence-based stacks and product recommendations.',
}

const formatCompare = (slug: string) =>
  slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()).replace(' Vs ', ' vs ')

export default function HomePage() {
  const featuredStacks = stacks.slice(0, 5)
  const featuredComparisons = generatedComparisons.slice(0, 4)

  return (
    <main className="space-y-14 sm:space-y-16">
      <section className="hero-panel">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-300/25 blur-3xl" />
        <div className="relative grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.26em] text-emerald-800/70">Evidence-first supplement decisions</p>
            <h1 className="mt-4 max-w-3xl text-5xl font-black leading-[0.94] tracking-tight text-slate-950 sm:text-7xl">
              Find the right supplements for your goal
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-700 sm:text-xl">
              Pick a goal, compare the practical options, then check safety and product formats with less guesswork.
            </p>
            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              <Link href="/goals/sleep" className="premium-button text-center">Sleep better →</Link>
              <Link href="/goals/focus" className="rounded-2xl border border-slate-900/10 bg-white px-5 py-3 text-center text-sm font-black text-slate-950 shadow-sm transition hover:bg-emerald-50 active:scale-[0.99]">Improve focus →</Link>
              <Link href="/goals/fat-loss" className="premium-button-warm text-center">Lose fat →</Link>
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-emerald-900/10 bg-white/70 p-5 shadow-sm backdrop-blur">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">How it works</p>
            <div className="mt-4 space-y-3">
              {['Start with the outcome you care about.', 'Review evidence, timing, and safety context.', 'Use comparisons before choosing a path.'].map((item, index) => (
                <div key={item} className="flex gap-3 rounded-2xl bg-emerald-50/80 p-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-sm font-black text-white">{index + 1}</span>
                  <p className="text-sm font-semibold leading-6 text-slate-700">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {[
          ['Sleep', 'Sleep timing, relaxation, and bedtime routines.', '/goals/sleep'],
          ['Focus', 'Alertness, calmer attention, and cognitive support.', '/goals/focus'],
          ['Stress', 'Calming compounds and adaptogen-style options.', '/goals/stress'],
        ].map(([label, copy, href]) => (
          <Link key={href} href={href} className="group rounded-[1.5rem] border border-emerald-900/10 bg-white/75 p-5 shadow-sm transition hover:-translate-y-0.5 hover:bg-white">
            <h2 className="text-2xl font-black text-slate-950">{label}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{copy}</p>
            <span className="mt-4 inline-flex text-sm font-black text-emerald-700 transition group-hover:translate-x-1">Open guide →</span>
          </Link>
        ))}
      </section>

      <section className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
        <div className="lg:sticky lg:top-24">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-800/60">Start here</p>
          <h2 className="mt-2 text-4xl font-black text-slate-950">Popular stacks</h2>
          <p className="mt-3 max-w-sm text-base leading-7 text-slate-600">Use stacks when you want a simple routine instead of researching single ingredients one by one.</p>
          <Link href="/stacks" className="mt-5 inline-flex font-black text-emerald-700">Browse all stacks →</Link>
        </div>

        <div className="divide-y divide-slate-900/10 overflow-hidden rounded-[1.75rem] border border-slate-900/10 bg-white/80 shadow-sm">
          {featuredStacks.map((stack) => (
            <Link key={stack.slug} href={`/stacks/${stack.slug}`} className="group grid gap-2 p-5 transition hover:bg-emerald-50/70 sm:grid-cols-[1fr_auto] sm:items-center">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700/60">{String(stack.goal || stack.slug).replace(/[-_]/g, ' ')}</p>
                <h3 className="mt-1 text-xl font-black leading-tight text-slate-950 group-hover:text-emerald-800">{stack.title}</h3>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{stack.short_description}</p>
              </div>
              <span className="text-sm font-black text-emerald-700 transition group-hover:translate-x-1">View →</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="rounded-[2rem] bg-slate-950 p-6 text-white shadow-xl shadow-slate-900/10 sm:p-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-amber-200/70">Decision support</p>
            <h2 className="mt-2 text-4xl font-black text-white">Compare your options</h2>
          </div>
          <Link href="/compare" className="font-black text-emerald-200">Compare all →</Link>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {featuredComparisons.map((slug) => (
            <Link key={slug} href={`/compare/${slug}`} className="group rounded-2xl border border-white/10 bg-white/[0.06] p-5 transition hover:-translate-y-0.5 hover:bg-white/[0.1]">
              <h3 className="text-xl font-black leading-tight text-white group-hover:text-emerald-100">{formatCompare(slug)}</h3>
              <p className="mt-2 text-sm leading-6 text-white/65">Quickly compare practical differences before choosing a default option.</p>
              <span className="mt-4 inline-flex text-sm font-black text-emerald-200 transition group-hover:translate-x-1">Compare →</span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  )
}
