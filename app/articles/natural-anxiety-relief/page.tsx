import Link from 'next/link'
import { buildPageMetadata, blogJsonLd, breadcrumbJsonLd, faqPageJsonLd, compactMetaTitle } from '../../../src/lib/seo'
import EvidenceSummaryCard from '@/components/evidence/EvidenceSummaryCard'
import SafetyNotice from '@/components/evidence/SafetyNotice'
import EmailCapture from '@/components/EmailCapture'
import { getRevenueProductSet } from '@/config/revenue-products'
import RecommendationSection from '@/components/RecommendationSection'
import NewsletterCtaBlock from '@/components/NewsletterCtaBlock'
import LastUpdatedBadge from '../../../src/components/editorial/LastUpdatedBadge'
import ResponsiveTable from '@/components/ui/ResponsiveTable'
import { AFFILIATE_TAGS } from '@/config/affiliate'

// ─── Article metadata ─────────────────────────────────────────────────────────

const SLUG = 'natural-anxiety-relief'
const TITLE = 'Natural Anxiety Relief: Evidence-Ranked Herbs and Supplements'
const DESCRIPTION =
  'A practical evidence-ranked guide to natural anxiety relief, including ashwagandha, L-theanine, magnesium, CBD, passionflower, valerian, kava, saffron, and safety considerations.'
const DATE = '2026-06-09'
const AUTHOR = 'Will'
const READING_TIME = '16 min read'
const TAGS = ['anxiety', 'herbs', 'supplements', 'natural anxiety relief', 'adaptogens']
const CATEGORY = 'anxiety'

export const metadata = buildPageMetadata({
  title: compactMetaTitle(TITLE),
  description: DESCRIPTION,
  path: `/articles/${SLUG}`,
  openGraphType: 'article',
})

// ─── FAQ data (also used for JSON-LD) ────────────────────────────────────────

