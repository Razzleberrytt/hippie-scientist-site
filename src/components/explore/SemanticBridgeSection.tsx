import Link from 'next/link'

import { buildMultiHopTraversal } from '@/lib/multi-hop-traversal'

function formatLabel(value: string) {
  return value
    .split('-')
    .map(
      (part) => part.charAt(0).toUpperCase() + part.slice(1),
    )
    .join(' ')
}

type SemanticBridgeSectionProps = {
  source: any
  candidates: any[]
}

export function SemanticBridgeSection({
  source,
  candidates,
}: SemanticBridgeSectionProps) {
  const bridges = buildMultiHopTraversal(
    source,
    candidates,
  )
    .filter((item) => item.traversalScore >= 55)
    .slice(0, 6)

  if (bridges.length === 0) {
    return null
  }

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-fuchsia-700">
          Semantic Bridges
        </p>

        <h2 className="text-3xl font-semibold tracking-tight text-ink">
          Explore crossover educational systems
        </h2>

        <p className="max-w-3xl text-base leading-7 text-muted">
          Navigate semantic bridge pathways that connect adaptive
          ecosystems, educational continuity systems, and related
          exploration regions.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {bridges.map((bridge) => (
          <Link
            key={bridge.slug}
            href={`/explore/${bridge.slug}`}
            className="group rounded-3xl border border-fuchsia-100 bg-gradient-to-br from-fuchsia-50/70 to-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-fuchsia-300 hover:shadow-lg"
          >
            <div className="space-y-5">
              <div className="flex items-center justify-between gap-3">
                <span className="rounded-full border border-fuchsia-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-fuchsia-700">
                  semantic bridge
                </span>

                <span className="rounded-full bg-fuchsia-100 px-3 py-1 text-[11px] font-medium text-fuchsia-800">
                  traversal {bridge.traversalScore}
                </span>
              </div>

              <div>
                <h3 className="text-2xl font-semibold tracking-tight text-ink transition group-hover:text-fuchsia-900">
                  {formatLabel(bridge.slug)}
                </h3>

                <p className="mt-3 text-sm leading-6 text-muted">
                  Explore crossover educational pathways,
                  continuity-aware ecosystem transitions, and
                  semantic relationship bridges.
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-fuchsia-100 pt-4">
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-neutral-100 px-3 py-1 text-[11px] text-neutral-700">
                    crossover pathways
                  </span>

                  <span className="rounded-full bg-neutral-100 px-3 py-1 text-[11px] text-neutral-700">
                    adaptive transitions
                  </span>
                </div>

                <span className="text-sm font-medium text-fuchsia-700">
                  Explore bridge →
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
