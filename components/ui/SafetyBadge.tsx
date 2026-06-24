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
  const displayLabel = isPending ? 'Safety notes in development' : label

  return (
    <span
      className={`${decisionStatusBadgeClass} ${safetyToneClasses(tone)}`}
    >
      {displayLabel}
    </span>
  )
}
