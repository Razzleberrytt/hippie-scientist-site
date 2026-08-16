import type { Metadata } from 'next'
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
  title: 'B-Complex Vitamins: Deficiency, Forms & Safety (2026)',
  description:
    'Evidence-based B-vitamin guide covering B12 forms and absorption, MTHFR and folic acid, B6 neuropathy risk, niacin safety, thiamin risk groups, and when targeted supplementation makes sense.',
  path: '/guides/other/b-complex-guide/',
  openGraphType: 'article',
})

const FAQS = [
  {
    question: 'Does everyone need a B-complex supplement?',
    answer:
      'No. The strongest reason to supplement a B vitamin is usually a documented deficiency, a diet that does not reliably provide a nutrient, a life-stage recommendation, a malabsorption problem, or a medication/medical condition that increases risk. Examples include vitamin B12 risk with vegan diets, pernicious anemia, some gastrointestinal conditions, metformin, or long-term acid suppression; folic acid for people capable of becoming pregnant; and thiamin risk with alcohol dependence. Those are nutrient-specific questions, not evidence that everyone benefits from a high-dose B-complex.',
  },
  {
    question: 'Is methylcobalamin better than cyanocobalamin?',
    answer:
      'Methylcobalamin is a metabolically active form of vitamin B12, while cyanocobalamin is converted to active cobalamin forms in the body. NIH ODS states that no evidence indicates supplement absorption rates differ by B12 form. Form choice can matter for practical or clinical reasons, but methylcobalamin should not be marketed as universally better absorbed or more effective.',
  },
  {
    question: 'Do people with an MTHFR variant need methylfolate instead of folic acid?',
    answer:
      'Common MTHFR variants are not a reason to avoid folic acid. CDC states that people with common MTHFR variants can process folic acid and that 400 mcg/day folic acid increases blood folate regardless of genotype. For neural-tube-defect prevention, folic acid—not 5-MTHF—is the folate form with proven clinical evidence.',
  },
  {
    question: 'Can high-dose B vitamins cause harm?',
    answer:
      'Yes. Water-soluble does not mean risk-free. Vitamin B6 can cause sensory neuropathy with chronic excess; the U.S. adult upper limit is 100 mg/day, while EFSA set 12 mg/day in 2023 after reviewing neuropathy data. Supplemental niacin can cause flushing at much lower doses and pharmacologic doses can cause serious adverse effects including liver injury. Risk depends on the nutrient, dose, duration, and medical context.',
  },
  {
    question: 'Is sublingual vitamin B12 better absorbed than oral B12?',
    answer:
      'Not generally. NIH ODS notes that evidence suggests no difference in efficacy between oral and sublingual B12. Severe deficiency, pernicious anemia, or other malabsorption conditions can require clinician-directed treatment, which may include high-dose oral or prescription parenteral B12 depending on the situation.',
  },
] as const

