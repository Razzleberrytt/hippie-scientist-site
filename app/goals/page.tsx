import type { Metadata } from 'next'
import Link from 'next/link'

import { goals } from '@/data/goals'
import { SITE_URL } from '@/src/lib/seo'

export const metadata: Metadata = {
  title: 'Supplement Goals: Compare Options by What You Want to Fix',
  description:
    'Start from the outcome, not the ingredient. Each goal guide compares the common options by fit, onset, evidence quality, risk, and why people stop taking them.',
  alternates: { canonical: `${SITE_URL}/goals/` },
  openGraph: {
    title: 'Supplement Goals',
    description:
      'Compare supplement options by goal — fit, onset, evidence quality, and risk profile for each.',
    url: `${SITE_URL}/goals/`,
    type: 'website',
    images: ['/og-default.jpg'],
  },
}

export default function GoalsIndexPage() {
  return (
    <div className="container-page space-y-10 py-10">
      <header className="max-w-3xl space-y-4">
        <p className="eyebrow-label">Goal guides</p>
        <h1 className="text-4xl font-bold tracking-tight text-ink sm:text-5xl">
          Start from the goal, not the ingredient
        </h1>
        <p className="text-lg leading-8 text-muted">
          Most supplement research starts with a product name. These guides start with the outcome
          you are after and compare the common options by practical fit, likely onset, evidence
          quality, and the risks worth knowing before you start. Educational context only — not
          medical advice.
        </p>
      </header>

      <section>
        <h2 className="sr-only">All goal guides</h2>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {goals.map((goal) => (
            <li key={goal.slug}>
              <Link
                href={`/goals/${goal.slug}/`}
                className="card-premium block h-full p-5 transition hover:border-brand-700/20 hover:shadow-sm"
              >
                <p className="text-[10px] font-bold uppercase tracking-wider text-brand-700 dark:text-brand-200">
                  {goal.eyebrow}
                </p>
                <h3 className="mt-2 text-lg font-semibold text-ink">{goal.title}</h3>
                <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted">{goal.description}</p>
                <p className="mt-3 text-xs font-semibold text-brand-800 dark:text-brand-100">
                  {goal.options.length} options compared →
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
