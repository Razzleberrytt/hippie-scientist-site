import { getEvidenceLetterGrade, type EvidenceLetterGrade } from '@/lib/evidence'
import type { RuntimeRecord } from '@/src/types/content'

const GRADE_CONFIG: Record<EvidenceLetterGrade, {
  label: string
  meaning: string
  bg: string
  text: string
  border: string
  ringColor: string
}> = {
  A: {
    label: 'A',
    meaning: 'Strong Evidence — Multiple RCTs, consistent direction, adequate effect size',
    bg: 'bg-[var(--color-evidence-strong)]/10',
    text: 'text-[var(--color-evidence-strong)]',
    border: 'border-[var(--color-evidence-strong)]/20',
    ringColor: 'ring-[var(--color-evidence-strong)]/20',
  },
  B: {
    label: 'B',
    meaning: 'Moderate Evidence — Some RCTs or consistent observational data',
    bg: 'bg-[var(--color-evidence-moderate)]/10',
    text: 'text-[var(--color-evidence-moderate)]',
    border: 'border-[var(--color-evidence-moderate)]/20',
    ringColor: 'ring-[var(--color-evidence-moderate)]/20',
  },
  C: {
    label: 'C',
    meaning: 'Preliminary / Mixed — Animal/in-vitro only, or inconsistent human data',
    bg: 'bg-[var(--color-evidence-limited)]/10',
    text: 'text-[var(--color-evidence-limited)]',
    border: 'border-[var(--color-evidence-limited)]/20',
    ringColor: 'ring-[var(--color-evidence-limited)]/20',
  },
  D: {
    label: 'D',
    meaning: 'Traditional / Theoretical — Traditional use only; no human trials',
    bg: 'bg-[var(--color-evidence-theoretical)]/10',
    text: 'text-[var(--color-evidence-theoretical)]',
    border: 'border-[var(--color-evidence-theoretical)]/20',
    ringColor: 'ring-[var(--color-evidence-theoretical)]/20',
  },
}

type EvidenceScoreBadgeProps = {
  record?: Record<string, unknown>
  grade?: EvidenceLetterGrade
  size?: 'sm' | 'md'
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
          {letterGrade === 'A' && 'Strong'}
          {letterGrade === 'B' && 'Moderate'}
          {letterGrade === 'C' && 'Preliminary'}
          {letterGrade === 'D' && 'Traditional'}
        </span>
      )}
    </span>
  )
}
