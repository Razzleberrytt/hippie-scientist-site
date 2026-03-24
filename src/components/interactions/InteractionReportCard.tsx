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

function FindingRow({ finding }: { finding: InteractionFinding }) {
  return (
    <article className='space-y-2 rounded-xl border border-white/10 bg-white/[0.03] p-4'>
      <div className='flex flex-wrap items-center gap-2'>
        <h3 className='text-base font-semibold text-white'>{finding.title}</h3>
        <span
          className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${severityClasses(finding.severity)}`}
        >
          {finding.severity}
        </span>
        <span className='rounded-full border border-white/15 bg-white/[0.04] px-2 py-0.5 text-[11px] uppercase tracking-wide text-white/75'>
          confidence: {finding.confidence}
        </span>
      </div>
      <p className='text-sm text-white/85'>{finding.summary}</p>
      {finding.evidenceBasis.length > 0 && (
        <ul className='list-disc space-y-1 pl-5 text-xs text-white/70'>
          {finding.evidenceBasis.slice(0, 8).map(entry => (
            <li key={`${finding.title}-${entry}`}>{entry}</li>
          ))}
        </ul>
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
        Run a check to see overlap signals and caution flags.
      </div>
    )
  }

  return (
    <section className='space-y-4 rounded-2xl border border-white/10 bg-black/35 p-5'>
      <div className='flex flex-wrap items-center gap-2'>
        <h2 className='text-xl font-semibold text-white'>Interaction Report</h2>
        <span
          className={`rounded-full border px-2.5 py-1 text-xs uppercase tracking-wide ${severityClasses(report.overallSeverity)}`}
        >
          overall severity: {report.overallSeverity}
        </span>
        <span className='rounded-full border border-white/15 bg-white/[0.04] px-2.5 py-1 text-xs uppercase tracking-wide text-white/75'>
          overall confidence: {report.overallConfidence}
        </span>
      </div>

      {report.findings.length === 0 ? (
        <p className='rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-white/80'>
          No strong structured interaction signals were detected from the current data.
        </p>
      ) : (
        <div className='space-y-3'>
          {report.findings.map(finding => (
            <FindingRow key={`${finding.title}-${finding.summary}`} finding={finding} />
          ))}
        </div>
      )}

      {report.dataLimited && (
        <p className='rounded-xl border border-amber-300/35 bg-amber-500/10 px-4 py-3 text-sm text-amber-100'>
          Some selections have limited safety data, so this result may be incomplete.
        </p>
      )}

      <ul className='list-disc space-y-1 pl-5 text-xs text-white/65'>
        {report.notes.map(note => (
          <li key={note}>{note}</li>
        ))}
      </ul>
    </section>
  )
}
