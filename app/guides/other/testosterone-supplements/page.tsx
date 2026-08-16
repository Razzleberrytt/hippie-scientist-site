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
  title: 'Testosterone Supplements: Evidence, Testing & Safety (2026)',
  description:
    'Diagnosis-first review of testosterone supplements: zinc, vitamin D, ashwagandha, magnesium, testing for hypogonadism, evidence limits, and supplement safety.',
  path: '/guides/other/testosterone-supplements/',
  openGraphType: 'article',
})

const FAQS = [
  {
    question: 'Do testosterone booster supplements actually work?',
    answer:
      'Most marketed testosterone-booster ingredients do not reliably raise total testosterone in randomized trials. A 2023 systematic review covering 52 studies and 27 proposed booster ingredients concluded that most failed to increase total testosterone [3]. Individual nutrients can still matter when a true deficiency exists, but that is different from treating diagnosed hypogonadism.',
  },
  {
    question: 'How is low testosterone actually diagnosed?',
    answer:
      'Symptoms alone do not diagnose hypogonadism. The Endocrine Society recommends diagnosing testosterone deficiency only when compatible symptoms or signs occur together with unequivocally and consistently low testosterone concentrations, confirmed with repeat morning fasting testing using accurate assays [1,2]. Additional evaluation is used to identify the cause.',
  },
  {
    question: 'Does vitamin D raise testosterone?',
    answer:
      'Current randomized evidence does not show a clear reproducible testosterone-raising effect. A 2026 meta-analysis found no statistically clear effect of vitamin D supplementation on total testosterone, SHBG, free androgen index, calculated free testosterone, or bioactive testosterone in adult men [4]. Vitamin D deficiency can still deserve treatment for established health reasons.',
  },
  {
    question: 'Does zinc raise testosterone?',
    answer:
      'Zinc status is related to normal reproductive physiology, and deficiency can be associated with lower testosterone. That does not make high-dose zinc a general testosterone booster. The adult tolerable upper intake level is 40 mg/day from all sources, and chronic excess zinc can cause copper deficiency [6,7].',
  },
  {
    question: 'Does ashwagandha increase testosterone?',
    answer:
      'A 2026 systematic review and meta-analysis found a modest pooled increase in testosterone in men, but the trials were heterogeneous and hormone-marker changes do not establish treatment of hypogonadism [5]. Product, population, baseline status, and clinical outcome still matter.',
  },
  {
    question: 'Can supplements replace testosterone therapy?',
    answer:
      'No. Testosterone therapy is used for appropriately diagnosed hypogonadism under medical supervision. Supplements do not replace the diagnostic workup needed to distinguish primary from secondary causes, assess fertility goals, or identify other contributors to symptoms [1,2].',
  },
] as const

const TESTO_REFS = [
  {
    n: 1,
    text: 'Endocrine Society. Testosterone Therapy in Men With Hypogonadism: Clinical Practice Guideline resources.',
    url: 'https://www.endocrine.org/clinical-practice-guidelines/testosterone-therapy',
  },
  {
    n: 2,
    text: 'Endocrine Society. Statement on Testosterone Replacement Therapy. July 16, 2026.',
    url: 'https://www.endocrine.org/news-and-advocacy/news-room/2026/statement-on-testosterone-replacement-therapy',
  },
  {
    n: 3,
    text: 'Balasubramanian A, et al. Do “testosterone boosters” really increase serum total testosterone? A systematic review. 2023. PMID 37697053.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/37697053/',
  },
  {
    n: 4,
    text: 'Vitamin D Supplementation, Total Testosterone, and Androgen Bioavailability Markers in Adult Men: A Systematic Review and Meta-Analysis of Randomized Controlled Trials. 2026.',
    url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC13363579/',
  },
  {
    n: 5,
    text: 'Hormonal Modulation with Withania somnifera: Systematic Review and Meta-Analysis of Randomized-controlled Trials. 2026. PMID 41740946.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/41740946/',
  },
  {
    n: 6,
    text: 'NIH Office of Dietary Supplements. Zinc — Fact Sheet for Consumers.',
    url: 'https://ods.od.nih.gov/factsheets/Zinc-Consumer/',
  },
  {
    n: 7,
    text: 'Te L, et al. Correlation between serum zinc and testosterone: A systematic review. J Trace Elem Med Biol. 2023. PMID 36577241.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/36577241/',
  },
  {
    n: 8,
    text: 'Leproult R, Van Cauter E. Effect of 1 week of sleep restriction on testosterone levels in young healthy men. JAMA. 2011. PMID 21632481.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/21632481/',
  },
]

