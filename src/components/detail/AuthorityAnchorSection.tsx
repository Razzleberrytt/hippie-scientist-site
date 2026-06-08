import Link from 'next/link'

import { buildRuntimeAuthorityNavigation } from '@/lib/runtime-authority-navigation'

function formatLabel(value: string) {
  return value
    .split('-')
    .map(
      (part) => part.charAt(0).toUpperCase() + part.slice(1),
    )
    .join(' ')
}

type AuthorityAnchorSectionProps = {
  source: any
  candidates: any[]
}

export function AuthorityAnchorSection({
  source,
  candidates,
}: AuthorityAnchorSectionProps) {
  const anchors = buildRuntimeAuthorityNavigation(
    source,
    candidates,
  )
    .filter(
      (item) =>
        item.authorityRole === 'foundational-hub' ||
        item.authorityRole === 'canonical-hub',
    )
    .slice(0, 5)

  if (anchors.length === 0) {
    return null
  }

  return (
    <section className="space-y-6 rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50/70 to-white p-6 shadow-sm">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">
          Authority Anchors
        </p>

        <h2 className="text-2xl font-semibold tracking-tight text-ink">
          Foundational educational systems
        </h2>

        <p className="max-w-3xl text-sm leading-7 text-muted">
          Explore foundational educational hubs, canonical
          pathways, and authority-oriented ecosystem anchors.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {anchors.map((anchor) => (
          <Link
            key={anchor.slug}
            href={`/explore/${anchor.slug}`}
            className="group rounded-2xl border border-emerald-100 bg-white/80 p-5 transition hover:-translate-y-1 hover:border-emerald-300 hover:shadow-md"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700">
                  {anchor.authorityRole.replace('-', ' ')}
                </span>

                <span className="rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-medium text-emerald-800">
                  authority {anchor.authorityPriority}
                </span>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-ink transition group-hover:text-emerald-900">
                  {formatLabel(anchor.slug)}
                </h3>

                <p className="mt-2 text-sm leading-6 text-muted">
                  Explore canonical educational ecosystems,
                  foundational semantic systems, and continuity-
                  aware authority pathways.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 border-t border-emerald-100 pt-4">
                <span className="rounded-full bg-neutral-100 px-3 py-1 text-[11px] text-neutral-700">
                  foundational system
                </span>

                <span className="rounded-full bg-neutral-100 px-3 py-1 text-[11px] text-neutral-700">
                  authority guided
                </span>

                {anchor.continuityEligible ? (
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-[11px] text-emerald-800">
                    continuity eligible
                  </span>
                ) : null}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
