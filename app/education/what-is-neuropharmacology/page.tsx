import type { Metadata } from 'next'
import { buildPageMetadata } from '../../../src/lib/seo'
import Link from 'next/link'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
export const metadata: Metadata = buildPageMetadata({
  title: "What Is Neuropharmacology?",
  description: "Educational introduction to neuropharmacology, psychoactive mechanisms, signaling pathways, and ethnobotanical neurochemistry.",
  path: "/education/what-is-neuropharmacology/",
})


const systems = [
  {
    href: '/education/serotonin',
    title: 'Serotonin Pathway',
  },
  {
    href: '/education/dopamine',
    title: 'Dopamine Pathway',
  },
  {
    href: '/education/gaba',
    title: 'GABA Pathway',
  },
  {
    href: '/education/glutamate',
    title: 'Glutamate Pathway',
  },
]

export default function NeuropharmacologyPage() {
  return (
    <div className="container-page py-10 space-y-10">
      <AuthorityJsonLd
        title="What Is Neuropharmacology?"
        description="Educational introduction to neuropharmacology, psychoactive mechanisms, signaling pathways, and ethnobotanical neurochemistry."
        url="https://thehippiescientist.net/education/what-is-neuropharmacology"
        type="Article"
      />

      <AuthorityBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Education', href: '/education' },
          { label: 'What Is Neuropharmacology?' },
        ]}
      />

      <section className="space-y-5 max-w-4xl">
        <p className="eyebrow-label">Educational Supernode</p>

        <h1 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl lg:text-5xl">
          What Is Neuropharmacology?
        </h1>

        <p className="text-lg leading-8 text-muted">
          Neuropharmacology is the study of how herbs, compounds, medications, and psychoactive substances interact with nervous-system signaling pathways.
        </p>

        <p className="text-base leading-8 text-[#5c6b63]">
          Educational neuropharmacology helps contextualize stress regulation, mood systems, cognition, sleep, emotional processing, and psychoactive mechanisms through pathway-oriented scientific exploration.
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
              <p className="eyebrow-label">Related Pathway</p>

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
