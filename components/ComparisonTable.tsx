import type { ReactNode } from 'react'
import ResponsiveTable from '@/components/ui/ResponsiveTable'

export interface ComparisonRow {
  attribute?: string
  label?: string
  values: (string | ReactNode)[]
}

interface Props {
  headers: string[]
  rows?: ComparisonRow[]
  data?: ComparisonRow[]
  title?: string
  caption?: string
  className?: string
}

function getRowLabel(row: ComparisonRow) {
  return row.label || row.attribute || ''
}

export function ComparisonTable({
  headers,
  rows,
  data,
  title,
  caption,
  className = '',
}: Props) {
  const normalizedRows = data || rows || []
  const firstRow = normalizedRows[0]
  const headersIncludeLabel = firstRow ? headers.length === firstRow.values.length + 1 : true
  const tableHeaders = headersIncludeLabel ? headers : ['Comparison', ...headers]
  const valueHeaders = headersIncludeLabel ? headers.slice(1) : headers
  const accessibleLabel = title || caption || 'Comparison table'
  const tableCaption = caption || accessibleLabel

  return (
    <div className={`space-y-3 ${className}`}>
      {title ? (
        <h3 className="max-w-none text-lg font-semibold tracking-tight text-ink">
          {title}
        </h3>
      ) : null}

      <ResponsiveTable label={accessibleLabel} className="hidden sm:block" showTitle={!title}>
        <table className="min-w-[680px] w-full text-sm">
          <caption className="sr-only">{tableCaption}</caption>
          <thead>
            <tr className="border-b border-brand-900/10 bg-brand-50/50 dark:border-white/10 dark:bg-[var(--surface-subtle)]">
              {tableHeaders.map((header, index) => (
                <th
                  key={`${header}-${index}`}
                  scope="col"
                  className="whitespace-nowrap px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.12em] text-brand-700 dark:text-[var(--accent-teal)]"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {normalizedRows.map((row, rowIndex) => (
              <tr
                key={`${getRowLabel(row)}-${rowIndex}`}
                className="border-b border-brand-900/5 align-top last:border-0 hover:bg-brand-50/30 dark:border-white/10 dark:hover:bg-[var(--surface-subtle)]"
              >
                <th scope="row" className="whitespace-nowrap px-4 py-3 text-left font-semibold text-ink">
                  {getRowLabel(row)}
                </th>
                {row.values.map((value, colIndex) => (
                  <td key={colIndex} className="px-4 py-3 leading-6 text-muted">
                    {value}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </ResponsiveTable>

      <div
        className="grid gap-3 sm:hidden"
        role="group"
        aria-label={`${accessibleLabel}, stacked comparison cards`}
        data-mobile-comparison-cards="true"
      >
        {valueHeaders.map((header, colIndex) => (
          <section
            key={`${header}-${colIndex}`}
            className="overflow-hidden rounded-2xl border border-brand-900/10 bg-[var(--surface-card)] shadow-[0_12px_30px_-24px_rgba(29,29,31,0.38)] dark:border-white/10"
          >
            <div className="flex min-h-12 items-center justify-between gap-3 border-b border-brand-900/10 bg-brand-50/55 px-4 py-3 dark:border-white/10 dark:bg-[var(--surface-subtle)]">
              <h4 className="text-base font-bold leading-5 text-ink">{header || `Option ${colIndex + 1}`}</h4>
              <span className="shrink-0 text-[0.62rem] font-bold uppercase tracking-[0.12em] text-muted">
                {colIndex + 1} of {valueHeaders.length}
              </span>
            </div>
            <dl className="divide-y divide-brand-900/5 px-4 dark:divide-white/10">
              {normalizedRows.map((row, rowIndex) => (
                <div key={`${getRowLabel(row)}-${rowIndex}`} className="grid gap-1 py-3 first:pt-3 last:pb-3">
                  <dt className="text-[0.66rem] font-bold uppercase tracking-[0.1em] text-brand-700 dark:text-[var(--accent-teal)]">
                    {getRowLabel(row) || `Measure ${rowIndex + 1}`}
                  </dt>
                  <dd className="text-sm leading-6 text-muted">
                    {row.values[colIndex] ?? '—'}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>
    </div>
  )
}

export default ComparisonTable
