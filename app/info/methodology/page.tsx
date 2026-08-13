import type { Metadata } from 'next'
import Link from 'next/link'
import { SafetyDisclaimerBox } from '@/components/monetization/SafetyDisclaimerBox'
import { TrustMethodologyCallout } from '@/components/monetization/TrustMethodologyCallout'
import SchemaGraphScript from '@/components/seo/SchemaGraphScript'
import { buildToolPageSchemaGraph } from '../../../src/lib/schema-graph'
import { SITE_URL } from '../../../src/lib/seo'
import References from '@/components/References'

export const metadata: Metadata = {
  title: 'How We Grade Evidence & Methodology',
  description:
    'How The Hippie Scientist evaluates supplement evidence, separates mechanism from outcomes, handles uncertainty, and keeps commercial incentives from changing evidence conclusions.',
  alternates: { canonical: '/info/methodology/' },
}

const METHODOLOGY_REFS = [
  { n: 1, text: 'Schulz KF, Altman DG, Moher D; CONSORT Group. (2010). CONSORT 2010 statement: updated guidelines for reporting parallel group randomised trials. PLoS Med, 7(3):e1000251.', url: 'https://pubmed.ncbi.nlm.nih.gov/20352064/' },
  { n: 2, text: 'Lundh A, et al. (2018). Industry sponsorship and research outcome: systematic review with meta-analysis. Intensive Care Med, 44(10):1603-1612.', url: 'https://pubmed.ncbi.nlm.nih.gov/30132025/' },
  { n: 3, text: 'Manyara AM, et al. (2023). Definitions, acceptability, limitations, and guidance in the use and reporting of surrogate end points in trials: a scoping review. J Clin Epidemiol, 160:83-99.', url: 'https://pubmed.ncbi.nlm.nih.gov/37380118/' },
]

