import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { buildPageMetadata } from '../../../../src/lib/seo'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import LegacyGuideFAQ from '@/components/LegacyGuideFAQ'
import LegacyGuideQuickAnswer from '@/components/LegacyGuideQuickAnswer'
import References from '@/components/References'
import EmailCapture from '../../../../components/EmailCapture'

export const metadata: Metadata = buildPageMetadata({
  title: 'Saffron for Depression: What the Trials and Guidelines Show (2026)',
  description:
    'Evidence-first review of saffron for depressive symptoms: placebo trials, SSRI comparisons, 2025 meta-analyses, CANMAT third-line guidance, product variability, and safety limits.',
  path: '/guides/other/saffron-supplement/',
  openGraphType: 'article',
})

const FAQS = [
  {
    question: 'Does saffron help depressive symptoms?',
    answer:
      'Possibly. Randomized trials and meta-analyses report symptom improvements in some adults, but the evidence base is still limited by small samples, short follow-up, heterogeneous preparations, geographic concentration, and mixed results across rating scales. Current CANMAT guidance keeps saffron as a third-line complementary option for mild major depressive episodes rather than a first-line treatment.',
  },
  {
    question: 'Is saffron proven equivalent to Prozac or other SSRIs?',
    answer:
      'No. A 2025 meta-analysis found no statistically significant difference between saffron and SSRIs across eight depression trials, but “no significant difference” is not the same as proving formal equivalence or non-inferiority. The underlying head-to-head trials were generally small and short.',
  },
  {
    question: 'What dose of saffron should someone take for depression?',
    answer:
      'Trials have used specific standardized preparations and often doses around 30 mg/day, but that does not establish one universal consumer dose for depression. Product composition varies, and depression treatment decisions should account for diagnosis, severity, other medicines, pregnancy status, bipolar-spectrum risk, and urgent safety concerns.',
  },
  {
    question: 'Does saffron work by acting like an SSRI?',
    answer:
      'That is not established in humans. Serotonergic, other monoaminergic, anti-inflammatory, antioxidant, and neuroprotective mechanisms have been proposed, much of the mechanistic evidence is preclinical, and the exact clinically relevant mechanism remains uncertain.',
  },
  {
    question: 'Can saffron replace antidepressants or psychotherapy?',
    answer:
      'It should not be presented as a drop-in replacement. Current depression guidelines place saffron well below first-line psychotherapy and pharmacotherapy for moderate or severe illness. Anyone with suicidal thoughts, severe functional decline, psychosis, mania, or rapidly worsening depression needs prompt professional evaluation rather than supplement experimentation.',
  },
] as const

const SAFFRON_REFS = [
  {
    n: 1,
    text: 'Shafiee A, et al. Effect of Saffron Versus Selective Serotonin Reuptake Inhibitors (SSRIs) in Treatment of Depression and Anxiety: A Meta-analysis of Randomized Controlled Trials. Nutr Rev. 2025;83(3):e751-e761. PMID 38913392.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/38913392/',
  },
  {
    n: 2,
    text: 'Effect of saffron on depression, anxiety and mood disorder: a GRADE-assessed systematic review and meta-analysis of 34 randomized controlled trials. Nutr Neurosci. 2025. doi:10.1080/1028415X.2025.2602153.',
    url: 'https://doi.org/10.1080/1028415X.2025.2602153',
  },
  {
    n: 3,
    text: 'Lam RW, et al. CANMAT 2023 Update on Clinical Guidelines for Management of Major Depressive Disorder in Adults. Can J Psychiatry. 2024. Saffron remains a third-line complementary treatment for mild major depressive episodes.',
    url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC11351064/',
  },
  {
    n: 4,
    text: 'Dimech L. The Role of Saffron in the Treatment of Depression: A Literature Review. Cureus. 2026;18(3):e104594. PMID 41939549.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/41939549/',
  },
  {
    n: 5,
    text: 'Lopresti AL, Drummond PD. Saffron (Crocus sativus) for depression: a systematic review of clinical studies and examination of underlying antidepressant mechanisms of action. Hum Psychopharmacol. 2014;29(6):517-527. PMID 25384672.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/25384672/',
  },
  {
    n: 6,
    text: 'Moshiri E, et al. Crocus sativus L. versus fluoxetine in the treatment of mild to moderate depression: a double-blind, randomized pilot trial. Prog Neuropsychopharmacol Biol Psychiatry. 2006. PMID 17174461.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/17174461/',
  },
]

