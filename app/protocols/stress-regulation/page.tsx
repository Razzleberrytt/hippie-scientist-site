import Link from 'next/link'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import RuntimeOrchestratedDiscovery from '@/components/runtime/runtime-orchestrated-discovery'

const protocolRecord = {
  title: 'Stress Regulation',
  summary:
    'Educational exploration of stress-response biology, calming neuropharmacology, adaptogenic support systems, emotional regulation, nervous-system balance, and recovery-oriented neuroscience.',
  effects: ['stress regulation', 'calming support', 'emotional regulation'],
  mechanisms: ['stress physiology', 'adaptogenic support', 'nervous-system regulation'],
  categories: ['stress', 'recovery', 'adaptogen'],
}

const systems = [
  {
    href: '/pathways/gaba',
    title: 'GABA Pathway',
  },
  {
    href: '/pathways/serotonin',
    title: 'Serotonin Pathway',
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

export default function StressRegulationPage() {
  return (
    <main className="container-page py-10 space-y-10">
      <AuthorityJsonLd
        title="Stress Regulation"
        description="Educational stress regulation protocol exploring calming systems, adaptogenic support, nervous-system balance, and neurochemical recovery."
        url="https://www.thehippiescientist.net/protocols/stress-regulation"
        type="Article"
      />

      <AuthorityBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Protocols', href: '/protocols' },
          { label: 'Stress Regulation' },
        ]}
      />

      <section className="space-y-5 max-w-4xl">
        <p className="eyebrow-label">Protocol Ecosystem</p>

        <h1 className="text-5xl font-bold tracking-tight text-ink">
          Stress Regulation
        </h1>

        <p className="text-lg leading-8 text-[#46574d]">
          Educational exploration of stress-response biology, calming neuropharmacology, adaptogenic support systems, nervous-system recovery, and emotional regulation pathways.
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
              <p className="eyebrow-label">Related System</p>

              <h2 className="text-2xl font-semibold tracking-tight text-ink">
                {system.title}
              </h2>
            </div>
          </Link>
        ))}
      </section>

      <RuntimeOrchestratedDiscovery
        record={protocolRecord}
        title="Explore calming and recovery systems"
      />
    </main>
  )
}
