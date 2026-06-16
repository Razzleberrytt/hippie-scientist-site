import type { ReactNode } from 'react'

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

  return (
    <div className={`space-y-3 ${className}`}>
      {title ? (
        <h3 className="max-w-none text-lg font-semibold tracking-tight text-ink">
          {title}
        </h3>
      ) : null}

      <div
        role="region"
        aria-label={accessibleLabel}
        className="hidden overflow-x-auto rounded-xl border border-brand-900/10 bg-white/90 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-700/30 dark:bg-[var(--surface-card)] sm:block"
      >
        <table className="min-w-[680px] w-full text-sm">
          {caption && (
            <caption className="px-4 py-2 text-left text-xs italic text-muted">
              {caption}
            </caption>
          )}
          <thead>
            <tr className="border-b border-brand-900/10 bg-brand-50/50 dark:bg-brand-100/40">
              {tableHeaders.map((header, index) => (
                <th
                  key={`${header}-${index}`}
                  scope="col"
                  className="whitespace-nowrap px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.12em] text-brand-700"
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
                className="border-b border-brand-900/5 align-top last:border-0 hover:bg-brand-50/30 dark:hover:bg-brand-100/30"
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
      </div>

      <div className="grid gap-3 sm:hidden">
        {normalizedRows.map((row, rowIndex) => (
          <div
            key={`${getRowLabel(row)}-mobile-${rowIndex}`}
            className="rounded-xl border border-brand-900/10 bg-white/90 p-4 shadow-sm dark:bg-[var(--surface-card)]"
          >
            <p className="text-sm font-semibold text-ink">{getRowLabel(row)}</p>
            <dl className="mt-3 space-y-2">
              {row.values.map((value, colIndex) => (
                <div key={colIndex} className="grid gap-1 border-t border-brand-900/5 pt-2">
                  <dt className="text-[0.68rem] font-bold uppercase tracking-[0.12em] text-brand-700">
                    {valueHeaders[colIndex] || `Value ${colIndex + 1}`}
                  </dt>
                  <dd className="text-sm leading-6 text-muted">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ComparisonTable
