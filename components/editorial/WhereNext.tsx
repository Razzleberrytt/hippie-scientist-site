import Link from 'next/link'
import type { ReactNode } from 'react'

export type NextPath = {
  /** What the reader might want next ("to compare sleep options"). */
  ifYouWant: string
  /** The destination label ("Magnesium vs Melatonin"). */
  goTo: string
  /** Destination href — must be a real route. */
  href: string
  /** Optional one-line reason. */
  reason?: ReactNode
}

/**
 * WhereNext — context-aware journey navigation that replaces a generic
 * "Related articles" list. Each path is intent-based routing, not a dump.
 *
 * MDX usage:
 *   <WhereNext
 *     paths={[
 *       { ifYouWant: 'to compare sleep options', goTo: 'Magnesium vs Melatonin',
 *         href: '/guides/sleep/magnesium-vs-melatonin/' },
 *       { ifYouWant: 'help with stress-related insomnia', goTo: 'Ashwagandha for Sleep',
 *         href: '/guides/sleep/ashwagandha-for-sleep/' },
 *     ]}
 *   />
 */
export function WhereNext({
  title = 'Where to go next',
  intro,
  paths,
}: {
  title?: string
  intro?: ReactNode
  paths: NextPath[]
}) {
  return (
    <section className="not-prose my-6 rounded-2xl border-2 border-brand-900/12 bg-brand-50/40 p-5 dark:border-white/10 dark:bg-[var(--surface-subtle)]">
      <h2 className="text-xl font-bold tracking-tight text-ink sm:text-2xl">{title}</h2>
      {intro ? <p className="mt-2 text-sm leading-6 text-muted">{intro}</p> : null}
      <ul className="mt-4 space-y-2.5">
        {paths.map((path, i) => (
          <li key={`${path.href}-${i}`} className="text-sm leading-6">
            <span className="text-muted">If you want {path.ifYouWant} → </span>
            <Link href={path.href} className="font-bold text-brand-800 hover:underline dark:text-[var(--text-primary)]">
              {path.goTo}
            </Link>
            {path.reason ? <span className="text-muted"> — {path.reason}</span> : null}
          </li>
        ))}
      </ul>
    </section>
  )
}

export default WhereNext
