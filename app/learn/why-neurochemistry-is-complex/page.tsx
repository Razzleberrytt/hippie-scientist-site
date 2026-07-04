import type { Metadata } from 'next'
import { buildPageMetadata } from '../../../src/lib/seo'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import EvidenceSection from '@/components/evidence/EvidenceSection'
import ResearchLimitations from '@/components/evidence/ResearchLimitations'
import MechanismCard from '@/components/evidence/MechanismCard'
import MisconceptionCallout from '@/components/evidence/MisconceptionCallout'
import ReferencedStudies from '@/components/evidence/ReferencedStudies'
import References from '@/components/References'
export const metadata: Metadata = buildPageMetadata({
  title: "Why Neurochemistry Is Complex",
  description: "Educational overview of systems biology, pathway interaction, receptor complexity, neuropharmacology, and scientific uncertainty.",
  path: "/learn/why-neurochemistry-is-complex/",
})


const WHY_NEUROCHEMISTRY_IS_COMPLEX_REFS = [
  { n: 1, text: 'Kandel ER, et al. (2013). Principles of Neural Science: synaptic transmission. McGraw-Hill.', url: '' },
  { n: 2, text: 'Cooper JR, Bloom FE, Roth RH. (2003). The Biochemical Basis of Neuropharmacology, 8th ed. Oxford.', url: '' },
  { n: 3, text: 'Südhof TC. (2013). Neurotransmitter release. Neuron, 80(3): 675-690.', url: 'https://pubmed.ncbi.nlm.nih.gov/24183020/' },
]

export default function NeurochemistryComplexityPage() {
  return (
    <div className="container-page py-10 space-y-12">
      <AuthorityJsonLd
        title="Why Neurochemistry Is Complex"
        description="Educational overview of systems biology, pathway interaction, receptor complexity, neuropharmacology, and scientific uncertainty."
        url="https://thehippiescientist.net/learn/why-neurochemistry-is-complex"
        type="Article"
      />

      <AuthorityBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Education', href: '/learn' },
          { label: 'Why Neurochemistry Is Complex' },
        ]}
      />

      <section className="space-y-6 max-w-4xl">
        <div className="space-y-3">
          <p className="eyebrow-label">Systems Biology Education</p>

          <h1 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl lg:text-5xl">
            Why Neurochemistry Is Complex
          </h1>
        </div>

        <p className="text-xl leading-9 text-muted">
          Neurochemical systems are highly interconnected and cannot usually be reduced to simplistic “more serotonin” or “more dopamine” explanations. Emotional regulation, cognition, sleep continuity, stress adaptation, psychoactive perception, motivation systems, and nervous-system resilience involve overlapping biological networks rather than isolated pathways.
        </p>

        <p className="text-base leading-8 text-[#5c6b63]">
          Educational neuropharmacology interpretation should increasingly prioritize systems biology, pathway interaction awareness, receptor diversity, environmental context, behavioral influences, inflammatory signaling, and substantial individual variability.
        </p>
      </section>

      <MisconceptionCallout
        myth="One neurotransmitter fully explains mood, focus, or psychoactive experiences"
        reality="Modern neuroscience increasingly emphasizes interacting biological systems rather than isolated chemical explanations. Emotional regulation and subjective experiences may involve overlapping neurochemical pathways, hormonal signaling, inflammatory biology, environmental context, expectations, sleep continuity, stress burden, and social influences."
      />

      <EvidenceSection
        title="Interconnected signaling systems"
        evidenceLevel="Strong"
        summary="Mood regulation, cognition continuity, stress adaptation, emotional processing, psychoactive perception, fatigue recovery, and sleep neurochemistry often involve overlapping signaling systems rather than isolated pathways."
        limitations="Simplified neurotransmitter narratives may fail to capture real-world biological complexity and systems interaction."
      />

      <section className="grid gap-6 lg:grid-cols-3">
        <MechanismCard
          title="Pathway overlap"
          description="Multiple neurotransmitter systems commonly influence one another simultaneously through interconnected signaling networks, receptor interactions, and feedback mechanisms."
          pathway="Integrated systems"
        />

        <MechanismCard
          title="Individual variability"
          description="Genetics, sleep continuity, stress burden, trauma history, nutrition, environment, inflammatory signaling, and prior experiences may all influence neurochemical responses."
          pathway="Systems biology"
        />

        <MechanismCard
          title="Context-dependent effects"
          description="The same compound may produce different subjective effects depending on dosage, mindset, environmental context, emotional state, receptor sensitivity, and neurochemical baseline."
          pathway="Neuropharmacology"
        />
      </section>

      <ResearchLimitations
        limitations={[
          'Neurochemical systems remain incompletely understood.',
          'Mechanistic findings may not fully predict subjective experiences.',
          'Simplified online explanations frequently exaggerate certainty.',
          'Human neurobiology involves substantial environmental and genetic variability.',
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
      <References refs={WHY_NEUROCHEMISTRY_IS_COMPLEX_REFS} />
    </div>
  )
}
