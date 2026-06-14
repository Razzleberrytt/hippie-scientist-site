import type { ReactNode } from 'react'

export interface ComparisonRow {
  attribute: string
  values: (string | ReactNode)[]
}

interface Props {
  headers: string[]
  rows: ComparisonRow[]
  caption?: string
}

export default function ComparisonTable({ headers, rows, caption }: Props) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-brand-900/10 shadow-sm">
      <table className="w-full text-sm">
        {caption && (
          <caption className="px-4 py-2 text-left text-xs text-muted italic">
            {caption}
          </caption>
        )}
        <thead>
          <tr className="border-b border-brand-900/10 bg-brand-50/50">
            {headers.map((h, i) => (
              <th
                key={i}
                className="whitespace-nowrap px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.12em] text-brand-700"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-brand-900/5 last:border-0 hover:bg-brand-50/30">
              <td className="whitespace-nowrap px-4 py-3 font-medium text-ink">
                {row.attribute}
              </td>
              {row.values.map((val, j) => (
                <td key={j} className="px-4 py-3 text-muted">
                  {val}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
