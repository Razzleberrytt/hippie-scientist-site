import type { CompareItem, EvidenceLevel } from '@/lib/compare'
import { evidenceLabelText, stimulationProfile } from '@/lib/compare'

interface CompareSummaryTableProps {
  item1: CompareItem
  item2: CompareItem
}

const EVIDENCE_RANK: Record<EvidenceLevel, number> = {
  strong: 5,
  moderate: 4,
  preliminary: 2,
  anecdotal: 1,
  unknown: 0,
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

type RowDef = {
  label: string
  v1: string
  v2: string
  winRule: 'higher' | 'evidence' | 'none'
}

export default function CompareSummaryTable({ item1, item2 }: CompareSummaryTableProps) {
  const ev1 = EVIDENCE_RANK[item1.evidenceLevel]
  const ev2 = EVIDENCE_RANK[item2.evidenceLevel]

  const rows: RowDef[] = [
    {
      label: 'Best for',
      v1: item1.primaryBenefits[0] ?? '—',
      v2: item2.primaryBenefits[0] ?? '—',
      winRule: 'higher',
    },
    {
      label: 'How it works',
      v1: item1.canonicalMechanisms[0] ?? '—',
      v2: item2.canonicalMechanisms[0] ?? '—',
      winRule: 'higher',
    },
    {
      label: 'Onset',
      v1: item1.onsetTime ?? 'Varies',
      v2: item2.onsetTime ?? 'Varies',
      winRule: 'none',
    },
    {
      label: 'Effective dose',
      v1: item1.typicalDose ?? '—',
      v2: item2.typicalDose ?? '—',
      winRule: 'higher',
    },
    {
      label: 'Evidence',
      v1: evidenceLabelText(item1.evidenceLevel),
      v2: evidenceLabelText(item2.evidenceLevel),
      winRule: 'evidence',
    },
    {
      label: 'Stimulation',
      v1: capitalize(stimulationProfile(item1)),
      v2: capitalize(stimulationProfile(item2)),
      winRule: 'none',
    },
    {
      label: 'Evidence grade',
      v1: item1.evidenceGrade ?? '—',
      v2: item2.evidenceGrade ?? '—',
      winRule: 'higher',
    },
    {
      label: 'Type',
      v1: item1.type === 'herb' ? 'Herb' : 'Compound',
      v2: item2.type === 'herb' ? 'Herb' : 'Compound',
      winRule: 'none',
    },
  ]

  function winner(row: RowDef): 0 | 1 | 2 {
    if (row.winRule === 'none') return 0
    if (row.winRule === 'evidence') {
      if (ev1 > ev2) return 1
      if (ev2 > ev1) return 2
      return 0
    }
    const has1 = row.v1 !== '—'
    const has2 = row.v2 !== '—'
    if (has1 && !has2) return 1
    if (has2 && !has1) return 2
    return 0
  }

  const highlightClass = 'bg-brand-50 font-semibold text-ink'

  return (
    <section aria-label="Comparison summary table">
      {/* Desktop / tablet: full table */}
      <div className="hidden sm:block overflow-x-auto rounded-card border border-brand-900/10 bg-white/80">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-brand-900/10 bg-paper-50">
              <th
                scope="col"
                className="py-3 px-4 text-left text-xs font-bold uppercase tracking-[0.13em] text-brand-700 w-1/4"
              >
                Factor
              </th>
              <th
                scope="col"
                className="py-3 px-4 text-left text-xs font-bold uppercase tracking-[0.13em] text-brand-700"
              >
                {item1.name}
              </th>
              <th
                scope="col"
                className="py-3 px-4 text-left text-xs font-bold uppercase tracking-[0.13em] text-brand-700"
              >
                {item2.name}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-900/10 text-muted">
            {rows.map((row) => {
              const win = winner(row)
              return (
                <tr
                  key={row.label}
                  className="hover:bg-paper-50 transition-colors duration-150 align-top"
                >
                  <td className="py-3 px-4 text-xs font-bold uppercase tracking-[0.11em] text-brand-700">
                    {row.label}
                  </td>
                  <td className={`py-3 px-4 leading-relaxed ${win === 1 ? highlightClass : ''}`}>
                    {row.v1}
                  </td>
                  <td className={`py-3 px-4 leading-relaxed ${win === 2 ? highlightClass : ''}`}>
                    {row.v2}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile: 3-col grid per row */}
      <div className="sm:hidden rounded-card border border-brand-900/10 bg-white/80 overflow-hidden">
        <div className="grid grid-cols-3 gap-0 border-b border-brand-900/10 bg-paper-50 px-3 py-2">
          <span className="text-[0.65rem] font-bold uppercase tracking-[0.13em] text-brand-700" />
          <span className="text-[0.65rem] font-bold uppercase tracking-[0.13em] text-brand-700 text-center">
            {item1.name}
          </span>
          <span className="text-[0.65rem] font-bold uppercase tracking-[0.13em] text-brand-700 text-center">
            {item2.name}
          </span>
        </div>

        {rows.map((row, i) => {
          const win = winner(row)
          return (
            <div
              key={row.label}
              className={`grid grid-cols-3 gap-0 px-3 py-2.5 text-xs items-start ${
                i < rows.length - 1 ? 'border-b border-brand-900/10' : ''
              }`}
            >
              <span className="font-bold uppercase tracking-[0.1em] text-brand-700 leading-snug pr-2">
                {row.label}
              </span>
              <span className={`leading-snug pr-1 text-center ${win === 1 ? 'font-semibold text-ink' : 'text-muted'}`}>
                {row.v1}
              </span>
              <span className={`leading-snug text-center ${win === 2 ? 'font-semibold text-ink' : 'text-muted'}`}>
                {row.v2}
              </span>
            </div>
          )
        })}
      </div>
    </section>
  )
}
