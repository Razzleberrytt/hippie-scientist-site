import type { Metadata } from 'next'
import Link from 'next/link'
import { buildPageMetadata } from '../../../../src/lib/seo'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import FAQSchema from '@/components/seo/FAQSchema'
import References from '@/components/References'

export const metadata: Metadata = buildPageMetadata({
  title: 'CagriSema & Cagrilintide: 2026 FDA Status, Weight Loss & Safety',
  description:
    'Current CagriSema/cagrilintide guide: REDEFINE weight-loss results, amylin + GLP-1 mechanism, December 2025 FDA submission, late-2026 decision timing, GI safety, and why gray-market cagrilintide cannot be compounded.',
  path: '/guides/other/cagrisema-cagrilintide/',
  openGraphType: 'article',
})

const FAQS = [
  {
    question: 'Is CagriSema FDA approved?',
    answer:
      'Not yet as of August 15, 2026. Novo Nordisk submitted a U.S. New Drug Application for CagriSema on December 18, 2025 for chronic weight management, and the company says an FDA decision is anticipated by late 2026.',
  },
  {
    question: 'Is cagrilintide FDA approved?',
    answer:
      'No. Cagrilintide is an investigational long-acting amylin analogue. It has been studied alone and as the cagrilintide component of CagriSema, but it is not itself an FDA-approved drug.',
  },
  {
    question: 'Can cagrilintide be compounded?',
    answer:
      'FDA states that cagrilintide cannot be used in compounding under federal law. FDA also states that cagrilintide is not a component of an FDA-approved drug and has not been found safe and effective for any condition.',
  },
  {
    question: 'How much weight loss occurred with CagriSema in REDEFINE 1?',
    answer:
      'In the peer-reviewed 68-week REDEFINE 1 trial, the treatment-policy estimand showed mean weight change of -20.4% with CagriSema versus -3.0% with placebo. Under the trial-product estimand, which estimates the effect if participants stayed on treatment, CagriSema reached -22.7%, versus -16.1% with semaglutide, -11.8% with cagrilintide, and -2.3% with placebo.',
  },
  {
    question: 'Why are there two different CagriSema weight-loss numbers?',
    answer:
      'They come from different estimands. The treatment-policy estimand includes outcomes regardless of treatment discontinuation or rescue, while the trial-product estimand estimates the treatment effect if participants remained on therapy. Comparing 20.4% with 22.7% without naming the estimand creates false disagreement.',
  },
  {
    question: 'Are online cagrilintide or “CagriLean” vials equivalent to trial drug?',
    answer:
      'No equivalence should be assumed. FDA has issued warning letters involving unapproved cagrilintide-containing products and says cagrilintide cannot be compounded under federal law. “Research use only” labeling does not establish human-drug identity, purity, sterility, potency, storage integrity, or trial equivalence.',
  },
] as const

const REFS = [
  {
    n: 1,
    text: 'Garvey WT, et al. Coadministered Cagrilintide and Semaglutide in Adults with Overweight or Obesity. N Engl J Med. 2025;393:635-647. REDEFINE 1. PMID 40544433.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/40544433/',
  },
  {
    n: 2,
    text: 'Davies MJ, et al. Cagrilintide-Semaglutide in Adults with Overweight or Obesity and Type 2 Diabetes. N Engl J Med. 2025;393:648-659. REDEFINE 2. PMID 40544432.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/40544432/',
  },
  {
    n: 3,
    text: 'Novo Nordisk. CagriSema NDA submitted to FDA for chronic weight management, December 18, 2025; late-2026 FDA decision anticipated in subsequent company updates.',
    url: 'https://www.novonordisk.com/news-and-media/news-and-ir-materials/news-details.html?id=916470',
  },
  {
    n: 4,
    text: 'U.S. Food and Drug Administration. FDA’s Concerns with Unapproved GLP-1 Drugs Used for Weight Loss. FDA states cagrilintide and retatrutide cannot be used in compounding under federal law.',
    url: 'https://www.fda.gov/drugs/postmarket-drug-safety-information-patients-and-providers/fdas-concerns-unapproved-glp-1-drugs-used-weight-loss',
  },
  {
    n: 5,
    text: 'FDA Warning Letter: Prime Sciences, March 31, 2026. Cagrilintide products offered online were identified as unapproved new drugs.',
    url: 'https://www.fda.gov/inspections-compliance-enforcement-and-criminal-investigations/warning-letters/prime-sciences-721805-03312026',
  },
  {
    n: 6,
    text: 'Rosenstock J, et al. CagriSema as add-on to basal insulin in adults with type 2 diabetes (REIMAGINE 3). Lancet. 2026;408:38-51. PMID 42251856.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/42251856/',
  },
  {
    n: 7,
    text: 'Aroda VR, et al. CagriSema in adults with type 2 diabetes inadequately controlled on diet and exercise (REIMAGINE 1). Lancet Diabetes Endocrinol. 2026;14:649-661. PMID 42251860.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/42251860/',
  },
  {
    n: 8,
    text: 'Verma S, et al. CagriSema Reduces Blood Pressure in Adults With Overweight or Obesity: REDEFINE 1. Hypertension. 2026. PMID 41328546.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/41328546/',
  },
]