const evidenceRows = [
  {
    lane: 'Saffron vs placebo',
    finding: 'Meta-analyses report improvement on some depressive-symptom measures.',
    limit: 'A 2025 GRADE review found substantial heterogeneity and no significant effect on some clinician-rated outcomes, including HDRS.',
  },
  {
    lane: 'Saffron vs SSRIs',
    finding: 'A 2025 meta-analysis of eight depression trials found no statistically significant difference in symptom reduction.',
    limit: 'The small underlying trials do not establish formal equivalence, long-term relapse prevention, or comparable effectiveness in severe illness.',
  },
  {
    lane: 'Guideline position',
    finding: 'CANMAT recognizes a modest signal for depressive symptoms.',
    limit: 'Saffron remains third-line for mild major depressive episodes because trial limitations are substantial.',
  },
  {
    lane: 'Mechanism',
    finding: 'Monoaminergic, anti-inflammatory, antioxidant and neuroprotective pathways are biologically plausible.',
    limit: 'A proposed mechanism is not proof that saffron functions clinically like an SSRI or predicts drug-interaction risk.',
  },
  {
    lane: 'Retail product translation',
    finding: 'Clinical trials use defined extracts, plant parts and formulations.',
    limit: 'A trial result does not automatically transfer to an arbitrary capsule, culinary saffron, or a product standardized to a different constituent profile.',
  },
] as const

