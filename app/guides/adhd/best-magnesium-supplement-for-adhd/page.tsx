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
import { buildTwitterMetadata } from '@/src/lib/seo'

const PATH = '/guides/adhd/best-magnesium-supplement-for-adhd'
const PAGE_URL = `${SITE_URL}${PATH}`
const TITLE = 'Best Magnesium Supplement for ADHD? Evidence & Buying Guide'
const DESCRIPTION =
  'No magnesium form has been proven best for core ADHD symptoms. Compare glycinate, citrate, oxide, and threonate by evidence, tolerability, label quality, safety, and cost.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${PATH}/` },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: `${PATH}/`,
    type: 'article',
    images: ['/images/guides/best-magnesium-supplement-for-adhd.jpg'],
  },
  twitter: buildTwitterMetadata({
    title: TITLE,
    description: DESCRIPTION,
  }),
}

const HEADINGS: Heading[] = [
  { id: 'quick-answer', text: 'Quick answer', level: 2 },
  { id: 'choose-by-goal', text: 'Choose by the real goal', level: 2 },
  { id: 'form-comparison', text: 'Magnesium form comparison', level: 2 },
  { id: 'adhd-evidence', text: 'What the ADHD evidence shows', level: 2 },
  { id: 'label-checklist', text: 'How to read the label', level: 2 },
  { id: 'safety', text: 'Dose and safety guardrails', level: 2 },
  { id: 'faq', text: 'Frequently asked questions', level: 2 },
]

const FORM_ROWS = [
  {
    form: 'Glycinate / bisglycinate',
    directAdhdEvidence: 'No form-specific ADHD trial showing superiority',
    usefulContext:
      'A reasonable option when a person values a non-laxative-style product or is also evaluating sleep. A 2025 trial in adults with poor sleep found a small benefit from 250 mg elemental magnesium daily, but it was not an ADHD study.',
    buyingNote: 'Check the elemental magnesium amount; do not assume the chelate weight is the dose.',
  },
  {
    form: 'Citrate',
    directAdhdEvidence: 'No evidence that citrate treats ADHD better or worse than glycinate',
    usefulContext:
      'NIH notes that citrate is absorbed more completely than oxide in small studies. It can also loosen stools, which may be useful or unwanted depending on the person.',
    buyingNote: 'Often lower cost; start by judging tolerance rather than chasing an ADHD-specific claim.',
  },
  {
    form: 'Oxide',
    directAdhdEvidence: 'No credible ADHD-specific advantage',
    usefulContext:
      'Usually inexpensive and high in elemental magnesium by weight, but NIH summarizes lower absorption than several more soluble forms and more frequent GI effects.',
    buyingNote: 'Not automatically dangerous or useless, but usually a weaker first choice for routine repletion.',
  },
  {
    form: 'L-threonate',
    directAdhdEvidence: 'No direct ADHD head-to-head evidence against glycinate or citrate',
    usefulContext:
      'Premium brain-targeting claims rely heavily on mechanistic and non-ADHD evidence. A higher price does not establish a better ADHD outcome.',
    buyingNote: 'Pay only for a clearly defined reason—not for the word “brain” on the front label.',
  },
] as const

