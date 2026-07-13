import type { Metadata } from 'next'
import Image from 'next/image'
import { buildPageMetadata } from '../../../../src/lib/seo'

export const metadata: Metadata = buildPageMetadata({
  title: 'Berberine vs Metformin',
  description: 'Berberine vs metformin for blood sugar: evidence-graded comparison of efficacy, safety, drug interactions, and clinical context for metabolic health.',
  path: '/guides/compare/berberine-vs-metformin/',
})

import Link from 'next/link'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import AffiliateDisclosure from '../../../../components/AffiliateDisclosure'
import { EnhancedEmailCapture } from '@/components/monetization/EnhancedEmailCapture'
import FAQSchema from '@/components/seo/FAQSchema'
import { RelatedDiscoveryWidget } from '@/components/monetization/RelatedDiscoveryWidget'
import RecommendationSection from '@/components/RecommendationSection'
import { getRevenueProductSet } from '@/config/revenue-products'
import ConversionStickyCTA from '@/components/conversion-sticky-cta'
import References from '@/components/References'

const BERBERINE_VS_METFORMIN_REFS = [
  { n: 1, text: 'Zhang H, et al. (2008). Berberine lowers blood glucose in type 2 diabetes patients. J Clin Endocrinol Metab, 93(7): 2559-2565.', url: 'https://pubmed.ncbi.nlm.nih.gov/18397984/' },
  { n: 2, text: 'Yin J, et al. (2012). Efficacy of berberine in patients with type 2 diabetes. Metabolism, 57(5): 712-717.', url: 'https://pubmed.ncbi.nlm.nih.gov/18442639/' },
  { n: 3, text: 'UKPDS Group. (1998). Intensive blood-glucose control with metformin on complications in overweight patients with type 2 diabetes. Lancet, 352(9131): 854-865.', url: 'https://pubmed.ncbi.nlm.nih.gov/9742977/' },
  { n: 4, text: 'Lan J, et al. (2015). Meta-analysis of berberine in the treatment of type 2 diabetes. J Ethnopharmacol, 161: 69-81.', url: 'https://pubmed.ncbi.nlm.nih.gov/25498346/' },
  { n: 5, text: 'Guo Y, et al. (2012). Repeated administration of berberine inhibits cytochromes P450. Eur J Pharmacol, 685(1-3): 116-122.', url: 'https://pubmed.ncbi.nlm.nih.gov/21575678/' },
  { n: 6, text: 'Dong H, et al. (2012). Berberine in the treatment of type 2 diabetes mellitus: a systemic review and meta-analysis. Evid Based Complement Alternat Med, 2012: 591654.', url: 'https://pubmed.ncbi.nlm.nih.gov/23118793/' },
  { n: 7, text: 'Imenshahidi M, Hosseinzadeh H. (2019). Berberine and barberry: pharmacological effects and clinical uses. Phytother Res, 33(3): 504-523.', url: 'https://pubmed.ncbi.nlm.nih.gov/30637820/' },
]

