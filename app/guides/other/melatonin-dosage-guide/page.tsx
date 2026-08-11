import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { buildPageMetadata } from '../../../../src/lib/seo'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import FAQSchema from '@/components/seo/FAQSchema'
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
      'There is no single evidence-based melatonin dose for every sleep problem. Dose, timing, age, formulation, and the reason for use all matter. A 2024 dose-response meta-analysis of randomized trials did not support the simple claim that 0.3–1 mg is always as effective as higher doses; the pooled sleep-promoting response peaked around 4 mg, with earlier administration also influencing outcomes. That is study context, not a universal protocol.',
  },
  {
    question: 'Is lower-dose melatonin always better?',
    answer:
      'No. Lower doses can be appropriate in some circadian or sleep-onset contexts, but the evidence does not justify calling all 3–10 mg products overdosed or claiming one narrow dose range is universally optimal. The useful question is what problem is being treated, when melatonin is taken relative to the desired sleep window, and whether melatonin is the right tool at all.',
  },
  {
    question: 'Does melatonin work for chronic insomnia?',
    answer:
      'Melatonin may modestly improve sleep-onset latency in some studies, but major sleep guidelines have recommended against using it as routine treatment for chronic insomnia because the overall evidence is limited. CBT-I is the strongest recommended treatment for chronic insomnia. Persistent insomnia deserves evaluation for behavioral, circadian, medication, breathing, movement, and mental-health contributors.',
  },
  {
    question: 'Does melatonin help jet lag?',
    answer:
      'Research summarized by NCCIH suggests melatonin may help jet-lag symptoms, particularly after travel across multiple time zones. Timing matters because melatonin is a circadian signal, not simply a sedative. The ideal schedule depends on travel direction, destination bedtime, light exposure, and individual sensitivity rather than one fixed dose table.',
  },
  {
    question: 'Is melatonin safe for children?',
    answer:
      'Short-term use may help certain pediatric sleep problems, but long-term safety and optimal dosing remain uncertain. The American Academy of Sleep Medicine advises that parents should discuss melatonin with a pediatric health professional before use. Product-label variability and accidental ingestion are additional concerns, especially with gummies.',
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
    text: 'National Center for Complementary and Integrative Health. Sleep Disorders and Complementary Health Approaches: Usefulness and Safety.',
    url: 'https://www.nccih.nih.gov/health/sleep-disorders-and-complementary-health-approaches',
  },
  {
    n: 3,
    text: 'Cruz-Sanabria F, et al. (2024). Optimizing the Time and Dose of Melatonin as a Sleep-Promoting Drug: A Systematic Review and Dose-Response Meta-Analysis. J Pineal Res. PMID: 38888087.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/38888087/',
  },
  {
    n: 4,
    text: 'American Academy of Sleep Medicine. Health Advisory: Melatonin Use in Children and Adolescents.',
    url: 'https://aasm.org/advocacy/position-statements/melatonin-use-in-children-and-adolescents-health-advisory/',
  },
]

const evidenceCards = [
  {
    title: 'Chronic insomnia',
    evidence:
      'Melatonin can change sleep timing and may modestly shorten sleep-onset latency, but evidence for chronic insomnia is inconsistent and guideline support is weak.',
    boundary:
      'Do not turn a supplement dose into the main treatment plan. CBT-I is the strongest recommended treatment for chronic insomnia, and persistent symptoms deserve evaluation.',
  },
  {
    title: 'Jet lag and circadian timing',
    evidence:
      'Melatonin is better supported when the problem is circadian misalignment, such as jet lag or delayed sleep timing, than when the problem is generic chronic insomnia.',
    boundary:
      'Timing relative to the destination sleep window and light exposure can matter as much as dose. A fixed “take X mg at bedtime” rule is too crude for a clock-shifting intervention.',
  },
  {
    title: 'Dose-response evidence',
    evidence:
      'A 2024 meta-analysis of 26 randomized trials found a dose-response relationship for sleep onset and total sleep time, with the pooled response peaking around 4 mg and earlier administration associated with better outcomes [3].',
    boundary:
      'That pooled result does not make 4 mg the correct personal dose. The studies were heterogeneous, and indication, formulation, timing, age, and baseline sleep problem all varied.',
  },
]

