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
  title: 'NMN Supplements: 2026 Evidence, NAD+ Claims & FDA Status',
  description:
    '2026 NMN evidence review: NAD+ biomarker increases versus actual anti-aging outcomes, 24-week safety data, null metabolic meta-analysis results, IV NAD+ evidence gaps, FDA NDI 1444, and product-quality testing.',
  path: '/guides/other/nmn-supplements/',
  openGraphType: 'article',
})

const FAQS = [
  {
    question: 'Does NMN extend human lifespan?',
    answer:
      'No human trial has shown that NMN extends lifespan. Human studies mainly measure NAD-related biomarkers and shorter-term metabolic, vascular, physical-function, or safety outcomes. A 2026 systematic review found clear biological target engagement but inconclusive clinical effectiveness for anti-aging or wellness outcomes.',
  },
  {
    question: 'Does NMN reliably improve metabolic health?',
    answer:
      'Not broadly. A July 2026 meta-analysis of 15 randomized trials found no significant effect on body weight, BMI, fasting glucose, HbA1c, lipid profiles, or systolic blood pressure. A small diastolic-blood-pressure change and a nonsignificant HOMA-IR trend were considered preliminary signals rather than established metabolic benefits.',
  },
  {
    question: 'Does raising NAD+ prove that NMN slows aging?',
    answer:
      'No. Raising NAD-related metabolites shows biochemical target engagement. It does not by itself establish slower biological aging, fewer age-related diseases, longer healthspan, or longer lifespan.',
  },
  {
    question: 'How long has oral NMN been studied in randomized trials?',
    answer:
      'The July 2026 randomized-trial meta-analysis included studies lasting from 14 days to 24 weeks. That improves short-term tolerability evidence but still does not establish multi-year safety or longevity benefit.',
  },
  {
    question: 'Do NAD+ IV infusions have anti-aging evidence?',
    answer:
      'A 2026 systematic review found no eligible clinical-outcomes trials of intravenous or intramuscular NAD+ itself for anti-aging or wellness indications. One nonrandomized IV NMN study mainly contributed short-term safety and biomarker information.',
  },
  {
    question: 'What is NMN’s FDA status in 2026?',
    answer:
      'FDA’s current New Dietary Ingredient database lists beta-NMN / NMN notification 1444 from Effepharm with a January 28, 2026 response. An NDI notification or response is not FDA drug approval and should not be generalized to every NMN product, supplier, formulation, dose, or claim.',
  },
  {
    question: 'Are commercial NMN products accurately labeled?',
    answer:
      'Not always. A published analysis of 18 NMN products found active-ingredient amounts ranging from 28.6% above label claim to products with no detectable NMN. A newer analytical study of eight commercial products also found substantial variation in alpha/beta NMN isomer composition and undeclared or inaccurately labeled ingredients.',
  },
] as const

const NMN_REFS = [
  {
    n: 1,
    text: 'Gallagher C, Emmanuel OO. NAD+ supplementation for anti-aging and wellness: A PRISMA-guided systematic review of preclinical and clinical evidence. Ageing Res Rev. 2026;116:103057. PMID 41655607.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/41655607/',
  },
  {
    n: 2,
    text: 'Yang W, et al. Safety and Metabolism-Related Outcomes of Oral Nicotinamide Mononucleotide Supplementation in Adults: A Systematic Review and Meta-Analysis. Nutrients. 2026;18(14):2251. PMID 42514320.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/42514320/',
  },
  {
    n: 3,
    text: 'Vinten KT, et al. NAD+ precursor supplementation in human ageing: clinical evidence and challenges. Nat Metab. 2025;7:1974-1990. PMID 41083806.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/41083806/',
  },
  {
    n: 4,
    text: 'Efficacy of oral nicotinamide mononucleotide supplementation on glucose and lipid metabolism for adults: systematic review and meta-analysis of 12 studies / 513 participants. PMID 39116016.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/39116016/',
  },
  {
    n: 5,
    text: 'Sandalova E, et al. Testing the amount of nicotinamide mononucleotide and urolithin A as compared to the label claim. GeroScience. 2024;46:5075-5083. PMID 38935229.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/38935229/',
  },
  {
    n: 6,
    text: 'Aqueous LC-MS/MS quantification of alpha-/beta-nicotinamide mononucleotide in dietary supplements using a pentabromophenyl column. Applied to eight commercial NMN products. PMID 41545110.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/41545110/',
  },
  {
    n: 7,
    text: 'U.S. Food and Drug Administration. Submitted 75-Day Premarket Notifications for New Dietary Ingredients. Current database lists NDI 1444, beta-nicotinamide mononucleotide (beta-NMN) or NMN, with FDA response dated January 28, 2026.',
    url: 'https://www.fda.gov/food/new-dietary-ingredient-ndi-notification-process/submitted-75-day-premarket-notifications-new-dietary-ingredients',
  },
  {
    n: 8,
    text: 'U.S. Food and Drug Administration. Information for Consumers on Using Dietary Supplements. FDA does not approve dietary supplements for safety and effectiveness before marketing.',
    url: 'https://www.fda.gov/food/dietary-supplements/information-consumers-using-dietary-supplements',
  },
]

