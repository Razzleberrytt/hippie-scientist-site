type Props = {
  label: string
  value?: number
}

export default function EvidenceConfidenceBar({ label, value = 0 }: Props) {
  const percentage = Math.max(5, Math.min(100, Math.round(value * 100)))

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3 text-xs uppercase tracking-[0.2em] text-neutral-500">
        <span>{label}</span>
        <span>{percentage}%</span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-white/5">
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-sky-400"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
