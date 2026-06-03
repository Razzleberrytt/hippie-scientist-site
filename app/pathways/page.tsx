import type { Metadata } from 'next'
import Link from 'next/link'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'

export const metadata: Metadata = {
  title: 'Neurochemical Pathways',
  description:
    'Explore educational guides to serotonin, dopamine, GABA, and neurochemical signaling systems related to cognition, mood, stress, and recovery.',
  alternates: { canonical: '/pathways' },
  openGraph: {
    title: 'Neurochemical Pathways',
    description:
      'Explore educational guides to serotonin, dopamine, GABA, and neurochemical signaling systems related to cognition, mood, stress, and recovery.',
    url: '/pathways',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Neurochemical Pathways',
    description: 'Educational guides to serotonin, dopamine, GABA, and neurochemical signaling systems.',
  },
}

const pathways = [
  {
    href: '/pathways/serotonin',
    title: 'Serotonin',
    description: 'Mood regulation, emotional processing, psychoactive neuropharmacology, and serotonergic signaling.',
  },
  {
    href: '/pathways/dopamine',
    title: 'Dopamine',
    description: 'Motivation systems, focus regulation, reward processing, and behavioral drive.',
  },
  {
    href: '/pathways/gaba',
    title: 'GABA',
    description: 'Calming systems, inhibitory signaling, stress modulation, and sleep-oriented neurochemistry.',
  },
]

export default function PathwaysIndexPage() {
  return (
    <div className="container-page py-10 space-y-10">
      <AuthorityJsonLd
        title="Neurochemical Pathways"
        description="Educational neurochemical pathway hub exploring serotonergic, dopaminergic, GABAergic, and psychoactive signaling systems."
        url="https://www.thehippiescientist.net/pathways"
        type="CollectionPage"
      />

      <section className="space-y-5 max-w-4xl">
        <p className="eyebrow-label">Authority Hub</p>

        <h1 className="text-5xl font-bold tracking-tight text-ink">
          Neurochemical Pathways
        </h1>

        <p className="text-lg leading-8 text-[#46574d]">
          Educational exploration of neurochemical signaling systems, psychoactive mechanisms, stress-response biology, cognition pathways, and evidence-oriented ethnobotanical discovery.
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        {pathways.map((pathway) => (
          <Link
            key={pathway.href}
            href={pathway.href}
            className="card-premium p-6 transition hover:-translate-y-0.5"
          >
            <div className="space-y-4">
              <p className="eyebrow-label">Pathway</p>

              <h2 className="text-2xl font-semibold tracking-tight text-ink">
                {pathway.title}
              </h2>

              <p className="text-sm leading-7 text-[#46574d]">
                {pathway.description}
              </p>
            </div>
          </Link>
        ))}
      </section>
    </div>
  )
}
