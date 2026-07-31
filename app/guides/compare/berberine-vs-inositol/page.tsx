import type { Metadata } from 'next'
import Link from 'next/link'

import { buildPageMetadata } from '../../../../src/lib/seo'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import CitationReadySummary from '@/components/seo/CitationReadySummary'
import FAQSchema from '@/components/seo/FAQSchema'
import References from '@/components/References'
import AffiliateDisclosure from '../../../../components/AffiliateDisclosure'
import Disclaimer from '../../../../src/components/Disclaimer'

// Both queries this page targets ("berberine vs inositol", "inositol vs berberine")
// were landing on /guides/compare/berberine-vs-metformin/ via a redirect — a page
// about a different comparison entirely.
export const metadata: Metadata = buildPageMetadata({
  title: 'Berberine vs Inositol: Which Is Better for Blood Sugar?',
  description:
    'Berberine and inositol both improve insulin sensitivity by different mechanisms. Which fits blood sugar, which fits PCOS, how they dose, and where the evidence is strongest.',
  path: '/guides/compare/berberine-vs-inositol/',
})

// Berberine references are the vetted set already cited on the berberine-vs-metformin
// page. Inositol references are the PMIDs carried in the site's own claims registry
// (public/data/claims.json) for the inositol / myo-inositol profiles.
const BERBERINE_VS_INOSITOL_REFS = [
  {
    n: 1,
    text: 'Yin J, et al. (2012). Efficacy of berberine in patients with type 2 diabetes. Metabolism, 57(5): 712-717.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/18442639/',
  },
  {
    n: 2,
    text: 'Lan J, et al. (2015). Meta-analysis of berberine in the treatment of type 2 diabetes. J Ethnopharmacol, 161: 69-81.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/25498346/',
  },
  {
    n: 3,
    text: 'Guo Y, et al. (2012). Repeated administration of berberine inhibits cytochromes P450. Eur J Pharmacol, 685(1-3): 116-122.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/21575678/',
  },
  {
    n: 4,
    text: 'Systematic review and meta-analysis of inositol in polycystic ovary syndrome and related metabolic outcomes (PubMed 29498933).',
    url: 'https://pubmed.ncbi.nlm.nih.gov/29498933/',
  },
  {
    n: 5,
    text: 'Systematic review of myo-inositol and D-chiro-inositol in metabolic and hormonal outcomes (PubMed 34078260).',
    url: 'https://pubmed.ncbi.nlm.nih.gov/34078260/',
  },
]

const COMPARISON_ROWS = [
  {
    dimension: 'Primary mechanism',
    berberine: 'AMPK activation; reduces hepatic glucose output and improves peripheral glucose uptake.',
    inositol: 'Acts as a second messenger in the insulin signalling pathway rather than acting on AMPK.',
  },
  {
    dimension: 'Strongest evidence base',
    berberine: 'Type 2 diabetes and general glycaemic control, in RCTs and meta-analysis.',
    inositol: 'Polycystic ovary syndrome and its associated insulin resistance, in RCT meta-analysis.',
  },
  {
    dimension: 'Typical study duration',
    berberine: 'Mostly under three months; long-term outcome data are not available.',
    inositol: 'Commonly three to six months in PCOS trials.',
  },
  {
    dimension: 'Tolerability',
    berberine: 'Gastrointestinal effects are the most commonly reported adverse events.',
    inositol: 'Generally well tolerated; mild GI upset, sleepiness, or dizziness at high intakes.',
  },
  {
    dimension: 'Drug-interaction load',
    berberine:
      'Meaningful. Repeated dosing inhibited CYP2D6, CYP2C9, and CYP3A4, and a clinical cyclosporine interaction is documented.',
    inositol: 'Low. May affect blood-glucose control in diabetes or hypoglycaemia.',
  },
  {
    dimension: 'Key contraindications',
    berberine:
      'Pregnancy, breastfeeding, and infants — berberine can displace bilirubin and poses a kernicterus risk.',
    inositol:
      'Bipolar disorder without clinician supervision; pregnancy safety data are insufficient given a theoretical uterine-contraction risk at high doses.',
  },
]

