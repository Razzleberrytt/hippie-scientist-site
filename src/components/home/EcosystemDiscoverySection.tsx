import Link from 'next/link'

import { buildRuntimeHomepageModules } from '../../lib/runtime-homepage-adapter'

function formatLabel(value: string) {
  return value
    .split('-')
    .map(
      (part) => part.charAt(0).toUpperCase() + part.slice(1),
    )
    .join(' ')
}

type EcosystemDiscoverySectionProps = {
  source: any
  candidates: any[]
}

export function EcosystemDiscoverySection({
  source,
  candidates,
}: EcosystemDiscoverySectionProps) {
  const ecosystems = buildRuntimeHomepageModules(
    source,
    candidates,
  )
    .filter(
      (item) =>
        item.homepageRole === 'ecosystem-continuity' ||
        item.continuityModuleEligible,
    )
    .slice(0, 8)

  if (ecosystems.length === 0) {
    return null
  }

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">
          Ecosystem Discovery
        </p>

        <h2 className="text-3xl font-semibold tracking-tight text-ink">
          Explore connected educational ecosystems
        </h2>

        <p className="max-w-3xl text-base leading-7 text-muted">
          Navigate interconnected pathways, adaptive discovery
          systems, recovery frameworks, and continuity-aware
          exploration clusters.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {ecosystems.map((ecosystem) => (
          <Link
            key={ecosystem.slug}
            href={`/explore/${ecosystem.slug}`}
            className="group rounded-3xl border border-sky-100 bg-gradient-to-br from-sky-50/80 to-white p-6 shadow-sm transition motion-safe:hover:-translate-y-1 hover:border-sky-300 hover:shadow-lg"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full border border-sky-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-700">
                    {ecosystem.homepageRole.replace('-', ' ')}
                  </span>

                  <span className="rounded-full bg-sky-100 px-3 py-1 text-[11px] font-medium text-sky-800">
                    continuity {ecosystem.ecosystemContinuity}
                  </span>
                </div>

                <h3 className="text-2xl font-semibold tracking-tight text-ink transition group-hover:text-sky-900">
                  {formatLabel(ecosystem.slug)}
                </h3>

                <p className="max-w-xl text-sm leading-6 text-muted">
                  Explore semantic continuity systems, related
                  pathways, adaptive educational relationships,
                  and ecosystem-aware discovery experiences.
                </p>
              </div>

              <div className="rounded-2xl bg-white/80 px-4 py-3 text-right shadow-sm">
                <p className="text-[11px] uppercase tracking-[0.18em] text-muted">
                  Priority
                </p>

                <p className="text-2xl font-semibold text-sky-900">
                  {ecosystem.homepagePriority}
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2 border-t border-sky-100 pt-4">
              <span className="rounded-full bg-white px-3 py-1 text-[11px] text-slate-700 shadow-sm">
                pathway aware
              </span>

              <span className="rounded-full bg-white px-3 py-1 text-[11px] text-slate-700 shadow-sm">
                continuity guided
              </span>

              <span className="rounded-full bg-white px-3 py-1 text-[11px] text-slate-700 shadow-sm">
                ecosystem exploration
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
