import Link from 'next/link'

import { buildRuntimeRecommendations } from '@/lib/runtime-recommendation-adapter'

function formatLabel(value: string) {
  return value
    .split('-')
    .map(
      (part) => part.charAt(0).toUpperCase() + part.slice(1),
    )
    .join(' ')
}

type SemanticComparePathwaysSectionProps = {
  source: any
  candidates: any[]
}

export function SemanticComparePathwaysSection({
  source,
  candidates,
}: SemanticComparePathwaysSectionProps) {
  const pathways = buildRuntimeRecommendations(
    source,
    candidates,
  )
    .filter((item) => item.renderPriority >= 55)
    .slice(0, 6)

  if (pathways.length === 0) {
    return null
  }

  return (
    <section className="space-y-6 rounded-3xl border border-violet-100 bg-gradient-to-br from-violet-50/70 to-white p-6 shadow-sm">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-violet-700">
          Compare Pathways
        </p>

        <h2 className="text-2xl font-semibold tracking-tight text-ink">
          Explore related educational systems
        </h2>

        <p className="max-w-3xl text-sm leading-7 text-muted">
          Compare continuity-aware educational pathways,
          adjacent ecosystems, and adaptive semantic exploration
          systems.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {pathways.map((pathway) => (
          <Link
            key={pathway.slug}
            href={`/explore/${pathway.slug}`}
            className="group rounded-2xl border border-violet-100 bg-white/80 p-5 transition hover:-translate-y-1 hover:border-violet-300 hover:shadow-md"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <span className="rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-violet-700">
                  semantic comparison
                </span>

                <span className="rounded-full bg-violet-100 px-3 py-1 text-[11px] font-medium text-violet-800">
                  {pathway.renderPriority}
                </span>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-ink transition group-hover:text-violet-900">
                  {formatLabel(pathway.slug)}
                </h3>

                <p className="mt-2 text-sm leading-6 text-muted">
                  Compare related educational ecosystems,
                  continuity-aware pathways, and adjacent semantic
                  exploration systems.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 border-t border-violet-100 pt-4">
                <span className="rounded-full bg-neutral-100 px-3 py-1 text-[11px] text-neutral-700">
                  adjacent pathways
                </span>

                <span className="rounded-full bg-neutral-100 px-3 py-1 text-[11px] text-neutral-700">
                  adaptive comparison
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
