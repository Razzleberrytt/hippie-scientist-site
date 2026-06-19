import Link from 'next/link'

import { buildRuntimePathwayContinuity } from '../../lib/runtime-pathway-continuity'

function formatLabel(value: string) {
  return value
    .split('-')
    .map(
      (part) => part.charAt(0).toUpperCase() + part.slice(1),
    )
    .join(' ')
}

type ContinuityPathwaySectionProps = {
  source: any
  candidates: any[]
}

export function ContinuityPathwaySection({
  source,
  candidates,
}: ContinuityPathwaySectionProps) {
  const pathways = buildRuntimePathwayContinuity(
    source,
    candidates,
  ).slice(0, 5)

  if (pathways.length === 0) {
    return null
  }

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-700">
          Continuity Pathways
        </p>

        <h2 className="text-3xl font-semibold tracking-tight text-ink">
          Follow interconnected educational pathways
        </h2>

        <p className="max-w-3xl text-base leading-7 text-muted">
          Explore continuity-aware traversal systems that connect
          related ecosystems, pathways, and adaptive educational
          frameworks.
        </p>
      </div>

      <div className="space-y-4">
        {pathways.map((pathway, index) => (
          <Link
            key={pathway.slug}
            href={`/explore/${pathway.slug}`}
            className="group flex flex-col gap-5 rounded-3xl border border-amber-100 bg-gradient-to-r from-amber-50/80 to-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-amber-300 hover:shadow-lg lg:flex-row lg:items-center lg:justify-between"
          >
            <div className="flex items-start gap-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-lg font-semibold text-amber-800">
                {index + 1}
              </div>

              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full border border-amber-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-700">
                    {pathway.continuityRole.replace('-', ' ')}
                  </span>

                  <span className="rounded-full bg-amber-100 px-3 py-1 text-[11px] font-medium text-amber-800">
                    {pathway.traversalRole.replace('-', ' ')}
                  </span>
                </div>

                <div>
                  <h3 className="text-2xl font-semibold tracking-tight text-ink transition group-hover:text-amber-900">
                    {formatLabel(pathway.slug)}
                  </h3>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
                    Traverse continuity-aware educational systems,
                    adaptive pathway relationships, and semantic
                    exploration flows.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 lg:flex-col lg:items-end">
              <div className="rounded-2xl bg-white/80 px-4 py-3 text-right shadow-sm">
                <p className="text-[11px] uppercase tracking-[0.18em] text-muted">
                  Continuity
                </p>

                <p className="text-2xl font-semibold text-amber-900">
                  {pathway.continuityPriority}
                </p>
              </div>

              <span className="text-sm font-medium text-amber-700">
                Continue exploration →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
