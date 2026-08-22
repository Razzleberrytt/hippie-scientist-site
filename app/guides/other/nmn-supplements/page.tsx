import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { buildPageMetadata } from '../../../../src/lib/seo'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import FAQSchema from '@/components/seo/FAQSchema'
import References from '@/components/References'
import EmailCapture from '../../../../components/EmailCapture'

export const metadata: Metadata = buildPageMetadata({
  title: 'Do NMN Supplements Work? 2026 Evidence, Safety & FDA Status',
  description:
    '17-source NMN evidence review: NAD+ biomarker increases vs anti-aging outcomes, positive and null RCTs, 24-week safety data, FDA’s 2025 regulatory reversal, IV NAD+ warnings, and product-quality testing.',
  path: '/guides/other/nmn-supplements/',
  openGraphType: 'article',
})

function Cite({ n }: { n: number }) {
  return (
    <sup className="ml-0.5 align-super text-[0.7em] font-semibold text-brand-700">
      <a href={`#ref-${n}`} aria-label={`Reference ${n}`} className="hover:underline">[{n}]</a>
    </sup>
  )
}

const FAQS = [
  {
    question: 'Do NMN supplements actually work?',
    answer:
      'NMN clearly works as a biochemical NAD+ precursor: randomized human trials consistently show increases in blood NAD-related biomarkers. Whether that translates into meaningful anti-aging benefit is much less certain. Clinical outcomes are mixed, several meta-analyses are largely null for metabolic endpoints, and no human trial has shown longer lifespan.',
  },
  {
    question: 'Does NMN slow aging or extend lifespan?',
    answer:
      'Not proven. Human studies are short and generally measure biomarkers, metabolic outcomes, physical function, sleep/fatigue, or safety. There is no human lifespan trial showing that NMN extends life, and current systematic reviews describe clinical anti-aging effectiveness as inconclusive.',
  },
  {
    question: 'Does raising NAD+ prove NMN is anti-aging?',
    answer:
      'No. Raising NAD-related metabolites demonstrates target engagement. It does not by itself prove slower biological aging, fewer age-related diseases, longer healthspan, or longer lifespan.',
  },
  {
    question: 'What is the longest randomized NMN safety evidence?',
    answer:
      'The 2026 randomized-trial meta-analysis included studies lasting 14 days to 24 weeks. Short-term tolerability is increasingly characterized, but that does not establish multi-year safety.',
  },
  {
    question: 'What is NMN’s FDA status in 2026?',
    answer:
      'FDA changed its position in September 2025 and concluded that NMN is not excluded from the definition of a dietary supplement under the drug-preclusion provision because NMN had been marketed as a dietary supplement before drug-investigation authorization. FDA’s current NDI list also includes beta-NMN notification 1444 with a January 28, 2026 response. None of this is FDA approval of NMN as an anti-aging drug or approval of every retail product.',
  },
  {
    question: 'Are NAD+ IV infusions proven for anti-aging?',
    answer:
      'No. A 2026 systematic review found no eligible clinical-outcomes trials of intravenous or intramuscular NAD+ itself for anti-aging or wellness indications. FDA has also warned about sterile-compounding risks when food-grade NAD+ is used for IV products and has received adverse-event reports consistent with endotoxin exposure.',
  },
  {
    question: 'Are commercial NMN supplements accurately labeled?',
    answer:
      'Not always. One published analysis of 18 products found NMN content ranging from above label claim to products with no detectable NMN. A newer analytical study of eight products also found substantial variation in alpha/beta NMN composition and undeclared or inaccurately labeled ingredients.',
  },
] as const

