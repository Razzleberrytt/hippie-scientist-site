import Link from 'next/link'
import { buildPageMetadata, blogJsonLd, breadcrumbJsonLd, faqPageJsonLd } from '../../../src/lib/seo'
import EvidenceSummaryCard from '@/components/evidence/EvidenceSummaryCard'
import SafetyNotice from '@/components/evidence/SafetyNotice'
import EmailCapture from '@/components/EmailCapture'
import NewsletterCtaBlock from '@/components/NewsletterCtaBlock'
import LastUpdatedBadge from '../../../src/components/editorial/LastUpdatedBadge'
import ResponsiveTable from '@/components/ui/ResponsiveTable'
import { AFFILIATE_TAGS } from '@/config/affiliate'

// ─── Article metadata ─────────────────────────────────────────────────────────

const SLUG = 'best-herbs-for-sleep'
const TITLE = 'Best Herbs for Sleep: Evidence-Ranked Guide'
const DESCRIPTION =
  'A practical evidence-ranked guide to the best herbs and natural supplements for sleep, including magnesium, ashwagandha, l-theanine, valerian, passionflower, chamomile, lavender, and hops.'
const DATE = '2026-06-09'
const AUTHOR = 'Will'
const READING_TIME = '14 min read'
const TAGS = ['sleep', 'herbs', 'supplements', 'insomnia', 'natural sleep']
const CATEGORY = 'sleep'

export const metadata = buildPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: `/articles/${SLUG}`,
  openGraphType: 'article',
})

// ─── FAQ data (also used for JSON-LD) ────────────────────────────────────────

