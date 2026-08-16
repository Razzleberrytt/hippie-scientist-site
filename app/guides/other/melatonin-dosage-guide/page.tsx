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
  title: 'Melatonin Dosing: Timing, Evidence & Safety (2026)',
  description:
    'Evidence-first melatonin dosing guide: why there is no universal dose, how timing and indication change the answer, chronic-insomnia limits, pediatric safety, and product-label variability.',
  path: '/guides/other/melatonin-dosage-guide/',
  openGraphType: 'article',
})

const FAQS = [
  {
    question: 'What is the best dose of melatonin for sleep?',
    answer:
      'There is no single evidence-based melatonin dose for every sleep problem. Dose, timing, age, formulation, and indication all matter. A 2024 dose-response meta-analysis of 26 randomized trials found pooled sleep-onset and total-sleep-time effects peaking around 4 mg/day, with earlier administration also influencing outcomes [3]. That is a meta-analytic pattern across heterogeneous studies, not a universal personal protocol.',
  },
  {
    question: 'Is lower-dose melatonin always better?',
    answer:
      'No. Lower doses can be appropriate in some circadian or sleep-onset contexts, but the evidence does not justify calling every 3-10 mg product overdosed or one narrow dose range universally optimal. The useful questions are what problem is being treated, when melatonin is taken relative to the desired sleep window, and whether melatonin is the right intervention at all [3].',
  },
  {
    question: 'Does melatonin work for chronic insomnia?',
    answer:
      'Melatonin can affect sleep timing and may modestly change some sleep outcomes, but the American Academy of Sleep Medicine pharmacologic guideline suggests not using melatonin for routine treatment of adult sleep-onset or sleep-maintenance insomnia [2]. A separate AASM behavioral guideline strongly recommends multicomponent CBT-I for chronic insomnia [5].',
  },
  {
    question: 'Does melatonin help jet lag?',
    answer:
      'Yes, there is direct randomized-trial evidence for jet lag. A Cochrane review found benefit when melatonin was taken near target bedtime after crossing multiple time zones, while emphasizing that timing matters and poorly timed use can delay adaptation [8]. Travel direction, destination bedtime, and light exposure still matter.',
  },
  {
    question: 'Is melatonin safe for children?',
    answer:
      'Short-term use may help selected pediatric sleep problems, but long-term safety remains uncertain. A 2023 systematic review found more non-serious adverse events with melatonin and very limited long-term developmental evidence [7]. The American Academy of Sleep Medicine advises parents to discuss melatonin with a pediatric health professional and to store it securely [4].',
  },
]

const MELATONIN_REFS = [
  {
    n: 1,
    text: 'National Center for Complementary and Integrative Health. Melatonin: What You Need To Know.',
    url: 'https://www.nccih.nih.gov/health/melatonin-what-you-need-to-know',
  },
  {
    n: 2,
    text: 'Sateia MJ, et al. (2017). Clinical Practice Guideline for the Pharmacologic Treatment of Chronic Insomnia in Adults. J Clin Sleep Med, 13(2):307-349.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/27998379/',
  },
  {
    n: 3,
    text: 'Cruz-Sanabria F, et al. (2024). Optimizing the Time and Dose of Melatonin as a Sleep-Promoting Drug: A Systematic Review and Dose-Response Meta-Analysis. J Pineal Res, 76(5):e12985.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/38888087/',
  },
  {
    n: 4,
    text: 'American Academy of Sleep Medicine. Health Advisory: Melatonin Use in Children and Adolescents.',
    url: 'https://aasm.org/advocacy/position-statements/melatonin-use-in-children-and-adolescents-health-advisory/',
  },
  {
    n: 5,
    text: 'Edinger JD, et al. (2021). Behavioral and psychological treatments for chronic insomnia disorder in adults: an AASM clinical practice guideline. J Clin Sleep Med, 17(2):255-262.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/33164742/',
  },
  {
    n: 6,
    text: 'Cohen PA, et al. (2023). Quantity of Melatonin and CBD in Melatonin Gummies Sold in the US. JAMA, 329(16):1401-1402.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/37097362/',
  },
  {
    n: 7,
    text: 'Händel MN, et al. (2023). The short-term and long-term adverse effects of melatonin treatment in children and adolescents: a systematic review and GRADE assessment. EClinicalMedicine, 61:102083.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/37483551/',
  },
  {
    n: 8,
    text: 'Herxheimer A, Petrie KJ. (2002). Melatonin for the prevention and treatment of jet lag. Cochrane Database Syst Rev, (2):CD001520.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/12076414/',
  },
]

