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
    <div className="section-frame p-5 sm:p-6">
      <div className="max-w-2xl space-y-2.5">
        <p className="eyebrow-label">{eyebrow}</p>
        <h2 className="compact-heading">{title}</h2>
        <p className="text-sm leading-6 text-prose-soft sm:text-base">{description}</p>
        {currentScan ? (
          <p className="chip-readable inline-flex max-w-full px-3 py-1.5 text-sm leading-5 text-[var(--text-secondary)]">
            <span className="mr-1.5 font-semibold text-[var(--text-muted)]">Current scan:</span>
            <span className="min-w-0 break-words">{currentScan}</span>
          </p>
        ) : null}
      </div>

      <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
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
    `chip-readable inline-flex min-h-11 items-center justify-center px-3 py-2 text-center text-xs font-semibold leading-tight ${active ? 'border-brand-700/30 bg-brand-50 text-brand-900' : 'text-[var(--text-secondary)]'}`
  const activeContextLabel = activeFilter === 'all'
    ? null
    : options.find(option => option.value === activeFilter)?.label

  return (
    <details className="surface-subtle group mt-3 p-3.5 sm:p-4" open={open || undefined}>
      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 rounded-[0.85rem] px-1 text-sm font-bold text-ink select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700/30 focus-visible:ring-offset-2 [&::-webkit-details-marker]:hidden">
        <span className="min-w-0">
          <span>Refine by context</span>
          {activeContextLabel ? (
            <span className="ml-2 font-semibold text-brand-800">· {activeContextLabel}</span>
          ) : null}
        </span>
        <span className="editorial-icon-disc size-8 shrink-0" aria-hidden="true">
          <svg
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="size-4 text-brand-800 transition-transform group-open:rotate-180"
          >
            <path d="M4 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </summary>
      <div className="mt-3 flex flex-wrap gap-2 border-t border-[color:var(--border-soft)] pt-3">
        <Link href={buildHref('all', query)} className={itemClass(activeFilter === 'all')} aria-current={activeFilter === 'all' ? 'true' : undefined}>
          All contexts
        </Link>
        {options.map(option => (
          <Link
            key={option.value}
            href={buildHref(option.value, query)}
            className={itemClass(activeFilter === option.value)}
            aria-current={activeFilter === option.value ? 'true' : undefined}
            title={option.hint}
          >
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
      className="card-premium group flex h-full flex-col p-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-700/40"
    >
      <div className="flex flex-1 flex-col">
        <div className="flex min-w-0 flex-wrap items-start justify-between gap-3">
          <h3 className="min-w-0 break-words text-base font-semibold leading-tight tracking-tight text-ink transition group-hover:text-brand-800 sm:text-lg">
            {name}
          </h3>
          {featured ? (
            <span className={`${decisionStatusBadgeClass} shrink-0 border-brand-700/15 bg-brand-50 text-brand-800`}>
              Start here
            </span>
          ) : null}
        </div>

        <p className="mt-2 line-clamp-3 text-sm leading-5 text-[var(--text-secondary)]">
          {summary || fallbackSummary}
        </p>

        {bestForItems.length > 0 ? (
          <div className="mt-3">
            <p className={`${decisionMicroLabelClass} mb-1.5 text-[var(--text-muted)]`}>Best for</p>
            <div className={decisionMetadataClusterClass}>
              {bestForItems.map((item, idx) => (
                <span key={idx} className={decisionChipClass}>{item}</span>
              ))}
            </div>
          </div>
        ) : null}

        {visibleMechanisms.length > 0 ? (
          <p className="mt-3 border-t border-[color:var(--border-soft)] pt-3 text-xs leading-5 text-[var(--text-secondary)]">
            <span className={`${decisionMicroLabelClass} mr-1.5 text-[var(--text-muted)]`}>Mechanisms</span>
            {visibleMechanisms.join(' · ')}
          </p>
        ) : null}

        <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.12em] text-brand-800">
          Open profile <span aria-hidden="true">→</span>
        </span>
      </div>
    </Link>
  )
}
