import Link from 'next/link'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import RuntimeOrchestratedDiscovery from '@/components/runtime/runtime-orchestrated-discovery'

const protocolRecord = {
  title: 'Non-Stimulant Focus',
  summary:
    'Educational exploration of calm focus systems, cognition support, attentional continuity, dopaminergic balance, stress-aware productivity systems, and non-stimulant neuropharmacology.',
  effects: ['focus support', 'calm cognition', 'attention support'],
  mechanisms: ['dopaminergic balance', 'cognition support', 'stress-aware focus'],
  categories: ['focus', 'cognition', 'nootropic'],
}

const systems = [
  {
    href: '/pathways/dopamine',
    title: 'Dopamine Pathway',
  },
  {
    href: '/compounds/l-theanine',
    title: 'L-Theanine',
  },
  {
    href: '/herbs/rhodiola',
    title: 'Rhodiola',
  },
  {
    href: '/education/what-is-a-nootropic',
    title: 'What Is a Nootropic?',
  },
]

export default function NonStimulantFocusPage() {
  return (
    <main className="container-page py-10 space-y-10">
      <AuthorityJsonLd
        title="Non-Stimulant Focus"
        description="Educational protocol exploring calm focus systems, cognition support, dopaminergic balance, and non-stimulant neuropharmacology."
        url="https://www.thehippiescientist.net/protocols/non-stimulant-focus"
        type="Article"
      />

      <AuthorityBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Protocols', href: '/protocols' },
          { label: 'Non-Stimulant Focus' },
        ]}
      />

      <section className="space-y-5 max-w-4xl">
        <p className="eyebrow-label">Protocol Ecosystem</p>

        <h1 className="text-5xl font-bold tracking-tight text-ink">
          Non-Stimulant Focus
        </h1>

        <p className="text-lg leading-8 text-[#46574d]">
          Educational exploration of calm focus systems, cognition support, dopaminergic balance, stress-aware productivity systems, and non-stimulant neuropharmacology.
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

      <RuntimeOrchestratedDiscovery
        record={protocolRecord}
        title="Explore cognition and focus systems"
      />
    </main>
  )
}
