import Link from 'next/link'
import type { EvidenceStrengthData } from '@/lib/evidence-strength'

type Props = {
  data: EvidenceStrengthData
}

export default function EvidenceMeterDetail({ data }: Props) {
  return (
    <div className="mt-3 space-y-3 text-sm">
      <p className="leading-6 text-muted">{data.explanation}</p>

      <div className="flex flex-wrap gap-2">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${
            data.humanEvidence
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-200/20 dark:bg-emerald-300/10 dark:text-emerald-100'
              : 'border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-200/20 dark:bg-slate-300/10 dark:text-slate-100'
          }`}
          aria-label={data.humanEvidence ? 'Human trial evidence present' : 'No human trial evidence'}
        >
          <span aria-hidden="true">{data.humanEvidence ? '✓' : '–'}</span>
          Human trials
        </span>

        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${
            data.mechanismEvidence
              ? 'border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-200/20 dark:bg-blue-300/10 dark:text-blue-100'
              : 'border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-200/20 dark:bg-slate-300/10 dark:text-slate-100'
          }`}
          aria-label={data.mechanismEvidence ? 'Mechanistic evidence present' : 'No mechanistic evidence'}
        >
          <span aria-hidden="true">{data.mechanismEvidence ? '✓' : '–'}</span>
          Mechanism evidence
        </span>

        <span
          className="inline-flex items-center rounded-full border border-brand-900/10 bg-white/80 px-2.5 py-1 text-xs font-semibold text-muted dark:border-white/10 dark:bg-white/5"
          aria-label={`Evidence grade: ${data.grade}`}
        >
          Grade {data.grade}
        </span>
      </div>

      {data.downgradeReasons.length > 0 && (
        <div className="rounded-[0.65rem] border border-amber-200 bg-amber-50/70 p-3 dark:border-amber-200/20 dark:bg-amber-300/10">
          <p className="text-[0.64rem] font-bold uppercase tracking-[0.09em] text-amber-800 dark:text-amber-100">
            Limitations
          </p>
          <ul className="mt-1.5 space-y-1">
            {data.downgradeReasons.map((reason) => (
              <li key={reason} className="text-xs leading-5 text-amber-900 dark:text-amber-100/90">
                {reason}
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="text-[0.68rem] leading-5 text-muted">
        Evidence ratings are editorial assessments based on available published research. They are
        not medical recommendations.{' '}
        <Link
          href="/education/evidence-hierarchy"
          className="font-semibold text-brand-700 underline underline-offset-2 hover:text-brand-800 focus:outline-none focus-visible:ring-1 focus-visible:ring-brand-700 dark:text-brand-100 dark:hover:text-white"
        >
          How we rate evidence →
        </Link>
      </p>
    </div>
  )
}
