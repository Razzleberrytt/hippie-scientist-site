import type { Metadata } from 'next'
import Link from 'next/link'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import { getEcosystemHubs } from '@/lib/ecosystem-hubs'

export const metadata: Metadata = {
  title: 'Ecosystems',
  description: 'Ecosystem hubs for mechanism continuity, pathway context, and practical exploration order.',
  robots: { index: false, follow: true },
}

const hubs = getEcosystemHubs()

export default function EcosystemsIndexPage() {
  return (
    <main className="container-page py-10 space-y-10">
      <AuthorityJsonLd
        title="Ecosystems"
        description="Ecosystem hubs for mechanism continuity, pathway context, and practical exploration order."
        url="https://thehippiescientist.net/ecosystems"
        type="CollectionPage"
      />
      <section className="space-y-4 max-w-4xl">
        <p className="eyebrow-label">Discovery Layer</p>
        <h1 className="text-5xl font-bold tracking-tight text-ink">Ecosystem Hubs</h1>
        <p className="text-lg leading-8 text-[#46574d]">Browse cross-linked ecosystems to compare stimulation profile, timeline profile, and beginner entry points.</p>
      </section>
      <section className="grid gap-5 md:grid-cols-2">
        {hubs.map((hub) => (
          <Link key={hub.slug} href={`/ecosystems/${hub.slug}`} className="card-premium p-6 space-y-3 transition hover:-translate-y-0.5">
            <p className="eyebrow-label">Ecosystem</p>
            <h2 className="text-2xl font-semibold tracking-tight text-ink">{hub.title}</h2>
            <p className="text-sm leading-7 text-[#46574d]">{hub.description}</p>
          </Link>
        ))}
      </section>
    </main>
  )
}
