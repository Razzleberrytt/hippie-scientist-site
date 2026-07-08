import type { Metadata } from 'next'
import Link from 'next/link'
import { buildPageMetadata } from '../../../../src/lib/seo'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import CitationReadySummary from '@/components/seo/CitationReadySummary'
import References from '@/components/References'

export const metadata: Metadata = buildPageMetadata({
  title: 'Caffeine vs L-Theanine: Focus, Anxiety, Timing & Safety',
  description:
    'Caffeine vs L-theanine for focus: how they differ, why they are often combined, timing, dose logic, side effects, anxiety risk, sleep impact, and safety-first stacking guidance.',
  path: '/guides/compare/caffeine-vs-l-theanine/',
})

const CAFFEINE_VS_L_THEANINE_REFS = [
  { n: 1, text: 'Haskell CF, et al. (2008). L-theanine, caffeine, cognition and mood. Biol Psychol, 77(2): 113-122.', url: 'https://pubmed.ncbi.nlm.nih.gov/18006208/' },
  { n: 2, text: 'Giesbrecht T, et al. (2010). L-theanine and caffeine improve cognitive performance and alertness. Nutr Neurosci, 13(6): 283-290.', url: 'https://pubmed.ncbi.nlm.nih.gov/21040626/' },
  { n: 3, text: 'Dodd FL, et al. (2015). L-theanine and stress-related responses. J Psychopharmacol, 29(4): 457-463.', url: 'https://pubmed.ncbi.nlm.nih.gov/25784529/' },
  { n: 4, text: 'Nehlig A. (2010). Caffeine and cognition. J Alzheimers Dis, 20(S1): S85-S94.', url: 'https://pubmed.ncbi.nlm.nih.gov/20182035/' },
]

const citationUrls = CAFFEINE_VS_L_THEANINE_REFS.map((ref) => ref.url).filter(Boolean)

const comparisonRows = [
  ['Best fit', 'Fast alertness, vigilance, physical energy, and short-term fatigue masking.', 'Calm focus, smoother caffeine response, stress-sensitive attention, and less jittery concentration.'],
  ['Onset', 'Usually noticeable within 15 to 45 minutes.', 'Often used 30 to 90 minutes before the desired calm-focus window.'],
  ['Main tradeoff', 'Can worsen anxiety, palpitations, blood pressure, sleep timing, tolerance, and crash cycles.', 'Usually gentler, but can feel too calming for some people and may interact with sedating stacks.'],
  ['Sleep impact', 'Late-day use can delay sleep and reduce sleep pressure.', 'Less likely to disrupt sleep, but it is not a substitute for sleep debt recovery.'],
  ['Typical pairing logic', 'Often paired with L-theanine when caffeine works but feels physically harsh.', 'Often paired around a 2:1 theanine-to-caffeine logic, but sensitivity matters more than a fixed ratio.'],
]

const decisionQuestions = [
  'Do you need immediate alertness, calmer attention, or less anxiety from caffeine you already use?',
  'Is the real problem focus, sleep debt, caffeine withdrawal, ADHD symptoms, anxiety, or poor task structure?',
  'Does caffeine reliably cause jitters, racing heart, irritability, panic, reflux, or insomnia?',
  'Would the safer experiment be less caffeine, earlier caffeine, L-theanine alone, or skipping stimulants after midday?',
]

const useCases = [
  {
    title: 'Choose caffeine when alertness is the bottleneck',
    body: 'Caffeine is the more direct choice for short-term alertness and fatigue masking. That makes it useful for a defined morning work block, but less useful when anxiety, overstimulation, or sleep debt is already driving the problem.',
  },
  {
    title: 'Choose L-theanine when overstimulation is the bottleneck',
    body: 'L-theanine is usually the better fit when caffeine helps attention but creates body tension, racing thoughts, or a brittle focused feeling. It is not a stimulant replacement; it is more of a calm-focus modifier.',
  },
  {
    title: 'Use the combo only when each piece has a job',
    body: 'The caffeine and L-theanine stack makes the most sense when caffeine provides useful alertness and L-theanine improves tolerability. If caffeine already worsens anxiety or insomnia, adding theanine is not always the right fix.',
  },
]

