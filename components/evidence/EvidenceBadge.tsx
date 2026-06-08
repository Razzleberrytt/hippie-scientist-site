type EvidenceLevel = 'Strong' | 'Stronger' | 'Moderate' | 'Limited' | 'Mixed' | 'Traditional' | 'Theoretical'

const styles: Record<EvidenceLevel, string> = {
  Strong: 'bg-emerald-100 text-emerald-900 border-emerald-300',
  Stronger: 'bg-emerald-100 text-emerald-900 border-emerald-300',
  Moderate: 'bg-blue-100 text-blue-900 border-blue-300',
  Limited: 'bg-amber-100 text-amber-900 border-amber-300',
  Mixed: 'bg-violet-100 text-violet-900 border-violet-300',
  Traditional: 'bg-purple-100 text-purple-900 border-purple-300',
  Theoretical: 'bg-zinc-100 text-zinc-900 border-zinc-300',
}

export default function EvidenceBadge({
  level,
}: {
  level: EvidenceLevel
}) {
  const label = level === 'Strong' ? 'Stronger' : level

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold tracking-wide ${styles[level]}`}
    >
      Evidence: {label}
    </span>
  )
}
