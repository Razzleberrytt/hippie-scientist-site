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
    body: 'An herb is not a single chemical entity. For example, Panax ginseng contains over 30 different ginsenosides, each with potentially distinct pharmacology. The interaction of these compounds is often attributed to the "entourage effect," which is difficult to isolate in clinical models.',
  },
  {
    title: 'Extract Standardization',
    body: 'The concentration of active compounds varies based on soil conditions, harvest time, extraction solvents (water vs. ethanol), and drying methods. A study evaluating a raw root powder cannot be easily compared to one using a highly concentrated 10:1 extract.',
  },
  {
    title: 'Blinding & Organoleptic Properties',
    body: 'Many herbs have strong, distinctive tastes, odors, or colors (e.g., Valerian root, Garlic, Turmeric). Creating a convincing placebo that matches these organoleptic properties is a significant challenge. If participants or researchers can identify the active herb by smell or taste, the trial is unblinded, introducing bias.',
  },
]

const biases = [
  {
    title: 'Funding Bias',
    body: 'Studies funded directly by supplement manufacturers are significantly more likely to report positive results than independently funded research. Always review the "Conflict of Interest" disclosures.',
  },
  {
    title: 'Publication Bias',
    body: 'Researchers and journals are far more likely to publish studies showing positive results than studies showing no effect (null results). Consequently, the published literature may look overwhelmingly positive, while dozens of negative trials remain hidden in drawers.',
  },
  {
    title: 'Expectation and Placebo Effects',
    body: 'Subjective symptoms like anxiety, fatigue, sleep quality, and focus are highly susceptible to expectancy. If a participant expects an adaptogen to reduce their stress, their subjective rating of stress will often decrease, even on a placebo.',
  },
  {
    title: 'Self-Reporting Issues',
    body: 'Many clinical trials rely on subjective questionnaires (e.g., Hamilton Anxiety Rating Scale) filled out by participants. Objective biomarkers (e.g., salivary cortisol levels, heart rate variability) should be measured alongside questionnaires to corroborate findings.',
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
  { n: 2, text: 'Button KS, et al. (2013). Power failure in neuroscience. Nat Rev Neurosci, 14(5): 365-376.', url: 'https://pubmed.ncbi.nlm.nih.gov/23571845/' },
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
        description="Evaluating scientific literature on herbs and dietary supplements requires a specific critical lens. Unlike synthetic pharmaceuticals, which typically contain a single, highly purified active ingredient, botanical preparations are chemically complex mixtures containing dozens or hundreds of compounds. This guide outlines how to evaluate clinical trial design, identify common research biases, and understand how the quality of a study translates to final evidence grades."
      >
        <section className="space-y-6">
          <div className="space-y-2">
            <p className="eyebrow-label">1. The Unique Challenges of Botanical Research</p>
            <h2 className="text-3xl font-semibold tracking-tight text-ink">Why botanical research is harder than single-molecule pharmaceutical research</h2>
            <p className="text-sm leading-7 text-muted">Researching botanical substances presents several unique hurdles that do not exist in standard pharmaceutical development:</p>
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
          Many commercial supplement claims are based on laboratory cell cultures (in vitro research). While in vitro studies are vital for discovering biological mechanisms — such as how a specific compound binds to an adenosine receptor — they cannot predict bioavailability, liver metabolism, or blood-brain barrier penetration in a living human.
        </TrialDesignInsight>

        <section className="space-y-6">
          <div className="space-y-2">
            <p className="eyebrow-label">2. Key Elements of Clinical Trial Design</p>
            <h2 className="text-3xl font-semibold tracking-tight text-ink">What to look for when reading a study</h2>
            <p className="text-sm leading-7 text-muted">To determine if an herb has real-world efficacy, researchers rely on human clinical trials. When reading a study, look for these foundational design features.</p>
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="card-premium p-6 space-y-3">
              <h3 className="text-xl font-semibold tracking-tight text-ink">Control Groups</h3>
              <p className="text-sm leading-7 text-muted">A study must compare the active substance against a control group to rule out natural healing, regression to the mean, and placebo effects.</p>
              <ul className="list-disc space-y-2 pl-5 text-sm leading-7 text-muted">
                <li><strong className="text-ink">Placebo Control:</strong> The gold standard. The control group receives an inert substance (like cellulose or cornstarch) matching the appearance, taste, and smell of the active herb.</li>
                <li><strong className="text-ink">Active Comparator:</strong> The herb is compared directly to an established standard treatment (e.g., comparing a standardized Lavender extract to a low-dose pharmaceutical anxiolytic).</li>
              </ul>
            </div>
            <div className="card-premium p-6 space-y-3">
              <h3 className="text-xl font-semibold tracking-tight text-ink">Blinding</h3>
              <p className="text-sm leading-7 text-muted">Blinding prevents expectations from coloring the study's outcomes.</p>
              <ul className="list-disc space-y-2 pl-5 text-sm leading-7 text-muted">
                <li><strong className="text-ink">Single-Blind:</strong> Only the participant does not know which treatment they are receiving.</li>
                <li><strong className="text-ink">Double-Blind:</strong> Neither the participant nor the evaluating researcher knows who has the active compound or the placebo. This prevents researchers from unconsciously offering extra encouragement or interpreting subjective outcomes favorably.</li>
              </ul>
            </div>
          </div>
          <div className="card-premium p-6 space-y-3">
            <h3 className="text-xl font-semibold tracking-tight text-ink">Sample Size and Statistical Power</h3>
            <p className="text-sm leading-7 text-muted">Small sample sizes are vulnerable to statistical anomalies. If a study only evaluates 15 participants, a positive outcome in 2 people can skew the results, making it look highly effective. Larger sample sizes (n &gt; 80) provide the statistical power necessary to detect true therapeutic effects and identify rarer side effects.</p>
          </div>
        </section>

        <TrialDesignInsight designType="RCT" sampleSize={120} duration="12 weeks" blinding="Double-blind" control="Placebo-controlled" title="Gold-Standard Design in Botanical Science">
          A randomized, double-blind, placebo-controlled trial (RCT) with an adequate sample size (e.g., n = 120) and duration (e.g., 12 weeks) is the most reliable method to prove that an herb's physiological effects exceed the baseline placebo response.
        </TrialDesignInsight>

        <section className="space-y-6">
          <div className="space-y-2">
            <p className="eyebrow-label">3. Identifying Common Biases in Supplement Research</p>
            <h2 className="text-3xl font-semibold tracking-tight text-ink">Structural biases in a multi-billion dollar industry</h2>
            <p className="text-sm leading-7 text-muted">Because the dietary supplement market is a multi-billion dollar industry, research is often vulnerable to structural biases:</p>
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
            <h2 className="text-3xl font-semibold tracking-tight text-ink">Translating study design into evidence grades</h2>
            <p className="text-sm leading-7 text-muted">At The Hippie Scientist, we translate clinical design parameters directly into structured evidence grades. This ensures that our claims are supported by the quality of the underlying literature, rather than marketing hype.</p>
          </div>

          <EvidenceGradeRationale grade="A" designMatch="Multiple high-quality human RCTs" riskOfBias="Low" consistency="Consistent">
            Grade A evidence represents the highest level of confidence. It requires multiple independently replicated, double-blind, placebo-controlled trials in humans, showing consistent positive outcomes with a very low risk of bias. Mechanistic plausibility must be backed by clear human pharmacokinetics.
          </EvidenceGradeRationale>

          <EvidenceGradeRationale grade="C" designMatch="Small human RCTs or large cohorts" riskOfBias="Medium" consistency="Mixed">
            Grade C evidence indicates limited or preliminary confidence. The herb may have demonstrated positive effects in small human trials (e.g., n &lt; 30) or observational cohort studies, but the findings are inconsistent, or the study methodologies suffer from minor blinding or control issues. Further research is required before drawing firm conclusions.
          </EvidenceGradeRationale>

          <p className="text-sm leading-7 text-muted">By understanding these criteria, you can look beyond absolute claims ("clinically proven") and evaluate the actual strength of the science, empowering you to make safe, rational, and evidence-informed decisions.</p>
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
        <References refs={EVIDENCE_LITERACY_REFS} />
      </EducationPageLayout>
    </>
  )
}
