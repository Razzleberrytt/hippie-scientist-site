import type { Metadata } from 'next'
import RecommendationSection from '@/components/RecommendationSection'
import { getRevenueProductSet } from '@/config/revenue-products'
import Link from 'next/link'
import Image from 'next/image'
import { buildPageMetadata } from '../../../../src/lib/seo'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import FAQSchema from '@/components/seo/FAQSchema'
import References from '@/components/References'
import EmailCapture from '../../../../components/EmailCapture'

export const metadata: Metadata = buildPageMetadata({
  title: 'Saffron for Mood & ADHD: 2026 Evidence, SSRI Comparisons & Safety',
  description:
    '2026 saffron evidence review: 34-RCT mood meta-analysis, self-report vs clinician-rated outcomes, SSRI comparison limits, small ADHD studies, pregnancy and adverse-event evidence, extract identity, and adulteration risk.',
  path: '/guides/other/saffron-supplement/',
  openGraphType: 'article',
})

const FAQS = [
  {
    question: 'Does saffron work for depression?',
    answer:
      'The evidence is promising but outcome-dependent. A 2026 GRADE meta-analysis of 34 randomized trials found improvements on self-reported Beck Depression and Beck Anxiety scales, but no significant effects on clinician-rated Hamilton depression/anxiety scales or Profile of Mood States. The authors rated certainty as moderate and reported very high heterogeneity, so saffron should not be summarized as a proven antidepressant equivalent.',
  },
  {
    question: 'Is saffron as effective as an SSRI?',
    answer:
      'Several small head-to-head trials and a 2024 meta-analysis found no statistically significant difference between saffron and SSRIs on pooled depression/anxiety outcomes. “No significant difference” in small trials is not the same as proving therapeutic equivalence or noninferiority across patients. The SSRI-comparison evidence is encouraging but still limited by small studies, short duration and population concentration.',
  },
  {
    question: 'Does saffron help ADHD?',
    answer:
      'There is a small emerging ADHD literature. A systematic review found four studies totaling 118 patients. The best-known randomized pilot enrolled 54 children and adolescents and found no significant difference between saffron and methylphenidate over six weeks, but the study was too small and short to establish saffron as a stimulant substitute. A later nonrandomized study also reported signals but had commercial/conflict-of-interest and design limitations.',
  },
  {
    question: 'What dose of saffron should someone take for mood?',
    answer:
      'There is no universal validated mood dose. Many older depression trials used about 30 mg/day, while newer standardized-extract studies have used different products and lower labeled amounts. Milligrams are not directly interchangeable across stigma powder, whole-flower preparations and chemically standardized extracts.',
  },
  {
    question: 'Can saffron be combined with an antidepressant?',
    answer:
      'Saffron has been studied as both monotherapy and adjunctive therapy, but direct evidence defining serotonin-syndrome risk or a universal safe combination rule is limited. Do not stop, reduce or replace prescribed antidepressants because of saffron. People using serotonergic medication should review the exact product and plan with the prescriber or pharmacist.',
  },
  {
    question: 'Is saffron safe during pregnancy?',
    answer:
      'Medicinal-dose saffron should not be treated as automatically safe in pregnancy. A 2026 integrative review found limited and inconclusive maternal/fetal safety evidence and noted uterine-stimulation and miscarriage concerns at higher exposures or in some contexts. Culinary use and concentrated supplement use are different exposures.',
  },
] as const

