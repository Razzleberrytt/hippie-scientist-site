import type { ReactNode } from 'react'

export type CommonMistakeItem = {
  mistake: string
  whyItMatters: ReactNode
  betterApproach?: ReactNode
}

/**
 * CommonMistakes — prevents misuse and improves practical usefulness.
 *
 * Each entry pairs a mistake with why it matters and (ideally) the better
 * approach. Reduces the "I tried it and it didn't work" failure mode.
 *
 * MDX usage:
 *   <CommonMistakes
 *     items={[
 *       { mistake: 'Starting five supplements at once',
 *         whyItMatters: 'You cannot tell what helped or what caused a side effect.',
 *         betterApproach: 'Add one at a time and track it for 1–2 weeks.' },
 *     ]}
 *   />
 */
export function CommonMistakes({
  title = 'Common mistakes',
  items,
}: {
  title?: string
  items: CommonMistakeItem[]
}) {
  return (
    <section className="not-prose my-6">
      <h2 className="text-xl font-bold tracking-tight text-ink sm:text-2xl">{title}</h2>
      <ol className="mt-4 space-y-3">
        {items.map((item, i) => (
          <li
            key={`${item.mistake}-${i}`}
            className="rounded-xl border border-brand-900/10 bg-white p-4 shadow-[0_1px_2px_rgba(13,23,18,0.05)] dark:border-white/10 dark:bg-[var(--surface-card)]"
          >
            <p className="flex gap-2 text-sm font-bold text-ink">
              <span aria-hidden="true" className="text-amber-600 dark:text-amber-400">
                ⚠
              </span>
              <span>{item.mistake}</span>
            </p>
            <p className="mt-1.5 text-sm leading-6 text-muted">
              <span className="font-semibold text-ink">Why it matters: </span>
              {item.whyItMatters}
            </p>
            {item.betterApproach ? (
              <p className="mt-1.5 text-sm leading-6 text-muted">
                <span className="font-semibold text-emerald-700 dark:text-emerald-300">Better: </span>
                {item.betterApproach}
              </p>
            ) : null}
          </li>
        ))}
      </ol>
    </section>
  )
}

export default CommonMistakes
