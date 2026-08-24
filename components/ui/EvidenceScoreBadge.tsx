import { getEvidenceLetterGrade, type EvidenceLetterGrade } from '@/lib/evidence'
import type { RuntimeRecord } from '@/src/types/content'

const GRADE_CONFIG: Record<EvidenceLetterGrade, {
  badge: string
  label: string
  meaning: string
  bg: string
  text: string
  border: string
  ringColor: string
  solid: string
}> = {
  A: {
    badge: 'A',
    label: 'A',
    meaning: 'Strong Evidence — Multiple RCTs, consistent direction, adequate effect size',
    bg: 'bg-[var(--color-evidence-strong)]/10',
    text: 'text-[var(--color-evidence-strong)]',
    border: 'border-[var(--color-evidence-strong)]/20',
    ringColor: 'ring-[var(--color-evidence-strong)]/20',
    solid: 'bg-[var(--color-evidence-strong)]',
  },
  B: {
    badge: 'B',
    label: 'B',
    meaning: 'Moderate Evidence — Some RCTs or consistent observational data',
    bg: 'bg-[var(--color-evidence-moderate)]/10',
    text: 'text-[var(--color-evidence-moderate)]',
    border: 'border-[var(--color-evidence-moderate)]/20',
    ringColor: 'ring-[var(--color-evidence-moderate)]/20',
    solid: 'bg-[var(--color-evidence-moderate)]',
  },
  C: {
    badge: 'C',
    label: 'C',
    meaning: 'Limited Evidence — Early or mixed human evidence; stronger confirmation is needed',
    bg: 'bg-[var(--color-evidence-limited)]/10',
    text: 'text-[var(--color-evidence-limited)]',
    border: 'border-[var(--color-evidence-limited)]/20',
    ringColor: 'ring-[var(--color-evidence-limited)]/20',
    solid: 'bg-[var(--color-evidence-limited)]',
  },
  D: {
    badge: 'D',
    label: 'D',
    meaning: 'Preliminary / Theoretical — Mechanistic, preclinical, or traditional evidence without adequate clinical confirmation',
    bg: 'bg-[var(--color-evidence-theoretical)]/10',
    text: 'text-[var(--color-evidence-theoretical)]',
    border: 'border-[var(--color-evidence-theoretical)]/20',
    ringColor: 'ring-[var(--color-evidence-theoretical)]/20',
    solid: 'bg-[var(--color-evidence-theoretical)]',
  },
  'Avoid/Insufficient': {
    badge: '!',
    label: 'Avoid / Insufficient',
    meaning: 'Avoid / Insufficient — Evidence is inadequate for a positive grade, or the record is explicitly flagged to avoid',
    bg: 'bg-rose-50 dark:bg-rose-300/10',
    text: 'text-rose-800 dark:text-rose-100',
    border: 'border-rose-200 dark:border-rose-200/20',
    ringColor: 'ring-rose-200/40',
    solid: 'bg-rose-700',
  },
  Unassigned: {
    badge: '—',
    label: 'Unassigned',
    meaning: 'Evidence grade unassigned — A single profile-level grade cannot currently be published from the authored evidence signals.',
    bg: 'bg-slate-50 dark:bg-slate-300/10',
    text: 'text-slate-700 dark:text-slate-200',
    border: 'border-slate-200 dark:border-slate-200/20',
    ringColor: 'ring-slate-200/40',
    solid: 'bg-slate-500',
  },
}

const GRADE_MEANING_SHORT: Record<EvidenceLetterGrade, string> = {
  A: 'Strong',
  B: 'Moderate',
  C: 'Limited',
  D: 'Preliminary',
  'Avoid/Insufficient': 'Avoid / Insufficient',
  Unassigned: 'Unassigned',
}

const GRADE_TEXT_ADAPTIVE: Record<EvidenceLetterGrade, string> = {
  A: 'text-emerald-800 dark:text-emerald-100',
  B: 'text-blue-800 dark:text-blue-100',
  C: 'text-amber-800 dark:text-amber-100',
  D: 'text-stone-700 dark:text-stone-200',
  'Avoid/Insufficient': 'text-rose-800 dark:text-rose-100',
  Unassigned: 'text-slate-700 dark:text-slate-200',
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
  const canonicalGrade = grade ?? (record ? getEvidenceLetterGrade(record as RuntimeRecord) : 'Unassigned')
  const config = GRADE_CONFIG[canonicalGrade]
  const accessibleMeaning = `Profile-wide evidence grade ${canonicalGrade}: ${config.meaning}`

  if (size === 'circle') {
    return (
      <span
        data-evidence="true"
        data-evidence-scope="profile-wide"
        data-evidence-grade={canonicalGrade}
        className={`inline-flex items-center gap-2 ${className}`}
        title={accessibleMeaning}
      >
        <span
          aria-hidden="true"
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white shadow-sm ${config.solid}`}
        >
          {config.badge}
        </span>
        {showLabel && (
          <span aria-label={accessibleMeaning} className={`text-sm font-semibold ${GRADE_TEXT_ADAPTIVE[canonicalGrade]}`}>
            <span className="font-medium">Profile-wide · </span>{GRADE_MEANING_SHORT[canonicalGrade]}
          </span>
        )}
      </span>
    )
  }

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[0.7rem] gap-1' : 'px-3 py-1 text-xs gap-1.5'

  return (
    <span
      data-evidence="true"
      data-evidence-scope="profile-wide"
      data-evidence-grade={canonicalGrade}
      title={accessibleMeaning}
      aria-label={accessibleMeaning}
      className={`inline-flex items-center rounded-full border font-bold tracking-wide ${config.bg} ${config.text} ${config.border} ${sizeClasses} ${className}`}
    >
      {showLabel && <span className="font-medium">Profile-wide ·</span>}
      <span className={size === 'sm' ? 'text-[0.8rem]' : 'text-sm'}>{config.label}</span>
      {showLabel && canonicalGrade !== 'Avoid/Insufficient' && canonicalGrade !== 'Unassigned' && (
        <span className="font-semibold">{' '}{GRADE_MEANING_SHORT[canonicalGrade]}</span>
      )}
    </span>
  )
}
