import { getEvidenceLetterGrade, type EvidenceLetterGrade } from '@/lib/evidence'
import type { RuntimeRecord } from '@/src/types/content'

const GRADE_CONFIG: Record<EvidenceLetterGrade, {
  label: string
  meaning: string
  bg: string
  text: string
  border: string
  ringColor: string
  solid: string
}> = {
  A: {
    label: 'A',
    meaning: 'Strong Evidence — Multiple RCTs, consistent direction, adequate effect size',
    bg: 'bg-[var(--color-evidence-strong)]/10',
    text: 'text-[var(--color-evidence-strong)]',
    border: 'border-[var(--color-evidence-strong)]/20',
    ringColor: 'ring-[var(--color-evidence-strong)]/20',
    solid: 'bg-[var(--color-evidence-strong)]',
  },
  B: {
    label: 'B',
    meaning: 'Moderate Evidence — Some RCTs or consistent observational data',
    bg: 'bg-[var(--color-evidence-moderate)]/10',
    text: 'text-[var(--color-evidence-moderate)]',
    border: 'border-[var(--color-evidence-moderate)]/20',
    ringColor: 'ring-[var(--color-evidence-moderate)]/20',
    solid: 'bg-[var(--color-evidence-moderate)]',
  },
  C: {
    label: 'C',
    meaning: 'Preliminary / Mixed — Animal/in-vitro only, or inconsistent human data',
    bg: 'bg-[var(--color-evidence-limited)]/10',
    text: 'text-[var(--color-evidence-limited)]',
    border: 'border-[var(--color-evidence-limited)]/20',
    ringColor: 'ring-[var(--color-evidence-limited)]/20',
    solid: 'bg-[var(--color-evidence-limited)]',
  },
  D: {
    label: 'D',
    meaning: 'Traditional / Theoretical — Traditional use only; no human trials',
    bg: 'bg-[var(--color-evidence-theoretical)]/10',
    text: 'text-[var(--color-evidence-theoretical)]',
    border: 'border-[var(--color-evidence-theoretical)]/20',
    ringColor: 'ring-[var(--color-evidence-theoretical)]/20',
    solid: 'bg-[var(--color-evidence-theoretical)]',
  },
}

const GRADE_MEANING_SHORT: Record<EvidenceLetterGrade, string> = {
  A: 'Strong',
  B: 'Moderate',
  C: 'Preliminary',
  D: 'Traditional',
}

// Dark-mode-aware text color for the circle variant's label — the static
// --color-evidence-* tokens don't have dark overrides and read low-contrast
// against dark surfaces, so this uses adaptive Tailwind utilities instead.
const GRADE_TEXT_ADAPTIVE: Record<EvidenceLetterGrade, string> = {
  A: 'text-emerald-800 dark:text-emerald-100',
  B: 'text-blue-800 dark:text-blue-100',
  C: 'text-amber-800 dark:text-amber-100',
  D: 'text-stone-700 dark:text-stone-200',
}

type EvidenceScoreBadgeProps = {
  record?: Record<string, unknown>
  grade?: EvidenceLetterGrade
  size?: 'sm' | 'md' | 'circle'
  showLabel?: boolean
  className?: string
}

export default function EvidenceScoreBadge({
  record,
  grade,
  size = 'md',
  showLabel = true,
  className = '',
}: EvidenceScoreBadgeProps) {
  const letterGrade = grade ?? (record ? getEvidenceLetterGrade(record as RuntimeRecord) : 'C')
  const config = GRADE_CONFIG[letterGrade]

  if (size === 'circle') {
    return (
      <span
        className={`inline-flex items-center gap-2 ${className}`}
        title={config.meaning}
      >
        <span
          aria-hidden="true"
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white shadow-sm ${config.solid}`}
        >
          {letterGrade}
        </span>
        {showLabel && (
          <span aria-label={`Evidence grade ${letterGrade}: ${config.meaning}`} className={`text-sm font-semibold ${GRADE_TEXT_ADAPTIVE[letterGrade]}`}>
            {GRADE_MEANING_SHORT[letterGrade]}
          </span>
        )}
      </span>
    )
  }

  const sizeClasses =
    size === 'sm'
      ? 'px-2 py-0.5 text-[0.7rem] gap-1'
      : 'px-3 py-1 text-xs gap-1.5'

  return (
    <span
      title={config.meaning}
      aria-label={`Evidence grade ${letterGrade}: ${config.meaning}`}
      className={`inline-flex items-center rounded-full border font-bold tracking-wide ${config.bg} ${config.text} ${config.border} ${sizeClasses} ${className}`}
    >
      <span className={size === 'sm' ? 'text-[0.8rem]' : 'text-sm'}>{letterGrade}</span>
      {showLabel && (
        <span className="font-semibold">
          {' '}
          {GRADE_MEANING_SHORT[letterGrade]}
        </span>
      )}
    </span>
  )
}
