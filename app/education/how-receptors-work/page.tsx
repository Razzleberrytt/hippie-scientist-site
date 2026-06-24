import type { Metadata } from 'next'
import { buildPageMetadata } from '../../../src/lib/seo'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import EvidenceSection from '@/components/evidence/EvidenceSection'
import ReferencedStudies from '@/components/evidence/ReferencedStudies'
import ResearchLimitations from '@/components/evidence/ResearchLimitations'
import MisconceptionCallout from '@/components/evidence/MisconceptionCallout'
export const metadata: Metadata = buildPageMetadata({
  title: "How Receptors Work",
  description: "Educational overview of receptor systems, signaling pathways, neuropharmacology, neurotransmitter interactions, and psychoactive mechanisms.",
  path: "/education/how-receptors-work/",
})


const receptorSystems = [
  {
    title: 'Serotonergic receptors',
    description: 'Associated with emotional regulation, sensory processing, stress signaling, appetite regulation, altered-state neuropharmacology, and psychedelic research systems.',
  },
  {
    title: 'GABAergic receptors',
    description: 'Associated with inhibitory signaling, calming systems, sedation pathways, nervous-system downregulation, sleep continuity, and anxiety-related neurobiology.',
  },
  {
    title: 'Dopaminergic receptors',
    description: 'Associated with motivation systems, reward processing, novelty salience, behavioral reinforcement, movement systems, and cognition continuity.',
  },
  {
    title: 'Glutamatergic receptors',
    description: 'Associated with excitatory signaling, learning systems, neuroplasticity, cognition pathways, memory formation, and altered-state neuropharmacology.',
  },
]

export default function ReceptorsPage() {
  return (
    <div className="container-page py-10 space-y-12">
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

          <h1 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl lg:text-5xl">
            How Receptors Work
          </h1>
        </div>

        <p className="text-xl leading-9 text-[#46574d]">
          Receptors are specialized signaling structures associated with how neurotransmitters, compounds, herbs, medications, and psychoactive substances influence neurochemical communication systems. Different receptor families may influence emotional regulation, stress adaptation, cognition, sedation pathways, sensory interpretation, and altered states.
        </p>

        <p className="text-base leading-8 text-[#5c6b63]">
          Educational receptor-system discussions commonly intersect with neuropharmacology, signaling modulation, psychoactive mechanisms, sleep systems, mood regulation, stress neurobiology, neuroplasticity, and systems biology. Modern neuroscience increasingly emphasizes pathway interaction rather than isolated single-receptor explanations.
        </p>
      </section>

      <MisconceptionCallout
        myth="A single receptor completely determines how a psychoactive substance feels"
        reality="Subjective experiences are influenced by multiple interacting signaling systems, environmental context, expectations, emotional state, receptor distribution, dosage, metabolism, sleep continuity, and individual variability."
      />

      <EvidenceSection
        title="Why receptor systems matter"
        evidenceLevel="Strong"
        summary="Receptor systems help contextualize how signaling molecules and neuroactive compounds may influence nervous-system communication, psychoactive perception, cognition pathways, emotional regulation, and stress-response continuity."
        limitations="Neurochemical systems are highly interconnected and often cannot be reduced to simple single-receptor explanations."
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

      <ResearchLimitations
        limitations={[
          'Receptor systems remain incompletely understood.',
          'Mechanistic receptor activity may not fully predict subjective experiences.',
          'Animal models may not directly translate to humans.',
          'Online neuropharmacology discussions often exaggerate mechanistic certainty.',
        ]}
      />

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
    </div>
  )
}
