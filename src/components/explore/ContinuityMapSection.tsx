import { clampScore } from '@/lib/runtime-render-guards'

type ContinuityMap = {
  cluster: string
  continuity: number
  related: any[]
}

function buildContinuityMap(source: any, candidates: any[]): ContinuityMap[] {
  const baseClusters = Array.isArray(source?.clusters)
    ? source.clusters.slice(0, 4)
    : []

  return baseClusters.map((cluster: string, index: number) => ({
    cluster,
    continuity: clampScore(88 - index * 12),
    related: candidates
      .filter((candidate) =>
        Array.isArray(candidate?.clusters) &&
        candidate.clusters.includes(cluster),
      )
      .slice(0, 3),
  }))
}

type ContinuityMapSectionProps = {
  source: any
  candidates: any[]
}

export function ContinuityMapSection({
  source,
  candidates,
}: ContinuityMapSectionProps) {
  const continuityMaps = buildContinuityMap(source, candidates)

  if (continuityMaps.length === 0) {
    return null
  }

  return (
    <section className="space-y-6 rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50/70 to-white p-6 shadow-sm">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-indigo-700">
          Continuity Maps
        </p>

        <h2 className="text-3xl font-semibold tracking-tight text-ink">
          Explore semantic continuity relationships
        </h2>

        <p className="max-w-3xl text-base leading-7 text-muted">
          Navigate continuity density, adaptive ecosystem overlap,
          and semantic traversal relationships across educational
          pathways.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {continuityMaps.map((map) => (
          <div
            key={map.cluster}
            className="rounded-2xl border border-indigo-100 bg-white/80 p-5"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-xl font-semibold text-ink">
                  {map.cluster}
                </h3>

                <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-800">
                  continuity {map.continuity}
                </span>
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-indigo-100">
                <div
                  className="h-full rounded-full bg-indigo-500"
                  style={{ width: `${map.continuity}%` }}
                />
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                {map.related.map((related: any) => (
                  <span
                    key={related.slug}
                    className="rounded-full bg-neutral-100 px-3 py-1 text-xs text-neutral-700"
                  >
                    {related.name || related.slug}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
