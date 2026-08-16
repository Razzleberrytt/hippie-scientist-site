import type { Metadata } from 'next'
import RecommendationSection from '@/components/RecommendationSection'
import { getRevenueProductSet } from '@/config/revenue-products'
import Link from 'next/link'
import Image from 'next/image'
import { buildPageMetadata } from '../../../../src/lib/seo'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import LegacyGuideFAQ from '@/components/LegacyGuideFAQ'
import LegacyGuideQuickAnswer from '@/components/LegacyGuideQuickAnswer'
import References from '@/components/References'
import EmailCapture from '../../../../components/EmailCapture'

export const metadata: Metadata = buildPageMetadata({
  title: 'Zinc Supplements: Deficiency, Colds & Safety (2026)',
  description:
    'Evidence-first zinc guide covering deficiency, common-cold evidence, supplement forms, the 40 mg adult upper limit, copper depletion, and why there is no universal best zinc dose.',
  path: '/guides/other/zinc-supplement-guide/',
  openGraphType: 'article',
})

const FAQS = [
  {
    question: 'Which form of zinc is best absorbed?',
    answer:
      'There is no proven universal best form. Direct human comparisons show zinc citrate and gluconate are absorbed better than zinc oxide in selected studies [3,4]. A small 1987 crossover study suggested zinc picolinate may improve some zinc-status measures, but only 15 volunteers were studied [5]. That is not enough to crown picolinate the best form for everyone.',
  },
  {
    question: 'How much zinc should I take daily?',
    answer:
      'Daily nutritional requirements and treatment doses are different questions. NIH lists adult RDAs of 11 mg/day for men and 8 mg/day for women and an adult tolerable upper intake level of 40 mg/day from all sources [1]. This page does not provide a universal supplement dose because the reason for use, dietary intake, deficiency status, duration, and medication context matter.',
  },
  {
    question: 'Does zinc help with colds?',
    answer:
      'Possibly, but the evidence is uncertain. A 2024 Cochrane review found low-certainty evidence that zinc treatment may shorten an existing cold by about two days, while prevention benefit was little or none and non-serious adverse events were more common [2]. The review found substantial variation in dose, formulation, route, and study methods.',
  },
  {
    question: 'Should zinc always be paired with copper?',
    answer:
      'No universal zinc-to-copper pairing ratio has been established for routine self-supplementation. The important safety point is that chronic excessive zinc can reduce copper absorption and lead to copper deficiency [1]. Long-term high-dose zinc use deserves review rather than an automatic second-supplement recipe.',
  },
  {
    question: 'Who is at higher risk of zinc deficiency?',
    answer:
      'Risk can be higher with low zinc intake, diets high in poorly absorbed plant sources, some gastrointestinal disorders, pregnancy or lactation, alcohol use disorder, and other conditions that affect intake or absorption [1]. Symptoms alone are not specific enough to diagnose zinc deficiency.',
  },
] as const

const ZINC_REFS = [
  {
    n: 1,
    text: 'NIH Office of Dietary Supplements. Zinc — Fact Sheet for Health Professionals.',
    url: 'https://ods.od.nih.gov/factsheets/Zinc-HealthProfessional/',
  },
  {
    n: 2,
    text: 'Nault D, et al. Zinc for prevention and treatment of the common cold. Cochrane Database Syst Rev. 2024;5:CD014914.',
    url: 'https://www.cochrane.org/evidence/CD014914_zinc-prevention-and-treatment-common-cold',
  },
  {
    n: 3,
    text: 'Wegmüller R, et al. Zinc absorption by young adults from supplemental zinc citrate is comparable with that from zinc gluconate and higher than from zinc oxide. J Nutr. 2014. PMID 24259556.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/24259556/',
  },
  {
    n: 4,
    text: 'Siepmann M, et al. The pharmacokinetics of zinc from zinc gluconate: a comparison with zinc oxide in healthy men. Int J Clin Pharmacol Ther. 2005. PMID 16372518.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/16372518/',
  },
  {
    n: 5,
    text: 'Barrie SA, et al. Comparative absorption of zinc picolinate, zinc citrate and zinc gluconate in humans. Agents Actions. 1987. PMID 3630857.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/3630857/',
  },
  {
    n: 6,
    text: 'Te L, et al. Correlation between serum zinc and testosterone: A systematic review. J Trace Elem Med Biol. 2023. PMID 36577241.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/36577241/',
  },
]

