import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Focus Without a Caffeine Crash | Guide',
  description: 'Educational framework for building smoother focus routines with fewer spikes and crashes.',
}

export default function Page() {
  return (
    <main className="container-page py-10 space-y-8">
      <section className="hero-shell rounded-[2rem] border border-brand-900/10 p-6 shadow-card sm:p-8">
        <p className="eyebrow-label">Focus framework</p>
        <h1 className="mt-2 text-3xl font-semibold text-ink sm:text-4xl">Focus Without a Caffeine Crash</h1>
        <p className="detail-reading mt-4 text-muted">
          If caffeine feels inconsistent, pair lifestyle timing with lower-intensity supports. Educationally, the goal is smoother daytime cognition and better evening wind-down.
        </p>
      </section>
      <section className="card-premium p-6">
        <h2 className="text-2xl font-semibold text-ink">Simple starting structure</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-muted">
          <li>Cap caffeine earlier in the day and avoid late “rescue doses.”</li>
          <li>Consider L-theanine with caffeine for calmer focus context.</li>
          <li>Use sleep consistency to reduce next-day overreliance on stimulants.</li>
        </ol>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/guides/best-supplements-for-focus" className="text-sm font-medium text-emerald-700 hover:underline">Top focus supplements</Link>
          <Link href="/compare/caffeine-vs-l-theanine" className="text-sm font-medium text-emerald-700 hover:underline">Caffeine vs L-theanine</Link>
        </div>
      </section>
    </main>
  )
}