const evidenceCards = [
  {
    title: 'Chronic insomnia',
    evidence:
      'Melatonin can change sleep timing and may modestly affect sleep-onset measures, but AASM suggests against routine melatonin treatment for adult sleep-onset or sleep-maintenance insomnia [2].',
    boundary:
      'CBT-I has a strong AASM recommendation for chronic insomnia [5]. Persistent insomnia deserves evaluation rather than repeated dose escalation.',
  },
  {
    title: 'Jet lag and circadian timing',
    evidence:
      'A Cochrane review found melatonin reduced jet-lag symptoms when used near destination bedtime after crossing multiple time zones [8].',
    boundary:
      'Timing relative to the destination sleep window and light exposure matters. A fixed “take X mg at bedtime” rule is too crude for a clock-shifting intervention.',
  },
  {
    title: 'Dose-response evidence',
    evidence:
      'A 2024 meta-analysis of 26 randomized trials found pooled sleep-onset and total-sleep-time responses increasing with dose and peaking around 4 mg/day; administration timing also predicted outcomes [3].',
    boundary:
      'The pooled optimum is not a personal dosing prescription. Populations, formulations, doses, timing, and sleep problems varied substantially across trials.',
  },
]

const decisionRows = [
  {
    situation: 'Occasional difficulty falling asleep',
    nextStep:
      'Check caffeine, alcohol, light exposure, schedule drift, stress, and sleep opportunity before assuming the milligram dose is the main problem.',
  },
  {
    situation: 'Chronic insomnia lasting weeks or months',
    nextStep:
      'Prioritize CBT-I and evaluation for sleep apnea, restless legs, medication effects, mood/anxiety, pain, and circadian problems rather than escalating melatonin [2,5].',
  },
  {
    situation: 'Jet lag or a shifted body clock',
    nextStep:
      'Treat melatonin as a timing signal. Destination bedtime, travel direction, and light exposure change the plan; the evidence supports near-target-bedtime use for jet lag rather than one universal dose schedule [8].',
  },
  {
    situation: 'Child or teenager',
    nextStep:
      'Discuss the decision with a pediatric health professional. Long-term developmental safety remains uncertain, and secure storage matters because accidental ingestions have increased [4,7].',
  },
]