const formRows = [
  {
    form: 'Citrate',
    evidence: 'Direct isotope-tracer comparison found absorption comparable with gluconate and higher than oxide [3].',
    boundary: 'Useful form evidence, but not proof of superior clinical outcomes.',
  },
  {
    form: 'Gluconate',
    evidence: 'Direct studies show better absorption than oxide; also common in cold-lozenge research [3,4].',
    boundary: 'Absorption does not establish one universal dose or indication.',
  },
  {
    form: 'Oxide',
    evidence: 'Lower absorption than citrate/gluconate in selected direct comparisons [3,4].',
    boundary: 'Lower relative absorption does not make every oxide-containing product clinically useless.',
  },
  {
    form: 'Picolinate',
    evidence: 'A 15-person 1987 crossover study found increases in selected zinc-status measures [5].',
    boundary: 'Evidence is too small and old to justify a universal “best absorbed” ranking.',
  },
]

const useRows = [
  {
    situation: 'General nutrition / no known deficiency',
    interpretation: 'Start with dietary intake and total exposure. A standing high-dose supplement is not automatically beneficial.',
  },
  {
    situation: 'Suspected zinc deficiency',
    interpretation: 'Assess risk factors, diet, symptoms, and clinical context rather than treating nonspecific symptoms with a fixed dose.',
  },
  {
    situation: 'Common cold treatment',
    interpretation: 'Cochrane found a possible ~2-day reduction in duration with low-certainty evidence and more non-serious adverse events [2]. The studies used heterogeneous products and regimens.',
  },
  {
    situation: 'Long-term high-dose use',
    interpretation: 'Copper depletion becomes a material safety concern; total daily intake should be reviewed against the 40 mg/day adult UL [1].',
  },
]

