import {
  getDecisionSafetyTone,
  normalizeDecisionSafety,
  safetyToneClasses,
} from '@/lib/decision-primitives'

export default function SafetyBadge({ level = 'Needs review' }: { level?: string }) {
  const label = normalizeDecisionSafety(level)
  const tone = getDecisionSafetyTone(label)

  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold leading-none ${safetyToneClasses(tone)}`}>
      {label}
    </span>
  )
}
