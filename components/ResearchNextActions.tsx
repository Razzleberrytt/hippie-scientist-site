import type { ReactNode } from 'react'

export default function ResearchNextActions({
  headingId,
  title,
  description,
  children,
}: {
  headingId: string
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <section
      className="rounded-2xl border border-brand-900/10 bg-brand-50/30 p-5 sm:p-6"
      aria-labelledby={headingId}
    >
      <h2 id={headingId} className="text-xl font-semibold text-ink dark:text-[var(--text-primary)]">
        {title}
      </h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted dark:text-[var(--text-secondary)]">
        {description}
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">{children}</div>
    </section>
  )
}
