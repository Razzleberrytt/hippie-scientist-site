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

type EcosystemRelationshipSectionProps = {
  source: any
  candidates: any[]
}

export function EcosystemRelationshipSection({
  source,
  candidates,
}: EcosystemRelationshipSectionProps) {
  const ecosystems = buildRuntimeHomepageModules(
    source,
    candidates,
  )
    .filter(
      (item) => item.ecosystemContinuity >= 45,
    )
    .slice(0, 6)

  if (ecosystems.length === 0) {
    return null
  }

  return (
    <section className="space-y-6 rounded-3xl border border-sky-100 bg-gradient-to-br from-sky-50/70 to-white p-6 shadow-sm">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">
          Ecosystem Relationships
        </p>

        <h2 className="text-2xl font-semibold tracking-tight text-ink">
          Connected educational ecosystems
        </h2>

        <p className="max-w-3xl text-sm leading-7 text-muted">
          Explore adaptive educational systems, semantic
          continuity relationships, and pathway-aware ecosystem
          exploration.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {ecosystems.map((ecosystem) => (
          <Link
            key={ecosystem.slug}
            href={`/explore/${ecosystem.slug}`}
            className="group rounded-2xl border border-sky-100 bg-white/80 p-5 transition hover:-translate-y-1 hover:border-sky-300 hover:shadow-md"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-700">
                  ecosystem continuity
                </span>

                <span className="rounded-full bg-sky-100 px-3 py-1 text-[11px] font-medium text-sky-800">
                  {ecosystem.ecosystemContinuity}
                </span>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-ink transition group-hover:text-sky-900">
                  {formatLabel(ecosystem.slug)}
                </h3>

                <p className="mt-2 text-sm leading-6 text-muted">
                  Discover related pathways, adaptive educational
                  relationships, and continuity-aware ecosystem
                  exploration systems.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 border-t border-sky-100 pt-4">
                <span className="rounded-full bg-neutral-100 px-3 py-1 text-[11px] text-neutral-700">
                  continuity aware
                </span>

                <span className="rounded-full bg-neutral-100 px-3 py-1 text-[11px] text-neutral-700">
                  pathway linked
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
