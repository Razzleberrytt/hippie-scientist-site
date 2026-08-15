'use client'

import { canonicalGradeFromEvidenceTier, normalizeEvidenceGrade } from '../../../lib/evidence-grade'

export type EvidenceTier = 'strong' | 'moderate' | 'early' | 'review' | 'unknown'

interface EvidenceBadgeProps {
  tier: EvidenceTier
  /** Optional label override — renders raw from data when provided */
  label?: string
  /** Show a short tooltip hint text */
  tooltip?: string
  className?: string
}

const TIER_CONFIG: Record<
  EvidenceTier,
  { label: string; bg: string; text: string; border: string; dot: string }
> = {
  strong: {
    label: 'Strong evidence',
    bg: 'bg-emerald-50',
    text: 'text-emerald-800',
    border: 'border-emerald-200',
    dot: 'bg-emerald-500',
  },
  moderate: {
    label: 'Moderate evidence',
    bg: 'bg-sky-50',
    text: 'text-sky-800',
    border: 'border-sky-200',
    dot: 'bg-sky-500',
  },
  early: {
    label: 'Early evidence',
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-200',
    dot: 'bg-amber-500',
  },
  review: {
    label: 'Evidence review',
    bg: 'bg-neutral-50',
    text: 'text-neutral-600',
    border: 'border-neutral-200',
    dot: 'bg-neutral-400',
  },
  unknown: {
    label: 'Evidence review',
    bg: 'bg-neutral-50',
    text: 'text-neutral-500',
    border: 'border-neutral-200',
    dot: 'bg-neutral-300',
  },
}

/**
 * Compatibility projection for badge styling. Scientific normalization belongs
 * to the canonical evidence-grade contract; this function only maps that grade
 * onto the smaller visual tier vocabulary used by this component.
 */
export function normalizeEvidenceTier(raw?: string | null): EvidenceTier {
  if (!raw?.trim()) return 'unknown'

  // Legacy `tier-a`/`tier b` are ingestion aliases. Strip only the tier prefix,
  // then hand the actual grade interpretation to the canonical normalizer.
  const legacyTierValue = raw.trim().replace(/^tier[-\s]*/i, '')
  const normalized = normalizeEvidenceGrade(legacyTierValue)
  const grade = normalized.grade && !normalized.outcomeDependent
    ? normalized.grade
    : canonicalGradeFromEvidenceTier(raw)

  if (grade === 'A') return 'strong'
  if (grade === 'B') return 'moderate'
  if (grade === 'C' || grade === 'D') return 'early'
  if (grade === 'Avoid/Insufficient') return 'review'
  if (/\breview\b/i.test(raw)) return 'review'
  return 'unknown'
}

export default function EvidenceBadge({ tier, label, tooltip, className = '' }: EvidenceBadgeProps) {
  const cfg = TIER_CONFIG[tier]
  const displayLabel = label ?? cfg.label

  return (
    <span
      title={tooltip}
      className={[
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5',
        'text-[0.7rem] font-semibold leading-none tracking-wide',
        cfg.bg,
        cfg.text,
        cfg.border,
        className,
      ].join(' ')}
    >
      <span className={`h-1.5 w-1.5 flex-none rounded-full ${cfg.dot}`} aria-hidden="true" />
      {displayLabel}
    </span>
  )
}
