export interface DosageRow {
  form: string
  range: string
  notes?: string
}

interface Props {
  rows: DosageRow[]
  disclaimer?: string
}

export default function DosageBox({ rows, disclaimer }: Props) {
  return (
    <div className="overflow-hidden rounded-2xl border border-brand-900/10 bg-white/90 shadow-sm">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-brand-900/10 bg-brand-50/50">
            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.12em] text-brand-700">
              Form
            </th>
            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.12em] text-brand-700">
              Typical Range
            </th>
            <th className="hidden sm:table-cell px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.12em] text-brand-700">
              Notes
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-brand-900/5 last:border-0 hover:bg-brand-50/30">
              <td className="px-4 py-3 font-medium text-ink">{row.form}</td>
              <td className="px-4 py-3 text-muted">{row.range}</td>
              <td className="hidden sm:table-cell px-4 py-3 text-xs text-muted">
                {row.notes ?? '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {disclaimer && (
        <p className="border-t border-brand-900/5 px-4 py-2 text-xs text-muted">
          {disclaimer}
        </p>
      )}
    </div>
  )
}
