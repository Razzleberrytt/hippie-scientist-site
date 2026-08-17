'use client'

import clsx from 'clsx'
import type { SearchDoc, SearchContentType, EvidenceGrade, SafetySignal } from '@/lib/search/types'

const TYPE_STYLES: Record<SearchContentType, string> = {
  Herb: 'border-emerald-700/15 bg-emerald-50 text-emerald-800 dark:border-emerald-300/20 dark:bg-emerald-300/10 dark:text-emerald-100',
  Compound: 'border-blue-700/15 bg-blue-50 text-blue-800 dark:border-blue-300/20 dark:bg-blue-300/10 dark:text-blue-100',
  Education: 'border-violet-700/15 bg-violet-50 text-violet-800 dark:border-violet-300/20 dark:bg-violet-300/10 dark:text-violet-100',
}

const EVIDENCE_STYLES: Record<EvidenceGrade, string> = {
  Strong: 'border-emerald-700/15 bg-emerald-50 text-emerald-800 dark:border-emerald-300/20 dark:bg-emerald-300/10 dark:text-emerald-100',
  Moderate: 'border-teal-700/15 bg-teal-50 text-teal-800 dark:border-teal-300/20 dark:bg-teal-300/10 dark:text-teal-100',
  Limited: 'border-amber-700/15 bg-amber-50 text-amber-800 dark:border-amber-300/20 dark:bg-amber-300/10 dark:text-amber-100',
  Preliminary: 'border-stone-500/15 bg-stone-100 text-stone-700 dark:border-stone-300/20 dark:bg-stone-300/10 dark:text-stone-200',
  Educational: 'border-violet-700/15 bg-violet-50 text-violet-800 dark:border-violet-300/20 dark:bg-violet-300/10 dark:text-violet-100',
}

const SAFETY_STYLES: Record<SafetySignal, string> = {
  'Generally well tolerated': 'border-emerald-700/15 bg-emerald-50 text-emerald-800 dark:border-emerald-300/20 dark:bg-emerald-300/10 dark:text-emerald-100',
  'Use with caution': 'border-amber-700/15 bg-amber-50 text-amber-800 dark:border-amber-300/20 dark:bg-amber-300/10 dark:text-amber-100',
  'Notable considerations': 'border-rose-700/15 bg-rose-50 text-rose-800 dark:border-rose-300/20 dark:bg-rose-300/10 dark:text-rose-100',
  Educational: 'border-violet-700/15 bg-violet-50 text-violet-800 dark:border-violet-300/20 dark:bg-violet-300/10 dark:text-violet-100',
}

const BADGE_BASE =
  'inline-flex items-center rounded-full border px-2 py-0.5 text-[0.75rem] font-semibold leading-snug'

export function TypeBadge({ type }: { type: SearchContentType }) {
  return (
    <span className={clsx(BADGE_BASE, TYPE_STYLES[type])}>
      <span className="sr-only">Content type: </span>
      {type}
    </span>
  )
}

export function EvidenceBadge({ grade }: { grade: EvidenceGrade }) {
  return (
    <span className={clsx(BADGE_BASE, EVIDENCE_STYLES[grade])}>
      <span className="sr-only">Evidence: </span>
      {grade}
    </span>
  )
}

export function SafetyBadge({ safety }: { safety: SafetySignal }) {
  if (safety === 'Educational') return null
  return (
    <span className={clsx(BADGE_BASE, SAFETY_STYLES[safety])}>
      <span className="sr-only">Safety: </span>
      {safety}
    </span>
  )
}

export interface FilterChipProps {
  label: string
  count?: number
  active: boolean
  onClick: () => void
}

export function FilterChip({ label, count, active, onClick }: FilterChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={clsx(
        'inline-flex min-h-11 items-center gap-1.5 rounded-full border px-3 py-1.5 text-[0.8rem] font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:color-mix(in_srgb,var(--hs-gold)_45%,transparent)]',
        active
          ? 'border-[color:var(--hs-gold)] bg-[color:var(--hs-gold-soft)] text-[color:var(--hs-gold-ink)]'
          : 'border-[color:var(--hs-hairline)] bg-[color:var(--hs-surface)] text-[color:var(--hs-body)] hover:border-[color:var(--hs-hairline-strong)] hover:text-[color:var(--hs-ink)]',
      )}
    >
      <span>{label}</span>
      {typeof count === 'number' ? (
        <span
          className={clsx(
            'rounded-full px-1.5 text-[0.7rem] font-semibold tabular-nums',
            active
              ? 'bg-[color:color-mix(in_srgb,var(--hs-gold)_16%,var(--surface-card))] text-[color:var(--hs-gold-ink)]'
              : 'bg-[color:color-mix(in_srgb,var(--hs-gold)_8%,var(--hs-surface-2))] text-[color:var(--hs-gold-ink)]',
          )}
        >
          {count}
        </span>
      ) : null}
    </button>
  )
}

export interface ResultRowProps {
  doc: SearchDoc
  active: boolean
  id: string
  onHover: () => void
  onSelect: () => void
}

/** A single result rendered as an ARIA listbox option (used in the modal). */
export function ResultRow({ doc, active, id, onHover, onSelect }: ResultRowProps) {
  return (
    <li
      role="option"
      aria-selected={active}
      id={id}
      tabIndex={-1}
      onMouseEnter={onHover}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onSelect()
        }
      }}
      className={clsx(
        'flex w-full cursor-pointer flex-col gap-1 rounded-xl border px-3 py-2.5 text-left transition',
        active
          ? 'border-[color:color-mix(in_srgb,var(--hs-gold)_30%,var(--hs-hairline))] bg-[color:color-mix(in_srgb,var(--hs-gold)_7%,var(--hs-surface))] shadow-[inset_2px_0_0_var(--hs-gold)]'
          : 'border-transparent hover:bg-[color:color-mix(in_srgb,var(--hs-gold)_4%,var(--hs-surface))]',
      )}
    >
      <span className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
        <span className="order-1 w-full min-w-0 truncate text-sm font-semibold text-[color:var(--hs-ink)] sm:order-2 sm:w-auto sm:flex-1">{doc.title}</span>
        <span className="order-2 sm:order-1"><TypeBadge type={doc.type} /></span>
        <span className="order-3"><EvidenceBadge grade={doc.evidenceGrade} /></span>
      </span>
      {doc.summary ? (
        <span className="line-clamp-1 text-xs leading-5 text-[color:var(--hs-body)]">{doc.summary}</span>
      ) : null}
    </li>
  )
}