const REFS = [
  {
    n: 1,
    text: 'Mahmoudi R, et al. Effect of saffron on depression, anxiety and mood disorder: a GRADE assessed systematic review and meta-analysis of 34 randomized controlled trials. Nutr Neurosci. 2026;29(7):816-837. PMID 41693488.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/41693488/',
  },
  {
    n: 2,
    text: 'Effect of Saffron Versus Selective Serotonin Reuptake Inhibitors (SSRIs) in Treatment of Depression and Anxiety: A Meta-analysis of Randomized Controlled Trials. 2024. PMID 38913392.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/38913392/',
  },
  {
    n: 3,
    text: 'Baziar S, et al. Crocus sativus versus methylphenidate in children with ADHD: randomized double-blind pilot study. J Child Adolesc Psychopharmacol. 2019;29:205-212. PMID 30741567.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/30741567/',
  },
  {
    n: 4,
    text: 'The Effects of Crocus sativus (Saffron) on ADHD: A Systematic Review. 2023. Four studies / 118 patients. PMID 37864351.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/37864351/',
  },
  {
    n: 5,
    text: 'Blasco-Fontecilla H, et al. Effectivity of Saffron Extract (Saffr’Activ) on Treatment for Children and Adolescents with ADHD: non-randomized clinical effectiveness study. Nutrients. 2022. PMID 36235697.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/36235697/',
  },
  {
    n: 6,
    text: 'Hasheminasab FS, et al. Adverse Events of Saffron (Crocus sativus L.): Systematic Review of Current Evidence. Health Sci Rep. 2026;9:e72212. PMID 42057871.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/42057871/',
  },
  {
    n: 7,
    text: 'Alshdefat A, et al. Saffron and Pregnancy: Cultural Practices, Beliefs, and Safety Evidence: An Integrative Review. J Evid Based Integr Med. 2026. PMID 42186868.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/42186868/',
  },
  {
    n: 8,
    text: 'Shah S, et al. Standardized Saffron Extract Formulation for Low Mood and Subclinical Depressive Symptoms: randomized double-blind placebo-controlled trial. 2026. Fifty-six adults. PMID 42465135.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/42465135/',
  },
  {
    n: 9,
    text: 'Mehdizadeh M, et al. Combating saffron fraud: systematic review of adulteration practices and detection technologies. Crit Rev Food Sci Nutr. 2026;66:1387-1403. PMID 40792566.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/40792566/',
  },
]

