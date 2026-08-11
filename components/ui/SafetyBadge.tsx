import {
  decisionStatusBadgeClass,
  getDecisionSafetyTone,
  normalizeDecisionSafety,
  safetyToneClasses,
} from '@/lib/decision-primitives'

export default function SafetyBadge({ level = 'Safety review pending' }: { level?: string }) {
  const normalizedLabel = normalizeDecisionSafety(level)
  const isPending = normalizedLabel === 'Safety review pending'
  const label = isPending ? 'Safety data limited' : normalizedLabel
  const tone = getDecisionSafetyTone(normalizedLabel)
  const aria = isPending
    ? 'Safety data are limited; use caution and review the full profile before choosing.'
    : undefined

  return (
    <span
      className={`${decisionStatusBadgeClass} ${safetyToneClasses(tone)}`}
      aria-label={aria}
      title={isPending ? 'Safety data are limited; review the full profile' : undefined}
    >
      {label}
    </span>
  )
}
