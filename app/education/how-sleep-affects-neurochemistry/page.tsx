import Link from 'next/link'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'

const sections = [
  {
    title: 'Recovery Continuity',
    body: 'Sleep continuity is associated with nervous-system recovery, emotional regulation, fatigue systems, cognition pathways, and physiological restoration.',
  },
  {
    title: 'Dream Architecture',
    body: 'REM systems, dream vividness, memory continuity, and cholinergic signaling may all intersect with sleep-oriented neuropharmacology.',
  },
  {
    title: 'Stress and Sleep',
    body: 'Stress-response burden may influence sleep architecture, emotional-processing continuity, nervous-system arousal, and restorative sleep quality.',
  },
]

const related = [
  {
    href: '/pathways/cholinergic-system',
    title: 'Cholinergic System',
  },
  {
    href: '/pathways/gaba',
    title: 'GABA Pathway',
  },
  {
    href: '/best-for/sleep-support',
    title: 'Sleep Support',
  },
  {
    href: '/psychoactive/dream-herbs',
    title: 'Dream Herbs',
  },
]

export default function SleepNeurochemistryPage() {
  return (
    <main className="container-page py-10 space-y-12">
      <AuthorityJsonLd
        title="How Sleep Affects Neurochemistry"
        description="Educational exploration of sleep neurochemistry, REM systems, recovery continuity, nervous-system restoration, and dream-related signaling."
        url="https://thehippiescientist.net/education/how-sleep-affects-neurochemistry"
        type="Article"
      />

      <AuthorityBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Education', href: '/education' },
          { label: 'How Sleep Affects Neurochemistry' },
        ]}
      />

      <section className="space-y-6 max-w-4xl">
        <div className="space-y-3">
          <p className="eyebrow-label">Educational Supernode</p>

          <h1 className="text-5xl font-bold tracking-tight text-ink">
            How Sleep Affects Neurochemistry
          </h1>
        </div>

        <p className="text-xl leading-9 text-[#46574d]">
          Sleep-related neurochemistry involves interconnected systems associated with nervous-system restoration, recovery continuity, emotional regulation, cognition, REM architecture, and dream-state signaling.
        </p>

        <p className="text-base leading-8 text-[#5c6b63]">
          Educational sleep-neurochemistry discussions commonly intersect with GABAergic systems, cholinergic signaling, stress-response continuity, recovery biology, and dream-related neuropharmacology.
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
          <p className="eyebrow-label">Continue Exploring</p>

          <h2 className="text-3xl font-semibold tracking-tight text-ink">
            Related sleep and recovery systems
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