export default function BerberineVsMetforminPage() {
  const berberineProducts = getRevenueProductSet('berberine')?.products ?? []

  return (
    <div className="container-page py-10 space-y-10">
      <AuthorityJsonLd
        title="Berberine vs Metformin"
        description="Evidence-graded comparison of berberine and metformin for blood sugar management, insulin resistance, and metabolic health. Mechanisms, RCT data, safety, cost, and when to use each.
      "
        url="https://thehippiescientist.net/guides/compare/berberine-vs-metformin"
        type="Article"
      />

      <AuthorityBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Compare', href: '/compare' },
          { label: 'Berberine vs Metformin' },
        ]}
      />

      {/* Hero */}
      <section className="space-y-5 max-w-4xl">
        <p className="eyebrow-label">Educational Comparison · Metabolic Cluster</p>
        <h1 className="text-5xl font-bold tracking-tight text-ink">
          Berberine vs Metformin: Is "Nature's Metformin" Actually Comparable?
        </h1>
        <p className="text-lg leading-8 text-muted">
          Both activate AMPK, both reduce hepatic glucose production, and short-term RCTs show
          comparable glycemic outcomes. But metformin has 60+ years of population-scale safety data
          and proven cardiovascular outcomes. Berberine is a legitimate OTC metabolic support option —
          not a pharmaceutical substitute. Neither should be switched without clinician guidance.
        </p>

        {/* Evidence tier badges */}
        <div className="flex flex-wrap gap-3 pt-1">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 border border-green-200 px-3 py-1 text-xs font-semibold text-green-800">
            Berberine — Evidence Grade: B
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200 px-3 py-1 text-xs font-semibold text-blue-800">
            Metformin — Evidence Grade: A
          </span>
        </div>

        <figure className="mt-6">
          <div className="overflow-hidden rounded-2xl border border-brand-900/10 shadow-sm bg-white">
            <Image
              src="/images/guides/berberine-vs-metformin.jpg"
              alt="Berberine supplement capsules beside metformin-style tablets"
              width={1536}
              height={1024}
              priority
              className="w-full h-auto"
            />
          </div>
          <figcaption className="mt-3 text-center text-sm text-muted">
            Berberine vs metformin — what the metabolic evidence actually says.
          </figcaption>
        </figure>
      </section>

      {/* Overview cards */}
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="card-premium p-6 space-y-4">
          <p className="eyebrow-label">Plant Alkaloid · OTC</p>
          <h2 className="text-3xl font-semibold tracking-tight text-ink">Berberine</h2>
          <p className="text-sm leading-7 text-muted">
            Isoquinoline alkaloid found in barberry, goldenseal, and Oregon grape. Primary action:
            AMPK activation — the same upstream target as metformin. Also modulates the gut microbiome,
            inhibits PTP1B, and upregulates GLUT4. Available OTC; typically dosed 500mg three times daily.
          </p>
          <Link href="/compounds/berberine/" className="chip-readable">Explore Berberine</Link>
        </div>

        <div className="card-premium p-6 space-y-4">
          <p className="eyebrow-label">Biguanide · Prescription</p>
          <h2 className="text-3xl font-semibold tracking-tight text-ink">Metformin</h2>
          <p className="text-sm leading-7 text-muted">
            First-line pharmacological treatment for type 2 diabetes since the 1990s. Reduces hepatic
            gluconeogenesis via AMPK and mitochondrial Complex I inhibition. Backed by landmark trials
            including the UKPDS, with proven cardiovascular outcome data over decades.
            Requires a prescription.
          </p>
        </div>
      </section>

      {/* Fast decision table */}
      <section className="card-premium p-6 space-y-5 max-w-5xl">
        <p className="eyebrow-label">Fast Decision</p>
        <h2 className="text-3xl font-semibold tracking-tight text-ink">Which one makes sense for you?</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm text-left">
            <thead className="text-ink">
              <tr className="border-b border-black/10">
                <th className="py-3 pr-4 font-semibold">Factor</th>
                <th className="py-3 pr-4 font-semibold">Berberine</th>
                <th className="py-3 pr-4 font-semibold">Metformin</th>
              </tr>
            </thead>
            <tbody className="text-muted">
              <tr className="border-b border-black/10">
                <td className="py-3 pr-4 font-medium text-ink">Primary mechanism</td>
                <td className="py-3 pr-4">AMPK activation, gut microbiome, GLUT4 upregulation</td>
                <td className="py-3 pr-4">AMPK activation, hepatic gluconeogenesis inhibition</td>
              </tr>
              <tr className="border-b border-black/10">
                <td className="py-3 pr-4 font-medium text-ink">Evidence grade</td>
                <td className="py-3 pr-4">B — multiple RCTs, smaller scale, shorter duration</td>
                <td className="py-3 pr-4">A — decades of large trials, outcomes data</td>
              </tr>
              <tr className="border-b border-black/10">
                <td className="py-3 pr-4 font-medium text-ink">Best fit</td>
                <td className="py-3 pr-4">Prediabetes, insulin resistance, metabolic support OTC</td>
                <td className="py-3 pr-4">Diagnosed T2D, PCOS, metabolic syndrome (Rx)</td>
              </tr>
              <tr className="border-b border-black/10">
                <td className="py-3 pr-4 font-medium text-ink">Typical dose</td>
                <td className="py-3 pr-4">500mg 3×/day with meals (1,500mg/day)</td>
                <td className="py-3 pr-4">500–2,000mg/day per prescriber</td>
              </tr>
              <tr className="border-b border-black/10">
                <td className="py-3 pr-4 font-medium text-ink">Monthly cost</td>
                <td className="py-3 pr-4">~$20–40 OTC, no insurance coverage</td>
                <td className="py-3 pr-4">~$4–10 generic (often covered by insurance)</td>
              </tr>
              <tr className="border-b border-black/10">
                <td className="py-3 pr-4 font-medium text-ink">Main cautions</td>
                <td className="py-3 pr-4">CYP3A4/2D6 interactions, pregnancy contraindication, GI</td>
                <td className="py-3 pr-4">Renal function (lactic acidosis risk), B12 depletion, GI</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-medium text-ink">Rx required</td>
                <td className="py-3 pr-4">No</td>
                <td className="py-3 pr-4">Yes</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Mechanism deep dive */}
      <section className="space-y-5 max-w-4xl">
        <p className="eyebrow-label">Mechanism</p>
        <h2 className="text-3xl font-semibold tracking-tight text-ink">How each one works</h2>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="card-premium p-6 space-y-3">
            <h3 className="text-xl font-semibold text-ink">Berberine</h3>
            <ul className="text-sm leading-7 text-muted space-y-2 list-none">
              <li><strong className="text-ink">AMPK activation:</strong> reduces hepatic glucose output, increases peripheral uptake</li>
              <li><strong className="text-ink">GLUT4 upregulation:</strong> promotes glucose transport into muscle cells independently of insulin</li>
              <li><strong className="text-ink">PTP1B inhibition:</strong> increases insulin receptor sensitivity</li>
              <li><strong className="text-ink">Gut microbiome:</strong> increases Akkermansia muciniphila, Bifidobacterium; short-chain fatty acid production supports insulin sensitivity</li>
              <li><strong className="text-ink">GLP-1 stimulation:</strong> mild incretin-pathway activation</li>
              <li><strong className="text-ink">Low oral bioavailability (~10%):</strong> most of berberine's effect occurs locally in the gut before systemic absorption</li>
            </ul>
          </div>

          <div className="card-premium p-6 space-y-3">
            <h3 className="text-xl font-semibold text-ink">Metformin</h3>
            <ul className="text-sm leading-7 text-muted space-y-2 list-none">
              <li><strong className="text-ink">Mitochondrial Complex I inhibition:</strong> increases AMP:ATP ratio → AMPK activation</li>
              <li><strong className="text-ink">Hepatic gluconeogenesis suppression:</strong> primary glucose-lowering mechanism</li>
              <li><strong className="text-ink">Improved peripheral insulin sensitivity:</strong> independent of weight loss</li>
              <li><strong className="text-ink">Gut microbiome:</strong> also increases Akkermansia muciniphila; some researchers argue gut effects explain much of its therapeutic benefit</li>
              <li><strong className="text-ink">Possible longevity effects:</strong> TAME trial investigating metformin for healthspan extension (ongoing)</li>
            </ul>
          </div>
        </div>

        <div className="rounded-2xl bg-amber-50 border border-amber-200 p-5 text-sm leading-7 text-amber-900">
          <p className="font-semibold">Why "nature's metformin" is an oversimplification</p>
          <p className="mt-2">
            The AMPK mechanism is shared, but berberine's broader pharmacology (PTP1B, GLUT4, gut-first action)
            differs meaningfully from metformin. More importantly, mechanism similarity does not equate to
            outcome equivalence — that requires head-to-head long-term cardiovascular outcome data, which
            berberine does not have.
          </p>
        </div>
      </section>

      {/* Evidence section */}
      <section className="space-y-5 max-w-4xl">
        <p className="eyebrow-label">Evidence</p>
        <h2 className="text-3xl font-semibold tracking-tight text-ink">What the research actually shows</h2>

        <div className="card-premium p-6 space-y-5">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-bold text-green-800">Grade B</span>
              <h3 className="text-lg font-semibold text-ink">Berberine for glycemic control</h3>
            </div>
            <ul className="text-sm leading-7 text-muted space-y-3">
              <li>
                <strong className="text-ink">Zhang et al. 2008</strong> (J Clin Endocrinol Metab, PMID: 18397984):
                Berberine 500mg 3×/day vs metformin 500mg 3×/day in newly diagnosed T2D patients (n=116) over
                13 weeks. Both reduced HbA1c ~1.2%, fasting glucose ~23%, postprandial glucose ~30%.
                Berberine also significantly reduced triglycerides. This is the most-cited head-to-head study.
              </li>
              <li>
                <strong className="text-ink">Yin et al. 2008</strong> (Metabolism, PMID: 18702929):
                Berberine 1g/day for 2 months in 84 T2D patients. Fasting glucose dropped 20%, postprandial
                glucose 28%, HbA1c from 8.1 to 7.3%. No placebo arm, but within-subject changes were significant.
              </li>
              <li>
                <strong className="text-ink">Dong et al. 2012 meta-analysis</strong> (14 RCTs):
                Berberine comparable to oral hypoglycemics including metformin for HbA1c and fasting glucose
                in short-term (≤3 month) comparisons. Significant heterogeneity across studies.
              </li>
              <li className="text-xs text-muted/70">
                Grade B rationale: Multiple RCTs with significant results, but limited by smaller sample sizes,
                shorter durations (&lt;3 months), predominantly Chinese study populations, and absence of
                long-term cardiovascular or mortality endpoint data.
              </li>
            </ul>
          </div>

          <div className="border-t border-black/10 pt-5 space-y-3">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-800">Grade A</span>
              <h3 className="text-lg font-semibold text-ink">Metformin for T2D</h3>
            </div>
            <ul className="text-sm leading-7 text-muted space-y-3">
              <li>
                <strong className="text-ink">UKPDS 34 (1998)</strong> (Lancet, PMID: 9742977):
                Landmark 10-year trial in overweight T2D patients. Metformin reduced diabetes-related
                complications by 32%, myocardial infarction by 39%, and all-cause mortality by 36%
                vs conventional diet treatment. These are the outcome data berberine lacks.
              </li>
              <li>
                Multiple subsequent systematic reviews, 60+ years of post-market surveillance,
                first-line designation in ADA/EASD/WHO clinical guidelines. Essentially the
                benchmark against which all other blood-glucose interventions are measured.
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Dosing section */}
      <section className="grid gap-6 lg:grid-cols-2 max-w-5xl">
        <div className="card-premium p-6 space-y-3">
          <p className="eyebrow-label">Dosing</p>
          <h2 className="text-2xl font-semibold tracking-tight text-ink">Berberine</h2>
          <ul className="text-sm leading-7 text-muted space-y-1">
            <li><strong className="text-ink">Standard dose:</strong> 500mg with each main meal (1,500mg/day)</li>
            <li><strong className="text-ink">Start low:</strong> 250mg 2×/day for 1–2 weeks to assess GI tolerance</li>
            <li><strong className="text-ink">Half-life:</strong> ~4–5 hours — split dosing is essential for sustained coverage</li>
            <li><strong className="text-ink">Cycling:</strong> Some practitioners recommend 8 weeks on, 2–4 weeks off (theoretical basis, limited evidence)</li>
            <li><strong className="text-ink">Timing:</strong> With meals reduces GI side effects; prandial timing also aligns with postprandial glucose goals</li>
          </ul>
        </div>

        <div className="card-premium p-6 space-y-3">
          <p className="eyebrow-label">Dosing</p>
          <h2 className="text-2xl font-semibold tracking-tight text-ink">Metformin</h2>
          <ul className="text-sm leading-7 text-muted space-y-1">
            <li><strong className="text-ink">Typical range:</strong> 500–2,000mg/day; titrated by prescriber</li>
            <li><strong className="text-ink">Starting:</strong> 500mg once or twice daily with meals; titrated up monthly</li>
            <li><strong className="text-ink">Extended-release (ER):</strong> Significantly reduces GI side effects; often preferred</li>
            <li><strong className="text-ink">Set by clinician:</strong> Dose individualized based on renal function, tolerability, glycemic response</li>
          </ul>
        </div>
      </section>

      {/* Safety section */}
      <section className="card-premium p-6 space-y-5 max-w-5xl">
        <p className="eyebrow-label">Safety</p>
        <h2 className="text-3xl font-semibold tracking-tight text-ink">Who should be cautious</h2>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-ink">Berberine cautions</h3>
            <ul className="text-sm leading-7 text-muted space-y-2">
              <li><strong className="text-ink">Drug interactions (significant):</strong> Berberine inhibits CYP3A4 and CYP2D6. Clinically relevant interactions with cyclosporine, some statins (simvastatin, lovastatin), antiarrhythmics, anticoagulants, and certain antidepressants. Review all medications before use.</li>
              <li><strong className="text-ink">Hypoglycemia risk:</strong> Can potentiate insulin or sulfonylurea effect. If taking diabetes medications, do not add berberine without clinician oversight.</li>
              <li><strong className="text-ink">Pregnancy: Contraindicated.</strong> Berberine crosses the placenta; may cause neonatal jaundice; animal reproductive toxicity data. Do not use in pregnancy or while breastfeeding.</li>
              <li><strong className="text-ink">GI side effects:</strong> Constipation, diarrhea, and abdominal discomfort are common — especially at initiation. Split dosing and taking with meals helps.</li>
              <li><strong className="text-ink">Long-term safety:</strong> Not characterized at population scale. Safety profile over 5+ years is not established.</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-ink">Metformin cautions</h3>
            <ul className="text-sm leading-7 text-muted space-y-2">
              <li><strong className="text-ink">Renal impairment:</strong> Metformin is contraindicated with eGFR &lt;30 mL/min. Dose reduction needed for eGFR 30–45. Lactic acidosis risk (rare but serious) is highest with renal impairment.</li>
              <li><strong className="text-ink">Vitamin B12 depletion:</strong> Long-term metformin use reduces B12 absorption in 10–30% of patients. Annual monitoring recommended; supplement if needed.</li>
              <li><strong className="text-ink">Contrast procedures:</strong> Hold metformin before and 48 hours after iodinated contrast dye procedures.</li>
              <li><strong className="text-ink">GI side effects:</strong> Nausea, diarrhea especially at initiation; extended-release form substantially reduces this.</li>
              <li><strong className="text-ink">Alcohol:</strong> Avoid excessive alcohol use (increases lactic acidosis risk).</li>
            </ul>
          </div>
        </div>

        <div className="rounded-2xl bg-red-50 border border-red-200 p-4 text-sm leading-6 text-red-900">
          <p className="font-semibold">Critical: Do not self-substitute berberine for prescribed metformin</p>
          <p className="mt-1">
            If you have diagnosed type 2 diabetes and are on metformin, do not replace it with berberine
            without clinician oversight. Short-term glycemic equivalence in one 13-week trial does not
            establish clinical interchangeability. Your prescriber's dosing accounts for your specific
            kidney function, medication history, and long-term cardiovascular risk.
          </p>
        </div>
      </section>

      {/* Stack context */}
      <section className="space-y-5 max-w-4xl">
        <p className="eyebrow-label">Stack Context</p>
        <h2 className="text-3xl font-semibold tracking-tight text-ink">Where each fits in a protocol</h2>

        <div className="grid gap-5 md:grid-cols-3">
          <div className="card-premium p-5 space-y-3">
            <p className="eyebrow-label">Metabolic Support Stack</p>
            <h3 className="text-xl font-semibold text-ink">Berberine + Inositol</h3>
            <p className="text-sm leading-7 text-muted">
              Commonly used for insulin resistance and PCOS. Overlapping insulin-sensitizing mechanisms.
              Myo-inositol + D-chiro-inositol combination has human trial support for PCOS specifically.
              Berberine adds AMPK/gut axis support.
            </p>
          </div>

          <div className="card-premium p-5 space-y-3">
            <p className="eyebrow-label">Gut Health Stack</p>
            <h3 className="text-xl font-semibold text-ink">Berberine + Psyllium</h3>
            <p className="text-sm leading-7 text-muted">
              Berberine's gut microbiome effects may complement psyllium's prebiotic and cholesterol-lowering
              actions. Both have evidence for lipid support. Timing note: space psyllium from other supplements
              by 1–2 hours to avoid absorption interference.
            </p>
          </div>

          <div className="card-premium p-5 space-y-3">
            <p className="eyebrow-label">Metformin Add-On</p>
            <h3 className="text-xl font-semibold text-ink">Metformin + B12</h3>
            <p className="text-sm leading-7 text-muted">
              If you're on long-term metformin, routine B12 monitoring and supplementation is warranted.
              Methylcobalamin 500–1,000mcg daily is commonly recommended. This is evidence-based standard
              practice, not optional optimization.
            </p>
          </div>
        </div>

        <div className="rounded-2xl bg-stone-50 border border-stone-200 p-5 text-sm leading-7 text-muted">
          <p className="font-semibold text-ink">Berberine + Metformin combination</p>
          <p className="mt-2">
            Some small trials have studied berberine as an add-on to metformin, with additive glycemic effects.
            This combination requires medical supervision — the hypoglycemia risk from two glucose-lowering
            agents is real, and clinician monitoring of kidney function and medication interactions is necessary.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="card-premium p-6 space-y-5 max-w-4xl">
        <p className="eyebrow-label">FAQ</p>
        <h2 className="text-3xl font-semibold tracking-tight text-ink">Common questions</h2>

        <div className="space-y-5 text-sm leading-7 text-muted">
          <div>
            <h3 className="text-lg font-semibold text-ink">Is berberine as effective as metformin for blood sugar?</h3>
            <p>
              In short-term head-to-head trials (notably Zhang et al. 2008), berberine 1,500mg/day produced
              comparable HbA1c and fasting glucose reductions to metformin 1,500mg/day over 13 weeks.
              However, metformin has decades of long-term outcome data — including proven reductions in
              cardiovascular events and all-cause mortality — that berberine lacks. Short-term glycemic
              comparability is not the same as long-term clinical equivalence.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-ink">Can I take berberine instead of metformin?</h3>
            <p>
              Not without clinician guidance. If you're prescribed metformin for diagnosed T2D, substituting
              berberine on your own changes your treatment plan without accounting for your full medical history.
              If you're interested in berberine as a complementary or alternative option, discuss it with
              your prescriber who can assess interactions, monitor your response, and adjust accordingly.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-ink">Who is berberine a reasonable option for?</h3>
            <p>
              Berberine is a reasonable OTC metabolic support option for people in the prediabetes range
              who want to support lifestyle changes, or those with insulin resistance seeking a supplement
              approach. It is not a replacement for clinical evaluation. Anyone with a blood sugar condition
              should be under medical care regardless of whether they use supplements or medications.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-ink">Does berberine have side effects?</h3>
            <p>
              Yes. GI effects (constipation, diarrhea, abdominal discomfort) are common, particularly at
              initiation. More importantly, berberine inhibits liver enzymes that metabolize many drugs
              (CYP3A4, CYP2D6), creating interaction risk. Pregnancy is a contraindication. Review all
              medications and health conditions with a qualified clinician before starting berberine.
            </p>
          </div>
        </div>
      </section>

      <FAQSchema
        pagePath="/guides/compare/berberine-vs-metformin/"
        questions={[
          { question: 'Is berberine as effective as metformin for blood sugar?', answer: 'In short-term head-to-head trials, berberine 1,500mg/day produced comparable HbA1c and fasting glucose reductions to metformin 1,500mg/day over 13 weeks. However, metformin has decades of long-term outcome data including proven reductions in cardiovascular events.' },
          { question: 'Can I take berberine instead of metformin?', answer: 'Not without clinician guidance. If you are prescribed metformin for diagnosed T2D, substituting berberine on your own changes your treatment plan without accounting for your full medical history. Discuss it with your clinician first.' },
          { question: 'Who is berberine a reasonable option for?', answer: 'Berberine is a reasonable OTC metabolic support option for people in the prediabetes range who want to support lifestyle changes, or those with insulin resistance seeking a supplement approach. It is not a replacement for clinical evaluation.' },
          { question: 'Does berberine have side effects?', answer: 'Yes. GI effects (constipation, diarrhea, abdominal discomfort) are common, particularly at initiation. More importantly, berberine inhibits liver enzymes that metabolize many drugs (CYP3A4, CYP2D6), creating interaction risk. Pregnancy is a contraindication.' },
        ]}
      />

      <EnhancedEmailCapture
        headline="Metabolic supplement research — curated, not hyped"
        description="Get evidence-graded analysis of berberine, inositol, and metabolic health supplements — including safety context, drug interactions, and what the RCTs actually show."
        benefit1="AMPK activators compared: berberine, metformin, and the evidence gap between them"
        benefit2="Drug interaction guide: CYP3A4/2D6 interactions, what to watch for"
        benefit3="Prediabetes supplement framework: what's evidence-supported, what's overhyped"
        ctaLabel="Join the list"
        location="compare-berberine-vs-metformin"
      />

      <RelatedDiscoveryWidget
        heading="Explore the metabolic cluster"
        subheading="Dig deeper into berberine, insulin resistance, and related compounds."
        items={[
          {
            type: 'guide',
            label: 'Compound',
            title: 'Berberine Deep Dive',
            description: 'Full evidence profile for berberine: mechanisms, RCT data, dosing, safety, and metabolic stack context.',
            href: '/compounds/berberine',
          },
          {
            type: 'guide',
            label: 'Comparison',
            title: 'Berberine vs Inositol',
            description: 'Two insulin sensitizers with different mechanisms — when each makes sense, and how they stack.',
            href: '/guides/compare/berberine-vs-metformin',
          },
          {
            type: 'guide',
            label: 'Comparison',
            title: 'Berberine vs Psyllium',
            description: 'Comparing two gut-first metabolic supplements with different primary mechanisms.',
            href: '/guides/compare/berberine-vs-metformin',
          },
          {
            type: 'guide',
            label: 'Goal Guide',
            title: 'Gut Health & Metabolic Goals',
            description: 'Map your metabolic goal to the right compounds — insulin resistance, lipids, gut health, or fat loss.',
            href: '/guides/best/supplements-for-gut-health',
          },
          {
            type: 'guide',
            label: 'Education',
            title: 'AMPK Mechanism',
            description: "How AMPK works as the body's energy sensor and why it's a target for both berberine and metformin.",
            href: '/guides/best/supplements-for-fat-loss',
          },
          {
            type: 'guide',
            label: 'Stack',
            title: 'Metabolic Support Stack',
            description: 'Evidence-guided protocol for blood sugar management, insulin sensitivity, and metabolic health.',
            href: '/guides/best/supplements-for-fat-loss',
          },
        ]}
      />

      <div className="space-y-3">
        <AffiliateDisclosure />
        <RecommendationSection
          title="Berberine product picks"
          description="OTC berberine products reviewed for labeling transparency, dose accuracy, and third-party testing. Metformin is a prescription medication and is not included here."
          products={berberineProducts}
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <Link href="/guides/compare/berberine-vs-metformin/" className="chip-readable">Berberine vs Inositol</Link>
        <Link href="/guides/compare/berberine-vs-metformin/" className="chip-readable">Berberine vs Psyllium</Link>
        <Link href="/guides/best/supplements-for-gut-health/" className="chip-readable">Gut Health Goals</Link>
        <Link href="/guides/best/supplements-for-fat-loss/" className="chip-readable">Fat Loss Goals</Link>
        <Link href="/guides/compare/" className="chip-readable">All Comparisons</Link>
      </div>
      <ConversionStickyCTA
        brand={berberineProducts[0]?.brand}
        name={berberineProducts[0]?.title}
        href={berberineProducts[0]?.affiliateUrl || '#'}
      />
      <References refs={BERBERINE_VS_METFORMIN_REFS} />
    </div>
  )
}
