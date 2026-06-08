type FreshnessIndicatorProps = {
  freshnessScore?: number
  updatedLabel?: string
}

function freshnessLabel(score: number) {
  if (score >= 80) {
    return {
      label: 'Actively maintained',
      tone: 'text-emerald-800 bg-emerald-100 border-emerald-200',
    }
  }

  if (score >= 55) {
    return {
      label: 'Continuity monitored',
      tone: 'text-amber-800 bg-amber-100 border-amber-200',
    }
  }

  return {
    label: 'Emerging continuity',
    tone: 'text-rose-800 bg-rose-100 border-rose-200',
  }
}

export function FreshnessIndicator({
  freshnessScore = 72,
  updatedLabel = 'Recently reviewed',
}: FreshnessIndicatorProps) {
  const freshness = freshnessLabel(freshnessScore)

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white/80 p-4 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-muted">
            Educational freshness
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-3">
            <span
              className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${freshness.tone}`}
            >
              {freshness.label}
            </span>

            <span className="text-sm text-muted">
              {updatedLabel}
            </span>
          </div>
        </div>

        <div className="rounded-2xl bg-neutral-100 px-4 py-3 text-right">
          <p className="text-[11px] uppercase tracking-[0.18em] text-muted">
            Freshness
          </p>

          <p className="text-2xl font-semibold text-ink">
            {freshnessScore}
          </p>
        </div>
      </div>
    </div>
  )
}
