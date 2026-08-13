import type { Metadata } from 'next'
import { buildPageMetadata } from '../../../src/lib/seo'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import EvidenceSection from '@/components/evidence/EvidenceSection'
import ReferencedStudies from '@/components/evidence/ReferencedStudies'
import ResearchLimitations from '@/components/evidence/ResearchLimitations'
import References from '@/components/References'

export const metadata: Metadata = buildPageMetadata({
  title: 'How to Read Scientific Studies',
  description: 'Educational overview of scientific interpretation, evidence quality, human trials, mechanistic evidence, and research limitations.',
  path: '/learn/how-to-read-scientific-studies/',
})

const HOW_TO_READ_SCIENTIFIC_STUDIES_REFS = [
  { n: 1, text: 'Greenhalgh T. (2014). How to Read a Paper, 5th ed. BMJ Books.', url: '' },
  { n: 2, text: 'Ioannidis JPA. (2005). Why most published research findings are false. PLoS Med, 2(8): e124.', url: 'https://pubmed.ncbi.nlm.nih.gov/16060722/' },
  { n: 3, text: 'Lundh A, et al. (2018). Industry sponsorship and research outcome: systematic review with meta-analysis. Intensive Care Med, 44(10):1603-1612.', url: 'https://pubmed.ncbi.nlm.nih.gov/30132025/' },
  { n: 4, text: 'Manyara AM, et al. (2023). Definitions, acceptability, limitations, and guidance in the use and reporting of surrogate end points in trials: a scoping review. J Clin Epidemiol, 160:83-99.', url: 'https://pubmed.ncbi.nlm.nih.gov/37380118/' },
]

export default function ReadScientificStudiesPage() {
  return (
    <div className="container-page py-10 space-y-12">
      <AuthorityJsonLd
        title="How to Read Scientific Studies"
        description="Educational overview of scientific interpretation, evidence quality, human trials, mechanistic evidence, and research limitations."
        url="https://thehippiescientist.net/learn/how-to-read-scientific-studies"
        type="Article"
      />

      <AuthorityBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Education', href: '/learn' },
          { label: 'How to Read Scientific Studies' },
        ]}
      />

      <section className="space-y-6 max-w-4xl">
        <div className="space-y-3">
          <p className="eyebrow-label">Scientific Literacy</p>

          <h1 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl lg:text-5xl">
            How to Read Scientific Studies
          </h1>
        </div>

        <p className="text-xl leading-9 text-muted">
          Scientific interpretation involves evaluating evidence quality, study design, population size, effect estimates, uncertainty, limitations, reproducibility, mechanistic plausibility, and clinical relevance.
        </p>

        <p className="text-base leading-8 text-[#5c6b63]">
          Educational neuropharmacology and ethnobotanical interpretation should remain cautious, evidence aware, and transparent about uncertainty and what a study can—and cannot—establish.
        </p>
      </section>

      <EvidenceSection
        title="Human trials and clinical relevance"
        evidenceLevel="Strong"
        summary="Well-designed human trials can provide direct evidence about outcomes in the populations studied. Systematic reviews and meta-analyses can add broader context when the included studies are sufficiently comparable and trustworthy."
        limitations="Randomization does not erase every limitation. Sample-size adequacy, missing data, outcome selection, follow-up duration, adherence, selective reporting, conflicts of interest, and applicability to other populations still matter."
      />

      <EvidenceSection
        title="Mechanistic evidence"
        evidenceLevel="Moderate"
        summary="Mechanistic studies can help explain receptor systems, signaling pathways, metabolism, and biological plausibility."
        limitations="A plausible mechanism does not by itself establish a meaningful benefit, an effective dose, or long-term safety in humans."
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
          'Animal and cell models may clarify mechanisms but do not establish human efficacy.',
          'Many herbal interventions still lack large, long-duration, independently replicated human trials.',
          'Publication bias, selective reporting, and conflicts of interest can affect the available evidence base.',
        ]}
      />

      <section className="card-premium p-6 space-y-4 mb-8">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Questions to ask before trusting a result</h2>
        <div className="space-y-3 text-sm leading-7 text-muted">
          <p><strong className="text-ink">Was the sample size justified?</strong> A participant count is not good or bad by itself. Power depends on the expected effect, outcome variability, design, attrition, and statistical plan.</p>
          <p><strong className="text-ink">Was the comparison fair?</strong> Randomization, an appropriate comparator, allocation procedures, and blinding can reduce important biases when they are feasible. Lack of blinding raises concern most when outcomes or decisions are vulnerable to expectations.</p>
          <p><strong className="text-ink">What outcome was actually measured?</strong> A change in a biomarker or intermediate endpoint is not automatically the same as a patient-important benefit. Surrogate outcomes need evidence that they reliably predict the outcome they are standing in for.</p>
          <p><strong className="text-ink">How precise and reproducible is the effect?</strong> Look beyond the p-value. Check the effect size, confidence interval, missing data, pre-specified outcomes, replication, and consistency with the broader literature.</p>
          <p><strong className="text-ink">Who funded the study?</strong> Funding does not automatically invalidate a trial, but conflicts of interest and sponsor involvement deserve scrutiny. Large reviews have found industry-sponsored drug and device studies more often report favorable efficacy results and conclusions than non-industry-sponsored studies.</p>
          <p><strong className="text-ink">Is the follow-up long enough for the claim?</strong> A short trial can answer a short-term question. It generally cannot establish durability or uncommon long-term harms.</p>
        </div>
      </section>

      <References refs={HOW_TO_READ_SCIENTIFIC_STUDIES_REFS} />
    </div>
  )
}
