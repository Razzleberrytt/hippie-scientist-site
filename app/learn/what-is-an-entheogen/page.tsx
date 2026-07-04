import type { Metadata } from 'next'
import { buildPageMetadata } from '../../../src/lib/seo'
import Link from 'next/link'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import EducationPageLayout from '@/components/layouts/EducationPageLayout'
import References from '@/components/References'
export const metadata: Metadata = buildPageMetadata({
  title: "What Is an Entheogen?",
  description: "Educational exploration of entheogens, ethnobotanical traditions, psychoactive neuropharmacology, and consciousness-oriented plant systems.",
  path: "/learn/what-is-an-entheogen/",
})


const related = [
  {
    href: '/learn/entheogens',
    title: 'Entheogens',
  },
  {
    href: '/learn/serotonin',
    title: 'Serotonin Pathway',
  },
  {
    href: '/learn/what-is-neuropharmacology',
    title: 'Neuropharmacology',
  },
  {
    href: '/learn/harm-reduction',
    title: 'Harm Reduction',
  },
]

const WHAT_IS_AN_ENTHEOGEN_REFS = [
  { n: 1, text: 'Nichols DE. (2016). Psychedelics. Pharmacol Rev, 68(2): 264-355.', url: 'https://pubmed.ncbi.nlm.nih.gov/26841800/' },
]

export default function EntheogenEducationPage() {
  return (
    <>
      <AuthorityJsonLd
        title="What Is an Entheogen?"
        description="Educational exploration of entheogens, ethnobotanical traditions, psychoactive neuropharmacology, and consciousness-oriented plant systems."
        url="https://thehippiescientist.net/learn/what-is-an-entheogen"
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
      <References refs={WHAT_IS_AN_ENTHEOGEN_REFS} />
      </EducationPageLayout>
    </>
  )
}
