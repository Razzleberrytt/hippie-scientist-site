'use client'

import type { ReactNode } from 'react'

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
 * Maps raw workbook/runtime evidence strings to a normalized EvidenceTier.
 * Call this at the boundary where you receive raw data.
 */
export function normalizeEvidenceTier(raw?: string | null): EvidenceTier {
  if (!raw) return 'unknown'
  const v = raw.toLowerCase()
  if (v.includes('tier-a') || v.includes('tier a') || v === 'a' || v === 'strong') return 'strong'
  if (v.includes('tier-b') || v.includes('tier b') || v === 'b' || v === 'moderate') return 'moderate'
  if (v.includes('tier-c') || v.includes('tier c') || v === 'c' || v === 'early' || v === 'preliminary') return 'early'
  if (v.includes('review') || v.includes('mixed') || v.includes('limited')) return 'review'
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
