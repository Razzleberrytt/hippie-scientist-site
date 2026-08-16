import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { buildPageMetadata } from '../../../../src/lib/seo'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import LegacyGuideFAQ from '@/components/LegacyGuideFAQ'
import LegacyGuideQuickAnswer from '@/components/LegacyGuideQuickAnswer'
import References from '@/components/References'
import EmailCapture from '@/components/EmailCapture'

export const metadata: Metadata = buildPageMetadata({
  title: 'Brain Fog & Fatigue Supplements: Evidence and Causes (2026)',
  description:
    'Evidence-first guide to brain fog and fatigue: why cause-finding comes before supplements, what creatine, rhodiola, and caffeine plus L-theanine studies actually show, and when persistent symptoms deserve evaluation.',
  path: '/guides/other/supplements-for-brain-fog-and-fatigue/',
  openGraphType: 'article',
})

const FAQS = [
  {
    question: 'What is the best supplement for brain fog and fatigue?',
    answer:
      'There is no universal best supplement because brain fog and fatigue are symptoms, not a single diagnosis. Persistent symptoms can occur with sleep disorders, anemia or iron problems, thyroid disease, medication effects, infection, nutritional problems, mood disorders, and other conditions. The first high-value step is identifying the pattern and cause rather than assuming a supplement deficiency.',
  },
  {
    question: 'Does creatine help brain fog?',
    answer:
      'Creatine can increase brain creatine stores, but a 2024 systematic review found overall cognitive results to be equivocal. Some stressed populations such as sleep-deprived people may be worth further study, but current evidence does not establish creatine as a general treatment for chronic brain fog.',
  },
  {
    question: 'Does rhodiola help fatigue?',
    answer:
      'Rhodiola has been studied for physical and mental fatigue, but the systematic-review evidence is contradictory and many trials have important risk-of-bias or reporting limitations. That makes it an uncertain option rather than an established fatigue treatment.',
  },
  {
    question: 'Does caffeine plus L-theanine treat brain fog?',
    answer:
      'The combination has direct randomized-trial evidence for some acute attention and mood outcomes in healthy participants. A 2025 meta-analysis found small-to-moderate task-specific signals, with uncertainty around several estimates. That is short-term performance evidence, not proof that the combination treats persistent fatigue or an underlying medical cause.',
  },
  {
    question: 'When should brain fog or fatigue be evaluated?',
    answer:
      'Evaluation is more important when symptoms are persistent, worsening, associated with major loss of function, post-exertional worsening, unrefreshing sleep, shortness of breath, fainting or orthostatic symptoms, substantial mood change, or other concerning symptoms. CDC guidance for chronic fatigue evaluation emphasizes history, examination, and targeted testing to rule out other common causes rather than relying on one symptom or supplement response.',
  },
] as const

const BRAIN_FOG_REFS = [
  {
    n: 1,
    text: 'Centers for Disease Control and Prevention. (2026). Evaluation of ME/CFS. Cause-finding framework for persistent fatigue, including targeted laboratory and sleep evaluation when indicated.',
    url: 'https://www.cdc.gov/me-cfs/hcp/diagnosis-testing/evaluation-of-me-cfs.html',
  },
  {
    n: 2,
    text: 'McMorris T, et al. (2024). Creatine supplementation research fails to support the theoretical basis for an effect on cognition: Evidence from a systematic review. Behav Brain Res, 466:114982.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/38582412/',
  },
  {
    n: 3,
    text: 'Ishaque S, et al. (2012). Rhodiola rosea for physical and mental fatigue: a systematic review. BMC Complement Altern Med, 12:70.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/22643043/',
  },
  {
    n: 4,
    text: 'Payne ER, et al. (2025). Effects of tea, L-theanine, or L-theanine plus caffeine on cognition, sleep, and mood: systematic review and meta-analysis of randomized controlled trials. Nutr Rev, 83(10):1873-1891.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/40314930/',
  },
]

const evidenceRows = [
  {
    option: 'Creatine',
    directlyStudied: 'Brain creatine and cognitive outcomes across human supplementation studies [2].',
    signal: 'Brain creatine can rise; cognitive findings are mixed overall.',
    limitation: 'Not established as a general treatment for persistent brain fog or fatigue.',
  },
  {
    option: 'Rhodiola rosea',
    directlyStudied: 'Physical and mental fatigue in controlled trials [3].',
    signal: 'Some positive fatigue findings.',
    limitation: 'Contradictory results and substantial study-quality limitations.',
  },
  {
    option: 'Caffeine + L-theanine',
    directlyStudied: 'Acute cognition and mood outcomes in randomized trials [4].',
    signal: 'Small-to-moderate task-specific attention/mood signals in the first hours after use.',
    limitation: 'Acute performance evidence does not diagnose or treat the cause of chronic fatigue.',
  },
]

