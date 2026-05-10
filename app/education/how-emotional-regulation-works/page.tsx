import Link from 'next/link'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'

const systems = [
  {
    title: 'Mood and Neurochemistry',
    body: 'Emotional regulation involves interconnected signaling systems associated with stress adaptation, mood continuity, emotional processing, nervous-system balance, and recovery-oriented neuropharmacology.',
  },
  {
    title: 'Stress and Emotional Processing',
    body: 'Stress burden may influence emotional resilience, sleep continuity, cognition systems, nervous-system arousal, and recovery biology.',
  },
  {
    title: 'Recovery and Nervous-System Balance',
    body: 'Educational emotional-regulation discussions often intersect with calming systems, sleep architecture, adaptogenic support, and stress-response continuity.',
  },
]

const related = [
  {
    href: '/pathways/serotonin',
    title: 'Serotonin Pathway',
  },
  {
    href: '/pathways/gaba',
    title: 'GABA Pathway',
  },
  {
    href: '/protocols/stress-regulation',
    title: 'Stress Regulation',
  },
  {
    href: '/education/what-is-anxiety-neurochemistry',
    title: 'Anxiety Neurochemistry',
  },
]

export default function EmotionalRegulationPage() {
  return (
    <main className="container-page py-10 space-y-12">
      <AuthorityJsonLd
        title="How Emotional Regulation Works"
        description="Educational exploration of emotional regulation neurochemistry, stress signaling, mood systems, recovery continuity, and nervous-system balance."
        url="https://thehippiescientist.net/education/how-emotional-regulation-works"
        type="Article"
      />

      <AuthorityBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Education', href: '/education' },
          { label: 'How Emotional Regulation Works' },
        ]}
      />

      <section className="space-y-6 max-w-4xl">
        <div className="space-y-3">
          <p className="eyebrow-label">Educational Supernode</p>

          <h1 className="text-5xl font-bold tracking-tight text-ink">
            How Emotional Regulation Works
          </h1>
        </div>

        <p className="text-xl leading-9 text-[#46574d]">
          Emotional regulation involves interconnected neurochemical systems associated with mood continuity, stress adaptation, cognition, nervous-system resilience, recovery signaling, and emotional processing.
        </p>

        <p className="text-base leading-8 text-[#5c6b63]">
          Educational emotional-regulation discussions commonly intersect with serotonergic systems, calming neurochemistry, sleep continuity, stress biology, and recovery-oriented neuropharmacology.
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
            Related mood and stress systems
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
