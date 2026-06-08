import Link from 'next/link'

import { buildRuntimePathwayContinuity } from '@/lib/runtime-pathway-continuity'

function formatLabel(value: string) {
  return value
    .split('-')
    .map(
      (part) => part.charAt(0).toUpperCase() + part.slice(1),
    )
    .join(' ')
}

type ContinuityChainSectionProps = {
  source: any
  candidates: any[]
}

export function ContinuityChainSection({
  source,
  candidates,
}: ContinuityChainSectionProps) {
  const continuity = buildRuntimePathwayContinuity(
    source,
    candidates,
  ).slice(0, 6)

  if (continuity.length === 0) {
    return null
  }

  return (
    <section className="space-y-6 rounded-3xl border border-amber-100 bg-gradient-to-br from-amber-50/70 to-white p-6 shadow-sm">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-700">
          Continuity Chains
        </p>

        <h2 className="text-2xl font-semibold tracking-tight text-ink">
          Explore connected educational pathways
        </h2>

        <p className="max-w-3xl text-sm leading-7 text-muted">
          Navigate continuity-aware educational relationships,
          semantic exploration systems, and adaptive pathway
          progression.
        </p>
      </div>

      <div className="space-y-4">
        {continuity.map((item, index) => (
          <Link
            key={item.slug}
            href={`/explore/${item.slug}`}
            className="group flex flex-col gap-4 rounded-2xl border border-amber-100 bg-white/80 p-5 transition hover:-translate-y-1 hover:border-amber-300 hover:shadow-md lg:flex-row lg:items-center lg:justify-between"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100 text-sm font-semibold text-amber-800">
                {index + 1}
              </div>

              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-700">
                    {item.continuityRole.replace('-', ' ')}
                  </span>

                  <span className="rounded-full bg-neutral-100 px-3 py-1 text-[11px] text-neutral-700">
                    {item.traversalRole.replace('-', ' ')}
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-ink transition group-hover:text-amber-900">
                    {formatLabel(item.slug)}
                  </h3>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
                    Continue exploring interconnected pathways,
                    semantic continuity systems, and adaptive
                    educational ecosystems.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 lg:flex-col lg:items-end">
              <div className="rounded-2xl bg-amber-50 px-4 py-3 text-right">
                <p className="text-[11px] uppercase tracking-[0.18em] text-muted">
                  Continuity
                </p>

                <p className="text-2xl font-semibold text-amber-900">
                  {item.continuityPriority}
                </p>
              </div>

              <span className="text-sm font-medium text-amber-700">
                Continue →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
