import Link from 'next/link'
import {
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
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold leading-none transition hover:scale-[1.02] ${evidenceToneClasses(tone)} ${className}`}
    >
      {label}
    </Link>
  )
}