const evidenceRows = [
  {
    ingredient: 'Zinc',
    finding: 'Deficiency and testosterone are related; correcting inadequate status can matter [7].',
    limitation: 'Not a general booster. Adult UL is 40 mg/day from all sources; chronic excess can cause copper deficiency [6].',
  },
  {
    ingredient: 'Vitamin D',
    finding: 'Important nutrient with established skeletal and other health roles.',
    limitation: 'A 2026 RCT meta-analysis found no clear reproducible effect on total or free-androgen markers [4].',
  },
  {
    ingredient: 'Ashwagandha',
    finding: 'A 2026 meta-analysis found a modest pooled testosterone increase in men [5].',
    limitation: 'Heterogeneous trials and hormone-marker outcomes do not establish treatment of hypogonadism.',
  },
  {
    ingredient: 'Magnesium',
    finding: 'Magnesium is essential and deficiency should be corrected when present.',
    limitation: 'Evidence is insufficient to recommend magnesium as a reliable testosterone-raising intervention in otherwise replete men.',
  },
  {
    ingredient: 'Commercial multi-ingredient “test boosters”',
    finding: 'Products often combine many proposed ingredients.',
    limitation: 'Systematic review evidence indicates most proposed booster ingredients do not reliably increase total testosterone [3].',
  },
]

const diagnosticRows = [
  {
    situation: 'Low libido, fatigue, low mood, reduced strength, or erectile symptoms',
    nextStep:
      'Do not diagnose low testosterone from symptoms alone. These symptoms overlap with sleep disorders, depression, medication effects, obesity, chronic illness, and other endocrine conditions.',
  },
  {
    situation: 'One low testosterone result',
    nextStep:
      'Confirm with repeat early-morning fasting testing using an accurate assay before labeling hypogonadism [1,2].',
  },
  {
    situation: 'Consistently low testosterone plus compatible symptoms',
    nextStep:
      'Evaluate the cause. Endocrine guidance uses LH/FSH and other context to distinguish primary testicular from secondary pituitary/hypothalamic causes [1].',
  },
  {
    situation: 'Fertility is a current or near-term goal',
    nextStep:
      'Do not treat the problem as a supplement-shopping question. Fertility goals materially change testosterone-treatment decisions and should be discussed during the diagnostic workup [1].',
  },
]

