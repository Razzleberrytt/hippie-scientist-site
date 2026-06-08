import Link from 'next/link'
import {
  decisionStatusBadgeClass,
  evidenceToneClasses,
  getDecisionEvidenceTone,
  normalizeDecisionEvidence,
} from '@/lib/decision-primitives'

export default function EvidenceBadge({
  level,
  tier,
  className = '',
}: {
  level?: string
  tier?: string
  className?: string
}) {
  const label = normalizeDecisionEvidence(tier || level)
  const tone = getDecisionEvidenceTone(label)
  const tooltip = 'Conservative evidence label based on the available profile signals.'

  return (
    <Link
      href="/education/evidence-levels"
      title={tooltip}
      aria-label={`${label}. ${tooltip}`}
      className={`${decisionStatusBadgeClass} ${evidenceToneClasses(tone)} ${className}`}
    >
      {label}
    </Link>
  )
}