export default function ZincPage() {
  const zincProducts = getRevenueProductSet('zinc')

  return (
    <div className="container-page py-10 space-y-10">
      <AuthorityJsonLd
        title="Zinc Supplements: Deficiency, Colds and Safety"
        description="Evidence-first review of zinc deficiency, common-cold evidence, supplement forms, upper-limit safety, and copper depletion."
        url="https://thehippiescientist.net/guides/other/zinc-supplement-guide/"
        type="MedicalWebPage"
        citationUrls={ZINC_REFS.map((ref) => ref.url)}
      />
      <AuthorityBreadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Guides', href: '/guides/' }, { label: 'Zinc Supplements' }]} />

      <section className="space-y-5 max-w-4xl">
        <p className="eyebrow-label">Evidence Review · Updated August 16, 2026</p>
        <h1 className="text-5xl font-bold tracking-tight text-ink">Zinc Supplements: Deficiency, Colds, Forms and the Safety Ceiling</h1>
        <p className="text-lg leading-8 text-muted">
          Zinc is essential, but “essential” does not mean more is better. The useful questions are whether intake is inadequate, whether a specific clinical use has evidence, how much total zinc is coming from all sources, and whether duration creates copper or medication concerns.
        </p>
        <figure className="mt-6"><div className="overflow-hidden rounded-2xl border border-brand-900/10 shadow-sm bg-white"><Image src="/images/guides/zinc-supplement-guide.jpg" alt="Zinc capsules beside pumpkin seeds and oysters" width={1536} height={1024} priority className="w-full h-auto" /></div><figcaption className="mt-3 text-center text-sm text-muted">Zinc decisions depend on purpose, total exposure, and duration—not a universal dose or form ranking.</figcaption></figure>
      </section>

      <LegacyGuideQuickAnswer referencesHref="#references">
        <p>
          There is <strong>no universal zinc supplement dose or universally best form</strong>. NIH lists adult RDAs of 11 mg/day for men and 8 mg/day for women and an adult tolerable upper intake level of <strong>40 mg/day from all sources</strong> [1]. For colds, a 2024 Cochrane review found low-certainty evidence that zinc may shorten symptoms by about two days, with more non-serious adverse events and substantial variation across products and regimens [2]. Direct absorption studies favor citrate/gluconate over oxide, but they do not justify a blanket “picolinate is best” rule [3-5].
        </p>
      </LegacyGuideQuickAnswer>

      <section id="zinc-form-evidence" data-answer-engine-table="true" className="card-premium scroll-mt-24 p-6 space-y-4 max-w-5xl">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Zinc forms: what direct comparisons actually show</h2>
        <div className="overflow-x-auto">
          <table className="min-w-[820px] w-full text-sm">
            <caption className="sr-only">Zinc forms compared by direct evidence and evidence boundary</caption>
            <thead><tr className="border-b border-brand-900/10"><th scope="col" className="py-3 pr-4 text-left font-semibold text-ink">Form</th><th scope="col" className="py-3 pr-4 text-left font-semibold text-ink">Direct evidence</th><th scope="col" className="py-3 text-left font-semibold text-ink">Boundary</th></tr></thead>
            <tbody className="text-muted">
              {formRows.map((row) => (
                <tr key={row.form} className="border-b border-brand-900/5 last:border-b-0 align-top"><th scope="row" className="py-3 pr-4 text-left font-semibold text-ink">{row.form}</th><td className="py-3 pr-4 leading-6">{row.evidence}</td><td className="py-3 leading-6">{row.boundary}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card-premium p-6 space-y-4 max-w-4xl">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Common colds: a possible benefit, not a settled lozenge protocol</h2>
        <p className="text-sm leading-7 text-muted">
          The 2024 Cochrane review included 34 prevention or treatment studies. For people who already had a cold, pooled treatment evidence suggested zinc may shorten symptom duration by about two days, but the authors rated confidence in that evidence as low. They also found more non-serious adverse events such as taste disturbance and gastrointestinal symptoms [2].
        </p>
        <p className="text-sm leading-7 text-muted">
          Because formulations, routes, doses, treatment durations, and study methods varied substantially, this page no longer converts older high-dose lozenge trials into a universal 75–100 mg/day consumer protocol. Prevention evidence was little or none [2].
        </p>
      </section>

      <section id="zinc-use-boundaries" data-answer-engine-table="true" className="space-y-4 max-w-5xl scroll-mt-24">
        <h2 className="text-3xl font-semibold tracking-tight text-ink">Separate nutrition, deficiency treatment, and cold research</h2>
        <div className="overflow-x-auto rounded-2xl border border-brand-900/10 bg-white/90 dark:border-white/10 dark:bg-white/5">
          <table className="min-w-[800px] w-full text-left text-sm">
            <caption className="sr-only">Zinc use situations and evidence-informed interpretation</caption>
            <thead><tr className="border-b border-brand-900/10 text-ink"><th scope="col" className="p-4">Situation</th><th scope="col" className="p-4">Evidence-informed interpretation</th></tr></thead>
            <tbody className="divide-y divide-brand-900/10 text-muted">
              {useRows.map((row) => (
                <tr key={row.situation}><th scope="row" className="p-4 font-semibold text-left text-ink">{row.situation}</th><td className="p-4 leading-6">{row.interpretation}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl border border-amber-900/15 bg-amber-50/70 p-6 text-amber-950 dark:border-amber-200/20 dark:bg-amber-950/20 dark:text-amber-50 max-w-4xl">
        <p className="text-xs font-bold uppercase tracking-[0.16em]">Upper-limit boundary</p>
        <h2 className="mt-2 text-2xl font-semibold">Copper depletion is a reason to avoid chronic excess—not a universal copper stack</h2>
        <p className="mt-3 text-sm leading-7">
          NIH lists 40 mg/day as the adult tolerable upper intake level from food, beverages, supplements, and medications [1]. Long-term excessive zinc can lower copper status and, in severe cases, contribute to neurological problems. That safety relationship does not establish a universal rule that everyone taking zinc should automatically add a fixed amount of copper. Persistent high-dose zinc use should be reviewed in context.
        </p>
      </section>

      <section className="card-premium p-6 space-y-4 max-w-4xl">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Zinc and testosterone: deficiency context matters</h2>
        <p className="text-sm leading-7 text-muted">
          A 2023 systematic review found a positive relationship between zinc status and testosterone, with supplementation effects varying according to baseline zinc status, baseline testosterone, dose, form, and duration [6]. That supports correcting genuine deficiency. It does not establish zinc as a general testosterone enhancer in zinc-replete people.
        </p>
      </section>

      {zincProducts && (
        <RecommendationSection
          title="Zinc product starting points"
          description="Product links are sourcing examples only. Compare elemental zinc, form, total daily exposure, testing, and intended duration rather than treating any listing as a universal dose or form recommendation."
          products={zincProducts.products}
        />
      )}

      <section className="card-premium p-6 space-y-4 max-w-4xl">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Bottom line</h2>
        <p className="text-sm leading-7 text-muted">
          Zinc is essential, but the evidence does not support a standing “take this many milligrams every day” rule for everyone. Correct inadequate intake or diagnosed deficiency, respect total exposure and duration, and treat cold-lozenge research as low-certainty short-term evidence rather than a permanent high-dose regimen. Form matters somewhat for absorption; purpose and safety matter more.
        </p>
      </section>

      <References refs={ZINC_REFS} />
      <LegacyGuideFAQ pagePath="/guides/other/zinc-supplement-guide/" questions={[...FAQS]} />
      <EmailCapture headline="Get evidence reviews like this" description="Zinc, deficiency, colds, and supplement safety — without one-size-fits-all protocols." ctaLabel="Get the evidence" location="guide-zinc" />
      <div className="pt-4 border-t border-brand-900/10 flex items-center justify-between"><Link href="/guides/" className="inline-flex rounded-full border border-brand-900/10 bg-[var(--surface-card)] px-4 py-2 text-sm font-bold text-ink transition hover:bg-brand-50">← Back to guides</Link><Link href="/info/supplement-safety-checklist/" className="text-sm font-bold text-brand-800 hover:underline">Safety checklist →</Link></div>
    </div>
  )
}