export default function SaffronPage() {
  return (
    <div className="container-page space-y-10 py-10">
      <AuthorityJsonLd
        title="Saffron for Depression: What the Trials and Guidelines Show"
        description="Evidence-calibrated review of saffron for depressive symptoms, including placebo and SSRI comparisons, current CANMAT guidance, mechanism uncertainty, and product generalizability."
        url="https://thehippiescientist.net/guides/other/saffron-supplement/"
        type="MedicalWebPage"
        citationUrls={SAFFRON_REFS.map((ref) => ref.url)}
      />
      <AuthorityBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Guides', href: '/guides/' },
          { label: 'Saffron and Depression' },
        ]}
      />

      <section className="max-w-4xl space-y-5">
        <p className="eyebrow-label">Mental Health Evidence Review · Updated August 16, 2026</p>
        <h1 className="text-4xl font-bold tracking-tight text-ink sm:text-5xl">Saffron for Depression: Promising Trials, Much Narrower Than “Natural Prozac”</h1>
        <p className="text-lg leading-8 text-muted">
          Saffron has a stronger depression research signal than many botanical supplements, including randomized trials against placebo and antidepressant comparators. The honest conclusion is still narrower than the marketing: <strong>short-term symptom improvement is plausible, but formal equivalence to SSRIs, long-term effectiveness, optimal product selection, and safety across higher-risk psychiatric populations are not established.</strong>
        </p>
        <figure className="mt-6">
          <div className="overflow-hidden rounded-2xl border border-brand-900/10 bg-white shadow-sm">
            <Image src="/images/guides/saffron-supplement.jpg" alt="Saffron threads beside a clinical evidence review" width={1536} height={1024} priority className="h-auto w-full" />
          </div>
          <figcaption className="mt-3 text-center text-sm text-muted">A promising botanical trial signal is not the same as a first-line antidepressant recommendation.</figcaption>
        </figure>
      </section>

      <LegacyGuideQuickAnswer referencesHref="#references">
        <p>
          Saffron may reduce depressive symptoms in some adults, but it should not be summarized as “equivalent to Prozac.” A 2025 meta-analysis found no statistically significant difference versus SSRIs across eight depression trials [1], while a newer 34-RCT review found improvement on some self-reported scales but not on several clinician-rated measures and reported high heterogeneity [2]. CANMAT continues to place saffron as a <strong>third-line complementary option for mild major depressive episodes</strong>, not a first-line treatment [3].
        </p>
      </LegacyGuideQuickAnswer>

      <section id="saffron-depression-evidence" data-answer-engine-table="true" className="max-w-5xl space-y-4 scroll-mt-24">
        <h2 className="text-3xl font-semibold tracking-tight text-ink">What each evidence lane can actually support</h2>
        <div className="overflow-x-auto rounded-2xl border border-brand-900/10 bg-white/90 dark:border-white/10 dark:bg-white/5">
          <table className="min-w-[900px] w-full text-left text-sm">
            <caption className="sr-only">Saffron depression evidence by comparison, finding, and limitation</caption>
            <thead>
              <tr className="border-b border-brand-900/10 text-ink">
                <th scope="col" className="p-4">Evidence lane</th>
                <th scope="col" className="p-4">What it shows</th>
                <th scope="col" className="p-4">What it does not establish</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-900/10 text-muted">
              {evidenceRows.map((row) => (
                <tr key={row.lane}>
                  <th scope="row" className="p-4 font-semibold text-ink">{row.lane}</th>
                  <td className="p-4 leading-6">{row.finding}</td>
                  <td className="p-4 leading-6">{row.limit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card-premium max-w-4xl space-y-4 p-6">
        <p className="eyebrow-label">The SSRI comparison</p>
        <h2 className="text-2xl font-semibold tracking-tight text-ink">“No significant difference” is not proof of equivalence</h2>
        <p className="text-sm leading-7 text-muted">
          The 2025 SSRI-comparator meta-analysis found a pooled difference close to zero for depressive symptoms [1]. That is interesting and supports further study. But a collection of small short-duration trials that fails to detect a difference does not prove two treatments are clinically interchangeable. A 2026 review notes that the earlier head-to-head studies were generally underpowered and were not formal non-inferiority trials [4].
        </p>
        <p className="text-sm leading-7 text-muted">
          This matters for AI summaries: “saffron performed similarly in small trials” is defensible; “saffron works as well as Prozac” is too strong.
        </p>
      </section>

      <section className="card-premium max-w-4xl space-y-4 p-6">
        <p className="eyebrow-label">Mechanism</p>
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Do not convert mechanistic hypotheses into an SSRI label</h2>
        <p className="text-sm leading-7 text-muted">
          Reviews discuss serotonergic and other monoaminergic activity alongside antioxidant, anti-inflammatory and neuroprotective pathways [4,5]. Much of that mechanism work is preclinical. The clinically relevant antidepressant mechanism and interaction profile are not fully defined, so the page should not describe saffron as simply “an SSRI-like reuptake inhibitor.”
        </p>
      </section>

      <section className="card-premium max-w-4xl space-y-4 border-l-4 border-amber-500 bg-amber-50/40 p-6">
        <p className="eyebrow-label">Clinical boundary</p>
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Depression severity changes the decision</h2>
        <p className="text-sm leading-7 text-muted">
          CANMAT places saffron as a third-line complementary treatment for <strong>mild</strong> major depressive episodes because the benefits are modest and the trial limitations matter [3]. Complementary-treatment evidence should not be used to delay evaluation of severe depression, bipolar-spectrum symptoms, psychosis, suicidal thinking, or major functional decline.
        </p>
        <p className="text-sm leading-7 text-muted">
          Trial doses and extracts describe what researchers studied; they are not a universal self-treatment protocol. Product composition, other medications, pregnancy, psychiatric diagnosis and treatment goals can change the risk-benefit decision.
        </p>
      </section>

      <section className="card-premium max-w-4xl space-y-4 p-6">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Product identity matters</h2>
        <p className="text-sm leading-7 text-muted">
          Saffron trials have used different stigma, petal and standardized extract preparations [4,5]. That variability is a reason to avoid translating one trial into a shopping rule such as “2–3% safranal is best” or assuming culinary saffron, any retail capsule and a studied extract are interchangeable. Quality and standardization matter, but no single label percentage proves antidepressant effectiveness.
        </p>
      </section>

      <LegacyGuideFAQ questions={[...FAQS]} pagePath="/guides/other/saffron-supplement/" referencesHref="#references" />

      <div id="references" className="scroll-mt-24">
        <References refs={SAFFRON_REFS} />
      </div>

      <EmailCapture headline="Get evidence reviews like this" description="Mental-health supplements reviewed without turning preliminary trials into treatment promises." ctaLabel="Get the evidence" location="guide-saffron" />
      <div className="flex items-center justify-between border-t border-brand-900/10 pt-4">
        <Link href="/guides/" className="inline-flex rounded-full border border-brand-900/10 bg-[var(--surface-card)] px-4 py-2 text-sm font-bold text-ink transition hover:bg-brand-50">← Back to guides</Link>
        <Link href="/herbs/" className="text-sm font-bold text-brand-800 hover:underline">Herb library →</Link>
      </div>
    </div>
  )
}
