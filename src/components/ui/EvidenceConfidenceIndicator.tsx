type EvidenceConfidenceIndicatorProps = {
  confidence?: number
  evidenceTier?: string
}

function confidenceState(value: number) {
  if (value >= 85) {
    return {
      label: 'Strong evidence continuity',
      tone: 'text-emerald-800 bg-emerald-100 border-emerald-200',
      bar: 'bg-emerald-500',
    }
  }

  if (value >= 60) {
    return {
      label: 'Moderate evidence continuity',
      tone: 'text-amber-800 bg-amber-100 border-amber-200',
      bar: 'bg-amber-500',
    }
  }

  return {
    label: 'Emerging evidence continuity',
    tone: 'text-rose-800 bg-rose-100 border-rose-200',
    bar: 'bg-rose-500',
  }
}

export function EvidenceConfidenceIndicator({
  confidence = 74,
  evidenceTier = 'Moderate',
}: EvidenceConfidenceIndicatorProps) {
  const state = confidenceState(confidence)

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white/80 p-4 shadow-sm">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium text-muted">
              Evidence confidence
            </p>

            <h3 className="mt-2 text-2xl font-semibold text-ink">
              {state.label}
            </h3>
          </div>

          <div className="flex flex-wrap gap-2">
            <span
              className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${state.tone}`}
            >
              {evidenceTier} evidence
            </span>

            <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs text-neutral-700">
              adaptive confidence
            </span>
          </div>
        </div>

        <div className="min-w-[220px] space-y-3">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-muted">
              Confidence score
            </span>

            <span className="text-lg font-semibold text-ink">
              {confidence}
            </span>
          </div>

          <div className="h-3 overflow-hidden rounded-full bg-neutral-100">
            <div
              className={`h-full rounded-full ${state.bar}`}
              style={{ width: `${confidence}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
