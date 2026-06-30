import type { RuntimeRecord } from '../../src/types/content'
import { getEvidenceStrengthData } from '@/lib/evidence-strength'

interface EvidenceStrengthBlockProps {
  record: RuntimeRecord
  displayName: string
  evidenceLimitations?: string[]
  researchMaturity?: string
  researchStyle?: string
}

export default function EvidenceStrengthBlock({
  record,
  displayName,
  evidenceLimitations = [],
  researchMaturity,
  researchStyle,
}: EvidenceStrengthBlockProps) {
  const ev = getEvidenceStrengthData(record)

  return (
    <div className="space-y-4">
      {/* Strength score + labeled bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <span className={`text-sm font-semibold ${ev.textColorClass}`}>{ev.label}</span>
          <span className="text-[11px] text-muted tabular-nums">{ev.score}/100</span>
        </div>
        <div
          role="meter"
          aria-valuenow={ev.score}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Evidence strength: ${ev.score} out of 100 — ${ev.label}`}
          className="h-2 overflow-hidden rounded-full bg-neutral-100"
        >
          <div
            aria-hidden="true"
            className={`h-full rounded-full transition-all duration-700 ${ev.barColorClass}`}
            style={{ width: `${ev.score}%` }}
          />
        </div>
      </div>

      {/* Human vs preclinical source indicators — the key transparency signal */}
      <div className="flex flex-wrap gap-2" role="group" aria-label="Evidence source types for this herb">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${
            ev.humanEvidence
              ? 'border-emerald-700/20 bg-emerald-50 text-emerald-800'
              : 'border-stone-300/40 bg-stone-50 text-stone-500'
          }`}
          aria-label={`Human clinical trials: ${ev.humanEvidence ? 'documented' : 'not documented'}`}
        >
          <span aria-hidden="true">{ev.humanEvidence ? '✓' : '—'}</span>
          Human clinical trials
        </span>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${
            ev.mechanismEvidence
              ? 'border-blue-700/20 bg-blue-50 text-blue-800'
              : 'border-stone-300/40 bg-stone-50 text-stone-500'
          }`}
          aria-label={`Preclinical or mechanistic evidence: ${ev.mechanismEvidence ? 'documented' : 'not documented'}`}
        >
          <span aria-hidden="true">{ev.mechanismEvidence ? '✓' : '—'}</span>
          Preclinical / mechanistic
        </span>
      </div>

      {/* Confidence explanation text */}
      <p className="text-sm leading-6 text-muted">{ev.explanation}</p>

      {/* Research profile line */}
      {(researchMaturity || researchStyle) && (
        <p className="text-sm leading-6 text-muted">
          {displayName} is categorized as{' '}
          <strong>{researchMaturity?.toLowerCase()}</strong>
          {researchStyle ? (
            <> with a <strong>{researchStyle.toLowerCase()}</strong> evidence style</>
          ) : null}
          .
        </p>
      )}

      {/* Evidence caveats: shown when human evidence is absent or score is downgraded */}
      {ev.downgradeReasons.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50/70 px-4 py-3 space-y-1.5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
            Evidence caveats
          </p>
          {/* eslint-disable-next-line jsx-a11y/no-redundant-roles -- explicit list role restores semantics dropped by Safari/VoiceOver when list-style is removed */}
          <ul className="space-y-1" role="list">
            {ev.downgradeReasons.map((reason) => (
              <li key={reason} className="flex items-start gap-2 text-xs text-amber-900">
                <span aria-hidden="true" className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-amber-600" />
                {reason}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Evidence limitations — collapsible to keep the section scannable */}
      {evidenceLimitations.length > 0 && (
        <details className="group">
          <summary className="flex cursor-pointer list-none items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted select-none transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700/40 focus-visible:rounded">
            <span
              aria-hidden="true"
              className="inline-block text-brand-500 transition-transform duration-200 group-open:rotate-90"
            >
              ▶
            </span>
            Evidence limitations ({evidenceLimitations.length})
          </summary>
          {/* eslint-disable-next-line jsx-a11y/no-redundant-roles -- explicit list role restores semantics dropped by Safari/VoiceOver when list-style is removed */}
          <ul className="mt-2 space-y-1.5 pl-4" role="list">
            {evidenceLimitations.map((item) => (
              <li key={item} className="flex items-start gap-2 text-xs text-muted">
                <span aria-hidden="true" className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-amber-400" />
                {item}
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  )
}
