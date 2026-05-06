import Link from 'next/link'

type EvidenceTier = 'strong' | 'moderate' | 'limited' | 'theoretical'

const TIER_MAP: Record<EvidenceTier, {
  label: string
  className: string
  tooltip: string
}> = {
  strong: {
    label: 'Strong',
    className: 'border-emerald-700/15 bg-emerald-700/10 text-emerald-800',
    tooltip: 'Higher-confidence human evidence or stronger clinical support.',
  },
  moderate: {
    label: 'Moderate',
    className: 'border-blue-700/15 bg-blue-700/10 text-blue-800',
    tooltip: 'Useful human evidence with limitations or mixed certainty.',
  },
  limited: {
    label: 'Limited',
    className: 'border-amber-700/20 bg-amber-700/10 text-amber-800',
    tooltip: 'Preliminary, incomplete, or lower-confidence human evidence.',
  },
  theoretical: {
    label: 'Theoretical',
    className: 'border-slate-500/20 bg-slate-500/10 text-slate-700',
    tooltip: 'Traditional, mechanistic, or low-direct-human-evidence support.',
  },
}

function normalizeTier(value?: string): EvidenceTier {
  const text = String(value || '').toLowerCase()

  if (/strong|high|tier\s*a|grade\s*a|\ba\b/.test(text)) {
    return 'strong'
  }

  if (/moderate|medium|tier\s*b|grade\s*b|\bb\b/.test(text)) {
    return 'moderate'
  }

  if (/theoretical|traditional|mechanistic|tier\s*d|grade\s*d|\bd\b/.test(text)) {
    return 'theoretical'
  }

  return 'limited'
}

export default function EvidenceBadge({
  level,
  tier,
  className = '',
}: {
  level?: string
  tier?: string
  className?: string
}) {
  const normalized = normalizeTier(tier || level)
  const meta = TIER_MAP[normalized]

  return (
    <Link
      href="/evidence-standards"
      title={meta.tooltip}
      aria-label={`${meta.label} evidence. ${meta.tooltip}`}
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold leading-none transition hover:scale-[1.02] ${meta.className} ${className}`}
    >
      {meta.label}
    </Link>
  )
}
