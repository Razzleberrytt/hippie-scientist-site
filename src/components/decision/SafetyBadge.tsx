'use client'

export type SafetyLevel = 'lowCaution' | 'caution' | 'review' | 'unknown'

interface SafetyBadgeProps {
  level: SafetyLevel
  /** Optional label override — use exact field text from data */
  label?: string
  tooltip?: string
  className?: string
}

const LEVEL_CONFIG: Record<
  SafetyLevel,
  { label: string; bg: string; text: string; border: string; icon: string }
> = {
  lowCaution: {
    label: 'Caution mapped',
    bg: 'bg-emerald-50',
    text: 'text-emerald-800',
    border: 'border-emerald-200',
    icon: '✓',
  },
  caution: {
    label: 'Caution noted',
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-200',
    icon: '⚠',
  },
  review: {
    label: 'Safety review',
    bg: 'bg-neutral-50',
    text: 'text-neutral-600',
    border: 'border-neutral-200',
    icon: '?',
  },
  unknown: {
    label: 'Safety review',
    bg: 'bg-neutral-50',
    text: 'text-neutral-500',
    border: 'border-neutral-200',
    icon: '?',
  },
}

/**
 * Maps raw workbook safety strings to a normalized SafetyLevel.
 * Never renders "Safe" as a standalone claim.
 */
export function normalizeSafetyLevel(raw?: string | null): SafetyLevel {
  if (!raw) return 'unknown'
  const v = raw.toLowerCase()
  if (v.includes('low') || v.includes('generally safe') || v.includes('well-tolerated')) return 'lowCaution'
  if (v.includes('caution') || v.includes('moderate risk') || v.includes('interaction')) return 'caution'
  if (v.includes('review') || v.includes('limited') || v.includes('unknown') || v.includes('unclear')) return 'review'
  // Explicit "safe" alone gets downgraded to lowCaution — avoids overclaiming
  if (v === 'safe') return 'lowCaution'
  return 'unknown'
}

export default function SafetyBadge({ level, label, tooltip, className = '' }: SafetyBadgeProps) {
  const cfg = LEVEL_CONFIG[level]
  const displayLabel = label ?? cfg.label

  return (
    <span
      title={tooltip}
      className={[
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5',
        'text-[0.7rem] font-semibold leading-none tracking-wide',
        cfg.bg,
        cfg.text,
        cfg.border,
        className,
      ].join(' ')}
    >
      <span className="leading-none" aria-hidden="true">{cfg.icon}</span>
      {displayLabel}
    </span>
  )
}
