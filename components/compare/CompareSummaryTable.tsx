import type { CompareItem } from '@/lib/compare'

interface CompareSummaryTableProps {
  item1: CompareItem
  item2: CompareItem
}

type ComparisonRow = {
  label: string
  val1: string
  val2: string
  show: boolean
}

export default function CompareSummaryTable({ item1, item2 }: CompareSummaryTableProps) {
  // Format fields conservatively
  const formatList = (arr?: string[]) => (arr && arr.length > 0 ? arr.join(', ') : '')

  const rows: ComparisonRow[] = [
    {
      label: 'Best for',
      val1: formatList(item1.primaryBenefits),
      val2: formatList(item2.primaryBenefits),
      show: Boolean(item1.primaryBenefits.length || item2.primaryBenefits.length),
    },
    {
      label: 'How it works',
      val1: formatList(item1.mechanisms),
      val2: formatList(item2.mechanisms),
      show: Boolean(item1.mechanisms.length || item2.mechanisms.length),
    },
    {
      label: 'Typical dose',
      val1: item1.typicalDose || '',
      val2: item2.typicalDose || '',
      show: Boolean(item1.typicalDose || item2.typicalDose),
    },
    {
      label: 'Onset time',
      val1: item1.onsetTime || '',
      val2: item2.onsetTime || '',
      show: Boolean(item1.onsetTime || item2.onsetTime),
    },
    {
      label: 'Best timing',
      val1: item1.bestTiming || '',
      val2: item2.bestTiming || '',
      show: Boolean(item1.bestTiming || item2.bestTiming),
    },
    {
      label: 'Evidence level',
      val1: item1.evidenceLevel || '',
      val2: item2.evidenceLevel || '',
      show: Boolean(item1.evidenceLevel || item2.evidenceLevel),
    },
    {
      label: 'Safety grade',
      val1: item1.safetyGrade || '',
      val2: item2.safetyGrade || '',
      show: Boolean(item1.safetyGrade || item2.safetyGrade),
    },
    {
      label: 'Key cautions',
      val1: formatList(item1.contraindications || item1.keyInteractions),
      val2: formatList(item2.contraindications || item2.keyInteractions),
      show: Boolean(
        (item1.contraindications?.length || item1.keyInteractions?.length) ||
        (item2.contraindications?.length || item2.keyInteractions?.length)
      ),
    },
  ]

  const activeRows = rows.filter((r) => r.show)

  return (
    <section className="card-premium p-6 space-y-5 max-w-5xl">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-700">Quick Reference</p>
        <h2 className="text-2xl font-semibold tracking-tight text-ink mt-1">
          Comparison Summary
        </h2>
      </div>

      {/* Desktop / Tablet Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm text-left border-collapse">
          <thead>
            <tr className="border-b border-brand-900/10 text-ink">
              <th className="py-3 px-4 font-semibold w-1/4">Factor</th>
              <th className="py-3 px-4 font-semibold w-3/8">{item1.name}</th>
              <th className="py-3 px-4 font-semibold w-3/8">{item2.name}</th>
            </tr>
          </thead>
          <tbody className="text-muted divide-y divide-brand-900/10">
            {activeRows.map((row) => (
              <tr key={row.label} className="hover:bg-brand-50/20 transition-colors duration-150">
                <td className="py-3 px-4 font-medium text-ink">{row.label}</td>
                <td className="py-3 px-4 whitespace-pre-wrap">{row.val1 || '—'}</td>
                <td className="py-3 px-4 whitespace-pre-wrap">{row.val2 || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Stacked View */}
      <div className="block md:hidden space-y-6">
        {activeRows.map((row) => (
          <div key={row.label} className="border-b border-brand-900/10 pb-4 last:border-0 last:pb-0 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-ink">
              {row.label}
            </h3>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <p className="font-semibold text-brand-700">{item1.name}</p>
                <p className="text-muted leading-relaxed">{row.val1 || '—'}</p>
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-brand-700">{item2.name}</p>
                <p className="text-muted leading-relaxed">{row.val2 || '—'}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
