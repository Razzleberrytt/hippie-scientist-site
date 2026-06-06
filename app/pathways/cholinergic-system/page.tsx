import Link from 'next/link'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'

const systems = [
  {
    href: '/psychoactive/dream-herbs',
    title: 'Dream Herbs',
  },
  {
    href: '/herbs/mugwort',
    title: 'Mugwort',
  },
  {
    href: '/protocols/deep-sleep-support',
    title: 'Deep Sleep Support',
  },
]

export default function CholinergicSystemPage() {
  return (
    <main className="container-page py-10 space-y-10">
      <AuthorityJsonLd
        title="Cholinergic System"
        description="Educational exploration of cholinergic signaling, dreaming systems, cognition pathways, memory mechanisms, and oneirogenic neuropharmacology."
        url="https://thehippiescientist.net/pathways/cholinergic-system"
        type="Article"
      />

      <AuthorityBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Pathways', href: '/pathways' },
          { label: 'Cholinergic System' },
        ]}
      />

      <section className="space-y-5 max-w-4xl">
        <p className="eyebrow-label">Pathway Supernode</p>

        <h1 className="text-5xl font-bold tracking-tight text-ink">
          Cholinergic System
        </h1>

        <p className="text-lg leading-8 text-[#46574d]">
          Educational exploration of cholinergic signaling systems involved in cognition, memory pathways, REM architecture, dreaming systems, and oneirogenic neuropharmacology.
        </p>

        <p className="text-base leading-8 text-[#5c6b63]">
          Cholinergic systems are associated with learning, memory processing, dream vividness, cognition, and altered dream-state exploration.
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
