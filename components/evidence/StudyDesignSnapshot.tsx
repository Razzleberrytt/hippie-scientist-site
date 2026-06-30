import type { ReactNode } from 'react'

/**
 * StudyDesignSnapshot
 *
 * A reusable, accessible evidence-transparency block designed for clean
 * embedding inside structured `content/learn/` MDX files (and any server or
 * client page). It keeps the practical takeaway prominent while tucking the
 * "why" — grade rationale, clinical trial design factors, and limitations —
 * into a native, keyboard-accessible disclosure that also works without JS.
 *
 * The component holds **no study data of its own**: every fact is passed in via
 * props, so it is safe to reuse across profiles, goals, and education content.
 *
 * Minimal usage (MDX):
 *   <StudyDesignSnapshot
 *     grade="Moderate"
 *     summary="A few small human trials suggest a real but modest effect."
 *   />
 *
 * Fuller usage:
 *   <StudyDesignSnapshot
 *     grade="Moderate"
 *     gradeRationale="Several randomized trials, but small and short."
 *     summary="..."
 *     studyType="Randomized, double-blind, placebo-controlled"
 *     participants="~60 adults per trial"
 *     duration="6–8 weeks"
 *     limitations={["Small samples", "Often manufacturer-funded"]}
 *   />
 */

export type StudyEvidenceGrade =
  | 'Strong'
  | 'Moderate'
  | 'Limited'
  | 'Preliminary'
  | 'Educational'

export interface StudyDesignFactor {
  label: string
  value: ReactNode
}

export interface StudyDesignSource {
  label: string
  href?: string
}

export interface StudyDesignSnapshotProps {
  /** The prominent, always-visible practical takeaway. */
  summary: ReactNode
  /** Evidence grade assigned to the claim. */
  grade?: StudyEvidenceGrade
  /** Plain-language explanation of *why* the grade was assigned. */
  gradeRationale?: ReactNode
  /** e.g. "Randomized, double-blind, placebo-controlled". */
  studyType?: string
  /** Convenience design factors — rendered if provided. */
  participants?: string
  duration?: string
  population?: string
  blinding?: string
  comparator?: string
  dosing?: string
  /** Additional / custom design factors appended after the convenience ones. */
  design?: StudyDesignFactor[]
  /** Transparency about what the evidence does not establish. */
  limitations?: string[]
  /** Extra interpretive context. */
  context?: ReactNode
  /** Optional citations (kept generic — pass real references per use). */
  sources?: StudyDesignSource[]
  /** Open the disclosure by default. */
  defaultOpen?: boolean
  /** Heading shown above the summary. */
  title?: string
}

const GRADE_STYLES: Record<StudyEvidenceGrade, string> = {
  Strong: 'border-emerald-300 bg-emerald-100 text-emerald-900',
  Moderate: 'border-blue-300 bg-blue-100 text-blue-900',
  Limited: 'border-amber-300 bg-amber-100 text-amber-900',
  Preliminary: 'border-stone-300 bg-stone-100 text-stone-700',
  Educational: 'border-violet-300 bg-violet-100 text-violet-900',
}

function GradePill({ grade }: { grade: StudyEvidenceGrade }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold tracking-wide ${GRADE_STYLES[grade]}`}
    >
      Evidence grade: {grade}
    </span>
  )
}

export default function StudyDesignSnapshot({
  summary,
  grade,
  gradeRationale,
  studyType,
  participants,
  duration,
  population,
  blinding,
  comparator,
  dosing,
  design,
  limitations,
  context,
  sources,
  defaultOpen = false,
  title = 'Study design snapshot',
}: StudyDesignSnapshotProps) {
  const factors: StudyDesignFactor[] = [
    studyType ? { label: 'Study type', value: studyType } : null,
    population ? { label: 'Population', value: population } : null,
    participants ? { label: 'Participants', value: participants } : null,
    duration ? { label: 'Duration', value: duration } : null,
    blinding ? { label: 'Blinding', value: blinding } : null,
    comparator ? { label: 'Comparator', value: comparator } : null,
    dosing ? { label: 'Dosing', value: dosing } : null,
    ...(design ?? []),
  ].filter((f): f is StudyDesignFactor => f !== null)

  const hasDetail =
    Boolean(gradeRationale) ||
    factors.length > 0 ||
    (limitations?.length ?? 0) > 0 ||
    Boolean(context) ||
    (sources?.length ?? 0) > 0

  return (
    <section
      className="not-prose my-6 overflow-hidden rounded-2xl border border-brand-900/10 bg-white/85 shadow-sm"
      aria-label={title}
    >
      {/* Always-visible practical summary */}
      <div className="space-y-3 p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-brand-800">
            {title}
          </p>
          {grade ? <GradePill grade={grade} /> : null}
        </div>
        <p className="text-base font-semibold leading-7 text-ink sm:text-lg">{summary}</p>
      </div>

      {/* Optional depth — native disclosure, accessible and no-JS friendly */}
      {hasDetail ? (
        <details open={defaultOpen} className="group border-t border-brand-900/10">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-3 text-sm font-semibold text-brand-800 transition hover:bg-brand-50/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-700/40 sm:px-6">
            <span>Why this grade — design &amp; limitations</span>
            <span
              aria-hidden="true"
              className="text-brand-700 transition-transform duration-200 group-open:rotate-180"
            >
              ↓
            </span>
          </summary>

          <div className="space-y-5 px-5 pb-5 pt-1 sm:px-6 sm:pb-6">
            {gradeRationale ? (
              <div className="space-y-1.5">
                <p className="text-xs font-bold uppercase tracking-wider text-[#5c6b63]">
                  Why this grade
                </p>
                <p className="text-sm leading-7 text-muted">{gradeRationale}</p>
              </div>
            ) : null}

            {factors.length > 0 ? (
              <div className="space-y-1.5">
                <p className="text-xs font-bold uppercase tracking-wider text-[#5c6b63]">
                  Pivotal study design
                </p>
                <dl className="grid gap-2 sm:grid-cols-2">
                  {factors.map((factor) => (
                    <div
                      key={factor.label}
                      className="rounded-xl bg-[#f5f3ec] px-3 py-2"
                    >
                      <dt className="text-[11px] font-semibold uppercase tracking-wide text-[#6b7a72]">
                        {factor.label}
                      </dt>
                      <dd className="mt-0.5 text-sm leading-6 text-ink">{factor.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ) : null}

            {limitations && limitations.length > 0 ? (
              <div className="space-y-1.5">
                <p className="text-xs font-bold uppercase tracking-wider text-[#5c6b63]">
                  Limitations &amp; context
                </p>
                <ul className="space-y-2">
                  {limitations.map((limitation) => (
                    <li
                      key={limitation}
                      className="flex gap-2 text-sm leading-6 text-muted"
                    >
                      <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                      <span>{limitation}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {context ? <p className="text-sm leading-7 text-muted">{context}</p> : null}

            {sources && sources.length > 0 ? (
              <p className="text-xs leading-6 text-[#6b7a72]">
                <span className="font-semibold">Sources: </span>
                {sources.map((source, index) => (
                  <span key={`${source.label}-${index}`}>
                    {index > 0 ? '; ' : ''}
                    {source.href ? (
                      <a
                        href={source.href}
                        className="font-medium text-brand-700 underline-offset-2 hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {source.label}
                      </a>
                    ) : (
                      source.label
                    )}
                  </span>
                ))}
              </p>
            ) : null}
          </div>
        </details>
      ) : null}
    </section>
  )
}
