import type { ReactNode } from 'react'
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

function verdictClasses(verdict: string): string {
  if (verdict.toLowerCase().includes('avoid')) {
    return 'border-rose-300/45 bg-rose-500/15 text-rose-100'
  }
  if (verdict.toLowerCase().includes('caution')) {
    return 'border-amber-300/45 bg-amber-500/15 text-amber-100'
  }
  return 'border-emerald-300/40 bg-emerald-500/10 text-emerald-100'
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

function getSeverityVerdict(severity: InteractionSeverity): string {
  if (severity === 'high') return 'Avoid / high concern'
  if (severity === 'moderate') return 'Use caution'
  return 'Low concern'
}

function toTitleCase(value: string): string {
  return value.replace(/\b\w/g, char => char.toUpperCase())
}

function tightenCopy(text: string): string {
  return text
    .replace(/\bmay interact\b/gi, 'can overlap')
    .replace(/\bpossible interaction\b/gi, 'interaction signal')
}

function trimSentence(text: string, maxLength = 170): string {
  const normalized = text.replace(/\s+/g, ' ').trim()
  if (normalized.length <= maxLength) return normalized
  return `${normalized.slice(0, maxLength - 1).trimEnd()}…`
}

function buildWhyThisMatters(report: InteractionReport): string {
  const topSignals = report.keySignals
    .slice(0, 2)
    .map(signal => signal.split(' — ')[0].trim().toLowerCase())
    .filter(Boolean)
  const mechanisms = Array.from(
    new Set(
      report.findings
        .flatMap(finding => finding.overlappingMechanisms)
        .map(entry => entry.trim())
        .filter(Boolean)
    )
  ).slice(0, 2)

  if (topSignals.length === 0 && mechanisms.length === 0) {
    return 'The current dataset does not show a strong shared interaction pattern, but careful dosing and spacing still helps reduce avoidable risk.'
  }

  const signalSentence = topSignals.length
    ? `The strongest overlap signals here are ${topSignals.join(' and ')}.`
    : 'The report found overlap signals worth planning around.'

  const mechanismSentence = mechanisms.length
    ? `Shared mechanism clues (${mechanisms.map(toTitleCase).join(', ')}) suggest these effects can stack when used close together.`
    : 'The available mechanism clues suggest effects could stack when timing or doses are aggressive.'

  return `${signalSentence} ${mechanismSentence}`
}

function getWatchFors(report: InteractionReport): string[] {
  const context = [
    ...report.keySignals,
    ...report.findings.map(finding => finding.title),
    ...report.findings.flatMap(finding => finding.overlappingMechanisms),
  ]
    .join(' ')
    .toLowerCase()

  const watchFors: string[] = []

  if (/(sedative|cns-depressant|gabaergic)/.test(context)) {
    watchFors.push('Watch for drowsiness, slowed reaction time, and next-day grogginess.')
  }

  if (/(stimulant|cardioactive)/.test(context)) {
    watchFors.push('Watch for jitteriness, rapid heart rate, and sleep disruption.')
  }

  if (/serotonergic|serotonin/.test(context)) {
    watchFors.push('Watch for restlessness, sweating, and noticeable mood shifts.')
  }

  if (/maoi/.test(context)) {
    watchFors.push('Watch for stronger-than-expected effects from small dose changes.')
  }

  if (/hepatotoxic|liver/.test(context)) {
    watchFors.push(
      'Watch for signs of liver strain and avoid stacking with other liver-stressing agents.'
    )
  }

  return watchFors
}

function getSaferAlternatives(report: InteractionReport): string[] {
  return Array.from(
    new Set(
      report.findings
        .flatMap(finding => finding.saferAlternatives || [])
        .map(entry => entry.trim())
        .filter(Boolean)
    )
  ).slice(0, 6)
}

function FindingRow({ finding }: { finding: InteractionFinding }) {
  const basisLabel =
    finding.basis === 'structured'
      ? 'based on structured data'
      : finding.basis === 'mixed'
        ? 'based on structured + inferred signals'
        : 'based on inferred signals'

  return (
    <article className='space-y-3 rounded-xl border border-white/10 bg-white/[0.03] p-4 sm:p-5'>
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
      <p className='text-sm text-white/85'>{tightenCopy(finding.summary)}</p>
      <p className='rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white/80'>
        {tightenCopy(finding.explanation)}
      </p>
      <div className='rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white/85'>
        <p className='text-xs font-semibold uppercase tracking-wide text-white/65'>
          What this means
        </p>
        <p className='mt-1'>{tightenCopy(finding.whatThisMeans)}</p>
      </div>
      {finding.whatToWatchFor.length > 0 && (
        <div className='rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white/80'>
          <p className='text-xs font-semibold uppercase tracking-wide text-white/65'>
            What to watch for
          </p>
          <ul className='mt-1 list-disc space-y-1 pl-5'>
            {finding.whatToWatchFor.map(note => (
              <li key={`${finding.title}-${note}`}>{tightenCopy(note)}</li>
            ))}
          </ul>
        </div>
      )}
      {finding.saferAlternatives.length > 0 && (
        <div className='rounded-lg border border-emerald-300/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-100'>
          <p className='text-xs font-semibold uppercase tracking-wide text-emerald-200/90'>
            Safer alternatives
          </p>
          <ul className='mt-1 list-disc space-y-1 pl-5'>
            {finding.saferAlternatives.map(option => (
              <li key={`${finding.title}-${option}`}>{tightenCopy(option)}</li>
            ))}
          </ul>
        </div>
      )}
      <p className='text-xs text-white/70'>
        signal strength: shared tags {finding.sharedTagCount} · overlapping mechanisms{' '}
        {finding.overlappingMechanismCount} · known patterns {finding.knownPatternCount} · similar
        item pairs {finding.compoundSimilarityCount} · confidence score {finding.confidenceScore}
        /100
      </p>
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
  actions?: ReactNode
  footerPrompt?: string
  screenshotMode?: boolean
  onToggleScreenshotMode?: () => void
  onCopyShareCard?: () => void
  shareCopyStatus?: 'idle' | 'copied'
}

export default function InteractionReportCard({
  report,
  actions,
  footerPrompt,
  screenshotMode = false,
  onToggleScreenshotMode,
  onCopyShareCard,
  shareCopyStatus = 'idle',
}: InteractionReportCardProps) {
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
  const verdict = getSeverityVerdict(report.overallSeverity)
  const whyThisMatters = buildWhyThisMatters(report)
  const watchFors = getWatchFors(report)
  const saferAlternatives = getSaferAlternatives(report)
  const prioritizedSignals = report.keySignals.slice(0, 2)
  const secondarySignals = report.keySignals.slice(2)

  const shareWhy = trimSentence(
    tightenCopy(nonSparseFindings[0]?.explanation || report.summary || whyThisMatters)
  )

  const shareCard = (
    <article className='mx-auto w-full max-w-xl space-y-4 rounded-2xl border border-white/15 bg-gradient-to-b from-slate-950 to-black p-6 text-center shadow-[0_10px_40px_rgba(0,0,0,0.45)] sm:p-8'>
      <p className='text-xs uppercase tracking-[0.2em] text-white/55'>{report.items.join(' + ')}</p>
      <h3 className='text-3xl font-black leading-tight text-white sm:text-4xl'>{verdict}</h3>
      <div className='flex flex-wrap items-center justify-center gap-2'>
        <span
          className={`rounded-full border px-2.5 py-1 text-[11px] uppercase tracking-wide ${severityClasses(report.overallSeverity)}`}
        >
          severity: {report.overallSeverity}
        </span>
        <span
          className={`rounded-full border px-2.5 py-1 text-[11px] uppercase tracking-wide ${confidenceClasses(report.overallConfidence)}`}
        >
          confidence: {report.overallConfidence}
        </span>
        <span className='rounded-full border border-white/20 bg-black/25 px-2.5 py-1 text-[11px] uppercase tracking-wide text-white/80'>
          signals: {nonSparseFindings.length}
        </span>
      </div>

      {prioritizedSignals.length > 0 && (
        <ul className='space-y-2 text-left text-sm text-white/85'>
          {prioritizedSignals.map(signal => (
            <li
              key={signal}
              className='border-white/12 rounded-lg border bg-white/[0.03] px-3 py-2'
            >
              {tightenCopy(signal)}
            </li>
          ))}
        </ul>
      )}

      <p className='text-left text-sm leading-relaxed text-white/85'>
        <span className='font-semibold text-white'>Why this matters: </span>
        {shareWhy}
      </p>

      <div className='space-y-1 pt-1 text-xs text-white/55'>
        <p>
          {screenshotMode
            ? 'Run your own combination → thehippiescientist.net'
            : 'thehippiescientist.net'}
        </p>
        {!screenshotMode && <p>Check your own herb stack</p>}
      </div>
    </article>
  )

  if (screenshotMode) {
    return (
      <section className='rounded-2xl border border-white/10 bg-black/35 p-6 sm:p-8'>
        {shareCard}
      </section>
    )
  }

  return (
    <section className='space-y-5 rounded-2xl border border-white/10 bg-black/35 p-5 sm:p-6'>
      <div className='flex flex-wrap items-center justify-end gap-2'>
        {onCopyShareCard ? (
          <button
            type='button'
            onClick={onCopyShareCard}
            className='rounded-full border border-white/25 bg-white/[0.06] px-3 py-1.5 text-xs font-semibold text-white/90 transition hover:bg-white/[0.12]'
          >
            {shareCopyStatus === 'copied' ? 'Copied!' : 'Copy Share Card'}
          </button>
        ) : null}
        {onToggleScreenshotMode ? (
          <button
            type='button'
            onClick={onToggleScreenshotMode}
            className='rounded-full border border-white/25 bg-white/[0.06] px-3 py-1.5 text-xs font-semibold text-white/90 transition hover:bg-white/[0.12]'
          >
            Screenshot mode
          </button>
        ) : null}
      </div>

      {shareCard}

      <div className='flex flex-wrap items-start gap-2'>
        <div className='space-y-2'>
          <h2 className='text-xl font-semibold text-white'>Interaction Report</h2>
          <p className='text-lg font-bold text-white'>{report.verdict || verdict}</p>
        </div>
        <div className='flex flex-wrap gap-2'>
          <span
            className={`rounded-full border px-2.5 py-1 text-xs uppercase tracking-wide ${severityClasses(report.overallSeverity)}`}
          >
            {report.overallSeverity}
          </span>
          <span
            className={`rounded-full border px-2.5 py-1 text-xs uppercase tracking-wide ${confidenceClasses(report.overallConfidence)}`}
          >
            {report.overallConfidence} confidence ({report.overallConfidenceScore}/100)
          </span>
          <span className='rounded-full border border-white/20 bg-black/25 px-2.5 py-1 text-xs uppercase tracking-wide text-white/80'>
            {nonSparseFindings.length} signals
          </span>
        </div>
        {actions ? <div className='ml-auto flex flex-wrap gap-2'>{actions}</div> : null}
      </div>

      <div className={`rounded-xl border px-4 py-3 ${verdictClasses(report.verdict || verdict)}`}>
        <p className='text-xs uppercase tracking-wide opacity-85'>Verdict</p>
        <p className='text-lg font-semibold'>{report.verdict || verdict}</p>
      </div>

      <div className='rounded-xl border border-white/10 bg-white/[0.02] px-4 py-4 text-xs text-white/75'>
        <p className='mb-2 text-xs font-semibold uppercase tracking-wide text-white/70'>Summary</p>
        <p className='mb-2 text-sm text-white/85'>{tightenCopy(report.summary)}</p>
        <p className='text-sm text-white/85'>
          <span className='font-semibold text-white'>Why this matters: </span>
          {whyThisMatters}
        </p>
        <p className='mt-2'>
          <span className='font-semibold text-white/90'>Severity</span> estimates the strength of
          overlap/caution signals across your selected items.
        </p>
        <p className='mt-1'>
          <span className='font-semibold text-white/90'>Confidence</span> reflects confidence in the
          available structured mechanism/safety data, not certainty of outcomes.
        </p>
      </div>

      {prioritizedSignals.length > 0 && (
        <div className='rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-white/80'>
          <h3 className='mb-2 text-xs font-semibold uppercase tracking-wide text-white/70'>
            Why this combination was flagged
          </h3>
          <ul className='space-y-2'>
            {prioritizedSignals.map(signal => (
              <li
                key={signal}
                className='rounded-lg border border-white/15 bg-black/25 px-3 py-2 font-medium text-white'
              >
                {tightenCopy(signal)}
              </li>
            ))}
          </ul>
          {secondarySignals.length > 0 && (
            <details className='mt-3 rounded-lg border border-white/10 bg-black/20 p-3'>
              <summary className='cursor-pointer text-xs font-semibold uppercase tracking-wide text-white/75'>
                More details
              </summary>
              <ul className='mt-2 list-disc space-y-1 pl-5 text-sm text-white/75'>
                {secondarySignals.map(signal => (
                  <li key={signal}>{tightenCopy(signal)}</li>
                ))}
              </ul>
            </details>
          )}
        </div>
      )}

      {watchFors.length > 0 && (
        <div className='rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-white/80'>
          <h3 className='mb-2 text-xs font-semibold uppercase tracking-wide text-white/70'>
            What to watch for
          </h3>
          <ul className='list-disc space-y-1 pl-5'>
            {watchFors.map(note => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </div>
      )}

      {saferAlternatives.length > 0 && (
        <div className='rounded-xl border border-emerald-300/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100'>
          <h3 className='mb-2 text-xs font-semibold uppercase tracking-wide text-emerald-200/95'>
            Safer notes / cautions
          </h3>
          <ul className='list-disc space-y-1 pl-5'>
            {saferAlternatives.map(option => (
              <li key={option}>{tightenCopy(option)}</li>
            ))}
          </ul>
        </div>
      )}

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
          <li key={note}>{tightenCopy(note)}</li>
        ))}
      </ul>

      {footerPrompt ? <p className='text-sm text-white/70'>{footerPrompt}</p> : null}
    </section>
  )
}
