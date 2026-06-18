'use client'

import { useId, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

/**
 * EvidenceMatrix
 * -----------------------------------------------------------------------------
 * A reusable, accessible, responsive "evidence comparison by outcome" matrix for
 * two-compound comparison pages (e.g. Melatonin vs Magnesium).
 *
 * Design goals:
 *  - Single semantic <table> (no duplicated DOM) so screen readers get one clean
 *    reading. Proper <caption>, <th scope="col">, and <th scope="row"> headers.
 *  - Responsive: the table lives in a horizontally-scrollable, keyboard-focusable
 *    region with a sticky first column so the outcome label stays in view on small
 *    screens. The optional outcome filter lets mobile users isolate a single row
 *    instead of scrolling a wide grid.
 *  - Lightweight interactivity only (filter + sort) so it stays static-export
 *    friendly. No external dependencies.
 *  - Dark-mode aware via the site's global token overrides plus explicit dark:
 *    variants on the colored grade badges.
 */

export type EvidenceCell = {
  /** Leading grade label, e.g. "Strong", "Limited to Moderate", "Mixed / Context-dependent". */
  grade: string
  /** Prose summary of the key human findings for this cell. */
  findings: ReactNode
}

export type EvidenceMatrixRow = {
  /** Short outcome name, e.g. "Sleep Onset Latency". */
  outcome: string
  /** Optional clarifying subtitle shown under the outcome name. */
  outcomeNote?: string
  /** Evidence for entity A (first compound). */
  a: EvidenceCell
  /** Evidence for entity B (second compound). */
  b: EvidenceCell
  /** Combination / direct-comparison notes. */
  combo: ReactNode
  /** Certainty & practical implications. */
  certainty: ReactNode
}

export type EvidenceMatrixProps = {
  /** Accessible <caption> describing the table. */
  caption: string
  /** Display name of the first compound, e.g. "Melatonin". */
  entityA: string
  /** Display name of the second compound, e.g. "Magnesium". */
  entityB: string
  rows: EvidenceMatrixRow[]
  /** Optional id for deep-linking / aria-labelledby wiring. */
  id?: string
}

/**
 * Map the leading keyword of a grade string to a numeric strength used for sorting,
 * and to a Tailwind badge color set. Conservative grades (Limited/Mixed) rank lower.
 */
function gradeMeta(grade: string): { rank: number; badge: string } {
  const g = grade.toLowerCase()
  // Order matters: check the strongest qualifiers first.
  if (g.startsWith('strong')) {
    return { rank: 5, badge: 'bg-green-100 text-green-900 dark:bg-green-500/20 dark:text-green-200' }
  }
  if (g.includes('limited to moderate')) {
    return { rank: 2.5, badge: 'bg-amber-100 text-amber-900 dark:bg-amber-500/20 dark:text-amber-100' }
  }
  if (g.startsWith('moderate')) {
    return { rank: 4, badge: 'bg-emerald-100 text-emerald-900 dark:bg-emerald-500/20 dark:text-emerald-200' }
  }
  if (g.startsWith('generally favorable')) {
    return { rank: 4, badge: 'bg-emerald-100 text-emerald-900 dark:bg-emerald-500/20 dark:text-emerald-200' }
  }
  if (g.startsWith('mixed')) {
    return { rank: 2, badge: 'bg-slate-200 text-slate-800 dark:bg-slate-500/25 dark:text-slate-100' }
  }
  if (g.startsWith('limited')) {
    return { rank: 1.5, badge: 'bg-orange-100 text-orange-900 dark:bg-orange-500/20 dark:text-orange-100' }
  }
  return { rank: 3, badge: 'bg-stone-200 text-stone-800 dark:bg-stone-500/25 dark:text-stone-100' }
}

function GradeBadge({ grade }: { grade: string }) {
  const { badge } = gradeMeta(grade)
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold ${badge}`}
    >
      {grade}
    </span>
  )
}

type SortKey = 'default' | 'a' | 'b'

export default function EvidenceMatrix({
  caption,
  entityA,
  entityB,
  rows,
  id,
}: EvidenceMatrixProps) {
  const baseId = useId()
  const tableId = id ?? `evidence-matrix-${baseId}`
  const [outcomeFilter, setOutcomeFilter] = useState<string>('all')
  const [sortKey, setSortKey] = useState<SortKey>('default')

  const visibleRows = useMemo(() => {
    let next = rows
    if (outcomeFilter !== 'all') {
      next = next.filter((row) => row.outcome === outcomeFilter)
    }
    if (sortKey !== 'default') {
      // Sort by the strength of the selected compound's grade, strongest first.
      next = [...next].sort((x, y) => gradeMeta(y[sortKey].grade).rank - gradeMeta(x[sortKey].grade).rank)
    }
    return next
  }, [rows, outcomeFilter, sortKey])

  const controlClass =
    'rounded-lg border border-brand-900/15 bg-white/90 px-3 py-2 text-sm font-medium text-ink ' +
    'focus:outline-none focus:ring-2 focus:ring-brand-700/40 dark:bg-[var(--surface-card)]'

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap items-end gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor={`${tableId}-filter`} className="text-xs font-semibold text-ink">
            Filter by outcome
          </label>
          <select
            id={`${tableId}-filter`}
            className={controlClass}
            value={outcomeFilter}
            onChange={(event) => setOutcomeFilter(event.target.value)}
          >
            <option value="all">All outcomes</option>
            {rows.map((row) => (
              <option key={row.outcome} value={row.outcome}>
                {row.outcome}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor={`${tableId}-sort`} className="text-xs font-semibold text-ink">
            Sort by evidence strength
          </label>
          <select
            id={`${tableId}-sort`}
            className={controlClass}
            value={sortKey}
            onChange={(event) => setSortKey(event.target.value as SortKey)}
          >
            <option value="default">Default order</option>
            <option value="a">{entityA} grade (strongest first)</option>
            <option value="b">{entityB} grade (strongest first)</option>
          </select>
        </div>

        {(outcomeFilter !== 'all' || sortKey !== 'default') && (
          <button
            type="button"
            onClick={() => {
              setOutcomeFilter('all')
              setSortKey('default')
            }}
            className="rounded-lg border border-brand-900/15 px-3 py-2 text-sm font-semibold text-brand-800 hover:bg-white"
          >
            Reset
          </button>
        )}
      </div>

      {/* Live region announces filter/sort results to assistive tech. */}
      <p className="sr-only" role="status" aria-live="polite">
        Showing {visibleRows.length} of {rows.length} outcomes
        {sortKey === 'a' ? `, sorted by ${entityA} evidence strength` : ''}
        {sortKey === 'b' ? `, sorted by ${entityB} evidence strength` : ''}.
      </p>

      {/*
        Scrollable, keyboard-focusable region. tabindex + role=region + aria-label
        let keyboard users scroll the wide table on small screens (WCAG 2.1).
      */}
      <div
        role="region"
        aria-label={caption}
        // A focusable scroll container is the recommended WCAG technique for letting
        // keyboard users scroll a wide data table on small screens.
        // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
        tabIndex={0}
        className="overflow-x-auto rounded-2xl border border-brand-900/10 focus:outline-none focus:ring-2 focus:ring-brand-700/40"
      >
        <table id={tableId} className="w-full min-w-[920px] border-collapse text-left text-sm">
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr className="border-b border-black/10 bg-white/60 dark:bg-white/5">
              <th
                scope="col"
                className="sticky left-0 z-10 bg-white/95 px-4 py-3 font-semibold text-ink dark:bg-[var(--surface-card-strong)]"
              >
                Sleep Outcome
              </th>
              <th scope="col" className="px-4 py-3 font-semibold text-ink">
                {entityA} Evidence &amp; Key Findings
              </th>
              <th scope="col" className="px-4 py-3 font-semibold text-ink">
                {entityB} Evidence &amp; Key Findings
              </th>
              <th scope="col" className="px-4 py-3 font-semibold text-ink">
                Combo / Direct Comparison Notes
              </th>
              <th scope="col" className="px-4 py-3 font-semibold text-ink">
                Certainty &amp; Practical Implications
              </th>
            </tr>
          </thead>
          <tbody className="text-[#46574d]">
            {visibleRows.map((row) => (
              <tr key={row.outcome} className="border-b border-black/5 align-top last:border-0">
                <th
                  scope="row"
                  className="sticky left-0 z-10 bg-white/95 px-4 py-4 font-semibold text-ink dark:bg-[var(--surface-card-strong)]"
                >
                  {row.outcome}
                  {row.outcomeNote ? (
                    <span className="mt-1 block text-xs font-normal text-[#5c6b63]">
                      {row.outcomeNote}
                    </span>
                  ) : null}
                </th>
                <td className="px-4 py-4 leading-6">
                  <GradeBadge grade={row.a.grade} />
                  <span className="mt-2 block">{row.a.findings}</span>
                </td>
                <td className="px-4 py-4 leading-6">
                  <GradeBadge grade={row.b.grade} />
                  <span className="mt-2 block">{row.b.findings}</span>
                </td>
                <td className="px-4 py-4 leading-6">{row.combo}</td>
                <td className="px-4 py-4 leading-6">{row.certainty}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-[#5c6b63]">
        Tip: use the filters above to isolate a single outcome, or scroll the table
        horizontally on smaller screens (the outcome column stays pinned).
      </p>
    </div>
  )
}
