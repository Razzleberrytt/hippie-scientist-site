import type { Metadata } from 'next'
import Link from 'next/link'
import { goals } from '@/data/goals'
import DecisionCtaGroup from '../../src/components/decision/DecisionCtaGroup'

import { buildPageMetadata, SEO_YEAR } from '../../src/lib/seo'

export const metadata: Metadata = buildPageMetadata({
  title: `Supplement Goal Guides ${SEO_YEAR} – Evidence, Safety & Comparisons`,
  description:
    'Choose your goal — sleep, stress, focus, anxiety, pain, and more — then compare herbs and compounds by evidence strength, safety, and practical tradeoffs.',
  path: '/goals',
})

export default function GoalsPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <section className="hero-shell rounded-[2rem] border border-brand-900/10 p-6 shadow-sm sm:p-10">
        <p className="eyebrow-label">Goal decision system</p>
        <h1 className="heading-premium mt-3 max-w-[12ch] text-ink sm:max-w-[16ch]">
          Choose by outcome, then compare options clearly.
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-muted sm:text-base">
          These pages are educational comparison summaries designed for fast scanning. They are intended to
          help readers compare evidence context, tolerance considerations, and practical tradeoffs — not to
          diagnose, prescribe, or replace professional care.
        </p>

        <div className="mt-6 flex flex-wrap gap-4 text-xs font-semibold uppercase tracking-[0.14em]">
          <Link href="/methodology" className="text-brand-700 hover:text-brand-800 hover:underline dark:text-brand-100 dark:hover:text-white">
            Research methodology →
          </Link>
          <Link href="/education/evidence-hierarchy" className="text-brand-700 hover:text-brand-800 hover:underline dark:text-brand-100 dark:hover:text-white">
            Evidence hierarchy →
          </Link>
          <Link href="/disclaimer" className="text-brand-700 hover:text-brand-800 hover:underline dark:text-brand-100 dark:hover:text-white">
            Disclaimer →
          </Link>
        </div>
      </section>

      {/* Decision CTAs — primary actions above the goal grid */}
      <DecisionCtaGroup
        ctas={[
          { label: 'Browse goal paths', href: '#goals', variant: 'primary' },
          { label: 'Search the library', href: '/search', variant: 'secondary' },
          { label: 'Compare compounds', href: '/compare', variant: 'ghost' },
        ]}
      />

      <section id="goals" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {goals.map((goal) => (
          <Link
            key={goal.slug}
            href={`/goals/${goal.slug}`}
            className="group card-premium flex flex-col justify-between p-5 sm:p-6"
          >
            <div>
              <h2 className="!font-display !text-[2.25rem] !font-semibold !leading-[1.02] !tracking-tight text-ink transition group-hover:text-brand-800 sm:!text-[2rem] lg:!text-[1.6rem] dark:group-hover:text-brand-100">
                {goal.title}
              </h2>
              <p className="mt-4 text-sm leading-7 text-muted line-clamp-4">
                {goal.description}
              </p>
            </div>
            <div className="mt-5 border-t border-brand-900/10 pt-4 dark:border-white/10">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-brand-700 dark:text-brand-200">Options compared</p>
              <div className="flex flex-wrap gap-1.5">
                {goal.options.slice(0, 3).map((option) => (
                  <span
                    key={option.slug}
                    className="inline-flex items-center rounded-full border border-brand-100/50 bg-brand-50 px-2 py-0.5 text-[10px] font-bold text-brand-800 dark:border-white/10 dark:bg-white/5 dark:text-brand-100"
                  >
                    {option.name}
                  </span>
                ))}
                {goal.options.length > 3 && (
                  <span className="self-center text-[10px] font-semibold text-muted">
                    +{goal.options.length - 3} more
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </section>
    </div>
  )
}
