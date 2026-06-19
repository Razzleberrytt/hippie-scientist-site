'use client'

import clsx from 'clsx'
import type { SearchDoc, SearchContentType, EvidenceGrade, SafetySignal } from '@/lib/search/types'

const TYPE_STYLES: Record<SearchContentType, string> = {
  Herb: 'border-emerald-700/15 bg-emerald-50 text-emerald-800',
  Compound: 'border-blue-700/15 bg-blue-50 text-blue-800',
  Education: 'border-violet-700/15 bg-violet-50 text-violet-800',
}

const EVIDENCE_STYLES: Record<EvidenceGrade, string> = {
  Strong: 'border-emerald-700/15 bg-emerald-50 text-emerald-800',
  Moderate: 'border-teal-700/15 bg-teal-50 text-teal-800',
  Limited: 'border-amber-700/15 bg-amber-50 text-amber-800',
  Preliminary: 'border-stone-500/15 bg-stone-100 text-stone-700',
  Educational: 'border-violet-700/15 bg-violet-50 text-violet-800',
}

const SAFETY_STYLES: Record<SafetySignal, string> = {
  'Generally well tolerated': 'border-emerald-700/15 bg-emerald-50 text-emerald-800',
  'Use with caution': 'border-amber-700/15 bg-amber-50 text-amber-800',
  'Notable considerations': 'border-rose-700/15 bg-rose-50 text-rose-800',
  Educational: 'border-violet-700/15 bg-violet-50 text-violet-800',
}

const BADGE_BASE =
  'inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide'

export function TypeBadge({ type }: { type: SearchContentType }) {
  return <span className={clsx(BADGE_BASE, TYPE_STYLES[type])}>{type}</span>
}

export function EvidenceBadge({ grade }: { grade: EvidenceGrade }) {
  return (
    <span className={clsx(BADGE_BASE, EVIDENCE_STYLES[grade])} title={`Evidence: ${grade}`}>
      {grade}
    </span>
  )
}

export function SafetyBadge({ safety }: { safety: SafetySignal }) {
  if (safety === 'Educational') return null
  return (
    <span className={clsx(BADGE_BASE, SAFETY_STYLES[safety])} title={`Safety: ${safety}`}>
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
        'inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-700/40',
        active
          ? 'border-brand-800 bg-brand-800 text-white shadow-sm dark:border-brand-600 dark:bg-brand-600 dark:text-[#07150c]'
          : 'border-brand-900/10 bg-white text-[#33443a] hover:border-brand-700/25 hover:text-brand-800 dark:border-[var(--border-soft)] dark:bg-[var(--surface-card)] dark:text-[var(--text-secondary)] dark:hover:border-[var(--border-strong)] dark:hover:bg-[var(--surface-subtle)] dark:hover:text-[var(--text-primary)]',
      )}
    >
      <span>{label}</span>
      {typeof count === 'number' && (
        <span
          className={clsx(
            'rounded-full px-1.5 text-[10px] font-bold tabular-nums',
            active ? 'bg-white/20 text-white dark:text-[#07150c]' : 'bg-brand-50 text-brand-700 dark:bg-[var(--surface-subtle)] dark:text-brand-700',
          )}
        >
          {count}
        </span>
      )}
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
    <li role="option" aria-selected={active} id={id}>
      <button
        type="button"
        tabIndex={-1}
        onMouseEnter={onHover}
        onClick={onSelect}
        className={clsx(
          'flex w-full flex-col gap-1 rounded-xl border px-3 py-2.5 text-left transition',
          active
            ? 'border-brand-700/30 bg-brand-50/70 dark:border-brand-600/40 dark:bg-[var(--surface-subtle)]'
            : 'border-transparent hover:bg-stone-50 dark:hover:bg-[var(--surface-card)]',
        )}
      >
        <span className="flex items-center gap-2">
          <TypeBadge type={doc.type} />
          <span className="min-w-0 flex-1 truncate text-sm font-semibold text-ink">{doc.title}</span>
          <EvidenceBadge grade={doc.evidenceGrade} />
        </span>
        {doc.summary && (
          <span className="line-clamp-1 text-xs leading-5 text-[#5f6f66]">{doc.summary}</span>
        )}
      </button>
    </li>
  )
}