const FAQS = [
  {
    question: 'What is the best natural supplement for anxiety?',
    answer:
      'There is no single best option for everyone. Ashwagandha has the strongest human clinical evidence for reducing perceived stress and anxiety symptoms in adults with elevated stress. L-theanine is a well-tolerated option for mild, situational anxiety and racing thoughts. Magnesium glycinate is a reasonable baseline for most people given its role in nervous system regulation. The right choice depends on your specific anxiety pattern, severity, and any medications you take.',
  },
  {
    question: 'What herb works fastest for anxiety?',
    answer:
      'L-theanine may produce noticeable calming effects within an hour at doses of 100–200 mg, making it the fastest-acting option on this list. Passionflower tea may also produce mild relaxation relatively quickly. Ashwagandha and saffron require weeks of consistent use to show meaningful effect — they are not suitable for acute anxiety relief.',
  },
  {
    question: 'Can I take anxiety supplements with antidepressants?',
    answer:
      'This requires individual medical guidance. Kava is contraindicated with many psychiatric and hepatotoxic medications. Saffron has serotonergic activity and should not be combined with SSRIs or MAOIs without clinician oversight due to serotonin syndrome risk. Ashwagandha, L-theanine, and magnesium have lower known interaction risk, but any supplement use alongside psychiatric medications should be disclosed to your prescribing clinician. Do not stop prescribed medications to try natural alternatives.',
  },
  {
    question: 'Is ashwagandha good for anxiety?',
    answer:
      'Yes — ashwagandha has some of the best clinical evidence among natural supplements for reducing perceived stress and anxiety in adults. Multiple randomized controlled trials show significant reductions in anxiety scale scores and cortisol levels after 6–8 weeks at 300–600 mg/day (KSM-66 or Sensoril extract). It is most useful for chronic, stress-driven anxiety rather than acute episodes. Effects take weeks to build.',
  },
  {
    question: 'Is L-theanine good for anxiety?',
    answer:
      'L-theanine, an amino acid found in green tea, promotes relaxed alertness and may reduce the subjective experience of stress and anxious arousal without causing sedation. Small trials suggest benefit for mild anxiety and stress; it is well-tolerated, interacts minimally with other supplements, and may produce noticeable effects on the same day at 100–200 mg. Evidence quality is limited compared to ashwagandha, but the safety profile is very favorable.',
  },
  {
    question: 'When should anxiety be treated medically?',
    answer:
      'Seek professional care if your anxiety is significantly impairing your daily function, relationships, or work; if you experience panic attacks; if anxiety is accompanied by suicidal thoughts or self-harm urges; if symptoms persist for more than a few weeks despite self-management attempts; or if you are already taking psychiatric medications. Natural supplements are not appropriate as the sole treatment for anxiety disorders, panic disorder, PTSD, or OCD. Cognitive behavioral therapy (CBT) has the strongest evidence base for anxiety disorders.',
  },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function NaturalAnxietyReliefPage() {
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
          <Link href="/about/" rel="author" className="font-medium text-ink hover:underline">
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
        you. We only link to products consistent with the evidence reviewed on this page.
      </div>

      {/* Body + sidebar */}
      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_240px]">
        {/* Main content */}
        <div className="space-y-6">

          {/* Fastest useful choice */}
          <section className="rounded-[1rem] border border-brand-700/20 bg-brand-50/60 p-6 shadow-sm sm:p-8">
            <p className="eyebrow-label">Fastest useful choice</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
              If you only try one thing: L-theanine
            </h2>
            <p className="mt-3 text-[1.01rem] leading-[1.85] text-muted">
              <strong>L-theanine (100–200 mg) is the fastest useful choice for situational or
              racing-thought anxiety.</strong> Effects typically within 30–60 minutes, no sedation,
              no dependency. It is a calming amino acid, not a sedative, and it stacks cleanly with
              magnesium or ashwagandha. For chronic stress-driven anxiety that builds over weeks,
              add{' '}
              <Link href="/articles/ashwagandha" className="font-semibold text-brand-700 hover:underline">
                ashwagandha
              </Link>{' '}
              (KSM-66 or Sensoril, 300–600&nbsp;mg/day). See the{' '}
              <Link href="/articles/l-theanine" className="font-semibold text-brand-700 hover:underline">
                full L-theanine guide
              </Link>
              , the{' '}
              <Link href="/articles/ashwagandha" className="font-semibold text-brand-700 hover:underline">
                ashwagandha guide
              </Link>
              , and the{' '}
              <Link href="/articles/anxiety-stack-guide" className="font-semibold text-brand-700 hover:underline">
                anxiety stack guide
              </Link>
              .
            </p>
          </section>

          {/* Quick Verdict */}
          <section className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8">
            <p className="eyebrow-label">Quick Verdict</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
              Which Anxiety Supplement Should You Start With?
            </h2>
            <div className="mt-3 space-y-3 text-[1.01rem] leading-[1.85] text-muted">
              <p>
                <strong>Best for stress-driven anxiety: Ashwagandha.</strong> The strongest
                clinical evidence among natural supplements for chronic, stress-related anxiety.
                Requires 6–8 weeks of consistent use to show meaningful benefit.
              </p>
              <p>
                <strong>Best for racing thoughts and calm focus: L-theanine.</strong> Promotes
                relaxed alertness without sedation. Well-tolerated, fast-acting, and suitable for
                daytime use or situational anxiety.
              </p>
              <p>
                <strong>Best baseline mineral support: Magnesium.</strong> Broadly applicable,
                low risk, and plausibly relevant to nervous system regulation. A reasonable
                first-line supplement for most people.
              </p>
              <p>
                <strong>Best gentle herbal option: Passionflower.</strong> Modest evidence for
                mild anxiety and anxiety-related sleep difficulty. Well-tolerated and available
                as a tea.
              </p>
              <p>
                <strong>Strongest traditional anxiolytic herb, but higher caution: Kava.</strong>{' '}
                Meaningful clinical evidence for anxiety reduction, but liver toxicity risk and
                sedative drug interactions require serious consideration.
              </p>
              <p className="rounded-[0.75rem] border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                <strong>Important:</strong> Natural supplements are not appropriate as the sole
                treatment for severe anxiety, panic disorder, suicidal thoughts, or significant
                functional impairment. These conditions require professional care.
              </p>
            </div>
          </section>

          {/* Main article body */}
          <section className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8 space-y-8">

            {/* Ranking table */}
            <div id="ranking-table">
              <h2 className="mb-4 text-2xl font-semibold tracking-tight text-ink">
                Anxiety Supplements Ranked by Evidence
              </h2>
              <p className="mb-4 text-[1.01rem] leading-[1.85] text-muted">
                The table below ranks the most commonly used herbs and supplements for anxiety by
                quality of human clinical evidence, anxiety-specific outcomes, safety profile, and
                practical usefulness. Rankings are based on available evidence as of the date of
                this article — not traditional reputation or popularity.
              </p>

              <div className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-5 shadow-sm">
                <ResponsiveTable label="Evidence-ranked anxiety herbs and supplements">
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
                          Main Caution
                        </th>
                        <th className="pb-2 text-left text-xs font-bold uppercase tracking-wider text-muted">
                          Full Guide
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-900/5">
                      <tr className="align-top">
                        <td className="py-3 pr-3 font-bold text-brand-700">1</td>
                        <td className="py-3 pr-4 font-medium text-ink">Ashwagandha</td>
                        <td className="py-3 pr-4 text-muted">Moderate</td>
                        <td className="py-3 pr-4 text-muted">Chronic stress-driven anxiety, cortisol reduction</td>
                        <td className="py-3 pr-4 text-muted">Rare hepatotoxicity; avoid in pregnancy</td>
                        <td className="py-3">
                          <Link
                            href="/articles/ashwagandha"
                            className="font-semibold text-brand-700 hover:text-brand-800 hover:underline"
                          >
                            Full guide →
                          </Link>
                        </td>
                      </tr>
                      <tr className="align-top">
                        <td className="py-3 pr-3 font-bold text-brand-700">2</td>
                        <td className="py-3 pr-4 font-medium text-ink">L-Theanine</td>
                        <td className="py-3 pr-4 text-muted">Limited–Moderate</td>
                        <td className="py-3 pr-4 text-muted">Mild anxiety, racing thoughts, situational stress</td>
                        <td className="py-3 pr-4 text-muted">Minimal; very well-tolerated</td>
                        <td className="py-3">
                          <Link
                            href="/articles/l-theanine"
                            className="font-semibold text-brand-700 hover:text-brand-800 hover:underline"
                          >
                            Full guide →
                          </Link>
                        </td>
                      </tr>
                      <tr className="align-top">
                        <td className="py-3 pr-3 font-bold text-brand-700">3</td>
                        <td className="py-3 pr-4 font-medium text-ink">Magnesium</td>
                        <td className="py-3 pr-4 text-muted">Limited</td>
                        <td className="py-3 pr-4 text-muted">Nervous system baseline support, muscle tension</td>
                        <td className="py-3 pr-4 text-muted">Kidney disease; GI upset at high doses</td>
                        <td className="py-3">
                          <Link
                            href="/articles/magnesium-for-sleep"
                            className="font-semibold text-brand-700 hover:text-brand-800 hover:underline"
                          >
                            Sleep guide →
                          </Link>
                        </td>
                      </tr>
                      <tr className="align-top">
                        <td className="py-3 pr-3 font-bold text-brand-700">4</td>
                        <td className="py-3 pr-4 font-medium text-ink">Passionflower</td>
                        <td className="py-3 pr-4 text-muted">Limited</td>
                        <td className="py-3 pr-4 text-muted">Mild anxiety, anxiety-adjacent sleep difficulty</td>
                        <td className="py-3 pr-4 text-muted">Avoid with sedatives; caution in pregnancy</td>
                        <td className="py-3">
                          <Link
                            href="/guides/passionflower"
                            className="font-semibold text-brand-700 hover:text-brand-800 hover:underline"
                          >
                            Full guide →
                          </Link>
                        </td>
                      </tr>
                      <tr className="align-top">
                        <td className="py-3 pr-3 font-bold text-brand-700">5</td>
                        <td className="py-3 pr-4 font-medium text-ink">Saffron</td>
                        <td className="py-3 pr-4 text-muted">Limited–Moderate</td>
                        <td className="py-3 pr-4 text-muted">Mood/anxiety overlap, mild depression</td>
                        <td className="py-3 pr-4 text-muted">Serotonergic activity; caution with SSRIs</td>
                        <td className="py-3 text-muted text-xs">Guide planned</td>
                      </tr>
                      <tr className="align-top">
                        <td className="py-3 pr-3 font-bold text-brand-700">6</td>
                        <td className="py-3 pr-4 font-medium text-ink">Kava</td>
                        <td className="py-3 pr-4 text-muted">Moderate</td>
                        <td className="py-3 pr-4 text-muted">Generalized anxiety, acute anxiolytic effect</td>
                        <td className="py-3 pr-4 text-muted">Hepatotoxicity risk; avoid with alcohol/sedatives</td>
                        <td className="py-3">
                          <Link
                            href="/guides/kava"
                            className="font-semibold text-brand-700 hover:text-brand-800 hover:underline"
                          >
                            Full guide →
                          </Link>
                        </td>
                      </tr>
                      <tr className="align-top">
                        <td className="py-3 pr-3 font-bold text-muted">7</td>
                        <td className="py-3 pr-4 font-medium text-ink">Valerian</td>
                        <td className="py-3 pr-4 text-muted">Mixed / weak</td>
                        <td className="py-3 pr-4 text-muted">Anxiety-adjacent insomnia, mild sedation</td>
                        <td className="py-3 pr-4 text-muted">Sedation; avoid with CNS depressants</td>
                        <td className="py-3">
                          <Link
                            href="/articles/best-herbs-for-sleep"
                            className="font-semibold text-brand-700 hover:text-brand-800 hover:underline"
                          >
                            Sleep hub →
                          </Link>
                        </td>
                      </tr>
                      <tr className="align-top">
                        <td className="py-3 pr-3 font-bold text-muted">8</td>
                        <td className="py-3 pr-4 font-medium text-ink">CBD</td>
                        <td className="py-3 pr-4 text-muted">Limited (preliminary)</td>
                        <td className="py-3 pr-4 text-muted">Stress, social anxiety (small trials)</td>
                        <td className="py-3 pr-4 text-muted">Drug interactions; quality variation</td>
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
                How We Ranked These Options
              </h2>
              <p className="text-[1.01rem] leading-[1.85] text-muted">
                Rankings are not based on popularity, traditional reputation, or marketing claims.
                The criteria used, in rough order of weight:
              </p>
              <ul className="mt-3 ml-5 space-y-2 list-disc text-[1.01rem] leading-[1.85] text-muted">
                <li>
                  <strong>Human clinical evidence</strong> — randomized controlled trials using
                  validated anxiety outcome measures (GAD-7, HAM-A, STAI, PSS). Animal and in
                  vitro data support mechanistic plausibility but do not count toward the evidence
                  grade.
                </li>
                <li>
                  <strong>Anxiety-specific outcomes</strong> — evidence for improvements in
                  anxiety symptoms specifically, not only general stress or mood. Sleep improvement
                  alone does not constitute anxiety evidence.
                </li>
                <li>
                  <strong>Safety profile</strong> — tolerability, known contraindications, and
                  known drug interactions. A supplement with strong anxiety evidence but serious
                  safety concerns (kava) ranks lower than it would by evidence alone.
                </li>
                <li>
                  <strong>Medication interaction risk</strong> — particularly relevant for
                  serotonergic herbs (saffron), hepatotoxic herbs (kava, ashwagandha), and
                  sedative-potentiating herbs (valerian, passionflower, kava).
                </li>
                <li>
                  <strong>Practicality and cost</strong> — widely available, affordable options
                  with accessible dosing rank higher than equivalent options that are expensive
                  or difficult to source responsibly.
                </li>
                <li>
                  <strong>Fit for mild-to-moderate anxiety support</strong> — this guide targets
                  the population most likely to benefit from supplements: people with mild to
                  moderate anxiety symptoms, not anxiety disorders requiring primary medical
                  treatment.
                </li>
              </ul>
            </div>

            <hr className="border-brand-900/10" />

            {/* Deep dives */}
            <div id="deep-dives">
              <h2 className="mb-6 text-2xl font-semibold tracking-tight text-ink">
                Deep Dives: Top Anxiety Supplements
              </h2>

              {/* Ashwagandha */}
              <div id="ashwagandha" className="mb-8">
                <h3 className="mb-2 text-xl font-semibold tracking-tight text-ink">
                  1. Ashwagandha
                </h3>
                <EvidenceSummaryCard
                  title="Ashwagandha &amp; Anxiety"
                  evidenceLevel="Moderate"
                  humanEvidence="Multiple RCTs show significant reductions in anxiety scale scores (GAD-7, HAM-A, STAI) and cortisol levels in adults with elevated stress. Effects are most consistent over 6–8 weeks in chronically stressed populations."
                  mechanisticEvidence="HPA axis modulation with cortisol reduction well-documented in human trials. Sympathetic nervous system downregulation. GABA-A receptor binding activity in vitro. Reduces physiological markers of stress arousal."
                  safetyProfile="Generally well-tolerated at 300–600 mg/day for up to 12 weeks. Rare hepatotoxicity cases reported. Contraindicated in pregnancy. Potential thyroid and autoimmune interactions."
                />
                <div className="mt-4 space-y-2 text-[1.01rem] leading-[1.85] text-muted">
                  <p>
                    <strong>How it may help anxiety:</strong> Ashwagandha reduces cortisol via
                    HPA axis modulation and dampens sympathetic nervous system activation. It
                    does not act as a direct anxiolytic in the way benzodiazepines do — it works
                    by reducing the physiological stress response that amplifies anxiety symptoms
                    over time. Most benefit is seen in people with chronic, stress-linked anxiety
                    rather than acute or situational anxiety.
                  </p>
                  <p>
                    <strong>Best-fit user:</strong> Adults with chronic stress-driven anxiety,
                    particularly when accompanied by fatigue, poor sleep, or elevated perceived
                    stress. Less useful for acute or situational anxiety.
                  </p>
                  <p>
                    <strong>Main limitation:</strong> Onset is slow — meaningful improvement
                    typically requires 6–8 weeks of consistent use. Not useful for acute anxiety
                    episodes.
                  </p>
                  <p>
                    <strong>Safety note:</strong> Rare hepatotoxicity cases have been reported;
                    avoid with liver disease or hepatotoxic medications. Avoid in pregnancy.
                    Potential thyroid hormone interactions — disclose to your physician if on
                    thyroid medication.
                  </p>
                  <p>
                    <Link
                      href="/articles/ashwagandha-for-sleep"
                      className="font-semibold text-brand-700 hover:text-brand-800 hover:underline"
                    >
                      Related: Ashwagandha for Sleep →
                    </Link>
                  </p>
                </div>
              </div>

              <hr className="border-brand-900/10" />

              {/* L-Theanine */}
              <div id="l-theanine" className="mt-8 mb-8">
                <h3 className="mb-2 text-xl font-semibold tracking-tight text-ink">
                  2. L-Theanine
                </h3>
                <EvidenceSummaryCard
                  title="L-Theanine &amp; Anxiety"
                  evidenceLevel="Limited"
                  humanEvidence="Small trials suggest L-theanine reduces subjective anxiety and stress responses, particularly in the context of acute stress tasks. Evidence for ongoing anxiety disorder management is limited. Most reliable effect is relaxation without sedation."
                  mechanisticEvidence="Promotes alpha-wave brain activity associated with calm wakefulness. Modulates glutamate and GABA signaling. May blunt cortisol response to acute stressors. Does not produce sedation at standard doses."
                  safetyProfile="Very well-tolerated. No significant drug interactions reported at standard doses (100–200 mg). Long-term safety data limited but no serious adverse events identified."
                />
                <div className="mt-4 space-y-2 text-[1.01rem] leading-[1.85] text-muted">
                  <p>
                    <strong>How it may help anxiety:</strong> L-theanine, an amino acid found
                    in green tea, increases alpha-wave brain activity associated with calm,
                    focused wakefulness. It reduces anxious arousal and may blunt acute stress
                    responses without causing drowsiness — making it useful for people who need
                    to remain alert while managing anxiety or racing thoughts.
                  </p>
                  <p>
                    <strong>Best-fit user:</strong> People with mild, situational anxiety;
                    racing thoughts; or caffeine-exacerbated anxiety. A practical daytime
                    supplement that does not impair cognitive function. Works relatively quickly
                    (within an hour at 100–200 mg).
                  </p>
                  <p>
                    <strong>Main limitation:</strong> Evidence for sustained, clinically
                    meaningful anxiety reduction is limited. Most effect is acute and related
                    to relaxation rather than treating underlying anxiety patterns.
                  </p>
                  <p>
                    <strong>Safety note:</strong> One of the safest options on this list. No
                    significant drug interactions at standard doses. Can be combined with
                    magnesium or ashwagandha without known interaction risk.
                  </p>
                  <p>
                    <Link
                      href="/articles/l-theanine-for-sleep"
                      className="font-semibold text-brand-700 hover:text-brand-800 hover:underline"
                    >
                      Related: L-Theanine for Sleep →
                    </Link>
                  </p>
                </div>
              </div>

              <hr className="border-brand-900/10" />

              {/* Magnesium */}
              <div id="magnesium" className="mt-8 mb-8">
                <h3 className="mb-2 text-xl font-semibold tracking-tight text-ink">
                  3. Magnesium
                </h3>
                <EvidenceSummaryCard
                  title="Magnesium &amp; Anxiety"
                  evidenceLevel="Limited"
                  humanEvidence="Some trials suggest magnesium supplementation may modestly reduce anxiety symptoms, particularly in people with low magnesium status. Anxiety-specific trial evidence is weaker than the sleep evidence base. Most reliable benefit is for muscle tension and baseline nervous system support."
                  mechanisticEvidence="NMDA receptor antagonism reduces excitatory glutamatergic tone. GABA-A potentiation supports inhibitory signaling. Involved in HPA axis stress regulation. Magnesium deficiency is associated with increased neuronal excitability."
                  safetyProfile="Generally well-tolerated at 200–400 mg elemental/day. GI upset at higher doses. Kidney disease requires caution. Magnesium glycinate is best-tolerated form."
                />
                <div className="mt-4 space-y-2 text-[1.01rem] leading-[1.85] text-muted">
                  <p>
                    <strong>How it may help anxiety:</strong> Magnesium is involved in nervous
                    system regulation through NMDA receptor antagonism and GABA-A potentiation.
                    Deficiency is associated with heightened stress reactivity and neuronal
                    hyperexcitability. Supplementation may reduce anxiety symptoms particularly
                    in those with suboptimal dietary magnesium, though anxiety-specific evidence
                    is modest compared to sleep evidence.
                  </p>
                  <p>
                    <strong>Best-fit user:</strong> Most people — particularly those with muscle
                    tension, poor sleep alongside anxiety, or suspected suboptimal dietary
                    magnesium. A reasonable low-risk baseline supplement.
                  </p>
                  <p>
                    <strong>Main limitation:</strong> Anxiety-specific clinical evidence is
                    limited. Direct comparison to placebo in anxiety trials is less robust than
                    for sleep outcomes.
                  </p>
                  <p>
                    <strong>Safety note:</strong> Avoid high doses with kidney disease.
                    Magnesium glycinate is generally better tolerated than citrate or oxide.
                  </p>
                  <p>
                    <Link
                      href="/articles/magnesium-for-sleep"
                      className="font-semibold text-brand-700 hover:text-brand-800 hover:underline"
                    >
                      Related: Magnesium for Sleep →
                    </Link>
                  </p>
                </div>
              </div>

              <hr className="border-brand-900/10" />

              {/* Passionflower */}
              <div id="passionflower" className="mt-8 mb-8">
                <h3 className="mb-2 text-xl font-semibold tracking-tight text-ink">
                  4. Passionflower
                </h3>
                <EvidenceSummaryCard
                  title="Passionflower &amp; Anxiety"
                  evidenceLevel="Limited"
                  humanEvidence="A small number of RCTs suggest passionflower extract or tea comparably reduces pre-procedural anxiety and modestly improves generalized anxiety symptoms versus placebo. Most studies are small and short-term. Evidence is promising but not definitive."
                  mechanisticEvidence="Chrysin and related flavonoids may bind GABA-A receptors. Preclinical evidence for anxiolytic and mild sedative effects. Human mechanistic data is sparse."
                  safetyProfile="Generally well-tolerated at standard doses. Sedation at higher doses. Avoid with prescription sedatives. Not recommended in pregnancy."
                />
                <div className="mt-4 space-y-2 text-[1.01rem] leading-[1.85] text-muted">
                  <p>
                    <strong>How it may help anxiety:</strong> Passionflower contains flavonoids
                    including chrysin that may modulate GABA-A receptors, producing mild
                    anxiolytic effects. Several small trials show comparable anxiety reduction
                    to low-dose benzodiazepines for pre-procedural anxiety, though effect sizes
                    are modest and evidence quality is limited.
                  </p>
                  <p>
                    <strong>Best-fit user:</strong> People seeking a gentle herbal option for
                    mild, situational anxiety. Also useful when anxiety overlaps with sleep
                    difficulty. Available as a pleasant-tasting tea.
                  </p>
                  <p>
                    <strong>Main limitation:</strong> Evidence base is thin and studies are
                    small. Commercial product standardization varies considerably. Not
                    appropriate for significant or ongoing anxiety disorders.
                  </p>
                  <p>
                    <strong>Safety note:</strong> Do not combine with prescription sedatives or
                    benzodiazepines. Avoid in pregnancy (uterotonic activity in animal models).
                  </p>
                </div>
              </div>

              <hr className="border-brand-900/10" />

              {/* Kava */}
              <div id="kava" className="mt-8 mb-8">
                <h3 className="mb-2 text-xl font-semibold tracking-tight text-ink">
                  5. Kava
                </h3>
                <EvidenceSummaryCard
                  title="Kava &amp; Anxiety"
                  evidenceLevel="Moderate"
                  humanEvidence="Meta-analyses of kava RCTs show significant reductions in anxiety scores (HAM-A) versus placebo in generalized anxiety. Evidence quality is moderate but the effect is consistent across trials. Liver toxicity risk substantially limits use."
                  mechanisticEvidence="Kavalactones modulate GABA-A receptors, dopamine signaling, and sodium channel activity. Mechanism is distinct from benzodiazepines despite functional overlap. Well-characterized pharmacology."
                  safetyProfile="Meaningful hepatotoxicity risk — multiple case reports of serious liver injury, including cases requiring transplant. Absolutely contraindicated with alcohol and sedatives. Banned in several countries. Requires responsible, time-limited use."
                />
                <div className="mt-4 space-y-2 text-[1.01rem] leading-[1.85] text-muted">
                  <p>
                    <strong>How it may help anxiety:</strong> Kava has among the strongest
                    evidence of any herbal anxiolytic. Kavalactones produce meaningful anxiolytic
                    effects via GABA-A modulation and other pathways. Effects are noticeable
                    acutely (within an hour), which distinguishes kava from adaptogens that
                    require weeks to build.
                  </p>
                  <p>
                    <strong>Best-fit user:</strong> Adults who want a traditional herbal
                    anxiolytic with real clinical backing and who understand the liver toxicity
                    risks. Requires time-limited use, medical disclosure, and abstinence from
                    alcohol and sedatives.
                  </p>
                  <p>
                    <strong>Main limitation:</strong> Liver toxicity is a real and documented
                    risk — not theoretical. Several countries have restricted or banned kava
                    supplements due to hepatotoxicity cases.
                  </p>
                  <p>
                    <strong>Safety note:</strong> Never combine with alcohol, benzodiazepines,
                    opioids, or other sedatives. Avoid with pre-existing liver disease.
                    Avoid with hepatotoxic medications. Use short-term only. Disclose to your
                    physician. Do not use if pregnant or breastfeeding.
                  </p>
                </div>
              </div>

              <hr className="border-brand-900/10" />

              {/* Saffron */}
              <div id="saffron" className="mt-8">
                <h3 className="mb-2 text-xl font-semibold tracking-tight text-ink">
                  6. Saffron
                </h3>
                <EvidenceSummaryCard
                  title="Saffron &amp; Anxiety / Mood"
                  evidenceLevel="Limited"
                  humanEvidence="Growing number of RCTs suggest saffron (30 mg/day standardized extract) has antidepressant effects comparable to low-dose SSRIs in mild-to-moderate depression, with secondary anxiolytic effects. Most trials are short-term and small. Anxiety-specific evidence is weaker than mood evidence."
                  mechanisticEvidence="Crocin and safranal modulate serotonin reuptake and receptor activity. Antioxidant and neuroprotective properties. BDNF-modulating effects in preclinical models."
                  safetyProfile="Generally well-tolerated at 30 mg/day. Serotonergic activity — do not combine with SSRIs or MAOIs without clinician guidance (serotonin syndrome risk). Not recommended in pregnancy at high doses."
                />
                <div className="mt-4 space-y-2 text-[1.01rem] leading-[1.85] text-muted">
                  <p>
                    <strong>How it may help anxiety:</strong> Saffron&apos;s active constituents
                    (crocin, safranal) modulate serotonin signaling, which may secondarily
                    reduce anxiety alongside mood improvement. Most trials focus on depression,
                    but anxiety symptoms often co-occur and respond in the same trial data.
                  </p>
                  <p>
                    <strong>Best-fit user:</strong> People with anxiety that overlaps with
                    low mood or mild depression — the mood-anxiety spectrum where serotonergic
                    interventions are most likely to help. Less suited for anxiety without
                    mood overlap.
                  </p>
                  <p>
                    <strong>Main limitation:</strong> Anxiety-specific evidence is weaker than
                    mood evidence. Serotonergic activity is a meaningful drug interaction
                    concern for anyone on antidepressants.
                  </p>
                  <p>
                    <strong>Safety note:</strong> Do not combine with SSRIs, SNRIs, or MAOIs
                    without clinician guidance. Avoid high doses in pregnancy.
                  </p>
                </div>
              </div>
            </div>

            <hr className="border-brand-900/10" />

            {/* Which should you try first */}
            <div id="decision-framework">
              <h2 className="mb-4 text-2xl font-semibold tracking-tight text-ink">
                Which Should You Try First?
              </h2>
              <p className="mb-4 text-[1.01rem] leading-[1.85] text-muted">
                The most useful framework is to match the supplement to your anxiety pattern and
                primary symptoms:
              </p>
              <div className="space-y-3 rounded-[1rem] border border-brand-900/10 bg-brand-50/40 p-5">
                <div className="flex gap-3">
                  <span className="mt-0.5 flex-shrink-0 text-brand-700">→</span>
                  <p className="text-[1.01rem] leading-[1.85] text-muted">
                    <strong>Chronic stress + poor sleep:</strong> Start with{' '}
                    <Link href="/articles/ashwagandha-for-sleep" className="font-semibold text-brand-700 hover:underline">
                      ashwagandha
                    </Link>{' '}
                    (KSM-66 or Sensoril, 300–600 mg/day). Allow 6–8 weeks. Consider adding{' '}
                    <Link href="/articles/magnesium-for-sleep" className="font-semibold text-brand-700 hover:underline">
                      magnesium glycinate
                    </Link>{' '}
                    for sleep overlap.
                  </p>
                </div>
                <div className="flex gap-3">
                  <span className="mt-0.5 flex-shrink-0 text-brand-700">→</span>
                  <p className="text-[1.01rem] leading-[1.85] text-muted">
                    <strong>Racing thoughts + caffeine sensitivity:</strong> Try L-theanine
                    (100–200 mg). Works within an hour. Can be taken during the day without
                    impairing focus.
                  </p>
                </div>
                <div className="flex gap-3">
                  <span className="mt-0.5 flex-shrink-0 text-brand-700">→</span>
                  <p className="text-[1.01rem] leading-[1.85] text-muted">
                    <strong>Muscle tension + sleep overlap:</strong>{' '}
                    <Link href="/articles/magnesium-for-sleep" className="font-semibold text-brand-700 hover:underline">
                      Magnesium glycinate
                    </Link>{' '}
                    (200–400 mg elemental, evening) is a well-tolerated, broadly applicable
                    starting point.
                  </p>
                </div>
                <div className="flex gap-3">
                  <span className="mt-0.5 flex-shrink-0 text-brand-700">→</span>
                  <p className="text-[1.01rem] leading-[1.85] text-muted">
                    <strong>Gentle herbal option preferred:</strong> Passionflower (250–500 mg
                    extract or tea) is one of the gentler options with some supporting evidence
                    and good tolerability.
                  </p>
                </div>
                <div className="flex gap-3">
                  <span className="mt-0.5 flex-shrink-0 text-brand-700">→</span>
                  <p className="text-[1.01rem] leading-[1.85] text-muted">
                    <strong>Stronger traditional anxiolytic, informed about risks:</strong>{' '}
                    Kava has the strongest acute anxiolytic effect among herbal options, but the
                    liver toxicity risk is real and should be taken seriously. Requires informed,
                    time-limited use with medical disclosure.
                  </p>
                </div>
                <div className="flex gap-3">
                  <span className="mt-0.5 flex-shrink-0 text-brand-700">→</span>
                  <p className="text-[1.01rem] leading-[1.85] text-muted">
                    <strong>Mood and anxiety overlap:</strong> Saffron (30 mg/day standardized)
                    may be relevant if low mood is alongside anxiety — but requires caution with
                    serotonergic medications.
                  </p>
                </div>
              </div>
            </div>

            <hr className="border-brand-900/10" />

            {/* What not to do */}
            <div id="what-not-to-do">
              <h2 className="mb-4 text-2xl font-semibold tracking-tight text-ink">
                What Not To Do
              </h2>
              <ul className="ml-5 space-y-3 list-disc text-[1.01rem] leading-[1.85] text-muted">
                <li>
                  <strong>Do not combine multiple calming supplements at once.</strong> You will
                  not know what is helping or causing side effects. Introduce one at a time over
                  2–4 weeks before adding the next.
                </li>
                <li>
                  <strong>Never mix kava with alcohol or sedatives.</strong> This combination
                  dramatically increases liver toxicity and CNS depression risk. This is not a
                  theoretical caution.
                </li>
                <li>
                  <strong>Do not use supplements instead of professional care for severe
                  anxiety.</strong> If anxiety is significantly impairing your daily life,
                  relationships, or work, seek professional evaluation. Supplements are not
                  treatments for anxiety disorders.
                </li>
                <li>
                  <strong>Do not ignore panic attacks, suicidal thoughts, or severe
                  impairment.</strong> These require immediate professional attention. Supplements
                  are not appropriate first-line treatment and cannot replace professional care
                  in these situations.
                </li>
                <li>
                  <strong>Do not stop prescribed psychiatric medications without clinician
                  guidance.</strong> Stopping antidepressants, benzodiazepines, or other
                  psychiatric medications without medical supervision can be dangerous. Never
                  replace prescribed medications with supplements without consulting your
                  prescriber.
                </li>
                <li>
                  <strong>Do not assume &ldquo;natural&rdquo; means risk-free.</strong> Kava has
                  caused liver transplants. Ashwagandha has caused liver injury. Saffron can
                  interact with antidepressants. Every supplement carries risks that vary by
                  individual, dose, and drug interactions.
                </li>
              </ul>
            </div>

            <hr className="border-brand-900/10" />

            {/* Anxiety + Sleep Overlap */}
            <div id="sleep-overlap">
              <h2 className="mb-4 text-2xl font-semibold tracking-tight text-ink">
                Anxiety and Sleep: The Overlap
              </h2>
              <p className="mb-3 text-[1.01rem] leading-[1.85] text-muted">
                Anxiety and poor sleep reinforce each other. Anxiety activates the sympathetic
                nervous system, raises cortisol, and produces hyperarousal that directly impairs
                sleep. Poor sleep, in turn, increases reactivity to stress and makes anxiety
                symptoms worse the following day. This bidirectional relationship means that
                improving one often improves the other.
              </p>
              <p className="mb-4 text-[1.01rem] leading-[1.85] text-muted">
                Several supplements covered in this guide — ashwagandha, L-theanine, magnesium,
                and passionflower — have evidence for both anxiety and sleep benefits, often
                through overlapping mechanisms. If your anxiety is closely linked to poor sleep,
                the sleep cluster guides cover these supplements in more depth:
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <Link
                  href="/articles/best-herbs-for-sleep"
                  className="group rounded-[0.75rem] border border-brand-900/10 bg-brand-50/40 p-4 transition hover:border-brand-700/30"
                >
                  <p className="font-semibold text-ink transition group-hover:text-brand-700">
                    Best Herbs for Sleep
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    Evidence-ranked hub guide to sleep herbs and supplements.
                  </p>
                </Link>
                <Link
                  href="/articles/ashwagandha-for-sleep"
                  className="group rounded-[0.75rem] border border-brand-900/10 bg-brand-50/40 p-4 transition hover:border-brand-700/30"
                >
                  <p className="font-semibold text-ink transition group-hover:text-brand-700">
                    Ashwagandha for Sleep
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    Detailed guide to ashwagandha evidence, dosage, and timing for sleep.
                  </p>
                </Link>
                <Link
                  href="/articles/l-theanine-for-sleep"
                  className="group rounded-[0.75rem] border border-brand-900/10 bg-brand-50/40 p-4 transition hover:border-brand-700/30"
                >
                  <p className="font-semibold text-ink transition group-hover:text-brand-700">
                    L-Theanine for Sleep
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    How L-theanine promotes relaxation without sedation for better sleep.
                  </p>
                </Link>
                <Link
                  href="/articles/magnesium-for-sleep"
                  className="group rounded-[0.75rem] border border-brand-900/10 bg-brand-50/40 p-4 transition hover:border-brand-700/30"
                >
                  <p className="font-semibold text-ink transition group-hover:text-brand-700">
                    Magnesium for Sleep
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    Evidence, forms, and dosage for magnesium as a sleep supplement.
                  </p>
                </Link>
                <Link
                  href="/articles/sleep-stack-guide"
                  className="group rounded-[0.75rem] border border-brand-900/10 bg-brand-50/40 p-4 transition hover:border-brand-700/30"
                >
                  <p className="font-semibold text-ink transition group-hover:text-brand-700">
                    Sleep Stack Guide
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    How to combine magnesium, ashwagandha, and L-theanine safely.
                  </p>
                </Link>
              </div>
            </div>

            <hr className="border-brand-900/10" />

            {/* Safety */}
            <div id="safety">
              <h2 className="mb-4 text-2xl font-semibold tracking-tight text-ink">
                Safety Overview
              </h2>
              <SafetyNotice title="General Safety — Anxiety Herbs and Supplements">
                <ul className="ml-5 space-y-1.5 list-disc">
                  <li>
                    <strong>Pregnancy and breastfeeding:</strong> Avoid most herbs on this list
                    during pregnancy — including ashwagandha, passionflower, valerian, kava, and
                    saffron at high doses — due to limited safety data and preclinical concerns.
                    Magnesium is generally considered safe at dietary intake levels; high
                    supplemental doses should be discussed with a healthcare provider.
                  </li>
                  <li>
                    <strong>Sedative medications:</strong> Kava, valerian, and passionflower can
                    potentiate the CNS depressant effects of benzodiazepines, z-drugs, opioids,
                    and alcohol. This is a meaningful safety risk — do not combine without
                    medical supervision.
                  </li>
                  <li>
                    <strong>Psychiatric medications:</strong> Saffron has serotonergic activity
                    and should not be combined with SSRIs, SNRIs, or MAOIs without clinician
                    guidance due to serotonin syndrome risk. Ashwagandha may interact with
                    thyroid medications and immunosuppressants.
                  </li>
                  <li>
                    <strong>Liver caution — kava and ashwagandha:</strong> Both have documented
                    hepatotoxicity cases in post-market surveillance. Avoid with existing liver
                    disease or hepatotoxic medications. Monitor for jaundice, dark urine, or
                    right upper quadrant pain.
                  </li>
                  <li>
                    <strong>Kidney disease — magnesium:</strong> The kidneys regulate magnesium
                    excretion. Supplementation in people with moderate to severe kidney disease
                    (CKD stage 3+) can cause hypermagnesemia. Consult a physician before
                    supplementing.
                  </li>
                  <li>
                    <strong>Panic disorder and severe anxiety:</strong> Supplements should not
                    be the primary treatment for panic disorder, PTSD, OCD, or severe
                    generalized anxiety disorder. Cognitive behavioral therapy (CBT) has the
                    strongest evidence for anxiety disorders. Professional evaluation is
                    appropriate for persistent, impairing anxiety.
                  </li>
                  <li>
                    <strong>Emergency situations:</strong> If you are experiencing suicidal
                    thoughts, self-harm urges, or a mental health crisis, contact emergency
                    services or a crisis line immediately. Supplements cannot address a mental
                    health emergency.
                  </li>
                </ul>
              </SafetyNotice>
            </div>

            <hr className="border-brand-900/10" />

            {/* Buyer Guide */}
            <div id="buyer-guide">
              <h2 className="mb-4 text-2xl font-semibold tracking-tight text-ink">
                Where to Buy
              </h2>
              <p className="mb-4 text-[1.01rem] leading-[1.85] text-muted">
                The affiliate links below search for products consistent with the extract forms
                and dose ranges discussed in this guide. We earn a small commission at no
                additional cost to you.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm">
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted">
                    Stress-Driven Anxiety
                  </p>
                  <p className="font-semibold text-ink">KSM-66 Ashwagandha</p>
                  <p className="mt-1 text-xs leading-5 text-muted">
                    Patented full-spectrum root extract. Most-studied form for anxiety and stress.
                    Look for ≥300 mg per capsule, standardized to ≥5% withanolides.
                  </p>
                  <a
                    href={`https://www.amazon.com/s?k=KSM-66+ashwagandha&tag=${AFFILIATE_TAGS.amazon}`}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    className="mt-3 inline-flex items-center gap-1 rounded-full bg-brand-950 px-4 py-1.5 text-xs font-bold text-white transition hover:bg-brand-900"
                  >
                    View on Amazon →
                  </a>
                </div>
                <div className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm">
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted">
                    Racing Thoughts / Situational Stress
                  </p>
                  <p className="font-semibold text-ink">L-Theanine</p>
                  <p className="mt-1 text-xs leading-5 text-muted">
                    Pure L-theanine, 100–200 mg per capsule. Look for third-party tested products.
                    Suntheanine is a well-studied branded form.
                  </p>
                  <a
                    href={`https://www.amazon.com/s?k=l-theanine+suntheanine&tag=${AFFILIATE_TAGS.amazon}`}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    className="mt-3 inline-flex items-center gap-1 rounded-full bg-brand-950 px-4 py-1.5 text-xs font-bold text-white transition hover:bg-brand-900"
                  >
                    View on Amazon →
                  </a>
                </div>
                <div className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm">
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted">
                    Baseline Nervous System Support
                  </p>
                  <p className="font-semibold text-ink">Magnesium Glycinate</p>
                  <p className="mt-1 text-xs leading-5 text-muted">
                    Best-tolerated magnesium form for anxiety and sleep. Look for products
                    listing elemental magnesium content (aim for 200–400 mg elemental/day).
                  </p>
                  <a
                    href={`https://www.amazon.com/s?k=magnesium+glycinate&tag=${AFFILIATE_TAGS.amazon}`}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    className="mt-3 inline-flex items-center gap-1 rounded-full bg-brand-950 px-4 py-1.5 text-xs font-bold text-white transition hover:bg-brand-900"
                  >
                    View on Amazon →
                  </a>
                </div>
                <div className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm">
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted">
                    Gentle Herbal Option
                  </p>
                  <p className="font-semibold text-ink">Passionflower</p>
                  <p className="mt-1 text-xs leading-5 text-muted">
                    Available as tea or standardized extract. Look for passionflower extract
                    products with clear standardization, or loose-leaf tea.
                  </p>
                  <a
                    href={`https://www.amazon.com/s?k=passionflower+extract&tag=${AFFILIATE_TAGS.amazon}`}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    className="mt-3 inline-flex items-center gap-1 rounded-full bg-brand-950 px-4 py-1.5 text-xs font-bold text-white transition hover:bg-brand-900"
                  >
                    View on Amazon →
                  </a>
                </div>
                <div className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm">
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted">
                    Mood / Anxiety Overlap
                  </p>
                  <p className="font-semibold text-ink">Saffron Extract</p>
                  <p className="mt-1 text-xs leading-5 text-muted">
                    Look for 30 mg/day standardized saffron extract (e.g., Safr&apos;Inside or
                    affron). Do not combine with antidepressants without medical guidance.
                  </p>
                  <a
                    href={`https://www.amazon.com/s?k=saffron+extract+supplement&tag=${AFFILIATE_TAGS.amazon}`}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    className="mt-3 inline-flex items-center gap-1 rounded-full bg-brand-950 px-4 py-1.5 text-xs font-bold text-white transition hover:bg-brand-900"
                  >
                    View on Amazon →
                  </a>
                </div>
                <div className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm">
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted">
                    Traditional Anxiolytic (Informed Use)
                  </p>
                  <p className="font-semibold text-ink">Kava Extract</p>
                  <p className="mt-1 text-xs leading-5 text-muted">
                    Noble kava varieties only. Avoid tudei kava. Never combine with alcohol or
                    sedatives. Use short-term only with physician disclosure.
                  </p>
                  <a
                    href={`https://www.amazon.com/s?k=noble+kava+extract&tag=${AFFILIATE_TAGS.amazon}`}
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
                  href="/articles/best-herbs-for-sleep"
                  className="group rounded-[0.75rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm transition hover:border-brand-700/30"
                >
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted">
                    Sleep Cluster
                  </p>
                  <p className="font-semibold text-ink transition group-hover:text-brand-700">
                    Best Herbs for Sleep
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    Evidence-ranked guide to magnesium, ashwagandha, L-theanine, and other
                    sleep supplements.
                  </p>
                </Link>
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
                    Evidence, dosage, and mechanisms for ashwagandha as a sleep supplement.
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
                    How L-theanine promotes calm without sedation and helps with sleep.
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
                    Evidence, forms, and dosage for magnesium as a sleep supplement.
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
                    How to combine magnesium, ashwagandha, and L-theanine safely.
                  </p>
                </Link>
                <Link
                  href="/articles/ashwagandha-for-anxiety"
                  className="group rounded-[0.75rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm transition hover:border-brand-700/30"
                >
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted">
                    Anxiety Cluster
                  </p>
                  <p className="font-semibold text-ink transition group-hover:text-brand-700">Ashwagandha for Anxiety</p>
                  <p className="mt-1 text-xs text-muted">Benefits, dosage, safety, and research review.</p>
                </Link>
                <Link
                  href="/articles/l-theanine-for-anxiety"
                  className="group rounded-[0.75rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm transition hover:border-brand-700/30"
                >
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted">
                    Anxiety Cluster
                  </p>
                  <p className="font-semibold text-ink transition group-hover:text-brand-700">L-Theanine for Anxiety</p>
                  <p className="mt-1 text-xs text-muted">Calm focus and racing thoughts without sedation.</p>
                </Link>
                <Link
                  href="/articles/anxiety-stack-guide"
                  className="group rounded-[0.75rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm transition hover:border-brand-700/30"
                >
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted">
                    Anxiety Cluster
                  </p>
                  <p className="font-semibold text-ink transition group-hover:text-brand-700">Anxiety Stack Guide</p>
                  <p className="mt-1 text-xs text-muted">How to combine ashwagandha, L-theanine, and magnesium.</p>
                </Link>
              </div>
            </div>

            <hr className="border-brand-900/10" />

            {/* Sources */}
            <div id="sources">
              <h2 className="mb-4 text-2xl font-semibold tracking-tight text-ink">Sources</h2>
              <p className="mb-4 text-sm text-muted">
                The references below include the key trials and reviews for each herb covered in this guide.
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
                      <td className="py-3 pr-3 font-medium text-ink">Ashwagandha anxiety evidence</td>
                      <td className="py-3 pr-4 text-muted">
                        Chandrasekhar et al. 2012; Pratte et al. 2014; anxiety scale RCTs
                      </td>
                      <td className="py-3 text-muted text-xs">
                        References being compiled
                      </td>
                    </tr>
                    <tr className="align-top">
                      <td className="py-3 pr-3 font-medium text-ink">L-theanine anxiety / stress evidence</td>
                      <td className="py-3 pr-4 text-muted">
                        Alpha-wave promotion trials; acute stress response studies
                      </td>
                      <td className="py-3 text-muted text-xs">
                        References being compiled
                      </td>
                    </tr>
                    <tr className="align-top">
                      <td className="py-3 pr-3 font-medium text-ink">Magnesium anxiety evidence</td>
                      <td className="py-3 pr-4 text-muted">
                        Boyle et al. 2017 meta-analysis; magnesium deficiency and neuronal excitability studies
                      </td>
                      <td className="py-3 text-muted text-xs">
                        References being compiled
                      </td>
                    </tr>
                    <tr className="align-top">
                      <td className="py-3 pr-3 font-medium text-ink">Passionflower anxiety evidence</td>
                      <td className="py-3 pr-4 text-muted">
                        Pre-procedural anxiety RCTs; GAD comparison trials
                      </td>
                      <td className="py-3 text-muted text-xs">
                        References being compiled
                      </td>
                    </tr>
                    <tr className="align-top">
                      <td className="py-3 pr-3 font-medium text-ink">Kava anxiety evidence</td>
                      <td className="py-3 pr-4 text-muted">
                        Pittler &amp; Ernst meta-analysis; HAM-A outcome RCTs
                      </td>
                      <td className="py-3 text-muted text-xs">
                        References being compiled
                      </td>
                    </tr>
                    <tr className="align-top">
                      <td className="py-3 pr-3 font-medium text-ink">Saffron anxiety evidence</td>
                      <td className="py-3 pr-4 text-muted">
                        Lopresti &amp; Drummond 2014; mood/anxiety overlap RCTs
                      </td>
                      <td className="py-3 text-muted text-xs">
                        References being compiled
                      </td>
                    </tr>
                    <tr className="align-top">
                      <td className="py-3 pr-3 font-medium text-ink">CBD anxiety evidence</td>
                      <td className="py-3 pr-4 text-muted">
                        Blessing et al. 2015 review; social anxiety fMRI studies
                      </td>
                      <td className="py-3 text-muted text-xs">
                        References being compiled
                      </td>
                    </tr>
                    <tr className="align-top">
                      <td className="py-3 pr-3 font-medium text-ink">Safety / interactions evidence</td>
                      <td className="py-3 pr-4 text-muted">
                        Kava hepatotoxicity case series; ashwagandha DILI reports; saffron-SSRI interaction data
                      </td>
                      <td className="py-3 text-muted text-xs">
                        References being compiled
                      </td>
                    </tr>
                  </tbody>
                </table>
              </ResponsiveTable>
            </div>

          </section>

          <RecommendationSection products={getRevenueProductSet('ashwagandha')?.products ?? []} />

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
                ['#deep-dives', 'Deep Dives'],
                ['#ashwagandha', 'Ashwagandha'],
                ['#l-theanine', 'L-Theanine'],
                ['#magnesium', 'Magnesium'],
                ['#passionflower', 'Passionflower'],
                ['#kava', 'Kava'],
                ['#saffron', 'Saffron'],
                ['#decision-framework', 'Which to Try First'],
                ['#what-not-to-do', 'What Not To Do'],
                ['#sleep-overlap', 'Anxiety + Sleep'],
                ['#safety', 'Safety'],
                ['#buyer-guide', 'Where to Buy'],
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

          {/* Anxiety cluster */}
          <div className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted">
              Anxiety cluster
            </p>
            <div className="mt-3 space-y-2">
              <Link
                href="/articles/ashwagandha-for-anxiety"
                className="block text-sm font-medium text-brand-700 hover:text-brand-800 hover:underline"
              >
                Ashwagandha for anxiety →
              </Link>
              <Link
                href="/articles/l-theanine-for-anxiety"
                className="block text-sm font-medium text-brand-700 hover:text-brand-800 hover:underline"
              >
                L-theanine for anxiety →
              </Link>
              <Link
                href="/articles/anxiety-stack-guide"
                className="block text-sm font-medium text-brand-700 hover:text-brand-800 hover:underline"
              >
                Anxiety stack guide →
              </Link>
            </div>
          </div>

          {/* Sleep cluster cross-link */}
          <div className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted">
              Sleep cluster
            </p>
            <div className="mt-3 space-y-2">
              <Link
                href="/articles/best-herbs-for-sleep"
                className="block text-sm font-medium text-brand-700 hover:text-brand-800 hover:underline"
              >
                Best herbs for sleep →
              </Link>
              <Link
                href="/articles/ashwagandha-for-sleep"
                className="block text-sm font-medium text-brand-700 hover:text-brand-800 hover:underline"
              >
                Ashwagandha for sleep →
              </Link>
              <Link
                href="/articles/magnesium-for-sleep"
                className="block text-sm font-medium text-brand-700 hover:text-brand-800 hover:underline"
              >
                Magnesium for sleep →
              </Link>
              <Link
                href="/articles/sleep-stack-guide"
                className="block text-sm font-medium text-brand-700 hover:text-brand-800 hover:underline"
              >
                Sleep stack guide →
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
                href={`https://www.amazon.com/s?k=KSM-66+ashwagandha&tag=${AFFILIATE_TAGS.amazon}`}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="block text-sm font-medium text-brand-700 hover:text-brand-800 hover:underline"
              >
                KSM-66 ashwagandha →
              </a>
              <a
                href={`https://www.amazon.com/s?k=l-theanine+suntheanine&tag=${AFFILIATE_TAGS.amazon}`}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="block text-sm font-medium text-brand-700 hover:text-brand-800 hover:underline"
              >
                L-theanine →
              </a>
              <a
                href={`https://www.amazon.com/s?k=magnesium+glycinate&tag=${AFFILIATE_TAGS.amazon}`}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="block text-sm font-medium text-brand-700 hover:text-brand-800 hover:underline"
              >
                Magnesium glycinate →
              </a>
              <a
                href={`https://www.amazon.com/s?k=passionflower+extract&tag=${AFFILIATE_TAGS.amazon}`}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="block text-sm font-medium text-brand-700 hover:text-brand-800 hover:underline"
              >
                Passionflower →
              </a>
              <a
                href={`https://www.amazon.com/s?k=saffron+extract+supplement&tag=${AFFILIATE_TAGS.amazon}`}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="block text-sm font-medium text-brand-700 hover:text-brand-800 hover:underline"
              >
                Saffron extract →
              </a>
              <a
                href={`https://www.amazon.com/s?k=noble+kava+extract&tag=${AFFILIATE_TAGS.amazon}`}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="block text-sm font-medium text-brand-700 hover:text-brand-800 hover:underline"
              >
                Kava →
              </a>
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
