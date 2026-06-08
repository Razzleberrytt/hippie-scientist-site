import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import EvidenceSection from '@/components/evidence/EvidenceSection'
import ResearchLimitations from '@/components/evidence/ResearchLimitations'
import SafetyNotice from '@/components/evidence/SafetyNotice'

const myths = [
  {
    title: '“Low serotonin causes all depression”',
    explanation:
      'Modern neuroscience does not support overly simplistic single-neurotransmitter explanations for complex emotional and psychiatric systems. Mood regulation involves interconnected biological, psychological, environmental, inflammatory, and social factors.',
  },
  {
    title: '“More dopamine always means better focus”',
    explanation:
      'Focus and motivation systems are highly context dependent. Sleep continuity, stress burden, emotional regulation, overstimulation, and nervous-system balance all influence cognition quality.',
  },
  {
    title: '“Natural automatically means safe”',
    explanation:
      'Natural substances may still involve interaction risks, psychoactive intensity, contraindications, cardiovascular concerns, sedation pathways, and substantial individual variability.',
  },
]

export default function NeurochemistryMythsPage() {
  return (
    <main className="container-page py-10 space-y-12">
      <AuthorityJsonLd
        title="Common Neurochemistry Myths"
        description="Educational overview of common neurochemistry misconceptions, oversimplified neurotransmitter narratives, and evidence-informed scientific interpretation."
        url="https://thehippiescientist.net/education/common-neurochemistry-myths"
        type="Article"
      />

      <AuthorityBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Education', href: '/education' },
          { label: 'Common Neurochemistry Myths' },
        ]}
      />

      <section className="space-y-6 max-w-4xl">
        <div className="space-y-3">
          <p className="eyebrow-label">Scientific Literacy</p>

          <h1 className="text-5xl font-bold tracking-tight text-ink">
            Common Neurochemistry Myths
          </h1>
        </div>

        <p className="text-xl leading-9 text-[#46574d]">
          Online neurochemistry discussions are often oversimplified into rigid “chemical imbalance” narratives that fail to reflect the complexity of real-world neuroscience, systems biology, and human variability.
        </p>

        <p className="text-base leading-8 text-[#5c6b63]">
          Educational neuropharmacology interpretation should remain cautious, evidence aware, and skeptical of overly simplistic claims promising guaranteed emotional, cognitive, or psychoactive outcomes.
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        {myths.map((myth) => (
          <div key={myth.title} className="card-premium p-6 space-y-4">
            <h2 className="text-2xl font-semibold tracking-tight text-ink">
              {myth.title}
            </h2>

            <p className="text-sm leading-7 text-[#46574d]">
              {myth.explanation}
            </p>
          </div>
        ))}
      </section>

      <EvidenceSection
        title="Why oversimplification is risky"
        evidenceLevel="Strong"
        summary="Oversimplified neuroscience narratives may encourage unrealistic expectations, misunderstanding of mental health complexity, unsafe psychoactive experimentation, or exaggerated supplement claims."
        limitations="Scientific understanding of the brain remains incomplete and continuously evolving."
      />

      <SafetyNotice>
        Psychoactive substances, nootropics, supplements, and herbs may produce highly variable responses across individuals. Educational content should not be interpreted as deterministic or universally predictive.
      </SafetyNotice>

      <ResearchLimitations
        limitations={[
          'Human neurobiology is highly individualized.',
          'Many online neurochemistry claims are not strongly evidence based.',
          'Mechanistic plausibility alone does not guarantee clinical outcomes.',
          'Psychological, environmental, and behavioral factors strongly influence subjective experiences.',
        ]}
      />
    </main>
  )
}
