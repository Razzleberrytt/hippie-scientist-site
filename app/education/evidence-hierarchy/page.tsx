import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import EvidenceSummaryCard from '@/components/evidence/EvidenceSummaryCard'
import ReferencedStudies from '@/components/evidence/ReferencedStudies'

export default function EvidenceHierarchyPage() {
  return (
    <main className="container-page py-10 space-y-12">
      <AuthorityJsonLd
        title="Evidence Hierarchy"
        description="Educational overview of evidence hierarchy, clinical trials, mechanistic evidence, ethnobotanical context, and scientific interpretation systems."
        url="https://www.thehippiescientist.net/education/evidence-hierarchy"
        type="Article"
      />

      <AuthorityBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Education', href: '/education' },
          { label: 'Evidence Hierarchy' },
        ]}
      />

      <section className="space-y-6 max-w-4xl">
        <div className="space-y-3">
          <p className="eyebrow-label">Scientific Interpretation</p>

          <h1 className="text-5xl font-bold tracking-tight text-ink">
            Evidence Hierarchy
          </h1>
        </div>

        <p className="text-xl leading-9 text-[#46574d]">
          Evidence hierarchy systems help contextualize how strongly different types of scientific evidence support educational interpretation, neuropharmacology claims, and recovery-oriented discussions.
        </p>
      </section>

      <EvidenceSummaryCard
        title="Meta-analyses and systematic reviews"
        evidenceLevel="Strong"
        humanEvidence="Often considered among the strongest forms of clinical evidence when methodologies are rigorous and reproducible."
        mechanisticEvidence="May synthesize findings across multiple mechanistic and clinical pathways."
        safetyProfile="Still dependent on underlying study quality and interpretation limitations."
      />

      <EvidenceSummaryCard
        title="Randomized controlled trials"
        evidenceLevel="Strong"
        humanEvidence="Human clinical trials may provide direct evidence regarding effects, tolerability, and measurable outcomes."
        mechanisticEvidence="Can help validate mechanistic hypotheses in real-world populations."
        safetyProfile="Sample size, duration, and participant diversity may influence reliability."
      />

      <EvidenceSummaryCard
        title="Mechanistic and theoretical evidence"
        evidenceLevel="Moderate"
        humanEvidence="Mechanistic evidence alone may not establish clinical relevance."
        mechanisticEvidence="Useful for understanding receptor systems, signaling pathways, and neurochemical plausibility."
        safetyProfile="Theoretical mechanisms do not guarantee safety or effectiveness."
      />

      <ReferencedStudies
        studies={[
          {
            title: 'PubMed Clinical Research',
            href: 'https://pubmed.ncbi.nlm.nih.gov/',
            source: 'NIH / PubMed',
          },
          {
            title: 'National Center for Complementary and Integrative Health',
            href: 'https://www.nccih.nih.gov/',
            source: 'NCCIH',
          },
        ]}
      />
    </main>
  )
}
