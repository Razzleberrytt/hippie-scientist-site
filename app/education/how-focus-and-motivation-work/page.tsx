import Link from 'next/link'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'

const systems = [
  {
    title: 'Motivation Signaling',
    body: 'Motivation-related neurochemistry commonly intersects with reward systems, stress adaptation, cognition continuity, emotional processing, and behavioral reinforcement pathways.',
  },
  {
    title: 'Stress and Productivity',
    body: 'Stress burden may influence cognitive endurance, mental fatigue, attention systems, nervous-system arousal, and focus continuity.',
  },
  {
    title: 'Calm Focus Systems',
    body: 'Educational focus discussions often involve balancing stimulation, recovery continuity, emotional regulation, and nervous-system resilience.',
  },
]

const related = [
  {
    href: '/pathways/dopamine',
    title: 'Dopamine Pathway',
  },
  {
    href: '/protocols/non-stimulant-focus',
    title: 'Non-Stimulant Focus',
  },
  {
    href: '/education/what-is-a-nootropic',
    title: 'What Is a Nootropic?',
  },
  {
    href: '/best-for/non-sedating-calm',
    title: 'Non-Sedating Calm',
  },
]

export default function FocusMotivationPage() {
  return (
    <main className="container-page py-10 space-y-12">
      <AuthorityJsonLd
        title="How Focus and Motivation Work"
        description="Educational exploration of focus neurochemistry, motivation signaling, cognition systems, calm productivity, and stress-aware neuropharmacology."
        url="https://thehippiescientist.net/education/how-focus-and-motivation-work"
        type="Article"
      />

      <AuthorityBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Education', href: '/education' },
          { label: 'How Focus and Motivation Work' },
        ]}
      />

      <section className="space-y-6 max-w-4xl">
        <div className="space-y-3">
          <p className="eyebrow-label">Educational Supernode</p>

          <h1 className="text-5xl font-bold tracking-tight text-ink">
            How Focus and Motivation Work
          </h1>
        </div>

        <p className="text-xl leading-9 text-[#46574d]">
          Focus and motivation involve interconnected neurochemical systems associated with cognition, behavioral drive, emotional regulation, stress adaptation, attention continuity, and nervous-system balance.
        </p>

        <p className="text-base leading-8 text-[#5c6b63]">
          Educational cognition discussions commonly intersect with dopaminergic signaling, stress-response continuity, recovery systems, sleep architecture, and calm-focus neuropharmacology.
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        {systems.map((system) => (
          <div key={system.title} className="card-premium p-6 space-y-4">
            <h2 className="text-2xl font-semibold tracking-tight text-ink">
              {system.title}
            </h2>

            <p className="text-sm leading-7 text-[#46574d]">
              {system.body}
            </p>
          </div>
        ))}
      </section>

      <section className="space-y-5">
        <div className="space-y-2">
          <p className="eyebrow-label">Continue Exploring</p>

          <h2 className="text-3xl font-semibold tracking-tight text-ink">
            Related cognition and productivity systems
          </h2>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          {related.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="card-premium p-6 transition hover:-translate-y-0.5"
            >
              <div className="space-y-3">
                <p className="eyebrow-label">Related Educational System</p>

                <h3 className="text-2xl font-semibold tracking-tight text-ink">
                  {item.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  )
}
