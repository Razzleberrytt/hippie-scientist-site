import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import FaqJsonLd from '@/components/seo/FaqJsonLd'
import References from '@/components/References'

export const metadata: Metadata = {
  title: 'GABA Pathway Education',
  description:
    'Learn about GABAergic signaling, calming neurochemistry, inhibitory neurotransmission, sleep-related pathways, and related herbs and compounds.',
  alternates: { canonical: '/learn/gaba/' },
}

const faqItems = [
  {
    question: 'What does GABA do?',
    answer:
      'GABA is a major inhibitory neurotransmitter associated with nervous-system downregulation, relaxation, stress modulation, and calming signaling pathways.',
  },
  {
    question: 'What are GABAergic herbs?',
    answer:
      'GABAergic herbs are herbs or compounds believed to influence inhibitory signaling systems associated with calmness, sedation, stress regulation, or sleep support.',
  },
  {
    question: 'Why is GABA discussed in sleep education?',
    answer:
      'Many calming and sleep-supportive compounds intersect with inhibitory signaling systems involved in relaxation, sleep onset, and excitatory balance.',
  },
]

const relatedProfiles = [
  {
    href: '/herbs/kava',
    title: 'Kava',
    description:
      'Traditional calming psychoactive herb associated with stress modulation and inhibitory signaling systems.',
  },
  {
    href: '/compounds/l-theanine',
    title: 'L-Theanine',
    description:
      'Calming amino acid associated with relaxation, alpha-wave activity, and stress-response modulation.',
  },
  {
    href: '/herbs/valerian',
    title: 'Valerian',
    description:
      'Traditional calming herb commonly associated with sleep-supportive and inhibitory signaling systems.',
  },
  {
    href: '/herbs/blue-lotus',
    title: 'Blue Lotus',
    description:
      'Historically used psychoactive ethnobotanical associated with calming experiential effects.',
  },
]

const GABA_REFS = [
  { n: 1, text: 'Kandel ER, et al. (2013). Principles of Neural Science: synaptic transmission. McGraw-Hill.', url: '' },
  { n: 2, text: 'Cooper JR, Bloom FE, Roth RH. (2003). The Biochemical Basis of Neuropharmacology, 8th ed. Oxford.', url: '' },
  { n: 3, text: 'Südhof TC. (2013). Neurotransmitter release. Neuron, 80(3): 675-690.', url: 'https://pubmed.ncbi.nlm.nih.gov/24183020/' },
]

export default function GabaPathwayPage() {
  return (
    <div className="container-page py-10 space-y-10">
      <AuthorityJsonLd
        title="GABA Pathway"
        description="Educational overview of GABAergic signaling, calming neuropharmacology, inhibitory neurotransmission, and related herbs and compounds."
        url="https://thehippiescientist.net/learn/gaba"
        type="Article"
        breadcrumbs={[
          {
            name: 'Home',
            url: 'https://thehippiescientist.net',
          },
          {
            name: 'Education',
            url: 'https://thehippiescientist.net/learn',
          },
          {
            name: 'GABA',
            url: 'https://thehippiescientist.net/learn/gaba',
          },
        ]}
      />

      <FaqJsonLd items={faqItems} />

      <AuthorityBreadcrumbs
        items={[
          {
            label: 'Home',
            href: '/',
          },
          {
            label: 'Education',
            href: '/learn',
          },
          {
            label: 'GABA',
          },
        ]}
      />

      <section className="space-y-5 max-w-4xl">
        <div className="space-y-3">
          <p className="eyebrow-label">Pathway Supernode</p>

          <h1 className="text-4xl font-bold tracking-tight text-ink">
            GABA Pathway
          </h1>
        </div>

        <p className="text-lg leading-8 text-muted">
          GABA (gamma-aminobutyric acid) is one of the primary inhibitory neurotransmitter systems involved in nervous-system downregulation, relaxation, stress modulation, and sleep-related signaling.
        </p>

        <p className="text-base leading-8 text-[#5c6b63]">
          Educational exploration of GABAergic systems helps contextualize calming herbs, psychoactive ethnobotanicals, sleep-supportive compounds, anxiolytic mechanisms, and inhibitory neuropharmacology.
        </p>

        <div className="overflow-hidden rounded-2xl border border-brand-900/10 shadow-sm">
          <Image
            src="/images/learn/gaba.jpg"
            alt="Molecular illustration representing GABA inhibitory neurotransmitter signaling"
            width={1200}
            height={630}
            className="h-auto w-full"
          />
        </div>
      </section>

      <section className="surface-depth card-spacing">
        <div className="space-y-3 max-w-3xl">
          <p className="eyebrow-label">Mechanism Education</p>

          <h2 className="text-3xl font-semibold tracking-tight text-ink">
            Why inhibitory signaling matters
          </h2>

          <p className="text-sm leading-7 text-muted">
            GABAergic signaling helps regulate excitatory nervous-system activity. Educational discussions around calming herbs, sedation, stress regulation, and sleep often intersect with inhibitory pathway systems.
          </p>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          {relatedProfiles.map((profile) => (
            <Link
              key={profile.href}
              href={profile.href}
              className="card-premium p-5 transition motion-safe:hover:-translate-y-0.5"
            >
              <div className="space-y-3">
                <h3 className="text-xl font-semibold tracking-tight text-ink">
                  {profile.title}
                </h3>

                <p className="text-sm leading-7 text-muted">
                  {profile.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="surface-subtle rounded-3xl p-6 space-y-5">
        <div className="space-y-2">
          <p className="eyebrow-label">Related Educational Systems</p>

          <h2 className="text-2xl font-semibold tracking-tight text-ink">
            Continue exploring neuropharmacology
          </h2>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/learn/gaba-vs-serotonin"
            className="chip-readable hover:bg-white transition"
          >
            GABA vs Serotonin
          </Link>

          <Link
            href="/learn/calming"
            className="chip-readable hover:bg-white transition"
          >
            Calming Psychoactives
          </Link>

          <Link
            href="/guides/best-natural-sleep-aids-that-work/"
            className="chip-readable hover:bg-white transition"
          >
            Sleep Support Guide
          </Link>

          <Link
            href="/learn/harm-reduction"
            className="chip-readable hover:bg-white transition"
          >
            GABAergic Safety
          </Link>
        </div>
      </section>
    </div>
  )
}
