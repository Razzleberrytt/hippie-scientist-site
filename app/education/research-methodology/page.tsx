import Link from 'next/link'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import EvidenceSection from '@/components/evidence/EvidenceSection'

export default function ResearchMethodologyPage() {
  return (
    <main className="container-page py-10 space-y-12">
      <AuthorityJsonLd
        title="Research Methodology"
        description="Educational overview of evidence standards, human trials, mechanistic evidence, neuropharmacology interpretation, and scientific methodology."
        url="https://thehippiescientist.net/education/research-methodology"
        type="Article"
      />

      <AuthorityBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Education', href: '/education' },
          { label: 'Research Methodology' },
        ]}
      />

      <section className="space-y-6 max-w-4xl">
        <div className="space-y-3">
          <p className="eyebrow-label">Editorial Standards</p>

          <h1 className="text-5xl font-bold tracking-tight text-ink">
            Research Methodology
          </h1>
        </div>

        <p className="text-xl leading-9 text-[#46574d]">
          The Hippie Scientist prioritizes conservative, educational interpretation grounded in human evidence, neuropharmacology, systems biology, and transparent research limitations.
        </p>

        <p className="text-base leading-8 text-[#5c6b63]">
          Educational content should not be interpreted as medical advice. Evidence quality varies substantially across herbs, compounds, psychoactive systems, and recovery-oriented neuropharmacology.
        </p>
      </section>

      <EvidenceSection
        title="Human evidence prioritization"
        evidenceLevel="Strong"
        summary="Human clinical evidence, meta-analyses, systematic reviews, and randomized controlled trials receive the highest weighting within educational interpretation systems."
        limitations="Many herbs and psychoactive ethnobotanicals still lack large-scale long-term human data."
        studies={[
          {
            label: 'PubMed',
            href: 'https://pubmed.ncbi.nlm.nih.gov/',
          },
          {
            label: 'NIH ODS',
            href: 'https://ods.od.nih.gov/',
          },
        ]}
      />

      <EvidenceSection
        title="Mechanistic and neuropharmacology evidence"
        evidenceLevel="Moderate"
        summary="Mechanistic neuropharmacology evidence may help contextualize signaling systems, neurotransmitter pathways, receptor interactions, and recovery-oriented biology."
        limitations="Mechanistic plausibility alone does not establish clinical effectiveness or safety."
      />

      <EvidenceSection
        title="Traditional and ethnobotanical context"
        evidenceLevel="Traditional"
        summary="Traditional ethnobotanical usage may provide historical context regarding ceremonial systems, psychoactive applications, calming systems, and recovery-oriented practices."
        limitations="Traditional use alone is not equivalent to modern clinical validation."
      />

      <section className="space-y-5">
        <div className="space-y-2">
          <p className="eyebrow-label">Continue Exploring</p>

          <h2 className="text-3xl font-semibold tracking-tight text-ink">
            Related educational systems
          </h2>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link href="/education/what-is-neuropharmacology" className="chip-readable">
            Neuropharmacology
          </Link>

          <Link href="/about/psychoactives/harm-reduction" className="chip-readable">
            Harm Reduction
          </Link>

          <Link href="/education/how-herbal-psychoactives-differ-from-pharmaceuticals" className="chip-readable">
            Herbal vs Pharmaceutical Systems
          </Link>
        </div>
      </section>
    </main>
  )
}
