import type { Metadata } from 'next'
import Link from 'next/link'

import { buildPageMetadata } from '../../../../lib/seo'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import CitationReadySummary from '@/components/seo/CitationReadySummary'
import FAQSchema from '@/components/seo/FAQSchema'
import References from '@/components/References'
import AffiliateDisclosure from '../../../../components/AffiliateDisclosure'
import Disclaimer from '../../../../components/Disclaimer'

// Both queries this page targets ("berberine vs inositol", "inositol vs berberine")
// were landing on /guides/compare/berberine-vs-metformin/ via a redirect — a page
// about a different comparison entirely.
export const metadata: Metadata = buildPageMetadata({
  title: 'Berberine vs Inositol: Which Is Better for Blood Sugar?',
  description:
    'Compare berberine blood-sugar studies with uncertain inositol evidence in PCOS, including trial limitations, medication interactions, and safety.',
  path: '/guides/compare/berberine-vs-inositol/',
})

// Every citation is matched to its actual publication identity and study type.
// Previous inositol references 29498933 and 34078260 were misidentified as
// reviews. Neither is a PCOS systematic review; see editorial correction below.
const BERBERINE_VS_INOSITOL_REFS = [
  {
    n: 1,
    text: 'Yin J, Xing H, Ye J. (2008). Efficacy of berberine in patients with type 2 diabetes mellitus. Metabolism, 57(5): 712-717.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/18442638/',
  },
  {
    n: 2,
    text: 'Lan J, et al. (2015). Meta-analysis of berberine in the treatment of type 2 diabetes. J Ethnopharmacol, 161: 69-81.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/25498346/',
  },
  {
    n: 3,
    text: 'Guo Y, et al. (2012). Repeated administration of berberine inhibits cytochromes P450 in humans. Eur J Clin Pharmacol, 68(2): 213-217.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/21870106/',
  },
  {
    n: 4,
    text: 'Fitz V, et al. (2024). Inositol for Polycystic Ovary Syndrome: A Systematic Review and Meta-analysis to Inform the 2023 Update of the International Evidence-based PCOS Guidelines. J Clin Endocrinol Metab, 109(6): 1630-1655. The evidence was limited and inconclusive.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/38163998/',
  },
  {
    n: 5,
    text: 'Teede HJ, et al. (2023). Recommendations from the 2023 International Evidence-based Guideline for the Assessment and Management of Polycystic Ovary Syndrome. Inositol benefits for clinical outcomes remain limited or uncertain.',
    url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10477934/',
  },
]

const COMPARISON_ROWS = [
  {
    dimension: 'Primary mechanism',
    berberine: 'Laboratory and human studies suggest metabolic pathways including AMPK; mechanistic findings do not establish long-term clinical outcomes.',
    inositol: 'Inositols participate in cell signalling, including insulin-related pathways; a plausible mechanism does not prove clinical benefit.',
  },
  {
    dimension: 'Strongest evidence base',
    berberine: 'Short-term type 2 diabetes trials and a meta-analysis, with uncertainty about long-term safety and outcomes.',
    inositol: 'PCOS randomized trials and a 2024 systematic review; overall benefits remain limited and inconclusive.',
  },
  {
    dimension: 'Typical study duration',
    berberine: 'Short-term trials dominate; cardiovascular and long-term clinical outcomes are not established.',
    inositol: 'Varied regimens and durations; current PCOS guidelines cannot recommend a specific type or dose.',
  },
  {
    dimension: 'Tolerability',
    berberine: 'Gastrointestinal effects occur; adverse-event reporting across trials is incomplete.',
    inositol: 'Some comparisons suggest fewer gastrointestinal effects than metformin, but adverse-event reporting is incomplete.',
  },
  {
    dimension: 'Drug-interaction load',
    berberine:
      'Meaningful. Repeated dosing inhibited CYP2D6, CYP2C9, and CYP3A4, and a clinical cyclosporine interaction is documented.',
    inositol: 'Less well characterized; review any supplement use alongside glucose-lowering medication with a clinician.',
  },
  {
    dimension: 'Key contraindications',
    berberine:
      'Avoid in pregnancy, breastfeeding, and infants; medication and glucose-lowering interactions require clinical review.',
    inositol:
      'Do not use as an unproven fertility therapy or replace prescribed PCOS care; pregnancy and medication decisions need clinician guidance.',
  },
]

function InlineReferences({ numbers }: { numbers: number[] }) {
  return (
    <sup className="ml-0.5 whitespace-nowrap">
      {numbers.map((number) => (
        <a
          key={number}
          href={`#ref-${number}`}
          aria-label={`Jump to reference ${number}`}
          className="underline underline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          [{number}]
        </a>
      ))}
    </sup>
  )
}

