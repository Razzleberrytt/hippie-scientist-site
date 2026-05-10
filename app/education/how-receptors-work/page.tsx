import Link from 'next/link'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import EvidenceSection from '@/components/evidence/EvidenceSection'
import ReferencedStudies from '@/components/evidence/ReferencedStudies'

const receptorSystems = [
  {
    title: 'Serotonergic receptors',
    description: 'Associated with mood systems, emotional processing, stress signaling, and psychoactive neuropharmacology.',
  },
  {
    title: 'GABAergic receptors',
    description: 'Associated with inhibitory signaling, calming systems, sedation pathways, and nervous-system downregulation.',
  },
  {
    title: 'Dopaminergic receptors',
    description: 'Associated with motivation systems, reward signaling, behavioral reinforcement, and cognition continuity.',
  },
  {
    title: 'Glutamatergic receptors',
    description: 'Associated with excitatory signaling, cognition systems, neuroplasticity, and altered-state neuropharmacology.',
  },
]

export default function ReceptorsPage() {
  return (
    <main className="container-page py-10 space-y-12">
      <AuthorityJsonLd
        title="How Receptors Work"
        description="Educational overview of receptor systems, signaling pathways, neuropharmacology, neurotransmitter interactions, and psychoactive mechanisms."
        url="https://thehippiescientist.net/education/how-receptors-work"
        type="Article"
      />

      <AuthorityBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Education', href: '/education' },
          { label: 'How Receptors Work' },
        ]}
      />

      <section className="space-y-6 max-w-4xl">
        <div className="space-y-3">
          <p className="eyebrow-label">Neuropharmacology Education</p>

          <h1 className="text-5xl font-bold tracking-tight text-ink">
            How Receptors Work
          </h1>
        </div>

        <p className="text-xl leading-9 text-[#46574d]">
          Receptors are specialized signaling structures associated with how neurotransmitters, compounds, herbs, and psychoactive substances influence neurochemical communication systems.
        </p>

        <p className="text-base leading-8 text-[#5c6b63]">
          Educational receptor-system discussions commonly intersect with neuropharmacology, signaling modulation, psychoactive mechanisms, sleep systems, mood regulation, cognition pathways, and stress adaptation.
        </p>
      </section>

      <EvidenceSection
        title="Why receptor systems matter"
        evidenceLevel="Strong"
        summary="Receptor systems help contextualize how signaling molecules and neuroactive compounds may influence nervous-system communication and pathway modulation."
        limitations="Neurochemical systems are highly interconnected and often cannot be reduced to single-receptor explanations."
      />

      <section className="grid gap-6 lg:grid-cols-2">
        {receptorSystems.map((system) => (
          <div key={system.title} className="card-premium p-6 space-y-4">
            <h2 className="text-2xl font-semibold tracking-tight text-ink">
              {system.title}
            </h2>

            <p className="text-sm leading-7 text-[#46574d]">
              {system.description}
            </p>
          </div>
        ))}
      </section>

      <ReferencedStudies
        studies={[
          {
            title: 'PubMed Neuropharmacology Research',
            href: 'https://pubmed.ncbi.nlm.nih.gov/',
            source: 'NIH / PubMed',
          },
          {
            title: 'National Institute on Drug Abuse',
            href: 'https://nida.nih.gov/',
            source: 'NIDA',
          },
        ]}
      />
    </main>
  )
}
