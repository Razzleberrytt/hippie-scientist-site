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
  return (
    <main className="space-y-10 sm:space-y-12">
      <section className="relative overflow-hidden rounded-[2rem] border border-emerald-300/20 bg-[radial-gradient(circle_at_top_left,rgba(52,211,153,0.16),transparent_36%),linear-gradient(135deg,rgba(255,255,255,0.075),rgba(255,255,255,0.025))] p-6 shadow-2xl shadow-black/20 sm:p-8">
        <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-emerald-300/10 blur-3xl" />
        <div className="relative max-w-3xl">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-emerald-100/70">Evidence-first supplement decisions</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-white sm:text-6xl">
            Find the right supplements for your goal
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-white/70 sm:text-lg">
            Start with a goal, review the stack, compare options, then choose products with safety context.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link href="/goals/sleep" className="premium-button text-center">
              Sleep better →
            </Link>
            <Link href="/goals/focus" className="rounded-2xl border border-white/10 bg-white px-5 py-3 text-center text-sm font-black text-slate-950 transition hover:bg-white/90 active:scale-[0.99]">
              Improve focus →
            </Link>
            <Link href="/goals/fat-loss" className="premium-button-warm text-center">
              Lose fat →
            </Link>
          </div>

          <p className="mt-4 text-xs text-white/45">
            Built for quick decisions, not supplement hype.
          </p>
        </div>
      </section>

      <section>
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-100/55">Start here</p>
            <h2 className="mt-1 text-2xl font-black text-white">Most popular stacks</h2>
          </div>
          <Link href="/stacks" className="premium-link text-sm">All stacks →</Link>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {stacks.slice(0, 6).map((stack) => (
            <Link key={stack.slug} href={`/stacks/${stack.slug}`} className="premium-card group block p-5 transition hover:-translate-y-0.5 hover:border-emerald-300/35 hover:bg-white/[0.055]">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-100/55">{String(stack.goal || stack.slug).replace(/[-_]/g, ' ')}</p>
              <h3 className="mt-2 text-lg font-black leading-tight text-white group-hover:text-emerald-100">{stack.title}</h3>
              <p className="mt-2 line-clamp-3 text-sm leading-6 text-white/62">{stack.short_description}</p>
              <span className="mt-4 inline-flex text-sm font-black text-emerald-200 transition group-hover:translate-x-1">
                View stack →
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-100/55">Decision support</p>
            <h2 className="mt-1 text-2xl font-black text-white">Popular comparisons</h2>
          </div>
          <Link href="/compare" className="premium-link text-sm">Compare all →</Link>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {generatedComparisons.slice(0, 6).map((slug) => (
            <Link key={slug} href={`/compare/${slug}`} className="premium-card group block p-5 transition hover:-translate-y-0.5 hover:border-emerald-300/35 hover:bg-white/[0.055]">
              <h3 className="text-lg font-black leading-tight text-white group-hover:text-emerald-100">
                {formatCompare(slug)}
              </h3>
              <p className="mt-2 text-sm leading-6 text-white/62">Quickly choose the better default option before buying.</p>
              <span className="mt-4 inline-flex text-sm font-black text-emerald-200 transition group-hover:translate-x-1">
                Compare →
              </span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  )
}
