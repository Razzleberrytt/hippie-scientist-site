import Link from 'next/link'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'

const systems = [
  {
    href: '/education/what-are-adaptogens',
    title: 'Adaptogens',
  },
  {
    href: '/protocols/stress-regulation',
    title: 'Stress Regulation',
  },
  {
    href: '/pathways/dopamine',
    title: 'Dopamine Pathway',
  },
  {
    href: '/herbs/rhodiola',
    title: 'Rhodiola',
  },
]

export default function BurnoutRecoveryPage() {
  return (
    <main className="container-page py-10 space-y-10">
      <AuthorityJsonLd
        title="Burnout Recovery"
        description="Educational protocol exploring nervous-system recovery, fatigue regulation, adaptogenic support, and stress-aware neuropharmacology."
        url="https://www.thehippiescientist.net/protocols/burnout-recovery"
        type="Article"
      />

      <AuthorityBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Protocols', href: '/protocols' },
          { label: 'Burnout Recovery' },
        ]}
      />

      <section className="space-y-5 max-w-4xl">
        <p className="eyebrow-label">Protocol Ecosystem</p>

        <h1 className="text-5xl font-bold tracking-tight text-ink">
          Burnout Recovery
        </h1>

        <p className="text-lg leading-8 text-[#46574d]">
          Educational exploration of fatigue recovery, stress-response burden, nervous-system restoration, adaptogenic support, and recovery-oriented neuropharmacology.
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
