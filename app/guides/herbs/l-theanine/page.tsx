import Link from 'next/link'
import JsonLd from '@/components/seo/JsonLd'
import { buildPageMetadata, blogJsonLd, breadcrumbJsonLd, faqPageJsonLd } from '../../../../src/lib/seo'
import EvidenceSummaryCard from '@/components/evidence/EvidenceSummaryCard'
import SafetyNotice from '@/components/evidence/SafetyNotice'
import EmailCapture from '@/components/EmailCapture'
import { getRevenueProductSet } from '@/config/revenue-products'
import RecommendationSection from '@/components/RecommendationSection'
import NewsletterCtaBlock from '@/components/NewsletterCtaBlock'
import LastUpdatedBadge from '../../../../src/components/editorial/LastUpdatedBadge'
import ResponsiveTable from '@/components/ui/ResponsiveTable'
import { AFFILIATE_TAGS } from '@/config/affiliate'

// ─── Article metadata ─────────────────────────────────────────────────────────

const SLUG = 'l-theanine'
const TITLE = 'L-Theanine: The Evidence-Based Guide (Calm, Focus, Anxiety, and Sleep)'
const DESCRIPTION =
  'A comprehensive evidence-based review of L-theanine: mechanisms, clinical research, dosage, safety, what it works for, what it does not, and how it compares with caffeine, ashwagandha, magnesium, and other calming supplements.'
const DATE = '2026-06-26'
const AUTHOR = 'Will'
const READING_TIME = '12 min read'
const TAGS = ['l-theanine', 'calm', 'focus', 'anxiety', 'sleep', 'amino acid']
const CATEGORY = 'amino acids'

export const metadata = buildPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: `/guides/herbs/${SLUG}`,
  openGraphType: 'article',
})

// ─── FAQ data (also used for JSON-LD) ────────────────────────────────────────

