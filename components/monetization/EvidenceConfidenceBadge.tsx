import type { RecommendationConfidence } from '@/content/recommendations'

type EvidenceConfidenceBadgeProps = {
  level: RecommendationConfidence
  label?: string
  className?: string
}

const confidenceLabels: Record<RecommendationConfidence, string> = {
  strong: 'Strong evidence',
  moderate: 'Moderate evidence',
  limited: 'Limited evidence',
  insufficient: 'Insufficient evidence',
}

const confidenceStyles: Record<RecommendationConfidence, string> = {
  strong: 'border-emerald-700/25 bg-emerald-50 text-emerald-900',
  moderate: 'border-brand-700/25 bg-brand-50 text-brand-900',
  limited: 'border-amber-700/25 bg-amber-50 text-amber-950',
  insufficient: 'border-stone-400/40 bg-stone-100 text-stone-800',
}

export function EvidenceConfidenceBadge({
  level,
  label,
  className = '',
}: EvidenceConfidenceBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${confidenceStyles[level]} ${className}`}
    >
      {label || confidenceLabels[level]}
    </span>
  )
}
