import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import EvidenceSection from '@/components/evidence/EvidenceSection'
import ResearchLimitations from '@/components/evidence/ResearchLimitations'
import MechanismCard from '@/components/evidence/MechanismCard'

export default function NeurochemistryComplexityPage() {
  return (
    <main className="container-page py-10 space-y-12">
      <AuthorityJsonLd
        title="Why Neurochemistry Is Complex"
        description="Educational overview of systems biology, pathway interaction, receptor complexity, neuropharmacology, and scientific uncertainty."
        url="https://thehippiescientist.net/education/why-neurochemistry-is-complex"
        type="Article"
      />

      <AuthorityBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Education', href: '/education' },
          { label: 'Why Neurochemistry Is Complex' },
        ]}
      />

      <section className="space-y-6 max-w-4xl">
        <div className="space-y-3">
          <p className="eyebrow-label">Systems Biology Education</p>

          <h1 className="text-5xl font-bold tracking-tight text-ink">
            Why Neurochemistry Is Complex
          </h1>
        </div>

        <p className="text-xl leading-9 text-[#46574d]">
          Neurochemical systems are highly interconnected and cannot usually be reduced to simple “more serotonin” or “more dopamine” explanations. Educational neuropharmacology interpretation should prioritize systems biology and pathway interaction awareness.
        </p>
      </section>

      <EvidenceSection
        title="Interconnected signaling systems"
        evidenceLevel="Strong"
        summary="Mood, cognition, sleep continuity, stress adaptation, emotional regulation, and psychoactive perception often involve overlapping signaling systems rather than isolated pathways."
        limitations="Simplified neurotransmitter narratives may fail to capture real-world biological complexity."
      />

      <section className="grid gap-6 lg:grid-cols-3">
        <MechanismCard
          title="Pathway overlap"
          description="Multiple neurotransmitter systems commonly influence one another simultaneously through interconnected signaling networks."
          pathway="Integrated systems"
        />

        <MechanismCard
          title="Individual variability"
          description="Genetics, sleep continuity, stress burden, nutrition, environment, and prior experiences may all influence neurochemical responses."
          pathway="Systems biology"
        />

        <MechanismCard
          title="Context-dependent effects"
          description="The same compound may produce different subjective effects depending on context, dosage, expectations, and neurochemical state."
          pathway="Neuropharmacology"
        />
      </section>

      <ResearchLimitations
        limitations={[
          'Neurochemical systems remain incompletely understood.',
          'Mechanistic findings may not fully predict subjective experiences.',
          'Simplified online explanations may exaggerate certainty.',
          'Human neurobiology involves substantial individual variability.',
        ]}
      />
    </main>
  )
}
