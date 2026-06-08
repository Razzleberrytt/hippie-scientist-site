type AuthorityDepthIndicatorProps = {
  authorityDepth?: number
  authorityTier?: string
}

function authorityState(depth: number) {
  if (depth >= 85) {
    return {
      label: 'Foundational authority system',
      tone: 'text-emerald-800 bg-emerald-100 border-emerald-200',
      accent: 'bg-emerald-500',
    }
  }

  if (depth >= 60) {
    return {
      label: 'Canonical educational pathway',
      tone: 'text-cyan-800 bg-cyan-100 border-cyan-200',
      accent: 'bg-cyan-500',
    }
  }

  return {
    label: 'Emerging ecosystem continuity',
    tone: 'text-violet-800 bg-violet-100 border-violet-200',
    accent: 'bg-violet-500',
  }
}

export function AuthorityDepthIndicator({
  authorityDepth = 78,
  authorityTier = 'Canonical',
}: AuthorityDepthIndicatorProps) {
  const state = authorityState(authorityDepth)

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white/80 p-4 shadow-sm">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium text-muted">
              Authority depth
            </p>

            <h3 className="mt-2 text-2xl font-semibold text-ink">
              {state.label}
            </h3>
          </div>

          <div className="flex flex-wrap gap-2">
            <span
              className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${state.tone}`}
            >
              {authorityTier} authority
            </span>

            <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs text-neutral-700">
              semantic hierarchy
            </span>
          </div>
        </div>

        <div className="min-w-[240px] space-y-3">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-muted">
              Authority intensity
            </span>

            <span className="text-lg font-semibold text-ink">
              {authorityDepth}
            </span>
          </div>

          <div className="h-3 overflow-hidden rounded-full bg-neutral-100">
            <div
              className={`h-full rounded-full ${state.accent}`}
              style={{ width: `${authorityDepth}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
