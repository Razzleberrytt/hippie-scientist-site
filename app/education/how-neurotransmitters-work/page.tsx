import Link from 'next/link'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import EvidenceSummaryCard from '@/components/evidence/EvidenceSummaryCard'
import ReferencedStudies from '@/components/evidence/ReferencedStudies'

const pathways = [
  {
    href: '/pathways/serotonin',
    title: 'Serotonin Pathway',
    description: 'Mood-related signaling systems associated with emotional regulation and stress-response continuity.',
  },
  {
    href: '/pathways/dopamine',
    title: 'Dopamine Pathway',
    description: 'Motivation and cognition-oriented systems associated with behavioral reinforcement and focus continuity.',
  },
  {
    href: '/pathways/gaba',
    title: 'GABA Pathway',
    description: 'Calming inhibitory signaling systems associated with relaxation and nervous-system downregulation.',
  },
  {
    href: '/pathways/glutamate',
    title: 'Glutamate Pathway',
    description: 'Excitatory neurochemical systems associated with cognition, learning, and neuroplasticity.',
  },
]

export default function NeurotransmittersPage() {
  return (
    <main className="container-page py-10 space-y-12">
      <AuthorityJsonLd
        title="How Neurotransmitters Work"
        description="Educational overview of neurotransmitters, signaling systems, neuropharmacology, pathway interactions, and nervous-system communication."
        url="https://thehippiescientist.net/education/how-neurotransmitters-work"
        type="Article"
      />

      <AuthorityBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Education', href: '/education' },
          { label: 'How Neurotransmitters Work' },
        ]}
      />

      <section className="space-y-6 max-w-4xl">
        <div className="space-y-3">
          <p className="eyebrow-label">Neurochemistry Education</p>

          <h1 className="text-5xl font-bold tracking-tight text-ink">
            How Neurotransmitters Work
          </h1>
        </div>

        <p className="text-xl leading-9 text-[#46574d]">
          Neurotransmitters are signaling molecules associated with communication between neurons and nervous-system pathways. Educational neuropharmacology discussions commonly explore how signaling systems interact with mood, cognition, stress adaptation, sleep continuity, and emotional regulation.
        </p>

        <p className="text-base leading-8 text-[#5c6b63]">
          Neurotransmitter systems are highly interconnected. Educational interpretation should avoid oversimplified “chemical imbalance” narratives and instead focus on systems biology, pathway interaction, and evidence-aware interpretation.
        </p>
      </section>

      <EvidenceSummaryCard
        title="Neurotransmitter systems and neuropharmacology"
        evidenceLevel="Strong"
        humanEvidence="Neurotransmitter systems are extensively studied across neuroscience, psychiatry, pharmacology, and sleep research."
        mechanisticEvidence="Mechanistic evidence helps explain receptor systems, signaling pathways, neurochemical modulation, and psychoactive interactions."
        safetyProfile="Manipulating signaling systems may involve interaction risks, side effects, and substantial individual variability."
      />

      <section className="space-y-5">
        <div className="space-y-2">
          <p className="eyebrow-label">Core Neurochemical Systems</p>

          <h2 className="text-3xl font-semibold tracking-tight text-ink">
            Explore major signaling pathways
          </h2>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {pathways.map((pathway) => (
            <Link
              key={pathway.href}
              href={pathway.href}
              className="card-premium p-6 transition hover:-translate-y-0.5"
            >
              <div className="space-y-4">
                <h3 className="text-2xl font-semibold tracking-tight text-ink">
                  {pathway.title}
                </h3>

                <p className="text-sm leading-7 text-[#46574d]">
                  {pathway.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <ReferencedStudies
        studies={[
          {
            title: 'PubMed Neuroscience Research',
            href: 'https://pubmed.ncbi.nlm.nih.gov/',
            source: 'NIH / PubMed',
          },
          {
            title: 'National Institute of Mental Health',
            href: 'https://www.nimh.nih.gov/',
            source: 'NIMH',
          },
        ]}
      />
    </main>
  )
}
