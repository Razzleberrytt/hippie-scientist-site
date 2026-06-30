import Link from 'next/link'
import { formatDisplayLabel } from '@/lib/display-utils'
import {
  decisionChipClass,
  decisionMetadataClusterClass,
  decisionMicroLabelClass,
  decisionStatusBadgeClass,
} from '@/lib/decision-primitives'

type DecisionEmptyStateAction = {
  href: string
  label: string
  variant?: 'primary' | 'secondary'
}

export function DecisionEmptyState({
  eyebrow,
  title,
  description,
  currentScan,
  actions,
}: {
  eyebrow: string
  title: string
  description: string
  currentScan?: string
  actions: DecisionEmptyStateAction[]
}) {
  return (
    <div className="rounded-[1rem] border border-brand-900/10 bg-white/85 p-4 shadow-sm sm:p-5">
      <div className="max-w-2xl space-y-2">
        <p className="eyebrow-label">{eyebrow}</p>
        <h2 className="compact-heading">{title}</h2>
        <p className="text-sm leading-6 text-prose-soft sm:text-base">{description}</p>
        {currentScan ? (
          <p className="text-sm leading-6 text-muted">Current scan: {currentScan}</p>
        ) : null}
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        {actions.map(action => (
          <Link
            key={`${action.href}-${action.label}`}
            href={action.href}
            className={`${action.variant === 'primary' ? 'button-primary' : 'button-secondary'} min-h-11 justify-center px-4 py-2 text-sm`}
          >
            {action.label}
          </Link>
        ))}
      </div>
    </div>
  )
}

type DecisionFilterOption = {
  label: string
  value: string
  hint: string
}

export function DecisionFilterGroup({
  options,
  activeFilter,
  query,
  buildHref,
  open,
}: {
  options: DecisionFilterOption[]
  activeFilter: string
  query: string
  buildHref: (value: string, query: string) => string
  open?: boolean
}) {
  const itemClass = (active: boolean) =>
    `rounded-full border px-2.5 py-1.5 text-xs font-semibold leading-tight transition ${active ? 'border-brand-700/25 bg-brand-50 text-brand-900' : 'border-brand-900/10 bg-white/80 text-[#33443a] hover:border-brand-700/20'}`

  return (
    <details className="mt-3 rounded-[0.8rem] border border-brand-900/10 bg-[#fbfaf6]/80 p-3 shadow-none" open={open || undefined}>
      <summary className="flex min-h-8 items-center justify-between gap-4 text-sm font-bold text-ink">
        <span>Refine by context</span>
        <span className="text-brand-800" aria-hidden="true">↓</span>
      </summary>
      <div className="mt-3 flex flex-wrap gap-2">
        <Link href={buildHref('all', query)} className={itemClass(activeFilter === 'all')}>
          All contexts
        </Link>
        {options.map(option => (
          <Link key={option.value} href={buildHref(option.value, query)} className={itemClass(activeFilter === option.value)}>
            {option.label}
          </Link>
        ))}
      </div>
    </details>
  )
}

export function DecisionProfileCard({
  href,
  name,
  summary,
  bestFor,
  mechanisms = [],
  featured = false,
  fallbackSummary,
}: {
  href: string
  name: string
  summary?: string
  bestFor: string
  mechanisms?: string[]
  featured?: boolean
  fallbackSummary: string
}) {
  const visibleMechanisms = mechanisms.map(formatDisplayLabel).filter(Boolean).slice(0, 2)
  const hasBestFor = bestFor && bestFor !== 'Research context'
  const bestForItems = hasBestFor ? bestFor.split(' • ').filter(Boolean) : []

  return (
    <Link
      href={href}
      className="group flex h-full flex-col rounded-[0.9rem] border border-brand-900/10 bg-[var(--surface-card)] p-3 shadow-sm transition-all duration-200 motion-safe:hover:-translate-y-0.5 hover:border-brand-700/25 hover:bg-[var(--surface-card-strong)] hover:shadow-[0_6px_18px_rgba(16,32,24,0.08)] focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-700/40 dark:hover:shadow-[0_6px_18px_rgba(0,0,0,0.25)]"
    >
      <div className="flex flex-1 flex-col">
        <div className="flex min-w-0 items-start justify-between gap-3">
          <h3 className="min-w-0 break-words text-base font-semibold leading-tight tracking-tight text-ink transition group-hover:text-brand-800 sm:text-lg">
            {name}
          </h3>
          {featured ? (
            <span className={`${decisionStatusBadgeClass} shrink-0 border-brand-700/10 bg-brand-50 text-brand-800`}>
              Start here
            </span>
          ) : null}
        </div>

        <p className="mt-1.5 line-clamp-2 text-sm leading-5 text-[var(--text-secondary)]">
          {summary || fallbackSummary}
        </p>

        {bestForItems.length > 0 ? (
          <div className="mt-2">
            <p className={`${decisionMicroLabelClass} mb-1.5 text-[var(--text-muted)]`}>Best for</p>
            <div className={decisionMetadataClusterClass}>
              {bestForItems.map((item, idx) => (
                <span key={idx} className={decisionChipClass}>{item}</span>
              ))}
            </div>
          </div>
        ) : null}

        {visibleMechanisms.length > 0 ? (
          <div className={`${decisionMetadataClusterClass} mt-2 border-t border-brand-900/10 pt-2`}>
            {visibleMechanisms.map(mechanism => (
              <span key={mechanism} className={decisionChipClass}>
                {mechanism}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      <div className="mt-3 flex items-center gap-1 text-sm font-bold text-brand-700 transition-all duration-200 group-hover:gap-2 group-hover:text-brand-900 dark:text-[var(--text-secondary)] dark:group-hover:text-[var(--text-primary)]">
        View profile <span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-0.5">→</span>
      </div>
    </Link>
  )
}
