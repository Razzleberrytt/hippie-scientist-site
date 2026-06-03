import {
  decisionStatusBadgeClass,
  getDecisionSafetyTone,
  normalizeDecisionSafety,
  safetyToneClasses,
} from '@/lib/decision-primitives'

export default function SafetyBadge({ level = 'Needs review' }: { level?: string }) {
  const label = normalizeDecisionSafety(level)
  const tone = getDecisionSafetyTone(label)

  return (
    <span className={`${decisionStatusBadgeClass} ${safetyToneClasses(tone)}`}>
      {label}
    </span>
  )
}
