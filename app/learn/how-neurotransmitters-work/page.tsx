import type { Metadata } from 'next'
import { buildPageMetadata } from '../../../src/lib/seo'
import Link from 'next/link'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import EducationPageLayout from '@/components/layouts/EducationPageLayout'
import EvidenceSummaryCard from '@/components/evidence/EvidenceSummaryCard'
import ReferencedStudies from '@/components/evidence/ReferencedStudies'
import ResearchLimitations from '@/components/evidence/ResearchLimitations'
import MisconceptionCallout from '@/components/evidence/MisconceptionCallout'
export const metadata: Metadata = buildPageMetadata({
  title: "How Neurotransmitters Work",
  description: "Educational overview of neurotransmitters, signaling systems, neuropharmacology, pathway interactions, and nervous-system communication.",
  path: "/learn/how-neurotransmitters-work/",
})


const pathways = [
  {
    href: '/learn/serotonin',
    title: 'Serotonin Pathway',
    description: 'Mood-related signaling systems associated with emotional regulation, stress adaptation, appetite, sleep continuity, and psychoactive neuropharmacology.',
  },
  {
    href: '/learn/dopamine',
    title: 'Dopamine Pathway',
    description: 'Motivation and cognition-oriented systems associated with reward signaling, behavioral reinforcement, novelty processing, and attention continuity.',
  },
  {
    href: '/learn/gaba',
    title: 'GABA Pathway',
    description: 'Calming inhibitory signaling systems associated with nervous-system downregulation, relaxation, sedation pathways, and sleep continuity.',
  },
  {
    href: '/learn/glutamate',
    title: 'Glutamate Pathway',
    description: 'Excitatory signaling systems associated with learning, neuroplasticity, cognition, memory formation, and altered-state neuropharmacology.',
  },
]

export default function NeurotransmittersPage() {
  return (
    <>
      <AuthorityJsonLd
        title="How Neurotransmitters Work"
        description="Educational overview of neurotransmitters, signaling systems, neuropharmacology, pathway interactions, and nervous-system communication."
        url="https://thehippiescientist.net/learn/how-neurotransmitters-work"
        type="Article"
      />

      <EducationPageLayout
        title="How Neurotransmitters Work"
        description="Neurotransmitters are signaling molecules associated with communication between neurons and nervous-system pathways. Different signaling systems may influence emotional regulation, stress adaptation, cognition, sleep continuity, sensory processing, behavioral motivation, and psychoactive perception."
      >
      <section className="space-y-6 max-w-4xl">
        <p className="text-base leading-8 text-[#5c6b63]">
          Educational neuropharmacology discussions commonly focus on how neurotransmitter systems interact rather than functioning in complete isolation. Modern neuroscience increasingly emphasizes systems biology, receptor diversity, pathway overlap, environmental context, and individual variability.
        </p>
      </section>

      <MisconceptionCallout
        myth="Mental health can be reduced to a single neurotransmitter imbalance"
        reality="Modern neuroscience does not support overly simplistic single-neurotransmitter explanations for complex emotional, cognitive, or psychiatric systems. Mood regulation involves interacting biological, psychological, behavioral, inflammatory, social, and environmental influences."
      />

      <EvidenceSummaryCard
        title="Neurotransmitter systems and neuropharmacology"
        evidenceLevel="Strong"
        humanEvidence="Neurotransmitter systems are extensively studied across neuroscience, psychiatry, pharmacology, cognition research, and sleep medicine."
        mechanisticEvidence="Mechanistic evidence helps explain receptor systems, signaling pathways, neurochemical modulation, psychoactive interactions, and stress-response continuity."
        safetyProfile="Manipulating signaling systems may involve interaction risks, emotional variability, overstimulation, sedation pathways, and substantial individual variability."
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
              className="card-premium p-6 transition motion-safe:hover:-translate-y-0.5"
            >
              <div className="space-y-4">
                <h3 className="text-2xl font-semibold tracking-tight text-ink">
                  {pathway.title}
                </h3>

                <p className="text-sm leading-7 text-muted">
                  {pathway.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <ResearchLimitations
        limitations={[
          'Neurochemical systems remain incompletely understood.',
          'Mechanistic explanations may oversimplify real-world biology.',
          'Average study outcomes may not predict individual experiences.',
          'Online neurotransmitter narratives frequently exaggerate certainty.',
        ]}
      />

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
      </EducationPageLayout>
    </>
  )
}