const NMN_REFS = [
  { n: 1, title: 'NAD+ supplementation for anti-aging and wellness: A PRISMA-guided systematic review of preclinical and clinical evidence', text: 'Gallagher C, Emmanuel OO. Ageing Res Rev. 2026;116:103057.', year: 2026, pmid: '41655607', url: 'https://pubmed.ncbi.nlm.nih.gov/41655607/' },
  { n: 2, title: 'Safety and Metabolism-Related Outcomes of Oral Nicotinamide Mononucleotide Supplementation in Adults: A Systematic Review and Meta-Analysis', text: 'Yang W, et al. Nutrients. 2026;18(14):2251.', year: 2026, pmid: '42514320', url: 'https://pubmed.ncbi.nlm.nih.gov/42514320/' },
  { n: 3, title: 'NAD+ precursor supplementation in human ageing: clinical evidence and challenges', text: 'Vinten KT, et al. Nat Metab. 2025;7:1974-1990.', year: 2025, pmid: '41083806', url: 'https://pubmed.ncbi.nlm.nih.gov/41083806/' },
  { n: 4, title: 'Efficacy of oral nicotinamide mononucleotide supplementation on glucose and lipid metabolism for adults: a systematic review and meta-analysis', text: 'Meta-analysis of 12 studies / 513 participants.', year: 2024, pmid: '39116016', url: 'https://pubmed.ncbi.nlm.nih.gov/39116016/' },
  { n: 5, title: 'Nicotinamide mononucleotide increases muscle insulin sensitivity in prediabetic women', text: 'Yoshino M, et al. Science. 2021;372(6547):1224-1229.', year: 2021, pmid: '33888596', url: 'https://pubmed.ncbi.nlm.nih.gov/33888596/' },
  { n: 6, title: 'Effects of nicotinamide mononucleotide on older patients with diabetes and impaired physical performance', text: 'Akasaka H, et al. Geriatr Gerontol Int. 2023;23(1):38-43.', year: 2023, pmid: '36443648', doi: '10.1111/ggi.14513', url: 'https://pubmed.ncbi.nlm.nih.gov/36443648/' },
  { n: 7, title: 'The efficacy and safety of β-nicotinamide mononucleotide supplementation in healthy middle-aged adults', text: 'Yi L, et al. Geroscience. 2023;45(1):29-43. Dose-ranging RCT.', year: 2023, pmid: '36482258', doi: '10.1007/s11357-022-00705-1', url: 'https://pubmed.ncbi.nlm.nih.gov/36482258/' },
  { n: 8, title: 'Effect of 12-Week Intake of Nicotinamide Mononucleotide on Sleep Quality, Fatigue, and Physical Performance in Older Japanese Adults', text: 'Randomized double-blind placebo-controlled study; 108 older adults.', year: 2022, pmid: '35215405', doi: '10.3390/nu14040755', url: 'https://pubmed.ncbi.nlm.nih.gov/35215405/' },
  { n: 9, title: 'Chronic nicotinamide mononucleotide supplementation elevates blood NAD levels and alters muscle function in healthy older men', text: 'Randomized placebo-controlled human study.', year: 2022, pmid: '35927255', url: 'https://pubmed.ncbi.nlm.nih.gov/35927255/' },
  { n: 10, title: 'Towards personalized nicotinamide mononucleotide supplementation: Nicotinamide adenine dinucleotide concentration', text: 'Post-hoc analysis of the 300/600/900 mg dose-ranging RCT.', year: 2024, pmid: '38430946', doi: '10.1016/j.mad.2024.111917', url: 'https://pubmed.ncbi.nlm.nih.gov/38430946/' },
  { n: 11, title: 'Testing the amount of nicotinamide mononucleotide and urolithin A as compared to the label claim', text: 'Sandalova E, et al. GeroScience. 2024;46:5075-5083.', year: 2024, pmid: '38935229', url: 'https://pubmed.ncbi.nlm.nih.gov/38935229/' },
  { n: 12, title: 'Aqueous LC-MS/MS quantification of alpha-/beta-nicotinamide mononucleotide in dietary supplements', text: 'Analytical study applied to eight commercial NMN products.', year: 2026, pmid: '41545110', url: 'https://pubmed.ncbi.nlm.nih.gov/41545110/' },
  { n: 13, title: 'FDA response to citizen petition concerning beta nicotinamide mononucleotide (NMN)', text: 'September 29, 2025. FDA concluded NMN is not excluded from the dietary supplement definition under section 201(ff)(3)(B).', year: 2025, url: 'https://downloads.regulations.gov/FDA-2023-P-0872-2754/attachment_1.pdf' },
  { n: 14, title: 'Submitted 75-Day Premarket Notifications for New Dietary Ingredients', text: 'FDA current NDI database; notification 1444 lists beta-NMN / NMN, Effepharm Ltd., response January 28, 2026.', year: 2026, url: 'https://www.fda.gov/food/new-dietary-ingredient-ndi-notification-process/submitted-75-day-premarket-notifications-new-dietary-ingredients' },
  { n: 15, title: 'Questions and Answers on Dietary Supplements', text: 'FDA consumer/regulatory overview: dietary supplements are not FDA-approved for safety and effectiveness before marketing.', year: 2026, url: 'https://www.fda.gov/food/information-consumers-using-dietary-supplements/questions-and-answers-dietary-supplements' },
  { n: 16, title: 'FDA reminds compounders to use ingredients suitable for sterile compounding', text: 'FDA warning discussing food-grade NAD+ used in IV products, endotoxin/microbial contamination risk, and adverse-event reports.', year: 2024, url: 'https://www.fda.gov/drugs/human-drug-compounding/fda-reminds-compounders-use-ingredients-suitable-sterile-compounding' },
  { n: 17, title: 'GenoGenix LLC Warning Letter', text: 'FDA January 20, 2026 warning letter describing NAD+ compounding issues and a lot with excessive bacterial endotoxins associated with patient reactions.', year: 2026, url: 'https://www.fda.gov/inspections-compliance-enforcement-and-criminal-investigations/warning-letters/genogenix-llc-718739-01202026' },
]

