import type { Metadata } from 'next'
import Link from 'next/link'
import { buildPageMetadata } from '../../../src/lib/seo'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import EducationPageLayout from '@/components/layouts/EducationPageLayout'
import TrialDesignInsight from '@/components/education/TrialDesignInsight'
import EvidenceGradeRationale from '@/components/education/EvidenceGradeRationale'
import SafetyNotice from '@/components/evidence/SafetyNotice'
import References from '@/components/References'

export const metadata: Metadata = buildPageMetadata({
  title: 'Evidence Literacy: How to Read and Evaluate Herbal Clinical Trials',
  description: 'A practical guide to evaluating study designs, identifying biases, and understanding evidence grading in botanical and supplement research.',
  path: '/learn/evidence-literacy/',
})

const challenges = [
  {
    title: 'Chemical Complexity',
    body: 'Botanical preparations are mixtures rather than single standardized molecules. Different species, plant parts, extracts, and constituent profiles can produce meaningfully different exposures, so results from one preparation should not automatically be generalized to another.',
  },
  {
    title: 'Extract Standardization',
    body: 'Constituent concentrations can vary with cultivation, harvest, processing, solvent, plant part, and manufacturing. A raw powder and a concentrated standardized extract may share a plant name while delivering very different chemical profiles.',
  },
  {
    title: 'Blinding & Organoleptic Properties',
    body: 'Distinctive tastes, odors, colors, or sensations can make botanical trials difficult to blind. If participants or study staff can correctly guess treatment assignment, subjective outcomes and study behavior may be more vulnerable to expectation-related bias.',
  },
]

const biases = [
  {
    title: 'Funding & Conflicts of Interest',
    body: 'Funding source does not automatically make a study invalid, but sponsor involvement and author conflicts deserve scrutiny. Systematic reviews of drug and device research have found industry-sponsored studies more often report favorable efficacy results and conclusions than non-industry-sponsored studies.',
  },
  {
    title: 'Publication & Selective-Reporting Bias',
    body: 'The published record can overrepresent favorable findings when null or unfavorable results are less likely to appear, or when only selected outcomes are emphasized. Trial registration, protocols, and pre-specified outcomes help readers check what was planned before the results were known.',
  },
  {
    title: 'Expectation and Measurement Bias',
    body: 'Symptoms such as anxiety, fatigue, sleep quality, pain, and focus are often measured with patient-reported scales because the experience itself matters. Those outcomes are not inherently inferior, but blinding, validated instruments, missing-data handling, and clinically meaningful effect sizes become especially important.',
  },
  {
    title: 'Outcome Substitution',
    body: 'Biomarkers and other intermediate outcomes can be useful, but a change in a surrogate does not automatically establish a patient-important benefit. Ask whether the surrogate has been validated for the clinical outcome being inferred.',
  },
]

const relatedSystems = [
  { href: '/learn/how-to-read-scientific-studies', title: 'How to Read Scientific Studies' },
  { href: '/learn/evidence-hierarchy', title: 'Evidence Hierarchy' },
  { href: '/learn/study-design-snapshot', title: 'Study Design Snapshot' },
  { href: '/learn/why-studies-conflict', title: 'Why Studies Conflict' },
]

const EVIDENCE_LITERACY_REFS = [
  { n: 1, text: 'Ioannidis JPA. (2005). Why most published research findings are false. PLoS Med, 2(8): e124.', url: 'https://pubmed.ncbi.nlm.nih.gov/16060722/' },
  { n: 2, text: 'Button KS, et al. (2013). Power failure: why small sample size undermines the reliability of neuroscience. Nat Rev Neurosci, 14(5):365-376.', url: 'https://pubmed.ncbi.nlm.nih.gov/23571845/' },
  { n: 3, text: 'Lundh A, et al. (2018). Industry sponsorship and research outcome: systematic review with meta-analysis. Intensive Care Med, 44(10):1603-1612.', url: 'https://pubmed.ncbi.nlm.nih.gov/30132025/' },
  { n: 4, text: 'Manyara AM, et al. (2023). Definitions, acceptability, limitations, and guidance in the use and reporting of surrogate end points in trials: a scoping review. J Clin Epidemiol, 160:83-99.', url: 'https://pubmed.ncbi.nlm.nih.gov/37380118/' },
]

