import type { Metadata } from 'next'
import { buildPageMetadata } from '../../../src/lib/seo'
import Link from 'next/link'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
export const metadata: Metadata = buildPageMetadata({
  title: "Glutamate Pathway",
  description: "Educational exploration of glutamatergic signaling, excitatory neurochemistry, dissociative mechanisms, and psychoactive neuropharmacology.",
  path: "/education/glutamate/",
})


const systems = [
  {
    href: '/psychoactive/dissociative-mechanisms',
    title: 'Dissociative Mechanisms',
  },
  {
    href: '/education/what-is-neuropharmacology',
    title: 'Neuropharmacology',
  },
  {
    href: '/education/gaba',
    title: 'GABA Pathway',
  },
]

export default function GlutamatePathwayPage() {
  return (
    <div className="container-page py-10 space-y-10">
      <AuthorityJsonLd
        title="Glutamate Pathway"
        description="Educational exploration of glutamatergic signaling, excitatory neurochemistry, dissociative mechanisms, and psychoactive neuropharmacology."
        url="https://thehippiescientist.net/education/glutamate"
        type="Article"
      />

      <AuthorityBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Education', href: '/education' },
          { label: 'Glutamate' },
        ]}
      />

      <section className="space-y-5 max-w-4xl">
        <p className="eyebrow-label">Pathway Supernode</p>

        <h1 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl lg:text-5xl">
          Glutamate Pathway
        </h1>

        <p className="text-lg leading-8 text-[#46574d]">
          Educational exploration of excitatory signaling systems, glutamatergic neurochemistry, dissociative mechanisms, cognition pathways, and psychoactive neuropharmacology.
        </p>

        <p className="text-base leading-8 text-[#5c6b63]">
          Glutamatergic systems are involved in cognition, learning, neuroplasticity, excitatory signaling balance, and altered-state neuropharmacology.
        </p>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        {systems.map((system) => (
          <Link
            key={system.href}
            href={system.href}
            className="card-premium p-6 transition motion-safe:hover:-translate-y-0.5"
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
