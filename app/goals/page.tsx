import type { Metadata } from 'next'
import Link from 'next/link'
import { goals } from '@/data/goals'

export const metadata: Metadata = {
  title: 'Supplement Goal Guides and Comparisons',
  description: 'Educational comparison pages for pain, inflammation, focus, and sleep support topics.',
}

export default function GoalsPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-9 lg:px-8">
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
        <p className="text-xs uppercase tracking-[0.2em] text-emerald-700">Goal decision system</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          Choose by outcome, then compare options clearly.
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-700 sm:text-base">
          These pages are educational comparison summaries designed for fast scanning. They are intended to
          help readers compare evidence context, tolerance considerations, and practical tradeoffs — not to
          diagnose, prescribe, or replace professional care.
        </p>

        <div className="mt-4 flex flex-wrap gap-2.5 text-xs font-medium uppercase tracking-[0.14em]">
          <Link href="/education/research-methodology" className="text-emerald-800 underline-offset-4 hover:underline">
            Research methodology
          </Link>
          <Link href="/education/evidence-hierarchy" className="text-emerald-800 underline-offset-4 hover:underline">
            Evidence hierarchy
          </Link>
          <Link href="/disclaimer" className="text-emerald-800 underline-offset-4 hover:underline">
            Disclaimer
          </Link>
        </div>
      </section>

      <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {goals.map((goal) => (
          <Link
            key={goal.slug}
            href={`/goals/${goal.slug}`}
            className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md"
          >
            <h2 className="text-lg font-semibold text-slate-900">{goal.title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{goal.description}</p>
            <ul className="mt-3 space-y-1 text-xs text-slate-500">
              {goal.options.slice(0, 3).map((option) => (
                <li key={option.slug} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <span>{option.name}</span>
                </li>
              ))}
            </ul>
          </Link>
        ))}
      </section>
    </main>
  )
}
