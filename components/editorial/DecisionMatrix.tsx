import Link from 'next/link'
import type { ReactNode } from 'react'

export type DecisionFit = 'good' | 'maybe' | 'poor' | 'avoid'

export type DecisionMatrixItem = {
  /** The reader's situation ("Racing thoughts before bed"). */
  situation: string
  /** How well this page's subject fits that situation. */
  fit: DecisionFit
  /** Plain-English guidance for that situation. */
  guidance: ReactNode
  /** Optional link to a more relevant page. */
  href?: string
  hrefLabel?: string
}

const FIT: Record<DecisionFit, { label: string; badge: string; rail: string }> = {
  good: {
    label: 'Good fit',
    badge:
      'border-emerald-500/40 bg-emerald-100 text-emerald-900 dark:border-emerald-400/30 dark:bg-emerald-900/40 dark:text-emerald-100',
    rail: 'border-l-emerald-500/60',
  },
  maybe: {
    label: 'Maybe',
    badge:
      'border-amber-500/40 bg-amber-100 text-amber-900 dark:border-amber-400/30 dark:bg-amber-900/40 dark:text-amber-100',
    rail: 'border-l-amber-500/60',
  },
  poor: {
    label: 'Poor fit',
    badge:
      'border-slate-400/40 bg-slate-100 text-slate-700 dark:border-white/20 dark:bg-white/10 dark:text-[var(--text-secondary)]',
    rail: 'border-l-slate-400/60',
  },
  avoid: {
    label: 'Avoid',
    badge:
      'border-rose-500/40 bg-rose-100 text-rose-900 dark:border-rose-400/30 dark:bg-rose-900/40 dark:text-rose-100',
    rail: 'border-l-rose-500/60',
  },
}

/**
 * DecisionMatrix — "Should you use it?" fit-by-situation.
 *
 * Helps the reader self-identify whether the page matches their problem. Each
 * row states a situation, a labeled fit (Good fit / Maybe / Poor fit / Avoid —
 * never communicated by color alone), plain guidance, and an optional route to
 * a better page. More useful than a generic pros/cons table.
 *
 * MDX usage (items is a JS expression):
 *   <DecisionMatrix
 *     title="Should you use L-theanine?"
 *     items={[
 *       { situation: 'Racing thoughts before bed', fit: 'good',
 *         guidance: 'May quiet mental chatter without sedation.' },
 *       { situation: 'Severe panic attacks', fit: 'poor',
 *         guidance: 'Supplements are unlikely to be enough on their own.' },
 *     ]}
 *   />
 */
export function DecisionMatrix({
  title,
  intro,
  items,
}: {
  title: string
  intro?: ReactNode
  items: DecisionMatrixItem[]
}) {
  return (
    <section className="not-prose my-6">
      <h2 className="text-xl font-bold tracking-tight text-ink sm:text-2xl">{title}</h2>
      {intro ? <p className="mt-2 text-sm leading-6 text-muted">{intro}</p> : null}
      <div className="mt-4 space-y-2.5">
        {items.map((item, i) => {
          const fit = FIT[item.fit]
          return (
            <div
              key={`${item.situation}-${i}`}
              className={`rounded-xl border border-brand-900/10 border-l-4 ${fit.rail} bg-white p-4 shadow-[0_1px_2px_rgba(13,23,18,0.05)] dark:border-white/10 dark:bg-[var(--surface-card)]`}
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-full border px-2.5 py-0.5 text-xs font-bold ${fit.badge}`}>
                  {fit.label}
                </span>
                <span className="text-sm font-bold text-ink">{item.situation}</span>
              </div>
              <p className="mt-1.5 text-sm leading-6 text-muted">{item.guidance}</p>
              {item.href ? (
                <Link
                  href={item.href}
                  className="mt-1.5 inline-flex text-sm font-semibold text-brand-800 hover:underline dark:text-[var(--text-primary)]"
                >
                  {item.hrefLabel ?? 'Read more'} →
                </Link>
              ) : null}
            </div>
          )
        })}
      </div>
    </section>
  )
}

export default DecisionMatrix
