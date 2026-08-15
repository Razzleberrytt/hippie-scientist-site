import type { ReactNode } from 'react'
import {
  getStudyClassDefinition,
  type StudyClass,
} from '@/src/lib/study-evidence-context'

/**
 * Reusable evidence-transparency block for clinical-study context.
 * Every displayed fact is supplied by the caller; the component never invents
 * or infers study characteristics.
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
  summary: ReactNode
  grade?: StudyEvidenceGrade
  gradeRationale?: ReactNode
  /** Canonical source-quality class; preferred over a free-form studyType alone. */
  studyClass?: StudyClass
  /** Optional design detail such as "double-blind, placebo-controlled". */
  studyType?: string
  participants?: string
  duration?: string
  population?: string
  blinding?: string
  comparator?: string
  dosing?: string
  effectSize?: string
  confidenceInterval?: string
  statisticalSignificance?: string
  absoluteDifference?: string
  clinicalMagnitude?: string
  replication?: string
  design?: StudyDesignFactor[]
  limitations?: string[]
  context?: ReactNode
  sources?: StudyDesignSource[]
  defaultOpen?: boolean
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
  studyClass,
  studyType,
  participants,
  duration,
  population,
  blinding,
  comparator,
  dosing,
  effectSize,
  confidenceInterval,
  statisticalSignificance,
  absoluteDifference,
  clinicalMagnitude,
  replication,
  design,
  limitations,
  context,
  sources,
  defaultOpen = false,
  title = 'Study design snapshot',
}: StudyDesignSnapshotProps) {
  const classDefinition = studyClass ? getStudyClassDefinition(studyClass) : null
  const factors: StudyDesignFactor[] = [
    classDefinition ? { label: 'Source quality', value: classDefinition.label } : null,
    studyType ? { label: 'Study design', value: studyType } : null,
    population ? { label: 'Population', value: population } : null,
    participants ? { label: 'Participants', value: participants } : null,
    duration ? { label: 'Duration', value: duration } : null,
    blinding ? { label: 'Blinding', value: blinding } : null,
    comparator ? { label: 'Comparator', value: comparator } : null,
    dosing ? { label: 'Dosing', value: dosing } : null,
    effectSize ? { label: 'Effect size', value: effectSize } : null,
    confidenceInterval ? { label: 'Confidence interval', value: confidenceInterval } : null,
    absoluteDifference ? { label: 'Absolute difference', value: absoluteDifference } : null,
    statisticalSignificance ? { label: 'Statistical significance', value: statisticalSignificance } : null,
    clinicalMagnitude ? { label: 'Magnitude in context', value: clinicalMagnitude } : null,
    replication ? { label: 'Replication', value: replication } : null,
    ...(design ?? []),
  ].filter((factor): factor is StudyDesignFactor => factor !== null)

  const hasDetail =
    Boolean(gradeRationale) ||
    Boolean(classDefinition) ||
    factors.length > 0 ||
    (limitations?.length ?? 0) > 0 ||
    Boolean(context) ||
    (sources?.length ?? 0) > 0

  return (
    <section
      className="not-prose my-6 overflow-hidden rounded-2xl border border-brand-900/10 bg-white/85 shadow-sm"
      aria-label={title}
    >
      <div className="space-y-3 p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-brand-800">
            {title}
          </p>
          {grade ? <GradePill grade={grade} /> : null}
          {classDefinition ? (
            <span className="inline-flex items-center rounded-full border border-stone-300 bg-stone-100 px-3 py-1 text-xs font-semibold tracking-wide text-stone-800">
              {classDefinition.label}
            </span>
          ) : null}
        </div>
        <p className="text-base font-semibold leading-7 text-ink sm:text-lg">{summary}</p>
      </div>

      {hasDetail ? (
        <details open={defaultOpen} className="group border-t border-brand-900/10">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-3 text-sm font-semibold text-brand-800 transition hover:bg-brand-50/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-700/40 sm:px-6">
            <span>Why this grade — design, magnitude &amp; limitations</span>
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
                <p className="text-xs font-bold uppercase tracking-wider text-[#5c6b63]">Why this grade</p>
                <p className="text-sm leading-7 text-muted">{gradeRationale}</p>
              </div>
            ) : null}

            {classDefinition ? (
              <div className="space-y-1.5">
                <p className="text-xs font-bold uppercase tracking-wider text-[#5c6b63]">What this source type means</p>
                <p className="text-sm leading-7 text-muted">{classDefinition.plainEnglish}</p>
              </div>
            ) : null}

            {factors.length > 0 ? (
              <div className="space-y-1.5">
                <p className="text-xs font-bold uppercase tracking-wider text-[#5c6b63]">Study context</p>
                <dl className="grid gap-2 sm:grid-cols-2">
                  {factors.map((factor) => (
                    <div key={factor.label} className="rounded-xl bg-[#f5f3ec] px-3 py-2">
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
                <p className="text-xs font-bold uppercase tracking-wider text-[#5c6b63]">Limitations &amp; context</p>
                <ul className="space-y-2">
                  {limitations.map((limitation) => (
                    <li key={limitation} className="flex gap-2 text-sm leading-6 text-muted">
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