const FAQS = [
  {
    question: 'What is the best herb for sleep?',
    answer:
      'There is no single "best" herb for everyone — the right choice depends on the cause of your sleep difficulties. Magnesium glycinate is a reasonable first choice for most people due to its safety profile and broad support for sleep quality. For stress-driven poor sleep, ashwagandha has the strongest clinical evidence among adaptogens. For racing thoughts, L-theanine may help. For those who prefer traditional sedative herbs, valerian root is the most studied option.',
  },
  {
    question: 'Which natural sleep supplement works fastest?',
    answer:
      'L-theanine may produce relaxation effects within the same evening at doses of 100–200 mg. Magnesium glycinate can also produce noticeable effects within days to a week for some people. Ashwagandha typically requires 6–8 weeks of consistent use before meaningful sleep improvements are reported in trials. Valerian has mixed evidence on onset timing.',
  },
  {
    question: 'Can you combine sleep herbs?',
    answer:
      'Some combinations are reasonable and commonly used — for example, magnesium glycinate with ashwagandha or L-theanine. These pairs work via different mechanisms and are not known to interact adversely. However, combining multiple sedative herbs (valerian, passionflower, hops, lavender) simultaneously increases CNS depression risk. Start with one supplement at a time, especially if you take prescription medications.',
  },
  {
    question: 'Are sleep herbs safe long term?',
    answer:
      'Safety varies by herb. Magnesium glycinate at moderate doses is generally safe for long-term daily use in people with normal kidney function. Ashwagandha has been studied for up to 8–12 weeks; data beyond that is limited, and rare hepatotoxicity cases have been reported. Valerian, passionflower, chamomile, and lavender have long traditional use histories, but rigorous long-term safety trials are sparse. Consult a healthcare provider for any supplement use beyond a few months.',
  },
  {
    question: 'What should I try first?',
    answer:
      'Start with magnesium glycinate (200–400 mg elemental, taken 30–60 minutes before bed). It is the most broadly applicable, lowest-risk first option with a plausible mechanism and reasonable clinical support. If your main sleep problem is clearly stress- or anxiety-driven, adding ashwagandha (KSM-66 or Sensoril, 300–600 mg/day) after assessing magnesium alone is a reasonable second step.',
  },
  {
    question: 'When should I see a doctor for sleep problems?',
    answer:
      'See a doctor if your sleep problems have persisted for more than three months, significantly impair your daytime functioning, or are accompanied by symptoms like loud snoring, gasping for air, excessive daytime sleepiness, or restless legs. Herbs and supplements do not treat sleep apnea, periodic limb movement disorder, narcolepsy, or other medical sleep disorders. Cognitive behavioral therapy for insomnia (CBT-I) is the first-line treatment for chronic insomnia disorder.',
  },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BestHerbsForSleepPage() {
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pageBreadcrumb) }}
      />
      {faqLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
        />
      )}

      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-muted">
        <Link href="/articles" className="transition hover:text-ink">
          Articles
        </Link>
        <span>/</span>
        <span className="text-ink line-clamp-1">{TITLE}</span>
      </nav>

      {/* Hero */}
      <section className="rounded-[1.5rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8 lg:p-10">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-full border border-brand-900/10 bg-brand-50 px-2.5 py-0.5 font-bold uppercase tracking-wider text-brand-800">
            Hub Guide
          </span>
          <span className="rounded-full border border-brand-900/10 bg-white px-2.5 py-0.5 font-semibold text-muted capitalize">
            {CATEGORY}
          </span>
          {TAGS.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-brand-900/10 bg-white px-2.5 py-0.5 font-semibold text-muted capitalize"
            >
              {tag}
            </span>
          ))}
          <span className="text-muted">June 9, 2026</span>
          <span className="text-muted">·</span>
          <span className="text-muted">{READING_TIME}</span>
        </div>

        <h1 className="mt-4 font-display text-3xl font-bold leading-tight tracking-tight text-ink sm:text-4xl lg:text-5xl">
          {TITLE}
        </h1>

        <p className="mt-2 text-sm text-muted">
          By{' '}
          <Link href="/about" rel="author" className="font-medium text-ink hover:underline">
            {AUTHOR}
          </Link>
        </p>

        <div className="mt-3">
          <LastUpdatedBadge date={DATE} label="Last updated" />
        </div>

        <p className="mt-4 max-w-3xl text-base leading-7 text-[#46574d]">{DESCRIPTION}</p>
      </section>

      {/* Affiliate disclosure */}
      <div className="mt-4 rounded-[1rem] border border-brand-900/10 bg-brand-50/60 px-5 py-3 text-xs leading-6 text-muted">
        <strong className="text-ink">Affiliate disclosure:</strong> This article contains affiliate
        links. If you purchase through these links, we may earn a commission at no additional cost to
        you. We only link to products consistent with the evidence reviewed on this page.
      </div>

      {/* Body + sidebar */}
      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_240px]">
        {/* Main content */}
        <div className="space-y-6">

          {/* Quick Verdict */}
          <section className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8">
            <p className="eyebrow-label">Quick Verdict</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
              Which Sleep Herb Should You Start With?
            </h2>
            <div className="mt-3 space-y-3 text-[1.01rem] leading-[1.85] text-[#46574d]">
              <p>
                <strong>Best first choice overall: Magnesium glycinate.</strong> Broadly applicable,
                low risk, plausible mechanism, and reasonable clinical support — the default starting
                point for most people.
              </p>
              <p>
                <strong>Best for stress-driven poor sleep: Ashwagandha.</strong> The strongest
                clinical evidence among adaptogens for sleep, particularly when elevated stress or
                cortisol is the main driver.
              </p>
              <p>
                <strong>Best for relaxation without sedation: L-theanine.</strong> Promotes calm
                focus and reduces anxious arousal without causing drowsiness — useful for racing
                thoughts at bedtime.
              </p>
              <p>
                <strong>Best traditional herbal option: Valerian root.</strong> The most studied
                botanical sedative with centuries of traditional use, though clinical evidence is
                mixed.
              </p>
              <p>
                <strong>Best gentle anxiety/sleep support: Passionflower.</strong> Modest evidence
                for reducing anxiety overlapping with sleep difficulty; well-tolerated and gentle.
              </p>
            </div>
          </section>

          {/* Main article body */}
          <section className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8 space-y-8">

            {/* Ranking table */}
            <div id="ranking-table">
              <h2 className="mb-4 text-2xl font-semibold tracking-tight text-ink">
                Evidence-Ranked Overview
              </h2>
              <p className="mb-4 text-[1.01rem] leading-[1.85] text-[#46574d]">
                The table below ranks the most commonly used herbs and supplements for sleep by
                quality of human clinical evidence, practical usefulness, and safety profile.
                Rankings are based on available evidence as of the date of this article — not
                traditional reputation or marketing claims.
              </p>

              <div className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-5 shadow-sm">
                <ResponsiveTable label="Evidence-ranked sleep herbs and supplements">
                  <table className="min-w-[700px] w-full text-sm">
                    <thead>
                      <tr className="border-b border-brand-900/10">
                        <th className="pb-2 pr-3 text-left text-xs font-bold uppercase tracking-wider text-muted">
                          Rank
                        </th>
                        <th className="pb-2 pr-4 text-left text-xs font-bold uppercase tracking-wider text-muted">
                          Herb / Supplement
                        </th>
                        <th className="pb-2 pr-4 text-left text-xs font-bold uppercase tracking-wider text-muted">
                          Evidence Level
                        </th>
                        <th className="pb-2 pr-4 text-left text-xs font-bold uppercase tracking-wider text-muted">
                          Best For
                        </th>
                        <th className="pb-2 pr-4 text-left text-xs font-bold uppercase tracking-wider text-muted">
                          Typical Use Case
                        </th>
                        <th className="pb-2 text-left text-xs font-bold uppercase tracking-wider text-muted">
                          Full Guide
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-900/5">
                      <tr className="align-top">
                        <td className="py-3 pr-3 font-bold text-brand-700">1</td>
                        <td className="py-3 pr-4 font-medium text-ink">Magnesium glycinate</td>
                        <td className="py-3 pr-4 text-[#46574d]">Limited–Moderate</td>
                        <td className="py-3 pr-4 text-[#46574d]">General sleep quality, muscle tension, deficiency</td>
                        <td className="py-3 pr-4 text-[#46574d]">200–400 mg elemental, 30–60 min before bed</td>
                        <td className="py-3">
                          <Link
                            href="/articles/magnesium-for-sleep"
                            className="font-semibold text-brand-700 hover:text-brand-800 hover:underline"
                          >
                            Full guide →
                          </Link>
                        </td>
                      </tr>
                      <tr className="align-top">
                        <td className="py-3 pr-3 font-bold text-brand-700">2</td>
                        <td className="py-3 pr-4 font-medium text-ink">Ashwagandha</td>
                        <td className="py-3 pr-4 text-[#46574d]">Moderate</td>
                        <td className="py-3 pr-4 text-[#46574d]">Stress-driven poor sleep, cortisol, anxiety</td>
                        <td className="py-3 pr-4 text-[#46574d]">300–600 mg/day (KSM-66 or Sensoril), evening</td>
                        <td className="py-3">
                          <Link
                            href="/articles/ashwagandha-for-sleep"
                            className="font-semibold text-brand-700 hover:text-brand-800 hover:underline"
                          >
                            Full guide →
                          </Link>
                        </td>
                      </tr>
                      <tr className="align-top">
                        <td className="py-3 pr-3 font-bold text-brand-700">3</td>
                        <td className="py-3 pr-4 font-medium text-ink">L-Theanine</td>
                        <td className="py-3 pr-4 text-[#46574d]">Limited–Moderate</td>
                        <td className="py-3 pr-4 text-[#46574d]">Racing thoughts, anxious arousal at bedtime</td>
                        <td className="py-3 pr-4 text-[#46574d]">100–200 mg, 30–60 min before bed</td>
                        <td className="py-3 text-xs">
                          <Link
                            href="/articles/l-theanine-for-sleep"
                            className="font-semibold text-brand-700 hover:text-brand-800 hover:underline"
                          >
                            Full guide →
                          </Link>
                        </td>
                      </tr>
                      <tr className="align-top">
                        <td className="py-3 pr-3 font-bold text-brand-700">4</td>
                        <td className="py-3 pr-4 font-medium text-ink">Valerian root</td>
                        <td className="py-3 pr-4 text-[#46574d]">Mixed / weak</td>
                        <td className="py-3 pr-4 text-[#46574d]">Sleep onset latency, traditional sedation</td>
                        <td className="py-3 pr-4 text-[#46574d]">300–600 mg, 30–60 min before bed</td>
                        <td className="py-3 text-muted text-xs">Guide planned</td>
                      </tr>
                      <tr className="align-top">
                        <td className="py-3 pr-3 font-bold text-brand-700">5</td>
                        <td className="py-3 pr-4 font-medium text-ink">Passionflower</td>
                        <td className="py-3 pr-4 text-[#46574d]">Limited</td>
                        <td className="py-3 pr-4 text-[#46574d]">Anxiety-adjacent sleep difficulty</td>
                        <td className="py-3 pr-4 text-[#46574d]">250–500 mg extract or 1 cup tea, evening</td>
                        <td className="py-3 text-muted text-xs">Guide planned</td>
                      </tr>
                      <tr className="align-top">
                        <td className="py-3 pr-3 font-bold text-[#46574d]">6</td>
                        <td className="py-3 pr-4 font-medium text-ink">Chamomile</td>
                        <td className="py-3 pr-4 text-[#46574d]">Limited</td>
                        <td className="py-3 pr-4 text-[#46574d]">Mild relaxation, gentle sleep aid</td>
                        <td className="py-3 pr-4 text-[#46574d]">Tea or 200–400 mg extract, evening</td>
                        <td className="py-3 text-muted text-xs">Guide planned</td>
                      </tr>
                      <tr className="align-top">
                        <td className="py-3 pr-3 font-bold text-[#46574d]">7</td>
                        <td className="py-3 pr-4 font-medium text-ink">Lavender</td>
                        <td className="py-3 pr-4 text-[#46574d]">Limited (mostly aromatherapy)</td>
                        <td className="py-3 pr-4 text-[#46574d]">Relaxation, sleep environment</td>
                        <td className="py-3 pr-4 text-[#46574d]">Oral: Silexan 80 mg; aromatherapy: diffuser</td>
                        <td className="py-3 text-muted text-xs">Guide planned</td>
                      </tr>
                      <tr className="align-top">
                        <td className="py-3 pr-3 font-bold text-[#46574d]">8</td>
                        <td className="py-3 pr-4 font-medium text-ink">Hops</td>
                        <td className="py-3 pr-4 text-[#46574d]">Limited (often combined)</td>
                        <td className="py-3 pr-4 text-[#46574d]">Often used with valerian in formulas</td>
                        <td className="py-3 pr-4 text-[#46574d]">Typically in combination products</td>
                        <td className="py-3 text-muted text-xs">Guide planned</td>
                      </tr>
                    </tbody>
                  </table>
                </ResponsiveTable>
              </div>
            </div>

            <hr className="border-brand-900/10" />

            {/* How We Ranked */}
            <div id="how-we-ranked">
              <h2 className="mb-3 text-2xl font-semibold tracking-tight text-ink">
                How We Ranked These Herbs
              </h2>
              <p className="text-[1.01rem] leading-[1.85] text-[#46574d]">
                Rankings are not based on popularity, traditional reputation, or marketing
                prominence. The criteria used, in rough order of weight:
              </p>
              <ul className="mt-3 ml-5 space-y-2 list-disc text-[1.01rem] leading-[1.85] text-[#46574d]">
                <li>
                  <strong>Human clinical evidence</strong> — randomized controlled trials in humans
                  using validated sleep outcome measures (PSQI, ISI, actigraphy, PSG). Animal and
                  in vitro data support mechanistic plausibility but do not count toward the
                  evidence grade.
                </li>
                <li>
                  <strong>Practical usefulness</strong> — evidence for meaningful improvements in
                  outcomes people actually care about: time to fall asleep, total sleep time, sleep
                  quality scores, morning alertness.
                </li>
                <li>
                  <strong>Safety profile</strong> — tolerability, known contraindications, and
                  known drug interactions. A well-evidenced supplement with serious safety concerns
                  ranks lower than a modestly evidenced option with an excellent safety profile.
                </li>
                <li>
                  <strong>Cost and accessibility</strong> — widely available, affordable options
                  rank higher than equivalent options that are expensive or difficult to source.
                </li>
                <li>
                  <strong>Mechanistic plausibility</strong> — a coherent biological mechanism
                  increases confidence that observed effects are real, even when trial evidence is
                  limited.
                </li>
                <li>
                  <strong>Sleep-specific fit</strong> — some adaptogens and anxiolytics have broad
                  evidence but limited sleep-specific trial data. Ranking reflects sleep outcome
                  evidence specifically.
                </li>
              </ul>
            </div>

            <hr className="border-brand-900/10" />

            {/* Deep dives */}
            <div id="deep-dives">
              <h2 className="mb-6 text-2xl font-semibold tracking-tight text-ink">
                Deep Dives: Top 5
              </h2>

              {/* Magnesium */}
              <div id="magnesium" className="mb-8">
                <h3 className="mb-2 text-xl font-semibold tracking-tight text-ink">
                  1. Magnesium Glycinate
                </h3>
                <EvidenceSummaryCard
                  title="Magnesium &amp; Sleep Quality"
                  evidenceLevel="Limited"
                  humanEvidence="Some RCTs suggest magnesium improves sleep quality, sleep efficiency, and early morning awakening, particularly in older adults and those with low magnesium status. Evidence in healthy, magnesium-replete younger adults is more limited."
                  mechanisticEvidence="NMDA antagonism reduces excitatory glutamatergic tone; GABA-A potentiation supports inhibitory signaling; melatonin synthesis pathway support. Glycine co-carrier has independent calming effects studied separately."
                  safetyProfile="Generally well-tolerated at 200–400 mg elemental/day. GI upset at higher doses or with lower-quality forms. Kidney disease requires caution."
                />
                <div className="mt-4 space-y-2 text-[1.01rem] leading-[1.85] text-[#46574d]">
                  <p>
                    <strong>How it may help sleep:</strong> Magnesium blunts excitatory
                    neurotransmission (NMDA antagonism) and supports inhibitory signaling (GABA-A),
                    which may facilitate the physiological transition from wakefulness to sleep.
                    The glycinate form adds glycine, an inhibitory amino acid with its own modest
                    sleep-promoting evidence.
                  </p>
                  <p>
                    <strong>Best-fit user:</strong> Most people — particularly those who suspect
                    suboptimal dietary magnesium intake, experience muscle tension at night, or
                    want a low-risk starting point.
                  </p>
                  <p>
                    <strong>Main limitation:</strong> Effect size is modest and most consistent in
                    deficient populations. If you are well-nourished with adequate magnesium
                    intake, benefit may be smaller.
                  </p>
                  <p>
                    <strong>Safety note:</strong> Avoid high doses with kidney disease. GI
                    discomfort is possible, especially with citrate or oxide forms at higher doses —
                    glycinate is generally better tolerated.
                  </p>
                  <p>
                    <Link
                      href="/articles/magnesium-for-sleep"
                      className="font-semibold text-brand-700 hover:text-brand-800 hover:underline"
                    >
                      Full guide: Magnesium for Sleep →
                    </Link>
                  </p>
                </div>
              </div>

              <hr className="border-brand-900/10" />

              {/* Ashwagandha */}
              <div id="ashwagandha" className="mt-8 mb-8">
                <h3 className="mb-2 text-xl font-semibold tracking-tight text-ink">
                  2. Ashwagandha
                </h3>
                <EvidenceSummaryCard
                  title="Ashwagandha &amp; Sleep Quality"
                  evidenceLevel="Moderate"
                  humanEvidence="Multiple RCTs (n=50–150) show significant improvements in sleep quality scores, sleep onset latency, and total sleep time vs placebo over 6–10 weeks in adults with elevated stress. Effect sizes are moderate."
                  mechanisticEvidence="HPA axis modulation and cortisol reduction are well-documented in human trials. GABA-A binding activity demonstrated in vitro. TEG-mediated non-REM induction in animal models."
                  safetyProfile="Generally well-tolerated at 300–600 mg/day for up to 12 weeks. Rare hepatotoxicity cases reported. Contraindicated in pregnancy. Potential thyroid interactions."
                />
                <div className="mt-4 space-y-2 text-[1.01rem] leading-[1.85] text-[#46574d]">
                  <p>
                    <strong>How it may help sleep:</strong> Ashwagandha reduces cortisol via HPA
                    axis modulation, dampens sympathetic nervous system activation, and may have
                    modest GABA-A receptor activity. It does not act as a direct sedative — it
                    works by reducing the stress response that keeps the nervous system alert at
                    night.
                  </p>
                  <p>
                    <strong>Best-fit user:</strong> Adults whose poor sleep is clearly linked to
                    elevated stress, anxiety, or difficulty winding down mentally. Less useful for
                    sleep problems unrelated to stress.
                  </p>
                  <p>
                    <strong>Main limitation:</strong> Onset is slow — most trials show meaningful
                    improvement only after 6–8 weeks. Not a fast-acting sleep aid.
                  </p>
                  <p>
                    <strong>Safety note:</strong> Rare hepatotoxicity cases have been reported;
                    avoid if you have liver disease or take hepatotoxic medications. Avoid in
                    pregnancy.
                  </p>
                  <p>
                    <Link
                      href="/articles/ashwagandha-for-sleep"
                      className="font-semibold text-brand-700 hover:text-brand-800 hover:underline"
                    >
                      Full guide: Ashwagandha for Sleep →
                    </Link>
                  </p>
                </div>
              </div>

              <hr className="border-brand-900/10" />

              {/* L-Theanine */}
              <div id="l-theanine" className="mt-8 mb-8">
                <h3 className="mb-2 text-xl font-semibold tracking-tight text-ink">
                  3. L-Theanine
                </h3>
                <EvidenceSummaryCard
                  title="L-Theanine &amp; Sleep"
                  evidenceLevel="Limited"
                  humanEvidence="Small trials suggest L-theanine improves subjective sleep quality and reduces anxious arousal without causing sedation. Most studies are small and short-term. Evidence is more consistent for relaxation than for direct sleep onset improvement."
                  mechanisticEvidence="Promotes alpha-wave brain activity, modulates glutamate and GABA signaling, and may reduce cortisol response to stress. Does not bind GABA-A receptors directly — promotes calm rather than sedation."
                  safetyProfile="Very well-tolerated. No significant drug interactions reported at standard doses. Long-term safety data limited but no serious adverse events identified."
                />
                <div className="mt-4 space-y-2 text-[1.01rem] leading-[1.85] text-[#46574d]">
                  <p>
                    <strong>How it may help sleep:</strong> L-theanine, an amino acid found in
                    green tea, promotes relaxed alertness by increasing alpha-wave brain activity.
                    It reduces anxious rumination and physiological stress markers without causing
                    drowsiness, which may help people who lie awake with racing thoughts rather
                    than people who simply cannot stay asleep.
                  </p>
                  <p>
                    <strong>Best-fit user:</strong> People whose primary sleep difficulty is mental
                    hyperarousal or anxious thoughts at bedtime. Also useful as a daytime anxiolytic
                    that does not impair cognitive function.
                  </p>
                  <p>
                    <strong>Main limitation:</strong> Evidence for direct sleep improvement (as
                    measured by PSG or actigraphy) is limited. Most benefit is subjective and
                    related to relaxation rather than sleep architecture changes.
                  </p>
                  <p>
                    <strong>Safety note:</strong> One of the safest options on this list. No
                    significant drug interactions at standard doses (100–200 mg). Can be combined
                    with magnesium or ashwagandha without known interaction risk.
                  </p>
                </div>
              </div>

              <hr className="border-brand-900/10" />

              {/* Valerian */}
              <div id="valerian" className="mt-8 mb-8">
                <h3 className="mb-2 text-xl font-semibold tracking-tight text-ink">
                  4. Valerian Root
                </h3>
                <EvidenceSummaryCard
                  title="Valerian &amp; Sleep"
                  evidenceLevel="Limited"
                  humanEvidence="Meta-analyses of valerian RCTs show mixed results. Some trials report improvements in sleep onset latency and subjective sleep quality; others show no significant effect versus placebo. Heterogeneity of preparations and dosing makes synthesis difficult."
                  mechanisticEvidence="Proposed GABA-A receptor agonism via valerenic acid; adenosine receptor activity; possible serotonin interaction. Mechanisms are plausible but not firmly established in human pharmacokinetic studies."
                  safetyProfile="Generally safe at standard doses for short-term use. Sedation and grogginess reported at higher doses. Rarely associated with hepatotoxicity in case reports. Not recommended in pregnancy."
                />
                <div className="mt-4 space-y-2 text-[1.01rem] leading-[1.85] text-[#46574d]">
                  <p>
                    <strong>How it may help sleep:</strong> Valerian root may act as a mild
                    sedative via GABA-A agonism (similar in mechanism to benzodiazepines, but far
                    weaker). Valerenic acid is considered the primary active constituent in most
                    preparations.
                  </p>
                  <p>
                    <strong>Best-fit user:</strong> People who want a traditional botanical sedative
                    with a long history of use. More likely to produce noticeable effects than
                    magnesium or L-theanine in people who want something with a more sedative character.
                  </p>
                  <p>
                    <strong>Main limitation:</strong> Clinical evidence is inconsistent. Preparation
                    quality varies significantly between products. The smell and taste of valerian
                    root products is notably unpleasant.
                  </p>
                  <p>
                    <strong>Safety note:</strong> Avoid combining with prescription sedatives,
                    benzodiazepines, or alcohol. Do not use in pregnancy. Isolated hepatotoxicity
                    cases have been reported, though causality is uncertain.
                  </p>
                </div>
              </div>

              <hr className="border-brand-900/10" />

              {/* Passionflower */}
              <div id="passionflower" className="mt-8">
                <h3 className="mb-2 text-xl font-semibold tracking-tight text-ink">
                  5. Passionflower
                </h3>
                <EvidenceSummaryCard
                  title="Passionflower &amp; Sleep"
                  evidenceLevel="Limited"
                  humanEvidence="A small number of RCTs suggest passionflower tea or extract modestly improves subjective sleep quality and reduces anxiety. Most studies are small (n&lt;60), short-term, and primarily self-report based."
                  mechanisticEvidence="Chrysin and other flavonoids may bind GABA-A receptors. Preclinical evidence for anxiolytic and sedative effects. Human mechanistic data is sparse."
                  safetyProfile="Generally well-tolerated at standard doses. Sedation at higher doses. Avoid with prescription sedatives. Not recommended in pregnancy."
                />
                <div className="mt-4 space-y-2 text-[1.01rem] leading-[1.85] text-[#46574d]">
                  <p>
                    <strong>How it may help sleep:</strong> Passionflower contains flavonoids
                    (including chrysin) that may modulate GABA-A receptors, producing mild
                    sedative and anxiolytic effects. The most consistent evidence is for anxiety
                    reduction, which secondarily benefits sleep quality.
                  </p>
                  <p>
                    <strong>Best-fit user:</strong> People with anxiety that overlaps with sleep
                    difficulty, or those who want a gentle herbal option with a tea-based
                    preparation. A good choice for those who want something milder than valerian.
                  </p>
                  <p>
                    <strong>Main limitation:</strong> Evidence base is thin. Most benefit is
                    reported subjectively. Standardization of commercial passionflower products
                    varies considerably.
                  </p>
                  <p>
                    <strong>Safety note:</strong> Do not combine with prescription sedatives or
                    benzodiazepines. Avoid in pregnancy (uterotonic activity reported in animal
                    models).
                  </p>
                </div>
              </div>
            </div>

            <hr className="border-brand-900/10" />

            {/* Which should you choose */}
            <div id="decision-framework">
              <h2 className="mb-4 text-2xl font-semibold tracking-tight text-ink">
                Which Should You Choose?
              </h2>
              <p className="mb-4 text-[1.01rem] leading-[1.85] text-[#46574d]">
                The most useful framework is to match the supplement to the primary driver of your
                sleep difficulty:
              </p>
              <div className="space-y-3 rounded-[1rem] border border-brand-900/10 bg-brand-50/40 p-5">
                <div className="flex gap-3">
                  <span className="mt-0.5 flex-shrink-0 text-brand-700">→</span>
                  <p className="text-[1.01rem] leading-[1.85] text-[#46574d]">
                    <strong>If you want the simplest starting point with the broadest
                    applicability:</strong> try{' '}
                    <Link href="/articles/magnesium-for-sleep" className="font-semibold text-brand-700 hover:underline">
                      magnesium glycinate
                    </Link>{' '}
                    (200–400 mg elemental, 30–60 min before bed).
                  </p>
                </div>
                <div className="flex gap-3">
                  <span className="mt-0.5 flex-shrink-0 text-brand-700">→</span>
                  <p className="text-[1.01rem] leading-[1.85] text-[#46574d]">
                    <strong>If stress is clearly the main sleep blocker</strong> — you find it hard
                    to wind down, your mind is active, or you notice elevated stress throughout the
                    day: try{' '}
                    <Link href="/articles/ashwagandha-for-sleep" className="font-semibold text-brand-700 hover:underline">
                      ashwagandha
                    </Link>{' '}
                    (KSM-66 or Sensoril, 300–600 mg/day). Allow 6–8 weeks.
                  </p>
                </div>
                <div className="flex gap-3">
                  <span className="mt-0.5 flex-shrink-0 text-brand-700">→</span>
                  <p className="text-[1.01rem] leading-[1.85] text-[#46574d]">
                    <strong>If racing thoughts are the specific issue at bedtime:</strong> try
                    L-theanine (100–200 mg, 30–60 min before bed). It promotes calm without
                    sedation and works relatively quickly.
                  </p>
                </div>
                <div className="flex gap-3">
                  <span className="mt-0.5 flex-shrink-0 text-brand-700">→</span>
                  <p className="text-[1.01rem] leading-[1.85] text-[#46574d]">
                    <strong>If you prefer a traditional sedative botanical:</strong> try valerian
                    root. Expect variable results — the evidence is mixed, but some people find it
                    reliably helpful.
                  </p>
                </div>
                <div className="flex gap-3">
                  <span className="mt-0.5 flex-shrink-0 text-brand-700">→</span>
                  <p className="text-[1.01rem] leading-[1.85] text-[#46574d]">
                    <strong>If anxiety overlaps with your sleep difficulty and you want a
                    gentle option:</strong> passionflower is worth considering, particularly as a
                    tea before bed.
                  </p>
                </div>
              </div>
            </div>

            <hr className="border-brand-900/10" />

            {/* Combinations */}
            <div id="combinations">
              <h2 className="mb-4 text-2xl font-semibold tracking-tight text-ink">
                Combinations That Make Sense
              </h2>
              <p className="mb-4 text-[1.01rem] leading-[1.85] text-[#46574d]">
                These are reasonable combinations based on different mechanisms and common
                supplement stacking practice. Direct combination trials may be limited or absent —
                the rationale is mechanistic complementarity and absence of known adverse
                interactions, not clinical combination evidence.
              </p>
              <div className="space-y-4">
                <div className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm">
                  <p className="font-semibold text-ink">Magnesium + Ashwagandha</p>
                  <p className="mt-1 text-sm leading-6 text-[#46574d]">
                    The most popular sleep stack. Magnesium addresses cellular relaxation
                    (NMDA, GABA), ashwagandha addresses the cortisol/stress axis. Complementary
                    mechanisms with no known adverse interaction. Well-suited for people with
                    both physical tension and stress-related arousal.
                  </p>
                </div>
                <div className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm">
                  <p className="font-semibold text-ink">Magnesium + L-Theanine</p>
                  <p className="mt-1 text-sm leading-6 text-[#46574d]">
                    A gentle relaxation stack. Magnesium supports sleep architecture; L-theanine
                    reduces anxious arousal. Both are among the lowest-risk options and work via
                    different pathways. A reasonable choice for people who want to address both
                    physical and mental tension.
                  </p>
                </div>
                <div className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm">
                  <p className="font-semibold text-ink">Ashwagandha + L-Theanine</p>
                  <p className="mt-1 text-sm leading-6 text-[#46574d]">
                    Both target anxiety and stress pathways via different mechanisms (HPA axis
                    vs alpha-wave promotion). Potentially additive for people with significant
                    stress-driven sleep disruption. L-theanine may provide faster relief while
                    ashwagandha builds over weeks.
                  </p>
                </div>
                <div className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm">
                  <p className="font-semibold text-ink">Magnesium + Ashwagandha + L-Theanine</p>
                  <p className="mt-1 text-sm leading-6 text-[#46574d]">
                    A comprehensive but still conservative sleep stack. Three different
                    mechanisms: cellular relaxation (Mg), HPA axis modulation (ashwagandha),
                    and anxious arousal reduction (L-theanine). No known adverse interactions
                    between these three. Start each supplement individually before combining to
                    identify individual tolerability.
                  </p>
                </div>
              </div>
              <p className="mt-3 text-sm text-muted">
                Note: Do not combine herbal sedatives (valerian, passionflower, hops, chamomile)
                with each other or with prescription sedatives without medical guidance.
              </p>
            </div>

            <hr className="border-brand-900/10" />

            {/* What not to do */}
            <div id="what-not-to-do">
              <h2 className="mb-4 text-2xl font-semibold tracking-tight text-ink">
                What Not To Do
              </h2>
              <ul className="ml-5 space-y-3 list-disc text-[1.01rem] leading-[1.85] text-[#46574d]">
                <li>
                  <strong>Do not start 5 supplements at once.</strong> You will not know which one
                  is helping (or causing side effects). Introduce one at a time, assess for 2–4
                  weeks, then add the next if desired.
                </li>
                <li>
                  <strong>Do not megadose.</strong> More is not better for most sleep supplements.
                  Higher magnesium doses increase GI risk; higher ashwagandha doses do not appear
                  to produce proportionally greater sleep benefits and increase the risk of side
                  effects.
                </li>
                <li>
                  <strong>Do not combine herbs with prescription sedatives without medical
                  guidance.</strong> Valerian, passionflower, kava, and other sedative botanicals
                  can potentiate benzodiazepines, Z-drugs (zolpidem, zaleplon), and opioids.
                  This is a meaningful safety risk.
                </li>
                <li>
                  <strong>Do not assume herbs fix medical sleep disorders.</strong> Supplements
                  do not treat obstructive sleep apnea, periodic limb movement disorder,
                  narcolepsy, or circadian rhythm disorders. If you snore loudly, gasp during
                  sleep, or feel unrefreshed regardless of sleep duration, see a physician.
                </li>
                <li>
                  <strong>Do not default to magnesium citrate if you have GI issues.</strong>{' '}
                  Magnesium citrate at higher doses is likely to cause loose stools. For sleep
                  purposes, magnesium glycinate is better tolerated and more appropriate.
                </li>
              </ul>
            </div>

            <hr className="border-brand-900/10" />

            {/* Safety */}
            <div id="safety">
              <h2 className="mb-4 text-2xl font-semibold tracking-tight text-ink">
                Safety Overview
              </h2>
              <SafetyNotice title="General Safety — Sleep Herbs and Supplements">
                <ul className="ml-5 space-y-1.5 list-disc">
                  <li>
                    <strong>Pregnancy and breastfeeding:</strong> Most herbs on this list —
                    including ashwagandha, valerian, passionflower, hops, and lavender — should
                    be avoided during pregnancy due to limited safety data and/or preclinical
                    signals of uterotonic or fetal risk. Magnesium is generally considered safe
                    at dietary intake levels during pregnancy; high supplemental doses should be
                    discussed with a healthcare provider.
                  </li>
                  <li>
                    <strong>Sedative medications:</strong> Sedative botanicals (valerian,
                    passionflower, hops, kava, chamomile in high doses) can potentiate the CNS
                    depressant effects of benzodiazepines, Z-drugs, barbiturates, and opioids.
                    Do not combine without medical supervision.
                  </li>
                  <li>
                    <strong>Liver caution — ashwagandha:</strong> Multiple post-market case
                    reports of drug-induced liver injury associated with ashwagandha. Avoid if
                    you have liver disease or take other hepatotoxic medications. Monitor for
                    symptoms of liver injury (jaundice, dark urine, RUQ pain).
                  </li>
                  <li>
                    <strong>Kidney disease — magnesium:</strong> The kidneys regulate magnesium
                    excretion. Supplementation in people with moderate to severe kidney disease
                    (CKD stage 3+) can cause hypermagnesemia. Consult a physician before
                    supplementing with magnesium if you have kidney disease.
                  </li>
                  <li>
                    <strong>Medical sleep disorders require medical evaluation.</strong> Chronic
                    insomnia disorder, sleep apnea, narcolepsy, restless legs syndrome, and
                    circadian rhythm disorders are medical conditions. Herbs and supplements are
                    not appropriate primary treatments. CBT-I (cognitive behavioral therapy for
                    insomnia) is the evidence-based first-line treatment for chronic insomnia.
                  </li>
                </ul>
              </SafetyNotice>
            </div>

            <hr className="border-brand-900/10" />

            {/* Related Articles */}
            <div id="related-articles">
              <h2 className="mb-4 text-2xl font-semibold tracking-tight text-ink">
                Related Articles
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                <Link
                  href="/articles/ashwagandha-for-sleep"
                  className="group rounded-[0.75rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm transition hover:border-brand-700/30"
                >
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted">
                    Sleep Cluster
                  </p>
                  <p className="font-semibold text-ink transition group-hover:text-brand-700">
                    Ashwagandha for Sleep
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    Evidence, dosage, mechanisms, and what to expect from ashwagandha as a
                    sleep supplement.
                  </p>
                </Link>
                <Link
                  href="/articles/magnesium-for-sleep"
                  className="group rounded-[0.75rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm transition hover:border-brand-700/30"
                >
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted">
                    Sleep Cluster
                  </p>
                  <p className="font-semibold text-ink transition group-hover:text-brand-700">
                    Magnesium for Sleep
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    Evidence, types (glycinate vs threonate vs citrate), dosage, and what to
                    expect from magnesium as a sleep supplement.
                  </p>
                </Link>
                <Link
                  href="/articles/l-theanine-for-sleep"
                  className="group rounded-[0.75rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm transition hover:border-brand-700/30"
                >
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted">
                    Sleep Cluster
                  </p>
                  <p className="font-semibold text-ink transition group-hover:text-brand-700">
                    L-Theanine for Sleep
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    How L-theanine promotes relaxation without sedation and when it is most useful
                    for sleep.
                  </p>
                </Link>
                <Link
                  href="/articles/magnesium-types-for-sleep"
                  className="group rounded-[0.75rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm transition hover:border-brand-700/30"
                >
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted">
                    Sleep Cluster
                  </p>
                  <p className="font-semibold text-ink transition group-hover:text-brand-700">
                    Magnesium Types for Sleep
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    Deep dive into glycinate vs threonate vs citrate vs oxide vs malate — which
                    form is right for you.
                  </p>
                </Link>
                <Link
                  href="/articles/ashwagandha-vs-magnesium-for-sleep"
                  className="group rounded-[0.75rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm transition hover:border-brand-700/30"
                >
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted">
                    Sleep Cluster
                  </p>
                  <p className="font-semibold text-ink transition group-hover:text-brand-700">
                    Ashwagandha vs Magnesium for Sleep
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    A direct comparison of mechanisms, evidence, timing, cost, and use cases
                    for choosing between the two most popular sleep supplements.
                  </p>
                </Link>
                <Link
                  href="/articles/sleep-stack-guide"
                  className="group rounded-[0.75rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm transition hover:border-brand-700/30"
                >
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted">
                    Sleep Cluster
                  </p>
                  <p className="font-semibold text-ink transition group-hover:text-brand-700">
                    Sleep Stack Guide
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    How to combine magnesium, ashwagandha, and L-theanine in a practical
                    sleep supplement stack.
                  </p>
                </Link>
                <Link
                  href="/articles/natural-anxiety-relief"
                  className="group rounded-[0.75rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm transition hover:border-brand-700/30"
                >
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted">
                    Anxiety Cluster
                  </p>
                  <p className="font-semibold text-ink transition group-hover:text-brand-700">
                    Natural Anxiety Relief
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    Evidence-ranked guide to ashwagandha, L-theanine, magnesium, kava, saffron,
                    and other anxiety supplements.
                  </p>
                </Link>
                <Link
                  href="/articles/sleep-and-adhd"
                  className="group rounded-[0.75rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm transition hover:border-brand-700/30"
                >
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted">
                    Focus / ADHD Cluster
                  </p>
                  <p className="font-semibold text-ink transition group-hover:text-brand-700">
                    Sleep and ADHD
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    Evidence-based overview of how sleep problems overlap with ADHD and practical management strategies.
                  </p>
                </Link>
              </div>
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
                    <p className="mt-2 text-sm leading-7 text-[#46574d]">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>

            <hr className="border-brand-900/10" />

            {/* Sources */}
            <div id="sources">
              <h2 className="mb-4 text-2xl font-semibold tracking-tight text-ink">Sources</h2>
              <p className="mb-4 text-sm text-muted">
                PMID links will be added once workbook evidence pipeline is complete for each herb.
                Evidence grades are provisional pending workbook verification.
              </p>
              <ResponsiveTable label="Article references">
                <table className="min-w-[600px] w-full text-sm">
                  <thead>
                    <tr className="border-b border-brand-900/10">
                      <th className="pb-2 pr-3 text-left text-xs font-bold uppercase tracking-wider text-muted">
                        Topic
                      </th>
                      <th className="pb-2 pr-4 text-left text-xs font-bold uppercase tracking-wider text-muted">
                        Evidence area
                      </th>
                      <th className="pb-2 text-left text-xs font-bold uppercase tracking-wider text-muted">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-900/5">
                    <tr className="align-top">
                      <td className="py-3 pr-3 font-medium text-ink">Magnesium sleep evidence</td>
                      <td className="py-3 pr-4 text-[#46574d]">
                        Abbasi et al.; Nielsen et al.; Held et al.; Yamadera et al. (glycine)
                      </td>
                      <td className="py-3 text-muted text-xs">
                        PMIDs pending
                      </td>
                    </tr>
                    <tr className="align-top">
                      <td className="py-3 pr-3 font-medium text-ink">Ashwagandha sleep evidence</td>
                      <td className="py-3 pr-4 text-[#46574d]">
                        Langade et al. 2019, 2021; Cheah et al. 2021; Deshpande et al. 2020
                      </td>
                      <td className="py-3 text-muted text-xs">
                        PMIDs pending
                      </td>
                    </tr>
                    <tr className="align-top">
                      <td className="py-3 pr-3 font-medium text-ink">L-theanine sleep evidence</td>
                      <td className="py-3 pr-4 text-[#46574d]">
                        Alpha-wave promotion trials; anxiety/sleep overlap studies
                      </td>
                      <td className="py-3 text-muted text-xs">
                        PMIDs pending
                      </td>
                    </tr>
                    <tr className="align-top">
                      <td className="py-3 pr-3 font-medium text-ink">Valerian sleep evidence</td>
                      <td className="py-3 pr-4 text-[#46574d]">
                        Meta-analyses of valerian RCTs; valerenic acid mechanism studies
                      </td>
                      <td className="py-3 text-muted text-xs">
                        PMIDs pending
                      </td>
                    </tr>
                    <tr className="align-top">
                      <td className="py-3 pr-3 font-medium text-ink">
                        Passionflower sleep evidence
                      </td>
                      <td className="py-3 pr-4 text-[#46574d]">
                        Passionflower anxiety/sleep RCTs; chrysin GABA-A binding studies
                      </td>
                      <td className="py-3 text-muted text-xs">
                        PMIDs pending
                      </td>
                    </tr>
                    <tr className="align-top">
                      <td className="py-3 pr-3 font-medium text-ink">
                        General sleep safety guidance
                      </td>
                      <td className="py-3 pr-4 text-[#46574d]">
                        AASM guidelines; CBT-I evidence base; drug interaction references
                      </td>
                      <td className="py-3 text-muted text-xs">
                        PMIDs pending
                      </td>
                    </tr>
                  </tbody>
                </table>
              </ResponsiveTable>
            </div>

          </section>

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
          {/* Table of contents */}
          <div className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted">
              In this article
            </p>
            <nav className="mt-3 space-y-1.5" aria-label="Article sections">
              {[
                ['#ranking-table', 'Evidence Rankings'],
                ['#how-we-ranked', 'How We Ranked'],
                ['#deep-dives', 'Deep Dives: Top 5'],
                ['#magnesium', 'Magnesium'],
                ['#ashwagandha', 'Ashwagandha'],
                ['#l-theanine', 'L-Theanine'],
                ['#valerian', 'Valerian'],
                ['#passionflower', 'Passionflower'],
                ['#decision-framework', 'Which to Choose'],
                ['#combinations', 'Combinations'],
                ['#what-not-to-do', 'What Not To Do'],
                ['#safety', 'Safety'],
                ['#related-articles', 'Related Articles'],
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

          {/* Related profiles */}
          <div className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted">
              Sleep cluster
            </p>
            <div className="mt-3 space-y-2">
              <Link
                href="/articles/magnesium-for-sleep"
                className="block text-sm font-medium text-brand-700 hover:text-brand-800 hover:underline"
              >
                Magnesium for sleep →
              </Link>
              <Link
                href="/articles/ashwagandha-for-sleep"
                className="block text-sm font-medium text-brand-700 hover:text-brand-800 hover:underline"
              >
                Ashwagandha for sleep →
              </Link>
              <Link
                href="/guides/sleep-herbs-vs-melatonin"
                className="block text-sm font-medium text-brand-700 hover:text-brand-800 hover:underline"
              >
                Sleep herbs vs melatonin →
              </Link>
              <Link
                href="/herbs"
                className="block text-sm font-medium text-brand-700 hover:text-brand-800 hover:underline"
              >
                All herb profiles →
              </Link>
              <Link
                href="/articles"
                className="block text-sm font-medium text-brand-700 hover:text-brand-800 hover:underline"
              >
                All articles →
              </Link>
            </div>
          </div>

          {/* Affiliate quick links */}
          <div className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted">
              Shop — top picks
            </p>
            <div className="mt-3 space-y-2">
              <a
                href={`https://www.amazon.com/s?k=magnesium+glycinate+sleep&tag=${AFFILIATE_TAGS.amazon}`}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="block text-sm font-medium text-brand-700 hover:text-brand-800 hover:underline"
              >
                Magnesium glycinate →
              </a>
              <a
                href={`https://www.amazon.com/s?k=KSM-66+ashwagandha&tag=${AFFILIATE_TAGS.amazon}`}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="block text-sm font-medium text-brand-700 hover:text-brand-800 hover:underline"
              >
                KSM-66 ashwagandha →
              </a>
              <a
                href={`https://www.amazon.com/s?k=l-theanine+sleep&tag=${AFFILIATE_TAGS.amazon}`}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="block text-sm font-medium text-brand-700 hover:text-brand-800 hover:underline"
              >
                L-theanine →
              </a>
              <a
                href={`https://www.amazon.com/s?k=valerian+root+sleep&tag=${AFFILIATE_TAGS.amazon}`}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="block text-sm font-medium text-brand-700 hover:text-brand-800 hover:underline"
              >
                Valerian root →
              </a>
            </div>
          </div>
        </aside>
      </div>

      <div className="mt-8">
        <Link href="/articles" className="text-sm font-semibold text-brand-700 hover:text-brand-800">
          ← Back to Articles
        </Link>
      </div>
    </article>
  )
}
