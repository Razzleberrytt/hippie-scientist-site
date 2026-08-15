import type { Metadata } from 'next'
import Link from 'next/link'
import { buildPageMetadata } from '../../../../src/lib/seo'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import FAQSchema from '@/components/seo/FAQSchema'
import References from '@/components/References'

export const metadata: Metadata = buildPageMetadata({
  title: 'Orforglipron (Foundayo): FDA Approval, Weight Loss & Safety (2026)',
  description:
    'Current 2026 guide to Foundayo (orforglipron): FDA approval, ATTAIN-1 weight-loss results, oral small-molecule GLP-1 differences, marketed-vs-trial dose caveat, warnings, and maintenance evidence.',
  path: '/guides/other/orforglipron-foundayo/',
  openGraphType: 'article',
})

const FAQS = [
  {
    question: 'Is orforglipron FDA approved?',
    answer:
      'Yes. FDA approved Foundayo (orforglipron) on April 1, 2026, together with reduced-calorie diet and increased physical activity, to reduce excess body weight and maintain weight reduction long term in adults with obesity or adults with overweight plus at least one weight-related comorbidity.',
  },
  {
    question: 'Is orforglipron an oral GLP-1?',
    answer:
      'Yes. Orforglipron is an oral small-molecule, nonpeptide GLP-1 receptor agonist. FDA describes Foundayo as a GLP-1 receptor partial-agonist pill that is taken once daily and does not need to be taken on an empty stomach.',
  },
  {
    question: 'How much weight loss occurred in ATTAIN-1?',
    answer:
      'In the 72-week phase 3 ATTAIN-1 trial, the treatment-regimen estimand showed mean body-weight changes of -7.5%, -8.4%, and -11.2% with the three orforglipron trial regimens versus -2.1% with placebo. The trial enrolled 3,127 adults with obesity and without diabetes.',
  },
  {
    question: 'Why are the ATTAIN-1 milligram doses different from the approved Foundayo doses?',
    answer:
      'The published ATTAIN-1 paper reports pre-approval trial regimens of 6, 12, and 36 mg, while FDA’s April 2026 approval announcement describes the marketed Foundayo titration using different strengths. The trial milligram numbers should therefore not be copied into a post-approval dosing schedule; current prescribing information controls clinical use.',
  },
  {
    question: 'Can Foundayo be taken with another GLP-1 drug?',
    answer:
      'FDA states that Foundayo should not be used in combination with another GLP-1 receptor agonist. Medication changes or switching should be handled by the prescribing clinician rather than by combining products.',
  },
  {
    question: 'Is orforglipron the same as semaglutide?',
    answer:
      'No. Both act at the GLP-1 receptor, but orforglipron is a nonpeptide small molecule and semaglutide is a peptide drug. They have different products, pharmacology, trial programs, labeling, and administration requirements.',
  },
] as const

const ORFORGLIPRON_REFS = [
  {
    n: 1,
    text: 'U.S. Food and Drug Administration. FDA Approves First New Molecular Entity Under National Priority Voucher Program: Foundayo (orforglipron). April 1, 2026.',
    url: 'https://www.fda.gov/news-events/press-announcements/fda-approves-first-new-molecular-entity-under-national-priority-voucher-program',
  },
  {
    n: 2,
    text: 'Wharton S, et al. Orforglipron, an Oral Small-Molecule GLP-1 Receptor Agonist for Obesity Treatment. N Engl J Med. 2025;393:1796-1806. ATTAIN-1. PMID 40960239.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/40960239/',
  },
  {
    n: 3,
    text: 'Aronne LJ, et al. Orforglipron for maintenance of body weight reduction: the double-blind, randomized phase 3b ATTAIN-MAINTAIN trial. Nat Med. 2026;32:2679-2687. PMID 42120723.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/42120723/',
  },
  {
    n: 4,
    text: 'Rosenstock J, et al. Orforglipron, an Oral Small-Molecule GLP-1 Receptor Agonist, in Early Type 2 Diabetes. N Engl J Med. 2025.',
    url: 'https://www.nejm.org/doi/full/10.1056/NEJMoa2505669',
  },
]

