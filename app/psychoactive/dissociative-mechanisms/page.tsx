import Link from 'next/link'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'

const systems = [
  {
    href: '/pathways/glutamate',
    title: 'Glutamate Pathway',
  },
  {
    href: '/education/what-is-neuropharmacology',
    title: 'Neuropharmacology',
  },
  {
    href: '/psychoactive/harm-reduction',
    title: 'Harm Reduction',
  },
]

export default function DissociativeMechanismsPage() {
  return (
    <div className="container-page py-10 space-y-10">
      <AuthorityJsonLd
        title="Dissociative Mechanisms"
        description="Educational exploration of dissociative neuropharmacology, glutamatergic signaling, altered-state mechanisms, and psychoactive ethnobotany."
        url="https://thehippiescientist.net/psychoactive/dissociative-mechanisms"
        type="CollectionPage"
      />

      <AuthorityBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Psychoactive Research', href: '/psychoactive' },
          { label: 'Dissociative Mechanisms' },
        ]}
      />

      <section className="space-y-5 max-w-4xl">
        <p className="eyebrow-label">Psychoactive Ecosystem</p>

        <h1 className="text-5xl font-bold tracking-tight text-ink">
          Dissociative Mechanisms
        </h1>

        <p className="text-lg leading-8 text-[#46574d]">
          Educational exploration of dissociative neuropharmacology, glutamatergic systems, altered-state mechanisms, excitatory signaling, and psychoactive ethnobotany.
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
    </div>
  )
}