export default function EvidenceLiteracyPage() {
  return (
    <>
      <AuthorityJsonLd
        title="Evidence Literacy: How to Read and Evaluate Herbal Clinical Trials"
        description="A practical guide to evaluating study designs, identifying biases, and understanding evidence grading in botanical and supplement research."
        url="https://thehippiescientist.net/learn/evidence-literacy"
        type="Article"
      />
      <EducationPageLayout
        title="Evidence Literacy: How to Read and Evaluate Herbal Clinical Trials"
        description="Botanical and supplement studies can be difficult to compare because products, constituent profiles, doses, populations, outcomes, and study designs vary. This guide focuses on the questions that determine how much confidence a result deserves rather than relying on one-size-fits-all rules."
      >
        <section className="space-y-6">
          <div className="space-y-2">
            <p className="eyebrow-label">1. The Unique Challenges of Botanical Research</p>
            <h2 className="text-3xl font-semibold tracking-tight text-ink">Why the exact preparation matters</h2>
            <p className="text-sm leading-7 text-muted">A botanical name alone does not guarantee that two interventions are equivalent. Identity, plant part, extraction method, standardization, dose, and quality all affect how directly one study applies to another product.</p>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            {challenges.map((item) => (
              <div key={item.title} className="card-premium p-6 space-y-4">
                <h3 className="text-xl font-semibold tracking-tight text-ink">{item.title}</h3>
                <p className="text-sm leading-7 text-muted">{item.body}</p>
              </div>
            ))}
          </div>
        </section>

        <TrialDesignInsight designType="In Vitro" title="Mechanistic Plausibility vs. Human Efficacy">
          Cell and biochemical studies can identify plausible pathways and targets, but they do not establish that a swallowed product reaches the relevant tissue at a useful concentration or produces a meaningful benefit in people. Human pharmacokinetics, dose, formulation, and clinical outcomes are separate questions.
        </TrialDesignInsight>

        <section className="space-y-6">
          <div className="space-y-2">
            <p className="eyebrow-label">2. Key Elements of Clinical Trial Design</p>
            <h2 className="text-3xl font-semibold tracking-tight text-ink">What to look for when reading a study</h2>
            <p className="text-sm leading-7 text-muted">No single design label settles the question. Read the trial as a chain: who was studied, what exactly was given, what it was compared with, how outcomes were measured, and how much uncertainty remains.</p>
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="card-premium p-6 space-y-3">
              <h3 className="text-xl font-semibold tracking-tight text-ink">Comparators and Randomization</h3>
              <p className="text-sm leading-7 text-muted">For causal treatment questions, a suitable comparison group and sound randomization can reduce important sources of bias. The right comparator depends on the question being asked.</p>
              <ul className="list-disc space-y-2 pl-5 text-sm leading-7 text-muted">
                <li><strong className="text-ink">Placebo control:</strong> Helps separate treatment effects from expectations and changes that would have happened anyway when a credible placebo is feasible.</li>
                <li><strong className="text-ink">Active comparator:</strong> Helps answer whether an intervention performs differently from an established treatment, but interpretation depends on dose, population, and whether the trial was designed for superiority, equivalence, or non-inferiority.</li>
              </ul>
            </div>
            <div className="card-premium p-6 space-y-3">
              <h3 className="text-xl font-semibold tracking-tight text-ink">Blinding</h3>
              <p className="text-sm leading-7 text-muted">Blinding can reduce bias when knowledge of treatment assignment could influence behavior, co-interventions, outcome reporting, or assessment.</p>
              <ul className="list-disc space-y-2 pl-5 text-sm leading-7 text-muted">
                <li><strong className="text-ink">Participant blinding:</strong> Most relevant when expectations could change symptoms, adherence, or other behavior.</li>
                <li><strong className="text-ink">Assessor blinding:</strong> Especially important when outcomes require judgment rather than an automated measurement.</li>
              </ul>
            </div>
          </div>
          <div className="card-premium p-6 space-y-3">
            <h3 className="text-xl font-semibold tracking-tight text-ink">Sample Size, Power, and Precision</h3>
            <p className="text-sm leading-7 text-muted">There is no universal participant-count threshold for a “good” study. Adequacy depends on the expected effect, outcome variability, design, attrition, and analysis plan. Check whether the sample-size calculation was pre-specified and whether confidence intervals are narrow enough to rule out clinically important alternatives.</p>
          </div>
        </section>

        <TrialDesignInsight designType="RCT" sampleSize={120} duration="12 weeks" blinding="Double-blind" control="Placebo-controlled" title="Strong design does not mean automatic certainty">
          A randomized, double-blind, placebo-controlled trial can provide strong causal evidence when the randomization works, the intervention and comparator are appropriate, follow-up is adequate, missing data are handled well, and the outcomes answer the question readers care about. The design label is the beginning of appraisal, not the conclusion.
        </TrialDesignInsight>

        <section className="space-y-6">
          <div className="space-y-2">
            <p className="eyebrow-label">3. Identifying Common Biases in Supplement Research</p>
            <h2 className="text-3xl font-semibold tracking-tight text-ink">Bias changes confidence, not truth by slogan</h2>
            <p className="text-sm leading-7 text-muted">Potential bias should change how closely you inspect a study and how much confidence you place in it. It should not be used as an automatic rule that a result is true or false.</p>
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            {biases.map((item) => (
              <div key={item.title} className="card-premium p-6 space-y-3">
                <h3 className="text-xl font-semibold tracking-tight text-ink">{item.title}</h3>
                <p className="text-sm leading-7 text-muted">{item.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <div className="space-y-2">
            <p className="eyebrow-label">4. How Design Quality Dictates Evidence Grades</p>
            <h2 className="text-3xl font-semibold tracking-tight text-ink">Translating studies into confidence</h2>
            <p className="text-sm leading-7 text-muted">The site’s evidence grades are intended to summarize confidence across the body of evidence. Study design matters, but so do directness, consistency, precision, replication, product comparability, and limitations.</p>
          </div>

          <EvidenceGradeRationale grade="A" designMatch="Multiple high-quality human trials or equivalent strong evidence" riskOfBias="Low" consistency="Consistent">
            Grade A should reflect a body of direct human evidence with consistent, reasonably precise findings and no major unresolved risk-of-bias or applicability problem. A single positive trial is not enough by itself.
          </EvidenceGradeRationale>

          <EvidenceGradeRationale grade="C" designMatch="Limited, indirect, or inconsistent human evidence" riskOfBias="Medium" consistency="Mixed">
            Grade C indicates material uncertainty. Human evidence may exist, but it can be small, indirect, inconsistent, imprecise, formulation-specific, or limited by design problems. The right response is narrower claims and more visible uncertainty—not a universal sample-size cutoff.
          </EvidenceGradeRationale>

          <p className="text-sm leading-7 text-muted">When a claim sounds absolute, work backward to the evidence: identify the exact preparation and population, inspect the comparison and outcomes, look at the effect size and uncertainty, and then ask whether independent evidence points in the same direction.</p>
        </section>

        <SafetyNotice>
          This guide is educational and describes how to interpret research methodology. It is not medical advice and does not evaluate the efficacy or safety of any specific herb or supplement.
        </SafetyNotice>

        <section className="space-y-5">
          <div className="space-y-2">
            <p className="eyebrow-label">Related Educational Systems</p>
            <h2 className="text-3xl font-semibold tracking-tight text-ink">Continue exploring scientific literacy systems</h2>
          </div>
          <div className="grid gap-5 lg:grid-cols-2">
            {relatedSystems.map((system) => (
              <Link key={system.href} href={system.href} className="card-premium p-6 transition motion-safe:hover:-translate-y-0.5">
                <div className="space-y-3">
                  <p className="eyebrow-label">Related System</p>
                  <h3 className="text-2xl font-semibold tracking-tight text-ink">{system.title}</h3>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="card-premium p-6 space-y-4 mb-8">
          <h2 className="text-2xl font-semibold tracking-tight text-ink">A faster way to appraise a study</h2>
          <ol className="list-decimal space-y-2 pl-5 text-sm leading-7 text-muted">
            <li>Define the exact population, intervention, comparator, and outcome.</li>
            <li>Check randomization, blinding where relevant, attrition, and pre-specified outcomes.</li>
            <li>Read the effect size and confidence interval rather than stopping at “statistically significant.”</li>
            <li>Ask whether the measured outcome is meaningful to patients or a validated surrogate.</li>
            <li>Inspect funding, conflicts of interest, protocol changes, and selective reporting.</li>
            <li>Compare the result with independent studies and systematic reviews before treating it as established.</li>
          </ol>
        </section>

        <References refs={EVIDENCE_LITERACY_REFS} />
      </EducationPageLayout>
    </>
  )
}