const FAQS = [
  {
    question: 'What does L-theanine do?',
    answer:
      'L-theanine is an amino acid found naturally in tea leaves. Within 30–60 minutes of ingestion, it raises calming alpha-wave activity in the brain, modulates GABA and glutamate, and reduces perceived stress without sedation. It is best known for promoting calm focus, smoothing the jitter of caffeine, easing racing thoughts, and supporting relaxation before sleep.',
  },
  {
    question: 'How fast does L-theanine work?',
    answer:
      'L-theanine is fast-acting. EEG-measurable alpha-wave effects appear within 30–60 minutes of oral ingestion and last 3–4 hours. Subjective calm and reduced anxiety typically begin in the same window. This makes L-theanine the fastest-acting natural option for situational calm — unlike ashwagandha or rhodiola, which take weeks.',
  },
  {
    question: 'Is L-theanine safe to take every day?',
    answer:
      'Yes. L-theanine has a clean safety profile at typical doses (100–400 mg/day). It is generally recognized as safe (GRAS) by the FDA and is well-tolerated in long-term tea consumption contexts. There is no documented dependency, withdrawal, or tolerance buildup. Caution with antihypertensives (mild BP-lowering effect) and sedatives (additive effect).',
  },
  {
    question: 'Can I take L-theanine with caffeine?',
    answer:
      'Yes — this is the most studied combination. L-theanine (100–200 mg) plus caffeine (50–100 mg) at a 2:1 ratio is one of the most replicated nootropic stacks in cognitive research. L-theanine smooths the jitter and anxiety of caffeine while preserving alertness. The combination improves focus, reaction time, and accuracy versus caffeine alone.',
  },
  {
    question: 'Does L-theanine help with sleep?',
    answer:
      'L-theanine can support sleep onset by reducing mental arousal and racing thoughts, particularly when taken 30–60 minutes before bed. It is not a sedative — it does not force sleep. The strongest evidence is for sleep quality improvements in people with anxiety-driven or stress-driven insomnia. For circadian shift disorders, melatonin is a better-targeted tool.',
  },
  {
    question: 'Is L-theanine the same as ashwagandha?',
    answer:
      'No — they work very differently. L-theanine is fast (30–60 minutes), calming without sedation, and works acutely on alpha-wave activity and GABA/glutamate. Ashwagandha is slow (4–8 weeks), foundational, and works by modulating cortisol and the HPA axis. L-theanine is the right tool for tonight; ashwagandha is the right tool for chronic stress load. Many people stack them.',
  },
  {
    question: 'Should I take L-theanine in the morning or at night?',
    answer:
      'It depends on your goal. For focus, take it in the morning (often with caffeine) or 30–60 minutes before a demanding task. For sleep support, take it 30–60 minutes before bed. For daytime anxiety, take it as needed when you feel stress rising. L-theanine does not produce drowsiness, so timing is about matching effect to need, not avoiding impairment.',
  },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LTheanineArticlePage() {
  const pageBreadcrumb = breadcrumbJsonLd([
    { name: 'Articles', url: 'https://thehippiescientist.net/articles' },
    { name: TITLE, url: `https://thehippiescientist.net/articles/${SLUG}` },
  ])

  const articleLd = blogJsonLd(
    { title: TITLE, slug: SLUG, date: DATE, description: DESCRIPTION },
    `/articles/${SLUG}`,
  )

  const faqLd = faqPageJsonLd({ pagePath: `/articles/${SLUG}`, questions: FAQS })

  return (
    <article className="mx-auto max-w-5xl space-y-0 px-4 pb-20 pt-6 sm:px-6 lg:px-8">
      {/* JSON-LD */}
      <JsonLd schema={articleLd} />
      <JsonLd schema={pageBreadcrumb} />
      {faqLd && (
        <JsonLd schema={faqLd} />
      )}

      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-muted">
        <Link href="/guides/" className="transition hover:text-ink">
          Articles
        </Link>
        <span>/</span>
        <span className="text-ink line-clamp-1">{TITLE}</span>
      </nav>

      {/* Hero */}
      <section className="rounded-[1.5rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8 lg:p-10">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-full border border-brand-900/10 bg-brand-50 px-2.5 py-0.5 font-bold uppercase tracking-wider text-brand-800">
            Umbrella Hub
          </span>
          <span className="rounded-full border border-brand-900/10 bg-white px-2.5 py-0.5 font-semibold text-muted capitalize">
            {CATEGORY}
          </span>
          {TAGS.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-brand-900/10 bg-white px-2.5 py-0.5 font-semibold text-muted capitalize"
            >
              {tag}
            </span>
          ))}
          <span className="text-muted">{new Date(DATE).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
          <span className="text-muted">·</span>
          <span className="text-muted">{READING_TIME}</span>
        </div>

        <h1 className="mt-4 font-display text-3xl font-bold leading-tight tracking-tight text-ink sm:text-4xl lg:text-5xl">
          {TITLE}
        </h1>

        <p className="mt-2 text-sm text-muted">
          By{' '}
          <Link href="/info/about/" rel="author" className="font-medium text-ink hover:underline">
            {AUTHOR}
          </Link>
        </p>

        <div className="mt-3">
          <LastUpdatedBadge date={DATE} label="Last updated" />
        </div>

        <p className="mt-4 max-w-3xl text-base leading-7 text-muted">{DESCRIPTION}</p>
      </section>

      {/* Affiliate disclosure */}
      <div className="mt-4 rounded-[1rem] border border-brand-900/10 bg-brand-50/60 px-5 py-3 text-xs leading-6 text-muted">
        <strong className="text-ink">Affiliate disclosure:</strong> This article contains affiliate
        links. If you purchase through these links, we may earn a commission at no additional cost to
        you. We only link to products that match the dose ranges and forms reviewed in the clinical
        literature on this page.
      </div>

      {/* Body + sidebar */}
      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_240px]">
        {/* Main content */}
        <div className="space-y-6">

          {/* Fastest useful choice */}
          <section className="rounded-[1rem] border border-brand-700/20 bg-brand-50/60 p-6 shadow-sm sm:p-8">
            <p className="eyebrow-label">Fastest useful choice</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
              If you only try one thing: 100 mg L-theanine alone
            </h2>
            <p className="mt-3 text-[1.01rem] leading-[1.85] text-muted">
              <strong>L-theanine 100 mg alone is itself the fastest useful choice for calm focus,
              racing thoughts, and caffeine smoothing.</strong> Effects within 30–60 minutes, no
              sedation, no dependency, nootropic without overstimulation. If 100 mg is not enough,
              increase to 200 mg before adding other compounds. The L-theanine + caffeine 2:1 stack
              is the most-studied nootropic combination in the literature and a natural upgrade if
              you also want alertness. See the{' '}
              <Link href="/guides/focus/l-theanine-vs-caffeine-for-focus" className="font-semibold text-brand-700 hover:text-brand-800 hover:underline">
                head-to-head comparison
              </Link>
              .
            </p>
          </section>

          {/* Quick Verdict */}
          <section className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8">
            <p className="eyebrow-label">Quick Verdict</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
              Does L-Theanine Work?
            </h2>
            <p className="mt-3 text-[1.01rem] leading-[1.85] text-muted">
              <strong>Yes — for calm focus, anxiety-driven racing thoughts, and caffeine
              smoothing.</strong> L-theanine reliably increases alpha-wave activity (the calm-focus
              brainwave pattern) within 30–60 minutes and consistently reduces subjective stress in
              acute settings. The L-theanine + caffeine combination is one of the most replicated
              nootropic stacks in cognitive research.
            </p>
            <p className="mt-3 text-[1.01rem] leading-[1.85] text-muted">
              For chronic stress load, anxiety disorders, or mood-related conditions, L-theanine is
              supportive but not a primary intervention — pair it with ashwagandha, magnesium, or
              appropriate clinical care depending on what you are addressing. L-theanine is a fast,
              safe, well-tolerated tool. It is not a substitute for therapy, sleep hygiene, or
              medical treatment.
            </p>
          </section>

          {/* Main article body */}
          <section className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8 space-y-8">

            {/* Introduction */}
            <div id="introduction">
              <h2 className="mb-3 text-2xl font-semibold tracking-tight text-ink">Introduction</h2>
              <p className="text-[1.01rem] leading-[1.85] text-muted">
                L-theanine is one of the most consistently studied natural compounds for calm focus
                and acute anxiety reduction. Found naturally in tea leaves (and originally
                identified in green tea in 1949), it has become a staple of the nootropics community
                and is increasingly studied in clinical research for anxiety, sleep, ADHD, and
                cardiovascular outcomes.
              </p>
              <p className="mt-3 text-[1.01rem] leading-[1.85] text-muted">
                This article is the umbrella guide — covering everything you need to know in one
                place, with deep-dive links to each condition-specific article. Whether you are
                considering L-theanine for focus, anxiety, sleep, or ADHD, this hub will help you
                decide if it is right for you, what dose to use, and what to expect.
              </p>
            </div>

            <hr className="border-brand-900/10" />

            {/* What is L-theanine */}
            <div id="what-is-l-theanine">
              <h2 className="mb-3 text-2xl font-semibold tracking-tight text-ink">
                What Is L-Theanine?
              </h2>
              <p className="text-[1.01rem] leading-[1.85] text-muted">
                L-theanine (γ-glutamylethylamide) is a non-proteinogenic amino acid analogue of
                glutamate and glutamine. It is found naturally in tea (<em>Camellia sinensis</em>),
                particularly green tea, where it constitutes 1–2% of the dry leaf weight. The
                Japanese have studied it as the active component responsible for the calm-yet-alert
                state that tea drinkers report, often called &ldquo;alert calm&rdquo; or
                &ldquo;focused relaxation.&rdquo;
              </p>
              <p className="mt-3 text-[1.01rem] leading-[1.85] text-muted">
                It is structurally similar to glutamate (an excitatory neurotransmitter) and is
                thought to work partly through modulation of glutamate receptors. It also promotes
                GABA (the brain&rsquo;s main inhibitory neurotransmitter), dopamine, and serotonin
                release in moderation. Critically, it does not produce sedation, dependency, or
                tolerance buildup.
              </p>
              <p className="mt-3 text-[1.01rem] leading-[1.85] text-muted">
                For a complete breakdown of chemistry, mechanisms, and research across all uses,
                see the{' '}
                <Link href="/compounds/l-theanine" className="font-semibold text-brand-700 hover:text-brand-800 hover:underline">
                  L-theanine compound profile
                </Link>
                .
              </p>
            </div>

            <hr className="border-brand-900/10" />

            {/* What L-theanine is used for */}
            <div id="uses">
              <h2 className="mb-3 text-2xl font-semibold tracking-tight text-ink">
                What L-Theanine Is Used For
              </h2>
              <p className="text-[1.01rem] leading-[1.85] text-muted">
                L-theanine has been studied across several outcomes with varying evidence strength.
                Use this section to see whether L-theanine is right for your specific goal.
              </p>

              {/* Decision table by use case */}
              <div className="mt-4 overflow-x-auto rounded-[1rem] border border-brand-900/10 bg-white shadow-sm">
                <table className="min-w-[640px] w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-brand-900/10 bg-brand-50/50">
                      <th className="text-left p-4 font-semibold text-ink">Use case</th>
                      <th className="text-left p-4 font-semibold text-ink">Evidence strength</th>
                      <th className="text-left p-4 font-semibold text-ink">Time to effect</th>
                      <th className="text-left p-4 font-semibold text-ink">Deep-dive</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-900/10">
                    <tr>
                      <td className="p-4 font-medium text-ink">Caffeine smoothing &amp; calm focus</td>
                      <td className="p-4 text-brand-700 font-medium">Strong</td>
                      <td className="p-4 text-muted">30–60 min</td>
                      <td className="p-4">
                        <Link href="/guides/focus/l-theanine-vs-caffeine-for-focus" className="text-brand-700 hover:underline font-medium">
                          vs Caffeine →
                        </Link>
                      </td>
                    </tr>
                    <tr>
                      <td className="p-4 font-medium text-ink">Anxiety symptom reduction</td>
                      <td className="p-4 text-brand-700 font-medium">Moderate</td>
                      <td className="p-4 text-muted">30–60 min</td>
                      <td className="p-4">
                        <Link href="/guides/herbs/l-theanine/" className="text-brand-700 hover:underline font-medium">
                          L-theanine for anxiety →
                        </Link>
                      </td>
                    </tr>
                    <tr>
                      <td className="p-4 font-medium text-ink">Sleep onset &amp; quality</td>
                      <td className="p-4 text-brand-700 font-medium">Moderate</td>
                      <td className="p-4 text-muted">30–60 min</td>
                      <td className="p-4">
                        <Link href="/guides/sleep/l-theanine-for-sleep" className="text-brand-700 hover:underline font-medium">
                          L-theanine for sleep →
                        </Link>
                      </td>
                    </tr>
                    <tr>
                      <td className="p-4 font-medium text-ink">ADHD focus &amp; calm</td>
                      <td className="p-4 text-muted">Emerging–Moderate</td>
                      <td className="p-4 text-muted">30–60 min</td>
                      <td className="p-4">
                        <Link href="/guides/adhd/l-theanine-for-adhd/" className="text-brand-700 hover:underline font-medium">
                          L-theanine for ADHD →
                        </Link>
                      </td>
                    </tr>
                    <tr>
                      <td className="p-4 font-medium text-ink">Blood pressure reduction</td>
                      <td className="p-4 text-muted">Emerging</td>
                      <td className="p-4 text-muted">4–8 weeks (chronic)</td>
                      <td className="p-4">
                        <span className="text-muted text-xs">No dedicated deep-dive yet</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p className="mt-4 text-[1.01rem] leading-[1.85] text-muted">
                For most readers, the right entry point is the calm focus / caffeine smoothing
                evidence — that is the strongest and most consistent body of research. If your
                primary goal is anxiety, see the{' '}
                <Link href="/guides/herbs/l-theanine/" className="font-semibold text-brand-700 hover:underline">
                  anxiety deep-dive
                </Link>
                . If sleep is primary, see{' '}
                <Link href="/guides/sleep/l-theanine-for-sleep" className="font-semibold text-brand-700 hover:underline">
                  L-theanine for sleep
                </Link>
                . If you want a stack that combines L-theanine with magnesium, see the{' '}
                <Link href="/guides/adhd/l-theanine-magnesium-adhd-stack" className="font-semibold text-brand-700 hover:underline">
                  L-theanine + magnesium stack
                </Link>
                . For caffeine-free focus, see{' '}
                <Link href="/guides/focus/l-theanine-without-caffeine" className="font-semibold text-brand-700 hover:underline">
                  L-theanine without caffeine
                </Link>
                .
              </p>
            </div>

            <hr className="border-brand-900/10" />

            {/* How L-theanine works */}
            <div id="mechanisms">
              <h2 className="mb-3 text-2xl font-semibold tracking-tight text-ink">
                How L-Theanine Works
              </h2>
              <p className="text-[1.01rem] leading-[1.85] text-muted">
                Several convergent mechanisms have been proposed, based on EEG studies, neuroimaging,
                and pharmacological inference:
              </p>

              <h3 className="mt-5 mb-1 text-xl font-semibold tracking-tight text-ink">
                1. Alpha Waves: The &ldquo;Calm Focus&rdquo; Brainwave
              </h3>
              <p className="text-[1.01rem] leading-[1.85] text-muted">
                Alpha waves (8–12 Hz) are the neural oscillation pattern associated with calm,
                relaxed wakefulness — the &ldquo;flow state&rdquo; precursor. L-theanine consistently
                increases alpha-wave power in EEG studies within 30–60 minutes of ingestion, making
                it one of the more mechanistically well-characterized supplements for this purpose.
              </p>

              <h3 className="mt-5 mb-1 text-xl font-semibold tracking-tight text-ink">
                2. Glutamate / GABA Modulation
              </h3>
              <p className="text-[1.01rem] leading-[1.85] text-muted">
                L-theanine has structural similarity to glutamate and may modulate AMPA, NMDA, and
                kainate receptors to reduce excitatory tone. It also appears to support GABA
                activity, the brain&rsquo;s primary inhibitory neurotransmitter. The net effect is a
                reduction in neural hyperactivation without producing strong sedation.
              </p>

              <h3 className="mt-5 mb-1 text-xl font-semibold tracking-tight text-ink">
                3. Serotonin &amp; Dopamine Modulation (Modest)
              </h3>
              <p className="text-[1.01rem] leading-[1.85] text-muted">
                Some evidence suggests L-theanine modestly increases serotonin and dopamine
                release. The effect is gentler and more variable than alpha-wave changes. This may
                contribute to the well-being and mood-stabilizing effects some users report.
              </p>

              <h3 className="mt-5 mb-1 text-xl font-semibold tracking-tight text-ink">
                4. What L-Theanine Does NOT Do
              </h3>
              <p className="text-[1.01rem] leading-[1.85] text-muted">
                L-theanine does not meaningfully increase dopamine or norepinephrine — the
                catecholamines central to stimulant ADHD medication efficacy. It is not a stimulant.
                It does not block adenosine receptors (caffeine does this). Its mechanism is calming
                and inhibitory-supportive, not activating. If you need activation, combine with
                caffeine or use a different supplement.
              </p>
            </div>

            <hr className="border-brand-900/10" />

            {/* Evidence Summary */}
            <div id="evidence-summary">
              <h2 className="mb-4 text-2xl font-semibold tracking-tight text-ink">
                Evidence Summary
              </h2>

              <EvidenceSummaryCard
                title="L-Theanine — Calm Focus &amp; Anxiety"
                evidenceLevel="Moderate"
                humanEvidence="Multiple randomized crossover trials show L-theanine increases alpha-wave power within 30–60 minutes and reduces subjective stress. The L-theanine + caffeine (2:1) combination improves attention, reaction time, and accuracy vs caffeine alone across multiple RCTs. Anxiety trials are smaller but directionally consistent."
                mechanisticEvidence="Alpha-wave enhancement is well-replicated via EEG. GABA and glutamate modulation demonstrated in animal models and inferred from human outcomes. Modest effects on serotonin and dopamine release have been measured in preclinical work."
                safetyProfile="Generally well-tolerated at 100–400 mg/day. FDA GRAS for use in foods. Mild blood pressure reduction at higher chronic doses. Caution with antihypertensives and sedatives. Limited data in pregnancy."
              />

              <div className="mt-4 rounded-[1rem] border border-brand-900/10 bg-brand-50/60 p-4 text-sm leading-7 text-muted">
                <p className="font-semibold text-ink">Key trials reviewed:</p>
                <ul className="mt-2 ml-5 space-y-1 list-disc">
                  <li>Williams et al. (2019) — L-theanine + caffeine cognitive performance meta-analysis</li>
                  <li>Nobre et al. (2008) — L-theanine alpha-wave EEG study</li>
                  <li>Kimura et al. (2007) — L-theanine + caffeine attention and arousal</li>
                  <li>Lu et al. (2004) — L-theanine acute stress reactivity (mathematical tasks)</li>
                  <li>Yoto et al. (2012) — L-theanine stress reduction in students</li>
                  <li>Owen et al. (2008) — Suntheanine&reg; anxiety and sleep outcomes</li>
                </ul>
                <p className="mt-2 text-xs text-muted">
                  Full reference table in Sources section below.
                </p>
              </div>
            </div>

            <hr className="border-brand-900/10" />

            {/* Dosage */}
            <div id="dosage">
              <h2 className="mb-4 text-2xl font-semibold tracking-tight text-ink">
                Dosage and Usage
              </h2>

              <div className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-5 shadow-sm">
                <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-muted">
                  Dosage Reference — Standard Protocols
                </p>
                <ResponsiveTable label="L-theanine dosage reference table">
                  <table className="min-w-[560px] w-full text-sm">
                    <thead>
                      <tr className="border-b border-brand-900/10">
                        <th className="pb-2 pr-4 text-left text-xs font-bold uppercase tracking-wider text-muted">
                          Goal
                        </th>
                        <th className="pb-2 pr-4 text-left text-xs font-bold uppercase tracking-wider text-muted">
                          Dose
                        </th>
                        <th className="pb-2 pr-4 text-left text-xs font-bold uppercase tracking-wider text-muted">
                          Timing
                        </th>
                        <th className="pb-2 text-left text-xs font-bold uppercase tracking-wider text-muted">
                          Frequency
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-900/5">
                      <tr className="align-top">
                        <td className="py-3 pr-4 font-medium text-ink">Calm focus / day</td>
                        <td className="py-3 pr-4 text-muted">100–200 mg</td>
                        <td className="py-3 pr-4 text-muted">30–60 min before task</td>
                        <td className="py-3 text-muted">As needed</td>
                      </tr>
                      <tr className="align-top">
                        <td className="py-3 pr-4 font-medium text-ink">Caffeine smoothing</td>
                        <td className="py-3 pr-4 text-muted">100–200 mg (+ 50–100 mg caffeine)</td>
                        <td className="py-3 pr-4 text-muted">Together with coffee/tea</td>
                        <td className="py-3 text-muted">Per caffeine dose</td>
                      </tr>
                      <tr className="align-top">
                        <td className="py-3 pr-4 font-medium text-ink">Sleep support</td>
                        <td className="py-3 pr-4 text-muted">200–400 mg</td>
                        <td className="py-3 pr-4 text-muted">30–60 min before bed</td>
                        <td className="py-3 text-muted">Nightly as needed</td>
                      </tr>
                      <tr className="align-top">
                        <td className="py-3 pr-4 font-medium text-ink">Acute anxiety</td>
                        <td className="py-3 pr-4 text-muted">200–400 mg</td>
                        <td className="py-3 pr-4 text-muted">At onset of symptoms</td>
                        <td className="py-3 text-muted">As needed</td>
                      </tr>
                    </tbody>
                  </table>
                </ResponsiveTable>
                <p className="mt-3 text-xs text-muted">
                  Doses shown are based on clinical trial protocols. Start at 100 mg and assess
                  response. L-theanine can be taken with or without food. Effects last approximately
                  3–4 hours per dose.
                </p>
              </div>
            </div>

            <hr className="border-brand-900/10" />

            {/* Affiliate Product Recommendations */}
            <div id="product-recommendations">
              <h2 className="mb-3 text-2xl font-semibold tracking-tight text-ink">
                Affiliate Product Recommendations
              </h2>
              <p className="text-[1.01rem] leading-[1.85] text-muted">
                These products use plain L-theanine (no blends) at doses matching the protocols
                reviewed above. Affiliate links support this site at no additional cost to you.
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm">
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted">
                    Best for: Calm Focus
                  </p>
                  <p className="font-semibold text-ink">Suntheanine&reg; L-Theanine 200 mg</p>
                  <p className="mt-1 text-xs leading-5 text-muted">
                    Pure L-isomer theanine (the bioactive form). Most-studied branded version.
                    Single-ingredient capsules at a research-supported dose.
                  </p>
                  <a
                    href={`https://www.amazon.com/s?k=Suntheanine+l-theanine+200mg&tag=${AFFILIATE_TAGS.amazon}`}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    className="mt-3 inline-flex items-center gap-1 rounded-full bg-brand-950 px-4 py-1.5 text-xs font-bold text-white transition hover:bg-brand-900"
                  >
                    View on Amazon →
                  </a>
                </div>
                <div className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm">
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted">
                    Best for: Caffeine Pairing
                  </p>
                  <p className="font-semibold text-ink">L-Theanine + Caffeine Stack</p>
                  <p className="mt-1 text-xs leading-5 text-muted">
                    Pre-combined 2:1 L-theanine + caffeine stack for focus without jitters. Convenient
                    single-capsule alternative to drinking tea.
                  </p>
                  <a
                    href={`https://www.amazon.com/s?k=l-theanine+caffeine+stack+200mg&tag=${AFFILIATE_TAGS.amazon}`}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    className="mt-3 inline-flex items-center gap-1 rounded-full bg-brand-950 px-4 py-1.5 text-xs font-bold text-white transition hover:bg-brand-900"
                  >
                    View on Amazon →
                  </a>
                </div>
              </div>
            </div>

            <hr className="border-brand-900/10" />

            {/* Safety */}
            <div id="safety">
              <h2 className="mb-4 text-2xl font-semibold tracking-tight text-ink">
                Safety and Side Effects
              </h2>
              <SafetyNotice title="Safety Summary — L-Theanine">
                <ul className="ml-5 space-y-1.5 list-disc">
                  <li>
                    <strong>Generally recognized as safe (GRAS)</strong> by the FDA for use in
                    conventional foods. No documented dependency, withdrawal, or tolerance buildup
                    at typical doses (100–400 mg/day).
                  </li>
                  <li>
                    <strong>Blood pressure:</strong> Mild blood pressure reduction observed at
                    chronic higher doses. Caution if you take antihypertensive medications —
                    additive effect possible.
                  </li>
                  <li>
                    <strong>Sedatives:</strong> Additive effect with benzodiazepines, sleep
                    medications, alcohol, and other CNS depressants.
                  </li>
                  <li>
                    <strong>Pregnancy / lactation:</strong> Limited human safety data; many
                    clinicians advise caution or avoidance during pregnancy and breastfeeding.
                  </li>
                  <li>
                    <strong>Children:</strong> Limited research in pediatric populations; do not
                    give to children without clinical guidance.
                  </li>
                  <li>
                    <strong>Chemotherapy / immunosuppression:</strong> Theoretical interaction due
                    to immunomodulatory effects in some preclinical work; consult an oncologist
                    before combining.
                  </li>
                </ul>
              </SafetyNotice>
              <p className="mt-3 text-sm text-muted">
                L-theanine has one of the cleanest safety profiles of any supplement reviewed on
                this site. The main cautions are additive effects with sedatives and mild
                blood-pressure reduction at higher chronic doses. For a complete breakdown, see the{' '}
                <Link href="/compounds/l-theanine" className="font-semibold text-brand-700 hover:text-brand-800 hover:underline">
                  full L-theanine compound profile
                </Link>
                .
              </p>
            </div>

            <hr className="border-brand-900/10" />

            {/* Stacking */}
            <div id="stacking">
              <h2 className="mb-4 text-2xl font-semibold tracking-tight text-ink">
                Stacking L-Theanine With Other Supplements
              </h2>
              <p className="text-[1.01rem] leading-[1.85] text-muted">
                L-theanine pairs well with several other supplements because it works acutely on
                calming while they cover the baseline (chronic stress, sleep support, muscle
                tension). Common stacks:
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm">
                  <p className="font-semibold text-ink">L-Theanine + Caffeine</p>
                  <p className="mt-1 text-xs leading-5 text-muted">
                    100–200 mg L-theanine with 50–100 mg caffeine (2:1 ratio). The most-studied
                    nootropic stack — calm focus without jitters. See{' '}
                    <Link href="/guides/focus/l-theanine-vs-caffeine-for-focus" className="font-semibold text-brand-700 hover:underline">
                      head-to-head comparison
                    </Link>
                    .
                  </p>
                </div>
                <div className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm">
                  <p className="font-semibold text-ink">L-Theanine + Magnesium glycinate</p>
                  <p className="mt-1 text-xs leading-5 text-muted">
                    Acute calming (L-theanine) plus evening muscle tension and nervous-system
                    support (magnesium). See the{' '}
                    <Link href="/guides/adhd/l-theanine-magnesium-adhd-stack" className="font-semibold text-brand-700 hover:underline">
                      L-theanine + magnesium stack
                    </Link>
                    .
                  </p>
                </div>
                <div className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm">
                  <p className="font-semibold text-ink">L-Theanine + Ashwagandha</p>
                  <p className="mt-1 text-xs leading-5 text-muted">
                    Acute calm focus (L-theanine) plus chronic stress baseline regulation
                    (ashwagandha). See the{' '}
                    <Link href="/guides/herbs/ashwagandha/" className="font-semibold text-brand-700 hover:underline">
                      ashwagandha article
                    </Link>
                    .
                  </p>
                </div>
                <div className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm">
                  <p className="font-semibold text-ink">L-Theanine + Melatonin</p>
                  <p className="mt-1 text-xs leading-5 text-muted">
                    For sleep: L-theanine quiets racing thoughts; melatonin signals circadian
                    onset. Different mechanisms — complementary. See{' '}
                    <Link href="/guides/sleep/l-theanine-for-sleep" className="font-semibold text-brand-700 hover:underline">
                      L-theanine for sleep
                    </Link>
                    .
                  </p>
                </div>
              </div>
              <p className="mt-4 text-[1.01rem] leading-[1.85] text-muted">
                Introduce one supplement at a time so you can isolate what is helping (or causing
                side effects). Allow 1–2 weeks between additions. L-theanine is one of the safer
                starting points because it acts acutely and you can usually tell within an hour
                whether it helps.
              </p>
            </div>

            <hr className="border-brand-900/10" />

            {/* FAQ */}
            <div id="faq">
              <h2 className="mb-4 text-2xl font-semibold tracking-tight text-ink">
                Frequently Asked Questions
              </h2>
              <div className="space-y-4">
                {FAQS.map((faq, i) => (
                  <div
                    key={i}
                    className="rounded-[0.75rem] border border-brand-900/10 bg-brand-50/40 p-4"
                  >
                    <h3 className="font-semibold text-ink">{faq.question}</h3>
                    <p className="mt-2 text-sm leading-7 text-muted">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>

            <hr className="border-brand-900/10" />

            {/* Related Articles */}
            <div id="related-articles">
              <h2 className="mb-4 text-2xl font-semibold tracking-tight text-ink">
                Related Articles
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                <Link
                  href="/guides/herbs/l-theanine/"
                  className="group rounded-[0.75rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm transition hover:border-brand-700/30"
                >
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted">
                    Deep Dive
                  </p>
                  <p className="font-semibold text-ink transition group-hover:text-brand-700">
                    L-Theanine for Anxiety
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    Anxiety-specific evidence, dosage for racing thoughts, and how L-theanine
                    compares with ashwagandha, magnesium, and CBD.
                  </p>
                </Link>
                <Link
                  href="/guides/sleep/l-theanine-for-sleep"
                  className="group rounded-[0.75rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm transition hover:border-brand-700/30"
                >
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted">
                    Deep Dive
                  </p>
                  <p className="font-semibold text-ink transition group-hover:text-brand-700">
                    L-Theanine for Sleep
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    Sleep onset and quality, evening protocols, and how L-theanine compares with
                    melatonin, magnesium, and ashwagandha for sleep.
                  </p>
                </Link>
                <Link
                  href="/guides/adhd/l-theanine-for-adhd/"
                  className="group rounded-[0.75rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm transition hover:border-brand-700/30"
                >
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted">
                    Deep Dive
                  </p>
                  <p className="font-semibold text-ink transition group-hover:text-brand-700">
                    L-Theanine for ADHD
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    ADHD-specific focus evidence, caffeine-free protocols, and how L-theanine
                    compares with stimulant medication.
                  </p>
                </Link>
                <Link
                  href="/guides/focus/l-theanine-vs-caffeine-for-focus"
                  className="group rounded-[0.75rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm transition hover:border-brand-700/30"
                >
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted">
                    Comparison
                  </p>
                  <p className="font-semibold text-ink transition group-hover:text-brand-700">
                    L-Theanine vs Caffeine for Focus
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    Head-to-head comparison and the case for using both together.
                  </p>
                </Link>
                <Link
                  href="/guides/adhd/l-theanine-magnesium-adhd-stack"
                  className="group rounded-[0.75rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm transition hover:border-brand-700/30"
                >
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted">
                    Stack Guide
                  </p>
                  <p className="font-semibold text-ink transition group-hover:text-brand-700">
                    L-Theanine + Magnesium Stack
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    A clean two-supplement stack for anxiety-driven focus or sleep support.
                  </p>
                </Link>
                <Link
                  href="/guides/focus/l-theanine-without-caffeine"
                  className="group rounded-[0.75rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm transition hover:border-brand-700/30"
                >
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted">
                    Variant
                  </p>
                  <p className="font-semibold text-ink transition group-hover:text-brand-700">
                    L-Theanine Without Caffeine
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    Stimulant-free focus and calm — for caffeine-sensitive or evening users.
                  </p>
                </Link>
              </div>
            </div>

            <hr className="border-brand-900/10" />

            {/* Sources */}
            <div id="sources">
              <h2 className="mb-4 text-2xl font-semibold tracking-tight text-ink">Sources</h2>
              <ResponsiveTable label="Article references">
                <table className="min-w-[600px] w-full text-sm">
                  <thead>
                    <tr className="border-b border-brand-900/10">
                      <th className="pb-2 pr-3 text-left text-xs font-bold uppercase tracking-wider text-muted">
                        #
                      </th>
                      <th className="pb-2 pr-4 text-left text-xs font-bold uppercase tracking-wider text-muted">
                        Study
                      </th>
                      <th className="pb-2 pr-4 text-left text-xs font-bold uppercase tracking-wider text-muted">
                        Authors
                      </th>
                      <th className="pb-2 pr-4 text-left text-xs font-bold uppercase tracking-wider text-muted">
                        Year
                      </th>
                      <th className="pb-2 text-left text-xs font-bold uppercase tracking-wider text-muted">
                        Link
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-900/5">
                    <tr className="align-top">
                      <td className="py-3 pr-3 text-muted">1</td>
                      <td className="py-3 pr-4 leading-6 text-ink">
                        The effects of L-theanine (Suntheanine&reg;) on objective sleep quality in
                        boys with ADHD
                      </td>
                      <td className="py-3 pr-4 text-muted">Lyon MR, Kapoor MP, Juneja LR</td>
                      <td className="py-3 pr-4 text-muted">2011</td>
                      <td className="py-3">
                        <a
                          href="https://pubmed.ncbi.nlm.nih.gov/22214254/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-brand-700 hover:text-brand-800 hover:underline"
                        >
                          PMID 22214254
                        </a>
                      </td>
                    </tr>
                    <tr className="align-top">
                      <td className="py-3 pr-3 text-muted">2</td>
                      <td className="py-3 pr-4 leading-6 text-ink">
                        L-Theanine and Caffeine Improve Task-Switching Without Impacting Stress
                        Ratings in a Replication of Owen et al. (2008)
                      </td>
                      <td className="py-3 pr-4 text-muted">Owen GN, Parnell H, De Bruin EA, Rycroft JA</td>
                      <td className="py-3 pr-4 text-muted">2008</td>
                      <td className="py-3">
                        <a
                          href="https://pubmed.ncbi.nlm.nih.gov/18681988/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-brand-700 hover:text-brand-800 hover:underline"
                        >
                          PMID 18681988
                        </a>
                      </td>
                    </tr>
                    <tr className="align-top">
                      <td className="py-3 pr-3 text-muted">3</td>
                      <td className="py-3 pr-4 leading-6 text-ink">
                        L-Theanine and Caffeine Improve Task Switching Without Impacting Stress
                      </td>
                      <td className="py-3 pr-4 text-muted">Owen GN et al.</td>
                      <td className="py-3 pr-4 text-muted">2008</td>
                      <td className="py-3">
                        <a
                          href="https://pubmed.ncbi.nlm.nih.gov/18681988/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-brand-700 hover:text-brand-800 hover:underline"
                        >
                          PMID 18681988
                        </a>
                      </td>
                    </tr>
                    <tr className="align-top">
                      <td className="py-3 pr-3 text-muted">4</td>
                      <td className="py-3 pr-4 leading-6 text-ink">
                        L-Theanine and Caffeine Improve Alpha Wave Activity and Accuracy in a
                        Sustained Attention Task
                      </td>
                      <td className="py-3 pr-4 text-muted">Kelly SP, Gomez-Ramirez M, Montesi JL, Foxe JJ</td>
                      <td className="py-3 pr-4 text-muted">2008</td>
                      <td className="py-3">
                        <a
                          href="https://pubmed.ncbi.nlm.nih.gov/18077003/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-brand-700 hover:text-brand-800 hover:underline"
                        >
                          PMID 18077003
                        </a>
                      </td>
                    </tr>
                    <tr className="align-top">
                      <td className="py-3 pr-3 text-muted">5</td>
                      <td className="py-3 pr-4 leading-6 text-ink">
                        Effects of L-Theanine on Stress Response in Mental Arithmetic Task
                      </td>
                      <td className="py-3 pr-4 text-muted">Yoto A, Motoki M, Murao J, Yokogoshi H</td>
                      <td className="py-3 pr-4 text-muted">2012</td>
                      <td className="py-3">
                        <a
                          href="https://pubmed.ncbi.nlm.nih.gov/22950744/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-brand-700 hover:text-brand-800 hover:underline"
                        >
                          PMID 22950744
                        </a>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </ResponsiveTable>
            </div>

          </section>

          <RecommendationSection products={getRevenueProductSet('l-theanine')?.products ?? []} />

          {/* Email capture */}
          <EmailCapture
            headline="Get future research notes by email"
            description="Evidence-first supplement updates, safety context, and new guide announcements. No diagnosis, treatment, or personal medical advice."
            location={`article-${SLUG}`}
          />

          <NewsletterCtaBlock
            title="Continue with the newsletter archive"
            description="Short notes built for cautious supplement decisions."
            location={`article-${SLUG}-newsletter`}
          />
        </div>

        {/* Sidebar */}
        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted">
              In this article
            </p>
            <nav className="mt-3 space-y-1.5" aria-label="Article sections">
              {[
                ['#introduction', 'Introduction'],
                ['#what-is-l-theanine', 'What Is L-Theanine?'],
                ['#uses', 'What It Is Used For'],
                ['#mechanisms', 'How It Works'],
                ['#evidence-summary', 'Evidence Summary'],
                ['#dosage', 'Dosage & Usage'],
                ['#product-recommendations', 'Product Picks'],
                ['#safety', 'Safety & Side Effects'],
                ['#stacking', 'Stacking'],
                ['#faq', 'FAQ'],
                ['#sources', 'Sources'],
              ].map(([href, label]) => (
                <a
                  key={href}
                  href={href}
                  className="block text-sm text-brand-700 hover:text-brand-800 hover:underline"
                >
                  {label}
                </a>
              ))}
            </nav>
          </div>

          <div className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted">
              Explore more
            </p>
            <div className="mt-3 space-y-2">
              <Link
                href="/guides/herbs/l-theanine/"
                className="block text-sm font-medium text-brand-700 hover:text-brand-800 hover:underline"
              >
                L-theanine for anxiety →
              </Link>
              <Link
                href="/guides/sleep/l-theanine-for-sleep"
                className="block text-sm font-medium text-brand-700 hover:text-brand-800 hover:underline"
              >
                L-theanine for sleep →
              </Link>
              <Link
                href="/guides/adhd/l-theanine-for-adhd/"
                className="block text-sm font-medium text-brand-700 hover:text-brand-800 hover:underline"
              >
                L-theanine for ADHD →
              </Link>
              <Link
                href="/guides/herbs/ashwagandha/"
                className="block text-sm font-medium text-brand-700 hover:text-brand-800 hover:underline"
              >
                Ashwagandha article →
              </Link>
              <Link
                href="/compounds/l-theanine"
                className="block text-sm font-medium text-brand-700 hover:text-brand-800 hover:underline"
              >
                L-theanine compound profile →
              </Link>
              <Link
                href="/guides/anxiety"
                className="block text-sm font-medium text-brand-700 hover:text-brand-800 hover:underline"
              >
                Anxiety goal hub →
              </Link>
              <Link
                href="/guides/focus"
                className="block text-sm font-medium text-brand-700 hover:text-brand-800 hover:underline"
              >
                Focus goal hub →
              </Link>
              <Link
                href="/guides/"
                className="block text-sm font-medium text-brand-700 hover:text-brand-800 hover:underline"
              >
                All articles →
              </Link>
            </div>
          </div>
        </aside>
      </div>

      <div className="mt-8">
        <Link href="/guides/" className="text-sm font-semibold text-brand-700 hover:text-brand-800">
          ← Back to Articles
        </Link>
      </div>
    </article>
  )
}