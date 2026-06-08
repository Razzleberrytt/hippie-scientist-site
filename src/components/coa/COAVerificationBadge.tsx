import Badge from '@/components/ui/Badge'
import type { COAVerificationConfidence } from '@/types/coa'

type COAVerificationBadgeProps = {
  confidence: COAVerificationConfidence
  rationale: string
  compact?: boolean
}

const styleByConfidence: Record<COAVerificationConfidence, { dot: string; label: string; badgeVariant: 'teal' | 'amber' | 'default' }> = {
  high: { dot: 'bg-emerald-600', label: 'High confidence', badgeVariant: 'teal' },
  medium: { dot: 'bg-amber-500', label: 'Medium confidence', badgeVariant: 'amber' },
  low: { dot: 'bg-rose-500', label: 'Low confidence', badgeVariant: 'default' },
}

export default function COAVerificationBadge({ confidence, rationale, compact = false }: COAVerificationBadgeProps) {
  const style = styleByConfidence[confidence]

  return (
    <Badge
      variant={style.badgeVariant}
      className='inline-flex items-center gap-1.5'
      title={rationale}
      aria-label={`${style.label}. ${rationale}`}
    >
      <span className={`inline-block h-2 w-2 rounded-full ${style.dot}`} aria-hidden />
      {compact ? confidence.toUpperCase() : style.label}
    </Badge>
  )
}
