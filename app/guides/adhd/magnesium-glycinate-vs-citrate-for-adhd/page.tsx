import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import AffiliateDisclosure from '@/components/AffiliateDisclosure'
import { ArticleLayout, TableOfContents } from '@/components/articles'
import type { Heading } from '@/components/articles'
import RecommendationSection from '@/components/RecommendationSection'
import References from '@/components/References'
import StructuredData from '@/components/StructuredData'
import ResponsiveTable from '@/components/ui/ResponsiveTable'
import { getRevenueProductSet } from '@/config/revenue-products'
import { SITE_URL } from '@/lib/navigation-config'

const PATH = '/guides/adhd/magnesium-glycinate-vs-citrate-for-adhd'
const PAGE_URL = `${SITE_URL}${PATH}`
const TITLE = 'Magnesium Glycinate vs Citrate for ADHD: Evidence & Tradeoffs'
const DESCRIPTION =
  'Compare magnesium glycinate and citrate for ADHD without the marketing shortcuts. Direct ADHD evidence, sleep context, absorption, GI effects, labels, safety, and cost.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${PATH}/` },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: `${PATH}/`,
    type: 'article',
    images: ['/images/guides/magnesium-glycinate-vs-citrate-for-adhd.jpg'],
  },
}

const HEADINGS: Heading[] = [
  { id: 'verdict', text: 'Quick verdict', level: 2 },
  { id: 'comparison', text: 'Side-by-side comparison', level: 2 },
  { id: 'claim-check', text: 'Claim check', level: 2 },
  { id: 'choose', text: 'How to choose', level: 2 },
  { id: 'dose-safety', text: 'Dose and safety', level: 2 },
  { id: 'faq', text: 'Frequently asked questions', level: 2 },
]

const COMPARISON_ROWS = [
  ['Direct ADHD evidence', 'No form-specific ADHD trial showing benefit or superiority', 'No form-specific ADHD trial showing benefit or superiority'],
  ['Sleep evidence', 'One 2025 placebo-controlled trial in adults with poor sleep found a small benefit from bisglycinate; it was not an ADHD trial', 'No comparable ADHD or direct glycinate-vs-citrate sleep trial'],
  ['Absorption evidence', 'No authoritative evidence that glycinate is uniquely best for ADHD', 'NIH summarizes citrate as more completely absorbed than oxide in small studies; that does not prove superiority to glycinate'],
  ['GI fit', 'Often chosen by people trying to avoid a laxative-style product, but individual tolerance varies', 'Can loosen stools; useful when constipation is part of the picture and less useful when diarrhea is a risk'],
  ['Cost', 'Usually higher', 'Usually lower'],
  ['Best practical use', 'A simple trial when sleep or perceived GI tolerance is the main reason for the form choice', 'A cost-conscious repletion option or a form that may also help constipation'],
  ['What it cannot claim', 'Proven calm-focus synergy or better ADHD symptom control', 'Proven ADHD efficacy or equal benefit at every dose'],
] as const

const FAQS = [
  {
    question: 'Is magnesium glycinate or citrate better for ADHD?',
    answer:
      'Neither has been proven better for ADHD. There is no direct ADHD head-to-head trial. Glycinate may be a practical fit when sleep or perceived GI tolerance matters; citrate may be a practical fit when cost or constipation matters. Those are use-case differences, not evidence of superior ADHD symptom control.',
  },
  {
    question: 'Does the glycine in magnesium glycinate make it better for focus or calm?',
    answer:
      'That claim is plausible but unproven. The effect of glycine has not been isolated in a magnesium-glycinate ADHD trial, so the combined product cannot be assumed to provide a special calm-focus effect beyond magnesium itself.',
  },
  {
    question: 'Is citrate absorbed better than glycinate?',
    answer:
      'NIH summarizes small studies showing citrate is absorbed more completely than oxide and sulfate. That is not the same as a direct citrate-versus-glycinate comparison, and it does not establish that citrate produces better ADHD or sleep outcomes.',
  },
  {
    question: 'Which form is less likely to cause diarrhea?',
    answer:
      'Citrate can have a more noticeable laxative effect, but GI response varies by dose, serving size, diet, and individual sensitivity. A lower elemental dose can matter as much as the form name.',
  },
  {
    question: 'What dose should I use for ADHD?',
    answer:
      'There is no established ADHD-specific dose for either form. Read the label for elemental magnesium rather than the total chelate weight. The NIH adult upper limit is 350 mg per day from supplements and medications unless a clinician recommends otherwise.',
  },
  {
    question: 'Should I test magnesium before choosing a form?',
    answer:
      'Clinical context can be useful, but no single magnesium test is definitive. NIH notes that serum magnesium is commonly measured yet does not closely reflect total-body or tissue status. Diet, symptoms, medical history, medications, and laboratory findings may all matter.',
  },
]

