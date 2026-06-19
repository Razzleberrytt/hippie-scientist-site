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

type PathwayContinuityMapSectionProps = {
  source: any
  candidates: any[]
}

export function PathwayContinuityMapSection({
  source,
  candidates,
}: PathwayContinuityMapSectionProps) {
  const continuity = buildRuntimePathwayContinuity(
    source,
    candidates,
  ).slice(0, 8)

  if (continuity.length === 0) {
    return null
  }

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-indigo-700">
          Continuity Maps
        </p>

        <h2 className="text-3xl font-semibold tracking-tight text-ink">
          Visualize connected educational pathways
        </h2>

        <p className="max-w-3xl text-base leading-7 text-muted">
          Follow related bridges and interconnected educational
          pathway flows.
        </p>
      </div>

      <div className="space-y-4">
        {continuity.map((item, index) => (
          <div
            key={item.slug}
            className="relative overflow-hidden rounded-3xl border border-indigo-100 bg-gradient-to-r from-indigo-50/70 to-white p-5 shadow-sm"
          >
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-5">
                <div className="flex flex-col items-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 text-sm font-semibold text-indigo-800">
                    {index + 1}
                  </div>

                  {index !== continuity.length - 1 ? (
                    <div className="mt-2 h-16 w-px bg-indigo-200" />
                  ) : null}
                </div>

                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full border border-indigo-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-indigo-700">
                      {item.continuityRole.replace('-', ' ')}
                    </span>

                    <span className="rounded-full bg-indigo-100 px-3 py-1 text-[11px] font-medium text-indigo-800">
                      relevance {item.continuityPriority}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-2xl font-semibold tracking-tight text-ink">
                      {formatLabel(item.slug)}
                    </h3>

                    <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
                      Explore continuity-aware educational bridges,
                      related topic groups, and connected pathway
                      progression.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 lg:flex-col lg:items-end">
                <div className="rounded-2xl bg-white/80 px-4 py-3 shadow-sm">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-muted">
                    Visibility
                  </p>

                  <p className="text-lg font-semibold text-indigo-900">
                    {item.recommendationVisibility}
                  </p>
                </div>

                <Link
                  href={`/explore/${item.slug}`}
                  className="text-sm font-medium text-indigo-700 transition hover:text-indigo-900"
                >
                  Follow pathway →
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
