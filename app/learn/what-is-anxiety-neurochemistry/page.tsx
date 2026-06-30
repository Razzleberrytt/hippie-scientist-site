import type { Metadata } from 'next'
import { buildPageMetadata } from '../../../src/lib/seo'
import Link from 'next/link'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
export const metadata: Metadata = buildPageMetadata({
  title: "What Is Anxiety Neurochemistry?",
  description: "Educational overview of anxiety-related neurochemistry, stress signaling, calming systems, emotional processing, and nervous-system regulation.",
  path: "/education/what-is-anxiety-neurochemistry/",
})


const systems = [
  {
    href: '/education/gaba',
    title: 'GABA Pathway',
    description: 'Calming inhibitory signaling systems associated with nervous-system regulation and relaxation.',
  },
  {
    href: '/education/serotonin',
    title: 'Serotonin Pathway',
    description: 'Mood-regulation systems associated with emotional processing and stress-related neuropharmacology.',
  },
  {
    href: '/goals/stress',
    title: 'Stress Regulation',
    description: 'Recovery-oriented educational protocol focused on stress systems and nervous-system stabilization.',
  },
  {
    href: '/goals/anxiety',
    title: 'Non-Sedating Calm',
    description: 'Educational calm-focus discovery system emphasizing stress-aware neuropharmacology.',
  },
]

export default function AnxietyNeurochemistryPage() {
  return (
    <div className="container-page py-10 space-y-12">
      <AuthorityJsonLd
        title="What Is Anxiety Neurochemistry?"
        description="Educational overview of anxiety-related neurochemistry, stress signaling, calming systems, emotional processing, and nervous-system regulation."
        url="https://thehippiescientist.net/education/what-is-anxiety-neurochemistry"
        type="Article"
      />

      <AuthorityBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Education', href: '/education' },
          { label: 'What Is Anxiety Neurochemistry?' },
        ]}
      />

      <section className="space-y-6 max-w-4xl">
        <div className="space-y-3">
          <p className="eyebrow-label">Educational Supernode</p>

          <h1 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl lg:text-5xl">
            What Is Anxiety Neurochemistry?
          </h1>
        </div>

        <p className="text-xl leading-9 text-muted">
          Anxiety-related neurochemistry involves multiple interacting systems associated with stress signaling, emotional regulation, nervous-system arousal, cognition, sleep continuity, and environmental adaptation.
        </p>

        <p className="text-base leading-8 text-[#5c6b63]">
          Educational anxiety neurochemistry discussions commonly intersect with GABAergic systems, serotonergic signaling, stress-response biology, sleep systems, and recovery-oriented neuropharmacology.
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        {systems.map((system) => (
          <Link
            key={system.href}
            href={system.href}
            className="card-premium p-6 transition motion-safe:hover:-translate-y-0.5"
          >
            <div className="space-y-4">
              <p className="eyebrow-label">Related Educational System</p>

              <h2 className="text-2xl font-semibold tracking-tight text-ink">
                {system.title}
              </h2>

              <p className="text-sm leading-7 text-muted">
                {system.description}
              </p>
            </div>
          </Link>
        ))}
      </section>
    </div>
  )
}
