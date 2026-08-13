import type { Metadata } from 'next'
import { buildPageMetadata } from '../../../src/lib/seo'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import EvidenceSummaryCard from '@/components/evidence/EvidenceSummaryCard'
import ReferencedStudies from '@/components/evidence/ReferencedStudies'
import References from '@/components/References'

export const metadata: Metadata = buildPageMetadata({
  title: 'Evidence Hierarchy',
  description: 'Educational overview of evidence hierarchy, clinical trials, mechanistic evidence, ethnobotanical context, and scientific interpretation systems.',
  path: '/learn/evidence-hierarchy/',
})

const EVIDENCE_HIERARCHY_REFS = [
  { n: 1, text: 'Burns PB, et al. (2011). The levels of evidence. Plast Reconstr Surg, 128(1): 305-310.', url: 'https://pubmed.ncbi.nlm.nih.gov/21701348/' },
]

export default function EvidenceHierarchyPage() {
  return (
    <div className="container-page py-10 space-y-12">
      <AuthorityJsonLd
        title="Evidence Hierarchy"
        description="Educational overview of evidence hierarchy, clinical trials, mechanistic evidence, ethnobotanical context, and scientific interpretation systems."
        url="https://thehippiescientist.net/learn/evidence-hierarchy"
        type="Article"
      />

      <AuthorityBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Education', href: '/learn' },
          { label: 'Evidence Hierarchy' },
        ]}
      />

      <section className="space-y-6 max-w-4xl">
        <div className="space-y-3">
          <p className="eyebrow-label">Scientific Interpretation</p>
          <h1 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl lg:text-5xl">
            Evidence Hierarchy
          </h1>
        </div>

        <p className="text-xl leading-9 text-muted">
          Evidence hierarchies are useful starting frameworks for matching a study design to the question it can answer. They are not automatic rankings of truth: review quality, risk of bias, directness, precision, consistency, and applicability can raise or lower confidence within any design category.
        </p>
      </section>

      <EvidenceSummaryCard
        title="Systematic reviews and meta-analyses"
        evidenceLevel="Strong"
        humanEvidence="Can provide high-confidence summaries when the question is well defined, eligible studies are appropriate, methods are transparent, and the underlying evidence is sufficiently trustworthy and comparable."
        mechanisticEvidence="Can place clinical and mechanistic findings in broader context, but pooled estimates do not repair bias or indirectness in the included studies."
        safetyProfile="Confidence still depends on the included populations, follow-up, adverse-event reporting, heterogeneity, publication bias, and review methods."
      />

      <EvidenceSummaryCard
        title="Randomized controlled trials"
        evidenceLevel="Strong"
        humanEvidence="Can provide direct causal evidence for the population, intervention, comparator, and outcomes actually studied when randomization and trial conduct are credible."
        mechanisticEvidence="Can test whether a mechanistically plausible intervention produces measurable human outcomes, but the mechanism itself is not proven by a positive clinical result."
        safetyProfile="Sample-size adequacy, duration, missing data, participant diversity, outcome selection, adherence, and adverse-event capture all affect confidence."
      />

      <EvidenceSummaryCard
        title="Observational human evidence"
        evidenceLevel="Moderate"
        humanEvidence="Can identify associations, longer-term patterns, uncommon exposures, and real-world signals that trials may not capture."
        mechanisticEvidence="May help connect biological hypotheses with human patterns, while residual confounding and selection bias can limit causal interpretation."
        safetyProfile="Especially useful for generating and investigating safety signals, but associations still require careful control of confounding and measurement error."
      />

      <EvidenceSummaryCard
        title="Mechanistic, animal, and theoretical evidence"
        evidenceLevel="Limited"
        humanEvidence="Mechanistic or preclinical evidence alone does not establish a clinically meaningful human benefit, an effective oral dose, or long-term safety."
        mechanisticEvidence="Useful for understanding receptors, signaling pathways, metabolism, pharmacology, and biological plausibility."
        safetyProfile="A plausible pathway does not guarantee effectiveness or safety in humans."
      />

      <section className="card-premium max-w-4xl p-6 space-y-3">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Use the hierarchy with the research question</h2>
        <p className="text-sm leading-7 text-muted">
          Different designs can be strongest for different questions. Randomized trials are often preferred for causal treatment effects, while observational evidence may be essential for uncommon harms or long-term real-world patterns. A well-conducted study that directly answers the question can be more informative than a nominally “higher” design that is biased, indirect, or built from poor underlying studies.
        </p>
      </section>

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
      <References refs={EVIDENCE_HIERARCHY_REFS} />
    </div>
  )
}