export default function CagriSemaCagrilintidePage() {
  return (
    <div className="container-page space-y-10 py-10">
      <AuthorityJsonLd
        title="CagriSema and Cagrilintide: 2026 FDA Status, Weight Loss and Safety"
        description="Evidence and regulatory review of investigational CagriSema and cagrilintide, including peer-reviewed phase 3 results, current FDA submission status, and compounding restrictions."
        url="https://thehippiescientist.net/guides/other/cagrisema-cagrilintide/"
        type="MedicalWebPage"
        faqItems={[...FAQS]}
        citationUrls={REFS.map((reference) => reference.url)}
      />
      <AuthorityBreadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Guides', href: '/guides/' }, { label: 'CagriSema & Cagrilintide' }]} />
      <FAQSchema pagePath="/guides/other/cagrisema-cagrilintide/" questions={[...FAQS]} />

      <section className="max-w-4xl space-y-5">
        <p className="eyebrow-label">Obesity Drug Watch · Status checked August 15, 2026</p>
        <h1 className="text-4xl font-bold tracking-tight text-ink sm:text-5xl">CagriSema &amp; Cagrilintide: Submitted to FDA Is Not the Same as Approved</h1>
        <p className="text-lg leading-8 text-muted">
          CagriSema combines two different appetite-regulation strategies: semaglutide, a GLP-1 receptor agonist, and cagrilintide, a long-acting amylin analogue. The phase 3 evidence is now substantial and peer reviewed. The regulatory status is still easy to misstate: <strong>Novo Nordisk filed the U.S. CagriSema NDA in December 2025, but CagriSema is not yet FDA approved as of August 15, 2026—and cagrilintide cannot lawfully be used in compounding under federal law.</strong>
        </p>
      </section>

      <section className="rounded-2xl border border-rose-900/15 bg-rose-50/80 p-5 text-sm leading-7 text-rose-950 max-w-4xl">
        <p className="font-semibold">Gray-market / compounding boundary</p>
        <p className="mt-2">
          FDA specifically states that cagrilintide cannot be used in compounding under federal law and has warned sellers marketing unapproved cagrilintide products [4,5]. A product labeled “research use only,” “CagriLean,” or “cagrilintide acetate” is not made equivalent to Novo Nordisk&apos;s trial material by the name on the vial.
        </p>
      </section>

      <section className="card-premium max-w-4xl space-y-4 p-6">
        <p className="eyebrow-label">Regulatory ledger</p>
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Three statuses that should never be collapsed</h2>
        <div className="overflow-x-auto">
          <table className="min-w-[720px] w-full text-sm">
            <thead><tr className="border-b border-brand-900/10"><th className="py-2 pr-4 text-left font-semibold text-ink">Item</th><th className="py-2 pr-4 text-left font-semibold text-ink">August 15, 2026 status</th><th className="py-2 text-left font-semibold text-ink">Meaning</th></tr></thead>
            <tbody className="text-muted">
              <tr className="border-b border-brand-900/5"><td className="py-3 pr-4 font-medium text-ink">CagriSema NDA</td><td className="py-3 pr-4">Submitted Dec. 18, 2025 [3]</td><td className="py-3">FDA review underway; not approval.</td></tr>
              <tr className="border-b border-brand-900/5"><td className="py-3 pr-4 font-medium text-ink">CagriSema obesity use</td><td className="py-3 pr-4">Investigational</td><td className="py-3">Peer-reviewed phase 3 efficacy exists, but no approved U.S. label yet.</td></tr>
              <tr><td className="py-3 pr-4 font-medium text-ink">Compounded cagrilintide</td><td className="py-3 pr-4">Not eligible under federal law [4]</td><td className="py-3">The pending CagriSema application does not create a compounding pathway.</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="card-premium max-w-4xl space-y-4 border-l-4 border-brand-700 bg-brand-50/30 p-6">
        <p className="eyebrow-label">REDEFINE 1</p>
        <h2 className="text-2xl font-semibold tracking-tight text-ink">The two headline weight-loss numbers answer different questions</h2>
        <p className="text-sm leading-7 text-muted">
          REDEFINE 1 randomized <strong>3,417 adults without diabetes</strong> to CagriSema, semaglutide, cagrilintide, or placebo for 68 weeks [1]. Under the treatment-policy estimand—which includes results regardless of treatment discontinuation or rescue—the mean body-weight change was <strong>-20.4% with CagriSema versus -3.0% with placebo</strong> [1].
        </p>
        <p className="text-sm leading-7 text-muted">
          Under the trial-product estimand, which estimates the effect if participants remained on assigned treatment, weight loss was <strong>-22.7% with CagriSema, -16.1% with semaglutide, -11.8% with cagrilintide, and -2.3% with placebo</strong> [1,8]. The 20.4% and 22.7% figures are not contradictory; they come from different estimands.
        </p>
      </section>

      <section className="card-premium max-w-4xl space-y-4 p-6">
        <p className="eyebrow-label">Why the flexible protocol matters</p>
        <h2 className="text-2xl font-semibold tracking-tight text-ink">“Full dose” was not achieved by everyone</h2>
        <p className="text-sm leading-7 text-muted">
          REDEFINE 1 allowed dose modification for tolerability. Novo Nordisk reported that only 57% of CagriSema participants reached the highest dose in the initial topline analysis. That detail is clinically and interpretively important: efficacy reflects the actual flexible-dose trial, not a fictional population in which every participant tolerated the maximum dose.
        </p>
        <p className="text-sm leading-7 text-muted">
          This is also why comparison pages should state the estimand, dose-escalation design, and adherence assumptions before ranking obesity drugs by a single percentage.
        </p>
      </section>

      <section className="card-premium max-w-4xl space-y-4 p-6">
        <p className="eyebrow-label">REDEFINE 2</p>
        <h2 className="text-2xl font-semibold tracking-tight text-ink">The diabetes population had a different result—and should stay a different population</h2>
        <p className="text-sm leading-7 text-muted">
          In REDEFINE 2, 1,206 adults with overweight/obesity and type 2 diabetes were randomized to CagriSema or placebo for 68 weeks [2]. Mean body-weight change under the treatment-policy estimand was <strong>-13.7% with CagriSema versus -3.4% with placebo</strong>. Under the trial-product estimand, Novo reported -15.7% versus -3.1% [2,3].
        </p>
        <p className="text-sm leading-7 text-muted">
          Glycemic control also improved: 73.5% of CagriSema participants reached HbA1c ≤6.5% versus 15.9% with placebo [2]. Those diabetes results should not be mixed numerically with REDEFINE 1 as though the populations were interchangeable.
        </p>
      </section>

      <section className="card-premium max-w-4xl space-y-4 p-6">
        <p className="eyebrow-label">2026 evidence expansion</p>
        <h2 className="text-2xl font-semibold tracking-tight text-ink">The evidence base is moving beyond the original obesity headline</h2>
        <ul className="list-disc space-y-2 pl-5 text-sm leading-7 text-muted">
          <li><strong>Blood pressure:</strong> a 2026 REDEFINE 1 analysis reported a 10.9-mm Hg systolic-blood-pressure reduction with CagriSema under the trial-product estimand [8].</li>
          <li><strong>Anthropometric targets:</strong> a July 2026 post hoc analysis examined the proportion of participants reaching BMI and waist-to-height-ratio targets rather than only percentage weight loss.</li>
          <li><strong>Type 2 diabetes:</strong> REIMAGINE 1 and REIMAGINE 3 added phase 3 evidence for glycemic control in people with type 2 diabetes, including a basal-insulin population [6,7].</li>
        </ul>
        <p className="text-sm leading-7 text-muted">
          These secondary and additional-program results deepen the evidence base, but they do not replace the need for cardiovascular-outcomes data or the FDA&apos;s benefit-risk review.
        </p>
      </section>

      <section className="card-premium max-w-4xl space-y-4 p-6">
        <p className="eyebrow-label">Safety</p>
        <h2 className="text-2xl font-semibold tracking-tight text-ink">GI tolerability is not a footnote</h2>
        <p className="text-sm leading-7 text-muted">
          In REDEFINE 1, gastrointestinal adverse events occurred in <strong>79.6% of CagriSema participants versus 39.9% with placebo</strong>; events including nausea, vomiting, diarrhea, constipation, and abdominal pain were mainly transient and mild to moderate [1]. In REDEFINE 2, GI adverse events occurred in 72.5% versus 34.4% [2].
        </p>
        <p className="text-sm leading-7 text-muted">
          A future approved label may add more precise contraindications, warnings, dose-escalation, and monitoring instructions. Until FDA review is complete, it is premature to copy semaglutide&apos;s label wholesale onto the combination or invent a consumer CagriSema titration protocol.
        </p>
      </section>

      <section className="card-premium max-w-4xl space-y-4 p-6">
        <p className="eyebrow-label">Mechanism boundary</p>
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Amylin + GLP-1 is complementary biology, not a license for supplement analogies</h2>
        <p className="text-sm leading-7 text-muted">
          Cagrilintide is a long-acting analogue of amylin, a pancreatic hormone involved in satiety and appetite regulation. Semaglutide targets the GLP-1 receptor. CagriSema combines the two in one weekly investigational injection.
        </p>
        <p className="text-sm leading-7 text-muted">
          A supplement marketed as “GLP-1 support,” “amylin support,” or an appetite aid is not made pharmacologically comparable by mentioning the same pathway. The clinical effect belongs to the tested molecules, doses, formulation, and trial—not to the pathway label.
        </p>
      </section>

      <section className="card-premium max-w-4xl space-y-4 border-l-4 border-amber-500 bg-amber-50/40 p-6">
        <p className="eyebrow-label">Gray-market identity</p>
        <h2 className="text-2xl font-semibold tracking-tight text-ink">A pending NDA does not validate “research” cagrilintide sellers</h2>
        <p className="text-sm leading-7 text-muted">
          FDA&apos;s March 31, 2026 warning letter to Prime Sciences identified online cagrilintide products as unapproved new drugs [5]. FDA&apos;s broader GLP-1 enforcement page separately states that cagrilintide cannot be used in compounding under federal law [4].
        </p>
        <p className="text-sm leading-7 text-muted">
          That means trial results cannot be transferred to gray-market cagrilintide or “CagriLean” products. Identity, concentration, sterility, formulation, excipients, storage, and dose accuracy are all part of the evidentiary bridge—and that bridge is absent for unapproved online vials.
        </p>
      </section>

      <section className="card-premium max-w-4xl space-y-4 p-6">
        <p className="eyebrow-label">Evidence applicability</p>
        <h2 className="text-2xl font-semibold tracking-tight text-ink">What is established versus pending</h2>
        <div className="overflow-x-auto">
          <table className="min-w-[720px] w-full text-sm">
            <thead><tr className="border-b border-brand-900/10"><th className="py-2 pr-4 text-left font-semibold text-ink">Claim</th><th className="py-2 text-left font-semibold text-ink">Status</th></tr></thead>
            <tbody className="text-muted">
              <tr className="border-b border-brand-900/5"><td className="py-3 pr-4">CagriSema has peer-reviewed phase 3 obesity data</td><td className="py-3"><strong>Yes</strong></td></tr>
              <tr className="border-b border-brand-900/5"><td className="py-3 pr-4">CagriSema has been submitted to FDA for obesity</td><td className="py-3"><strong>Yes</strong> — Dec. 18, 2025</td></tr>
              <tr className="border-b border-brand-900/5"><td className="py-3 pr-4">CagriSema is FDA approved</td><td className="py-3"><strong>No</strong> as of Aug. 15, 2026</td></tr>
              <tr className="border-b border-brand-900/5"><td className="py-3 pr-4">Cagrilintide monotherapy produced weight loss in REDEFINE 1</td><td className="py-3"><strong>Yes</strong>, but it remains investigational</td></tr>
              <tr className="border-b border-brand-900/5"><td className="py-3 pr-4">Cagrilintide can be used in federal-law compounding</td><td className="py-3"><strong>No</strong>, per FDA</td></tr>
              <tr className="border-b border-brand-900/5"><td className="py-3 pr-4">Online cagrilintide is trial-equivalent</td><td className="py-3"><strong>No</strong></td></tr>
              <tr><td className="py-3 pr-4">A supplement can be called a natural CagriSema because it affects appetite pathways</td><td className="py-3"><strong>No</strong></td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="card-premium max-w-4xl space-y-4 p-6">
        <p className="eyebrow-label">What to watch next</p>
        <h2 className="text-2xl font-semibold tracking-tight text-ink">The page should change when the regulatory state changes</h2>
        <ol className="list-decimal space-y-2 pl-5 text-sm leading-7 text-muted">
          <li>The FDA decision on the December 2025 obesity NDA, anticipated later in 2026.</li>
          <li>The final U.S. label, if approved: indication, contraindications, warnings, dose escalation, and maintenance dose.</li>
          <li>REDEFINE 3 cardiovascular-outcomes results.</li>
          <li>Higher-dose and REDEFINE 11 data exploring additional weight-loss potential.</li>
          <li>More mature REIMAGINE data in type 2 diabetes.</li>
          <li>Whether cagrilintide monotherapy progresses to a separate regulatory application.</li>
        </ol>
      </section>

      <section className="card-premium max-w-4xl space-y-4 p-6">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Bottom line</h2>
        <p className="text-sm leading-7 text-muted">
          CagriSema is a serious late-stage obesity therapy with strong peer-reviewed efficacy evidence and an FDA application already under review. That makes regulatory precision more—not less—important. <strong>Submitted is not approved; CagriSema is not cagrilintide monotherapy; and neither the NDA nor the trial results legalize or validate gray-market cagrilintide.</strong>
        </p>
      </section>

      <References refs={REFS} />
      <div className="max-w-4xl rounded-xl border border-rose-900/15 bg-rose-50/70 p-4 text-xs leading-6 text-rose-950">
        <strong>No purchase links:</strong> CagriSema and cagrilintide remain investigational in the U.S., and FDA states cagrilintide cannot be used in compounding under federal law. This guide does not provide sourcing, reconstitution, or self-dosing instructions.
      </div>
      <div className="flex items-center justify-between border-t border-brand-900/10 pt-4">
        <Link href="/guides/other/" className="text-sm font-bold text-brand-800 hover:underline">← More topic guides</Link>
        <div className="flex gap-4">
          <Link href="/guides/other/semaglutide/" className="text-sm font-bold text-brand-800 hover:underline">Semaglutide →</Link>
          <Link href="/guides/other/retatrutide/" className="text-sm font-bold text-brand-800 hover:underline">Retatrutide →</Link>
        </div>
      </div>
    </div>
  )
}