export default function OrforglipronFoundayoPage() {
  return (
    <div className="container-page space-y-10 py-10">
      <AuthorityJsonLd
        title="Orforglipron (Foundayo): FDA Approval, Weight Loss and Safety"
        description="Current evidence and regulatory review of the newly approved oral small-molecule GLP-1 receptor agonist Foundayo (orforglipron)."
        url="https://thehippiescientist.net/guides/other/orforglipron-foundayo/"
        type="MedicalWebPage"
        faqItems={[...FAQS]}
        citationUrls={ORFORGLIPRON_REFS.map((reference) => reference.url)}
      />
      <AuthorityBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Guides', href: '/guides/' },
          { label: 'Orforglipron (Foundayo)' },
        ]}
      />
      <FAQSchema pagePath="/guides/other/orforglipron-foundayo/" questions={[...FAQS]} />

      <section className="max-w-4xl space-y-5">
        <p className="eyebrow-label">New Drug Evidence · Regulatory status checked August 15, 2026</p>
        <h1 className="text-4xl font-bold tracking-tight text-ink sm:text-5xl">
          Orforglipron (Foundayo): The Newly Approved Oral Small-Molecule GLP-1
        </h1>
        <p className="text-lg leading-8 text-muted">
          Foundayo (orforglipron) moved from “promising weight-loss pill” headlines to an FDA-approved obesity drug on <strong>April 1, 2026</strong>. The important story is not simply that it is oral: it is a nonpeptide small-molecule GLP-1 receptor agonist, its approved product differs from the pre-approval trial regimen, and the 2026 evidence now includes a post-injectable weight-maintenance trial as well as the pivotal obesity program.
        </p>
      </section>

      <section className="rounded-2xl border border-brand-900/10 bg-brand-50/50 p-5 text-sm leading-7 text-muted max-w-4xl">
        <p className="font-semibold text-ink">Regulatory snapshot</p>
        <p className="mt-2">
          FDA approved Foundayo for long-term weight reduction/maintenance in indicated adults with obesity or overweight plus a weight-related condition, alongside reduced-calorie diet and increased physical activity [1]. FDA describes it as a once-daily GLP-1 receptor partial-agonist pill that <strong>does not need to be taken on an empty stomach</strong> [1].
        </p>
      </section>

      <section className="card-premium max-w-4xl space-y-4 p-6">
        <p className="eyebrow-label">Why this drug is different</p>
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Oral does not mean “oral semaglutide in a different bottle”</h2>
        <p className="text-sm leading-7 text-muted">
          Orforglipron is a <strong>small-molecule, nonpeptide</strong> GLP-1 receptor agonist [2]. That distinguishes it structurally from peptide GLP-1 drugs such as semaglutide. The shared receptor target does not make the products interchangeable.
        </p>
        <div className="overflow-x-auto">
          <table className="min-w-[700px] w-full text-sm">
            <thead>
              <tr className="border-b border-brand-900/10"><th className="py-2 pr-4 text-left font-semibold text-ink">Feature</th><th className="py-2 pr-4 text-left font-semibold text-ink">Orforglipron</th><th className="py-2 text-left font-semibold text-ink">Why it matters</th></tr>
            </thead>
            <tbody className="text-muted">
              <tr className="border-b border-brand-900/5"><td className="py-3 pr-4 font-medium text-ink">Molecular type</td><td className="py-3 pr-4">Nonpeptide small molecule</td><td className="py-3">Different formulation/manufacturing profile from peptide GLP-1 drugs</td></tr>
              <tr className="border-b border-brand-900/5"><td className="py-3 pr-4 font-medium text-ink">Route</td><td className="py-3 pr-4">Oral tablet</td><td className="py-3">No injection</td></tr>
              <tr className="border-b border-brand-900/5"><td className="py-3 pr-4 font-medium text-ink">Food timing</td><td className="py-3 pr-4">FDA says it need not be taken on an empty stomach [1]</td><td className="py-3">Important practical distinction from some oral peptide formulations</td></tr>
              <tr><td className="py-3 pr-4 font-medium text-ink">Approved April 2026?</td><td className="py-3 pr-4">Yes</td><td className="py-3">Pre-approval articles are now stale on regulatory status</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="card-premium max-w-4xl space-y-4 border-l-4 border-brand-700 bg-brand-50/30 p-6">
        <p className="eyebrow-label">ATTAIN-1</p>
        <h2 className="text-2xl font-semibold tracking-tight text-ink">What the pivotal obesity trial actually found</h2>
        <p className="text-sm leading-7 text-muted">
          ATTAIN-1 randomized <strong>3,127 adults with obesity and without diabetes</strong> to one of three orforglipron trial regimens or placebo for 72 weeks, alongside diet and physical-activity intervention [2].
        </p>
        <div className="overflow-x-auto">
          <table className="min-w-[650px] w-full text-sm">
            <thead><tr className="border-b border-brand-900/10"><th className="py-2 pr-4 text-left font-semibold text-ink">Trial group</th><th className="py-2 text-left font-semibold text-ink">Mean body-weight change at 72 weeks</th></tr></thead>
            <tbody className="text-muted">
              <tr className="border-b border-brand-900/5"><td className="py-3 pr-4">6 mg trial regimen</td><td className="py-3">-7.5%</td></tr>
              <tr className="border-b border-brand-900/5"><td className="py-3 pr-4">12 mg trial regimen</td><td className="py-3">-8.4%</td></tr>
              <tr className="border-b border-brand-900/5"><td className="py-3 pr-4">36 mg trial regimen</td><td className="py-3">-11.2%</td></tr>
              <tr><td className="py-3 pr-4">Placebo</td><td className="py-3">-2.1%</td></tr>
            </tbody>
          </table>
        </div>
        <p className="text-sm leading-7 text-muted">
          In the 36 mg trial group, 54.6% lost at least 10% of body weight, 36.0% lost at least 15%, and 18.4% lost at least 20%, versus 12.9%, 5.9%, and 2.8% with placebo [2]. Gastrointestinal adverse events were the most common, and treatment discontinuation due to adverse events increased with the trial dose [2].
        </p>
      </section>

      <section className="card-premium max-w-4xl space-y-4 border-l-4 border-amber-500 bg-amber-50/40 p-6">
        <p className="eyebrow-label">Fast-moving-content trap</p>
        <h2 className="text-2xl font-semibold tracking-tight text-ink">The published trial doses are not the current marketed titration schedule</h2>
        <p className="text-sm leading-7 text-muted">
          ATTAIN-1 was published using 6, 12, and 36 mg regimens [2]. FDA&apos;s April 2026 approval announcement describes the marketed Foundayo titration using <strong>different strengths</strong> [1].
        </p>
        <p className="text-sm leading-7 text-muted">
          That means an article that simply copies ATTAIN-1 milligram values into a “how to take Foundayo” section is stale or wrong. This guide deliberately does not reconstruct the prescription titration. Current labeling and the prescriber—not a pre-approval trial table—control clinical dosing.
        </p>
      </section>

      <section className="card-premium max-w-4xl space-y-4 p-6">
        <p className="eyebrow-label">2026 maintenance evidence</p>
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Switching after injectable weight loss is now a studied question—but not fully settled</h2>
        <p className="text-sm leading-7 text-muted">
          The 2026 ATTAIN-MAINTAIN phase 3b trial enrolled participants who had previously received tirzepatide or semaglutide during SURMOUNT-5 and then randomized them to orforglipron or placebo [3]. Orforglipron preserved a larger share of the prior weight reduction than placebo over the following year [3].
        </p>
        <p className="text-sm leading-7 text-muted">
          The important limitation is easy to miss: the study did <strong>not</strong> include a group that simply continued the injectable obesity medication, and follow-up was one year [3]. It therefore supports a maintenance-after-switch research strategy, not a claim that switching is equivalent or superior to staying on an injectable.
        </p>
      </section>

      <section className="card-premium max-w-4xl space-y-4 p-6">
        <p className="eyebrow-label">Current safety label</p>
        <h2 className="text-2xl font-semibold tracking-tight text-ink">The “pill instead of a shot” framing can understate GLP-1-class risks</h2>
        <p className="text-sm leading-7 text-muted">
          FDA lists common adverse effects including nausea, constipation, diarrhea, vomiting, dyspepsia, abdominal pain, headache, fatigue, reflux, gas, and hair loss [1]. The label also carries warnings/precautions for pancreatitis, severe gastrointestinal reactions, acute kidney injury due to volume depletion, hypoglycemia, hypersensitivity, diabetic retinopathy in patients with type 2 diabetes, acute gallbladder disease, and pulmonary aspiration during general anesthesia or deep sedation [1].
        </p>
        <p className="text-sm leading-7 text-muted">
          Foundayo has a boxed warning for thyroid C-cell tumors and should not be used in people with a personal or family history of medullary thyroid carcinoma or Multiple Endocrine Neoplasia syndrome type 2 [1]. FDA also states that it should <strong>not be used with another GLP-1 receptor agonist</strong> [1].
        </p>
      </section>

      <section className="card-premium max-w-4xl space-y-4 p-6">
        <p className="eyebrow-label">Comparison integrity</p>
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Do not turn separate trials into a fake oral-vs-injectable ranking</h2>
        <p className="text-sm leading-7 text-muted">
          ATTAIN-1 demonstrates clinically meaningful weight loss versus placebo [2]. It does not directly establish that Foundayo is “X% as strong” as Wegovy or Zepbound. Cross-trial comparisons differ in population, estimand, dose escalation, adherence, duration, and background care.
        </p>
        <p className="text-sm leading-7 text-muted">
          A fair comparison page should separate <strong>direct head-to-head evidence</strong> from <strong>cross-trial context</strong>. Until a direct randomized comparison exists for the question being asked, numerical rankings should be labeled as indirect.
        </p>
      </section>

      <section className="card-premium max-w-4xl space-y-4 p-6">
        <p className="eyebrow-label">Supplement boundary</p>
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Berberine is not a “natural Foundayo”</h2>
        <p className="text-sm leading-7 text-muted">
          The approval of an oral small-molecule GLP-1 does not make supplement marketing that uses “GLP-1 support” language equivalent to GLP-1 pharmacotherapy. Foundayo is a defined FDA-approved receptor agonist with phase 3 trials and prescription labeling [1,2]. Berberine and other supplements have different evidence bases, product-quality controls, mechanisms, and effect sizes.
        </p>
        <p className="text-sm leading-7 text-muted">
          See the <Link href="/guides/other/berberine-weight-loss/" className="font-semibold text-brand-800 hover:underline">berberine weight-loss evidence review</Link> for a comparison-integrity approach that keeps those categories separate.
        </p>
      </section>

      <section className="card-premium max-w-4xl space-y-4 p-6">
        <p className="eyebrow-label">Evidence applicability</p>
        <h2 className="text-2xl font-semibold tracking-tight text-ink">What is established as of August 15, 2026?</h2>
        <div className="overflow-x-auto">
          <table className="min-w-[700px] w-full text-sm">
            <thead><tr className="border-b border-brand-900/10"><th className="py-2 pr-4 text-left font-semibold text-ink">Claim</th><th className="py-2 text-left font-semibold text-ink">Status</th></tr></thead>
            <tbody className="text-muted">
              <tr className="border-b border-brand-900/5"><td className="py-3 pr-4">Foundayo is FDA approved for chronic weight management in indicated adults</td><td className="py-3"><strong>Yes</strong></td></tr>
              <tr className="border-b border-brand-900/5"><td className="py-3 pr-4">It is an oral nonpeptide small-molecule GLP-1 receptor agonist</td><td className="py-3"><strong>Yes</strong></td></tr>
              <tr className="border-b border-brand-900/5"><td className="py-3 pr-4">It requires fasting administration</td><td className="py-3"><strong>No</strong>, per FDA approval announcement</td></tr>
              <tr className="border-b border-brand-900/5"><td className="py-3 pr-4">The ATTAIN-1 trial dose table is the marketed titration schedule</td><td className="py-3"><strong>No</strong></td></tr>
              <tr className="border-b border-brand-900/5"><td className="py-3 pr-4">It can be stacked with another GLP-1 receptor agonist</td><td className="py-3"><strong>No</strong>, FDA says not to combine</td></tr>
              <tr className="border-b border-brand-900/5"><td className="py-3 pr-4">Switching from an injectable to orforglipron has randomized maintenance data</td><td className="py-3"><strong>Yes</strong>, but without a continued-injectable comparator</td></tr>
              <tr><td className="py-3 pr-4">It is proven superior to injectable semaglutide or tirzepatide</td><td className="py-3"><strong>No</strong></td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="card-premium max-w-4xl space-y-4 p-6">
        <p className="eyebrow-label">Questions worth tracking</p>
        <h2 className="text-2xl font-semibold tracking-tight text-ink">The next evidence edges</h2>
        <ol className="list-decimal space-y-2 pl-5 text-sm leading-7 text-muted">
          <li>How does Foundayo compare head-to-head with injectable obesity drugs?</li>
          <li>How durable is weight maintenance over multiple years?</li>
          <li>What happens after Foundayo discontinuation?</li>
          <li>How do real-world adherence and persistence compare with weekly injections?</li>
          <li>Which patients prefer and sustain oral therapy enough to offset differences in average trial efficacy?</li>
          <li>What do future cardiovascular-outcome and other indication-specific trials show?</li>
          <li>How will postmarketing safety data change the benefit-risk picture?</li>
        </ol>
      </section>

      <section className="card-premium max-w-4xl space-y-4 p-6">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Bottom line</h2>
        <p className="text-sm leading-7 text-muted">
          Orforglipron is no longer an “upcoming” weight-loss pill: Foundayo is an FDA-approved 2026 obesity medication. The competitive content edge is staying post-approval accurate—using the current label, keeping ATTAIN-1 trial doses separate from marketed titration, showing the 2026 maintenance trial with its comparator limitation, and resisting fake cross-trial rankings against injectable GLP-1 drugs.
        </p>
      </section>

      <References refs={ORFORGLIPRON_REFS} />

      <div className="max-w-4xl rounded-xl border border-brand-900/10 bg-brand-50/40 p-4 text-xs leading-6 text-muted">
        <strong className="text-ink">Prescription boundary:</strong> this page is an evidence and regulatory review. It intentionally does not provide a self-start titration, switching schedule, combination protocol, or source for prescription medication.
      </div>

      <div className="flex items-center justify-between border-t border-brand-900/10 pt-4">
        <Link href="/guides/other/" className="text-sm font-bold text-brand-800 hover:underline">← More topic guides</Link>
        <div className="flex gap-4">
          <Link href="/guides/other/semaglutide/" className="text-sm font-bold text-brand-800 hover:underline">Semaglutide →</Link>
          <Link href="/guides/other/tirzepatide/" className="text-sm font-bold text-brand-800 hover:underline">Tirzepatide →</Link>
        </div>
      </div>
    </div>
  )
}
