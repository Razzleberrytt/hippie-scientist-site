import type { Metadata } from 'next'
import { buildPageMetadata } from '../../../src/lib/seo'
import Link from 'next/link'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
export const metadata: Metadata = buildPageMetadata({
  title: "Entheogens",
  description: "Educational exploration of entheogenic ethnobotany, psychoactive mechanisms, ceremonial traditions, and consciousness-oriented neuropharmacology.",
  path: "/psychoactive/entheogens/",
})


const profiles = [
  {
    href: '/herbs/blue-lotus',
    title: 'Blue Lotus',
  },
  {
    href: '/herbs/kanna',
    title: 'Kanna',
  },
]

export default function EntheogensPage() {
  return (
    <div className="container-page py-10 space-y-10">
      <AuthorityJsonLd
        title="Entheogens"
        description="Educational exploration of entheogenic ethnobotany, psychoactive mechanisms, ceremonial traditions, and consciousness-oriented neuropharmacology."
        url="https://thehippiescientist.net/psychoactive/entheogens"
        type="CollectionPage"
      />

      <AuthorityBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Psychoactive Research', href: '/psychoactive' },
          { label: 'Entheogens' },
        ]}
      />

      <section className="space-y-4 max-w-4xl">
        <p className="eyebrow-label">Psychoactive Ecosystem</p>

        <h1 className="text-4xl font-bold tracking-tight text-ink">
          Entheogens
        </h1>

        <p className="text-lg leading-8 text-muted">
          Educational exploration of consciousness-oriented ethnobotany, ceremonial traditions, serotonergic systems, and psychoactive neuropharmacology.
        </p>
      </section>

      <section className="grid gap-5 lg:grid-cols-3">
        {profiles.map((profile) => (
          <Link
            key={profile.href}
            href={profile.href}
            className="card-premium p-6 transition motion-safe:hover:-translate-y-0.5"
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
