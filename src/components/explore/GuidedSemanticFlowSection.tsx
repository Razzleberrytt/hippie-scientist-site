import Link from 'next/link'

const guidedFlows = [
  {
    href: '/supernodes/dopamine-systems',
    title: 'Follow dopamine exploration pathways',
    description:
      'Navigate motivation systems, adaptive reward pathways, and educational continuity flows related to focus and stimulation regulation.',
    category: 'foundational pathway',
  },
  {
    href: '/supernodes/gaba-systems',
    title: 'Explore calm signaling ecosystems',
    description:
      'Follow interconnected educational systems related to calm regulation, nervous system continuity, and recovery-oriented exploration.',
    category: 'continuity ecosystem',
  },
  {
    href: '/supernodes/sleep-recovery-ecosystems',
    title: 'Traverse recovery neuroscience systems',
    description:
      'Discover adaptive educational transitions related to restoration, overstimulation recovery, and semantic continuity pathways.',
    category: 'adaptive traversal',
  },
  {
    href: '/learn/how-learning-affects-neuroplasticity',
    title: 'Understand neuroplasticity progression',
    description:
      'Explore connected educational systems focused on adaptation, resilience, learning pathways, and continuity-aware cognition.',
    category: 'educational progression',
  },
]

export function GuidedSemanticFlowSection() {
  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">
          Guided Exploration Flows
        </p>
 
        <h2 className="text-3xl font-semibold tracking-tight text-ink">
          Navigate educational ecosystems intentionally
        </h2>
 
        <p className="max-w-3xl text-base leading-7 text-muted">
          Follow adaptive semantic exploration routes designed to
          reduce overwhelm while improving continuity-oriented
          educational discovery.
        </p>
      </div>
 
      <div className="grid gap-5 md:grid-cols-2">
        {guidedFlows.map((flow) => (
          <Link
            key={flow.href}
            href={flow.href}
            className="group rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50/70 to-white p-6 shadow-sm transition motion-safe:hover:-translate-y-1 hover:border-emerald-300 hover:shadow-lg"
          >
            <div className="space-y-5">
              <div className="flex items-center justify-between gap-3">
                <span className="rounded-full border border-emerald-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700">
                  {flow.category}
                </span>

                <span className="text-sm font-medium text-emerald-700">
                  Begin flow →
                </span>
              </div>

              <div>
                <h3 className="text-2xl font-semibold tracking-tight text-ink transition group-hover:text-emerald-900">
                  {flow.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-muted">
                  {flow.description}
                </p>
              </div>

              <div className="flex flex-wrap gap-2 border-t border-emerald-100 pt-4">
                <span className="rounded-full bg-neutral-100 px-3 py-1 text-[11px] text-neutral-700">
                  guided continuity
                </span>

                <span className="rounded-full bg-neutral-100 px-3 py-1 text-[11px] text-neutral-700">
                  adaptive onboarding
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
