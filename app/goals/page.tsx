import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

import Breadcrumbs from '@/components/ui/Breadcrumbs'
import { goals } from '@/data/goals'
import { SITE_URL, buildTwitterMetadata } from '@/src/lib/seo'

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
  twitter: buildTwitterMetadata({
    title: 'Supplement Goals',
    description: 'Compare supplement options by goal — fit, onset, evidence quality, and risk profile for each.',
  }),
}

const researchGoalCards = [
  {
    slug: 'metabolic-health',
    title: 'Metabolic health research',
    eyebrow: 'Research goal hub',
    description:
      'Start with Berberine, then compare metabolic-health alternatives by human evidence, studied form, interaction context, and safety without crossing into disease-treatment advice.',
    detail: 'Berberine-centered evidence path',
  },
]

export default function GoalsIndexPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 pb-24 pt-4 sm:pt-6">
      <Breadcrumbs
        items={[
          { href: '/', label: 'Home' },
          { label: 'Goals' },
        ]}
      />

      <header className="hero-shell rounded-[2rem] border px-5 py-6 sm:p-8">
        <p className="eyebrow-label">Goal guides</p>
        <h1 className="heading-premium mt-5 max-w-4xl">Start from the goal, not the ingredient</h1>
        <p className="text-reading mt-4 max-w-3xl">
          Most supplement research starts with a product name. These guides start with the outcome you are after and compare common options by practical fit, likely onset, evidence quality, and the risks worth knowing before you start. Educational context only — not medical advice.
        </p>
      </header>

      <section aria-labelledby="all-goal-guides">
        <div className="max-w-3xl">
          <p className="eyebrow-label">Choose a research path</p>
          <h2 id="all-goal-guides" className="compact-heading mt-3">Compare options in the context that matters to you.</h2>
        </div>

        <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          {researchGoalCards.map((goal) => (
            <li key={goal.slug}>
              <Link
                href={`/goals/${goal.slug}/`}
                className="card-premium group flex h-full min-h-[13rem] flex-col p-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--hs-gold)] focus-visible:ring-offset-2 sm:p-6"
              >
                <p className="eyebrow-label">{goal.eyebrow}</p>
                <h3 className="mt-3 text-xl font-semibold leading-snug tracking-tight text-[color:var(--hs-ink)]">{goal.title}</h3>
                <p className="mt-3 line-clamp-3 text-sm leading-6 text-[color:var(--hs-body)]">{goal.description}</p>
                <span className="mt-auto inline-flex items-center gap-2 pt-5 text-sm font-bold text-[color:var(--hs-gold-ink)]">
                  {goal.detail}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </span>
              </Link>
            </li>
          ))}

          {goals.map((goal) => (
            <li key={goal.slug}>
              <Link
                href={`/goals/${goal.slug}/`}
                className="card-premium group flex h-full min-h-[13rem] flex-col p-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--hs-gold)] focus-visible:ring-offset-2 sm:p-6"
              >
                <p className="eyebrow-label">{goal.eyebrow}</p>
                <h3 className="mt-3 text-xl font-semibold leading-snug tracking-tight text-[color:var(--hs-ink)]">{goal.title}</h3>
                <p className="mt-3 line-clamp-3 text-sm leading-6 text-[color:var(--hs-body)]">{goal.description}</p>
                <span className="mt-auto inline-flex items-center gap-2 pt-5 text-sm font-bold text-[color:var(--hs-gold-ink)]">
                  {goal.options.length} options compared
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
