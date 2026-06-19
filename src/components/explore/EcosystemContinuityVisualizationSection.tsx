import { buildRuntimeHomepageOrchestration } from '@/lib/runtime-homepage-orchestrator'

function percentage(value: number) {
  return `${Math.min(Math.max(value, 0), 100)}%`
}

type EcosystemContinuityVisualizationSectionProps = {
  source: any
  candidates: any[]
}

export function EcosystemContinuityVisualizationSection({
  source,
  candidates,
}: EcosystemContinuityVisualizationSectionProps) {
  const orchestration = buildRuntimeHomepageOrchestration(
    source,
    candidates,
  )

  const visualizations = [
    {
      label: 'Authority continuity',
      value: orchestration.authorityPriority,
      color: 'bg-emerald-500',
    },
    {
      label: 'Ecosystem continuity',
      value: orchestration.ecosystemPriority,
      color: 'bg-cyan-500',
    },
    {
      label: 'Topic continuity',
      value: orchestration.continuityPriority,
      color: 'bg-indigo-500',
    },
    {
      label: 'Freshness continuity',
      value: orchestration.freshnessPriority,
      color: 'bg-rose-500',
    },
    {
      label: 'Hub priority',
      value: orchestration.supernodePriority,
      color: 'bg-amber-500',
    },
  ]

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-700">
          Continuity Visualization
        </p>

        <h2 className="text-3xl font-semibold tracking-tight text-ink">
          Visualize related topic continuity
        </h2>

        <p className="max-w-3xl text-base leading-7 text-muted">
          Explore topic density, related evidence themes, and
          educational pathway structure.
        </p>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm">
        <div className="space-y-6">
          {visualizations.map((visualization) => (
            <div
              key={visualization.label}
              className="space-y-2"
            >
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm font-medium text-ink">
                  {visualization.label}
                </p>

                <span className="text-sm font-semibold text-slate-700">
                  {visualization.value}
                </span>
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full ${visualization.color}`}
                  style={{
                    width: percentage(visualization.value),
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
