type ConfidenceLevel = 'high' | 'moderate' | 'low' | 'preliminary' | 'traditional'

type EvidenceIndicatorProps = {
  level: ConfidenceLevel | string
  label?: string
  className?: string
}

const LEVEL_CONFIG: Record<string, { color: string; label: string; description: string }> = {
  high: { color: 'bg-emerald-100 text-emerald-800 border-emerald-200', label: 'High', description: 'Multiple RCTs with consistent results' },
  moderate: { color: 'bg-yellow-50 text-yellow-800 border-yellow-200', label: 'Moderate', description: 'Limited RCTs or mixed results' },
  low: { color: 'bg-orange-50 text-orange-800 border-orange-200', label: 'Low', description: 'Mostly mechanistic or animal data' },
  preliminary: { color: 'bg-slate-100 text-slate-700 border-slate-200', label: 'Preliminary', description: 'Early-stage or case reports only' },
  traditional: { color: 'bg-purple-50 text-purple-800 border-purple-200', label: 'Traditional', description: 'Historical use; limited modern evidence' },
}

export default function EvidenceIndicator({ level, label, className = '' }: EvidenceIndicatorProps) {
  const key = level.toLowerCase()
  const config = LEVEL_CONFIG[key] || LEVEL_CONFIG.preliminary
  const displayLabel = label || config.label

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-bold uppercase ${config.color} ${className}`}
      title={config.description}
      aria-label={`Evidence level: ${displayLabel}. ${config.description}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" aria-hidden="true" />
      {displayLabel}
    </span>
  )
}
