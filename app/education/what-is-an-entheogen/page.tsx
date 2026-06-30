import type { Metadata } from 'next'
import { buildPageMetadata } from '../../../src/lib/seo'
import Link from 'next/link'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import EducationPageLayout from '@/components/layouts/EducationPageLayout'
export const metadata: Metadata = buildPageMetadata({
  title: "What Is an Entheogen?",
  description: "Educational exploration of entheogens, ethnobotanical traditions, psychoactive neuropharmacology, and consciousness-oriented plant systems.",
  path: "/education/what-is-an-entheogen/",
})


const related = [
  {
    href: '/psychoactive/entheogens',
    title: 'Entheogens',
  },
  {
    href: '/education/serotonin',
    title: 'Serotonin Pathway',
  },
  {
    href: '/education/what-is-neuropharmacology',
    title: 'Neuropharmacology',
  },
  {
    href: '/psychoactive/harm-reduction',
    title: 'Harm Reduction',
  },
]

export default function EntheogenEducationPage() {
  return (
    <>
      <AuthorityJsonLd
        title="What Is an Entheogen?"
        description="Educational exploration of entheogens, ethnobotanical traditions, psychoactive neuropharmacology, and consciousness-oriented plant systems."
        url="https://thehippiescientist.net/education/what-is-an-entheogen"
        type="Article"
      />

      <EducationPageLayout
        title="What Is an Entheogen?"
        description="Entheogens are psychoactive substances historically associated with ceremonial traditions, altered states of consciousness, spiritual exploration, and ethnobotanical practices."
      >
      <section className="space-y-5 max-w-4xl">
        <p className="eyebrow-label">Educational Supernode</p>

        <p className="text-base leading-8 text-[#5c6b63]">
          Educational exploration of entheogens involves neuropharmacology, serotonergic systems, consciousness-oriented ethnobotany, historical traditions, and evidence-informed harm reduction.
        </p>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        {related.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="card-premium p-6 transition motion-safe:hover:-translate-y-0.5"
          >
            <div className="space-y-3">
              <p className="eyebrow-label">Related Educational System</p>

              <h2 className="text-2xl font-semibold tracking-tight text-ink">
                {item.title}
              </h2>
            </div>
          </Link>
        ))}
      </section>
      </EducationPageLayout>
    </>
  )
}
