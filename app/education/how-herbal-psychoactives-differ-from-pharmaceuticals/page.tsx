import type { Metadata } from 'next'
import { buildPageMetadata } from '../../../src/lib/seo'
import Link from 'next/link'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
export const metadata: Metadata = buildPageMetadata({
  title: "How Herbal Psychoactives Differ From Pharmaceuticals",
  description: "Educational exploration of herbal psychoactives, pharmaceutical systems, neuropharmacology, ethnobotany, and careful comparison.",
  path: "/education/how-herbal-psychoactives-differ-from-pharmaceuticals/",
})


const systems = [
  {
    href: '/education/what-is-neuropharmacology',
    title: 'Neuropharmacology',
  },
  {
    href: '/psychoactive/harm-reduction',
    title: 'Harm Reduction',
  },
  {
    href: '/compare/kanna-vs-ssris',
    title: 'Kanna vs SSRIs',
  },
  {
    href: '/education/serotonin',
    title: 'Serotonin Pathway',
  },
]

export default function HerbalVsPharmaPage() {
  return (
    <div className="container-page py-10 space-y-10">
      <AuthorityJsonLd
        title="How Herbal Psychoactives Differ From Pharmaceuticals"
        description="Educational exploration of herbal psychoactives, pharmaceutical systems, neuropharmacology, ethnobotany, and careful comparison."
        url="https://thehippiescientist.net/education/how-herbal-psychoactives-differ-from-pharmaceuticals"
        type="Article"
      />

      <AuthorityBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Education', href: '/education' },
          { label: 'Herbal Psychoactives vs Pharmaceuticals' },
        ]}
      />

      <section className="space-y-5 max-w-4xl">
        <p className="eyebrow-label">Educational Supernode</p>

        <h1 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl lg:text-5xl">
          How Herbal Psychoactives Differ From Pharmaceuticals
        </h1>

        <p className="text-lg leading-8 text-[#46574d]">
          Educational exploration of herbal psychoactives, ethnobotanical systems, pharmaceutical neuropharmacology, pathway overlap, and evidence-informed interpretation.
        </p>

        <p className="text-base leading-8 text-[#5c6b63]">
          Herbal psychoactives and pharmaceuticals may interact with similar neurochemical systems while differing in composition, standardization, evidence quality, mechanism complexity, and historical context.
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
