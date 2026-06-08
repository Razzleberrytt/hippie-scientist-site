type ReviewNeededIndicatorProps = {
  reviewPriority?: number
  reviewStatus?: string
}

function reviewState(priority: number) {
  if (priority >= 80) {
    return {
      label: 'High-priority educational review',
      tone: 'text-rose-800 bg-rose-100 border-rose-200',
      accent: 'bg-rose-500',
    }
  }

  if (priority >= 55) {
    return {
      label: 'Continuity review recommended',
      tone: 'text-amber-800 bg-amber-100 border-amber-200',
      accent: 'bg-amber-500',
    }
  }

  return {
    label: 'Governance systems stable',
    tone: 'text-emerald-800 bg-emerald-100 border-emerald-200',
    accent: 'bg-emerald-500',
  }
}

export function ReviewNeededIndicator({
  reviewPriority = 48,
  reviewStatus = 'Monitoring continuity systems',
}: ReviewNeededIndicatorProps) {
  const state = reviewState(reviewPriority)

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white/80 p-4 shadow-sm">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium text-muted">
              Governance review status
            </p>

            <h3 className="mt-2 text-2xl font-semibold text-ink">
              {state.label}
            </h3>
          </div>

          <div className="flex flex-wrap gap-2">
            <span
              className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${state.tone}`}
            >
              {reviewStatus}
            </span>

            <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs text-neutral-700">
              adaptive governance
            </span>
          </div>
        </div>

        <div className="min-w-[240px] space-y-3">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-muted">
              Review priority
            </span>

            <span className="text-lg font-semibold text-ink">
              {reviewPriority}
            </span>
          </div>

          <div className="h-3 overflow-hidden rounded-full bg-neutral-100">
            <div
              className={`h-full rounded-full ${state.accent}`}
              style={{ width: `${reviewPriority}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
