import {
  decisionStatusBadgeClass,
  getDecisionSafetyTone,
  normalizeDecisionSafety,
  safetyToneClasses,
} from '@/lib/decision-primitives'

export default function SafetyBadge({ level = 'Safety review pending' }: { level?: string }) {
  const label = normalizeDecisionSafety(level)
  const tone = getDecisionSafetyTone(label)
  const isPending = label === 'Safety review pending'
  const aria = isPending
    ? 'Safety data pending review; use caution and review the full profile before choosing.'
    : undefined

  return (
    <span
      className={`${decisionStatusBadgeClass} ${safetyToneClasses(tone)}`}
      aria-label={aria}
      title={isPending ? 'Safety data is still under review' : undefined}
    >
      {label}
    </span>
  )
}