const REFERENCES = [
  {
    n: 1,
    text: 'NIH Office of Dietary Supplements. Magnesium: Fact Sheet for Health Professionals.',
    url: 'https://ods.od.nih.gov/factsheets/Magnesium-HealthProfessional/',
  },
  {
    n: 2,
    text: 'Schuster J, et al. Magnesium bisglycinate supplementation in healthy adults reporting poor sleep: randomized placebo-controlled trial. 2025. PMID: 40918053.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/40918053/',
  },
  {
    n: 3,
    text: 'Ghanizadeh A. A systematic review of magnesium therapy for treating attention deficit hyperactivity disorder. 2013. PMID: 23808779.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/23808779/',
  },
  {
    n: 4,
    text: 'Huang YH, et al. Magnesium levels in children with ADHD: systematic review and meta-analysis. 2019. PMID: 30496768.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/30496768/',
  },
] as const

export default function MagnesiumGlycinateVsCitrateForAdhdPage() {
  const toc = <TableOfContents headings={HEADINGS} />
  const magnesiumProducts = getRevenueProductSet('magnesium')

  return (
    <ArticleLayout toc={toc} zone="supplement">
      <StructuredData
        pageUrl={PAGE_URL}
        headline={TITLE}
        description={DESCRIPTION}
        datePublished="2026-06-12"
        dateModified="2026-08-02"
        image={`${SITE_URL}/images/guides/magnesium-glycinate-vs-citrate-for-adhd.jpg`}
        faqs={FAQS}
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'ADHD Guides', href: '/guides/adhd/' },
          { label: 'Glycinate vs Citrate', href: PATH },
        ]}
        zone="monetized"
      />

      <div className="space-y-12">
        <AffiliateDisclosure variant="compact" />

        <section className="rounded-[2rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-10">
          <p className="eyebrow-label">Symmetrical comparison</p>
          <h1 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight text-ink sm:text-5xl">
            Magnesium Glycinate vs Citrate for ADHD
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-muted">
            There is no direct ADHD head-to-head trial showing that glycinate beats citrate. The useful
            comparison is practical: sleep context, GI response, constipation, cost, elemental dose, and
            medication safety. This page keeps those tradeoffs separate from claims about treating ADHD.
          </p>
          <div className="mt-5 flex flex-wrap gap-3 text-xs font-semibold">
            <Link href="/guides/adhd/best-magnesium-supplement-for-adhd/" className="text-brand-700 hover:underline">
              Magnesium buying guide →
            </Link>
            <Link href="/guides/sleep/magnesium-types-for-sleep/" className="text-brand-700 hover:underline">
              Compare forms for sleep →
            </Link>
          </div>

          <figure className="mt-7">
            <div className="overflow-hidden rounded-2xl border border-brand-900/10 bg-white shadow-sm">
              <Image
                src="/images/guides/magnesium-glycinate-vs-citrate-for-adhd.jpg"
                alt="Magnesium glycinate and citrate bottles compared side by side"
                width={1536}
                height={1024}
                priority
                className="h-auto w-full"
              />
            </div>
            <figcaption className="mt-3 text-center text-sm text-muted">
              A form decision should be based on tradeoffs—not an unsupported ADHD winner.
            </figcaption>
          </figure>
        </section>

        <section id="verdict" className="scroll-mt-20 rounded-[1.65rem] border border-brand-200 bg-brand-50/60 p-6 shadow-sm sm:p-8">
          <p className="eyebrow-label">Quick verdict</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
            Glycinate for sleep-oriented fit; citrate for cost or constipation
          </h2>
          <p className="mt-3 text-sm leading-7 text-muted sm:text-base">
            That is a shopping shortcut, not an efficacy ranking. Glycinate has a small recent sleep signal
            in non-ADHD adults. Citrate has practical absorption evidence relative to oxide and a more useful
            laxative effect for some people. Neither has demonstrated superior control of inattention,
            hyperactivity, impulsivity, or executive dysfunction.
          </p>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {[
              ['Choose glycinate when', 'You want a simple, sleep-oriented trial and are willing to pay more without assuming ADHD superiority.'],
              ['Choose citrate when', 'Lower cost or constipation matters and a looser-stool effect would not be a problem.'],
              ['Choose neither yet when', 'Kidney disease, medication interactions, unexplained symptoms, or a child’s dosing make clinical review the next step.'],
            ].map(([title, copy]) => (
              <div key={title} className="rounded-xl border border-brand-900/10 bg-white/80 p-4">
                <h3 className="text-sm font-semibold text-ink">{title}</h3>
                <p className="mt-2 text-xs leading-6 text-muted">{copy}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="comparison" className="scroll-mt-20 space-y-5">
          <div>
            <p className="eyebrow-label">Side by side</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
              Glycinate vs citrate without the marketing shortcuts
            </h2>
          </div>
          <ResponsiveTable label="Magnesium glycinate and citrate comparison for ADHD-related decisions">
            <table className="min-w-[850px] w-full text-left text-sm">
              <thead className="bg-brand-50/80">
                <tr className="border-b border-brand-900/10">
                  {['Question', 'Glycinate / bisglycinate', 'Citrate'].map((heading) => (
                    <th key={heading} className="px-4 py-3 text-xs font-bold uppercase tracking-[0.12em] text-brand-900">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-900/10 bg-white">
                {COMPARISON_ROWS.map(([question, glycinate, citrate]) => (
                  <tr key={question} className="align-top">
                    <td className="px-4 py-4 font-semibold text-ink">{question}</td>
                    <td className="px-4 py-4 text-muted">{glycinate}</td>
                    <td className="px-4 py-4 text-muted">{citrate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ResponsiveTable>
        </section>

        <section id="claim-check" className="scroll-mt-20 space-y-5">
          <div>
            <p className="eyebrow-label">Claim check</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
              Four claims that need a reality check
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {[
              {
                claim: '“Glycinate is best for ADHD.”',
                verdict: 'Unsupported',
                explanation:
                  'No direct ADHD comparison establishes a winning form. Choosing glycinate for sleep context or tolerance is different from claiming better ADHD efficacy.',
              },
              {
                claim: '“The glycine creates calm-focus synergy.”',
                verdict: 'Not isolated',
                explanation:
                  'The glycine contribution has not been separated from magnesium in an ADHD trial. Mechanistic plausibility should not be presented as a demonstrated clinical effect.',
              },
              {
                claim: '“A normal serum test means magnesium is fine.”',
                verdict: 'Too simple',
                explanation:
                  'Serum magnesium is commonly used but does not closely reflect total-body or tissue magnesium. NIH states that no single assessment method is satisfactory.',
              },
              {
                claim: '“Lower magnesium in ADHD proves supplementation works.”',
                verdict: 'Association, not treatment evidence',
                explanation:
                  'Observational meta-analyses can identify group differences, but they cannot prove causation or establish that supplementation improves symptoms.',
              },
            ].map((item) => (
              <div key={item.claim} className="rounded-2xl border border-brand-900/10 bg-white/90 p-5 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-brand-700">{item.verdict}</p>
                <h3 className="mt-2 text-base font-semibold text-ink">{item.claim}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">{item.explanation}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[1.65rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8">
          <p className="eyebrow-label">Evidence boundary</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
            What the current research actually supports
          </h2>
          <div className="mt-4 space-y-4 text-sm leading-7 text-muted sm:text-base">
            <p>
              The ADHD treatment literature remains inadequate. A systematic review found no randomized
              double-blind magnesium trial and no magnesium-monotherapy study for ADHD. That means neither
              glycinate nor citrate can be ranked as an evidence-based ADHD treatment.
            </p>
            <p>
              The 2025 bisglycinate trial enrolled 155 adults with self-reported poor sleep, used 250 mg
              elemental magnesium daily for four weeks, and found a small improvement in insomnia severity.
              It did not recruit an ADHD population, measure core ADHD outcomes, or compare citrate.
            </p>
            <p>
              NIH’s form discussion is narrower: more soluble forms such as citrate are absorbed more
              completely than oxide in small studies. It does not identify a universally superior form for
              ADHD, sleep, anxiety, or cognition.
            </p>
          </div>
        </section>

        <section id="choose" className="scroll-mt-20 space-y-5">
          <div>
            <p className="eyebrow-label">Decision path</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">How to choose in practice</h2>
          </div>
          <ol className="space-y-4">
            {[
              ['Define the actual target', 'Separate core ADHD symptoms from poor sleep, constipation, low dietary intake, muscle tension, or another reason for considering magnesium.'],
              ['Check the elemental dose', 'Compare the Supplement Facts panel, not the front-label compound weight. A lower, clearly labeled serving is easier to evaluate.'],
              ['Pick one form', 'Do not start glycinate, citrate, and a multi-ingredient ADHD blend together. One change makes benefit and side effects interpretable.'],
              ['Track the matching outcome', 'For a sleep-oriented trial, track sleep onset and next-day function. For constipation, track stool changes. Do not redefine any vague change as improved ADHD.'],
              ['Stop for poor fit', 'Persistent diarrhea, nausea, cramping, unusual weakness, or other concerning symptoms are reasons to stop and seek clinical advice—not to keep escalating.'],
            ].map(([title, copy], index) => (
              <li key={title} className="rounded-2xl border border-brand-900/10 bg-white/90 p-5 shadow-sm">
                <div className="flex gap-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-800">
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="font-semibold text-ink">{title}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted">{copy}</p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section id="dose-safety" className="scroll-mt-20 rounded-[1.65rem] border border-amber-900/15 bg-amber-50/70 p-6 shadow-sm sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-amber-800">Dose and safety</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-amber-950">
            The form name does not remove the guardrails
          </h2>
          <ul className="mt-4 space-y-3 text-sm leading-7 text-amber-950/90">
            <li>
              <strong>No ADHD-specific dose is established.</strong> The adult upper limit is 350 mg/day
              from supplements and medications unless a clinician recommends otherwise.
            </li>
            <li>
              <strong>Children need pediatric guidance.</strong> Supplemental upper limits vary by age, and
              an adult dose should not be copied for a child with ADHD.
            </li>
            <li>
              <strong>Kidney impairment increases risk.</strong> Reduced magnesium clearance can lead to
              accumulation and toxicity.
            </li>
            <li>
              <strong>Magnesium can interfere with medicines.</strong> It can reduce absorption of oral
              bisphosphonates and bind tetracycline or quinolone antibiotics. Follow pharmacist or label
              spacing instructions.
            </li>
            <li>
              <strong>Count other sources.</strong> Antacids, laxatives, multivitamins, and sleep products can
              already contain magnesium.
            </li>
          </ul>
        </section>

        {magnesiumProducts && (
          <section className="space-y-4">
            <div className="max-w-3xl">
              <p className="eyebrow-label">Product comparison</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
                Compare labels after choosing the tradeoff
              </h2>
              <p className="mt-3 text-sm leading-7 text-muted">
                Use the product set to compare elemental dose, serving size, formulation, and cost. It is not
                evidence that any listed product treats ADHD or that glycinate is clinically superior.
              </p>
            </div>
            <RecommendationSection products={magnesiumProducts.products} />
          </section>
        )}

        <section className="rounded-[1.65rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-ink">Related evidence paths</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Link href="/guides/adhd/best-magnesium-supplement-for-adhd/" className="rounded-xl border border-brand-900/10 p-4 text-sm font-semibold text-brand-700 hover:border-brand-700/30 hover:underline">
              Use the full magnesium buying checklist →
            </Link>
            <Link href="/guides/adhd/adhd-supplements/" className="rounded-xl border border-brand-900/10 p-4 text-sm font-semibold text-brand-700 hover:border-brand-700/30 hover:underline">
              Compare magnesium with other ADHD adjuncts →
            </Link>
            <Link href="/guides/sleep/magnesium-types-for-sleep/" className="rounded-xl border border-brand-900/10 p-4 text-sm font-semibold text-brand-700 hover:border-brand-700/30 hover:underline">
              Compare magnesium forms for sleep →
            </Link>
            <Link href="/compounds/magnesium/" className="rounded-xl border border-brand-900/10 p-4 text-sm font-semibold text-brand-700 hover:border-brand-700/30 hover:underline">
              Read the magnesium compound profile →
            </Link>
          </div>
        </section>

        <section id="faq" className="scroll-mt-20 rounded-[1.65rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-semibold tracking-tight text-ink">Frequently asked questions</h2>
          <div className="mt-5 divide-y divide-brand-900/10">
            {FAQS.map((faq) => (
              <div key={faq.question} className="py-5 first:pt-0 last:pb-0">
                <h3 className="font-semibold text-ink">{faq.question}</h3>
                <p className="mt-2 text-sm leading-7 text-muted">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>

        <References refs={[...REFERENCES]} />

        <p className="text-xs leading-6 text-muted">
          This comparison is educational. It does not diagnose magnesium deficiency or recommend magnesium
          as a treatment for ADHD. Discuss pediatric use, pregnancy, kidney disease, persistent symptoms, and
          medication interactions with a qualified clinician or pharmacist.
        </p>
      </div>
    </ArticleLayout>
  )
}
