import Link from 'next/link'

import { buildRuntimeHomepageOrchestration } from '@/lib/runtime-homepage-orchestrator'

function formatLabel(value: string) {
  return value
    .split('-')
    .map(
      (part) => part.charAt(0).toUpperCase() + part.slice(1),
    )
    .join(' ')
}

type EcosystemHubSectionProps = {
  source: any
  candidates: any[]
}

export function EcosystemHubSection({
  source,
  candidates,
}: EcosystemHubSectionProps) {
  const orchestration = buildRuntimeHomepageOrchestration(
    source,
    candidates,
  )

  const hubs = orchestration.prioritizedModules.slice(0, 8)

  if (hubs.length === 0) {
    return null
  }

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-700">
          Ecosystem Hubs
        </p>

        <h2 className="text-3xl font-semibold tracking-tight text-ink">
          Explore interconnected educational ecosystems
        </h2>

        <p className="max-w-3xl text-base leading-7 text-muted">
          Navigate continuity-aware educational hubs, adaptive
          semantic pathways, and ecosystem-oriented discovery
          systems.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {hubs.map((hub) => (
          <Link
            key={hub.slug}
            href={`/explore/${hub.slug}`}
            className="group rounded-3xl border border-cyan-100 bg-gradient-to-br from-cyan-50/70 to-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-cyan-300 hover:shadow-lg"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <span className="rounded-full border border-cyan-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-700">
                  ecosystem hub
                </span>

                <span className="rounded-full bg-cyan-100 px-3 py-1 text-[11px] font-medium text-cyan-800">
                  {hub.homepagePriority}
                </span>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-ink transition group-hover:text-cyan-900">
                  {formatLabel(hub.slug)}
                </h3>

                <p className="mt-2 text-sm leading-6 text-muted">
                  Explore adaptive ecosystem continuity systems,
                  connected educational pathways, and semantic
                  discovery relationships.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 border-t border-cyan-100 pt-4">
                <span className="rounded-full bg-neutral-100 px-3 py-1 text-[11px] text-neutral-700">
                  continuity aware
                </span>

                <span className="rounded-full bg-neutral-100 px-3 py-1 text-[11px] text-neutral-700">
                  adaptive exploration
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