export default function MethodologyPage() {
  const grades = [
    {
      level: 'Strong Evidence',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      description: 'A comparatively strong body of direct human evidence with acceptable study quality, consistency, precision, and applicability. Statistical significance alone is not enough, and one positive trial does not automatically qualify a profile for the highest-confidence label.',
    },
    {
      level: 'Moderate Evidence',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
      description: 'Meaningful human evidence exists, but confidence is still limited by factors such as study count, replication, precision, duration, population breadth, or formulation specificity. Claims should stay narrower than they would for a more mature evidence base.',
    },
    {
      level: 'Limited Evidence',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
      description: 'Evidence is early, indirect, or materially uncertain. Human data may be sparse, or the case may rely mainly on mechanistic, animal, observational, uncontrolled, or exploratory findings. These sources can support hypotheses but not confident efficacy claims.',
    },
    {
      level: 'Mixed Evidence',
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
      description: 'Human findings are inconsistent or point in different directions. The disagreement is described rather than assigned to an assumed cause unless differences in population, preparation, dose, outcome, or study design are actually supported by the evidence.',
    },
    {
      level: 'Traditional Only',
      badgeColor: 'bg-neutral-100 text-neutral-800 border-neutral-200',
      description: 'Historical or ethnobotanical use is documented, but direct modern human evidence for the practical claim is absent or insufficient. Traditional use can guide research questions; it is not treated as demonstrated clinical efficacy.',
    },
    {
      level: 'Insufficient / Risk-Heavy',
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
      description: 'Evidence is too weak, indirect, incomplete, or risk-limited to support a confident practical conclusion. Safety concerns and efficacy uncertainty are evaluated separately rather than collapsed into one claim.',
    },
  ]

  const schemaGraph = buildToolPageSchemaGraph({
    path: '/info/methodology',
    title: 'How We Grade Evidence & Methodology',
    description:
      'Detailed review of The Hippie Scientist evidence grading levels, conflict-of-interest policy, conservative framing rules, and editorial workflow.',
    breadcrumbs: [
      { name: 'Home', url: `${SITE_URL}/` },
      { name: 'Methodology', url: `${SITE_URL}/info/methodology/` },
    ],
    faqQuestions: [
      {
        question: 'How does The Hippie Scientist grade evidence?',
        answer:
          'Evidence labels weigh direct human evidence, study design, risk of bias, effect size and precision, consistency, replication, applicability, formulation, and important limitations. Mechanistic, animal, and in-vitro findings are kept separate from demonstrated human outcomes.',
      },
      {
        question: 'Do affiliate links affect evidence grades?',
        answer:
          'No. Product placement and affiliate revenue do not affect evidence grades, safety warnings, or editorial conclusions. The site states risks plainly when an ingredient lacks support or carries meaningful interaction concerns.',
      },
      {
        question: 'Why are some supplement claims framed conservatively?',
        answer:
          'Supplement evidence often depends on population, dose, preparation, trial duration, outcome measure, study quality, and replication. Conservative framing prevents mechanisms or exploratory findings from being presented as settled clinical proof.',
      },
    ],
  })

  return (
    <div className='container-page py-10 space-y-8 max-w-4xl mx-auto'>
      <SchemaGraphScript graph={schemaGraph} />

      <section className='hero-shell rounded-[2rem] border border-brand-900/10 p-6 shadow-card sm:p-8 bg-white/95'>
        <p className='eyebrow-label'>Editorial evidence standard</p>
        <h1 className='mt-2 font-display text-3xl font-bold text-ink sm:text-4xl leading-tight'>
          Evidence Grading &amp; Research Methodology
        </h1>
        <p className='mt-4 text-sm leading-relaxed text-muted sm:text-base'>
          Supplement science is easy to oversimplify. At <strong>The Hippie Scientist</strong>, clinical outcomes, mechanisms, traditional use, safety data, and product comparability are treated as different evidence questions rather than blended into one confidence claim.
        </p>
      </section>

      <TrustMethodologyCallout />

      <section className='card-premium p-6 sm:p-8 space-y-6'>
        <div className='space-y-2'>
          <h2 className='text-2xl font-bold tracking-tight text-ink font-display'>How We Grade Evidence</h2>
          <p className='text-sm text-muted'>
            Evidence labels are editorial summaries of confidence for a profile or practical claim. They are not mathematical scores, and they do not imply that every statement or cited study on a page has the same certainty.
          </p>
        </div>

        <div className='grid gap-4 md:grid-cols-2'>
          {grades.map((item) => (
            <article key={item.level} className='rounded-2xl border border-brand-900/5 bg-white p-5 space-y-3 shadow-sm'>
              <div className='flex items-center gap-2'>
                <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${item.badgeColor}`}>
                  {item.level}
                </span>
              </div>
              <p className='text-xs sm:text-sm leading-relaxed text-muted'>{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className='card-premium p-6 sm:p-8 space-y-6'>
        <h2 className='text-2xl font-bold tracking-tight text-ink font-display'>Conservative Framing Guidelines</h2>
        <div className='grid gap-6 sm:grid-cols-3 text-sm text-muted'>
          <div className='space-y-2'>
            <h3 className='font-bold text-ink'>Human outcomes before mechanisms</h3>
            <p className='text-xs leading-relaxed'>
              Receptor, animal, and cell findings can explain plausibility but do not establish an effective human dose or clinically meaningful benefit. Human outcome evidence is required before mechanism is presented as efficacy.
            </p>
          </div>
          <div className='space-y-2'>
            <h3 className='font-bold text-ink'>Effect size, precision, and limitations</h3>
            <p className='text-xs leading-relaxed'>
              We look beyond whether a result crosses a statistical-significance threshold. Effect estimates, confidence intervals, missing data, duration, pre-specified outcomes, replication, and risk-of-bias concerns shape the conclusion. CONSORT reporting standards make many of those checks possible. [1]
            </p>
          </div>
          <div className='space-y-2'>
            <h3 className='font-bold text-ink'>Preparation and formulation</h3>
            <p className='text-xs leading-relaxed'>
              Botanical studies may use a specific extract, plant part, standardization target, or formulation. We report those details when they affect applicability, but no retail product is described as guaranteed to reproduce a trial result simply because it uses a similar ingredient name.
            </p>
          </div>
        </div>
      </section>

      <section className='card-premium p-6 sm:p-8 space-y-5'>
        <h2 className='text-2xl font-bold tracking-tight text-ink font-display'>Other interpretation rules</h2>
        <div className='space-y-4 text-sm leading-7 text-muted'>
          <p><strong className='text-ink'>Surrogate endpoints:</strong> A biomarker or intermediate outcome is not automatically equivalent to a patient-important benefit. Surrogates need evidence that they reliably predict the clinical outcome being inferred. [3]</p>
          <p><strong className='text-ink'>Funding and conflicts:</strong> Industry funding does not automatically invalidate a study, and non-industry funding does not guarantee quality. Sponsor role, author conflicts, protocol transparency, and independent replication are considered as context. Reviews of drug and device research have found industry-sponsored studies more often report favorable efficacy results and conclusions than non-industry-sponsored studies. [2]</p>
          <p><strong className='text-ink'>Safety is separate from efficacy:</strong> A profile can have comparatively strong efficacy evidence and still require substantial safety caution. Medication interactions, contraindications, pregnancy or breastfeeding considerations, surgery risk, organ-function concerns, and dose uncertainty are reviewed independently of benefit claims.</p>
        </div>
      </section>

      <section className='card-premium p-6 sm:p-8 space-y-4 border-l-4 border-emerald-600 bg-emerald-50/10'>
        <h2 className='text-2xl font-bold tracking-tight text-ink font-display'>Conflict of Interest &amp; Independence Statement</h2>
        <p className='text-sm leading-relaxed text-muted'>
          <strong>The Hippie Scientist</strong> is independently operated and editorially independent. We do not accept brand sponsorships, paid reviews, or direct compensation from supplement companies. Disclosed affiliate commissions may help support operating costs.
        </p>
        <p className='text-sm leading-relaxed text-muted'>
          Affiliate availability cannot raise an evidence grade, erase a safety warning, or convert limited evidence into a recommendation. Product modules are downstream of the evidence and safety review rather than inputs to it.
        </p>
        <div className='pt-2 flex flex-wrap gap-4'>
          <Link href='/info/affiliate-disclosure/' className='text-sm font-semibold text-emerald-800 hover:underline'>
            Affiliate Disclosure →
          </Link>
          <Link href='/info/disclaimer/' className='text-sm font-semibold text-emerald-800 hover:underline'>
            Medical Disclaimer →
          </Link>
        </div>
      </section>

      <section className='card-premium p-6 sm:p-8 space-y-4 bg-white/95'>
        <h2 className='text-2xl font-bold tracking-tight text-ink font-display'>Author &amp; Editorial Workflow</h2>
        <p className='text-sm leading-relaxed text-muted'>
          The Hippie Scientist is an independent project written and maintained by <strong>Willie B. Randolph III</strong>. Automated validation supports source, safety, data-integrity, and publishing checks; it does not substitute for clinician judgment or independent medical review.
        </p>
        <div className='grid gap-4 sm:grid-cols-2 text-xs text-muted leading-relaxed'>
          <div className='rounded-xl border border-brand-900/5 bg-brand-50/20 p-4'>
            <h3 className='font-bold text-ink text-sm'>Willie B. Randolph III</h3>
            <p className='text-brand-700 font-medium mb-1'>Founder and independent author</p>
            <p>Builds the content system, evaluates source quality, documents uncertainty, and maintains the site’s evidence and safety standards.</p>
          </div>
          <div className='rounded-xl border border-brand-900/5 bg-brand-50/20 p-4'>
            <h3 className='font-bold text-ink text-sm'>Documented validation workflow</h3>
            <p className='text-brand-700 font-medium mb-1'>Evidence, safety, and publishing checks</p>
            <p>Build-time checks test citation integrity, evidence language, safety visibility, route stability, structured data, and generated-data consistency.</p>
          </div>
        </div>
        <div className='flex flex-wrap gap-4 pt-1'>
          <Link href='/info/author/' rel='author' className='text-sm font-semibold text-emerald-800 hover:underline'>
            About the author →
          </Link>
          <Link href='/info/contact/' className='text-sm font-semibold text-emerald-800 hover:underline'>
            Send a correction →
          </Link>
        </div>
      </section>

      <SafetyDisclaimerBox />
      <References refs={METHODOLOGY_REFS} />
    </div>
  )
}
