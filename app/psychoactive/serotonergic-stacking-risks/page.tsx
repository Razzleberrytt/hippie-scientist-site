import type { Metadata } from 'next'
import { buildPageMetadata } from '../../../src/lib/seo'
import Link from 'next/link'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
export const metadata: Metadata = buildPageMetadata({
  title: "Serotonergic Stacking Risks",
  description: "Educational exploration of serotonergic overlap, psychoactive interaction awareness, mood-system safety, and evidence-informed harm reduction.",
  path: "/psychoactive/serotonergic-stacking-risks/",
})


const systems = [
  {
    href: '/education/serotonin',
    title: 'Serotonin Pathway',
  },
  {
    href: '/compare/kanna-vs-ssris',
    title: 'Kanna vs SSRIs',
  },
  {
    href: '/psychoactive/interactions',
    title: 'Interaction Awareness',
  },
  {
    href: '/psychoactive/harm-reduction',
    title: 'Harm Reduction',
  },
]

export default function SerotonergicRisksPage() {
  return (
    <div className="container-page py-10 space-y-10">
      <AuthorityJsonLd
        title="Serotonergic Stacking Risks"
        description="Educational exploration of serotonergic overlap, psychoactive interaction awareness, mood-system safety, and evidence-informed harm reduction."
        url="https://thehippiescientist.net/psychoactive/serotonergic-stacking-risks"
        type="Article"
      />

      <AuthorityBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Psychoactive Research', href: '/psychoactive' },
          { label: 'Serotonergic Risks' },
        ]}
      />

      <section className="space-y-5 max-w-4xl">
        <p className="eyebrow-label">Educational Safety System</p>

        <h1 className="text-5xl font-bold tracking-tight text-ink">
          Serotonergic Stacking Risks
        </h1>

        <p className="text-lg leading-8 text-[#46574d]">
          Educational overview of serotonergic overlap, interaction awareness, psychoactive safety considerations, and conservative neurochemical harm-reduction principles.
        </p>

        <p className="text-base leading-8 text-[#5c6b63]">
          Multiple serotonergic substances may influence mood systems, emotional-processing pathways, and neurochemical signaling simultaneously. Educational awareness of overlap and interactions is important for safety-oriented interpretation.
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
