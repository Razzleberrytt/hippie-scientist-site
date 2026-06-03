import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import MechanismCard from '@/components/evidence/MechanismCard'
import ResearchLimitations from '@/components/evidence/ResearchLimitations'
import EvidenceSummaryCard from '@/components/evidence/EvidenceSummaryCard'

export default function IndividualVariabilityPage() {
  return (
    <main className="container-page py-10 space-y-12">
      <AuthorityJsonLd
        title="Understanding Individual Variability"
        description="Educational overview of individual variability, neurochemical diversity, stress systems, psychoactive responses, and systems biology."
        url="https://www.thehippiescientist.net/education/understanding-individual-variability"
        type="Article"
      />

      <AuthorityBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Education', href: '/education' },
          { label: 'Understanding Individual Variability' },
        ]}
      />

      <section className="space-y-6 max-w-4xl">
        <div className="space-y-3">
          <p className="eyebrow-label">Systems Biology Education</p>

          <h1 className="text-5xl font-bold tracking-tight text-ink">
            Understanding Individual Variability
          </h1>
        </div>

        <p className="text-xl leading-9 text-[#46574d]">
          Human responses to herbs, compounds, psychoactive systems, sleep disruption, stress burden, and neurochemical modulation may vary substantially across individuals.
        </p>

        <p className="text-base leading-8 text-[#5c6b63]">
          Educational neuropharmacology interpretation should avoid deterministic “everyone reacts the same” assumptions and instead emphasize systems biology, environmental context, recovery continuity, and neurochemical diversity.
        </p>
      </section>

      <EvidenceSummaryCard
        title="Human variability and neurochemistry"
        evidenceLevel="Strong"
        humanEvidence="Human research consistently demonstrates substantial variability in perception, emotional regulation, cognition, tolerability, and psychoactive response."
        mechanisticEvidence="Genetics, receptor density, stress-response signaling, sleep continuity, and prior exposure history may influence neurochemical outcomes."
        safetyProfile="Individual variability may increase unpredictability regarding psychoactive intensity, side effects, and interaction sensitivity."
      />

      <section className="grid gap-6 lg:grid-cols-3">
        <MechanismCard
          title="Stress-response differences"
          description="Chronic stress burden, burnout, recovery quality, and emotional-processing systems may influence subjective neurochemical responses."
          pathway="Stress systems"
        />

        <MechanismCard
          title="Sleep continuity"
          description="Sleep architecture and nervous-system recovery may substantially influence cognition quality, emotional regulation, and psychoactive perception."
          pathway="Sleep systems"
        />

        <MechanismCard
          title="Environmental context"
          description="Social environment, expectations, mindset, and environmental safety may all influence subjective experiences and neurochemical interpretation."
          pathway="Integrated systems"
        />
      </section>

      <ResearchLimitations
        limitations={[
          'Human studies may not capture all real-world variability.',
          'Subjective psychoactive experiences are difficult to standardize.',
          'Genetic and environmental influences remain incompletely understood.',
          'Average study outcomes may not predict individual experiences.',
        ]}
      />
    </main>
  )
}
