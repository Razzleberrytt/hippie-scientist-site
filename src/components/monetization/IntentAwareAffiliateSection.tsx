import Link from 'next/link'

const affiliateFlows = [
  {
    slug: 'focus',
    title: 'Focus & cognition support systems',
    description:
      'Explore educational buying pathways related to cognition-oriented continuity systems and adaptive focus ecosystems.',
    intent: 'educational optimization',
  },
  {
    slug: 'anxiety',
    title: 'Stress-regulation educational pathways',
    description:
      'Discover continuity-aware educational systems related to calm support, adaptive recovery ecosystems, and resilience exploration.',
    intent: 'continuity support',
  },
  {
    slug: 'sleep',
    title: 'Sleep continuity ecosystems',
    description:
      'Navigate educational product ecosystems related to recovery continuity, restoration systems, and adaptive nighttime support.',
    intent: 'recovery ecosystem',
  },
  {
    slug: 'recovery',
    title: 'Metabolic educational systems',
    description:
      'Explore adaptive educational buying ecosystems focused on continuity-aware energy systems and metabolic pathway support.',
    intent: 'adaptive wellness',
  },
]

export function IntentAwareAffiliateSection() {
  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-700">
          Educational Recommendations
        </p>

        <h2 className="text-3xl font-semibold tracking-tight text-ink">
          Explore continuity-aware educational buying ecosystems
        </h2>

        <p className="max-w-3xl text-base leading-7 text-muted">
          Discover educational recommendation systems aligned with
          adaptive continuity pathways, semantic ecosystem intent,
          and trust-oriented exploration behavior.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {affiliateFlows.map((flow) => (
          <Link
            key={flow.slug}
            href={`/explore/${flow.slug}`}
            className="group rounded-3xl border border-amber-100 bg-gradient-to-br from-amber-50/70 to-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-amber-300 hover:shadow-lg"
          >
            <div className="space-y-5">
              <div className="flex items-center justify-between gap-3">
                <span className="rounded-full border border-amber-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-700">
                  {flow.intent}
                </span>

                <span className="text-sm font-medium text-amber-700">
                  Explore systems →
                </span>
              </div>

              <div>
                <h3 className="text-2xl font-semibold tracking-tight text-ink transition group-hover:text-amber-900">
                  {flow.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-muted">
                  {flow.description}
                </p>
              </div>

              <div className="flex flex-wrap gap-2 border-t border-amber-100 pt-4">
                <span className="rounded-full bg-neutral-100 px-3 py-1 text-[11px] text-neutral-700">
                  continuity aligned
                </span>

                <span className="rounded-full bg-neutral-100 px-3 py-1 text-[11px] text-neutral-700">
                  trust preserving
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
