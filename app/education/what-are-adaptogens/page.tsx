import Link from 'next/link'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'

const systems = [
  {
    href: '/protocols/stress-regulation',
    title: 'Stress Regulation',
  },
  {
    href: '/protocols/burnout-recovery',
    title: 'Burnout Recovery',
  },
  {
    href: '/herbs/rhodiola',
    title: 'Rhodiola',
  },
  {
    href: '/herbs/ashwagandha',
    title: 'Ashwagandha',
  },
]

export default function AdaptogensEducationPage() {
  return (
    <main className="container-page py-10 space-y-10">
      <AuthorityJsonLd
        title="What Are Adaptogens?"
        description="Educational introduction to adaptogens, stress-response systems, nervous-system regulation, and evidence-aware adaptogenic neuropharmacology."
        url="https://thehippiescientist.net/education/what-are-adaptogens"
        type="Article"
      />

      <AuthorityBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Education', href: '/education' },
          { label: 'What Are Adaptogens?' },
        ]}
      />

      <section className="space-y-5 max-w-4xl">
        <p className="eyebrow-label">Educational Supernode</p>

        <h1 className="text-5xl font-bold tracking-tight text-ink">
          What Are Adaptogens?
        </h1>

        <p className="text-lg leading-8 text-[#46574d]">
          Adaptogens are herbs and compounds associated with stress-response regulation, nervous-system resilience, fatigue recovery, and physiological adaptation systems.
        </p>

        <p className="text-base leading-8 text-[#5c6b63]">
          Educational adaptogen exploration involves stress biology, neuroendocrine signaling, emotional regulation, fatigue systems, and evidence-aware neuropharmacology.
        </p>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        {systems.map((system) => (
          <Link
            key={system.href}
            href={system.href}
            className="card-premium p-6 transition hover:-translate-y-0.5"
          >
            <div className="space-y-3">
              <p className="eyebrow-label">Related Educational System</p>

              <h2 className="text-2xl font-semibold tracking-tight text-ink">
                {system.title}
              </h2>
            </div>
          </Link>
        ))}
      </section>
    </main>
  )
}
