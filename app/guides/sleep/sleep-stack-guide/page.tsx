import Link from 'next/link'
import { buildPageMetadata, blogJsonLd, breadcrumbJsonLd, faqPageJsonLd, compactMetaTitle } from '../../../../src/lib/seo'
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

const SLUG = 'sleep-stack-guide'
const TITLE = 'Sleep Stack Guide: Magnesium, L-Theanine, Ashwagandha, and What to Combine'
const DESCRIPTION =
  'A practical evidence-based guide to building a natural sleep stack, including magnesium, L-theanine, ashwagandha, timing, safety, combinations, and what not to mix.'
const DATE = '2026-06-09'
const AUTHOR = 'Will'
const READING_TIME = '15 min read'
const TAGS = ['sleep', 'magnesium', 'l-theanine', 'ashwagandha', 'supplement-stack']
const CATEGORY = 'sleep-stacks'

export const metadata = buildPageMetadata({
  title: compactMetaTitle(TITLE),
  description: DESCRIPTION,
  path: `/articles/${SLUG}`,
  openGraphType: 'article',
})

// ─── FAQ data (also used for JSON-LD) ────────────────────────────────────────

const FAQS = [
  {
    question: 'What is the best natural sleep stack?',
    answer:
      'The most practical starting point for most people is magnesium glycinate alone, which addresses physical relaxation and mineral support with well-characterised safety. For those with racing thoughts at bedtime, adding L-theanine is a reasonable next step. For chronic stress-driven poor sleep, adding ashwagandha (KSM-66 or Sensoril) at standard doses over 6–8 weeks has direct evidence. There is no single universally "best" stack — the right combination depends on your specific sleep barrier.',
  },
  {
    question: 'Can I take magnesium, L-theanine, and ashwagandha together?',
    answer:
      'For most healthy adults without relevant contraindications, yes — these three supplements work through different mechanisms and no significant adverse interaction between them has been established. However, introducing all three simultaneously makes it impossible to identify what is helping or causing side effects. Start one at a time over several weeks before adding the next.',
  },
  {
    question: 'Should I start all three at once?',
    answer:
      'No. Starting all three at once is the main mistake to avoid. If you experience a benefit or a side effect, you will not know which supplement is responsible. The pragmatic approach is: start magnesium glycinate first for 1–2 weeks, then add L-theanine if racing thoughts remain an issue, then add ashwagandha if chronic stress is the dominant factor and you are willing to commit to a 6–8 week trial.',
  },
  {
    question: 'What time should I take a sleep stack?',
    answer:
      'Timing varies by supplement. Magnesium glycinate and L-theanine are typically taken 30–60 minutes before bed. Ashwagandha can be taken in the evening or with dinner — timing is less critical because its effects accumulate over weeks rather than hours. Avoid caffeine-containing products near bedtime.',
  },
  {
    question: 'Is a sleep stack safer than melatonin?',
    answer:
      'These are not directly comparable. Melatonin targets the circadian clock and is well-studied for jet lag and circadian rhythm disorders; it is not primarily a sedative. Magnesium, L-theanine, and ashwagandha address relaxation and stress adaptation through different pathways. Each has its own safety profile. None of these supplements are risk-free, and all should be avoided alongside prescription sedatives without clinician guidance. "Natural" does not mean safer.',
  },
  {
    question: 'What supplements should not be mixed for sleep?',
    answer:
      'Avoid combining any sleep supplement with alcohol, prescription sedatives (benzodiazepines, z-drugs, barbiturates), or other CNS depressants without clinician guidance — the additive CNS depression risk is real. Do not combine ashwagandha with thyroid medications without clinician oversight. Avoid multiple sedating herbs simultaneously (e.g., valerian, kava, passionflower, and ashwagandha all at once). Do not use sleep stacks to mask potential sleep apnea symptoms — snoring, gasping, or excessive daytime sleepiness require medical evaluation.',
  },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SleepStackGuidePage() {
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
        <Link href="/articles/" className="transition hover:text-ink">
          Articles
        </Link>
        <span>/</span>
        <span className="text-ink line-clamp-1">{TITLE}</span>
      </nav>

      {/* Hero */}
      <section className="rounded-[1.5rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8 lg:p-10">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-full border border-brand-900/10 bg-brand-50 px-2.5 py-0.5 font-bold uppercase tracking-wider text-brand-800">
            Deep Dive
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
          <Link href="/info/info/about/" rel="author" className="font-medium text-ink hover:underline">
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
        you. We only link to supplement forms and dose ranges consistent with the clinical protocols
        reviewed on this page.
      </div>

      {/* Body + sidebar */}
      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_240px]">
        {/* Main content */}
        <div className="space-y-6">

          {/* Quick Verdict */}
          <section className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8">
            <p className="eyebrow-label">Quick Verdict</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
              Which Sleep Stack Should You Build?
            </h2>
            <ul className="mt-4 space-y-2">
              <li className="flex gap-2 text-[1.01rem] leading-[1.85] text-muted">
                <span className="mt-1 flex-shrink-0 text-brand-700">▸</span>
                <span>
                  <strong>Best simple starting stack:</strong> magnesium glycinate alone — the
                  lowest-complexity, best-characterised starting point for most people.
                </span>
              </li>
              <li className="flex gap-2 text-[1.01rem] leading-[1.85] text-muted">
                <span className="mt-1 flex-shrink-0 text-brand-700">▸</span>
                <span>
                  <strong>Best relaxation stack:</strong> magnesium glycinate + L-theanine — physical
                  and mental relaxation support from complementary mechanisms.
                </span>
              </li>
              <li className="flex gap-2 text-[1.01rem] leading-[1.85] text-muted">
                <span className="mt-1 flex-shrink-0 text-brand-700">▸</span>
                <span>
                  <strong>Best stress-driven sleep stack:</strong> ashwagandha + magnesium — stress
                  adaptation over weeks combined with baseline physical relaxation support.
                </span>
              </li>
              <li className="flex gap-2 text-[1.01rem] leading-[1.85] text-muted">
                <span className="mt-1 flex-shrink-0 text-brand-700">▸</span>
                <span>
                  <strong>Best full stack:</strong> magnesium + L-theanine + ashwagandha — three
                  different mechanisms for stress, mental tension, and physical relaxation; introduce
                  one at a time.
                </span>
              </li>
              <li className="flex gap-2 text-[1.01rem] leading-[1.85] text-muted">
                <span className="mt-1 flex-shrink-0 text-brand-700">▸</span>
                <span>
                  <strong>Best beginner approach:</strong> start one supplement at a time. Assess
                  your response over 1–2 weeks before adding a second. Do not combine multiple sleep
                  aids without knowing how each affects you individually.
                </span>
              </li>
            </ul>
            <div className="mt-4 rounded-[0.75rem] border border-amber-300/60 bg-amber-50/60 px-4 py-3 text-sm leading-6 text-muted">
              <strong className="text-ink">Important:</strong> Do not combine multiple sleep aids,
              prescription sedatives, or alcohol without clinician guidance. Natural supplements can
              produce additive CNS effects and carry real interaction risks.
            </div>
          </section>

          {/* Main article body */}
          <section className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8 space-y-8">

            {/* What Is a Sleep Stack */}
            <div id="what-is-a-sleep-stack">
              <h2 className="mb-3 text-2xl font-semibold tracking-tight text-ink">
                What Is a Sleep Stack?
              </h2>
              <p className="text-[1.01rem] leading-[1.85] text-muted">
                A supplement stack is a combination of supplements chosen for complementary
                mechanisms — each addressing a different aspect of the same problem. A sleep stack
                is designed to improve sleep quality, promote relaxation, and support consistent
                sleep onset, using supplements that work through distinct pathways rather than
                redundant ones.
              </p>
              <p className="mt-3 text-[1.01rem] leading-[1.85] text-muted">
                A well-designed sleep stack starts from a specific problem: Are you unable to
                fall asleep because of physical tension? Racing thoughts? Chronic stress that has
                degraded sleep quality over months? The supplements in a good stack are matched to
                the mechanism, not just piled on for coverage.
              </p>

              <h3 className="mt-5 mb-1 text-xl font-semibold tracking-tight text-ink">
                What a Sleep Stack Should Not Be
              </h3>
              <ul className="mt-2 ml-5 space-y-1 list-disc text-[1.01rem] leading-[1.85] text-muted">
                <li>A grab-bag of everything labelled &ldquo;sleep support&rdquo;</li>
                <li>A method to avoid evaluating your sleep hygiene or circadian patterns</li>
                <li>A substitute for clinical evaluation of persistent insomnia or sleep apnea</li>
                <li>A way to combine multiple sedating agents without understanding the risks</li>
              </ul>

              <p className="mt-3 text-[1.01rem] leading-[1.85] text-muted">
                Natural does not mean risk-free. Supplements can interact with medications,
                produce additive sedative effects when combined, and carry real contraindications
                in specific populations. This guide treats that seriously.
              </p>
            </div>

            <hr className="border-brand-900/10" />

            {/* Core 3-Ingredient Stack */}
            <div id="core-three">
              <h2 className="mb-3 text-2xl font-semibold tracking-tight text-ink">
                The Core 3-Ingredient Sleep Stack
              </h2>
              <p className="text-[1.01rem] leading-[1.85] text-muted">
                The most widely discussed natural sleep stack combines three supplements with
                non-overlapping primary mechanisms:
              </p>

              <h3 className="mt-5 mb-1 text-xl font-semibold tracking-tight text-ink">
                Magnesium Glycinate — Physical Relaxation
              </h3>
              <p className="text-[1.01rem] leading-[1.85] text-muted">
                Magnesium is an essential mineral involved in hundreds of enzymatic processes,
                including NMDA receptor regulation, GABA activity, melatonin synthesis, and muscle
                relaxation. The glycinate form is chelated with glycine (itself calming) and is
                well-absorbed with low GI impact. Magnesium addresses the physical side of
                sleep difficulty: muscle tension, physical restlessness, and the nervous system
                excitability that disrupts sleep onset. It is typically the most reasonable
                first-choice supplement in a sleep stack.
              </p>
              <p className="mt-2 text-sm text-muted">
                Full evidence review:{' '}
                <Link
                  href="/guides/sleep/magnesium-for-sleep"
                  className="font-semibold text-brand-700 hover:text-brand-800 hover:underline"
                >
                  Magnesium for Sleep
                </Link>{' '}
                ·{' '}
                <Link
                  href="/guides/sleep/magnesium-types-for-sleep"
                  className="font-semibold text-brand-700 hover:text-brand-800 hover:underline"
                >
                  Magnesium Types for Sleep
                </Link>
              </p>

              <h3 className="mt-5 mb-1 text-xl font-semibold tracking-tight text-ink">
                L-Theanine — Mental Relaxation
              </h3>
              <p className="text-[1.01rem] leading-[1.85] text-muted">
                L-theanine is an amino acid from tea leaves that promotes alpha-wave brain activity
                — the relaxed-wakefulness state associated with easing into sleep. It is not a
                direct sedative; it quiets mental arousal rather than producing heavy drowsiness.
                L-theanine is most useful when racing thoughts or mental tension are the primary
                barrier to sleep onset. It complements magnesium by addressing the cognitive
                dimension of sleeplessness that magnesium alone may not resolve.
              </p>
              <p className="mt-2 text-sm text-muted">
                Full evidence review:{' '}
                <Link
                  href="/guides/sleep/l-theanine-for-sleep"
                  className="font-semibold text-brand-700 hover:text-brand-800 hover:underline"
                >
                  L-Theanine for Sleep
                </Link>
              </p>

              <h3 className="mt-5 mb-1 text-xl font-semibold tracking-tight text-ink">
                Ashwagandha — Stress Adaptation
              </h3>
              <p className="text-[1.01rem] leading-[1.85] text-muted">
                Ashwagandha (<em>Withania somnifera</em>) is an adaptogen — a compound that
                modulates the body&apos;s stress response over time. Its primary mechanism is
                HPA axis regulation and cortisol normalisation over 6–8 weeks of consistent use.
                Ashwagandha is not a fast-acting sedative; it addresses the upstream cause of
                chronic stress-driven sleep deterioration rather than the immediate symptoms. It
                has the most direct sleep-outcome trial evidence of the three ingredients in
                stressed adult populations.
              </p>
              <p className="mt-2 text-sm text-muted">
                Full evidence review:{' '}
                <Link
                  href="/guides/sleep/ashwagandha-for-sleep"
                  className="font-semibold text-brand-700 hover:text-brand-800 hover:underline"
                >
                  Ashwagandha for Sleep
                </Link>{' '}
                ·{' '}
                <Link
                  href="/guides/sleep/ashwagandha-vs-magnesium-for-sleep"
                  className="font-semibold text-brand-700 hover:text-brand-800 hover:underline"
                >
                  Ashwagandha vs Magnesium
                </Link>
              </p>

              <div className="mt-5">
                <EvidenceSummaryCard
                  title="Natural Sleep Stack — Combined Evidence Overview"
                  evidenceLevel="Limited"
                  humanEvidence="Each ingredient has individual trial evidence — magnesium and ashwagandha have the most direct sleep-outcome RCTs; L-theanine has stronger evidence for relaxation/stress reduction than for direct sleep endpoints. Direct combination trials for all three ingredients together have not been identified in the source registry. The stack rationale is mechanistically coherent but is not the same as having combination-specific trial evidence."
                  mechanisticEvidence="The three mechanisms are complementary and non-overlapping: magnesium addresses mineral/physical pathway, L-theanine addresses cognitive/arousal pathway, ashwagandha addresses chronic HPA/stress pathway. No known pharmacokinetic antagonism between them. The theoretical stack rationale is strong; clinical confirmation of combined superiority over single agents requires further study."
                  safetyProfile="No major interactions established between the three ingredients in healthy adults at standard doses. All three have contraindications individually (magnesium: kidney disease; ashwagandha: pregnancy, thyroid, autoimmune; L-theanine: sedative medications). Combining with alcohol or prescription sedatives without guidance is not recommended for any of these supplements."
                />
              </div>
            </div>

            <hr className="border-brand-900/10" />

            {/* Stack Comparison Table */}
            <div id="stack-comparison">
              <h2 className="mb-4 text-2xl font-semibold tracking-tight text-ink">
                Stack Comparison Table
              </h2>
              <p className="mb-4 text-[1.01rem] leading-[1.85] text-muted">
                Which stack is right for your specific situation? Use this table to match your
                primary sleep barrier to the appropriate starting point.
              </p>

              <ResponsiveTable label="Sleep stack comparison by use case and complexity">
                <table className="min-w-[680px] w-full text-sm">
                  <thead>
                    <tr className="border-b border-brand-900/10">
                      <th className="pb-2 pr-4 text-left text-xs font-bold uppercase tracking-wider text-muted">
                        Stack
                      </th>
                      <th className="pb-2 pr-4 text-left text-xs font-bold uppercase tracking-wider text-muted">
                        Ingredients
                      </th>
                      <th className="pb-2 pr-4 text-left text-xs font-bold uppercase tracking-wider text-muted">
                        Best For
                      </th>
                      <th className="pb-2 pr-4 text-left text-xs font-bold uppercase tracking-wider text-muted">
                        Complexity
                      </th>
                      <th className="pb-2 pr-4 text-left text-xs font-bold uppercase tracking-wider text-muted">
                        Main Caution
                      </th>
                      <th className="pb-2 text-left text-xs font-bold uppercase tracking-wider text-muted">
                        Buyer Verdict
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-900/5">
                    <tr className="align-top">
                      <td className="py-3 pr-4 font-medium text-ink">Beginner Stack</td>
                      <td className="py-3 pr-4 text-muted">Magnesium glycinate</td>
                      <td className="py-3 pr-4 text-muted">
                        General sleep quality, physical tension, first supplement trial
                      </td>
                      <td className="py-3 pr-4 text-muted">Very low</td>
                      <td className="py-3 pr-4 text-muted">
                        Kidney disease; GI loose stools at high dose
                      </td>
                      <td className="py-3 text-muted">Best starting point for most people</td>
                    </tr>
                    <tr className="align-top">
                      <td className="py-3 pr-4 font-medium text-ink">Relaxation Stack</td>
                      <td className="py-3 pr-4 text-muted">Magnesium glycinate + L-theanine</td>
                      <td className="py-3 pr-4 text-muted">
                        Racing thoughts + body tension; stress-driven sleep onset delay
                      </td>
                      <td className="py-3 pr-4 text-muted">Low</td>
                      <td className="py-3 pr-4 text-muted">
                        Avoid caffeine-containing L-theanine at night; introduce separately
                      </td>
                      <td className="py-3 text-muted">
                        Good second step after trialling magnesium
                      </td>
                    </tr>
                    <tr className="align-top">
                      <td className="py-3 pr-4 font-medium text-ink">Stress Stack</td>
                      <td className="py-3 pr-4 text-muted">
                        Ashwagandha (KSM-66 or Sensoril) + magnesium glycinate
                      </td>
                      <td className="py-3 pr-4 text-muted">
                        Chronic stress as primary sleep driver; requires 6–8 week trial
                      </td>
                      <td className="py-3 pr-4 text-muted">Moderate</td>
                      <td className="py-3 pr-4 text-muted">
                        Avoid in pregnancy; thyroid / autoimmune conditions; introduce separately
                      </td>
                      <td className="py-3 text-muted">
                        Best when stress is clearly the root cause
                      </td>
                    </tr>
                    <tr className="align-top">
                      <td className="py-3 pr-4 font-medium text-ink">Full Stack</td>
                      <td className="py-3 pr-4 text-muted">
                        Magnesium glycinate + L-theanine + ashwagandha
                      </td>
                      <td className="py-3 pr-4 text-muted">
                        Stress + racing thoughts + physical tension; not a first-step approach
                      </td>
                      <td className="py-3 pr-4 text-muted">Moderate–high</td>
                      <td className="py-3 pr-4 text-muted">
                        Must introduce one at a time; all individual cautions apply
                      </td>
                      <td className="py-3 text-muted">
                        Only after trialling each ingredient individually
                      </td>
                    </tr>
                    <tr className="align-top">
                      <td className="py-3 pr-4 font-medium text-ink text-red-700">Avoid Stack</td>
                      <td className="py-3 pr-4 text-muted">
                        Multiple sedating herbs + alcohol / prescription sedatives
                      </td>
                      <td className="py-3 pr-4 text-muted">—</td>
                      <td className="py-3 pr-4 text-muted">—</td>
                      <td className="py-3 pr-4 text-muted">
                        Additive CNS depression; unpredictable effects; do not combine
                      </td>
                      <td className="py-3 text-muted">Do not use</td>
                    </tr>
                  </tbody>
                </table>
              </ResponsiveTable>
            </div>

            <hr className="border-brand-900/10" />

            {/* Beginner Stack */}
            <div id="beginner-stack">
              <h2 className="mb-3 text-2xl font-semibold tracking-tight text-ink">
                Beginner Stack: Magnesium Glycinate Alone
              </h2>
              <p className="text-[1.01rem] leading-[1.85] text-muted">
                Starting with a single supplement is almost always smarter than starting with
                three. A one-supplement trial tells you clearly whether that supplement is helping,
                doing nothing, or causing side effects. With three supplements introduced
                simultaneously, you get none of that information.
              </p>
              <p className="mt-3 text-[1.01rem] leading-[1.85] text-muted">
                Magnesium glycinate is the most reasonable first choice for most people because:
              </p>
              <ul className="mt-2 ml-5 space-y-1 list-disc text-[1.01rem] leading-[1.85] text-muted">
                <li>
                  Magnesium deficiency or suboptimal status is common in Western diets, making
                  supplementation broadly applicable.
                </li>
                <li>
                  It addresses multiple sleep mechanisms simultaneously — NMDA modulation, GABA
                  support, melatonin pathway support, and muscle relaxation.
                </li>
                <li>
                  It has an established safety profile and is the best-tolerated oral magnesium
                  form for sleep use.
                </li>
                <li>
                  If it helps, you have a clear, low-cost, well-characterised answer. If it
                  does not help after 2–4 weeks at standard dose, you have a clear null result
                  and a justified reason to add L-theanine.
                </li>
              </ul>

              <h3 className="mt-5 mb-1 text-xl font-semibold tracking-tight text-ink">
                Who Should Start Here
              </h3>
              <p className="text-[1.01rem] leading-[1.85] text-muted">
                Anyone new to sleep supplements, anyone with general poor sleep quality without
                a strong stress or mental arousal component, and anyone who wants the simplest
                possible approach with the best safety dataset. Kidney disease is the primary
                contraindication — if you have kidney disease, consult a clinician before
                supplementing with magnesium.
              </p>

              <h3 className="mt-5 mb-1 text-xl font-semibold tracking-tight text-ink">
                When to Add L-Theanine
              </h3>
              <p className="text-[1.01rem] leading-[1.85] text-muted">
                After 1–2 weeks on magnesium glycinate alone, if physical tension has improved
                but racing thoughts or mental arousal at bedtime remain the primary barrier,
                L-theanine is a reasonable next addition. See the{' '}
                <Link
                  href="/guides/sleep/magnesium-for-sleep"
                  className="font-semibold text-brand-700 hover:text-brand-800 hover:underline"
                >
                  Magnesium for Sleep article
                </Link>{' '}
                for the full evidence review.
              </p>

              <div className="mt-5 rounded-[1rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm">
                <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted">
                  Beginner Stack — Magnesium Glycinate
                </p>
                <p className="font-semibold text-ink">Magnesium Glycinate for Sleep</p>
                <p className="mt-1 text-xs leading-5 text-muted">
                  Well-absorbed form. Low GI impact. Standard starting point for most sleep
                  supplement trials. Look for products with elemental magnesium clearly labelled —
                  not oxide, sulfate, or carbonate.
                </p>
                <a
                  href={`https://www.amazon.com/s?k=magnesium+glycinate+sleep&tag=${AFFILIATE_TAGS.amazon}`}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  className="mt-3 inline-flex items-center gap-1 rounded-full bg-brand-950 px-4 py-1.5 text-xs font-bold text-white transition hover:bg-brand-900"
                >
                  View on Amazon →
                </a>
              </div>
            </div>

            <hr className="border-brand-900/10" />

            {/* Relaxation Stack */}
            <div id="relaxation-stack">
              <h2 className="mb-3 text-2xl font-semibold tracking-tight text-ink">
                Relaxation Stack: Magnesium + L-Theanine
              </h2>
              <p className="text-[1.01rem] leading-[1.85] text-muted">
                The magnesium + L-theanine combination targets two complementary dimensions of
                pre-sleep arousal: physical relaxation (magnesium) and mental relaxation
                (L-theanine). This is a reasonable stack for someone whose sleep difficulty
                involves both body tension and a mind that will not quieten.
              </p>
              <p className="mt-3 text-[1.01rem] leading-[1.85] text-muted">
                Direct combination trial evidence for magnesium + L-theanine specifically has
                not been identified in the source registry. The stack rationale
                rests on complementary mechanisms and an absence of known adverse interactions
                rather than head-to-head combination data.
              </p>
              <p className="mt-3 text-[1.01rem] leading-[1.85] text-muted">
                Practical notes for this combination:
              </p>
              <ul className="mt-2 ml-5 space-y-1 list-disc text-[1.01rem] leading-[1.85] text-muted">
                <li>Start at the lower end of both dose ranges.</li>
                <li>
                  Ensure your L-theanine product is <strong>caffeine-free</strong>. Many
                  &ldquo;nootropic&rdquo; and &ldquo;focus blend&rdquo; products combine L-theanine
                  with caffeine — these are counterproductive near bedtime.
                </li>
                <li>
                  Try magnesium glycinate alone for 1–2 weeks before adding L-theanine, so you
                  can attribute effects and side effects correctly.
                </li>
              </ul>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm">
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted">
                    Relaxation Stack — Magnesium
                  </p>
                  <p className="font-semibold text-ink">Magnesium Glycinate</p>
                  <p className="mt-1 text-xs leading-5 text-muted">
                    Physical relaxation, muscle tension, NMDA/GABA support. Best-tolerated oral
                    magnesium form for sleep use.
                  </p>
                  <a
                    href={`https://www.amazon.com/s?k=magnesium+glycinate+sleep&tag=${AFFILIATE_TAGS.amazon}`}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    className="mt-3 inline-flex items-center gap-1 rounded-full bg-brand-950 px-4 py-1.5 text-xs font-bold text-white transition hover:bg-brand-900"
                  >
                    View on Amazon →
                  </a>
                </div>
                <div className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm">
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted">
                    Relaxation Stack — L-Theanine
                  </p>
                  <p className="font-semibold text-ink">L-Theanine 100–200 mg (Caffeine-Free)</p>
                  <p className="mt-1 text-xs leading-5 text-muted">
                    Mental relaxation, alpha-wave support. Verify that no caffeine is present in
                    the product before buying for nighttime use.
                  </p>
                  <a
                    href={`https://www.amazon.com/s?k=l-theanine+200mg+caffeine+free+sleep&tag=${AFFILIATE_TAGS.amazon}`}
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

            {/* Stress Stack */}
            <div id="stress-stack">
              <h2 className="mb-3 text-2xl font-semibold tracking-tight text-ink">
                Stress Stack: Ashwagandha + Magnesium
              </h2>
              <p className="text-[1.01rem] leading-[1.85] text-muted">
                The ashwagandha + magnesium combination targets stress adaptation (ashwagandha)
                alongside baseline physical relaxation (magnesium). This stack is better suited
                for people whose poor sleep is clearly driven by chronic stress — elevated evening
                cortisol, persistent anxiety, prolonged periods of overload — rather than
                situational or acute tension.
              </p>
              <p className="mt-3 text-[1.01rem] leading-[1.85] text-muted">
                Key considerations for this combination:
              </p>
              <ul className="mt-2 ml-5 space-y-1 list-disc text-[1.01rem] leading-[1.85] text-muted">
                <li>
                  <strong>Ashwagandha takes weeks.</strong> Its effects on sleep quality typically
                  emerge at 6–8 weeks of consistent daily use. Do not evaluate it on a few
                  nights — you will get a false null result.
                </li>
                <li>
                  <strong>Magnesium is easier to trial first.</strong> You can assess magnesium
                  glycinate within 1–2 weeks and get a clear signal. Ashwagandha can be added
                  after you know how magnesium alone affects you.
                </li>
                <li>
                  Direct combination trial evidence for ashwagandha + magnesium specifically
                  has not been identified in the source registry. The rationale is
                  mechanistically sound, but is not combination-trial verified.
                </li>
              </ul>
              <p className="mt-3 text-sm text-muted">
                See the full comparison:{' '}
                <Link
                  href="/guides/sleep/ashwagandha-vs-magnesium-for-sleep"
                  className="font-semibold text-brand-700 hover:text-brand-800 hover:underline"
                >
                  Ashwagandha vs Magnesium for Sleep
                </Link>
              </p>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm">
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted">
                    Stress Stack — Ashwagandha (KSM-66)
                  </p>
                  <p className="font-semibold text-ink">KSM-66 Ashwagandha</p>
                  <p className="mt-1 text-xs leading-5 text-muted">
                    Standardised root extract used in the majority of sleep and stress trials.
                    Requires 6–8 weeks of consistent use. Avoid in pregnancy; check thyroid
                    interaction if relevant.
                  </p>
                  <a
                    href={`https://www.amazon.com/s?k=KSM-66+ashwagandha+sleep&tag=${AFFILIATE_TAGS.amazon}`}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    className="mt-3 inline-flex items-center gap-1 rounded-full bg-brand-950 px-4 py-1.5 text-xs font-bold text-white transition hover:bg-brand-900"
                  >
                    View on Amazon →
                  </a>
                </div>
                <div className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm">
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted">
                    Stress Stack — Ashwagandha (Sensoril)
                  </p>
                  <p className="font-semibold text-ink">Sensoril Ashwagandha</p>
                  <p className="mt-1 text-xs leading-5 text-muted">
                    Root and leaf extract standardised for withanolide content. Used in stress and
                    sleep RCTs. An alternative to KSM-66 with a slightly different extract profile.
                  </p>
                  <a
                    href={`https://www.amazon.com/s?k=Sensoril+ashwagandha+sleep&tag=${AFFILIATE_TAGS.amazon}`}
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

            {/* Full Stack */}
            <div id="full-stack">
              <h2 className="mb-3 text-2xl font-semibold tracking-tight text-ink">
                Full Stack: Magnesium + L-Theanine + Ashwagandha
              </h2>
              <p className="text-[1.01rem] leading-[1.85] text-muted">
                The full three-ingredient stack uses each supplement for a distinct role: magnesium
                for physical relaxation, L-theanine for mental relaxation, and ashwagandha for
                chronic stress adaptation. This makes theoretical sense — the three mechanisms are
                genuinely non-overlapping and complementary.
              </p>
              <p className="mt-3 text-[1.01rem] leading-[1.85] text-muted">
                However, the full stack is not the best starting point for most people. Important
                caveats:
              </p>
              <ul className="mt-2 ml-5 space-y-1 list-disc text-[1.01rem] leading-[1.85] text-muted">
                <li>
                  Direct combination clinical trial evidence for all three ingredients together
                  has not been identified in the source registry — the stack rationale is mechanistic, not
                  combination-trial verified.
                </li>
                <li>
                  Introducing all three at once makes it impossible to identify which supplement
                  is responsible for any benefit or side effect.
                </li>
                <li>
                  The pragmatic approach is to introduce one at a time: magnesium first, then
                  L-theanine, then ashwagandha — each after a meaningful trial period.
                </li>
                <li>
                  Not everyone needs all three. Many people find magnesium glycinate alone
                  sufficient. Only add ingredients that address a specific remaining problem.
                </li>
              </ul>

              <div className="mt-4 rounded-[0.75rem] border border-brand-900/10 bg-brand-50/60 p-4 text-sm leading-7 text-muted">
                <p className="font-semibold text-ink">Full stack — introduce one at a time:</p>
                <ol className="mt-2 ml-5 space-y-1 list-decimal">
                  <li>Start magnesium glycinate. Trial for 1–2 weeks.</li>
                  <li>If racing thoughts remain — add L-theanine. Trial for 1–2 weeks.</li>
                  <li>
                    If chronic stress is still the dominant factor — add ashwagandha.
                    Commit to 6–8 weeks before evaluating.
                  </li>
                </ol>
              </div>
            </div>

            <hr className="border-brand-900/10" />

            {/* Timing Guide */}
            <div id="timing-guide">
              <h2 className="mb-4 text-2xl font-semibold tracking-tight text-ink">
                Timing Guide
              </h2>
              <p className="mb-4 text-[1.01rem] leading-[1.85] text-muted">
                Different supplements in a sleep stack have different optimal timing windows based
                on their mechanisms and the trial protocols used in their research.
              </p>

              <div className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-5 shadow-sm">
                <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-muted">
                  Timing Reference — Sleep Stack
                </p>
                <ResponsiveTable label="Sleep stack supplement timing guide">
                  <table className="min-w-[580px] w-full text-sm">
                    <thead>
                      <tr className="border-b border-brand-900/10">
                        <th className="pb-2 pr-4 text-left text-xs font-bold uppercase tracking-wider text-muted">
                          Supplement
                        </th>
                        <th className="pb-2 pr-4 text-left text-xs font-bold uppercase tracking-wider text-muted">
                          Suggested Timing
                        </th>
                        <th className="pb-2 pr-4 text-left text-xs font-bold uppercase tracking-wider text-muted">
                          Why
                        </th>
                        <th className="pb-2 text-left text-xs font-bold uppercase tracking-wider text-muted">
                          Notes
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-900/5">
                      <tr className="align-top">
                        <td className="py-3 pr-4 font-medium text-ink">Magnesium glycinate</td>
                        <td className="py-3 pr-4 text-muted">
                          30–60 min before bed
                        </td>
                        <td className="py-3 pr-4 text-muted">
                          Allows absorption and nervous system effect onset before sleep
                        </td>
                        <td className="py-3 text-muted">
                          Can be taken with a light snack if GI sensitivity is a concern
                        </td>
                      </tr>
                      <tr className="align-top">
                        <td className="py-3 pr-4 font-medium text-ink">L-theanine</td>
                        <td className="py-3 pr-4 text-muted">
                          30–60 min before bed
                        </td>
                        <td className="py-3 pr-4 text-muted">
                          Alpha-wave effects observed within 30–60 min of ingestion in EEG studies
                        </td>
                        <td className="py-3 text-muted">
                          Caffeine-free only; can be taken 1–2 hours before bed for general wind-down
                        </td>
                      </tr>
                      <tr className="align-top">
                        <td className="py-3 pr-4 font-medium text-ink">Ashwagandha</td>
                        <td className="py-3 pr-4 text-muted">
                          Evening with dinner or before bed
                        </td>
                        <td className="py-3 pr-4 text-muted">
                          Acute timing is less critical — effects accumulate over weeks, not hours
                        </td>
                        <td className="py-3 text-muted">
                          Some trials used twice-daily dosing; follow product label or trial protocol
                        </td>
                      </tr>
                      <tr className="align-top">
                        <td className="py-3 pr-4 font-medium text-ink">
                          Melatonin (note — not part of core stack)
                        </td>
                        <td className="py-3 pr-4 text-muted">
                          30–60 min before target sleep time
                        </td>
                        <td className="py-3 pr-4 text-muted">
                          Circadian signal — timing relative to sleep onset is important
                        </td>
                        <td className="py-3 text-muted">
                          Not an herbal supplement; mechanism differs from the core stack
                          ingredients above
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </ResponsiveTable>
                <p className="mt-3 text-xs text-muted">
                  Timing ranges reflect commonly cited windows in clinical literature. Start at the conservative end of any range.
                </p>
              </div>
            </div>

            <hr className="border-brand-900/10" />

            {/* Dosing Guide */}
            <div id="dosing-guide">
              <h2 className="mb-4 text-2xl font-semibold tracking-tight text-ink">
                Dosing Guide
              </h2>
              <p className="mb-4 text-[1.01rem] leading-[1.85] text-muted">
                Use the lowest effective dose as your starting point. Higher doses do not
                guarantee better results and increase the risk of side effects. All ranges below
                reflect clinical trial data.
              </p>

              <div className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-5 shadow-sm">
                <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-muted">
                  Dosing Reference — Sleep Stack
                </p>
                <ResponsiveTable label="Sleep stack supplement dosing guide">
                  <table className="min-w-[600px] w-full text-sm">
                    <thead>
                      <tr className="border-b border-brand-900/10">
                        <th className="pb-2 pr-4 text-left text-xs font-bold uppercase tracking-wider text-muted">
                          Supplement
                        </th>
                        <th className="pb-2 pr-4 text-left text-xs font-bold uppercase tracking-wider text-muted">
                          Common Range
                        </th>
                        <th className="pb-2 pr-4 text-left text-xs font-bold uppercase tracking-wider text-muted">
                          Start-Low Approach
                        </th>
                        <th className="pb-2 text-left text-xs font-bold uppercase tracking-wider text-muted">
                          Verification Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-900/5">
                      <tr className="align-top">
                        <td className="py-3 pr-4 font-medium text-ink">Magnesium glycinate</td>
                        <td className="py-3 pr-4 text-muted">
                          200–400 mg elemental magnesium
                        </td>
                        <td className="py-3 pr-4 text-muted">Start at 200 mg elemental</td>
                        <td className="py-3 text-muted">Consistent with published trial protocols</td>
                      </tr>
                      <tr className="align-top">
                        <td className="py-3 pr-4 font-medium text-ink">L-theanine</td>
                        <td className="py-3 pr-4 text-muted">
                          100–200 mg
                        </td>
                        <td className="py-3 pr-4 text-muted">Start at 100 mg</td>
                        <td className="py-3 text-muted">Consistent with published trial protocols</td>
                      </tr>
                      <tr className="align-top">
                        <td className="py-3 pr-4 font-medium text-ink">Ashwagandha (KSM-66)</td>
                        <td className="py-3 pr-4 text-muted">
                          300–600 mg standardised extract
                        </td>
                        <td className="py-3 pr-4 text-muted">Start at 300 mg once daily</td>
                        <td className="py-3 text-muted">Consistent with published trial protocols</td>
                      </tr>
                    </tbody>
                  </table>
                </ResponsiveTable>
                <p className="mt-3 text-xs text-muted">
                  Note: Magnesium product labels often show the total compound weight (e.g.,
                  &ldquo;500 mg magnesium glycinate&rdquo;) rather than elemental magnesium, which
                  is approximately 14% of glycinate compound weight. Check elemental magnesium on
                  the label supplement facts panel.
                </p>
              </div>
            </div>

            <hr className="border-brand-900/10" />

            {/* What Not To Combine */}
            <div id="what-not-to-combine">
              <h2 className="mb-4 text-2xl font-semibold tracking-tight text-ink">
                What Not To Combine
              </h2>
              <SafetyNotice title="Safety Summary — Sleep Stack Combinations">
                <ul className="ml-5 space-y-1.5 list-disc">
                  <li>
                    <strong>Alcohol + any sleep supplement:</strong> Alcohol is a CNS depressant.
                    Combining it with sedating supplements (even gentle ones like magnesium or
                    L-theanine) increases the risk of additive CNS depression. Do not use sleep
                    stacks as a pairing for alcohol consumption.
                  </li>
                  <li>
                    <strong>Prescription sedatives + sleep stacks:</strong> Benzodiazepines,
                    z-drugs (zolpidem, eszopiclone), barbiturates, and other prescription sleep
                    medications should not be combined with supplement sleep stacks without
                    clinician guidance. Additive CNS depression can be significant.
                  </li>
                  <li>
                    <strong>Multiple sedating herbs simultaneously:</strong> Valerian, kava,
                    passionflower, hops, lemon balm, and similar sedating herbs should not be
                    stacked with ashwagandha or each other without careful individual trialling
                    first. Combined sedative burden is unpredictable.
                  </li>
                  <li>
                    <strong>Megadosing magnesium:</strong> Very high magnesium doses can cause
                    GI distress, loose stools, and in rare cases (especially with kidney disease)
                    hypermagnesemia. Stick to studied dose ranges.
                  </li>
                  <li>
                    <strong>Ashwagandha + thyroid conditions:</strong> Ashwagandha may influence
                    thyroid hormone levels. If you have hypothyroidism, hyperthyroidism, or
                    take thyroid medication, consult a clinician before using ashwagandha.
                  </li>
                  <li>
                    <strong>Ashwagandha + autoimmune conditions:</strong> Ashwagandha has
                    immunomodulatory properties. Avoid or consult a clinician if you have an
                    autoimmune condition or take immunosuppressant medications.
                  </li>
                  <li>
                    <strong>Using sleep stacks to cover up sleep apnea:</strong> Loud snoring,
                    witnessed pauses in breathing, gasping awake, or excessive daytime sleepiness
                    are symptoms of sleep apnea — a medical condition that no supplement addresses.
                    These symptoms require clinical evaluation, not supplementation.
                  </li>
                </ul>
              </SafetyNotice>
            </div>

            <hr className="border-brand-900/10" />

            {/* Safety Checklist */}
            <div id="safety-checklist">
              <h2 className="mb-4 text-2xl font-semibold tracking-tight text-ink">
                Safety Checklist Before You Try a Stack
              </h2>
              <p className="mb-4 text-[1.01rem] leading-[1.85] text-muted">
                If you answer yes to any of the following, consult a clinician before starting
                any sleep supplement stack.
              </p>
              <div className="rounded-[1rem] border border-brand-900/10 bg-brand-50/60 p-5">
                <ul className="space-y-3 text-[1.01rem] leading-[1.85] text-muted">
                  <li className="flex gap-2">
                    <span className="mt-1 flex-shrink-0 font-bold text-ink">□</span>
                    <span>
                      Are you pregnant or breastfeeding? (All three supplements have insufficient
                      safety data for pregnancy/breastfeeding.)
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-1 flex-shrink-0 font-bold text-ink">□</span>
                    <span>
                      Do you have kidney disease? (Magnesium is renally cleared; supplementation
                      can be hazardous with impaired kidney function.)
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-1 flex-shrink-0 font-bold text-ink">□</span>
                    <span>
                      Do you have thyroid disease or take thyroid medication? (Ashwagandha may
                      alter thyroid hormone levels.)
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-1 flex-shrink-0 font-bold text-ink">□</span>
                    <span>
                      Are you on prescription sedatives, z-drugs, benzodiazepines,
                      antidepressants, blood pressure medications, antibiotics, thyroid
                      medications, or other regular prescription drugs?
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-1 flex-shrink-0 font-bold text-ink">□</span>
                    <span>
                      Do you snore heavily, have been told you stop breathing during sleep, or
                      wake up gasping? (These are signs of potential sleep apnea requiring
                      medical evaluation.)
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-1 flex-shrink-0 font-bold text-ink">□</span>
                    <span>
                      Is your insomnia severe, chronic (lasting more than 3 months), or causing
                      significant daytime impairment? (Chronic insomnia benefits most from
                      CBT-I and clinical evaluation, not supplementation.)
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            <hr className="border-brand-900/10" />

            {/* Buyer Guide */}
            <div id="buyer-guide">
              <h2 className="mb-3 text-2xl font-semibold tracking-tight text-ink">
                Buyer Guide
              </h2>
              <p className="text-[1.01rem] leading-[1.85] text-muted">
                These product search links represent the forms, dose ranges, and combinations most
                consistent with the evidence reviewed above. Affiliate links support this site at
                no additional cost to you.
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm">
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted">
                    Beginner Stack
                  </p>
                  <p className="font-semibold text-ink">Magnesium Glycinate</p>
                  <p className="mt-1 text-xs leading-5 text-muted">
                    Well-absorbed, low GI impact. Check for clearly labelled elemental magnesium
                    content. Best starting point for most sleep supplement trials.
                  </p>
                  <a
                    href={`https://www.amazon.com/s?k=magnesium+glycinate+sleep&tag=${AFFILIATE_TAGS.amazon}`}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    className="mt-3 inline-flex items-center gap-1 rounded-full bg-brand-950 px-4 py-1.5 text-xs font-bold text-white transition hover:bg-brand-900"
                  >
                    View on Amazon →
                  </a>
                </div>
                <div className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm">
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted">
                    Relaxation Stack — L-Theanine
                  </p>
                  <p className="font-semibold text-ink">L-Theanine 100 mg</p>
                  <p className="mt-1 text-xs leading-5 text-muted">
                    Conservative starting dose. Caffeine-free only. Good for sensitive users or
                    first-time trial alongside magnesium.
                  </p>
                  <a
                    href={`https://www.amazon.com/s?k=l-theanine+100mg+caffeine+free&tag=${AFFILIATE_TAGS.amazon}`}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    className="mt-3 inline-flex items-center gap-1 rounded-full bg-brand-950 px-4 py-1.5 text-xs font-bold text-white transition hover:bg-brand-900"
                  >
                    View on Amazon →
                  </a>
                </div>
                <div className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm">
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted">
                    Relaxation Stack — L-Theanine
                  </p>
                  <p className="font-semibold text-ink">L-Theanine 200 mg</p>
                  <p className="mt-1 text-xs leading-5 text-muted">
                    Standard dose used in most sleep and relaxation trials. Caffeine-free. Avoid
                    &ldquo;focus blend&rdquo; products with caffeine for nighttime use.
                  </p>
                  <a
                    href={`https://www.amazon.com/s?k=l-theanine+200mg+sleep+caffeine+free&tag=${AFFILIATE_TAGS.amazon}`}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    className="mt-3 inline-flex items-center gap-1 rounded-full bg-brand-950 px-4 py-1.5 text-xs font-bold text-white transition hover:bg-brand-900"
                  >
                    View on Amazon →
                  </a>
                </div>
                <div className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm">
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted">
                    Stress Stack — KSM-66
                  </p>
                  <p className="font-semibold text-ink">KSM-66 Ashwagandha</p>
                  <p className="mt-1 text-xs leading-5 text-muted">
                    Standardised root extract. Used in most of the sleep and stress RCTs.
                    Commit to 6–8 weeks for a valid trial. Check for standardised withanolide
                    content.
                  </p>
                  <a
                    href={`https://www.amazon.com/s?k=KSM-66+ashwagandha+600mg&tag=${AFFILIATE_TAGS.amazon}`}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    className="mt-3 inline-flex items-center gap-1 rounded-full bg-brand-950 px-4 py-1.5 text-xs font-bold text-white transition hover:bg-brand-900"
                  >
                    View on Amazon →
                  </a>
                </div>
                <div className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm">
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted">
                    Stress Stack — Sensoril
                  </p>
                  <p className="font-semibold text-ink">Sensoril Ashwagandha</p>
                  <p className="mt-1 text-xs leading-5 text-muted">
                    Root and leaf extract. Alternative standardised extract with a distinct
                    withanolide profile. Used in some stress and sleep studies.
                  </p>
                  <a
                    href={`https://www.amazon.com/s?k=Sensoril+ashwagandha+sleep&tag=${AFFILIATE_TAGS.amazon}`}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    className="mt-3 inline-flex items-center gap-1 rounded-full bg-brand-950 px-4 py-1.5 text-xs font-bold text-white transition hover:bg-brand-900"
                  >
                    View on Amazon →
                  </a>
                </div>
                <div className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm">
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted">
                    Relaxation Stack — Combo
                  </p>
                  <p className="font-semibold text-ink">Magnesium + L-Theanine</p>
                  <p className="mt-1 text-xs leading-5 text-muted">
                    Combined physical and mental relaxation stack. Verify that the product is
                    caffeine-free, contains elemental magnesium and L-theanine at relevant doses,
                    and does not include added melatonin unless intended.
                  </p>
                  <a
                    href={`https://www.amazon.com/s?k=magnesium+l-theanine+sleep+stack+caffeine+free&tag=${AFFILIATE_TAGS.amazon}`}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    className="mt-3 inline-flex items-center gap-1 rounded-full bg-brand-950 px-4 py-1.5 text-xs font-bold text-white transition hover:bg-brand-900"
                  >
                    View on Amazon →
                  </a>
                </div>
                <div className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm">
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted">
                    Full Stack — Caffeine-Free
                  </p>
                  <p className="font-semibold text-ink">Caffeine-Free Natural Sleep Stack</p>
                  <p className="mt-1 text-xs leading-5 text-muted">
                    Multi-ingredient formulas combining magnesium, L-theanine, and/or ashwagandha.
                    Always verify: (1) caffeine-free, (2) clinically relevant dose amounts per
                    serving, (3) standardised herbal extracts where applicable.
                  </p>
                  <a
                    href={`https://www.amazon.com/s?k=natural+sleep+stack+magnesium+ashwagandha+l-theanine+caffeine+free&tag=${AFFILIATE_TAGS.amazon}`}
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

            {/* Decision Framework */}
            <div id="decision-framework">
              <h2 className="mb-4 text-2xl font-semibold tracking-tight text-ink">
                Decision Framework
              </h2>
              <div className="rounded-[1rem] border border-brand-900/10 bg-brand-50/60 p-5">
                <ul className="space-y-3 text-[1.01rem] leading-[1.85] text-muted">
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 font-bold text-ink">
                      Want the simplest approach:
                    </span>
                    <span>
                      Magnesium glycinate alone. Lowest complexity, widest applicability, best
                      safety dataset.
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 font-bold text-ink">
                      Racing thoughts are the main barrier:
                    </span>
                    <span>
                      Add L-theanine (caffeine-free) to magnesium glycinate once you have
                      established your baseline response.
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 font-bold text-ink">
                      Chronic stress is dominant:
                    </span>
                    <span>
                      Add ashwagandha (KSM-66 or Sensoril) to magnesium. Commit to 6–8 weeks.
                      See{' '}
                      <Link
                        href="/guides/sleep/ashwagandha-for-sleep"
                        className="font-semibold text-brand-700 hover:text-brand-800 hover:underline"
                      >
                        Ashwagandha for Sleep
                      </Link>{' '}
                      for the evidence.
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 font-bold text-ink">
                      Tension and racing thoughts both present:
                    </span>
                    <span>
                      Magnesium glycinate + L-theanine. Introduce one at a time, starting with
                      magnesium.
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 font-bold text-ink">
                      Stress and physical tension both present:
                    </span>
                    <span>
                      Ashwagandha + magnesium glycinate. Start magnesium first; add ashwagandha
                      after establishing your response.
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 font-bold text-ink">
                      Stress, tension, and racing thoughts all present:
                    </span>
                    <span>
                      Full stack (magnesium + L-theanine + ashwagandha), introduced one at a
                      time in that order. Allow at least 1–2 weeks between additions for
                      magnesium and L-theanine; 6–8 weeks for the ashwagandha trial.
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 font-bold text-ink text-red-700">
                      Severe, chronic insomnia:
                    </span>
                    <span>
                      Medical evaluation first. Supplements are not a substitute for CBT-I or
                      clinical assessment for persistent insomnia.
                    </span>
                  </li>
                </ul>
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
                  href="/guides/sleep/best-herbs-for-sleep"
                  className="group rounded-[0.75rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm transition hover:border-brand-700/30"
                >
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted">
                    Sleep Cluster Hub
                  </p>
                  <p className="font-semibold text-ink transition group-hover:text-brand-700">
                    Best Herbs for Sleep
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    Evidence-ranked guide to magnesium, ashwagandha, L-theanine, valerian,
                    passionflower, and more.
                  </p>
                </Link>
                <Link
                  href="/guides/sleep/magnesium-for-sleep"
                  className="group rounded-[0.75rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm transition hover:border-brand-700/30"
                >
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted">
                    Sleep Cluster
                  </p>
                  <p className="font-semibold text-ink transition group-hover:text-brand-700">
                    Magnesium for Sleep
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    Full evidence review: mechanisms, forms, dosage, safety, and comparisons
                    with other sleep supplements.
                  </p>
                </Link>
                <Link
                  href="/guides/sleep/magnesium-types-for-sleep"
                  className="group rounded-[0.75rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm transition hover:border-brand-700/30"
                >
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted">
                    Sleep Cluster
                  </p>
                  <p className="font-semibold text-ink transition group-hover:text-brand-700">
                    Magnesium Types for Sleep
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    Glycinate vs threonate vs citrate vs oxide — which magnesium form is best
                    for sleep.
                  </p>
                </Link>
                <Link
                  href="/guides/sleep/l-theanine-for-sleep"
                  className="group rounded-[0.75rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm transition hover:border-brand-700/30"
                >
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted">
                    Sleep Cluster
                  </p>
                  <p className="font-semibold text-ink transition group-hover:text-brand-700">
                    L-Theanine for Sleep
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    Evidence review: alpha waves, dosage, safety, and how L-theanine compares
                    with magnesium and ashwagandha.
                  </p>
                </Link>
                <Link
                  href="/guides/sleep/ashwagandha-for-sleep"
                  className="group rounded-[0.75rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm transition hover:border-brand-700/30"
                >
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted">
                    Sleep Cluster
                  </p>
                  <p className="font-semibold text-ink transition group-hover:text-brand-700">
                    Ashwagandha for Sleep
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    Evidence, dosage, timing, and mechanisms — and how ashwagandha compares to
                    magnesium for sleep.
                  </p>
                </Link>
                <Link
                  href="/guides/sleep/ashwagandha-vs-magnesium-for-sleep"
                  className="group rounded-[0.75rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm transition hover:border-brand-700/30"
                >
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted">
                    Sleep Cluster
                  </p>
                  <p className="font-semibold text-ink transition group-hover:text-brand-700">
                    Ashwagandha vs Magnesium for Sleep
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    Side-by-side comparison — mechanisms, evidence, safety, and whether
                    combining them makes sense.
                  </p>
                </Link>
                <Link
                  href="/guides/anxiety/natural-anxiety-relief"
                  className="group rounded-[0.75rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm transition hover:border-brand-700/30"
                >
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted">
                    Anxiety Cluster
                  </p>
                  <p className="font-semibold text-ink transition group-hover:text-brand-700">
                    Natural Anxiety Relief
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    Many of these stack supplements also reduce anxiety. See the evidence-ranked
                    anxiety hub guide.
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
                        Study / Evidence Area
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
                        Magnesium sleep evidence — sleep quality outcomes in clinical populations
                      </td>
                      <td className="py-3 pr-4 text-muted">—</td>
                      <td className="py-3 pr-4 text-muted">—</td>
                      <td className="py-3 text-muted">
                        References being compiled
                      </td>
                    </tr>
                    <tr className="align-top">
                      <td className="py-3 pr-3 text-muted">2</td>
                      <td className="py-3 pr-4 leading-6 text-ink">
                        L-theanine sleep and relaxation evidence — sleep quality, alpha-wave
                        induction, stress marker attenuation
                      </td>
                      <td className="py-3 pr-4 text-muted">—</td>
                      <td className="py-3 pr-4 text-muted">—</td>
                      <td className="py-3 text-muted">
                        References being compiled
                      </td>
                    </tr>
                    <tr className="align-top">
                      <td className="py-3 pr-3 text-muted">3</td>
                      <td className="py-3 pr-4 leading-6 text-ink">
                        Ashwagandha sleep evidence — sleep quality RCTs in stressed adult populations
                      </td>
                      <td className="py-3 pr-4 text-muted">—</td>
                      <td className="py-3 pr-4 text-muted">—</td>
                      <td className="py-3 text-muted">
                        References being compiled
                      </td>
                    </tr>
                    <tr className="align-top">
                      <td className="py-3 pr-3 text-muted">4</td>
                      <td className="py-3 pr-4 leading-6 text-ink">
                        Combination evidence — direct co-administration trials (magnesium +
                        L-theanine, ashwagandha + magnesium, or all three)
                      </td>
                      <td className="py-3 pr-4 text-muted">—</td>
                      <td className="py-3 pr-4 text-muted">—</td>
                      <td className="py-3 text-muted">
                        No combination trial identified in source registry
                      </td>
                    </tr>
                    <tr className="align-top">
                      <td className="py-3 pr-3 text-muted">5</td>
                      <td className="py-3 pr-4 leading-6 text-ink">
                        Safety and interaction evidence — supplement–drug interactions, sedative
                        combinations, kidney and thyroid considerations
                      </td>
                      <td className="py-3 pr-4 text-muted">—</td>
                      <td className="py-3 pr-4 text-muted">—</td>
                      <td className="py-3 text-muted">
                        Citations pending
                      </td>
                    </tr>
                    <tr className="align-top">
                      <td className="py-3 pr-3 text-muted">6</td>
                      <td className="py-3 pr-4 leading-6 text-ink">
                        Sleep disorder medical guidance — CBT-I evidence, sleep apnea screening,
                        clinical insomnia evaluation
                      </td>
                      <td className="py-3 pr-4 text-muted">—</td>
                      <td className="py-3 pr-4 text-muted">—</td>
                      <td className="py-3 text-muted">
                        Citations pending
                      </td>
                    </tr>
                  </tbody>
                </table>
              </ResponsiveTable>
              <p className="mt-3 text-xs text-muted">
                Full ingredient-level evidence references are shared with the dedicated articles:{' '}
                <Link
                  href="/guides/sleep/magnesium-for-sleep"
                  className="font-semibold text-brand-700 hover:text-brand-800 hover:underline"
                >
                  Magnesium for Sleep
                </Link>
                {', '}
                <Link
                  href="/guides/sleep/l-theanine-for-sleep"
                  className="font-semibold text-brand-700 hover:text-brand-800 hover:underline"
                >
                  L-Theanine for Sleep
                </Link>
                {', and '}
                <Link
                  href="/guides/sleep/ashwagandha-for-sleep"
                  className="font-semibold text-brand-700 hover:text-brand-800 hover:underline"
                >
                  Ashwagandha for Sleep
                </Link>
                .
              </p>
            </div>

          </section>

          <RecommendationSection products={getRevenueProductSet('magnesium')?.products ?? []} />

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
                ['#what-is-a-sleep-stack', 'What Is a Sleep Stack?'],
                ['#core-three', 'Core 3-Ingredient Stack'],
                ['#stack-comparison', 'Stack Comparison'],
                ['#beginner-stack', 'Beginner Stack'],
                ['#relaxation-stack', 'Relaxation Stack'],
                ['#stress-stack', 'Stress Stack'],
                ['#full-stack', 'Full Stack'],
                ['#timing-guide', 'Timing Guide'],
                ['#dosing-guide', 'Dosing Guide'],
                ['#what-not-to-combine', 'What Not To Combine'],
                ['#safety-checklist', 'Safety Checklist'],
                ['#buyer-guide', 'Buyer Guide'],
                ['#decision-framework', 'Decision Framework'],
                ['#faq', 'FAQ'],
                ['#sources', 'Sources'],
              ].map(([href, label]) => (
                <a
                  key={href}
                  href={href}
                  className="block text-sm text-brand-700 hover:text-brand-800 hover:underline"
                  dangerouslySetInnerHTML={{ __html: label }}
                />
              ))}
            </nav>
          </div>

          {/* Related profiles */}
          <div className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted">
              Explore more
            </p>
            <div className="mt-3 space-y-2">
              <Link
                href="/guides/sleep/best-herbs-for-sleep"
                className="block text-sm font-medium text-brand-700 hover:text-brand-800 hover:underline"
              >
                Best herbs for sleep →
              </Link>
              <Link
                href="/guides/sleep/magnesium-for-sleep"
                className="block text-sm font-medium text-brand-700 hover:text-brand-800 hover:underline"
              >
                Magnesium for sleep →
              </Link>
              <Link
                href="/guides/sleep/magnesium-types-for-sleep"
                className="block text-sm font-medium text-brand-700 hover:text-brand-800 hover:underline"
              >
                Magnesium types for sleep →
              </Link>
              <Link
                href="/guides/sleep/l-theanine-for-sleep"
                className="block text-sm font-medium text-brand-700 hover:text-brand-800 hover:underline"
              >
                L-Theanine for sleep →
              </Link>
              <Link
                href="/guides/sleep/ashwagandha-for-sleep"
                className="block text-sm font-medium text-brand-700 hover:text-brand-800 hover:underline"
              >
                Ashwagandha for sleep →
              </Link>
              <Link
                href="/guides/sleep/ashwagandha-vs-magnesium-for-sleep"
                className="block text-sm font-medium text-brand-700 hover:text-brand-800 hover:underline"
              >
                Ashwagandha vs magnesium →
              </Link>
              <Link
                href="/guides/sleep-herbs-vs-melatonin"
                className="block text-sm font-medium text-brand-700 hover:text-brand-800 hover:underline"
              >
                Sleep herbs vs melatonin →
              </Link>
              <Link
                href="/articles/"
                className="block text-sm font-medium text-brand-700 hover:text-brand-800 hover:underline"
              >
                All articles →
              </Link>
            </div>
          </div>
        </aside>
      </div>

      <div className="mt-8">
        <Link href="/articles/" className="text-sm font-semibold text-brand-700 hover:text-brand-800">
          ← Back to Articles
        </Link>
      </div>
    </article>
  )
}
