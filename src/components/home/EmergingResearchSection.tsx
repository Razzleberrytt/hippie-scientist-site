import Link from 'next/link'

import { buildRuntimeHomepageModules } from '@/lib/runtime-homepage-adapter'

function formatLabel(value: string) {
  return value
    .split('-')
    .map(
      (part) => part.charAt(0).toUpperCase() + part.slice(1),
    )
    .join(' ')
}

type EmergingResearchSectionProps = {
  source: any
  candidates: any[]
}

export function EmergingResearchSection({
  source,
  candidates,
}: EmergingResearchSectionProps) {
  const emerging = buildRuntimeHomepageModules(
    source,
    candidates,
  )
    .filter(
      (item) => item.freshnessConfidence === 'strong',
    )
    .slice(0, 6)

  if (emerging.length === 0) {
    return null
  }

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-rose-700">
          Emerging Research
        </p>

        <h2 className="text-3xl font-semibold tracking-tight text-ink">
          Explore evolving educational ecosystems
        </h2>

        <p className="max-w-3xl text-base leading-7 text-muted">
          Discover adaptive educational systems, emerging
          continuity pathways, and evolving neuroscience-oriented
          exploration clusters.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {emerging.map((item) => (
          <Link
            key={item.slug}
            href={`/explore/${item.slug}`}
            className="group rounded-3xl border border-rose-100 bg-gradient-to-br from-rose-50/80 to-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-rose-300 hover:shadow-lg"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <span className="rounded-full border border-rose-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-rose-700">
                  emerging ecosystem
                </span>

                <span className="rounded-full bg-rose-100 px-3 py-1 text-[11px] font-medium text-rose-800">
                  freshness strong
                </span>
              </div>

              <div className="space-y-3">
                <h3 className="text-2xl font-semibold tracking-tight text-ink transition group-hover:text-rose-900">
                  {formatLabel(item.slug)}
                </h3>

                <p className="text-sm leading-6 text-muted">
                  Explore evolving educational continuity systems,
                  adaptive neuroscience pathways, and emerging
                  ecosystem relationships.
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-rose-100 pt-4">
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-white px-3 py-1 text-[11px] text-slate-700 shadow-sm">
                    evolving systems
                  </span>

                  <span className="rounded-full bg-white px-3 py-1 text-[11px] text-slate-700 shadow-sm">
                    adaptive discovery
                  </span>
                </div>

                <span className="text-sm font-medium text-rose-700">
                  Explore →
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