export default function TestosteronePage() {
  return (
    <div className="container-page py-10 space-y-10">
      <AuthorityJsonLd
        title="Testosterone Supplements: Evidence, Testing and Safety"
        description="Diagnosis-first review of testosterone-support supplements, hypogonadism testing, nutrient deficiency, evidence limits, and supplement safety."
        url="https://thehippiescientist.net/guides/other/testosterone-supplements/"
        type="MedicalWebPage"
        citationUrls={TESTO_REFS.map((ref) => ref.url)}
      />
      <AuthorityBreadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Guides', href: '/guides/' }, { label: 'Testosterone Supplements' }]} />

      <section className="space-y-5 max-w-4xl">
        <p className="eyebrow-label">Evidence Review · Updated August 16, 2026</p>
        <h1 className="text-5xl font-bold tracking-tight text-ink">Testosterone Supplements: Diagnose the Problem Before Chasing a Booster</h1>
        <p className="text-lg leading-8 text-muted">
          “Low testosterone” symptoms are nonspecific, and a supplement label cannot tell you whether the problem is testosterone deficiency, poor sleep, medication effects, obesity, chronic illness, depression, infertility-related endocrine disease, or something else. The highest-value first step is diagnostic accuracy—not a stack.
        </p>
        <figure className="mt-6"><div className="overflow-hidden rounded-2xl border border-brand-900/10 shadow-sm bg-white"><Image src="/images/guides/testosterone-supplements.jpg" alt="Men's health supplements beside laboratory testing paperwork" width={1536} height={1024} priority className="w-full h-auto" /></div><figcaption className="mt-3 text-center text-sm text-muted">Hormone symptoms need diagnosis before supplement selection.</figcaption></figure>
      </section>

      <LegacyGuideQuickAnswer referencesHref="#references">
        <p>
          <strong>Most “testosterone booster” ingredients do not reliably raise testosterone.</strong> A 2023 systematic review of 52 studies across 27 proposed booster ingredients found that most failed to increase total testosterone [3]. If hypogonadism is suspected, Endocrine Society guidance requires compatible symptoms plus consistently low, accurately measured testosterone, typically confirmed with repeat morning fasting testing [1,2]. Nutrient deficiencies can deserve correction, but deficiency treatment is not the same thing as a testosterone-boosting protocol.
        </p>
      </LegacyGuideQuickAnswer>

      <section id="testosterone-supplement-evidence" data-answer-engine-table="true" className="card-premium scroll-mt-24 p-6 space-y-4 max-w-5xl">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Ingredient evidence: what the signal actually means</h2>
        <div className="overflow-x-auto">
          <table className="min-w-[860px] w-full text-sm">
            <caption className="sr-only">Testosterone supplement ingredients compared by evidence signal and main limitation</caption>
            <thead><tr className="border-b border-brand-900/10"><th scope="col" className="py-3 pr-4 text-left font-semibold text-ink">Ingredient</th><th scope="col" className="py-3 pr-4 text-left font-semibold text-ink">What the evidence supports</th><th scope="col" className="py-3 text-left font-semibold text-ink">Main limitation</th></tr></thead>
            <tbody className="text-muted">
              {evidenceRows.map((row) => (
                <tr key={row.ingredient} className="border-b border-brand-900/5 last:border-b-0 align-top">
                  <th scope="row" className="py-3 pr-4 text-left font-semibold text-ink">{row.ingredient}</th>
                  <td className="py-3 pr-4 leading-6">{row.finding}</td>
                  <td className="py-3 leading-6">{row.limitation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card-premium p-6 space-y-4 max-w-4xl">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Vitamin D: correlation is not a testosterone prescription</h2>
        <p className="text-sm leading-7 text-muted">
          Older observational studies and small trials helped popularize vitamin D as a testosterone-support supplement. The newer randomized-trial synthesis is less persuasive: a 2026 meta-analysis found no statistically clear or reproducible effect on total testosterone, SHBG, free androgen index, calculated free testosterone, or bioactive testosterone [4]. Vitamin D deficiency should still be identified and treated for established clinical reasons; the correction should not be sold as a guaranteed androgen intervention.
        </p>
      </section>

      <section className="card-premium p-6 space-y-4 max-w-4xl">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Zinc: deficiency matters, but more is not better</h2>
        <p className="text-sm leading-7 text-muted">
          Zinc is required for normal physiology, and a systematic review found that zinc deficiency can be associated with lower testosterone while supplementation effects depend on baseline zinc status, baseline testosterone, dose, form, and duration [7]. That is a deficiency-context signal—not evidence that high-dose zinc raises testosterone in zinc-replete men.
        </p>
        <p className="text-sm leading-7 text-muted">
          NIH lists an adult tolerable upper intake level of <strong>40 mg/day from all sources</strong>. Long-term excessive intake can lower copper status and cause neurological problems [6]. This page therefore does not provide a 25–50 mg/day “testosterone dose.”
        </p>
      </section>

      <section className="card-premium p-6 space-y-4 max-w-4xl">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Ashwagandha: a hormone-marker signal is not hypogonadism treatment</h2>
        <p className="text-sm leading-7 text-muted">
          A 2026 systematic review and meta-analysis of randomized trials found a modest pooled testosterone increase in men taking ashwagandha [5]. That is stronger evidence than a single branded trial, but it still does not establish that ashwagandha treats clinically diagnosed hypogonadism, improves fertility, or produces the same benefit across healthy, stressed, infertile, older, and testosterone-deficient men.
        </p>
      </section>

      <section id="testosterone-diagnostic-path" data-answer-engine-table="true" className="space-y-4 max-w-5xl scroll-mt-24">
        <h2 className="text-3xl font-semibold tracking-tight text-ink">Choose the diagnostic question before the supplement</h2>
        <div className="overflow-x-auto rounded-2xl border border-brand-900/10 bg-white/90 dark:border-white/10 dark:bg-white/5">
          <table className="min-w-[820px] w-full text-left text-sm">
            <caption className="sr-only">Testosterone symptom and testing situations with evidence-informed next steps</caption>
            <thead><tr className="border-b border-brand-900/10 text-ink"><th scope="col" className="p-4">Situation</th><th scope="col" className="p-4">Evidence-informed next step</th></tr></thead>
            <tbody className="divide-y divide-brand-900/10 text-muted">
              {diagnosticRows.map((row) => (
                <tr key={row.situation}><th scope="row" className="p-4 font-semibold text-left text-ink">{row.situation}</th><td className="p-4 leading-6">{row.nextStep}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl border border-amber-900/15 bg-amber-50/70 p-6 text-amber-950 dark:border-amber-200/20 dark:bg-amber-950/20 dark:text-amber-50 max-w-4xl">
        <p className="text-xs font-bold uppercase tracking-[0.16em]">Clinical boundary</p>
        <h2 className="mt-2 text-2xl font-semibold">Do not use supplements to bypass the cause of low testosterone</h2>
        <p className="mt-3 text-sm leading-7">
          Endocrine Society guidance recommends distinguishing primary testicular from secondary pituitary/hypothalamic hypogonadism with additional evaluation, including LH and FSH when appropriate [1]. That distinction can uncover testicular disease, pituitary causes, medication effects, energy-balance problems, or other conditions a supplement stack will not diagnose. Fertility goals also materially change treatment decisions.
        </p>
      </section>

      <section className="card-premium p-6 space-y-4 max-w-4xl">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Lifestyle still matters—but acute hormone changes are not the goal</h2>
        <p className="text-sm leading-7 text-muted">
          Sleep restriction can lower daytime testosterone in controlled experiments [8], and sleep, body composition, illness burden, medications, and energy availability can all affect the endocrine picture. But an acute testosterone rise after a workout or a short-term biomarker change is not the same as diagnosing or treating hypogonadism. The useful target is the underlying health problem, not maximizing one lab value.
        </p>
      </section>

      <section className="card-premium p-6 space-y-4 max-w-4xl">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Bottom line</h2>
        <p className="text-sm leading-7 text-muted">
          The strongest conclusion is not that one supplement “boosts testosterone.” It is that <strong>diagnosis and baseline status determine what the evidence means</strong>. Correct true nutrient deficiencies. Treat sleep, metabolic, medication, and medical contributors. If symptoms and repeat testing support hypogonadism, investigate the cause rather than replacing the workup with zinc, vitamin D, magnesium, ashwagandha, or a proprietary blend.
        </p>
      </section>

      <References refs={TESTO_REFS} />
      <LegacyGuideFAQ pagePath="/guides/other/testosterone-supplements/" questions={[...FAQS]} />
      <EmailCapture headline="Get evidence reviews like this" description="Hormones, supplements, and testing — without booster hype." ctaLabel="Get the evidence" location="guide-testosterone" />
      <div className="pt-4 border-t border-brand-900/10 flex items-center justify-between"><Link href="/guides/" className="inline-flex rounded-full border border-brand-900/10 bg-[var(--surface-card)] px-4 py-2 text-sm font-bold text-ink transition hover:bg-brand-50">← Back to guides</Link><Link href="/info/supplement-safety-checklist/" className="text-sm font-bold text-brand-800 hover:underline">Safety checklist →</Link></div>
    </div>
  )
}
