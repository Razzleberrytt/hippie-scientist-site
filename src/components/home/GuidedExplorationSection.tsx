import Link from 'next/link'

const explorationFlows = [
  {
    href: '/education/why-calm-focus-differs-from-stimulation',
    title: 'Explore calm focus systems',
    description:
      'Discover adaptive pathways related to focus, regulation, resilience, and recovery-oriented cognition.',
    label: 'guided exploration',
  },
  {
    href: '/education/how-the-brain-recovers-from-fatigue',
    title: 'Understand recovery neuroscience',
    description:
      'Navigate educational ecosystems related to overstimulation recovery, nervous system restoration, and adaptive balance.',
    label: 'continuity pathway',
  },
  {
    href: '/education/how-learning-affects-neuroplasticity',
    title: 'Learn neuroplasticity pathways',
    description:
      'Explore interconnected systems related to adaptation, learning, resilience, and cognitive flexibility.',
    label: 'foundational ecosystem',
  },
  {
    href: '/education/how-sleep-affects-neurochemistry',
    title: 'Follow sleep continuity systems',
    description:
      'Investigate semantic continuity pathways related to sleep architecture, calm signaling, and recovery support.',
    label: 'adaptive discovery',
  },
]

export function GuidedExplorationSection() {
  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-violet-700">
          Guided Exploration
        </p>
 
        <h2 className="text-3xl font-semibold tracking-tight text-ink">
          Start with adaptive educational pathways
        </h2>
 
        <p className="max-w-3xl text-base leading-7 text-muted">
          Follow guided educational systems designed to reduce
          overwhelm while helping you navigate interconnected
          pathways, ecosystems, and continuity-aware discovery.
        </p>
      </div>
 
      <div className="grid gap-5 md:grid-cols-2">
        {explorationFlows.map((flow) => (
          <Link
            key={flow.href}
            href={flow.href}
            className="group rounded-3xl border border-violet-100 bg-gradient-to-br from-violet-50/80 to-white p-6 shadow-sm transition motion-safe:hover:-translate-y-1 hover:border-violet-300 hover:shadow-lg"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <span className="rounded-full border border-violet-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-violet-700">
                  {flow.label}
                </span>

                <span className="text-sm font-medium text-violet-700">
                  Explore →
                </span>
              </div>

              <div className="space-y-3">
                <h3 className="text-2xl font-semibold tracking-tight text-ink transition group-hover:text-violet-900">
                  {flow.title}
                </h3>

                <p className="text-sm leading-6 text-muted">
                  {flow.description}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
