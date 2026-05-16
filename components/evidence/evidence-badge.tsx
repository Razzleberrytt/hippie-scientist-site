import { getEvidenceLabel, hasStrongSafetyProfile } from '@/lib/evidence'
import { getSemanticTrustLabels } from '@/lib/semantic-trust-badges'
import { getSafetyLabels } from '@/lib/safety-classification'

type EvidenceBadgeKind =
  | 'Human Evidence'
  | 'Mechanism-Mapped'
  | 'Preliminary evidence'
  | 'Traditional use'
  | 'Strong evidence'
  | 'Moderate evidence'
  | 'Limited evidence'
  | 'Mixed evidence'
  | 'Insufficient evidence'
  | 'Needs review'
  | 'Mechanistic Focus'
  | 'Interaction-Aware'
  | 'Safety-Sensitive'

type EvidenceBadgeProps = {
  label: EvidenceBadgeKind | string
  className?: string
}

const BADGE_STYLES: Record<string, string> = {
  'Human Evidence': 'border-emerald-800/15 bg-emerald-50/80 text-emerald-900',
  'Mechanism-Mapped': 'border-blue-800/15 bg-blue-50/70 text-blue-900',
  'Preliminary evidence': 'border-amber-800/20 bg-amber-50/80 text-amber-900',
  'Traditional use': 'border-stone-700/15 bg-stone-100/70 text-stone-800',
  'Strong evidence': 'border-emerald-800/15 bg-emerald-50/80 text-emerald-900',
  'Moderate evidence': 'border-blue-800/15 bg-blue-50/70 text-blue-900',
  'Limited evidence': 'border-amber-800/20 bg-amber-50/80 text-amber-900',
  'Mixed evidence': 'border-violet-800/15 bg-violet-50/70 text-violet-900',
  'Insufficient evidence': 'border-slate-500/20 bg-slate-50 text-slate-700',
  'Needs review': 'border-slate-500/20 bg-slate-50 text-slate-700',
  'Mechanistic Focus': 'border-blue-800/15 bg-blue-50/70 text-blue-900',
  'Interaction-Aware': 'border-rose-800/15 bg-rose-50/75 text-rose-900',
  'Safety-Sensitive': 'border-amber-800/20 bg-amber-50/80 text-amber-900',
  'Generally well tolerated': 'border-teal-800/15 bg-teal-50/75 text-teal-900',
}


export function EvidenceBadge({ label, className = '' }: EvidenceBadgeProps) {
  const style = BADGE_STYLES[label] || 'border-brand-900/10 bg-white/70 text-[#46574d]'

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.12em] ${style} ${className}`}
    >
      {label}
    </span>
  )
}

export function getEvidenceBadges(record: any): string[] {
  const badges = new Set<string>()
  const label = getEvidenceLabel(record)

  getSemanticTrustLabels(record, 4).forEach(badge => badges.add(badge))
  getSafetyLabels(record, 2).forEach(badge => badges.add(badge))
  if (/traditional/i.test(label)) badges.add('Traditional use')
  if (hasStrongSafetyProfile(record)) badges.add('Generally well tolerated')

  if (!badges.size) badges.add(label)

  return Array.from(badges).slice(0, 4)
}

export function EvidenceBadgeGroup({
  record,
  compact = false,
  className = '',
}: {
  record: any
  compact?: boolean
  className?: string
}) {
  const badges = getEvidenceBadges(record)

  if (!badges.length) return null

  return (
    <div className={`flex flex-wrap gap-2 ${className}`} aria-label='Evidence indicators'>
      {badges.map(badge => (
        <EvidenceBadge
          key={badge}
          label={badge}
          className={compact ? 'px-2 py-0.5 text-[10px]' : ''}
        />
      ))}
    </div>
  )
}
