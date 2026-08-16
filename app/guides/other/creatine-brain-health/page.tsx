import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import RecommendationSection from '@/components/RecommendationSection'
import { getRevenueProductSet } from '@/config/revenue-products'
import { buildPageMetadata } from '../../../../src/lib/seo'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import LegacyGuideFAQ from '@/components/LegacyGuideFAQ'
import LegacyGuideQuickAnswer from '@/components/LegacyGuideQuickAnswer'
import References from '@/components/References'
import EmailCapture from '../../../../components/EmailCapture'

export const metadata: Metadata = buildPageMetadata({
  title: 'Creatine for Brain Health: 2026 Cognition, Depression & Sleep Evidence',
  description:
    '2026 evidence review of creatine for memory, cognition, depression, and sleep deprivation, including effect-size limits, bipolar caution, kidney markers, and why sports evidence does not automatically prove brain benefits.',
  path: '/guides/other/creatine-brain-health/',
  openGraphType: 'article',
})

const FAQS = [
  {
    question: 'Does creatine improve cognition?',
    answer:
      'A 2024 meta-analysis of 16 randomized trials and 492 adults found modest improvements in memory, attention time, and processing speed, but not overall cognition or executive function. The result is domain-specific rather than evidence that creatine universally makes healthy people smarter.',
  },
  {
    question: 'Does creatine help during sleep deprivation?',
    answer:
      'Possibly, but the evidence is still small. A 2026 systematic review found only five eligible studies and described a favorable early trend with effects varying by cognitive domain. A separate 2026 crossover study in 29 healthy participants found mitigation of several cognitive deficits during 21 hours of sleep deprivation. That is promising laboratory evidence, not a validated shift-work or sleep-loss treatment protocol.',
  },
  {
    question: 'Does creatine treat depression?',
    answer:
      'Not on current evidence. A 2025 depression meta-analysis of 11 trials and 1,093 participants found a small-to-moderate pooled signal, but the equivalent average change was below the prespecified minimal important difference and certainty was very low. A 2026 psychiatric RCT review found only five trials across major depression and bipolar depression, mostly as treatment augmentation.',
  },
  {
    question: 'Is creatine safe for people with bipolar disorder?',
    answer:
      'There is not enough evidence to call psychiatric use universally safe. In the small bipolar-depression trial summarized in a 2026 systematic review, two of 17 creatine-treated participants experienced hypomania or mania. People with bipolar-spectrum illness should not use creatine as a mood-treatment experiment without psychiatric review.',
  },
  {
    question: 'Does creatine damage the kidneys?',
    answer:
      'Recent meta-analyses found that creatine can raise serum creatinine modestly without a statistically significant reduction in eGFR. Because serum creatinine is itself used to estimate kidney function, supplementation can complicate interpretation. Existing kidney disease or abnormal labs deserve clinician review rather than assuming either safety or harm from the creatinine number alone.',
  },
  {
    question: 'What dose should someone take for brain health?',
    answer:
      'There is no single validated brain-health dose. Cognition, depression, menopause, and sleep-deprivation studies use different forms, regimens, durations, and populations. High single doses used in acute sleep-deprivation experiments should not be copied into a general cognitive protocol.',
  },
] as const

const CREATINE_BRAIN_REFS = [
  {
    n: 1,
    text: 'Xu C, et al. The effects of creatine supplementation on cognitive function in adults: a systematic review and meta-analysis. Front Nutr. 2024. Sixteen RCTs / 492 participants. PMID 39070254.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/39070254/',
  },
  {
    n: 2,
    text: 'Williams NB, et al. Creatine Supplementation and Acute Sleep Deprivation: A Systematic Review of Cognitive, Psychomotor, and Mood Outcomes. 2026. Five eligible studies. PMID 42261581.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/42261581/',
  },
  {
    n: 3,
    text: 'Gordji-Nejad A, et al. Single-Dose Creatine Reduces Sleep Deprivation-Induced Deterioration in Cognitive Performance. Nutrients. 2026. Twenty-nine healthy participants. PMID 42075005.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/42075005/',
  },
  {
    n: 4,
    text: 'Eckert I, et al. Creatine supplementation for treating symptoms of depression: a systematic review and meta-analysis. Br J Nutr. 2025. Eleven trials / 1,093 participants. PMID 41189312.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/41189312/',
  },
  {
    n: 5,
    text: 'Fares BJF, et al. The Effect of Creatine Monohydrate on Mental Disorders: A Systematic Review of Randomized Controlled Trials. Can J Psychiatry. 2026. Five RCTs. PMID 41558805.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/41558805/',
  },
  {
    n: 6,
    text: 'Tsiaras A, et al. The effect of creatine supplementation on kidney function: a systematic review and meta-analysis of randomized controlled trials. J Ren Nutr. 2026. PMID 42035842.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/42035842/',
  },
  {
    n: 7,
    text: 'Naeini EK, et al. Effect of creatine supplementation on kidney function: a systematic review and meta-analysis. BMC Nephrol. 2025. PMID 41199218.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/41199218/',
  },
  {
    n: 8,
    text: 'Korovljev D, et al. CONCRET-MENOPA randomized trial in perimenopausal and postmenopausal women. 2025. PMID 40854087.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/40854087/',
  },
]

