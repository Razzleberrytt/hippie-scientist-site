import Link from 'next/link'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'

const mechanisms = [
  {
    title: 'Stress Signaling',
    body: 'Stress-response systems involve interconnected neurochemical signaling associated with vigilance, emotional processing, adaptation, sleep continuity, and physiological recovery.',
  },
  {
    title: 'Sleep and Recovery',
    body: 'Stress burden may influence sleep architecture, nervous-system recovery, emotional regulation, cognition systems, and fatigue-related neuropharmacology.',
  },
  {
    title: 'Focus and Cognition',
    body: 'Stress-related overload may intersect with concentration systems, motivation pathways, cognitive fatigue, and emotional-processing continuity.',
  },
]

const related = [
  {
    href: '/protocols/stress-regulation',
    title: 'Stress Regulation',
  },
  {
    href: '/protocols/burnout-recovery',
    title: 'Burnout Recovery',
  },
  {
    href: '/education/what-is-neuroinflammation',
    title: 'Neuroinflammation',
  },
  {
    href: '/education/what-are-adaptogens',
    title: 'Adaptogens',
  },
]

export default function StressBrainEducationPage() {
  return (
    <main className="container-page py-10 space-y-12">
      <AuthorityJsonLd
        title="How Stress Affects the Brain"
        description="Educational exploration of stress neurochemistry, emotional regulation, nervous-system signaling, sleep continuity, and recovery-oriented neuropharmacology."
        url="https://thehippiescientist.net/education/how-stress-affects-the-brain"
        type="Article"
      />

      <AuthorityBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Education', href: '/education' },
          { label: 'How Stress Affects the Brain' },
        ]}
      />

      <section className="space-y-6 max-w-4xl">
        <div className="space-y-3">
          <p className="eyebrow-label">Educational Supernode</p>

          <h1 className="text-5xl font-bold tracking-tight text-ink">
            How Stress Affects the Brain
          </h1>
        </div>

        <p className="text-xl leading-9 text-[#46574d]">
          Stress-related neurochemistry involves interconnected signaling systems associated with emotional regulation, cognition, vigilance, nervous-system activation, recovery continuity, and physiological adaptation.
        </p>

        <p className="text-base leading-8 text-[#5c6b63]">
          Educational stress-neurochemistry discussions commonly intersect with sleep systems, fatigue biology, stress-response regulation, emotional-processing continuity, and recovery-oriented neuropharmacology.
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        {mechanisms.map((mechanism) => (
          <div key={mechanism.title} className="card-premium p-6 space-y-4">
            <h2 className="text-2xl font-semibold tracking-tight text-ink">
              {mechanism.title}
            </h2>

            <p className="text-sm leading-7 text-[#46574d]">
              {mechanism.body}
            </p>
          </div>
        ))}
      </section>

      <section className="space-y-5">
        <div className="space-y-2">
          <p className="eyebrow-label">Continue Exploring</p>

          <h2 className="text-3xl font-semibold tracking-tight text-ink">
            Related recovery and stress systems
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
