import type { Metadata } from 'next'
import { buildPageMetadata } from '../../../src/lib/seo'
import Link from 'next/link'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
export const metadata: Metadata = buildPageMetadata({
  title: "Calming Psychoactives",
  description: "Educational exploration of calming psychoactive herbs, inhibitory neuropharmacology, stress regulation, and GABAergic systems.",
  path: "/psychoactive/calming/",
})


const profiles = [
  {
    href: '/herbs/kava',
    title: 'Kava',
  },
  {
    href: '/herbs/blue-lotus',
    title: 'Blue Lotus',
  },
  {
    href: '/herbs/valerian',
    title: 'Valerian',
  },
  {
    href: '/compounds/l-theanine',
    title: 'L-Theanine',
  },
]

export default function CalmingPsychoactivesPage() {
  return (
    <div className="container-page py-10 space-y-10">
      <AuthorityJsonLd
        title="Calming Psychoactives"
        description="Educational exploration of calming psychoactive herbs, inhibitory neuropharmacology, stress regulation, and GABAergic systems."
        url="https://thehippiescientist.net/psychoactive/calming"
        type="CollectionPage"
      />

      <AuthorityBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Psychoactive Research', href: '/psychoactive' },
          { label: 'Calming Psychoactives' },
        ]}
      />

      <section className="space-y-4 max-w-4xl">
        <p className="eyebrow-label">Psychoactive Ecosystem</p>

        <h1 className="text-4xl font-bold tracking-tight text-ink">
          Calming Psychoactives
        </h1>

        <p className="text-lg leading-8 text-[#46574d]">
          Educational exploration of calming psychoactive herbs, inhibitory signaling systems, stress-response modulation, and GABA-oriented neuropharmacology.
        </p>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        {profiles.map((profile) => (
          <Link
            key={profile.href}
            href={profile.href}
            className="card-premium p-6 transition hover:-translate-y-0.5"
          >
            <div className="space-y-3">
              <p className="eyebrow-label">Related Profile</p>
              <h2 className="text-2xl font-semibold tracking-tight text-ink">
                {profile.title}
              </h2>
            </div>
          </Link>
        ))}
      </section>
    </div>
  )
}