export default function NMNGuidePage() {
  return (
    <div className="container-page space-y-10 py-10">
      <AuthorityJsonLd
        title="NMN Supplements: 2026 Evidence, NAD+ Claims and FDA Status"
        description="Evidence-calibrated review separating NAD biomarker changes from clinical anti-aging outcomes, with current safety, regulatory, IV-infusion, and product-quality context."
        url="https://thehippiescientist.net/guides/other/nmn-supplements/"
        type="MedicalWebPage"
        faqItems={[...FAQS]}
        citationUrls={NMN_REFS.map((reference) => reference.url)}
      />
      <AuthorityBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Guides', href: '/guides/' },
          { label: 'NMN Supplements' },
        ]}
      />
      <FAQSchema pagePath="/guides/other/nmn-supplements/" questions={[...FAQS]} />

      <section className="max-w-4xl space-y-5">
        <p className="eyebrow-label">Longevity Evidence Review · Updated August 15, 2026</p>
        <h1 className="text-4xl font-bold tracking-tight text-ink sm:text-5xl">
          NMN and NAD+: The Biomarker Works. The Anti-Aging Claim Is Still Unproven.
        </h1>
        <p className="text-lg leading-8 text-muted">
          Nicotinamide mononucleotide (NMN) is one of the clearest examples of a supplement where <strong>biological activity is real but the consumer conclusion often outruns the human outcomes</strong>. Oral NMN and related NAD+ precursors can raise circulating NAD-related metabolites. That does not yet prove slower aging, longer healthspan, prevention of age-related disease, or longer life.
        </p>
        <figure className="mt-6">
          <div className="overflow-hidden rounded-2xl border border-brand-900/10 bg-white shadow-sm">
            <Image src="/images/guides/nmn-supplements.jpg" alt="Longevity supplement capsules in a glass jar on a laboratory surface" width={1536} height={1024} priority className="h-auto w-full" />
          </div>
          <figcaption className="mt-3 text-center text-sm text-muted">Target engagement is not the same endpoint as healthspan or lifespan.</figcaption>
        </figure>
      </section>

      <section className="card-premium max-w-4xl space-y-4 p-6">
        <p className="eyebrow-label">2026 evidence bottom line</p>
        <h2 className="text-2xl font-semibold tracking-tight text-ink">The newest broad review makes the biomarker-versus-benefit gap explicit</h2>
        <p className="text-sm leading-7 text-muted">
          A 2026 PRISMA-guided review identified <strong>113 intervention studies</strong>: 33 human studies (28 randomized and five nonrandomized) plus 80 rodent studies [1]. In humans, oral NMN and nicotinamide riboside consistently showed biochemical target engagement and were generally tolerated over weeks to months.
        </p>
        <p className="text-sm leading-7 text-muted">
          But functional, metabolic, vascular, and other healthspan-relevant outcomes were <strong>heterogeneous and often null or endpoint-specific</strong> [1]. The review concluded that biological activity is clear while clinical effectiveness for anti-aging or wellness remains inconclusive.
        </p>
      </section>

      <section className="card-premium max-w-4xl space-y-5 border-l-4 border-brand-700 bg-brand-50/30 p-6">
        <p className="eyebrow-label">Evidence translation</p>
        <h2 className="text-2xl font-semibold tracking-tight text-ink">A four-step ladder competitors often collapse into one claim</h2>
        <div className="overflow-x-auto">
          <table className="min-w-[760px] w-full text-sm">
            <thead><tr className="border-b border-brand-900/10"><th className="py-2 pr-4 text-left font-semibold text-ink">Evidence step</th><th className="py-2 pr-4 text-left font-semibold text-ink">NMN status</th><th className="py-2 text-left font-semibold text-ink">What it means</th></tr></thead>
            <tbody className="text-muted">
              <tr className="border-b border-brand-900/5 align-top"><td className="py-3 pr-4 font-medium text-ink">1. Raises NAD-related biomarkers</td><td className="py-3 pr-4"><strong>Supported</strong></td><td className="py-3">The compound reaches a measurable biological target.</td></tr>
              <tr className="border-b border-brand-900/5 align-top"><td className="py-3 pr-4 font-medium text-ink">2. Improves a physiological measure</td><td className="py-3 pr-4"><strong>Mixed / endpoint-specific</strong></td><td className="py-3">Some small trials report signals; many pooled metabolic outcomes are null.</td></tr>
              <tr className="border-b border-brand-900/5 align-top"><td className="py-3 pr-4 font-medium text-ink">3. Improves healthspan / disease outcomes</td><td className="py-3 pr-4"><strong>Not established</strong></td><td className="py-3">No validated broad anti-aging clinical effect has been shown.</td></tr>
              <tr className="align-top"><td className="py-3 pr-4 font-medium text-ink">4. Extends human lifespan</td><td className="py-3 pr-4"><strong>No evidence</strong></td><td className="py-3">No human lifespan trial demonstrates this.</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="card-premium max-w-4xl space-y-4 p-6">
        <p className="eyebrow-label">July 2026 meta-analysis</p>
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Short-term tolerability looks better established than broad metabolic efficacy</h2>
        <p className="text-sm leading-7 text-muted">
          The newest randomized-trial meta-analysis included <strong>15 trials</strong>, with 10 contributing to safety analyses. Trial durations ranged from <strong>14 days to 24 weeks</strong> [2]. NMN did not significantly increase overall adverse events, serious adverse events, withdrawals due to adverse events, system-specific adverse events, ALT, or AST in the pooled short-term data [2].
        </p>
        <p className="text-sm leading-7 text-muted">
          On efficacy, the same review found <strong>no significant effect on body weight, BMI, fasting glucose, HbA1c, lipid profiles, or systolic blood pressure</strong> [2]. A small diastolic-blood-pressure reduction and a nonsignificant HOMA-IR trend were preliminary signals—not proof of broad metabolic rejuvenation.
        </p>
      </section>

      <section className="card-premium max-w-4xl space-y-4 p-6">
        <p className="eyebrow-label">Metabolic claim calibration</p>
        <h2 className="text-2xl font-semibold tracking-tight text-ink">One elegant positive trial is not a replicated treatment effect</h2>
        <p className="text-sm leading-7 text-muted">
          Individual NMN trials have produced interesting metabolic findings. But when outcomes are pooled across the broader evidence base, the picture becomes much less convincing. A 12-study / 513-participant meta-analysis found that NMN significantly raised blood NAD levels while most clinically relevant glucose and lipid outcomes were not significantly different from control [4].
        </p>
        <p className="text-sm leading-7 text-muted">
          Seven studies had some risk-of-bias concerns and five were judged high risk; the authors explicitly warned that benefits may be exaggerated [4]. That is why this page no longer labels insulin-sensitivity effects “moderate evidence” based mainly on one small subgroup trial.
        </p>
      </section>

      <section className="card-premium max-w-4xl space-y-4 border-l-4 border-amber-500 bg-amber-50/40 p-6">
        <p className="eyebrow-label">IV NAD+ reality check</p>
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Clinic availability is far ahead of outcomes evidence</h2>
        <p className="text-sm leading-7 text-muted">
          NAD+ IV infusions are widely marketed in wellness settings, but the 2026 systematic review found <strong>no eligible clinical-outcomes trials of intravenous or intramuscular NAD+ itself for anti-aging or wellness indications</strong> [1].
        </p>
        <p className="text-sm leading-7 text-muted">
          One nonrandomized intravenous NMN study mainly contributed short-term safety and biomarker information. An IV NAD+ pharmacokinetic pilot was contextual evidence only because it lacked eligible clinical outcomes [1]. “Raises a marker after an infusion” and “improves healthspan” are not interchangeable claims.
        </p>
      </section>

      <section className="card-premium max-w-4xl space-y-4 p-6">
        <p className="eyebrow-label">Human-aging assumption</p>
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Even “NAD+ always falls with age” is more complicated in humans than in diagrams</h2>
        <p className="text-sm leading-7 text-muted">
          A 2025 Nature Metabolism review notes that consistent evidence for an age-related decline in NAD+ in humans exists only across a limited number of studies and that tissue-specific human data remain sparse [3]. Rodent biology is valuable for mechanism discovery, but it should not be treated as a direct map of whole-body human NAD dynamics.
        </p>
        <p className="text-sm leading-7 text-muted">
          The longevity sales pitch often stacks assumptions: age lowers NAD → raising NAD reverses the deficit → reversing the deficit reverses aging. Each arrow needs human outcome evidence. They are not one proven chain.
        </p>
      </section>

      <section className="card-premium max-w-4xl space-y-4 p-6">
        <p className="eyebrow-label">2026 FDA / NDI snapshot</p>
        <h2 className="text-2xl font-semibold tracking-tight text-ink">The U.S. regulatory story changed again—so avoid frozen 2022 summaries</h2>
        <p className="text-sm leading-7 text-muted">
          FDA&apos;s current New Dietary Ingredient database lists <strong>NDI 1444</strong> for beta-nicotinamide mononucleotide (beta-NMN) / NMN submitted by Effepharm on November 17, 2025, with an FDA response dated <strong>January 28, 2026</strong> [7]. That is a material development after the earlier NMN regulatory dispute.
        </p>
        <p className="text-sm leading-7 text-muted">
          The careful interpretation is product- and filing-specific. An NDI filing or response is <strong>not FDA drug approval</strong>, does not prove anti-aging efficacy, and should not be generalized to every NMN supplier, salt, isomer, formulation, dose, or label claim. FDA also emphasizes that it does not approve dietary supplements for safety and effectiveness before marketing [8].
        </p>
      </section>

      <section className="card-premium max-w-4xl space-y-4 p-6">
        <p className="eyebrow-label">Product-quality moat</p>
        <h2 className="text-2xl font-semibold tracking-tight text-ink">“NMN” on the bottle does not guarantee the studied ingredient is inside</h2>
        <p className="text-sm leading-7 text-muted">
          A published analysis tested <strong>18 commercial NMN supplements</strong>. Measured active ingredient ranged from <strong>28.6% above label claim to 100% below claim</strong>—meaning some products had no detectable NMN [5].
        </p>
        <p className="text-sm leading-7 text-muted">
          A newer analytical paper developed an LC-MS/MS method that separates alpha- and beta-NMN and applied it to eight commercial products. The authors found substantial variation in isomer composition, including undeclared or inaccurately labeled ingredients [6]. Research generally concerns a defined chemical identity, not any powder sold under the same three-letter acronym.
        </p>
      </section>

      <section className="card-premium max-w-4xl space-y-4 p-6">
        <p className="eyebrow-label">Dose and testing boundaries</p>
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Trial exposure is not a validated longevity protocol</h2>
        <p className="text-sm leading-7 text-muted">
          The 2026 meta-analysis included oral trial exposures from 250 to 2,000 mg/day and durations from 14 days to 24 weeks [2]. Those ranges describe the research literature. They do not establish a universal “effective dose,” a start-and-titrate plan, or a threshold above which longevity benefits appear.
        </p>
        <p className="text-sm leading-7 text-muted">
          Likewise, there is no validated consumer blood-NAD target shown to correspond to slower aging or longer life. A biomarker can be measurable without being a proven treatment target.
        </p>
      </section>

      <section className="card-premium max-w-4xl space-y-4 p-6">
        <p className="eyebrow-label">Evidence applicability</p>
        <h2 className="text-2xl font-semibold tracking-tight text-ink">What the current evidence does and does not support</h2>
        <div className="overflow-x-auto">
          <table className="min-w-[720px] w-full text-sm">
            <thead><tr className="border-b border-brand-900/10"><th className="py-2 pr-4 text-left font-semibold text-ink">Claim</th><th className="py-2 text-left font-semibold text-ink">2026 status</th></tr></thead>
            <tbody className="text-muted">
              <tr className="border-b border-brand-900/5"><td className="py-3 pr-4">Oral NMN can raise NAD-related biomarkers</td><td className="py-3"><strong>Supported</strong></td></tr>
              <tr className="border-b border-brand-900/5"><td className="py-3 pr-4">NMN broadly improves glucose/lipid/weight outcomes</td><td className="py-3"><strong>Not established</strong></td></tr>
              <tr className="border-b border-brand-900/5"><td className="py-3 pr-4">NMN slows human biological aging</td><td className="py-3"><strong>Not established</strong></td></tr>
              <tr className="border-b border-brand-900/5"><td className="py-3 pr-4">NMN extends human lifespan</td><td className="py-3"><strong>No evidence</strong></td></tr>
              <tr className="border-b border-brand-900/5"><td className="py-3 pr-4">Oral short-term tolerability is reasonably characterized</td><td className="py-3"><strong>Increasingly supported</strong>, up to 24 weeks in the 2026 trial synthesis</td></tr>
              <tr className="border-b border-brand-900/5"><td className="py-3 pr-4">Multi-year safety is established</td><td className="py-3"><strong>No</strong></td></tr>
              <tr className="border-b border-brand-900/5"><td className="py-3 pr-4">IV NAD+ has anti-aging clinical-outcomes evidence</td><td className="py-3"><strong>No eligible outcomes trials in the 2026 systematic review</strong></td></tr>
              <tr className="border-b border-brand-900/5"><td className="py-3 pr-4">Every commercial NMN bottle matches its label</td><td className="py-3"><strong>No</strong></td></tr>
              <tr><td className="py-3 pr-4">An FDA NDI response equals FDA approval of NMN anti-aging claims</td><td className="py-3"><strong>No</strong></td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="card-premium max-w-4xl space-y-4 p-6">
        <p className="eyebrow-label">Unanswered questions worth tracking</p>
        <h2 className="text-2xl font-semibold tracking-tight text-ink">The next evidence edges are clinical, not merely biochemical</h2>
        <ol className="list-decimal space-y-2 pl-5 text-sm leading-7 text-muted">
          <li>Do multi-year NMN trials improve validated healthspan endpoints rather than just NAD metabolites?</li>
          <li>Which tissues actually experience meaningful NAD restoration after oral supplementation?</li>
          <li>Does baseline NAD status predict who responds clinically?</li>
          <li>Is there any validated NAD biomarker threshold tied to a patient-important outcome?</li>
          <li>Can metabolic signals from small subgroups replicate in larger, lower-bias trials?</li>
          <li>What is the long-term safety profile in medically complex populations?</li>
          <li>Do IV NAD+ clinics produce any durable patient-important benefit beyond transient biomarker changes?</li>
          <li>How often do retail products match the beta-NMN identity and amount used in human research?</li>
        </ol>
      </section>

      <section className="card-premium max-w-4xl space-y-4 p-6">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Bottom line</h2>
        <p className="text-sm leading-7 text-muted">
          NMN is biologically active and increasingly well studied for a longevity supplement. That is exactly why the standard should now be higher. In 2026, the defensible conclusion is: <strong>NAD target engagement is real; broad metabolic benefit is not established; anti-aging and lifespan efficacy remain unproven; short-term safety data are growing but multi-year safety is unknown; IV NAD+ outcomes evidence is strikingly thin; and commercial product identity can be unreliable.</strong>
        </p>
      </section>

      <References refs={NMN_REFS} />

      <div className="max-w-4xl rounded-xl border border-brand-900/10 bg-brand-50/40 p-4 text-xs leading-6 text-muted">
        <strong className="text-ink">Commercial boundary:</strong> because NMN has a complicated and evolving U.S. regulatory history and published product-assay studies show substantial label variability, this guide intentionally does not rank or recommend retail NMN products. A supplier-specific NDI filing does not establish equivalence across the market.
      </div>

      <EmailCapture headline="Get evidence reviews like this" description="Longevity claims, current drug developments, and supplement evidence—with biomarkers kept separate from real outcomes." ctaLabel="Get the evidence" location="guide-nmn-supplements" />

      <div className="flex items-center justify-between border-t border-brand-900/10 pt-4">
        <Link href="/guides/other/" className="text-sm font-bold text-brand-800 hover:underline">← More topic guides</Link>
        <Link href="/guides/other/creatine-brain-health/" className="text-sm font-bold text-brand-800 hover:underline">Creatine brain evidence →</Link>
      </div>
    </div>
  )
}