export default function NMNGuidePage() {
  return (
    <div className="container-page space-y-10 py-10">
      <AuthorityJsonLd
        title="Do NMN Supplements Work? 2026 Evidence, Safety and FDA Status"
        description="Evidence-calibrated review separating NAD biomarker changes from clinical anti-aging outcomes, with positive and null RCTs, current regulatory status, IV safety, and product-quality context."
        url="https://thehippiescientist.net/guides/other/nmn-supplements/"
        type="MedicalWebPage"
        faqItems={[...FAQS]}
        citationUrls={NMN_REFS.map((reference) => reference.url || '')}
      />
      <AuthorityBreadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Guides', href: '/guides/' }, { label: 'NMN Supplements' }]} />
      <FAQSchema pagePath="/guides/other/nmn-supplements/" questions={[...FAQS]} />

      <section className="max-w-4xl space-y-5">
        <p className="eyebrow-label">Longevity Evidence Review · 17 sources · Updated August 22, 2026</p>
        <h1 className="text-4xl font-bold tracking-tight text-ink sm:text-5xl">Do NMN Supplements Work? The NAD+ Biomarker Does. The Anti-Aging Claim Is Still Unproven.</h1>
        <p className="text-lg leading-8 text-muted">
          Nicotinamide mononucleotide (NMN) is a useful test of evidence discipline. Human trials repeatedly show that oral NMN can raise blood NAD-related metabolites,
          so the supplement is not biologically inert.<Cite n={1} /><Cite n={2} /> But the clinically important leap — from <strong>raising a biomarker</strong> to
          <strong> slowing aging, preventing disease, extending healthspan or extending life</strong> — has not been demonstrated in humans.<Cite n={1} /><Cite n={3} />
        </p>
        <figure className="mt-6"><div className="overflow-hidden rounded-2xl border border-brand-900/10 bg-white shadow-sm"><Image src="/images/guides/nmn-supplements.jpg" alt="Longevity supplement capsules in a glass jar on a laboratory surface" width={1536} height={1024} priority className="h-auto w-full" /></div><figcaption className="mt-3 text-center text-sm text-muted">Target engagement is not the same endpoint as healthspan or lifespan.</figcaption></figure>
      </section>

      <section className="card-premium max-w-4xl space-y-4 p-6">
        <p className="eyebrow-label">Quick answer</p>
        <h2 className="text-2xl font-semibold tracking-tight text-ink">What NMN is proven to do — and what it is not</h2>
        <div className="space-y-3 text-sm leading-7 text-muted">
          <p><strong className="text-ink">Proven biochemical effect:</strong> oral NMN raises blood NAD-related biomarkers in randomized human studies.<Cite n={1} /><Cite n={7} /><Cite n={9} /></p>
          <p><strong className="text-ink">Clinical effects:</strong> mixed. Some trials report endpoint-specific signals in insulin sensitivity, walking performance, fatigue or physical function, while other randomized studies are null and pooled metabolic analyses are mostly negative.<Cite n={2} /><Cite n={4} /><Cite n={5} /><Cite n={6} /></p>
          <p><strong className="text-ink">Anti-aging / longevity:</strong> unproven. No human trial demonstrates slower overall aging or longer lifespan.<Cite n={1} /><Cite n={3} /></p>
          <p><strong className="text-ink">Safety:</strong> short-term tolerability is increasingly reassuring through 24 weeks in the randomized literature, but multi-year safety is unknown.<Cite n={2} /></p>
        </div>
      </section>

      <section className="card-premium max-w-4xl space-y-5 border-l-4 border-brand-700 bg-brand-50/30 p-6">
        <p className="eyebrow-label">Evidence translation</p>
        <h2 className="text-2xl font-semibold tracking-tight text-ink">The four-step ladder longevity marketing often collapses into one sentence</h2>
        <div className="overflow-x-auto"><table className="min-w-[760px] w-full text-sm"><thead><tr className="border-b border-brand-900/10"><th className="py-2 pr-4 text-left font-semibold text-ink">Evidence step</th><th className="py-2 pr-4 text-left font-semibold text-ink">NMN status</th><th className="py-2 text-left font-semibold text-ink">Interpretation</th></tr></thead><tbody className="text-muted">
          <tr className="border-b border-brand-900/5"><td className="py-3 pr-4 font-medium text-ink">1. Raises NAD-related biomarkers</td><td className="py-3 pr-4"><strong>Supported</strong></td><td className="py-3">Target engagement is real.<Cite n={1} /><Cite n={7} /></td></tr>
          <tr className="border-b border-brand-900/5"><td className="py-3 pr-4 font-medium text-ink">2. Improves a physiological/functional outcome</td><td className="py-3 pr-4"><strong>Mixed</strong></td><td className="py-3">Some trial-specific signals; many null endpoints.<Cite n={2} /><Cite n={5} /><Cite n={6} /></td></tr>
          <tr className="border-b border-brand-900/5"><td className="py-3 pr-4 font-medium text-ink">3. Improves healthspan / disease outcomes</td><td className="py-3 pr-4"><strong>Not established</strong></td><td className="py-3">No validated broad clinical anti-aging effect.<Cite n={1} /><Cite n={3} /></td></tr>
          <tr><td className="py-3 pr-4 font-medium text-ink">4. Extends human lifespan</td><td className="py-3 pr-4"><strong>No evidence</strong></td><td className="py-3">No human lifespan trial demonstrates this.</td></tr>
        </tbody></table></div>
      </section>

      <section className="card-premium max-w-4xl space-y-4 p-6">
        <p className="eyebrow-label">2026 systematic evidence</p>
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Biological activity is clear; anti-aging clinical effectiveness is not</h2>
        <p className="text-sm leading-7 text-muted">
          A 2026 PRISMA-guided review identified 113 intervention studies — 33 human studies and 80 rodent studies. Human oral NMN/NR studies consistently showed biochemical target engagement, while metabolic, vascular, physical-performance and other wellness outcomes were heterogeneous, often endpoint-specific or null.<Cite n={1} />
        </p>
        <p className="text-sm leading-7 text-muted">
          A separate July 2026 NMN meta-analysis pooled 15 randomized trials and found no significant effect on body weight, BMI, fasting glucose, HbA1c, lipids or systolic blood pressure. A small diastolic-blood-pressure change and nonsignificant HOMA-IR trend were preliminary rather than evidence of broad metabolic rejuvenation.<Cite n={2} />
        </p>
        <p className="text-sm leading-7 text-muted">
          The 2024 metabolic meta-analysis reached a similar conclusion: blood NAD increased, while most glucose/lipid outcomes did not differ significantly from control; risk-of-bias concerns were common.<Cite n={4} />
        </p>
      </section>

      <section className="card-premium max-w-4xl space-y-4 p-6">
        <p className="eyebrow-label">Positive vs null randomized trials</p>
        <h2 className="text-2xl font-semibold tracking-tight text-ink">The trial literature is interesting precisely because it does not tell one clean story</h2>
        <div className="overflow-x-auto"><table className="min-w-[920px] w-full text-sm"><thead><tr className="border-b border-brand-900/10"><th className="py-2 pr-4 text-left font-semibold text-ink">Study</th><th className="py-2 pr-4 text-left font-semibold text-ink">Signal</th><th className="py-2 pr-4 text-left font-semibold text-ink">Important boundary</th><th className="py-2 text-left font-semibold text-ink">Interpretation</th></tr></thead><tbody className="text-muted">
          <tr className="border-b border-brand-900/5 align-top"><td className="py-3 pr-4 font-medium text-ink">Prediabetic postmenopausal women<Cite n={5} /></td><td className="py-3 pr-4">Improved muscle insulin sensitivity/signaling over 10 weeks.</td><td className="py-3 pr-4">Narrow population and endpoint; not a general anti-aging trial.</td><td className="py-3">Important positive signal needing replication/generalization.</td></tr>
          <tr className="border-b border-brand-900/5 align-top"><td className="py-3 pr-4 font-medium text-ink">Older men with diabetes + impaired physical performance<Cite n={6} /></td><td className="py-3 pr-4">250 mg/day for 24 weeks was tolerated.</td><td className="py-3 pr-4">Only 14 participants; no improvement in grip strength or walking speed and no significant exploratory differences.</td><td className="py-3">Useful null trial despite tiny sample.</td></tr>
          <tr className="border-b border-brand-900/5 align-top"><td className="py-3 pr-4 font-medium text-ink">Healthy middle-aged adults, 300/600/900 mg<Cite n={7} /></td><td className="py-3 pr-4">Raised NAD; six-minute-walk and SF-36 signals over 60 days.</td><td className="py-3 pr-4">HOMA-IR null; 80 participants; industry-employed authors disclosed.</td><td className="py-3">Positive functional signal with conflict/directness caveats.</td></tr>
          <tr className="border-b border-brand-900/5 align-top"><td className="py-3 pr-4 font-medium text-ink">108 older Japanese adults<Cite n={8} /></td><td className="py-3 pr-4">Afternoon NMN group showed larger effects for sit-to-stand and drowsiness measures.</td><td className="py-3 pr-4">Multiple groups/outcomes; not proof of a general sleep or anti-aging effect.</td><td className="py-3">Endpoint-specific hypothesis-generating signal.</td></tr>
          <tr className="align-top"><td className="py-3 pr-4 font-medium text-ink">Healthy older men<Cite n={9} /></td><td className="py-3 pr-4">Raised NAD metabolites with nominal gait/grip signals.</td><td className="py-3 pr-4">Small trial; body composition unchanged; findings need validation.</td><td className="py-3">Biomarker effect stronger than clinical certainty.</td></tr>
        </tbody></table></div>
      </section>

      <section className="card-premium max-w-4xl space-y-4 p-6">
        <p className="eyebrow-label">Dose-response caution</p>
        <h2 className="text-2xl font-semibold tracking-tight text-ink">More NAD is not automatically more health</h2>
        <p className="text-sm leading-7 text-muted">
          The 60-day dose-ranging study showed larger NAD increases at higher NMN doses, and a later post-hoc analysis confirmed large individual variability in NAD responses.<Cite n={7} /><Cite n={10} /> But a stronger biomarker response does not establish a dose-response relationship for healthspan or lifespan.
        </p>
        <p className="text-sm leading-7 text-muted">
          The 2026 meta-analysis spans 250–2,000 mg/day and 14 days–24 weeks.<Cite n={2} /> Those ranges describe what researchers tested. They do not establish an evidence-based “longevity dose,” titration schedule or blood-NAD target.
        </p>
      </section>

      <section className="card-premium max-w-4xl space-y-4 p-6">
        <p className="eyebrow-label">Human-aging assumption</p>
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Even “NAD+ declines with age” needs human-tissue nuance</h2>
        <p className="text-sm leading-7 text-muted">
          The 2025 Nature Metabolism review notes that consistent evidence for an age-associated NAD decline in humans comes from a limited number of studies and that tissue-specific human data remain sparse.<Cite n={3} /> Rodent longevity biology is valuable for mechanism discovery, but it is not a direct map of whole-body human aging.
        </p>
        <p className="text-sm leading-7 text-muted">The marketing chain — aging lowers NAD → raising NAD reverses the deficit → reversing the deficit slows aging — contains multiple separate causal claims. Human evidence is needed at every arrow.</p>
      </section>

      <section className="card-premium max-w-4xl space-y-4 border-l-4 border-amber-500 bg-amber-50/40 p-6">
        <p className="eyebrow-label">IV NAD+ reality check</p>
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Wellness-clinic availability is far ahead of outcomes evidence — and sterile quality matters</h2>
        <p className="text-sm leading-7 text-muted">
          The 2026 systematic review found no eligible clinical-outcomes trials of intravenous or intramuscular NAD+ itself for anti-aging or wellness indications.<Cite n={1} /> That means claims of improved healthspan from NAD+ infusions are not supported by a mature outcomes literature.
        </p>
        <p className="text-sm leading-7 text-muted">
          FDA has separately warned that food-grade NAD+ is not suitable for sterile compounding without appropriate processing because of microbial/endotoxin contamination risk, and reported adverse events including severe chills, shaking, vomiting and fatigue consistent with excessive endotoxin exposure.<Cite n={16} /> A January 2026 FDA warning letter described patients sent to the emergency room after a compounded NAD+ lot later measured at 3,360 EU/mL of bacterial endotoxin.<Cite n={17} />
        </p>
      </section>

      <section className="card-premium max-w-4xl space-y-4 p-6">
        <p className="eyebrow-label">FDA status — corrected for 2025/2026</p>
        <h2 className="text-2xl font-semibold tracking-tight text-ink">FDA reversed its earlier drug-preclusion position on NMN</h2>
        <p className="text-sm leading-7 text-muted">
          This is a place where older web pages are now stale. In a September 29, 2025 citizen-petition response, FDA stated that under its revised interpretation of the race-to-market provision, <strong>NMN is not excluded from the definition of dietary supplement under section 201(ff)(3)(B)</strong> because NMN had been marketed as a dietary supplement in the United States before drug-investigation authorization.<Cite n={13} />
        </p>
        <p className="text-sm leading-7 text-muted">
          FDA’s current NDI database also lists notification <strong>1444</strong> for beta-NMN / NMN from Effepharm, submitted November 17, 2025, with an FDA response dated January 28, 2026.<Cite n={14} /> This is regulatory-process evidence, not FDA approval of NMN as an anti-aging treatment and not proof that every retail product is lawful, equivalent, safe or effective. FDA does not preapprove dietary supplements for safety and effectiveness before marketing.<Cite n={15} />
        </p>
        <div className="rounded-xl border border-brand-900/10 bg-brand-50/40 p-4 text-sm leading-6 text-muted"><strong className="text-ink">Why this matters:</strong> the site should not repeat the old shorthand “FDA banned NMN supplements.” It should also not swing to the opposite error “FDA approved NMN.” Both are inaccurate in 2026.</div>
      </section>

      <section className="card-premium max-w-4xl space-y-4 p-6">
        <p className="eyebrow-label">Product-quality moat</p>
        <h2 className="text-2xl font-semibold tracking-tight text-ink">“NMN” on the bottle does not guarantee the studied ingredient is inside</h2>
        <p className="text-sm leading-7 text-muted">
          A published analysis tested 18 commercial NMN supplements and found measured active ingredient ranging from 28.6% above label claim to 100% below claim — including products with no detectable NMN.<Cite n={11} />
        </p>
        <p className="text-sm leading-7 text-muted">
          A newer LC-MS/MS study that separates alpha- and beta-NMN examined eight commercial products and found substantial variation in isomer composition plus undeclared or inaccurately labeled ingredients.<Cite n={12} /> Human trials usually study a defined chemical preparation, not any powder carrying the letters “NMN.”
        </p>
      </section>

      <section className="card-premium max-w-4xl space-y-4 p-6">
        <p className="eyebrow-label">Safety horizon</p>
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Short-term tolerability is not a synonym for lifetime safety</h2>
        <p className="text-sm leading-7 text-muted">
          The 2026 meta-analysis did not find significant increases in overall adverse events, serious adverse events, withdrawals, system-specific adverse events, ALT or AST across the pooled short-term RCT data.<Cite n={2} /> That is useful and increasingly reassuring.
        </p>
        <p className="text-sm leading-7 text-muted">
          The longest trials in that synthesis extended to 24 weeks, not years.<Cite n={2} /> There is therefore a large gap between “generally tolerated for weeks to months in trials” and “established safe for years of daily use in diverse medically complex adults.”
        </p>
      </section>

      <section className="card-premium max-w-4xl space-y-4 p-6">
        <p className="eyebrow-label">Claim audit</p>
        <h2 className="text-2xl font-semibold tracking-tight text-ink">What the evidence supports in August 2026</h2>
        <div className="overflow-x-auto"><table className="min-w-[760px] w-full text-sm"><thead><tr className="border-b border-brand-900/10"><th className="py-2 pr-4 text-left font-semibold text-ink">Claim</th><th className="py-2 text-left font-semibold text-ink">Verdict</th></tr></thead><tbody className="text-muted">
          <tr className="border-b border-brand-900/5"><td className="py-3 pr-4">Oral NMN raises NAD-related biomarkers</td><td className="py-3"><strong>Supported</strong><Cite n={1} /><Cite n={7} /></td></tr>
          <tr className="border-b border-brand-900/5"><td className="py-3 pr-4">NMN broadly improves metabolic health</td><td className="py-3"><strong>Not established</strong><Cite n={2} /><Cite n={4} /></td></tr>
          <tr className="border-b border-brand-900/5"><td className="py-3 pr-4">NMN has some endpoint-specific positive human trials</td><td className="py-3"><strong>Yes</strong><Cite n={5} /><Cite n={7} /><Cite n={8} /></td></tr>
          <tr className="border-b border-brand-900/5"><td className="py-3 pr-4">NMN slows human biological aging</td><td className="py-3"><strong>Not established</strong><Cite n={1} /><Cite n={3} /></td></tr>
          <tr className="border-b border-brand-900/5"><td className="py-3 pr-4">NMN extends human lifespan</td><td className="py-3"><strong>No evidence</strong></td></tr>
          <tr className="border-b border-brand-900/5"><td className="py-3 pr-4">Short-term oral tolerability is reasonably characterized</td><td className="py-3"><strong>Increasingly supported</strong><Cite n={2} /></td></tr>
          <tr className="border-b border-brand-900/5"><td className="py-3 pr-4">Multi-year daily safety is established</td><td className="py-3"><strong>No</strong></td></tr>
          <tr className="border-b border-brand-900/5"><td className="py-3 pr-4">IV NAD+ has anti-aging outcomes evidence</td><td className="py-3"><strong>No eligible outcomes trials in the 2026 review</strong><Cite n={1} /></td></tr>
          <tr className="border-b border-brand-900/5"><td className="py-3 pr-4">Every retail NMN product matches its label</td><td className="py-3"><strong>No</strong><Cite n={11} /><Cite n={12} /></td></tr>
          <tr><td className="py-3 pr-4">FDA has approved NMN as an anti-aging treatment</td><td className="py-3"><strong>No</strong><Cite n={13} /><Cite n={15} /></td></tr>
        </tbody></table></div>
      </section>

      <section className="card-premium max-w-4xl space-y-4 p-6">
        <p className="eyebrow-label">What would materially change the conclusion?</p>
        <h2 className="text-2xl font-semibold tracking-tight text-ink">The next evidence edge is clinical, not another NAD graph</h2>
        <ol className="list-decimal space-y-2 pl-5 text-sm leading-7 text-muted">
          <li>Large, independently replicated randomized trials powered for patient-important outcomes rather than mainly NAD biomarkers.</li>
          <li>Longer follow-up measuring validated healthspan, disease or functional endpoints.</li>
          <li>Clear tissue-level human pharmacology showing where oral NMN changes NAD biology.</li>
          <li>Prospective evidence identifying whether baseline NAD status predicts meaningful clinical response.</li>
          <li>Multi-year safety data in broader and medically complex populations.</li>
          <li>Independent replication of promising subgroup findings such as insulin sensitivity and physical function.</li>
          <li>Better retail-product identity, isomer, potency and contaminant verification.</li>
        </ol>
      </section>

      <section className="card-premium max-w-4xl space-y-4 p-6">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">The Hippie Scientist verdict</h2>
        <p className="text-sm leading-7 text-muted">
          <strong className="text-ink">NMN is biologically active, scientifically interesting, and clinically overmarketed.</strong> Raising NAD is real. A handful of positive functional or metabolic signals are worth following. But the pooled human evidence does not establish broad metabolic rejuvenation, slower aging or longer life. Short-term oral safety looks increasingly reassuring, long-term safety remains uncertain, IV NAD+ anti-aging evidence is remarkably thin, and retail product identity is not guaranteed.<Cite n={1} /><Cite n={2} /><Cite n={11} />
        </p>
      </section>

      <section className="card-premium max-w-4xl space-y-4 p-6">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Frequently asked questions</h2>
        <div className="space-y-3">{FAQS.map((faq) => (<details key={faq.question} className="rounded-xl border border-brand-900/10 bg-brand-50/30 p-4"><summary className="cursor-pointer font-semibold text-ink">{faq.question}</summary><p className="mt-2 text-sm leading-7 text-muted">{faq.answer}</p></details>))}</div>
      </section>

      <References refs={NMN_REFS} />

      <div className="max-w-4xl rounded-xl border border-brand-900/10 bg-brand-50/40 p-4 text-xs leading-6 text-muted">
        <strong className="text-ink">Commercial boundary:</strong> this guide intentionally does not rank retail NMN products. Published assay studies document material label variability, and supplier-specific regulatory filings do not establish equivalence across the market.
      </div>

      <EmailCapture headline="Get evidence reviews like this" description="Longevity claims, current drug developments, and supplement evidence—with biomarkers kept separate from real outcomes." ctaLabel="Get the evidence" location="guide-nmn-supplements" />

      <div className="flex items-center justify-between border-t border-brand-900/10 pt-4"><Link href="/guides/other/" className="text-sm font-bold text-brand-800 hover:underline">← More topic guides</Link><Link href="/guides/other/creatine-brain-health/" className="text-sm font-bold text-brand-800 hover:underline">Creatine brain evidence →</Link></div>
    </div>
  )
}
