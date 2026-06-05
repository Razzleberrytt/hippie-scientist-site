import { getEvidenceLetterGrade, type EvidenceLetterGrade } from '@/lib/evidence'

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
    bg: 'bg-emerald-50',
    text: 'text-emerald-900',
    border: 'border-emerald-700/25',
    ringColor: 'ring-emerald-600/20',
  },
  B: {
    label: 'B',
    meaning: 'Moderate Evidence — Some RCTs or consistent observational data',
    bg: 'bg-yellow-50',
    text: 'text-yellow-900',
    border: 'border-yellow-600/25',
    ringColor: 'ring-yellow-500/20',
  },
  C: {
    label: 'C',
    meaning: 'Preliminary / Mixed — Animal/in-vitro only, or inconsistent human data',
    bg: 'bg-amber-50',
    text: 'text-amber-900',
    border: 'border-amber-700/25',
    ringColor: 'ring-amber-600/20',
  },
  D: {
    label: 'D',
    meaning: 'Traditional / Theoretical — Traditional use only; no human trials',
    bg: 'bg-stone-100',
    text: 'text-stone-700',
    border: 'border-stone-400/40',
    ringColor: 'ring-stone-400/20',
  },
}

type EvidenceScoreBadgeProps = {
  record?: any
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
  const letterGrade = grade ?? (record ? getEvidenceLetterGrade(record) : 'C')
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
          {letterGrade === 'A' && 'Strong'}
          {letterGrade === 'B' && 'Moderate'}
          {letterGrade === 'C' && 'Preliminary'}
          {letterGrade === 'D' && 'Traditional'}
        </span>
      )}
    </span>
  )
}
