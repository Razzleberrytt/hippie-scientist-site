import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import EvidenceSection from '@/components/evidence/EvidenceSection'
import ReferencedStudies from '@/components/evidence/ReferencedStudies'
import ResearchLimitations from '@/components/evidence/ResearchLimitations'

export default function ReadScientificStudiesPage() {
  return (
    <main className="container-page py-10 space-y-12">
      <AuthorityJsonLd
        title="How to Read Scientific Studies"
        description="Educational overview of scientific interpretation, evidence quality, human trials, mechanistic evidence, and research limitations."
        url="https://thehippiescientist.net/education/how-to-read-scientific-studies"
        type="Article"
      />

      <AuthorityBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Education', href: '/education' },
          { label: 'How to Read Scientific Studies' },
        ]}
      />

      <section className="space-y-6 max-w-4xl">
        <div className="space-y-3">
          <p className="eyebrow-label">Scientific Literacy</p>

          <h1 className="text-5xl font-bold tracking-tight text-ink">
            How to Read Scientific Studies
          </h1>
        </div>

        <p className="text-xl leading-9 text-[#46574d]">
          Scientific interpretation involves evaluating evidence quality, study design, population size, limitations, reproducibility, mechanistic plausibility, and clinical relevance.
        </p>

        <p className="text-base leading-8 text-[#5c6b63]">
          Educational neuropharmacology and ethnobotanical interpretation should remain cautious, evidence aware, and transparent regarding uncertainty and limitations.
        </p>
      </section>

      <EvidenceSection
        title="Human trials and clinical relevance"
        evidenceLevel="Strong"
        summary="Human clinical trials generally provide stronger evidence than isolated mechanistic or animal-only findings. Meta-analyses and systematic reviews may offer broader context across multiple studies."
        limitations="Small sample sizes, short study durations, inconsistent methodologies, and publication bias may still influence interpretation quality."
      />

      <EvidenceSection
        title="Mechanistic evidence"
        evidenceLevel="Moderate"
        summary="Mechanistic studies may help explain receptor systems, signaling pathways, neurotransmitter interactions, and neurochemical plausibility."
        limitations="Mechanistic plausibility alone does not prove real-world effectiveness or long-term safety."
      />

      <ReferencedStudies
        studies={[
          {
            title: 'PubMed Research Database',
            href: 'https://pubmed.ncbi.nlm.nih.gov/',
            source: 'NIH / PubMed',
          },
          {
            title: 'Office of Dietary Supplements',
            href: 'https://ods.od.nih.gov/',
            source: 'NIH ODS',
          },
          {
            title: 'NCCIH Research Resources',
            href: 'https://www.nccih.nih.gov/',
            source: 'NCCIH',
          },
        ]}
      />

      <ResearchLimitations
        limitations={[
          'Single studies should rarely be interpreted in isolation.',
          'Animal models may not translate directly to humans.',
          'Many herbal systems still lack large-scale long-term human evidence.',
          'Publication bias and selective reporting may affect interpretation quality.',
        ]}
      />
    </main>
  )
}