export default function BerberineVsInositolPage() {
  return (
    <div className="container-page space-y-10 py-10">
      <AuthorityJsonLd
        title="Berberine vs Inositol"
        description="Evidence-graded comparison of berberine and inositol for insulin sensitivity, blood sugar, and PCOS-related metabolic outcomes."
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
          These two get compared because both improve insulin sensitivity, but they are not
          interchangeable. They act through different pathways, their evidence bases sit in
          different populations, and they carry very different interaction risk. The useful question
          is not which is stronger — it is which one matches your situation.
        </p>
      </section>

      <CitationReadySummary
        answer="Berberine and inositol both support insulin sensitivity, but through different mechanisms and with evidence concentrated in different populations. Berberine activates AMPK and has its strongest evidence in type 2 diabetes glycaemic control, with meta-analysis support but mostly short trials and no long-term outcome data. Inositol acts as a second messenger in insulin signalling and has its strongest evidence in polycystic ovary syndrome and the insulin resistance associated with it. Berberine carries a substantially higher drug-interaction burden."
        bestFor={[
          'Berberine: blood-sugar and lipid support in insulin resistance or the prediabetes range, for someone not on interacting medication.',
          'Inositol: PCOS-associated insulin resistance, or where a low interaction burden and better tolerability matter more than maximal glycaemic effect.',
          'Neither as a substitute for prescribed diabetes medication without clinician oversight.',
        ]}
        evidenceLevel="Berberine has multiple positive RCTs and a meta-analysis in type 2 diabetes, but trials are mostly under three months with no cardiovascular or mortality endpoints. Inositol has RCT meta-analysis support in PCOS; evidence outside PCOS and metabolic outcomes is thinner."
        safetyNote="Berberine inhibited CYP2D6, CYP2C9, and CYP3A4 on repeated human dosing and has a documented clinical cyclosporine interaction; it is contraindicated in pregnancy, breastfeeding, and infants. Inositol can trigger manic episodes in bipolar disorder and should only be used under clinician supervision in that population. Either may affect blood-glucose control in people already treating diabetes."
        notClaiming="This page is not claiming either supplement treats diabetes or PCOS, or that either can replace prescribed medication."
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
            fasting glucose and HbA1c.<sup>[1][2]</sup> The catch is duration and interaction load:
            most trials run under three months, so there is no evidence about long-term outcomes,
            and repeated dosing inhibits several cytochrome P450 enzymes, which matters for anyone
            on regular medication.<sup>[3]</sup>
          </p>
          <p>
            <span className="font-semibold text-ink">Inositol</span> has its strongest support in
            polycystic ovary syndrome, where meta-analysis of randomised trials covers insulin
            resistance and hormonal outcomes.<sup>[4][5]</sup> It is generally better tolerated and
            carries far less interaction risk. Its evidence is narrower — it is well studied in PCOS
            and metabolic contexts, and thinner elsewhere.
          </p>
          <p>
            If the goal is blood sugar and there is no PCOS context, berberine has the more relevant
            evidence. If the context is PCOS-associated insulin resistance, or if tolerability and
            drug interactions are the binding constraint, inositol is the better-matched option.
            Anyone already on diabetes medication should treat either as a conversation to have with
            a clinician rather than a decision to make alone.
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
                Insulin signalling role, PCOS and metabolic evidence, dosing, and safety context.
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
              'For blood sugar specifically, berberine has the more direct evidence — randomised trials and a meta-analysis in type 2 diabetes report reductions in fasting glucose and HbA1c. Inositol’s strongest evidence sits in polycystic ovary syndrome and the insulin resistance associated with it, rather than in general glycaemic control.',
          },
          {
            question: 'Can you take berberine and inositol together?',
            answer:
              'They act through different pathways, so combining them is not mechanistically contradictory, but there is little trial evidence for the combination and both can affect blood-glucose control. Anyone on diabetes medication, or on drugs metabolised by CYP3A4, CYP2D6, or CYP2C9, should review the combination with a clinician before starting.',
          },
          {
            question: 'Which one is safer?',
            answer:
              'Inositol has the lower risk profile for most people: it is generally well tolerated and carries far less drug-interaction burden. Berberine inhibits several cytochrome P450 enzymes on repeated dosing and is contraindicated in pregnancy, breastfeeding, and infants. Inositol should only be used under clinician supervision by people with bipolar disorder.',
          },
          {
            question: 'Which is better for PCOS?',
            answer:
              'Inositol. Its randomised-trial and meta-analysis evidence is concentrated in polycystic ovary syndrome and the insulin resistance associated with it, which is not the population berberine has been most studied in.',
          },
        ]}
      />

      <div className="space-y-3">
        <AffiliateDisclosure />
        <Disclaimer />
      </div>

      <References refs={BERBERINE_VS_INOSITOL_REFS} />
    </div>
  )
}