const BCOMPLEX_REFS = [
  {
    n: 1,
    text: 'NIH Office of Dietary Supplements. Vitamin B12: Fact Sheet for Health Professionals. Current absorption, deficiency-risk, medication, and formulation guidance.',
    url: 'https://ods.od.nih.gov/factsheets/VitaminB12-HealthProfessional/',
  },
  {
    n: 2,
    text: 'NIH Office of Dietary Supplements. Vitamin B6: Fact Sheet for Health Professionals. Current U.S. upper limit and EFSA neuropathy-related upper-limit discussion.',
    url: 'https://ods.od.nih.gov/factsheets/VitaminB6-HealthProfessional/',
  },
  {
    n: 3,
    text: 'Centers for Disease Control and Prevention. MTHFR Gene Variant and Folic Acid Facts. Updated May 27, 2025.',
    url: 'https://www.cdc.gov/folic-acid/data-research/mthfr/index.html',
  },
  {
    n: 4,
    text: 'NIH Office of Dietary Supplements. Dietary Supplements and Life Stages: Pregnancy—Health Professional Fact Sheet. Current folic-acid and folate guidance.',
    url: 'https://ods.od.nih.gov/factsheets/Pregnancy-HealthProfessional/',
  },
  {
    n: 5,
    text: 'NIH Office of Dietary Supplements. Folate: Fact Sheet for Health Professionals. Current MTHFR, folic-acid, and upper-limit guidance.',
    url: 'https://ods.od.nih.gov/factsheets/Folate-HealthProfessional/',
  },
  {
    n: 6,
    text: 'NIH Office of Dietary Supplements. Thiamin: Fact Sheet for Health Professionals. Current deficiency-risk and alcohol-dependence guidance.',
    url: 'https://ods.od.nih.gov/factsheets/Thiamin-HealthProfessional/',
  },
  {
    n: 7,
    text: 'NIH Office of Dietary Supplements. Niacin: Fact Sheet for Health Professionals. Current upper-limit, pharmacologic-dose, and hepatotoxicity guidance.',
    url: 'https://ods.od.nih.gov/factsheets/Niacin-HealthProfessional/',
  },
  {
    n: 8,
    text: 'Kennedy DO. B Vitamins and the Brain: Mechanisms, Dose and Efficacy—A Review. Nutrients. 2016;8(2):68. PMID 26828517.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/26828517/',
    pmid: '26828517',
  },
]

