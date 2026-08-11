import type { CompareItem, EvidenceLevel } from '@/lib/compare'
import { evidenceLabelText, stimulationProfile } from '@/lib/compare'
import ResponsiveTable from '@/components/ui/ResponsiveTable'

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
  winRule: 'evidence' | 'none'
}

export default function CompareSummaryTable({ item1, item2 }: CompareSummaryTableProps) {
  const ev1 = EVIDENCE_RANK[item1.evidenceLevel]
  const ev2 = EVIDENCE_RANK[item2.evidenceLevel]
  const tableLabel = `${item1.name} and ${item2.name} comparison summary`

  const rows: RowDef[] = [
    {
      label: 'Primary profile focus',
      v1: item1.primaryBenefits[0] ?? 'Not reported',
      v2: item2.primaryBenefits[0] ?? 'Not reported',
      winRule: 'none',
    },
    {
      label: 'Mechanism signal',
      v1: item1.canonicalMechanisms[0] ?? item1.mechanisms[0] ?? 'Not reported',
      v2: item2.canonicalMechanisms[0] ?? item2.mechanisms[0] ?? 'Not reported',
      winRule: 'none',
    },
    {
      label: 'Onset in source data',
      v1: item1.onsetTime ?? 'Not reported',
      v2: item2.onsetTime ?? 'Not reported',
      winRule: 'none',
    },
    {
      label: 'Dose / form in source data',
      v1: item1.typicalDose ?? 'Not reported',
      v2: item2.typicalDose ?? 'Not reported',
      winRule: 'none',
    },
    {
      label: 'Evidence signal',
      v1: evidenceLabelText(item1.evidenceLevel),
      v2: evidenceLabelText(item2.evidenceLevel),
      winRule: 'evidence',
    },
    {
      label: 'Stimulation profile',
      v1: capitalize(stimulationProfile(item1)),
      v2: capitalize(stimulationProfile(item2)),
      winRule: 'none',
    },
    {
      label: 'Evidence grade',
      v1: item1.evidenceGrade ?? 'Not reported',
      v2: item2.evidenceGrade ?? 'Not reported',
      winRule: 'none',
    },
    {
      label: 'Type',
      v1: item1.type === 'herb' ? 'Herb' : 'Compound',
      v2: item2.type === 'herb' ? 'Herb' : 'Compound',
      winRule: 'none',
    },
  ]

  function winner(row: RowDef): 0 | 1 | 2 {
    if (row.winRule !== 'evidence') return 0
    if (ev1 > ev2) return 1
    if (ev2 > ev1) return 2
    return 0
  }

  const highlightClass = 'bg-brand-50 font-semibold text-ink'

  return (
    <section aria-labelledby="compare-summary-heading" className="space-y-4">
      <div className="max-w-3xl space-y-1">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-700">
          Decision snapshot
        </p>
        <h2 id="compare-summary-heading" className="text-2xl font-semibold tracking-tight text-ink">
          Scan the core tradeoffs first
        </h2>
        <p className="text-sm leading-6 text-muted">
          Use this table to see what the source data actually report before digging into the full evidence and safety sections. A stronger evidence signal does not automatically mean a better fit for every outcome.
        </p>
      </div>

      {/* Desktop / tablet: semantic table with keyboard-reachable horizontal overflow. */}
      <ResponsiveTable
        label={tableLabel}
        showTitle={false}
        className="hidden rounded-card border border-brand-900/10 bg-white/80 sm:block"
      >
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <caption className="sr-only">
            Core tradeoffs between {item1.name} and {item2.name}, including profile focus, mechanism, timing, evidence, dose or form data, and type.
          </caption>
          <thead>
            <tr className="border-b border-brand-900/10 bg-paper-50">
              <th
                scope="col"
                className="w-1/4 px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.13em] text-brand-700"
              >
                Factor
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.13em] text-brand-700"
              >
                {item1.name}
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.13em] text-brand-700"
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
                  className="align-top transition-colors duration-150 hover:bg-paper-50"
                >
                  <th
                    scope="row"
                    className="px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.11em] text-brand-700"
                  >
                    {row.label}
                  </th>
                  <td className={`px-4 py-3 leading-relaxed ${win === 1 ? highlightClass : ''}`}>
                    {row.v1}
                  </td>
                  <td className={`px-4 py-3 leading-relaxed ${win === 2 ? highlightClass : ''}`}>
                    {row.v2}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </ResponsiveTable>

      {/* Mobile: preserve the compact visual grid while exposing real table semantics. */}
      <div
        role="table"
        aria-label={tableLabel}
        className="overflow-hidden rounded-card border border-brand-900/10 bg-white/80 sm:hidden"
      >
        <div role="row" className="grid grid-cols-3 gap-0 border-b border-brand-900/10 bg-paper-50 px-3 py-2">
          <span role="columnheader" className="text-[0.65rem] font-bold uppercase tracking-[0.13em] text-brand-700">
            <span className="sr-only">Factor</span>
          </span>
          <span role="columnheader" className="text-center text-[0.65rem] font-bold uppercase tracking-[0.13em] text-brand-700">
            {item1.name}
          </span>
          <span role="columnheader" className="text-center text-[0.65rem] font-bold uppercase tracking-[0.13em] text-brand-700">
            {item2.name}
          </span>
        </div>

        {rows.map((row, i) => {
          const win = winner(row)
          return (
            <div
              role="row"
              key={row.label}
              className={`grid grid-cols-3 items-start gap-0 px-3 py-2.5 text-xs ${
                i < rows.length - 1 ? 'border-b border-brand-900/10' : ''
              }`}
            >
              <span role="rowheader" className="pr-2 font-bold uppercase leading-snug tracking-[0.1em] text-brand-700">
                {row.label}
              </span>
              <span role="cell" className={`pr-1 text-center leading-snug ${win === 1 ? 'font-semibold text-ink' : 'text-muted'}`}>
                {row.v1}
              </span>
              <span role="cell" className={`text-center leading-snug ${win === 2 ? 'font-semibold text-ink' : 'text-muted'}`}>
                {row.v2}
              </span>
            </div>
          )
        })}
      </div>
    </section>
  )
}
