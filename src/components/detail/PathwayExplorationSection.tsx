import Link from 'next/link'

import { buildMultiHopTraversal } from '../../lib/multi-hop-traversal'

function formatLabel(value: string) {
  return value
    .split('-')
    .map(
      (part) => part.charAt(0).toUpperCase() + part.slice(1),
    )
    .join(' ')
}

type PathwayExplorationSectionProps = {
  source: any
  candidates: any[]
}

export function PathwayExplorationSection({
  source,
  candidates,
}: PathwayExplorationSectionProps) {
  const traversals = buildMultiHopTraversal(
    source,
    candidates,
  ).slice(0, 7)

  if (traversals.length === 0) {
    return null
  }

  return (
    <section className="space-y-6 rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50/70 to-white p-6 shadow-sm">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-indigo-700">
          Pathway Exploration
        </p>

        <h2 className="text-2xl font-semibold tracking-tight text-ink">
          Follow related educational pathways
        </h2>

        <p className="max-w-3xl text-sm leading-7 text-muted">
          Explore connected topics, related mechanisms, and
          educational pathways that build on this profile.
        </p>
      </div>

      <div className="space-y-4">
        {traversals.map((traversal, index) => (
          <Link
            key={traversal.slug}
            href={`/explore/${traversal.slug}`}
            className="group flex flex-col gap-4 rounded-2xl border border-indigo-100 bg-white/80 p-5 transition hover:-translate-y-1 hover:border-indigo-300 hover:shadow-md lg:flex-row lg:items-center lg:justify-between"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-100 text-sm font-semibold text-indigo-800">
                {index + 1}
              </div>

              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-indigo-700">
                    {traversal.traversalRole.replace('-', ' ')}
                  </span>

                  <span className="rounded-full bg-indigo-100 px-3 py-1 text-[11px] font-medium text-indigo-800">
                    relevance {traversal.traversalScore}
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-ink transition group-hover:text-indigo-900">
                    {formatLabel(traversal.slug)}
                  </h3>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
                    Continue with related topics, educational
                    context, and connected pathway reading.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 lg:flex-col lg:items-end">
              <div className="rounded-2xl bg-indigo-50 px-4 py-3 text-right">
                <p className="text-[11px] uppercase tracking-[0.18em] text-muted">
                  Relevance
                </p>

                <p className="text-2xl font-semibold text-indigo-900">
                  {traversal.traversalScore}
                </p>
              </div>

              <span className="text-sm font-medium text-indigo-700">
                Explore pathway →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
