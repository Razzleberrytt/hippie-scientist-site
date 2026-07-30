import ResponsiveTable from '@/components/ui/ResponsiveTable'

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
    <div className="space-y-3">
      <ResponsiveTable
        label="Dosage and form reference"
        className="!my-0 rounded-2xl border border-brand-900/10 shadow-sm"
      >
        <table className="w-full min-w-[640px] text-sm">
          <caption className="sr-only">Dosage and form reference</caption>
          <thead>
            <tr className="border-b border-brand-900/10 bg-brand-50/50">
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.12em] text-brand-700"
              >
                Form
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.12em] text-brand-700"
              >
                Typical Range
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.12em] text-brand-700"
              >
                Notes
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-b border-brand-900/5 last:border-0 hover:bg-brand-50/30">
                <th scope="row" className="px-4 py-3 text-left font-medium text-ink">
                  {row.form}
                </th>
                <td className="px-4 py-3 text-muted">{row.range}</td>
                <td className="px-4 py-3 text-xs text-muted">{row.notes ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </ResponsiveTable>
      {disclaimer && (
        <p className="px-1 text-xs leading-5 text-muted">{disclaimer}</p>
      )}
    </div>
  )
}
