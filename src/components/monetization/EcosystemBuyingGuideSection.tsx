import Link from 'next/link'

const buyingGuides = [
  {
    slug: 'focus-ecosystem',
    title: 'Focus & productivity educational ecosystem',
    description:
      'Explore continuity-aware educational buying systems related to cognition support, adaptive productivity pathways, and semantic focus ecosystems.',
    category: 'cognitive continuity',
  },
  {
    slug: 'recovery-ecosystem',
    title: 'Recovery & restoration educational systems',
    description:
      'Navigate educational continuity pathways related to nervous-system recovery, adaptive restoration ecosystems, and resilience-oriented exploration.',
    category: 'recovery continuity',
  },
  {
    slug: 'sleep-ecosystem',
    title: 'Sleep-support ecosystem pathways',
    description:
      'Discover adaptive educational buying ecosystems focused on nighttime continuity, restorative pathways, and semantic recovery progression.',
    category: 'restoration systems',
  },
  {
    slug: 'metabolic-ecosystem',
    title: 'Metabolic educational continuity systems',
    description:
      'Explore ecosystem-oriented educational pathways related to adaptive energy continuity, metabolic support systems, and progression-aware discovery.',
    category: 'adaptive metabolism',
  },
]

export function EcosystemBuyingGuideSection() {
  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-700">
          Ecosystem Buying Guides
        </p>

        <h2 className="text-3xl font-semibold tracking-tight text-ink">
          Explore educational buying ecosystems intentionally
        </h2>

        <p className="max-w-3xl text-base leading-7 text-muted">
          Navigate continuity-aware educational buying pathways,
          adaptive ecosystem recommendations, and trust-oriented
          commercial discovery systems.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {buyingGuides.map((guide) => (
          <Link
            key={guide.slug}
            href={`/explore/${guide.slug}`}
            className="group rounded-3xl border border-cyan-100 bg-gradient-to-br from-cyan-50/70 to-white p-6 shadow-sm transition motion-safe:hover:-translate-y-1 hover:border-cyan-300 hover:shadow-lg"
          >
            <div className="space-y-5">
              <div className="flex items-center justify-between gap-3">
                <span className="rounded-full border border-cyan-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-700">
                  {guide.category}
                </span>

                <span className="text-sm font-medium text-cyan-700">
                  Explore guide →
                </span>
              </div>

              <div>
                <h3 className="text-2xl font-semibold tracking-tight text-ink transition group-hover:text-cyan-900">
                  {guide.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-muted">
                  {guide.description}
                </p>
              </div>

              <div className="flex flex-wrap gap-2 border-t border-cyan-100 pt-4">
                <span className="rounded-full bg-neutral-100 px-3 py-1 text-[11px] text-neutral-700">
                  educational commerce
                </span>

                <span className="rounded-full bg-neutral-100 px-3 py-1 text-[11px] text-neutral-700">
                  continuity aligned
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
