import Link from 'next/link'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'

const sections = [
  {
    title: 'Stress-Response Burden',
    body: 'Chronic stress signaling may influence inflammatory pathways, nervous-system regulation, sleep continuity, fatigue systems, and cognitive resilience.',
  },
  {
    title: 'Cognition and Brain Fog',
    body: 'Educational neuroinflammation discussions often intersect with concentration difficulties, fatigue-related cognition changes, stress overload, and recovery-oriented neuropharmacology.',
  },
  {
    title: 'Sleep and Recovery Systems',
    body: 'Sleep architecture, nervous-system restoration, emotional regulation, and recovery continuity may all interact with inflammatory signaling systems.',
  },
]

const relatedSystems = [
  {
    href: '/protocols/burnout-recovery',
    title: 'Burnout Recovery',
  },
  {
    href: '/protocols/stress-regulation',
    title: 'Stress Regulation',
  },
  {
    href: '/education/what-are-adaptogens',
    title: 'Adaptogens',
  },
  {
    href: '/pathways/glutamate',
    title: 'Glutamate Pathway',
  },
]

export default function NeuroinflammationEducationPage() {
  return (
    <main className="container-page py-10 space-y-12">
      <AuthorityJsonLd
        title="What Is Neuroinflammation?"
        description="Educational exploration of neuroinflammation, stress-response biology, nervous-system signaling, cognition systems, and recovery-oriented neuropharmacology."
        url="https://thehippiescientist.net/education/what-is-neuroinflammation"
        type="Article"
      />

      <AuthorityBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Education', href: '/education' },
          { label: 'What Is Neuroinflammation?' },
        ]}
      />

      <section className="space-y-6 max-w-4xl">
        <div className="space-y-3">
          <p className="eyebrow-label">Educational Supernode</p>

          <h1 className="text-5xl font-bold tracking-tight text-ink">
            What Is Neuroinflammation?
          </h1>
        </div>

        <p className="text-xl leading-9 text-[#46574d]">
          Neuroinflammation refers to inflammatory signaling processes associated with the nervous system and brain-related immune activity. Educational exploration of neuroinflammation often intersects with stress biology, recovery systems, fatigue regulation, cognition, emotional processing, and sleep continuity.
        </p>

        <p className="text-base leading-8 text-[#5c6b63]">
          Neuroinflammatory discussions are complex and highly context dependent. Educational framing should remain conservative, evidence aware, and focused on systems biology rather than exaggerated claims.
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        {sections.map((section) => (
          <div key={section.title} className="card-premium p-6 space-y-4">
            <h2 className="text-2xl font-semibold tracking-tight text-ink">
              {section.title}
            </h2>

            <p className="text-sm leading-7 text-[#46574d]">
              {section.body}
            </p>
          </div>
        ))}
      </section>

      <section className="space-y-5">
        <div className="space-y-2">
          <p className="eyebrow-label">Related Educational Systems</p>

          <h2 className="text-3xl font-semibold tracking-tight text-ink">
            Continue exploring recovery-oriented neuropharmacology
          </h2>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          {relatedSystems.map((system) => (
            <Link
              key={system.href}
              href={system.href}
              className="card-premium p-6 transition hover:-translate-y-0.5"
            >
              <div className="space-y-3">
                <p className="eyebrow-label">Related System</p>

                <h3 className="text-2xl font-semibold tracking-tight text-ink">
                  {system.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  )
}
