type EmergingResearchIndicatorProps = {
  momentumScore?: number
  emergingStatus?: string
}

function momentumState(score: number) {
  if (score >= 80) {
    return {
      label: 'Rapid ecosystem evolution',
      tone: 'text-rose-800 bg-rose-100 border-rose-200',
      accent: 'bg-rose-500',
    }
  }

  if (score >= 60) {
    return {
      label: 'Active educational expansion',
      tone: 'text-amber-800 bg-amber-100 border-amber-200',
      accent: 'bg-amber-500',
    }
  }

  return {
    label: 'Emerging continuity signals',
    tone: 'text-cyan-800 bg-cyan-100 border-cyan-200',
    accent: 'bg-cyan-500',
  }
}

export function EmergingResearchIndicator({
  momentumScore = 68,
  emergingStatus = 'Actively evolving',
}: EmergingResearchIndicatorProps) {
  const state = momentumState(momentumScore)

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white/80 p-4 shadow-sm">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium text-muted">
              Emerging research activity
            </p>

            <h3 className="mt-2 text-2xl font-semibold text-ink">
              {state.label}
            </h3>
          </div>

          <div className="flex flex-wrap gap-2">
            <span
              className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${state.tone}`}
            >
              {emergingStatus}
            </span>

            <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs text-neutral-700">
              adaptive evolution
            </span>
          </div>
        </div>

        <div className="min-w-[240px] space-y-3">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-muted">
              Momentum intensity
            </span>

            <span className="text-lg font-semibold text-ink">
              {momentumScore}
            </span>
          </div>

          <div className="h-3 overflow-hidden rounded-full bg-neutral-100">
            <div
              className={`h-full rounded-full ${state.accent}`}
              style={{ width: `${momentumScore}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