export default function BerberineVsInositolPage() {
  return (
    <div className="container-page space-y-10 py-10">
      <AuthorityJsonLd
        title="Berberine vs Inositol"
        description="Berberine has short-term glucose trials; inositol evidence for PCOS remains limited and inconclusive. Compare trial quality, safety, and interactions."
        url="https://thehippiescientist.net/guides/compare/berberine-vs-inositol/"
        type="Article"
      />

      <AuthorityBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Compare', href: '/guides/compare/' },
          { label: 'Berberine vs Inositol' },
        ]}
      />

      <section className="max-w-4xl space-y-5">
        <p className="eyebrow-label">Educational Comparison · Metabolic Cluster</p>
        <h1 className="text-4xl font-bold tracking-tight text-ink sm:text-5xl">
          Berberine vs Inositol: Which Is Better for Blood Sugar?
        </h1>
        <p className="text-lg leading-8 text-muted">
          These supplements are often marketed for blood-sugar or PCOS-related outcomes, but their evidence is not equivalent. Berberine has short-term studies in type 2 diabetes, while inositol has been studied in PCOS with mixed and inconclusive clinical results. Neither replaces recommended treatment, and no study cited here establishes which one is better in a head-to-head trial.
        </p>
      </section>

      <CitationReadySummary
        answer="Berberine has short-term human evidence for blood-glucose outcomes in type 2 diabetes, but medication interactions and missing long-term outcome data matter. Inositol has been studied in PCOS; a 2024 systematic review and the 2023 international guideline conclude that clinical benefits are limited or uncertain. No cited trial directly compares the two for diabetes or PCOS."
        bestFor={[
          'Berberine: short-term glycaemic findings in selected type 2 diabetes studies; interaction and safety limits must be reviewed.',
          'Inositol: a PCOS research topic with limited and inconclusive clinical outcomes, not a proven first-line therapy.',
          'Neither is a substitute for prescribed diabetes or PCOS treatment, and combining them is not established as safe or effective.',
        ]}
        evidenceLevel="Berberine evidence includes short-term trials and a meta-analysis, without established long-term clinical outcomes. A verified 2024 inositol PCOS review pooled some randomized trials but rated overall clinical benefits as limited and inconclusive."
        safetyNote="Berberine inhibited CYP2D6, CYP2C9, and CYP3A4 in a human interaction study and may raise risk when combined with other medications, including glucose-lowering drugs. People with diabetes, PCOS, or pregnancy-related concerns should discuss supplements with their clinician. Safety evidence for inositol remains incomplete."
        notClaiming="This page is not claiming inositol reliably improves insulin resistance, ovulation, or fertility in PCOS; nor that berberine can replace prescribed diabetes medication. The cited studies do not directly compare the two."
        referencesHref="#references"
      />

      <section className="card-premium p-6 sm:p-8">
        <h2 className="text-2xl font-semibold text-ink">Side by side</h2>
        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-brand-900/10">
                <th className="py-3 pr-4 text-xs font-bold uppercase tracking-wider text-ink">
                  Dimension
                </th>
                <th className="py-3 pr-4 text-xs font-bold uppercase tracking-wider text-ink">
                  Berberine
                </th>
                <th className="py-3 text-xs font-bold uppercase tracking-wider text-ink">
                  Inositol
                </th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON_ROWS.map((row) => (
                <tr
                  key={row.dimension}
                  className="border-b border-brand-900/5 align-top last:border-0"
                >
                  <td className="py-3 pr-4 font-semibold text-ink">{row.dimension}</td>
                  <td className="py-3 pr-4 text-muted">{row.berberine}</td>
                  <td className="py-3 text-muted">{row.inositol}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card-premium space-y-4 p-6 sm:p-8">
        <h2 className="text-2xl font-semibold text-ink">Where each one has the better case</h2>
        <div className="space-y-4 text-sm leading-7 text-muted">
          <p>
            <span className="font-semibold text-ink">Berberine</span> has the more direct glycaemic
            evidence. Randomised trials and a meta-analysis in type 2 diabetes report reductions in
            fasting glucose and HbA1c.<InlineReferences numbers={[1, 2]} /> The catch is duration and interaction load:
            most trials run under three months, so there is no evidence about long-term outcomes,
            and repeated dosing inhibits several cytochrome P450 enzymes, which matters for anyone
            on regular medication.<InlineReferences numbers={[3]} />
          </p>
          <p>
            <span className="font-semibold text-ink">Inositol</span> has been evaluated in PCOS trials,
            but a 2024 systematic review found the evidence limited and inconclusive. The 2023
            international guideline notes possible improvements in selected metabolic measures,
            without established clinical benefits or a recommended formulation and dose.<InlineReferences numbers={[4, 5]} />
            This does not prove that it treats insulin resistance, restores ovulation, or improves
            fertility for an individual patient.
          </p>
          <p>
            The two compounds have not been tested directly against each other in the studies cited
            here. Berberine should not be used to replace glucose-lowering medication, and the
            uncertainty around inositol means it should not be presented as a proven PCOS treatment.
            Both warrant a clinician conversation when glucose-lowering therapy or fertility care
            is involved, particularly because adding berberine can increase hypoglycaemia risk.
          </p>
        </div>
      </section>

      <section className="card-premium space-y-4 p-6 sm:p-8">
        <h2 className="text-2xl font-semibold text-ink">Read the full profiles</h2>
        <ul className="grid gap-3 sm:grid-cols-2">
          <li>
            <Link
              href="/compounds/berberine/"
              className="block rounded-2xl border border-brand-900/10 bg-white/70 p-4 transition hover:border-brand-700/20 hover:bg-white hover:shadow-sm dark:border-white/10 dark:bg-white/5"
            >
              <span className="font-semibold text-brand-800 dark:text-brand-100">Berberine →</span>
              <span className="mt-2 block text-xs leading-relaxed text-muted">
                Mechanism, RCT data, dosing, interaction detail, and safety context.
              </span>
            </Link>
          </li>
          <li>
            <Link
              href="/compounds/inositol/"
              className="block rounded-2xl border border-brand-900/10 bg-white/70 p-4 transition hover:border-brand-700/20 hover:bg-white hover:shadow-sm dark:border-white/10 dark:bg-white/5"
            >
              <span className="font-semibold text-brand-800 dark:text-brand-100">Inositol →</span>
              <span className="mt-2 block text-xs leading-relaxed text-muted">
                Insulin signalling, uncertain PCOS trial outcomes, and safety limitations.
              </span>
            </Link>
          </li>
          <li>
            <Link
              href="/guides/compare/berberine-vs-metformin/"
              className="block rounded-2xl border border-brand-900/10 bg-white/70 p-4 transition hover:border-brand-700/20 hover:bg-white hover:shadow-sm dark:border-white/10 dark:bg-white/5"
            >
              <span className="font-semibold text-brand-800 dark:text-brand-100">
                Berberine vs Metformin →
              </span>
              <span className="mt-2 block text-xs leading-relaxed text-muted">
                How berberine compares against the first-line prescription option.
              </span>
            </Link>
          </li>
          <li>
            <Link
              href="/guides/compare/"
              className="block rounded-2xl border border-brand-900/10 bg-white/70 p-4 transition hover:border-brand-700/20 hover:bg-white hover:shadow-sm dark:border-white/10 dark:bg-white/5"
            >
              <span className="font-semibold text-brand-800 dark:text-brand-100">
                All comparisons →
              </span>
              <span className="mt-2 block text-xs leading-relaxed text-muted">
                Every head-to-head comparison on the site.
              </span>
            </Link>
          </li>
        </ul>
      </section>

      <FAQSchema
        pagePath="/guides/compare/berberine-vs-inositol/"
        questions={[
          {
            question: 'Is berberine or inositol better for blood sugar?',
            answer:
              'Berberine has short-term type 2 diabetes trials, while the overall evidence for inositol in PCOS is limited and inconclusive. These are different populations, not a direct comparison; do not replace prescribed treatment.',
          },
          {
            question: 'Can you take berberine and inositol together?',
            answer:
              'There is insufficient direct evidence to establish that combining them is effective or safe. Berberine can interact with medicines metabolized by CYP3A4, CYP2D6, or CYP2C9 and may increase hypoglycaemia risk when added to glucose-lowering treatment. Consult a clinician before combining them.',
          },
          {
            question: 'Which one is safer?',
            answer:
              'Berberine has documented human CYP enzyme interactions and important pregnancy and infant precautions. Inositol has fewer reported gastrointestinal adverse effects than metformin in some studies, but broader safety and adverse-event reporting remain incomplete. Neither is automatically safe alongside prescriptions.',
          },
          {
            question: 'Which is better for PCOS?',
            answer:
              'There is not enough reliable evidence to rank inositol ahead of other recommended PCOS treatments. A 2024 systematic review found inositol evidence limited and inconclusive, and the 2023 guideline considers its infertility use experimental.',
          },
        ]}
      />

      <section className="card-premium space-y-3 p-6" aria-labelledby="citation-correction">
        <h2 id="citation-correction" className="text-xl font-semibold text-ink">Editorial citation correction · October 2026</h2>
        <p className="text-sm leading-7 text-muted">
          Earlier versions of this page incorrectly described PMID 29498933 (a publication combining a large uncontrolled fertility cohort, a small prospective randomized IVF comparison of 29 patients with PCOS, and a literature review) and PMID 34078260 (a ten-man hormone pilot) as systematic reviews supporting PCOS metabolic claims. Both have been removed as support for those broad claims. The 29-person randomized arm compared myo-inositol plus folic acid with placebo in an IVF setting, not berberine or general PCOS metabolic treatment; its small size and narrow endpoints cannot establish comparative efficacy or replace a systematic evidence assessment. The first paper includes an author affiliated with Exeltis, and the second includes an author employed by Lo.Li. Pharma; these relevant affiliations were not previously disclosed.
        </p>
        <p className="text-sm leading-7 text-muted">
          The replacement sources below are the actual 2024 systematic review and the 2023 international evidence-based PCOS guideline. Their cautious findings, rather than the earlier inaccurate source labels, govern this comparison.
        </p>
      </section>

      <div className="space-y-3">
        <AffiliateDisclosure />
        <Disclaimer />
      </div>

      <References refs={BERBERINE_VS_INOSITOL_REFS} />
    </div>
  )
}