const FAQS = [
  {
    question: 'What is the best magnesium supplement for ADHD?',
    answer:
      'No magnesium form has been proven best for core ADHD symptoms. Glycinate or citrate can both be reasonable practical choices. The better option depends on elemental dose, GI tolerance, cost, constipation, sleep goals, kidney health, medications, and whether low intake or deficiency is actually plausible.',
  },
  {
    question: 'Does magnesium improve ADHD symptoms?',
    answer:
      'The direct treatment evidence is weak. A 2013 systematic review found no well-controlled randomized double-blind magnesium trial for ADHD and no magnesium-monotherapy evidence. Observational meta-analyses have reported lower magnesium levels in children with ADHD, but an association does not prove that supplementation improves core symptoms.',
  },
  {
    question: 'Is magnesium glycinate better than citrate for ADHD?',
    answer:
      'There is no direct ADHD head-to-head trial showing that glycinate is better. Glycinate is often selected for perceived GI tolerability or sleep-oriented use, while citrate is often selected for lower cost or when a laxative effect would be acceptable. Those are practical tradeoffs, not proof of superior ADHD efficacy.',
  },
  {
    question: 'How much magnesium should an adult take for ADHD?',
    answer:
      'There is no established ADHD-specific dose. Read the Supplement Facts panel for elemental magnesium. The NIH adult upper limit is 350 mg per day from supplements and medications unless a clinician recommends otherwise; magnesium naturally present in food is not included in that limit.',
  },
  {
    question: 'Can children with ADHD take magnesium?',
    answer:
      'Children should not be placed on an adult supplement protocol. NIH supplemental upper limits vary by age, and kidney disease, GI conditions, diet, and medications can change the risk. A pediatric clinician should guide whether supplementation and testing are appropriate.',
  },
  {
    question: 'Can a normal serum magnesium result rule out low magnesium status?',
    answer:
      'No. NIH notes that serum magnesium is the most common test but does not closely reflect total-body or tissue magnesium, and no single assessment method is considered satisfactory. Laboratory results need clinical and dietary context.',
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

export default function BestMagnesiumForAdhdPage() {
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
        image={`${SITE_URL}/images/guides/best-magnesium-supplement-for-adhd.jpg`}
        faqs={FAQS}
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'ADHD Guides', href: '/guides/adhd/' },
          { label: 'Magnesium Buying Guide', href: PATH },
        ]}
        zone="monetized"
      />

      <div className="space-y-12">
        <AffiliateDisclosure variant="compact" />

        <section className="rounded-[2rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-10">
          <p className="eyebrow-label">Evidence-calibrated buying guide</p>
          <h1 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight text-ink sm:text-5xl">
            Best Magnesium Supplement for ADHD?
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-muted">
            The honest answer is less dramatic than most product pages: no magnesium form has been proven
            best for core ADHD symptoms. The useful buying decision is to match the form to the reason for
            taking magnesium, then verify elemental dose, tolerability, medication timing, and safety.
          </p>
          <div className="mt-5 flex flex-wrap gap-3 text-xs font-semibold">
            <Link href="/guides/adhd/magnesium-glycinate-vs-citrate-for-adhd/" className="text-brand-700 hover:underline">
              Glycinate vs citrate →
            </Link>
            <Link href="/guides/adhd/adhd-supplements/" className="text-brand-700 hover:underline">
              ADHD supplement evidence hub →
            </Link>
          </div>

          <figure className="mt-7">
            <div className="overflow-hidden rounded-2xl border border-brand-900/10 bg-white shadow-sm">
              <Image
                src="/images/guides/best-magnesium-supplement-for-adhd.jpg"
                alt="Magnesium supplement bottles and capsules arranged for a label-comparison guide"
                width={1536}
                height={1024}
                priority
                className="h-auto w-full"
              />
            </div>
            <figcaption className="mt-3 text-center text-sm text-muted">
              Choose by evidence, elemental dose, and fit—not by an ADHD claim on the bottle.
            </figcaption>
          </figure>
        </section>

        <section id="quick-answer" className="scroll-mt-20 rounded-[1.65rem] border border-brand-200 bg-brand-50/60 p-6 shadow-sm sm:p-8">
          <p className="eyebrow-label">Quick answer</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
            Glycinate is a practical option, not a proven ADHD winner
          </h2>
          <p className="mt-3 text-sm leading-7 text-muted sm:text-base">
            For a general supplement trial, glycinate or citrate are usually easier to justify than an
            expensive “brain magnesium” product. Glycinate has one recent non-ADHD sleep trial with a small
            effect; citrate has established practical absorption advantages over oxide. Neither form has
            been shown to outperform the other for attention, hyperactivity, impulsivity, or executive
            function.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {[
              ['Best evidence boundary', 'Magnesium is not an evidence-based replacement for ADHD medication, therapy, sleep care, or assessment.'],
              ['Best shopping rule', 'Compare elemental magnesium per serving, not the large compound weight printed on the front.'],
              ['Best risk control', 'Avoid unsupervised use with impaired kidney function and check medication spacing.'],
            ].map(([label, copy]) => (
              <div key={label} className="rounded-xl border border-brand-900/10 bg-white/80 p-4">
                <h3 className="text-sm font-semibold text-ink">{label}</h3>
                <p className="mt-2 text-xs leading-6 text-muted">{copy}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="choose-by-goal" className="scroll-mt-20 space-y-5">
          <div>
            <p className="eyebrow-label">Decision framework</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">Choose by the real goal</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              {
                goal: 'Low intake or clinician concern',
                answer:
                  'Food intake, GI history, medications, and clinical assessment matter more than choosing a trendy chelate. Use a form that delivers a clear elemental dose and is tolerated.',
              },
              {
                goal: 'Poor sleep is the actual target',
                answer:
                  'Bisglycinate has a recent four-week trial in adults with poor sleep, but the benefit was small and the participants were not selected for ADHD.',
              },
              {
                goal: 'Constipation is also present',
                answer:
                  'Citrate may be a more useful fit because it can loosen stools. That same effect makes it a poor fit for someone prone to diarrhea.',
              },
              {
                goal: 'Core ADHD symptoms are the target',
                answer:
                  'Do not expect form selection to create a medication-like effect. The direct magnesium-treatment evidence for ADHD remains inadequate.',
              },
            ].map((item) => (
              <div key={item.goal} className="rounded-2xl border border-brand-900/10 bg-white/90 p-5 shadow-sm">
                <h3 className="text-base font-semibold text-ink">{item.goal}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">{item.answer}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="form-comparison" className="scroll-mt-20 space-y-5">
          <div>
            <p className="eyebrow-label">Form comparison</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
              What each form can—and cannot—claim
            </h2>
          </div>
          <ResponsiveTable label="Magnesium forms for ADHD buying decisions">
            <table className="min-w-[900px] w-full text-left text-sm">
              <thead className="bg-brand-50/80">
                <tr className="border-b border-brand-900/10">
                  {['Form', 'Direct ADHD evidence', 'Useful context', 'Buying note'].map((heading) => (
                    <th key={heading} className="px-4 py-3 text-xs font-bold uppercase tracking-[0.12em] text-brand-900">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-900/10 bg-white">
                {FORM_ROWS.map((row) => (
                  <tr key={row.form} className="align-top">
                    <td className="px-4 py-4 font-semibold text-ink">{row.form}</td>
                    <td className="px-4 py-4 text-muted">{row.directAdhdEvidence}</td>
                    <td className="px-4 py-4 text-muted">{row.usefulContext}</td>
                    <td className="px-4 py-4 text-muted">{row.buyingNote}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ResponsiveTable>
        </section>

        <section id="adhd-evidence" className="scroll-mt-20 rounded-[1.65rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8">
          <p className="eyebrow-label">Evidence boundary</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
            Lower magnesium status is not the same as a proven treatment
          </h2>
          <div className="mt-4 space-y-4 text-sm leading-7 text-muted sm:text-base">
            <p>
              Meta-analyses have reported lower serum, blood, or hair magnesium measures in children with
              ADHD than in controls. That is an observational association with substantial uncertainty; it
              does not establish that low magnesium causes ADHD or that a supplement improves symptoms.
            </p>
            <p>
              The dedicated systematic review of magnesium treatment found only six intervention studies,
              no randomized double-blind controlled trial, and no magnesium-monotherapy study. The evidence
              was not strong enough to recommend magnesium as an ADHD treatment.
            </p>
            <p>
              The newer bisglycinate trial is useful for a narrower question. In 155 adults reporting poor
              sleep, 250 mg elemental magnesium daily for four weeks produced a statistically significant but
              small improvement in insomnia severity. It did not test ADHD symptoms or compare magnesium forms.
            </p>
          </div>
        </section>

        <section id="label-checklist" className="scroll-mt-20 space-y-5">
          <div>
            <p className="eyebrow-label">Buyer checklist</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">How to read the label</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {[
              ['Find elemental magnesium', 'The Supplement Facts panel reports elemental magnesium. The front-label chelate weight can be much larger and is not the dose that counts.'],
              ['Prefer a simple formula', 'A single-ingredient product makes benefits and side effects easier to attribute than an ADHD blend with stimulants, herbs, or undisclosed amounts.'],
              ['Check serving size', 'A bottle can advertise a dose that requires several capsules. Compare elemental magnesium per full serving and per dollar.'],
              ['Ignore unsupported superiority language', '“Brain-penetrating,” “ADHD formula,” and “maximum absorption” are marketing claims unless the exact product and outcome were tested.'],
              ['Look for independent quality signals', 'Third-party verification can reduce identity and contamination uncertainty, but it does not prove the supplement works for ADHD.'],
              ['Audit the whole routine', 'Count magnesium from other supplements, antacids, and laxatives before adding another product.'],
            ].map(([title, copy]) => (
              <div key={title} className="rounded-2xl border border-brand-900/10 bg-white/90 p-5 shadow-sm">
                <h3 className="font-semibold text-ink">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">{copy}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="safety" className="scroll-mt-20 rounded-[1.65rem] border border-amber-900/15 bg-amber-50/70 p-6 shadow-sm sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-amber-800">Safety first</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-amber-950">
            Dose and medication guardrails
          </h2>
          <ul className="mt-4 space-y-3 text-sm leading-7 text-amber-950/90">
            <li>
              <strong>There is no established ADHD dose.</strong> The NIH adult upper limit is 350 mg/day
              from supplements and medications unless a clinician directs otherwise. Food magnesium is not
              included in that limit.
            </li>
            <li>
              <strong>Children have age-specific limits.</strong> Do not copy an adult protocol for a child;
              pediatric dosing and the reason for supplementation require clinical review.
            </li>
            <li>
              <strong>Kidney function matters.</strong> Impaired renal function raises the risk of magnesium
              accumulation and toxicity.
            </li>
            <li>
              <strong>Medication timing matters.</strong> Magnesium can reduce absorption of oral
              bisphosphonates and can bind tetracycline or quinolone antibiotics. Follow the medication label
              or pharmacist’s spacing instructions.
            </li>
            <li>
              <strong>GI symptoms are dose-limiting information.</strong> Diarrhea, nausea, or cramping are
              reasons to stop escalating and reassess the form, dose, and need.
            </li>
          </ul>
        </section>

        {magnesiumProducts && (
          <section className="space-y-4">
            <div className="max-w-3xl">
              <p className="eyebrow-label">Product filter</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
                Compare products only after choosing the role
              </h2>
              <p className="mt-3 text-sm leading-7 text-muted">
                The product set below is for comparing label clarity and formulation. It is not a ranking of
                ADHD treatments, and a product appearance here does not establish that it improves attention.
              </p>
            </div>
            <RecommendationSection products={magnesiumProducts.products} />
          </section>
        )}

        <section className="rounded-[1.65rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-ink">Continue the decision</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Link href="/guides/adhd/magnesium-glycinate-vs-citrate-for-adhd/" className="rounded-xl border border-brand-900/10 p-4 text-sm font-semibold text-brand-700 hover:border-brand-700/30 hover:underline">
              Compare glycinate and citrate directly →
            </Link>
            <Link href="/guides/sleep/magnesium-types-for-sleep/" className="rounded-xl border border-brand-900/10 p-4 text-sm font-semibold text-brand-700 hover:border-brand-700/30 hover:underline">
              Choose magnesium by sleep goal →
            </Link>
            <Link href="/guides/adhd/iron-ferritin-and-adhd/" className="rounded-xl border border-brand-900/10 p-4 text-sm font-semibold text-brand-700 hover:border-brand-700/30 hover:underline">
              Understand deficiency-first ADHD support →
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
          This guide is educational and does not diagnose magnesium deficiency or recommend magnesium as a
          treatment for ADHD. Discuss persistent attention problems, sleep disruption, pediatric use, kidney
          disease, pregnancy, and medication interactions with a qualified clinician or pharmacist.
        </p>
      </div>
    </ArticleLayout>
  )
}
