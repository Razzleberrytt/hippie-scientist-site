import { buildRuntimeHomepageOrchestration } from '../../lib/runtime-homepage-orchestrator'

function normalize(value: number) {
  return Math.max(0, Math.min(100, value))
}

type AdaptiveMonetizationOrchestrationSectionProps = {
  source: any
  candidates: any[]
}

export function AdaptiveMonetizationOrchestrationSection({
  source,
  candidates,
}: AdaptiveMonetizationOrchestrationSectionProps) {
  const orchestration = buildRuntimeHomepageOrchestration(
    source,
    candidates,
  )

  const systems = [
    {
      label: 'Continuity orchestration',
      value: normalize(orchestration.continuityPriority),
      accent: 'bg-cyan-500',
    },
    {
      label: 'Trust-preserving monetization',
      value: normalize(orchestration.authorityPriority),
      accent: 'bg-emerald-500',
    },
    {
      label: 'Adaptive ecosystem alignment',
      value: normalize(orchestration.ecosystemPriority),
      accent: 'bg-violet-500',
    },
    {
      label: 'Semantic recommendation routing',
      value: normalize(orchestration.supernodePriority),
      accent: 'bg-amber-500',
    },
  ]

  return (
    <section className="space-y-6 rounded-3xl border border-neutral-200 bg-white/80 p-6 shadow-sm">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-indigo-700">
          Adaptive Monetization Orchestration
        </p>

        <h2 className="text-3xl font-semibold tracking-tight text-ink">
          Educational-commercial continuity systems
        </h2>

        <p className="max-w-3xl text-base leading-7 text-muted">
          Explore adaptive monetization orchestration aligned with
          educational continuity, semantic ecosystem traversal,
          trust-preserving recommendations, and governance-aware
          commercial systems.
        </p>
      </div>

      <div className="space-y-5">
        {systems.map((system) => (
          <div
            key={system.label}
            className="space-y-2"
          >
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-medium text-ink">
                {system.label}
              </p>

              <span className="text-sm font-semibold text-neutral-700">
                {system.value}
              </span>
            </div>

            <div className="h-3 overflow-hidden rounded-full bg-neutral-100">
              <div
                className={`h-full rounded-full ${system.accent}`}
                style={{ width: `${system.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