export default function CreatineBrainPage() {
  return (
    <div className="container-page space-y-10 py-10">
      <AuthorityJsonLd
        title="Creatine for Brain Health: 2026 Cognition, Depression and Sleep Evidence"
        description="Evidence-calibrated review of creatine for cognitive outcomes, acute sleep deprivation, depressive symptoms, psychiatric augmentation, and kidney-marker interpretation."
        url="https://thehippiescientist.net/guides/other/creatine-brain-health/"
        type="MedicalWebPage"
        citationUrls={CREATINE_BRAIN_REFS.map((reference) => reference.url)}
      />
      <AuthorityBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Guides', href: '/guides/' },
          { label: 'Creatine & Brain Health' },
        ]}
      />

      <section className="max-w-4xl space-y-5">
        <p className="eyebrow-label">2026 Evidence Review · Updated August 16, 2026</p>
        <h1 className="text-4xl font-bold tracking-tight text-ink sm:text-5xl">
          Creatine for Brain Health: Where the Evidence Is Real—and Where the Hype Runs Ahead
        </h1>
        <p className="text-lg leading-8 text-muted">
          Creatine has a mature evidence base for high-intensity exercise. Brain-health claims are a different question. Human studies now cover memory, processing speed, acute sleep deprivation, depression augmentation, and menopause-related outcomes—but the strength of evidence varies dramatically by use case.
        </p>

        <figure className="mt-6">
          <div className="overflow-hidden rounded-2xl border border-brand-900/10 bg-white shadow-sm">
            <Image
              src="/images/guides/creatine-brain-health.jpg"
              alt="Creatine powder beside a brain model"
              width={1536}
              height={1024}
              priority
              className="h-auto w-full"
            />
          </div>
          <figcaption className="mt-3 text-center text-sm text-muted">
            Strong sports evidence does not automatically transfer to depression, cognition, dementia prevention, or sleep-loss treatment.
          </figcaption>
        </figure>
      </section>

      <LegacyGuideQuickAnswer referencesHref="#references">
        <p>The brain evidence is <strong>promising but domain-specific</strong>. A 2024 meta-analysis of 16 randomized trials / 492 adults found modest benefits for memory, attention time, and processing-speed time, but not overall cognition or executive function [1]. In depression, an 11-trial / 1,093-participant meta-analysis found a pooled signal, but certainty was very low and the average effect was below the review&rsquo;s prespecified minimal important difference [4]. Acute sleep-deprivation findings are interesting but sparse [2,3], and psychiatric use has context-specific safety boundaries [5].</p>
      </LegacyGuideQuickAnswer>

      <section id="creatine-brain-outcomes" data-answer-engine-table="true" className="card-premium max-w-4xl scroll-mt-24 space-y-5 border-l-4 border-brand-700 bg-brand-50/30 p-6">
        <p className="eyebrow-label">Outcome-by-outcome ledger</p>
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Do not collapse every “brain” result into one grade</h2>
        <div className="overflow-x-auto">
          <table className="min-w-[760px] w-full text-sm">
            <caption className="sr-only">Creatine brain-health use cases compared by best current evidence, signal, and main limitation</caption>
            <thead>
              <tr className="border-b border-brand-900/10">
                <th scope="col" className="py-2 pr-4 text-left font-semibold text-ink">Use case</th>
                <th scope="col" className="py-2 pr-4 text-left font-semibold text-ink">Best current evidence</th>
                <th scope="col" className="py-2 pr-4 text-left font-semibold text-ink">Signal</th>
                <th scope="col" className="py-2 text-left font-semibold text-ink">Main limit</th>
              </tr>
            </thead>
            <tbody className="text-muted">
              <tr className="border-b border-brand-900/5 align-top">
                <th scope="row" className="py-3 pr-4 text-left font-medium text-ink">General adult cognition</th>
                <td className="py-3 pr-4">16-RCT meta-analysis / 492 adults [1]</td>
                <td className="py-3 pr-4">Memory, attention time, processing speed</td>
                <td className="py-3">No significant overall-cognition or executive-function effect</td>
              </tr>
              <tr className="border-b border-brand-900/5 align-top">
                <th scope="row" className="py-3 pr-4 text-left font-medium text-ink">Acute sleep deprivation</th>
                <td className="py-3 pr-4">2026 systematic review: only 5 studies [2]</td>
                <td className="py-3 pr-4">Favorable early trend; domain-dependent</td>
                <td className="py-3">Sparse evidence; laboratory conditions and unusual experimental dosing</td>
              </tr>
              <tr className="border-b border-brand-900/5 align-top">
                <th scope="row" className="py-3 pr-4 text-left font-medium text-ink">Depressive symptoms</th>
                <td className="py-3 pr-4">11-trial meta-analysis / 1,093 participants [4]</td>
                <td className="py-3 pr-4">Small-to-moderate pooled effect</td>
                <td className="py-3">Very-low certainty; average effect below minimal important difference</td>
              </tr>
              <tr className="border-b border-brand-900/5 align-top">
                <th scope="row" className="py-3 pr-4 text-left font-medium text-ink">Diagnosed mental disorders</th>
                <td className="py-3 pr-4">2026 review: 5 RCTs total [5]</td>
                <td className="py-3 pr-4">Some adult MDD augmentation signals</td>
                <td className="py-3">Only MDD and bipolar depression studied; no broad psychiatric evidence</td>
              </tr>
              <tr className="align-top">
                <th scope="row" className="py-3 pr-4 text-left font-medium text-ink">Menopause-related cognition</th>
                <td className="py-3 pr-4">Small 36-person RCT [8]</td>
                <td className="py-3 pr-4">Some reaction-time / brain-creatine findings</td>
                <td className="py-3">Small, formulation-specific, not a general “brain fog” treatment trial</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="card-premium max-w-4xl space-y-4 p-6">
        <p className="eyebrow-label">Sleep-loss research</p>
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Interesting acute findings do not equal “strong evidence”</h2>
        <p className="text-sm leading-7 text-muted">
          The 2026 sleep-deprivation systematic review searched six databases and found only <strong>five eligible studies</strong>. Its conclusion was cautiously positive: early work trends toward benefit, but effects may differ by cognitive domain and higher-quality trials are still needed [2].
        </p>
        <p className="text-sm leading-7 text-muted">
          A 2026 randomized crossover experiment in 29 healthy participants found that a single creatine exposure mitigated deterioration in logical/numerical tasks, language-related processing speed, and psychomotor vigilance during 21 hours of sleep deprivation [3]. That is a compelling laboratory signal. It does not validate routine high-dose self-treatment for shift work, all-nighters, new-parent sleep loss, or chronic insomnia.
        </p>
      </section>

      <section className="card-premium max-w-4xl space-y-4 p-6">
        <p className="eyebrow-label">Depression evidence</p>
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Statistical significance is not the same as clinically important benefit</h2>
        <p className="text-sm leading-7 text-muted">
          The 2025 depression meta-analysis found a standardized mean difference of -0.34 across 11 trials. When translated to the 17-item Hamilton scale, the average difference was about <strong>2.2 points</strong>—below the review&apos;s <strong>3.0-point minimal important difference</strong>. The confidence interval included effects that would not be clinically important, heterogeneity was high, and GRADE certainty was very low [4].
        </p>
        <p className="text-sm leading-7 text-muted">
          This is exactly where supplement summaries often go wrong: “meta-analysis was statistically significant” becomes “creatine treats depression.” The more accurate conclusion is that an adjunctive signal exists and deserves larger, better trials.
        </p>
      </section>

      <section className="card-premium max-w-4xl space-y-4 border-l-4 border-amber-500 bg-amber-50/40 p-6">
        <p className="eyebrow-label">Psychiatric safety boundary</p>
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Bipolar-spectrum risk should not be buried</h2>
        <p className="text-sm leading-7 text-muted">
          The 2026 systematic review of creatine monohydrate in mental disorders found only five randomized trials: four in major depressive disorder and one in bipolar depression. In the bipolar-depression trial, <strong>two of 17 creatine-treated participants experienced hypomania or mania</strong> [5].
        </p>
        <p className="text-sm leading-7 text-muted">
          That is far too small to quantify risk precisely, but it is important enough that creatine should not be marketed as a casual mood supplement for people with bipolar-spectrum illness. Psychiatric augmentation is a clinician-managed research context, not a do-it-yourself stack.
        </p>
      </section>

      <section className="card-premium max-w-4xl space-y-4 p-6">
        <p className="eyebrow-label">Formulation matters</p>
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Creatine monohydrate dominates the cognition literature</h2>
        <p className="text-sm leading-7 text-muted">
          All studies included in the 2024 adult-cognition meta-analysis used <strong>creatine monohydrate</strong> [1]. That matters when a commercial product claims a different form is “better for the brain.” A solubility, taste, or absorption claim is not evidence of superior cognitive outcomes.
        </p>
        <p className="text-sm leading-7 text-muted">
          The small menopause trial used creatine hydrochloride [8], so its findings should stay attached to that specific intervention and population rather than being generalized into a monohydrate-versus-HCl winner.
        </p>
      </section>

      <section className="card-premium max-w-4xl space-y-4 p-6">
        <p className="eyebrow-label">Kidney-marker nuance</p>
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Creatinine can rise without proving kidney damage</h2>
        <p className="text-sm leading-7 text-muted">
          Two recent kidney-function meta-analyses found that creatine supplementation can produce a modest increase in serum creatinine while showing no statistically significant deterioration in eGFR across the pooled studies [6,7]. A 2026 RCT-only meta-analysis likewise found higher serum creatinine without significant differences in urea or eGFR [6].
        </p>
        <p className="text-sm leading-7 text-muted">
          This creates a useful clinical interpretation issue: serum creatinine is both a breakdown product related to creatine metabolism and a laboratory input used to estimate kidney function. Someone taking creatine who has abnormal kidney labs should tell the clinician interpreting them. Existing kidney disease, dehydration, other medications, or a changing eGFR should not be dismissed as “just creatine” without evaluation.
        </p>
      </section>

      <section className="card-premium max-w-4xl space-y-4 p-6">
        <p className="eyebrow-label">Study dose ≠ daily brain protocol</p>
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Different questions used very different regimens</h2>
        <p className="text-sm leading-7 text-muted">
          Acute sleep-deprivation experiments used unusually large single body-weight-based exposures, while psychiatric and longer-term cognition trials used repeated daily regimens. Pooling those into one “best brain dose” is not evidence-based.
        </p>
        <p className="text-sm leading-7 text-muted">
          This guide therefore reports dose only when it is necessary to interpret a specific trial. It does not convert the sleep-deprivation experiments into a home protocol, prescribe a depression-augmentation dose, or claim that a sports-nutrition maintenance regimen is automatically the optimal cognitive regimen.
        </p>
      </section>

      <section id="creatine-brain-claim-boundaries" data-answer-engine-table="true" className="card-premium max-w-4xl scroll-mt-24 space-y-4 p-6">
        <p className="eyebrow-label">Evidence applicability</p>
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Claims we can and cannot make in 2026</h2>
        <div className="overflow-x-auto">
          <table className="min-w-[700px] w-full text-sm">
            <caption className="sr-only">Creatine brain-health claims and their current evidence status</caption>
            <thead>
              <tr className="border-b border-brand-900/10">
                <th scope="col" className="py-2 pr-4 text-left font-semibold text-ink">Claim</th>
                <th scope="col" className="py-2 text-left font-semibold text-ink">Current status</th>
              </tr>
            </thead>
            <tbody className="text-muted">
              <tr className="border-b border-brand-900/5"><th scope="row" className="py-3 pr-4 text-left font-normal">Creatine improves some cognitive domains on average</th><td className="py-3"><strong>Supported, modestly</strong></td></tr>
              <tr className="border-b border-brand-900/5"><th scope="row" className="py-3 pr-4 text-left font-normal">Creatine improves overall cognition/executive function</th><td className="py-3"><strong>Not established</strong></td></tr>
              <tr className="border-b border-brand-900/5"><th scope="row" className="py-3 pr-4 text-left font-normal">Creatine reliably prevents cognitive decline from sleep loss</th><td className="py-3"><strong>Promising but sparse</strong></td></tr>
              <tr className="border-b border-brand-900/5"><th scope="row" className="py-3 pr-4 text-left font-normal">Creatine is a proven antidepressant</th><td className="py-3"><strong>No</strong></td></tr>
              <tr className="border-b border-brand-900/5"><th scope="row" className="py-3 pr-4 text-left font-normal">Creatine has been tested broadly across psychiatric disorders</th><td className="py-3"><strong>No</strong> — RCT review found MDD and bipolar depression only</td></tr>
              <tr className="border-b border-brand-900/5"><th scope="row" className="py-3 pr-4 text-left font-normal">Creatine necessarily damages healthy kidneys because creatinine rises</th><td className="py-3"><strong>No</strong></td></tr>
              <tr><th scope="row" className="py-3 pr-4 text-left font-normal">One universal “brain dose” is established</th><td className="py-3"><strong>No</strong></td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="card-premium max-w-4xl space-y-4 p-6">
        <p className="eyebrow-label">Unanswered questions</p>
        <h2 className="text-2xl font-semibold tracking-tight text-ink">What would actually move the evidence forward?</h2>
        <ol className="list-decimal space-y-2 pl-5 text-sm leading-7 text-muted">
          <li>Which baseline brain-energy or dietary characteristics predict cognitive response?</li>
          <li>Do memory and processing-speed signals replicate in large preregistered trials?</li>
          <li>Does creatine meaningfully improve real-world function rather than only laboratory test scores?</li>
          <li>Can acute sleep-deprivation findings be reproduced without extreme experimental dosing?</li>
          <li>Does depression augmentation provide a clinically important benefit when bias is minimized?</li>
          <li>What is the true mood-switch risk in bipolar-spectrum populations?</li>
          <li>Are any non-monohydrate forms superior for a defined brain outcome?</li>
          <li>What do multi-year randomized data show for renal safety in older and medically complex populations?</li>
        </ol>
      </section>

      <section className="card-premium max-w-4xl space-y-4 p-6">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Bottom line</h2>
        <p className="text-sm leading-7 text-muted">
          Creatine is more scientifically interesting for brain health than a typical “nootropic” trend—but its strongest claim is not “everyone should take it for cognition.” The defensible 2026 position is narrower: modest benefits appear in some cognitive domains; sleep-deprivation findings are promising but sparse; depression evidence is uncertain and below the review&apos;s clinical-importance threshold on average; and psychiatric use carries context-specific cautions that sports-nutrition summaries often omit.
        </p>
      </section>

      <References refs={CREATINE_BRAIN_REFS} />
      <LegacyGuideFAQ pagePath="/guides/other/creatine-brain-health/" questions={[...FAQS]} />

      <div className="max-w-4xl rounded-xl border border-brand-900/10 bg-brand-50/40 p-4 text-xs leading-6 text-muted">
        <strong className="text-ink">Commercial-links boundary:</strong> product availability below does not establish that a retail creatine product reproduces any cognitive, psychiatric, menopause, or sleep-deprivation trial. Brain claims should stay attached to the specific formulation, population, dose, and outcome studied.
      </div>
      <div className="max-w-4xl">
        <RecommendationSection products={getRevenueProductSet('creatine')?.products ?? []} />
      </div>

      <EmailCapture
        headline="Get evidence reviews like this"
        description="Current supplement and drug research, with effect sizes, uncertainty, and safety boundaries left intact."
        ctaLabel="Get the evidence"
        location="guide-creatine-brain"
      />

      <div className="flex items-center justify-between border-t border-brand-900/10 pt-4">
        <Link
          href="/guides/"
          className="inline-flex rounded-full border border-brand-900/10 bg-[var(--surface-card)] px-4 py-2 text-sm font-bold text-ink transition hover:bg-brand-50"
        >
          ← Back to guides
        </Link>
        <Link href="/compounds/creatine/" className="text-sm font-bold text-brand-800 hover:underline">
          Creatine compound profile →
        </Link>
      </div>
    </div>
  )
}
