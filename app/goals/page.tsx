import type { Metadata } from 'next'
import Link from 'next/link'
import { goals } from '@/data/goals'
import DecisionCtaGroup from '@/components/decision/DecisionCtaGroup'

export const metadata: Metadata = {
  title: 'Supplement Goal Decision Guides',
  description: 'Start with your goal — sleep, focus, stress, inflammation, or pain — then compare herbs and compounds by evidence, safety, and tradeoffs.',
}

export default function GoalsPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 space-y-8">
      <section className="hero-shell rounded-[2rem] border border-brand-900/10 p-6 sm:p-10 shadow-sm">
        <p className="eyebrow-label">Goal decision system</p>
        <h1 className="heading-premium mt-3 text-ink">
          Choose by outcome, then compare options clearly.
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-muted sm:text-base">
          These pages are educational comparison summaries designed for fast scanning. They are intended to
          help readers compare evidence context, tolerance considerations, and practical tradeoffs — not to
          diagnose, prescribe, or replace professional care.
        </p>

        <div className="mt-6 flex flex-wrap gap-4 text-xs font-semibold uppercase tracking-[0.14em]">
          <Link href="/education/research-methodology" className="text-brand-700 hover:text-brand-800 hover:underline">
            Research methodology →
          </Link>
          <Link href="/education/evidence-hierarchy" className="text-brand-700 hover:text-brand-800 hover:underline">
            Evidence hierarchy →
          </Link>
          <Link href="/disclaimer" className="text-brand-700 hover:text-brand-800 hover:underline">
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
            className="group card-premium p-6 flex flex-col justify-between"
          >
            <div>
              <h2 className="text-lg font-semibold text-ink group-hover:text-brand-800 transition">
                {goal.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted line-clamp-3">
                {goal.description}
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-brand-900/5">
              <p className="text-[10px] uppercase font-bold tracking-wider text-brand-700 mb-2">Options compared</p>
              <div className="flex flex-wrap gap-1.5">
                {goal.options.slice(0, 3).map((option) => (
                  <span
                    key={option.slug}
                    className="inline-flex items-center rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-bold text-brand-800 border border-brand-100/50"
                  >
                    {option.name}
                  </span>
                ))}
                {goal.options.length > 3 && (
                  <span className="text-[10px] font-semibold text-muted self-center">
                    +{goal.options.length - 3} more
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </section>
    </main>
  )
}
