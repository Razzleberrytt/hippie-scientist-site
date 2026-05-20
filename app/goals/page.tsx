import type { Metadata } from 'next'
import Link from 'next/link'
import { goals } from '@/data/goals'

export const metadata: Metadata = {
  title: 'Goal Decision Guides | The Hippie Scientist',
  description: 'Decision-focused supplement goal pages for pain, inflammation, focus, and sleep.',
}

export default function GoalsPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="rounded-3xl border border-slate-200 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-900 p-6 text-slate-100 shadow-sm sm:p-10">
        <p className="text-xs uppercase tracking-[0.2em] text-emerald-300">Goal decision system</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Choose by outcome, then compare options clearly.</h1>
        <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-300 sm:text-base">Each page is designed for fast scanning: quick picks first, then side-by-side tradeoffs, risks, and practical form choices.</p>
      </section>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {goals.map((goal) => (
          <Link key={goal.slug} href={`/goals/${goal.slug}`} className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-900">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{goal.title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{goal.description}</p>
            <ul className="mt-4 space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
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