const causeRows = [
  {
    pattern: 'New or persistent fatigue with reduced function',
    betterQuestion: 'What changed, how long has it lasted, and is there a medical, sleep, nutritional, medication, or mental-health contributor?',
  },
  {
    pattern: 'Fatigue plus cognitive slowing or concentration problems',
    betterQuestion: 'Are sleep quality, iron status/anemia, thyroid function, medications/substances, or another illness contributing?',
  },
  {
    pattern: 'Symptoms worsen substantially after exertion',
    betterQuestion: 'Is there post-exertional malaise or another exertion-related pattern that needs clinical evaluation rather than stimulant compensation?',
  },
  {
    pattern: 'Short-term need for alertness in an otherwise healthy person',
    betterQuestion: 'Is this a temporary performance question rather than persistent unexplained fatigue? Acute caffeine/theanine data are relevant only to the former.',
  },
]

export default function BrainFogFatiguePage() {
  return (
    <div className="container-page py-10 space-y-10">
      <AuthorityJsonLd
        title="Brain Fog and Fatigue Supplements: Evidence and Causes"
        description="Cause-first review of persistent fatigue and cognitive complaints, plus direct evidence for creatine, rhodiola, and caffeine with L-theanine."
        url="https://thehippiescientist.net/guides/other/supplements-for-brain-fog-and-fatigue"
        type="MedicalWebPage"
        citationUrls={BRAIN_FOG_REFS.map((ref) => ref.url)}
      />
      <AuthorityBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Guides', href: '/guides/' },
          { label: 'Brain Fog & Fatigue' },
        ]}
      />

      <section className="space-y-5 max-w-4xl">
        <p className="eyebrow-label">Evidence Review · Cause before supplement</p>
        <h1 className="text-5xl font-bold tracking-tight text-ink">Brain Fog and Fatigue: Find the Cause Before Building a Supplement Plan</h1>
        <p className="text-lg leading-8 text-muted">
          “Brain fog” and fatigue describe experiences, not a single disease. Poor sleep, anemia or iron problems, thyroid disease, medication effects, nutritional problems, infection, mood disorders, and other conditions can overlap with the same complaints. That makes a supplement-first answer deceptively simple: the useful first question is what pattern is present and what needs to be ruled out.
        </p>
        <figure className="mt-6">
          <div className="overflow-hidden rounded-2xl border border-brand-900/10 shadow-sm bg-white">
            <Image
              src="/images/guides/supplements-for-brain-fog-and-fatigue.jpg"
              alt="Supplements beside notes for an evidence review of brain fog and fatigue"
              width={1536}
              height={1024}
              priority
              className="w-full h-auto"
            />
          </div>
          <figcaption className="mt-3 text-center text-sm text-muted">
            Persistent fatigue deserves cause-finding; short-term alertness research answers a different question.
          </figcaption>
        </figure>
      </section>

      <LegacyGuideQuickAnswer referencesHref="#references">
        <p>
          There is <strong>no evidence-based universal supplement for “brain fog” or fatigue</strong>. CDC guidance for chronic-fatigue evaluation emphasizes history, examination, and targeted testing to identify or rule out other causes [1]. Creatine can raise brain creatine but has mixed cognitive results overall [2]. Rhodiola has contradictory fatigue evidence with study-quality problems [3]. Caffeine plus L-theanine has direct evidence for some <em>acute</em> attention and mood outcomes, but that does not make it a treatment for persistent unexplained fatigue [4].
        </p>
      </LegacyGuideQuickAnswer>

      <section id="brain-fog-cause-table" data-answer-engine-table="true" className="space-y-4 max-w-5xl scroll-mt-24">
        <h2 className="text-3xl font-semibold tracking-tight text-ink">Choose the problem before choosing a product</h2>
        <div className="overflow-x-auto rounded-2xl border border-brand-900/10 bg-white/90 dark:border-white/10 dark:bg-white/5">
          <table className="min-w-[820px] w-full text-left text-sm">
            <caption className="sr-only">Brain fog and fatigue patterns with the better next question before supplement use</caption>
            <thead>
              <tr className="border-b border-brand-900/10 text-ink">
                <th scope="col" className="p-4">Pattern</th>
                <th scope="col" className="p-4">Better next question</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-900/10 text-muted">
              {causeRows.map((row) => (
                <tr key={row.pattern}>
                  <th scope="row" className="p-4 font-semibold text-left text-ink">{row.pattern}</th>
                  <td className="p-4 leading-6">{row.betterQuestion}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section id="brain-fog-supplement-evidence" data-answer-engine-table="true" className="card-premium p-6 space-y-4 max-w-5xl scroll-mt-24">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">What the supplement evidence actually tested</h2>
        <div className="overflow-x-auto">
          <table className="min-w-[900px] w-full text-left text-sm">
            <caption className="sr-only">Creatine, rhodiola, and caffeine plus L-theanine evidence compared by directly studied outcome and main limitation</caption>
            <thead>
              <tr className="border-b border-brand-900/10 text-ink">
                <th scope="col" className="py-3 pr-4">Option</th>
                <th scope="col" className="py-3 pr-4">Directly studied</th>
                <th scope="col" className="py-3 pr-4">Signal</th>
                <th scope="col" className="py-3">Main limitation</th>
              </tr>
            </thead>
            <tbody className="text-muted">
              {evidenceRows.map((row) => (
                <tr key={row.option} className="border-b border-brand-900/5 last:border-0 align-top">
                  <th scope="row" className="py-3 pr-4 text-left font-semibold text-ink">{row.option}</th>
                  <td className="py-3 pr-4">{row.directlyStudied}</td>
                  <td className="py-3 pr-4">{row.signal}</td>
                  <td className="py-3">{row.limitation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card-premium p-6 space-y-4 max-w-4xl">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Why cause-finding has higher ROI than guessing from symptoms</h2>
        <p className="text-sm leading-7 text-muted">
          CDC’s 2026 evaluation framework for chronic fatigue uses the symptom pattern, medical history, physical examination, and targeted testing to rule out other illnesses [1]. Depending on the presentation, that can include a complete blood count, thyroid testing, iron studies, celiac screening, and additional evaluation such as sleep studies. The point is not that every person needs every test; it is that persistent fatigue is too nonspecific to diagnose from a supplement response.
        </p>
        <p className="text-sm leading-7 text-muted">
          A stimulant can temporarily improve alertness while leaving the cause untouched. Likewise, feeling better after a nutrient does not prove that a deficiency caused the original symptoms. If fatigue is persistent, worsening, or causing meaningful loss of function, evaluation usually has more information value than adding another product.
        </p>
      </section>

      <section className="rounded-2xl border border-amber-900/15 bg-amber-50/70 p-6 text-amber-950 dark:border-amber-200/20 dark:bg-amber-950/20 dark:text-amber-50">
        <p className="text-xs font-bold uppercase tracking-[0.16em]">Safety boundary</p>
        <h2 className="mt-2 text-2xl font-semibold">Do not use stimulation to mask a safety problem</h2>
        <p className="mt-3 text-sm leading-7">
          Severe daytime sleepiness, symptoms that impair driving or work safety, fainting, marked shortness of breath, major functional decline, substantial post-exertional worsening, or persistent unexplained symptoms deserve evaluation rather than escalating caffeine or supplement combinations. Medication and substance use can also change both fatigue and supplement risk.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/safety-checker/" className="rounded-full bg-amber-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-950 dark:bg-amber-100 dark:text-amber-950">
            Check supplement interactions
          </Link>
          <Link href="/guides/other/nootropic-stacking-guide/" className="rounded-full border border-amber-900/20 px-4 py-2 text-sm font-semibold text-amber-950 transition hover:bg-white/60 dark:border-amber-100/30 dark:text-amber-50">
            Read the combination-evidence guide
          </Link>
        </div>
      </section>

      <References refs={BRAIN_FOG_REFS} />
      <LegacyGuideFAQ pagePath="/guides/other/supplements-for-brain-fog-and-fatigue/" questions={[...FAQS]} />

      <section className="card-premium p-6 space-y-3 max-w-4xl">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Related evidence reviews</h2>
        <div className="flex flex-wrap gap-4 text-sm font-semibold text-brand-800">
          <Link href="/guides/other/creatine-brain-health/" className="hover:underline">Creatine and brain health →</Link>
          <Link href="/guides/other/nootropic-stacking-guide/" className="hover:underline">Nootropic combination evidence →</Link>
          <Link href="/guides/other/iron-supplement-guide/" className="hover:underline">Iron testing and supplementation →</Link>
          <Link href="/guides/other/sleep-supplements-guide/" className="hover:underline">Sleep supplements →</Link>
        </div>
      </section>

      <EmailCapture
        headline="Get evidence reviews like this"
        description="Cause-first supplement evidence without symptom-to-product shortcuts."
        ctaLabel="Get the evidence"
        location="guides-supplements-for-brain-fog-and-fatigue"
      />

      <div className="pt-4 border-t border-brand-900/10 flex items-center justify-between">
        <Link href="/guides/" className="inline-flex rounded-full border border-brand-900/10 bg-[var(--surface-card)] px-4 py-2 text-sm font-bold text-ink transition hover:bg-brand-50">
          ← Back to guides
        </Link>
        <Link href="/learn/evidence-literacy/" className="text-sm font-bold text-brand-800 hover:underline">
          Evidence literacy →
        </Link>
      </div>
    </div>
  )
}
