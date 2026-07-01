import type { Metadata } from 'next'
import { buildPageMetadata } from '../../../src/lib/seo'
import Link from 'next/link'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
export const metadata: Metadata = buildPageMetadata({
  title: "GABA vs Serotonin",
  description: "Educational comparison of GABAergic and serotonergic systems, calming pathways, mood regulation, and psychoactive neuropharmacology.",
  path: "/learn/gaba-vs-serotonin/",
})


export default function GabaVsSerotoninPage() {
  return (
    <div className="container-page py-10 space-y-10">
      <AuthorityJsonLd
        title="GABA vs Serotonin"
        description="Educational comparison of GABAergic and serotonergic systems, calming pathways, mood regulation, and psychoactive neuropharmacology."
        url="https://thehippiescientist.net/learn/gaba-vs-serotonin"
        type="Article"
      />

      <AuthorityBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Education', href: '/learn' },
          { label: 'GABA vs Serotonin' },
        ]}
      />

      <section className="space-y-4 max-w-4xl">
        <p className="eyebrow-label">Mechanism Comparison</p>
        <h1 className="text-4xl font-bold tracking-tight text-ink">
          GABA vs Serotonin
        </h1>
        <p className="text-lg leading-8 text-muted">
          GABAergic and serotonergic systems influence very different aspects of neurochemistry, mood regulation, stress response, perception, and consciousness.
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="card-premium p-6 space-y-4">
          <h2 className="text-2xl font-semibold">GABAergic Systems</h2>
          <p className="text-sm leading-7 text-muted">
            Associated with inhibitory signaling, nervous-system downregulation, relaxation, calming effects, and sleep-supportive mechanisms.
          </p>
          <div className="flex flex-wrap gap-2">
            <Link href="/learn/gaba" className="chip-readable">GABA Pathway</Link>
            <Link href="/learn/calming" className="chip-readable">Calming Psychoactives</Link>
          </div>
        </div>

        <div className="card-premium p-6 space-y-4">
          <h2 className="text-2xl font-semibold">Serotonergic Systems</h2>
          <p className="text-sm leading-7 text-muted">
            Associated with mood regulation, emotional processing, perception, cognition, and certain psychoactive or entheogenic mechanisms.
          </p>
          <div className="flex flex-wrap gap-2">
            <Link href="/learn/serotonin" className="chip-readable">Serotonin Pathway</Link>
            <Link href="/learn/calming" className="chip-readable">Mood Elevation</Link>
          </div>
        </div>
      </section>
    </div>
  )
}
