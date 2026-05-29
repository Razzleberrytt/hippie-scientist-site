import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import EvidenceSummaryCard from '@/components/evidence/EvidenceSummaryCard'
import ResearchLimitations from '@/components/evidence/ResearchLimitations'
import ReferencedStudies from '@/components/evidence/ReferencedStudies'

export default function HumanTrialsMatterPage() {
  return (
    <main className="container-page py-10 space-y-12">
      <AuthorityJsonLd
        title="Why Human Trials Matter"
        description="Educational overview of human clinical evidence, translational limitations, mechanistic research, and evidence-informed scientific interpretation."
        url="https://thehippiescientist.net/education/why-human-trials-matter"
        type="Article"
      />

      <AuthorityBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Education', href: '/education' },
          { label: 'Why Human Trials Matter' },
        ]}
      />

      <section className="space-y-6 max-w-4xl">
        <div className="space-y-3">
          <p className="eyebrow-label">Evidence Methodology</p>

          <h1 className="text-5xl font-bold tracking-tight text-ink">
            Why Human Trials Matter
          </h1>
        </div>

        <p className="text-xl leading-9 text-[#46574d]">
          Human clinical evidence helps contextualize whether mechanistic theories, receptor interactions, or preliminary findings translate into measurable real-world outcomes.
        </p>

        <p className="text-base leading-8 text-[#5c6b63]">
          Educational interpretation should prioritize human evidence whenever available while remaining transparent regarding uncertainty, study limitations, and reproducibility concerns.
        </p>
      </section>

      <EvidenceSummaryCard
        title="Human evidence prioritization"
        evidenceLevel="Strong"
        humanEvidence="Human trials may provide stronger evidence regarding tolerability, measurable outcomes, and real-world variability."
        mechanisticEvidence="Mechanistic evidence may help explain plausibility but cannot fully replace clinical validation."
        safetyProfile="Long-term safety and interaction risks may still remain uncertain even with clinical evidence."
      />

      <ResearchLimitations
        limitations={[
          'Small clinical trials may overestimate effect size reliability.',
          'Short-term studies may not reflect long-term safety.',
          'Participant diversity may be limited in some research designs.',
          'Animal or in vitro findings may not translate directly to humans.',
        ]}
      />

      <ReferencedStudies
        studies={[
          {
            title: 'PubMed Clinical Trials Database',
            href: 'https://pubmed.ncbi.nlm.nih.gov/',
            source: 'NIH / PubMed',
          },
          {
            title: 'ClinicalTrials.gov',
            href: 'https://clinicaltrials.gov/',
            source: 'NIH',
          },
        ]}
      />
    </main>
  )
}