export default function SaffronPage() {
  return (
    <div className="container-page space-y-10 py-10">
      <AuthorityJsonLd
        title="Saffron for Mood and ADHD: 2026 Evidence, SSRI Comparisons and Safety"
        description="Evidence-calibrated review of saffron for depression, anxiety and ADHD, including outcome-scale disagreement, SSRI comparison limits, product identity and safety."
        url="https://thehippiescientist.net/guides/other/saffron-supplement/"
        type="MedicalWebPage"
        faqItems={[...FAQS]}
        citationUrls={REFS.map((reference) => reference.url)}
      />
      <AuthorityBreadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Guides', href: '/guides/' }, { label: 'Saffron' }]} />
      <FAQSchema pagePath="/guides/other/saffron-supplement/" questions={[...FAQS]} />

      <section className="max-w-4xl space-y-5">
        <p className="eyebrow-label">Mood & Neuropsychiatric Evidence · Updated August 15, 2026</p>
        <h1 className="text-4xl font-bold tracking-tight text-ink sm:text-5xl">Saffron for Mood: Better Evidence Than Most Botanicals, Messier Than “Natural Prozac”</h1>
        <p className="text-lg leading-8 text-muted">
          Saffron (<em>Crocus sativus</em>) has an unusually large psychiatric trial literature for a botanical. That makes it worth taking seriously—and makes precision more important. The newest meta-analysis finds a real signal on some self-reported depression and anxiety scales, but not on several clinician-rated measures. Small SSRI and ADHD comparisons are intriguing, yet they do not prove saffron is interchangeable with prescription treatment.
        </p>
        <figure className="mt-6">
          <div className="overflow-hidden rounded-2xl border border-brand-900/10 bg-white shadow-sm">
            <Image src="/images/guides/saffron-supplement.jpg" alt="Saffron threads in a glass bowl" width={1536} height={1024} priority className="h-auto w-full" />
          </div>
          <figcaption className="mt-3 text-center text-sm text-muted">A promising botanical still needs endpoint, extract, population and product-level precision.</figcaption>
        </figure>
      </section>

      <section className="card-premium max-w-4xl space-y-4 p-6">
        <p className="eyebrow-label">2026 meta-analysis</p>
        <h2 className="text-2xl font-semibold tracking-tight text-ink">The most important result is the disagreement between rating scales</h2>
        <p className="text-sm leading-7 text-muted">
          A 2026 GRADE-assessed meta-analysis pooled <strong>34 randomized controlled trials / 1,769 adults</strong> [1]. Saffron significantly improved the Beck Depression Inventory (14 trials / 817 participants) and Beck Anxiety Inventory (six trials / 339 participants).
        </p>
        <p className="text-sm leading-7 text-muted">
          But the same review found <strong>no significant effect on the Hamilton Depression Rating Scale, Hamilton Anxiety Rating Scale, or Profile of Mood States</strong> [1]. Heterogeneity was very high for the BDI and BAI results (I² above 90%). Overall certainty was rated moderate.
        </p>
        <p className="text-sm leading-7 text-muted">
          That makes “saffron works for depression” too crude. A more useful conclusion is that <strong>self-reported symptom improvement is supported across many small trials, while clinician-rated effects are less consistent.</strong>
        </p>
      </section>

      <section className="card-premium max-w-4xl space-y-5 border-l-4 border-brand-700 bg-brand-50/30 p-6">
        <p className="eyebrow-label">Outcome ledger</p>
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Separate the condition, scale and comparator</h2>
        <div className="overflow-x-auto">
          <table className="min-w-[760px] w-full text-sm">
            <thead><tr className="border-b border-brand-900/10"><th className="py-2 pr-4 text-left font-semibold text-ink">Question</th><th className="py-2 pr-4 text-left font-semibold text-ink">Evidence</th><th className="py-2 text-left font-semibold text-ink">Interpretation</th></tr></thead>
            <tbody className="text-muted">
              <tr className="border-b border-brand-900/5 align-top"><td className="py-3 pr-4 font-medium text-ink">Self-reported depression</td><td className="py-3 pr-4">BDI improved in 2026 meta-analysis [1]</td><td className="py-3"><strong>Moderate-certainty signal</strong>, high heterogeneity</td></tr>
              <tr className="border-b border-brand-900/5 align-top"><td className="py-3 pr-4 font-medium text-ink">Clinician-rated depression</td><td className="py-3 pr-4">HDRS pooled effect not significant [1]</td><td className="py-3"><strong>Inconsistent</strong></td></tr>
              <tr className="border-b border-brand-900/5 align-top"><td className="py-3 pr-4 font-medium text-ink">Self-reported anxiety</td><td className="py-3 pr-4">BAI improved [1]</td><td className="py-3"><strong>Promising</strong>, high heterogeneity</td></tr>
              <tr className="border-b border-brand-900/5 align-top"><td className="py-3 pr-4 font-medium text-ink">Versus SSRIs</td><td className="py-3 pr-4">Eight-study 2024 meta-analysis found no significant between-group difference [2]</td><td className="py-3"><strong>Encouraging comparison</strong>, not proof of equivalence</td></tr>
              <tr className="border-b border-brand-900/5 align-top"><td className="py-3 pr-4 font-medium text-ink">ADHD</td><td className="py-3 pr-4">Four studies / 118 patients [4]</td><td className="py-3"><strong>Preliminary</strong>, far below established treatment evidence</td></tr>
              <tr className="align-top"><td className="py-3 pr-4 font-medium text-ink">Low/subclinical mood</td><td className="py-3 pr-4">Small standardized-extract RCTs, including 56 adults in 2026 [8]</td><td className="py-3"><strong>Product-specific emerging evidence</strong></td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="card-premium max-w-4xl space-y-4 p-6">
        <p className="eyebrow-label">SSRI comparison integrity</p>
        <h2 className="text-2xl font-semibold tracking-tight text-ink">“No significant difference” does not prove saffron equals Prozac</h2>
        <p className="text-sm leading-7 text-muted">
          A 2024 meta-analysis of eight saffron-versus-SSRI studies found a nonsignificant pooled difference in depressive symptoms, and four studies showed a nonsignificant difference in anxiety outcomes [2]. Saffron groups reported fewer adverse events in that analysis.
        </p>
        <p className="text-sm leading-7 text-muted">
          That is unusually strong comparative evidence for a botanical—but statistical non-significance is not automatically evidence of equivalence. Many source trials were small and short. A rigorous noninferiority claim requires an appropriate margin, adequate power, and a trial designed to answer that question.
        </p>
        <p className="text-sm leading-7 text-muted">
          The site therefore should say <strong>“small trials have not shown saffron clearly worse than tested SSRIs”</strong>, not “saffron is as effective as Prozac.”
        </p>
      </section>

      <section className="card-premium max-w-4xl space-y-4 p-6">
        <p className="eyebrow-label">ADHD evidence</p>
        <h2 className="text-2xl font-semibold tracking-tight text-ink">A 54-child pilot is not “natural methylphenidate”</h2>
        <p className="text-sm leading-7 text-muted">
          The best-known ADHD trial randomized 54 children and adolescents to saffron or methylphenidate for six weeks; 50 completed the study. Parent and teacher ADHD Rating Scale changes did not differ significantly between groups [3].
        </p>
        <p className="text-sm leading-7 text-muted">
          A systematic review later found only <strong>four saffron ADHD studies / 118 patients total</strong> [4]. A separate nonrandomized study reported symptom-domain differences between saffron and methylphenidate, but its design was weaker and an investigator disclosed involvement with a company marketing a saffron-containing supplement [5].
        </p>
        <p className="text-sm leading-7 text-muted">
          The appropriate conclusion is “promising early ADHD research,” not “comparable efficacy established.” Larger multicenter randomized trials with longer follow-up are still needed.
        </p>
      </section>

      <section className="card-premium max-w-4xl space-y-4 p-6">
        <p className="eyebrow-label">Mechanism boundary</p>
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Crocin, crocetin and safranal are pharmacologically interesting—not proof of an SSRI mechanism in people</h2>
        <p className="text-sm leading-7 text-muted">
          Saffron contains multiple bioactive constituents studied in neurotransmitter, oxidative-stress and inflammatory models. Those mechanisms can help explain why a clinical effect is plausible.
        </p>
        <p className="text-sm leading-7 text-muted">
          The current page no longer says saffron “works similarly to an SSRI” because of serotonin/dopamine/norepinephrine reuptake modulation. Human trials measure symptoms, not a validated saffron-induced brain reuptake blockade equivalent to an SSRI dose. Mechanism should not be upgraded into therapeutic interchangeability.
        </p>
      </section>

      <section className="card-premium max-w-4xl space-y-4 p-6">
        <p className="eyebrow-label">Extract identity</p>
        <h2 className="text-2xl font-semibold tracking-tight text-ink">“30 mg saffron” is not one reproducible intervention</h2>
        <p className="text-sm leading-7 text-muted">
          Older psychiatric trials commonly used roughly 30 mg/day of stigma or saffron preparations. Newer trials use branded, chemically characterized extracts at different labeled amounts; a 2026 low-mood study, for example, tested a specific 15 mg standardized formulation [8].
        </p>
        <p className="text-sm leading-7 text-muted">
          Stigma powder, whole-flower material and extracts standardized to crocin/safranal are not automatically dose-equivalent. This page therefore does not prescribe one 30 mg/day consumer protocol or a universal “2% safranal” threshold.
        </p>
      </section>

      <section className="card-premium max-w-4xl space-y-4 p-6">
        <p className="eyebrow-label">Product-quality moat</p>
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Saffron is valuable enough to be a serious adulteration target</h2>
        <p className="text-sm leading-7 text-muted">
          A 2026 systematic review of saffron fraud describes substitution, dilution and adulteration as persistent authenticity problems and reviews chemical, DNA-based, spectroscopic and imaging methods used to detect them [9].
        </p>
        <p className="text-sm leading-7 text-muted">
          That means “standardized extract” should be treated as a product-characterization claim requiring documentation—not a magic phrase. Useful evidence includes botanical identity, extract source, marker-compound assay, contaminant testing and lot-level verification when available.
        </p>
      </section>

      <section className="card-premium max-w-4xl space-y-4 p-6">
        <p className="eyebrow-label">Safety</p>
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Generally tolerated does not mean interaction-free or pregnancy-safe</h2>
        <p className="text-sm leading-7 text-muted">
          A 2026 safety review included <strong>102 clinical trials and one case report</strong>. About 56% of trials reported at least one adverse effect and the estimated adverse-event incidence was about 17.5%, with gastrointestinal symptoms most common and usually minor/self-limited [6]. The authors still recommended clinical monitoring for higher-dose or prolonged medicinal use.
        </p>
        <p className="text-sm leading-7 text-muted">
          Direct clinical evidence defining saffron&apos;s interaction risk with SSRIs/SNRIs is limited, so this page no longer calls serotonin syndrome a demonstrated saffron interaction. At the same time, people taking psychiatric medication should not alter treatment or add a concentrated mood-active botanical without reviewing the plan with the prescriber or pharmacist.
        </p>
        <p className="text-sm leading-7 text-muted">
          Pregnancy deserves separate caution. A 2026 integrative review found limited and inconclusive safety evidence and noted dose/context-dependent uterine effects and miscarriage concerns [7]. Culinary exposure should not be equated with concentrated medicinal supplementation.
        </p>
      </section>

      <section className="card-premium max-w-4xl space-y-4 p-6">
        <p className="eyebrow-label">Evidence applicability</p>
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Claims we can and cannot make</h2>
        <div className="overflow-x-auto">
          <table className="min-w-[720px] w-full text-sm">
            <thead><tr className="border-b border-brand-900/10"><th className="py-2 pr-4 text-left font-semibold text-ink">Claim</th><th className="py-2 text-left font-semibold text-ink">2026 status</th></tr></thead>
            <tbody className="text-muted">
              <tr className="border-b border-brand-900/5"><td className="py-3 pr-4">Saffron improves some self-reported depression/anxiety outcomes</td><td className="py-3"><strong>Supported</strong>, moderate certainty / high heterogeneity</td></tr>
              <tr className="border-b border-brand-900/5"><td className="py-3 pr-4">All clinician-rated mood outcomes improve</td><td className="py-3"><strong>No</strong></td></tr>
              <tr className="border-b border-brand-900/5"><td className="py-3 pr-4">Saffron is proven equivalent to SSRIs</td><td className="py-3"><strong>No</strong></td></tr>
              <tr className="border-b border-brand-900/5"><td className="py-3 pr-4">Saffron has direct ADHD trials</td><td className="py-3"><strong>Yes, but only a very small evidence base</strong></td></tr>
              <tr className="border-b border-brand-900/5"><td className="py-3 pr-4">Saffron can replace methylphenidate in children</td><td className="py-3"><strong>Not established</strong></td></tr>
              <tr className="border-b border-brand-900/5"><td className="py-3 pr-4">One universal 30 mg standardized product is established</td><td className="py-3"><strong>No</strong></td></tr>
              <tr className="border-b border-brand-900/5"><td className="py-3 pr-4">Medicinal saffron is proven safe in pregnancy</td><td className="py-3"><strong>No</strong></td></tr>
              <tr><td className="py-3 pr-4">Retail saffron authenticity can be assumed from the front label</td><td className="py-3"><strong>No</strong></td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="card-premium max-w-4xl space-y-4 p-6">
        <p className="eyebrow-label">Unanswered questions</p>
        <h2 className="text-2xl font-semibold tracking-tight text-ink">What would meaningfully upgrade saffron’s evidence?</h2>
        <ol className="list-decimal space-y-2 pl-5 text-sm leading-7 text-muted">
          <li>Large multicenter trials outside the most heavily represented research regions.</li>
          <li>Prespecified clinician-rated primary outcomes alongside self-report scales.</li>
          <li>Formal noninferiority trials versus standard antidepressants with adequate margins and power.</li>
          <li>Long-term relapse, remission and discontinuation data.</li>
          <li>Larger independent ADHD trials with objective and teacher-rated outcomes.</li>
          <li>Head-to-head studies of chemically characterized extracts.</li>
          <li>Better clinical interaction data with antidepressants and other psychiatric medications.</li>
          <li>Product-assay studies linking marker compounds and authenticity to clinical response.</li>
        </ol>
      </section>

      <section className="card-premium max-w-4xl space-y-4 p-6">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Bottom line</h2>
        <p className="text-sm leading-7 text-muted">
          Saffron deserves more respect than most “mood supplements,” but also more discipline. The 2026 evidence supports a meaningful signal on some self-reported depression and anxiety measures; clinician-rated outcomes are less consistent; SSRI comparisons are encouraging but do not prove equivalence; and ADHD evidence is still tiny. <strong>The edge is not calling saffron natural Prozac—it is showing exactly where this botanical&apos;s evidence is unusually good and exactly where it still breaks.</strong>
        </p>
      </section>

      <References refs={REFS} />
      <div className="max-w-4xl rounded-xl border border-brand-900/10 bg-brand-50/40 p-4 text-xs leading-6 text-muted">
        <strong className="text-ink">Commercial-links boundary:</strong> products below are sourcing options, not evidence that a retail saffron capsule reproduces the botanical part, extract chemistry, marker profile, dose or psychiatric effect of a cited trial.
      </div>
      <div className="max-w-4xl"><RecommendationSection products={getRevenueProductSet('saffron')?.products ?? []} /></div>
      <EmailCapture headline="Get evidence reviews like this" description="Mood, ADHD and supplement evidence—with rating scales, comparators and product identity kept intact." ctaLabel="Get the evidence" location="guide-saffron" />
      <div className="flex items-center justify-between border-t border-brand-900/10 pt-4"><Link href="/guides/" className="inline-flex rounded-full border border-brand-900/10 bg-[var(--surface-card)] px-4 py-2 text-sm font-bold text-ink transition hover:bg-brand-50">← Back to guides</Link><Link href="/guides/adhd/" className="text-sm font-bold text-brand-800 hover:underline">ADHD evidence →</Link></div>
    </div>
  )
}
