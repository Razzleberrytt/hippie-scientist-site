import {
  decisionStatusBadgeClass,
  getDecisionSafetyTone,
  publicSafetyLabel,
  safetyToneClasses,
} from '@/lib/decision-primitives'

export default function SafetyBadge({ level = 'Safety review pending' }: { level?: string }) {
  const label = publicSafetyLabel(level)
  const tone = getDecisionSafetyTone(label)
  const isLimited = label === 'Safety data limited' || label === 'Limited safety data'
  const aria = isLimited
    ? 'Safety data are limited; use caution and review the full profile before choosing.'
    : undefined

  return (
    <span
      className={`${decisionStatusBadgeClass} ${safetyToneClasses(tone)}`}
      aria-label={aria}
      title={isLimited ? 'Safety data are limited; review the full profile' : undefined}
    >
      {label}
    </span>
  )
}