export default function BComplexPage() {
  return (
    <div className="container-page py-10 space-y-10">
      <AuthorityJsonLd
        title="B-Complex Vitamins: Deficiency, Forms and Safety"
        description="Evidence-based guide to nutrient-specific B-vitamin needs, B12 forms, folic acid and MTHFR, and B6/niacin safety."
        url="https://thehippiescientist.net/guides/other/b-complex-guide/"
        type="MedicalWebPage"
        citationUrls={BCOMPLEX_REFS.map(reference => reference.url)}
      />
      <AuthorityBreadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Guides', href: '/guides/' }, { label: 'B-Complex Vitamins' }]} />

      <section className="space-y-5 max-w-4xl">
        <p className="eyebrow-label">Evidence Review · 8 References · Updated August 16, 2026</p>
        <h1 className="text-5xl font-bold tracking-tight text-ink">B-Complex Vitamins: Target the Nutrient, Not the Marketing Label</h1>
        <p className="text-lg leading-8 text-muted">
          “B-complex” combines nutrients with different deficiency risks, clinical uses, recommended intakes, and toxicity profiles. The useful question is rarely “which B-complex is best?” It is <strong>which B vitamin is relevant, why, and what evidence or risk applies to that nutrient</strong>.
        </p>
        <figure className="mt-6"><div className="overflow-hidden rounded-2xl border border-brand-900/10 shadow-sm bg-white"><Image src="/images/guides/b-complex-guide.jpg" alt="B-complex capsules beside eggs and leafy greens" width={1536} height={1024} priority className="w-full h-auto" /></div><figcaption className="mt-3 text-center text-sm text-muted">B vitamins share a category name, not one evidence base or one safe dose range.</figcaption></figure>
      </section>

      <LegacyGuideQuickAnswer referencesHref="#references">
        <p>
          A B-complex is not automatically an energy enhancer or nutritional “insurance policy.” Targeted supplementation makes the most sense when a specific nutrient need is identified—for example B12 in people with dietary or absorption risk, folic acid around conception, or thiamin in people at high risk of deficiency [1,3,4,6].
        </p>
        <p className="mt-3">
          Two common shopping rules are not supported as universal truths: NIH ODS says B12 supplement absorption does <strong>not</strong> differ by cobalamin form and oral versus sublingual B12 have similar efficacy [1], while CDC says common MTHFR variants are not a reason to avoid folic acid [3]. Safety is also nutrient-specific—high-dose B6 and niacin can cause clinically important adverse effects [2,7].
        </p>
      </LegacyGuideQuickAnswer>

      <section id="b-vitamin-decision-ledger" data-answer-engine-table="true" className="card-premium scroll-mt-24 p-6 space-y-4 max-w-5xl border-l-4 border-brand-700 bg-brand-50/30">
        <p className="eyebrow-label">Nutrient-specific decision ledger</p>
        <h2 className="text-2xl font-semibold tracking-tight text-ink">The clinically important differences inside a B-complex</h2>
        <div className="overflow-x-auto">
          <table className="min-w-[980px] w-full text-sm">
            <caption className="sr-only">B-vitamin deficiency risk, form evidence, and safety considerations</caption>
            <thead>
              <tr className="border-b border-brand-900/10">
                <th scope="col" className="text-left py-2 pr-4 font-semibold text-ink">Nutrient</th>
                <th scope="col" className="text-left py-2 pr-4 font-semibold text-ink">When it becomes especially relevant</th>
                <th scope="col" className="text-left py-2 pr-4 font-semibold text-ink">Form / evidence boundary</th>
                <th scope="col" className="text-left py-2 font-semibold text-ink">Safety boundary</th>
              </tr>
            </thead>
            <tbody className="text-muted">
              <tr className="border-b border-brand-900/5 align-top">
                <th scope="row" className="py-3 pr-4 text-left font-medium text-ink">B1 · Thiamin</th>
                <td className="py-3 pr-4">Alcohol dependence, some older adults, malabsorption/bariatric contexts, and other deficiency risks [6]</td>
                <td className="py-3 pr-4">Risk-group evidence does not make benfotiamine a universal “best B1” form</td>
                <td className="py-3">Severe thiamin deficiency can be urgent and should not be managed by choosing a retail B-complex alone</td>
              </tr>
              <tr className="border-b border-brand-900/5 align-top">
                <th scope="row" className="py-3 pr-4 text-left font-medium text-ink">B3 · Niacin</th>
                <td className="py-3 pr-4">Deficiency is uncommon in the United States; pharmacologic nicotinic acid is a separate medical use [7]</td>
                <td className="py-3 pr-4">Nicotinic acid and nicotinamide have different adverse-effect profiles; “flush” is not an efficacy grade</td>
                <td className="py-3">Adult supplement UL is 35 mg/day based on flushing; pharmacologic doses can cause metabolic, gastrointestinal, ocular, and liver toxicity and require medical monitoring [7]</td>
              </tr>
              <tr className="border-b border-brand-900/5 align-top">
                <th scope="row" className="py-3 pr-4 text-left font-medium text-ink">B6 · Pyridoxine / PLP</th>
                <td className="py-3 pr-4">True deficiency and selected clinician-directed indications [2]</td>
                <td className="py-3 pr-4">Using P5P does not make chronic high-dose B6 automatically safe</td>
                <td className="py-3">Sensory neuropathy is the key excess-risk signal. U.S. adult UL is 100 mg/day; EFSA set 12 mg/day in 2023 after reviewing neuropathy evidence [2]</td>
              </tr>
              <tr className="border-b border-brand-900/5 align-top">
                <th scope="row" className="py-3 pr-4 text-left font-medium text-ink">B9 · Folate / folic acid</th>
                <td className="py-3 pr-4">Periconceptional neural-tube-defect prevention and diagnosed folate deficiency [3-5]</td>
                <td className="py-3 pr-4">Common MTHFR variants do not require avoidance of folic acid. Folic acid is the form proven to reduce neural-tube defects [3,4]</td>
                <td className="py-3">Supplement/fortified-food folate has an upper limit; high folate intake can complicate recognition of B12 deficiency [5]</td>
              </tr>
              <tr className="align-top">
                <th scope="row" className="py-3 pr-4 text-left font-medium text-ink">B12 · Cobalamin</th>
                <td className="py-3 pr-4">Vegan diets, pernicious anemia/malabsorption, some GI surgery, metformin, and long-term gastric-acid suppression [1]</td>
                <td className="py-3 pr-4">Cyanocobalamin, methylcobalamin, hydroxocobalamin and other forms can provide B12; NIH ODS finds no absorption-rate advantage by supplement form and no efficacy advantage for sublingual versus oral [1]</td>
                <td className="py-3">Severe or neurologic deficiency deserves diagnosis and appropriate treatment rather than form-shopping</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="card-premium p-6 space-y-4 max-w-4xl">
        <p className="eyebrow-label">MTHFR without the marketing</p>
        <h2 className="text-2xl font-semibold tracking-tight text-ink">A common gene variant is not a folic-acid contraindication</h2>
        <p className="text-sm leading-7 text-muted">
          MTHFR C677T can reduce enzyme activity, but the practical conclusion promoted online often outruns the evidence. CDC states that people with common MTHFR variants can process folic acid, that 400 mcg/day folic acid increases blood folate regardless of genotype, and that common variants are not a reason to avoid folic acid [3].
        </p>
        <p className="text-sm leading-7 text-muted">
          This matters most around pregnancy: NIH ODS notes that folic acid is the form proven in clinical trials to reduce neural-tube defects, while 5-MTHF has not been demonstrated for that endpoint [4]. A supplement label saying “methylated” therefore should not overrule established prevention guidance.
        </p>
      </section>

      <section className="card-premium p-6 space-y-4 max-w-4xl">
        <p className="eyebrow-label">B12 form and route</p>
        <h2 className="text-2xl font-semibold tracking-tight text-ink">“Active form” does not mean “better absorbed”</h2>
        <p className="text-sm leading-7 text-muted">
          Methylcobalamin and adenosylcobalamin are metabolically active B12 forms; cyanocobalamin and hydroxocobalamin are converted to active forms in the body. NIH ODS states that no evidence indicates supplement absorption rates differ by B12 form [1].
        </p>
        <p className="text-sm leading-7 text-muted">
          Sublingual marketing is another place where mechanism can become a superiority claim: current ODS guidance says oral and sublingual B12 have similar efficacy [1]. Pernicious anemia, severe deficiency, neurologic symptoms, or major malabsorption can change treatment decisions, which is a clinical question rather than a retail-form ranking.
        </p>
      </section>

      <section className="card-premium p-6 space-y-4 max-w-4xl">
        <p className="eyebrow-label">Excess is nutrient-specific</p>
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Water-soluble does not mean unlimited</h2>
        <p className="text-sm leading-7 text-muted">
          B vitamins do not share one toxicity threshold. B12 has no established UL because of its low toxicity potential [1], while B6 can cause sensory neuropathy with chronic excess [2]. Niacin has a supplement UL based on flushing and pharmacologic doses can require liver, glucose, and other monitoring [7].
        </p>
        <p className="text-sm leading-7 text-muted">
          That is why a high-potency B-complex should be evaluated by the <strong>individual label amounts</strong>, not by the reassuring idea that anything water-soluble will simply be excreted.
        </p>
      </section>

      <section className="card-premium p-6 space-y-4 max-w-4xl">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Bottom line</h2>
        <p className="text-sm leading-7 text-muted">
          B vitamins are essential nutrients, but “B-complex” is not a single intervention. The strongest evidence-based approach is to identify the relevant nutrient and reason: dietary insufficiency, life stage, medication-associated risk, malabsorption, or diagnosed deficiency. Common MTHFR variants do not make folic acid obsolete, methylcobalamin is not proven better absorbed than cyanocobalamin, and B6/niacin demonstrate why high-potency formulas should not be treated as harmless nutritional insurance [1-8].
        </p>
      </section>

      <LegacyGuideFAQ questions={[...FAQS]} pagePath="/guides/other/b-complex-guide/" />
      <References refs={BCOMPLEX_REFS} />
      <EmailCapture headline="Get evidence reviews like this" description="B vitamins, deficiency risk, forms, and safety — evidence without methylation hype." ctaLabel="Get the evidence" location="guide-bcomplex" />
      <div className="pt-4 border-t border-brand-900/10 flex items-center justify-between"><Link href="/guides/" className="inline-flex rounded-full border border-brand-900/10 bg-[var(--surface-card)] px-4 py-2 text-sm font-bold text-ink transition hover:bg-brand-50">← Back to guides</Link><Link href="/herbs/" className="text-sm font-bold text-brand-800 hover:underline">Herb library →</Link></div>
    </div>
  )
}
