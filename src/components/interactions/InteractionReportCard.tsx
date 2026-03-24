import type {
  InteractionFinding,
  InteractionReport,
  InteractionSeverity,
} from '@/types/interactions'

function severityClasses(severity: InteractionSeverity): string {
  if (severity === 'high') return 'border-rose-300/50 bg-rose-500/15 text-rose-100'
  if (severity === 'moderate') return 'border-amber-300/50 bg-amber-500/15 text-amber-100'
  if (severity === 'low') return 'border-cyan-300/40 bg-cyan-500/10 text-cyan-100'
  return 'border-slate-300/30 bg-slate-500/10 text-slate-100'
}

function confidenceClasses(confidence: 'high' | 'medium' | 'low'): string {
  if (confidence === 'high') return 'border-emerald-300/50 bg-emerald-500/15 text-emerald-100'
  if (confidence === 'medium') return 'border-sky-300/45 bg-sky-500/10 text-sky-100'
  return 'border-slate-300/30 bg-slate-500/10 text-slate-100'
}

function humanizeEvidence(entry: string): string {
  return entry
    .replace(': effects mention', ' — effect signal')
    .replace(': mechanism mention', ' — mechanism signal')
    .replace(': contraindication mention', ' — contraindication signal')
    .replace(': interaction mention', ' — interaction signal')
    .replace(': safety mention', ' — safety signal')
    .replace(': category match', ' — category signal')
    .replace(': confidence tag', ' — confidence metadata signal')
    .replace(': limited structured fields', ' — limited structured data')
}

function FindingRow({ finding }: { finding: InteractionFinding }) {
  const basisLabel =
    finding.basis === 'structured'
      ? 'based on structured data'
      : finding.basis === 'mixed'
        ? 'based on structured + inferred signals'
        : 'based on inferred signals'

  return (
    <article className='space-y-2 rounded-xl border border-white/10 bg-white/[0.03] p-4'>
      <div className='flex flex-wrap items-center gap-2'>
        <h3 className='text-base font-semibold text-white'>{finding.title}</h3>
        <span
          className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${severityClasses(finding.severity)}`}
        >
          severity: {finding.severity}
        </span>
        <span
          className={`rounded-full border px-2 py-0.5 text-[11px] uppercase tracking-wide ${confidenceClasses(finding.confidence)}`}
        >
          confidence: {finding.confidence}
        </span>
        <span className='rounded-full border border-white/20 bg-black/25 px-2 py-0.5 text-[11px] uppercase tracking-wide text-white/80'>
          {basisLabel}
        </span>
      </div>
      <p className='text-sm text-white/85'>{finding.summary}</p>
      {finding.evidenceBasis.length > 0 && (
        <details className='rounded-lg border border-white/10 bg-black/20 p-3'>
          <summary className='cursor-pointer text-xs font-medium uppercase tracking-wide text-white/75'>
            Why this was flagged
          </summary>
          <ul className='mt-2 list-disc space-y-1 pl-5 text-xs text-white/70'>
            {finding.evidenceBasis.slice(0, 8).map(entry => (
              <li key={`${finding.title}-${entry}`}>{humanizeEvidence(entry)}</li>
            ))}
          </ul>
        </details>
      )}
    </article>
  )
}

type InteractionReportCardProps = {
  report: InteractionReport | null
}

export default function InteractionReportCard({ report }: InteractionReportCardProps) {
  if (!report) {
    return (
      <div className='rounded-2xl border border-dashed border-white/20 bg-white/[0.02] p-5 text-sm text-white/70'>
        Select 2-3 items, then run a check to see overlap signals and caution flags.
      </div>
    )
  }

  const nonSparseFindings = report.findings.filter(
    finding => finding.title !== 'Sparse data warning'
  )
  const sparseOnly = report.findings.length > 0 && nonSparseFindings.length === 0

  return (
    <section className='space-y-4 rounded-2xl border border-white/10 bg-black/35 p-5'>
      <div className='flex flex-wrap items-center gap-2'>
        <h2 className='text-xl font-semibold text-white'>Interaction Report</h2>
        <span
          className={`rounded-full border px-2.5 py-1 text-xs uppercase tracking-wide ${severityClasses(report.overallSeverity)}`}
        >
          overall severity: {report.overallSeverity}
        </span>
        <span
          className={`rounded-full border px-2.5 py-1 text-xs uppercase tracking-wide ${confidenceClasses(report.overallConfidence)}`}
        >
          overall confidence: {report.overallConfidence}
        </span>
      </div>

      <div className='rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-xs text-white/75'>
        <p>
          <span className='font-semibold text-white/90'>Severity</span> estimates the strength of
          overlap/caution signals across your selected items.
        </p>
        <p className='mt-1'>
          <span className='font-semibold text-white/90'>Confidence</span> reflects confidence in the
          available structured mechanism/safety data, not certainty of real-world outcomes.
        </p>
      </div>

      {report.dataLimited && (
        <p className='rounded-xl border border-amber-300/35 bg-amber-500/10 px-4 py-3 text-sm text-amber-100'>
          Data-limited result: one or more selected items are missing structured mechanism or safety
          fields, which lowers report reliability and may hide potential interactions.
        </p>
      )}

      {report.findings.length === 0 ? (
        <p className='rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-white/80'>
          No strong structured interaction signals were detected in the current dataset for this
          combination.
        </p>
      ) : sparseOnly ? (
        <p className='rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-white/80'>
          We could not identify a clear overlap signal, and the result is mostly limited by missing
          structured data.
        </p>
      ) : (
        <div className='space-y-3'>
          {nonSparseFindings.map(finding => (
            <FindingRow key={`${finding.title}-${finding.summary}`} finding={finding} />
          ))}
        </div>
      )}

      <ul className='list-disc space-y-1 pl-5 text-xs text-white/65'>
        {report.notes.map(note => (
          <li key={note}>{note}</li>
        ))}
      </ul>
    </section>
  )
}