const decisionRows = [
  {
    situation: 'Occasional difficulty falling asleep',
    nextStep:
      'Check caffeine, alcohol, light exposure, schedule drift, stress, and sleep opportunity before assuming the dose is the main problem.',
  },
  {
    situation: 'Chronic insomnia lasting weeks or months',
    nextStep:
      'Prioritize CBT-I and evaluation for sleep apnea, restless legs, medication effects, mood/anxiety, pain, and circadian problems rather than escalating melatonin.',
  },
  {
    situation: 'Jet lag or a shifted body clock',
    nextStep:
      'Treat melatonin as a timing signal. Travel direction, destination bedtime, and light exposure change the schedule; individualized timing matters more than copying a universal dose.',
  },
  {
    situation: 'Child or teenager',
    nextStep:
      'Discuss the decision with a pediatric health professional. Many pediatric sleep problems respond to schedule and behavior changes, and long-term melatonin safety remains uncertain.',
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
      <FAQSchema pagePath="/guides/other/melatonin-dosage-guide/" questions={FAQS} />

      <section className="space-y-5 max-w-4xl">
        <p className="eyebrow-label">Evidence Review · Dose and timing recalibrated</p>
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

      <section className="card-premium p-6 space-y-4 border-l-4 border-brand-700 bg-brand-50/30">
        <p className="text-xs font-bold uppercase tracking-wider text-brand-700">Quick answer</p>
        <h2 className="text-2xl font-semibold text-ink">There is no single evidence-based melatonin dose for every sleep problem</h2>
        <p className="text-sm leading-7 text-muted">
          Low-dose melatonin can be useful in some settings, but current randomized-trial evidence does not support the blanket claim that 0.3–1 mg is always as effective as higher doses. A 2024 dose-response meta-analysis found that sleep-promoting effects in the pooled studies increased with dose and peaked around 4 mg, while earlier administration also influenced outcomes [3]. That result is study context, not a universal protocol: the included populations, formulations, doses, and sleep problems varied.
        </p>
        <p className="text-sm leading-7 text-muted">
          For chronic insomnia, dose optimization may be the wrong question altogether. NCCIH notes that CBT-I is the strongest recommended treatment for insomnia and that clinical guidelines have recommended against melatonin as routine treatment for chronic insomnia [2].
        </p>
      </section>

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

      <section className="space-y-4 max-w-5xl">
        <h2 className="text-3xl font-semibold tracking-tight text-ink">Choose the sleep problem before choosing a dose</h2>
        <div className="overflow-x-auto rounded-2xl border border-brand-900/10 bg-white/90 dark:border-white/10 dark:bg-white/5">
          <table className="min-w-[760px] w-full text-left text-sm">
            <thead>
              <tr className="border-b border-brand-900/10 text-ink">
                <th className="p-4">Situation</th>
                <th className="p-4">Better next question</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-900/10 text-muted">
              {decisionRows.map((row) => (
                <tr key={row.situation}>
                  <td className="p-4 font-semibold text-ink">{row.situation}</td>
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
          In the United States, melatonin is sold as a dietary supplement rather than an approved insomnia drug. NCCIH summarizes a 2023 analysis of 25 melatonin gummy products in which measured melatonin ranged from 74% to 347% of the labeled amount [1]. That means a label dose is not always the dose a person actually receives.
        </p>
        <p className="text-sm leading-7 text-muted">
          This variability is one reason a dosing guide should not double as a product-selling page. A precise-looking milligram recommendation can create false confidence when formulation quality, timing, and the actual sleep diagnosis are still uncertain.
        </p>
      </section>

      <section className="rounded-2xl border border-amber-900/15 bg-amber-50/70 p-6 text-amber-950 dark:border-amber-200/20 dark:bg-amber-950/20 dark:text-amber-50">
        <p className="text-xs font-bold uppercase tracking-[0.16em]">Safety boundary</p>
        <h2 className="mt-2 text-2xl font-semibold">Children and long-term use need extra caution</h2>
        <p className="mt-3 text-sm leading-7">
          Melatonin appears relatively safe for short-term use, but long-term safety is less certain [1,2]. The American Academy of Sleep Medicine advises that parents should discuss melatonin with a pediatric health professional before giving it to a child or adolescent [4]. Product variability, flavored gummies, and accidental ingestion also make safe storage important. NCCIH notes additional caution for people with epilepsy or those taking blood thinners, and persistent sleep problems should be evaluated rather than managed indefinitely by escalating a supplement dose [1].
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
