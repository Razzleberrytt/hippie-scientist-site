import Link from 'next/link'

import { buildRuntimeAuthorityNavigation } from '../../lib/runtime-authority-navigation'

function normalizeText(value: unknown) {
  return typeof value === 'string'
    ? value.trim()
    : ''
}

type AuthorityHubSectionProps = {
  source: any
  candidates: any[]
}

export function AuthorityHubSection({
  source,
  candidates,
}: AuthorityHubSectionProps) {
  const hubs = buildRuntimeAuthorityNavigation(
    source,
    candidates,
  ).slice(0, 6)

  if (hubs.length === 0) {
    return null
  }

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">
          Authority Hubs
        </p>

        <h2 className="text-3xl font-semibold tracking-tight text-ink">
          Foundational educational ecosystems
        </h2>

        <p className="max-w-3xl text-base leading-7 text-muted">
          Explore interconnected pathways, neuroscience systems,
          recovery frameworks, and foundational educational
          clusters.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {hubs.map((hub) => (
          <Link
            key={hub.slug}
            href={`/explore/${hub.slug}`}
            className="group rounded-3xl border border-neutral-200 bg-white/80 p-6 shadow-sm transition motion-safe:hover:-translate-y-1 hover:border-emerald-300 hover:shadow-lg"
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700">
                {hub.authorityRole.replace('-', ' ')}
              </span>

              <span className="text-xs text-muted">
                Priority {hub.authorityPriority}
              </span>
            </div>

            <div className="space-y-3">
              <h3 className="text-xl font-semibold text-ink transition group-hover:text-emerald-800">
                {normalizeText(hub.slug)
                  .split('-')
                  .map(
                    (part) =>
                      part.charAt(0).toUpperCase() +
                      part.slice(1),
                  )
                  .join(' ')}
              </h3>

              <p className="text-sm leading-6 text-muted">
                Explore continuity-aware educational systems,
                interconnected pathways, and authority-guided
                discovery experiences.
              </p>
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-neutral-100 pt-4">
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-neutral-100 px-2 py-1 text-[11px] text-neutral-700">
                  continuity aware
                </span>

                <span className="rounded-full bg-neutral-100 px-2 py-1 text-[11px] text-neutral-700">
                  authority guided
                </span>
              </div>

              <span className="text-sm font-medium text-emerald-700">
                Explore →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