export default function MelatoninDosingPage() {
  return (
    <div className="container-page py-10 space-y-10">
      <AuthorityJsonLd
        title="Melatonin Dosing: Timing, Evidence and Safety"
        description="Evidence-first review of melatonin dose, timing, insomnia, jet lag, pediatric safety, and product-label variability."
        url="https://thehippiescientist.net/guides/other/melatonin-dosage-guide"
        type="Article"
        citationUrls={MELATONIN_REFS.map((ref) => ref.url)}
      />
      <AuthorityBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Guides', href: '/guides/' },
          { label: 'Melatonin Dosing' },
        ]}
      />

      <section className="space-y-5 max-w-4xl">
        <p className="eyebrow-label">Evidence Review · 8 References</p>
        <h1 className="text-5xl font-bold tracking-tight text-ink">Melatonin Dosing: Why There Is No Universal “Best Dose”</h1>
        <p className="text-lg leading-8 text-muted">
          Melatonin is a circadian signal, so the useful question is not simply “how many milligrams?” The reason for use, timing relative to the desired sleep window, age, formulation, and light exposure can all change the answer. Older advice often treats 0.3–1 mg as universally optimal and higher doses as inherently excessive. Current evidence is not that simple.
        </p>
        <figure className="mt-6">
          <div className="overflow-hidden rounded-2xl border border-brand-900/10 shadow-sm bg-white">
            <Image
              src="/images/guides/melatonin-dosage-guide.jpg"
              alt="Melatonin supplement beside a sleep mask and clock for a timing-focused evidence review"
              width={1536}
              height={1024}
              priority
              className="w-full h-auto"
            />
          </div>
          <figcaption className="mt-3 text-center text-sm text-muted">
            With melatonin, indication and timing can matter as much as the number on the label.
          </figcaption>
        </figure>
      </section>

      <LegacyGuideQuickAnswer referencesHref="#references">
        <p>There is <strong>no single evidence-based melatonin dose for every sleep problem</strong>. In a 2024 dose-response meta-analysis, pooled sleep-promoting outcomes peaked around 4 mg/day and were influenced by administration timing [3], but that does not make 4 mg three hours before bed a universal self-treatment protocol. For chronic insomnia, AASM suggests against routine melatonin use and strongly recommends CBT-I [2,5]. Melatonin has a different evidence profile for circadian problems such as jet lag, where timing near destination bedtime matters [8].</p>
      </LegacyGuideQuickAnswer>

      <section className="grid gap-5 lg:grid-cols-3">
        {evidenceCards.map((card) => (
          <article key={card.title} className="card-premium p-6 space-y-4">
            <h2 className="text-xl font-semibold text-ink">{card.title}</h2>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-800">What the evidence suggests</p>
              <p className="mt-2 text-sm leading-6 text-muted">{card.evidence}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-amber-800">Decision boundary</p>
              <p className="mt-2 text-sm leading-6 text-muted">{card.boundary}</p>
            </div>
          </article>
        ))}
      </section>

      <section id="melatonin-decision-table" data-answer-engine-table="true" className="space-y-4 max-w-5xl scroll-mt-24">
        <h2 className="text-3xl font-semibold tracking-tight text-ink">Choose the sleep problem before choosing a dose</h2>
        <div className="overflow-x-auto rounded-2xl border border-brand-900/10 bg-white/90 dark:border-white/10 dark:bg-white/5">
          <table className="min-w-[760px] w-full text-left text-sm">
            <caption className="sr-only">Melatonin decision guide by sleep situation and evidence-informed next question</caption>
            <thead>
              <tr className="border-b border-brand-900/10 text-ink">
                <th scope="col" className="p-4">Situation</th>
                <th scope="col" className="p-4">Better next question</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-900/10 text-muted">
              {decisionRows.map((row) => (
                <tr key={row.situation}>
                  <th scope="row" className="p-4 font-semibold text-left text-ink">{row.situation}</th>
                  <td className="p-4 leading-6">{row.nextStep}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card-premium p-6 space-y-4 max-w-4xl">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Product quality changes the dosing conversation</h2>
        <p className="text-sm leading-7 text-muted">
          In the United States, melatonin is sold as a dietary supplement rather than an FDA-approved insomnia drug. In a 2023 analysis of 25 melatonin gummy products, 22 were inaccurately labeled; among products containing detectable melatonin, measured content ranged from 74% to 347% of the labeled amount [6]. That means a label dose is not always the dose a person actually receives.
        </p>
        <p className="text-sm leading-7 text-muted">
          This variability is one reason a dosing guide should not double as a product-selling page. A precise-looking milligram recommendation can create false confidence when formulation quality, timing, and the actual sleep diagnosis are still uncertain.
        </p>
      </section>

      <section className="rounded-2xl border border-amber-900/15 bg-amber-50/70 p-6 text-amber-950 dark:border-amber-200/20 dark:bg-amber-950/20 dark:text-amber-50">
        <p className="text-xs font-bold uppercase tracking-[0.16em]">Safety boundary</p>
        <h2 className="mt-2 text-2xl font-semibold">Children and long-term use need extra caution</h2>
        <p className="mt-3 text-sm leading-7">
          Short-term melatonin is generally associated with few serious adverse events, but robust long-term safety data remain limited [1]. In children and adolescents with chronic insomnia, a 2023 systematic review found an increase in non-serious adverse events and very limited, low-certainty evidence about longer-term pubertal development; the authors cautioned against complacent long-term use [7]. The American Academy of Sleep Medicine advises parents to discuss melatonin with a pediatric health professional and keep supplements out of children&rsquo;s reach [4]. Persistent sleep problems should be evaluated rather than managed indefinitely by escalating a supplement dose.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/safety-checker/" className="rounded-full bg-amber-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-950 dark:bg-amber-100 dark:text-amber-950">
            Check supplement interactions
          </Link>
          <Link href="/guides/sleep/" className="rounded-full border border-amber-900/20 px-4 py-2 text-sm font-semibold text-amber-950 transition hover:bg-white/60 dark:border-amber-100/30 dark:text-amber-50">
            Browse sleep guides
          </Link>
        </div>
      </section>

      <References refs={MELATONIN_REFS} />
      <LegacyGuideFAQ pagePath="/guides/other/melatonin-dosage-guide/" questions={FAQS} />
      <EmailCapture
        headline="Get evidence reviews like this"
        description="Sleep evidence, timing, and safety — without one-size-fits-all protocols."
        ctaLabel="Get the evidence"
        location="guide-melatonin-dosing"
      />
      <div className="pt-4 border-t border-brand-900/10 flex items-center justify-between">
        <Link href="/guides/" className="inline-flex rounded-full border border-brand-900/10 bg-[var(--surface-card)] px-4 py-2 text-sm font-bold text-ink transition hover:bg-brand-50">
          ← Back to guides
        </Link>
        <Link href="/guides/sleep/best-supplements-for-sleep/" className="text-sm font-bold text-brand-800 hover:underline">
          Best sleep supplements →
        </Link>
      </div>
    </div>
  )
}
