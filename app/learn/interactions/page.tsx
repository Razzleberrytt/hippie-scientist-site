import type { Metadata } from 'next'
import { buildPageMetadata } from '../../../src/lib/seo'
import Link from 'next/link'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
export const metadata: Metadata = buildPageMetadata({
  title: "Psychoactive Interactions",
  description: "Educational exploration of psychoactive interaction awareness, pathway overlap, neurochemical safety, and evidence-informed harm reduction.",
  path: "/learn/interactions/",
})


const systems = [
  {
    href: '/learn/harm-reduction',
    title: 'Harm Reduction',
  },
  {
    href: '/learn/serotonergic-stacking-risks',
    title: 'Serotonergic Risks',
  },
  {
    href: '/learn/serotonin',
    title: 'Serotonin Pathway',
  },
  {
    href: '/learn/gaba',
    title: 'GABA Pathway',
  },
]

export default function PsychoactiveInteractionsPage() {
  return (
    <div className="container-page py-10 space-y-10">
      <AuthorityJsonLd
        title="Psychoactive Interactions"
        description="Educational exploration of psychoactive interaction awareness, pathway overlap, neurochemical safety, and evidence-informed harm reduction."
        url="https://thehippiescientist.net/learn/interactions"
        type="Article"
      />

      <AuthorityBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Psychoactive Research', href: '/psychoactive' },
          { label: 'Interactions' },
        ]}
      />

      <section className="space-y-5 max-w-4xl">
        <p className="eyebrow-label">Educational Safety Hub</p>

        <h1 className="text-5xl font-bold tracking-tight text-ink">
          Psychoactive Interactions
        </h1>

        <p className="text-lg leading-8 text-muted">
          Educational exploration of pathway overlap, neurochemical interactions, psychoactive safety systems, medication awareness, and conservative harm-reduction principles.
        </p>

        <p className="text-base leading-8 text-[#5c6b63]">
          Psychoactive substances may influence mood systems, sedation pathways, cognition, emotional processing, cardiovascular signaling, and sleep architecture simultaneously.
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
              <p className="eyebrow-label">Related Safety System</p>

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
