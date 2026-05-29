import type { Metadata } from 'next'
import Link from 'next/link'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'

export const metadata: Metadata = {
  title: 'Supplement Protocol Guides',
  description: 'Evidence-aware protocol pages for stress regulation, sleep support, focus, burnout recovery, and recovery-oriented productivity.',
  alternates: { canonical: '/protocols' },
  openGraph: {
    title: 'Supplement Protocol Guides',
    description: 'Evidence-aware protocol pages for stress regulation, sleep support, focus, burnout recovery, and recovery-oriented productivity.',
    url: '/protocols',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Supplement Protocol Guides',
    description: 'Evidence-aware protocol guides for stress, sleep, focus, and recovery systems.',
  },
}

const protocols = [
  { slug: 'stress-regulation', title: 'Stress Regulation' },
  { slug: 'burnout-recovery', title: 'Burnout Recovery' },
  { slug: 'non-stimulant-focus', title: 'Non-Stimulant Focus' },
  { slug: 'deep-sleep-support', title: 'Deep Sleep Support' },
  { slug: 'overstimulation-recovery', title: 'Overstimulation Recovery' },
  { slug: 'recovery-oriented-productivity', title: 'Recovery-Oriented Productivity' },
]

export default function ProtocolsIndexPage() {
  return (
    <main className="container-page py-10 space-y-10">
      <AuthorityJsonLd
        title="Protocols"
        description="Evidence-aware protocol pages for stress, sleep, focus, and recovery systems."
        url="https://thehippiescientist.net/protocols"
        type="CollectionPage"
      />
      <section className="space-y-4 max-w-4xl">
        <p className="eyebrow-label">Depth Layer</p>
        <h1 className="text-5xl font-bold tracking-tight text-ink">Protocol Guides</h1>
      </section>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {protocols.map((protocol) => (
          <Link key={protocol.slug} href={`/protocols/${protocol.slug}`} className="card-premium p-5">
            <p className="eyebrow-label">Protocol</p>
            <h2 className="text-xl font-semibold tracking-tight text-ink">{protocol.title}</h2>
          </Link>
        ))}
      </section>
    </main>
  )
}