export default function CaffeineVsLTheaninePage() {
  return (
    <div className="container-page py-10 space-y-10">
      <AuthorityJsonLd
        title="Caffeine vs L-Theanine for Focus"
        description="Evidence-informed comparison of caffeine and L-theanine for focus, alertness, calm concentration, anxiety risk, sleep timing, and safety-first stacking decisions."
        url="https://thehippiescientist.net/guides/compare/caffeine-vs-l-theanine"
        type="Article"
        breadcrumbs={[
          { name: 'Home', url: 'https://thehippiescientist.net/' },
          { name: 'Compare', url: 'https://thehippiescientist.net/guides/compare/' },
          { name: 'Caffeine vs L-Theanine', url: 'https://thehippiescientist.net/guides/compare/caffeine-vs-l-theanine/' },
        ]}
        citationUrls={citationUrls}
      />

      <AuthorityBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Compare', href: '/guides/compare/' },
          { label: 'Caffeine vs L-Theanine' },
        ]}
      />

      <section className="rounded-[2rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8 dark:border-white/10 dark:bg-white/5">
        <p className="eyebrow-label">Evidence-informed comparison · Focus</p>
        <h1 className="mt-3 max-w-4xl text-4xl font-bold tracking-tight text-ink sm:text-5xl">
          Caffeine vs L-Theanine: Focus, Calm Concentration, Jitters, Timing, and Safety
        </h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-muted">
          Caffeine and L-theanine are often mentioned together, but they solve different focus problems. Caffeine pushes alertness and blocks sleep pressure. L-theanine is better understood as a calm-focus support that may smooth the rough edges of caffeine for some people. This guide compares caffeine vs L-theanine without pretending the combo is right for every attention problem.
        </p>
      </section>

      <CitationReadySummary
        answer="Caffeine is usually better for fast alertness, while L-theanine is usually better for calm focus or reducing caffeine-related jitters. The combination can be useful when caffeine helps attention but feels too physically stimulating."
        bestFor={[
          'Caffeine: morning alertness, short-term vigilance, fatigue masking, and defined work blocks.',
          'L-theanine: calm concentration, stress-sensitive focus, and smoothing caffeine side effects.',
          'Together: useful when caffeine works but causes jitters, tension, or racing thoughts.',
        ]}
        evidenceLevel="Human studies support acute cognitive and mood effects from caffeine plus L-theanine, especially for attention and alertness, but individual caffeine sensitivity and sleep timing matter."
        safetyNote="Avoid using L-theanine as a way to justify excessive caffeine. Review anxiety, panic, blood pressure, stimulant medication, pregnancy, sleep disruption, and sedative use before stacking."
        notClaiming="This page is not claiming caffeine or L-theanine treats ADHD, anxiety disorders, chronic fatigue, or sleep deprivation."
        referencesHref="#references"
      />

      <section className="grid gap-5 md:grid-cols-2">
        <article className="card-premium p-6 space-y-4">
          <p className="eyebrow-label">Fast alertness</p>
          <h2 className="text-2xl font-semibold tracking-tight text-ink">Caffeine</h2>
          <p className="text-sm leading-7 text-muted">
            Caffeine is the more activating option. It can improve vigilance, perceived energy, and task engagement quickly, but it can also worsen jitters, anxiety, reflux, blood pressure, and sleep timing when the dose or timing is wrong.
          </p>
          <Link href="/compounds/caffeine/" className="chip-readable">Explore caffeine</Link>
        </article>

        <article className="card-premium p-6 space-y-4">
          <p className="eyebrow-label">Calm focus</p>
          <h2 className="text-2xl font-semibold tracking-tight text-ink">L-Theanine</h2>
          <p className="text-sm leading-7 text-muted">
            L-theanine is usually framed around relaxed attention rather than stimulation. It may be especially useful when the focus problem is overstimulation, stress reactivity, or a caffeine response that feels too sharp.
          </p>
          <Link href="/compounds/l-theanine/" className="chip-readable">Explore L-theanine</Link>
        </article>
      </section>

      <section className="card-premium p-6 space-y-5">
        <p className="eyebrow-label">Decision table</p>
        <h2 className="text-3xl font-semibold tracking-tight text-ink">Caffeine vs L-theanine: head-to-head</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="text-ink">
              <tr className="border-b border-black/10">
                <th className="py-3 pr-4 text-xs font-bold uppercase tracking-wider">Question</th>
                <th className="py-3 pr-4 text-xs font-bold uppercase tracking-wider">Caffeine</th>
                <th className="py-3 pr-4 text-xs font-bold uppercase tracking-wider">L-Theanine</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 text-muted">
              {comparisonRows.map(([question, caffeine, theanine]) => (
                <tr key={question}>
                  <td className="py-3.5 pr-4 font-semibold text-ink">{question}</td>
                  <td className="py-3.5 pr-4">{caffeine}</td>
                  <td className="py-3.5 pr-4">{theanine}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]" aria-labelledby="caffeine-theanine-framework-heading">
        <div className="rounded-2xl border border-brand-900/10 bg-white/90 p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
          <h2 id="caffeine-theanine-framework-heading" className="text-2xl font-bold text-ink">The premium decision framework</h2>
          <p className="mt-3 text-sm leading-6 text-muted">
            The best choice depends on the bottleneck. If the problem is sleep debt, more caffeine can create a bigger crash later. If the problem is overstimulation, L-theanine may help but reducing caffeine may help more. If the problem is chronic attention impairment, neither one replaces a proper ADHD, sleep, medication, or mental-health evaluation.
          </p>
          <ol className="mt-5 space-y-3">
            {decisionQuestions.map((question, index) => (
              <li key={question} className="flex gap-3 rounded-xl border border-brand-900/10 bg-brand-50/40 p-3 text-sm leading-6 text-muted dark:border-white/10 dark:bg-white/5">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-700 text-xs font-bold text-white">{index + 1}</span>
                <span>{question}</span>
              </li>
            ))}
          </ol>
        </div>

        <aside className="rounded-2xl border border-amber-900/15 bg-amber-50/70 p-5 text-amber-950 dark:border-amber-200/20 dark:bg-amber-950/20 dark:text-amber-50">
          <p className="text-sm font-bold uppercase tracking-[0.16em]">Safety-first lens</p>
          <h2 className="mt-2 text-xl font-bold">Do not use theanine to excuse too much caffeine</h2>
          <p className="mt-3 text-sm leading-6">
            Caffeine can still disrupt sleep, worsen anxiety, increase palpitations, irritate reflux, and interact with stimulant-sensitive contexts. Use extra caution with panic disorder, high blood pressure, pregnancy, stimulant medications, nicotine-heavy routines, and late-day dosing.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/safety-checker/" className="rounded-full bg-amber-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-950 dark:bg-amber-100 dark:text-amber-950">
              Check stack safety
            </Link>
            <Link href="/guides/focus/" className="rounded-full border border-amber-900/20 px-4 py-2 text-sm font-semibold text-amber-950 transition hover:bg-white/60 dark:border-amber-100/30 dark:text-amber-50">
              Focus guides
            </Link>
          </div>
        </aside>
      </section>

      <section className="grid gap-5 md:grid-cols-3">
        {useCases.map((useCase) => (
          <article key={useCase.title} className="card-premium p-6 space-y-3">
            <h2 className="text-xl font-semibold tracking-tight text-ink">{useCase.title}</h2>
            <p className="text-sm leading-7 text-muted">{useCase.body}</p>
          </article>
        ))}
      </section>

      <section className="rounded-2xl border border-brand-900/10 bg-brand-50/60 p-5 dark:border-white/10 dark:bg-white/5">
        <h2 className="text-xl font-semibold text-ink">Where to go next</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
          Compare this two-way guide with the broader three-way focus comparison, the calm-focus explainer, and the safety checker before stacking caffeine, L-theanine, stimulant medications, nicotine, or other nootropics.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/guides/compare/caffeine-vs-l-theanine-vs-bacopa-for-focus/" className="inline-flex min-h-[44px] items-center rounded-full bg-brand-700 px-5 text-sm font-semibold text-white transition hover:bg-brand-800">
            Compare caffeine, theanine, and bacopa
          </Link>
          <Link href="/learn/why-calm-focus-differs-from-stimulation/" className="inline-flex min-h-[44px] items-center rounded-full border border-brand-900/10 px-5 text-sm font-semibold text-ink transition hover:bg-white/70 dark:border-white/10 dark:hover:bg-white/10">
            Calm focus vs stimulation
          </Link>
          <Link href="/guides/focus/best-supplements-for-focus/" className="inline-flex min-h-[44px] items-center rounded-full border border-brand-900/10 px-5 text-sm font-semibold text-ink transition hover:bg-white/70 dark:border-white/10 dark:hover:bg-white/10">
            Best focus supplements
          </Link>
        </div>
      </section>

      <References refs={CAFFEINE_VS_L_THEANINE_REFS} />
    </div>
  )
}
