import Link from 'next/link'
import { buildPageMetadata, blogJsonLd, breadcrumbJsonLd, faqPageJsonLd } from '@/lib/seo'
import EvidenceSummaryCard from '@/components/evidence/EvidenceSummaryCard'
import SafetyNotice from '@/components/evidence/SafetyNotice'
import EmailCapture from '@/components/EmailCapture'
import NewsletterCtaBlock from '@/components/NewsletterCtaBlock'
import LastUpdatedBadge from '@/components/editorial/LastUpdatedBadge'
import ResponsiveTable from '@/components/ui/ResponsiveTable'
import { AFFILIATE_TAGS } from '@/config/affiliate'

// ─── Article metadata ─────────────────────────────────────────────────────────

const SLUG = 'adhd-stack-guide'
const TITLE =
  'ADHD Stack Guide: Evidence-Based Supplement Combinations for Focus, Attention, and Symptom Support'
const DESCRIPTION =
  'Comprehensive evidence-based guide to building supplement stacks for adults with ADHD symptoms. Covers neurobiology foundations, why stacks often fail, medication interactions, tiered protocols (beginner to advanced), subtype considerations, common mistakes, evidence ranking, monitoring strategies, and safety. Not medical advice.'
const DATE = '2026-06-10'
const AUTHOR = 'Will'
const READING_TIME = '20 min read'
const TAGS = ['adhd', 'focus', 'l-theanine', 'magnesium', 'ashwagandha', 'supplement-stack']
const CATEGORY = 'focus-stacks'

export const metadata = buildPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: `/articles/${SLUG}`,
  openGraphType: 'article',
})

// ─── FAQ data (also used for JSON-LD) ────────────────────────────────────────

const FAQS = [
  {
    question: 'How do I know if a stack is actually working?',
    answer:
      'Define 2–3 specific, observable targets in advance, such as minutes of sustained focus on priority tasks, number of emotional dysregulation episodes per week, or sleep onset latency. Track them consistently for a minimum evaluation window before drawing conclusions. Global impressions like "I feel better" are less reliable than concrete metrics.',
  },
  {
    question: 'Can I use these stacks if I take ADHD medication?',
    answer:
      'Potential interactions exist and require professional oversight. Some combinations may add to or counteract medication effects on arousal, sleep, or cardiovascular parameters. Introduce changes one at a time and maintain close communication with your prescriber.',
  },
  {
    question: 'What is the best starting dose?',
    answer:
      'Doses should align with those used in relevant human trials and be adjusted for individual factors such as body weight, tolerance, and concurrent medications. Conservative starting points followed by slow titration under guidance are generally safer than beginning at upper studied ranges.',
  },
  {
    question: 'How long should I try a stack before deciding it does not work?',
    answer:
      'Evaluation periods typically range from 3–8 weeks depending on the agent and goal, allowing time for both acute and cumulative effects while minimizing unnecessary exposure. Pre-defined success and stopping criteria reduce ambiguity.',
  },
  {
    question: 'Are there risks to long-term stacking?',
    answer:
      'Long-term safety data for many combinations are limited. Periodic reassessment, laboratory monitoring when indicated, and openness to deprescribing or simplifying are prudent. Quality and cumulative cost also factor into sustainability decisions.',
  },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ADHDStackGuidePage() {
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
          <span className="text-muted">June 10, 2026</span>
          <span className="text-muted">·</span>
          <span className="text-muted">{READING_TIME}</span>
        </div>

        <h1 className="mt-4 font-display text-3xl font-bold leading-tight tracking-tight text-ink sm:text-4xl lg:text-5xl">
          {TITLE}
        </h1>

        <p className="mt-2 text-sm text-muted">
          By{' '}
          <a href="/about" rel="author" className="font-medium text-ink hover:underline">
            {AUTHOR}
          </a>
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
              Which Stack Tier Should You Start With?
            </h2>
            <ul className="mt-4 space-y-2">
              <li className="flex gap-2 text-[1.01rem] leading-[1.85] text-[#46574d]">
                <span className="mt-1 flex-shrink-0 text-brand-700">▸</span>
                <span>
                  <strong>Beginner approach:</strong> Identify the dominant challenge and choose the
                  single compound with the most directly relevant human data. Evaluate for 3–4 weeks
                  before adding anything.
                </span>
              </li>
              <li className="flex gap-2 text-[1.01rem] leading-[1.85] text-[#46574d]">
                <span className="mt-1 flex-shrink-0 text-brand-700">▸</span>
                <span>
                  <strong>Intermediate approach:</strong> Two complementary agents introduced
                  sequentially—for example, L-theanine (with or without caffeine) during productive
                  hours, plus magnesium in the evening for sleep support.
                </span>
              </li>
              <li className="flex gap-2 text-[1.01rem] leading-[1.85] text-[#46574d]">
                <span className="mt-1 flex-shrink-0 text-brand-700">▸</span>
                <span>
                  <strong>Advanced approach:</strong> Three or more agents with biomarker guidance
                  and close professional oversight—reserved for those who have methodically worked
                  through simpler regimens.
                </span>
              </li>
              <li className="flex gap-2 text-[1.01rem] leading-[1.85] text-[#46574d]">
                <span className="mt-1 flex-shrink-0 text-brand-700">▸</span>
                <span>
                  <strong>Essential principle:</strong> Do not start multiple new supplements at
                  once. Lifestyle foundations—sleep, nutrition, movement, structure—are
                  non-negotiable at every tier.
                </span>
              </li>
            </ul>
            <div className="mt-4 rounded-[0.75rem] border border-amber-300/60 bg-amber-50/60 px-4 py-3 text-sm leading-6 text-[#46574d]">
              <strong className="text-ink">Important:</strong> No supplement diagnoses, treats,
              cures, or prevents ADHD. Consult a qualified healthcare professional before
              initiating, modifying, or combining any supplement regimen, particularly if you take
              ADHD medications or have co-existing medical conditions.
            </div>
          </section>

          {/* Main article body */}
          <section className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8 space-y-8">

            {/* Introduction */}
            <div id="introduction">
              <h2 className="mb-3 text-2xl font-semibold tracking-tight text-ink">
                Introduction
              </h2>
              <p className="text-[1.01rem] leading-[1.85] text-[#46574d]">
                Adults navigating attention, focus, and emotional regulation challenges associated
                with ADHD symptoms frequently explore dietary supplements as potential adjunctive
                supports. While no supplement diagnoses, treats, cures, or prevents ADHD, certain
                compounds have accumulated human clinical data relevant to specific symptoms or
                co-occurring issues such as stress, sleep quality, and nutrient status.
              </p>
              <p className="mt-3 text-[1.01rem] leading-[1.85] text-[#46574d]">
                This guide emphasizes evidence-informed principles for combining
                supplements—commonly called stacking—rather than endorsing any fixed protocol or
                product. The aim is to provide a structured, cautious framework that helps readers
                understand current research limitations, identify plausible synergies and risks, and
                approach stacking with appropriate personalization and oversight.
              </p>
              <p className="mt-3 text-[1.01rem] leading-[1.85] text-[#46574d]">
                This content is strictly informational and does not constitute medical advice. ADHD
                requires professional clinical evaluation. Supplements can interact with prescription
                medications, including stimulants and non-stimulants, influence laboratory values,
                or produce variable effects depending on individual biology. Consult a qualified
                healthcare professional before initiating, modifying, or combining any supplement
                regimen, particularly if you take medications, have co-existing medical conditions,
                or are pregnant or breastfeeding.
              </p>
            </div>

            <hr className="border-brand-900/10" />

            {/* Neurobiology */}
            <div id="neurobiology">
              <h2 className="mb-3 text-2xl font-semibold tracking-tight text-ink">
                ADHD Neurobiology Foundations Relevant to Stacking
              </h2>
              <p className="text-[1.01rem] leading-[1.85] text-[#46574d]">
                ADHD is associated with differences in catecholaminergic signaling, particularly
                dopamine and norepinephrine pathways involved in attention, motivation, reward
                processing, and executive functions such as working memory, inhibitory control, and
                cognitive flexibility. Prefrontal cortex networks and their connections to striatal
                and limbic regions are frequently implicated. Many individuals also experience
                overlapping difficulties with emotional regulation, sleep architecture, and stress
                reactivity, which can amplify core symptoms.
              </p>
              <p className="mt-3 text-[1.01rem] leading-[1.85] text-[#46574d]">
                These neurobiological features help explain why single-target interventions sometimes
                yield incomplete results and why multi-pathway approaches—addressing attention
                networks alongside stress-axis or sleep factors—are conceptually appealing. However,
                translating mechanistic understanding into reliable supplement stacks remains
                challenging because most human trials examine isolated compounds rather than
                combinations, and effect sizes are often modest even in positive studies. Stacking
                decisions should therefore remain anchored in clinical outcome data rather than
                theoretical synergy alone.
              </p>
            </div>

            <hr className="border-brand-900/10" />

            {/* Why stacks fail */}
            <div id="why-stacks-fail">
              <h2 className="mb-3 text-2xl font-semibold tracking-tight text-ink">
                Why Stacks Frequently Underperform or Fail
              </h2>
              <p className="text-[1.01rem] leading-[1.85] text-[#46574d]">
                Many well-intentioned stacks deliver disappointing results for predictable reasons.
                Addressing these pitfalls upfront substantially increases the likelihood that a
                stack will be informative rather than frustrating.
              </p>
              <ul className="mt-3 ml-5 space-y-1.5 list-disc text-[1.01rem] leading-[1.85] text-[#46574d]">
                <li>
                  Absence of baseline assessment, such as confirming magnesium status before
                  supplementation or ruling out primary sleep disorders.
                </li>
                <li>
                  Overlooking foundational lifestyle factors, including inconsistent sleep schedule,
                  high processed-food intake, insufficient physical activity, or chronic unmanaged
                  stress.
                </li>
                <li>
                  Poor product quality or standardization, such as variable withanolide content in
                  ashwagandha extracts or unclear elemental magnesium content.
                </li>
                <li>
                  Starting multiple new agents simultaneously, making it impossible to attribute
                  benefits or adverse effects.
                </li>
                <li>Unrealistic expectations of rapid, dramatic, or universal improvement.</li>
                <li>
                  Ignoring pharmacokinetic or pharmacodynamic interactions with existing
                  medications.
                </li>
                <li>
                  Failure to track specific, measurable outcomes over an adequate evaluation period.
                </li>
              </ul>
            </div>

            <hr className="border-brand-900/10" />

            {/* Medication interactions */}
            {/* TODO: Verify specific documented interaction cases and strength of evidence in primary sources for workbook */}
            <div id="medication-interactions">
              <h2 className="mb-3 text-2xl font-semibold tracking-tight text-ink">
                Medication Interaction Considerations
              </h2>
              <p className="text-[1.01rem] leading-[1.85] text-[#46574d]">
                Prescription ADHD treatments—including stimulants such as methylphenidate or
                amphetamine salts and non-stimulants such as atomoxetine or guanfacine—carry their
                own cardiovascular, sleep, and appetite effects. Adding supplements can produce
                additive or opposing actions.
              </p>
              <p className="mt-3 text-[1.01rem] leading-[1.85] text-[#46574d]">
                L-theanine combined with caffeine has been studied in ADHD populations, but adding
                it to prescribed stimulants may increase overall stimulation or jitter in sensitive
                individuals. Magnesium can theoretically influence absorption of certain antibiotics
                or interact with medications affecting cardiac conduction. Ashwagandha has been
                associated with changes in thyroid parameters in some reports and may have additive
                effects with sedating agents.
              </p>
              <p className="mt-3 text-[1.01rem] leading-[1.85] text-[#46574d]">
                CYP enzyme modulation by certain herbal extracts can alter metabolism of psychiatric
                medications, although clinical significance varies. Because high-quality interaction
                studies in ADHD populations are scarce, the prudent approach is conservative:
                introduce one supplement at a time, monitor blood pressure, heart rate, sleep, mood,
                and medication efficacy closely, and maintain open communication with the prescribing
                clinician.
              </p>
              <div className="mt-4 rounded-[0.75rem] border border-brand-900/10 bg-brand-50/60 p-4 text-sm leading-7 text-[#46574d]">
                <p className="font-semibold text-ink">Before adding any supplement:</p>
                <ol className="mt-2 ml-5 space-y-1 list-decimal">
                  <li>Disclose all current medications and supplements to your prescriber.</li>
                  <li>Introduce one new supplement at a time with at least 2–3 weeks between additions.</li>
                  <li>
                    Monitor cardiovascular parameters (blood pressure, heart rate), sleep quality,
                    mood, and medication efficacy.
                  </li>
                  <li>
                    Consider laboratory monitoring (e.g., magnesium levels, thyroid function) where
                    clinically indicated.
                  </li>
                </ol>
              </div>
            </div>

            <hr className="border-brand-900/10" />

            {/* Beginner stack */}
            <div id="beginner-stack">
              <h2 className="mb-3 text-2xl font-semibold tracking-tight text-ink">
                Beginner Stack Approach
              </h2>
              <p className="text-[1.01rem] leading-[1.85] text-[#46574d]">
                A beginner approach prioritizes simplicity, the strongest single-agent evidence
                relevant to the primary complaint, and clear evaluation criteria before adding
                complexity.
              </p>

              <h3 className="mt-5 mb-1 text-xl font-semibold tracking-tight text-ink">
                Framework
              </h3>
              <ul className="mt-2 ml-5 space-y-1.5 list-disc text-[1.01rem] leading-[1.85] text-[#46574d]">
                <li>
                  Identify the dominant challenge—sustained attention during work, evening emotional
                  dysregulation, or sleep onset.
                </li>
                <li>
                  Select the compound with the most directly relevant human data for that domain and
                  the most favorable short-term safety profile.
                </li>
                <li>
                  Use a standardized, third-party tested product at a dose drawn from existing
                  trials.
                </li>
                <li>
                  Maintain consistent timing relative to meals or caffeine intake.
                </li>
                <li>
                  Track 2–3 specific metrics daily for at least 3–4 weeks before deciding whether
                  to continue, adjust, or add a second agent.
                </li>
              </ul>
              <p className="mt-3 text-[1.01rem] leading-[1.85] text-[#46574d]">
                This tier minimizes variables, reduces risk of adverse effects or interactions, and
                builds personal data on individual responsiveness. Lifestyle foundations—including
                sleep hygiene, protein-rich meals, movement, and external structure—remain
                non-negotiable at every tier.
              </p>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm">
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted">
                    Beginner Option — Attention Focus
                  </p>
                  <p className="font-semibold text-ink">L-Theanine (with or without caffeine)</p>
                  <p className="mt-1 text-xs leading-5 text-[#46574d]">
                    Best studied in ADHD populations for attention support. If combining with
                    caffeine, use modest doses and monitor stimulation closely—especially if on
                    prescription stimulants.
                  </p>
                  <a
                    href={`https://www.amazon.com/s?k=l-theanine+focus+third+party+tested&tag=${AFFILIATE_TAGS.amazon}`}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    className="mt-3 inline-flex items-center gap-1 rounded-full bg-brand-950 px-4 py-1.5 text-xs font-bold text-white transition hover:bg-brand-900"
                  >
                    View on Amazon →
                  </a>
                </div>
                <div className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm">
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted">
                    Beginner Option — Sleep / Calm
                  </p>
                  <p className="font-semibold text-ink">Magnesium Glycinate (evening)</p>
                  <p className="mt-1 text-xs leading-5 text-[#46574d]">
                    Well-tolerated starting point when sleep quality or physical tension is the
                    dominant complaint. Check elemental magnesium content on the supplement facts
                    panel.
                  </p>
                  <a
                    href={`https://www.amazon.com/s?k=magnesium+glycinate+third+party+tested&tag=${AFFILIATE_TAGS.amazon}`}
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

            {/* Intermediate stack */}
            <div id="intermediate-stack">
              <h2 className="mb-3 text-2xl font-semibold tracking-tight text-ink">
                Intermediate Stack Approach
              </h2>
              <p className="text-[1.01rem] leading-[1.85] text-[#46574d]">
                An intermediate approach typically involves two complementary agents chosen to
                address distinct but related pathways, introduced sequentially after successful
                evaluation of the first.
              </p>

              <h3 className="mt-5 mb-1 text-xl font-semibold tracking-tight text-ink">
                Example Pattern
              </h3>
              <p className="text-[1.01rem] leading-[1.85] text-[#46574d]">
                L-theanine, with or without a modest caffeine dose, for attention and calm during
                productive hours—paired with magnesium in the evening for sleep architecture and
                muscle relaxation when low status or tension is suspected. Each addition follows a
                documented assessment period with tracked outcomes. Dosing remains conservative and
                aligned with studied ranges.
              </p>
              <p className="mt-3 text-[1.01rem] leading-[1.85] text-[#46574d]">
                This tier suits individuals who have already established that single-agent support is
                insufficient and who can reliably monitor and adjust based on data rather than
                expectation.
              </p>
              <ul className="mt-3 ml-5 space-y-1.5 list-disc text-[1.01rem] leading-[1.85] text-[#46574d]">
                <li>
                  Product quality and timing consistency receive heightened attention at this tier
                  because interactions between agents become possible.
                </li>
                <li>
                  Maintain a consistent evaluation log capturing focus duration, sleep metrics,
                  mood, and any side effects.
                </li>
                <li>
                  Do not add a second agent before completing at least 3–4 weeks on the first.
                </li>
              </ul>

              <div className="mt-5 rounded-[1rem] border border-brand-900/10 bg-brand-50/60 p-4 text-sm leading-7 text-[#46574d]">
                <p className="font-semibold text-ink">Intermediate stack — introduce one at a time:</p>
                <ol className="mt-2 ml-5 space-y-1 list-decimal">
                  <li>
                    Start L-theanine (± modest caffeine if tolerated). Trial for 3–4 weeks, tracking
                    focus and any stimulation effects.
                  </li>
                  <li>
                    If sleep quality or evening tension is a secondary concern—add magnesium
                    glycinate in the evening after confirming first-agent response.
                  </li>
                </ol>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm">
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted">
                    Intermediate Stack — Daytime
                  </p>
                  <p className="font-semibold text-ink">L-Theanine (± Caffeine)</p>
                  <p className="mt-1 text-xs leading-5 text-[#46574d]">
                    Attention and calm focus. If on prescription stimulants, introduce L-theanine
                    alone first to assess added stimulation risk before combining with caffeine.
                  </p>
                  <a
                    href={`https://www.amazon.com/s?k=l-theanine+caffeine+focus+stack&tag=${AFFILIATE_TAGS.amazon}`}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    className="mt-3 inline-flex items-center gap-1 rounded-full bg-brand-950 px-4 py-1.5 text-xs font-bold text-white transition hover:bg-brand-900"
                  >
                    View on Amazon →
                  </a>
                </div>
                <div className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm">
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted">
                    Intermediate Stack — Evening
                  </p>
                  <p className="font-semibold text-ink">Magnesium Glycinate</p>
                  <p className="mt-1 text-xs leading-5 text-[#46574d]">
                    Sleep architecture and physical relaxation. Well-tolerated form with low GI
                    impact. Check elemental magnesium content—not total compound weight—on the label.
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
            </div>

            <hr className="border-brand-900/10" />

            {/* Advanced stack */}
            <div id="advanced-stack">
              <h2 className="mb-3 text-2xl font-semibold tracking-tight text-ink">
                Advanced Stack Approach
              </h2>
              <p className="text-[1.01rem] leading-[1.85] text-[#46574d]">
                Advanced stacking involves three or more agents, more nuanced timing (such as
                cycling or situational use), biomarker guidance where available, and tighter
                integration with professional oversight. It is generally reserved for those who have
                methodically worked through simpler regimens without adequate benefit and who possess
                strong self-monitoring systems or clinical support.
              </p>
              <p className="mt-3 text-[1.01rem] leading-[1.85] text-[#46574d]">
                Example considerations might include layering an adaptogen such as ashwagandha for
                stress reactivity alongside an attention-focused pair, while monitoring thyroid
                parameters and overall symptom load. Advanced users also tend to pay closer attention
                to extract standardization, cumulative cost, and periodic reassessment or washout
                periods to evaluate ongoing need.
              </p>
              <p className="mt-3 text-[1.01rem] leading-[1.85] text-[#46574d]">
                Even at this tier, the principle of minimal effective complexity applies: adding
                agents solely because they are available increases risk without proportional benefit.
              </p>

              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                <div className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm">
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted">
                    Advanced Stack — Attention
                  </p>
                  <p className="font-semibold text-ink">L-Theanine ± Caffeine</p>
                  <p className="mt-1 text-xs leading-5 text-[#46574d]">
                    Daytime attention and calm focus. Dose relative to studied ranges. Avoid if on
                    stimulant medication without prescriber approval.
                  </p>
                  <a
                    href={`https://www.amazon.com/s?k=l-theanine+focus+adhd&tag=${AFFILIATE_TAGS.amazon}`}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    className="mt-3 inline-flex items-center gap-1 rounded-full bg-brand-950 px-4 py-1.5 text-xs font-bold text-white transition hover:bg-brand-900"
                  >
                    View on Amazon →
                  </a>
                </div>
                <div className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm">
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted">
                    Advanced Stack — Sleep Support
                  </p>
                  <p className="font-semibold text-ink">Magnesium Glycinate</p>
                  <p className="mt-1 text-xs leading-5 text-[#46574d]">
                    Evening use for sleep architecture and physical relaxation. Reduces restlessness
                    that can amplify ADHD symptoms.
                  </p>
                  <a
                    href={`https://www.amazon.com/s?k=magnesium+glycinate+adhd+sleep&tag=${AFFILIATE_TAGS.amazon}`}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    className="mt-3 inline-flex items-center gap-1 rounded-full bg-brand-950 px-4 py-1.5 text-xs font-bold text-white transition hover:bg-brand-900"
                  >
                    View on Amazon →
                  </a>
                </div>
                <div className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm">
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted">
                    Advanced Stack — Stress Axis
                  </p>
                  <p className="font-semibold text-ink">Ashwagandha (KSM-66 or Sensoril)</p>
                  <p className="mt-1 text-xs leading-5 text-[#46574d]">
                    For stress reactivity that amplifies focus and emotional regulation difficulties.
                    Monitor thyroid parameters. Requires 6–8 weeks of consistent use.
                  </p>
                  <a
                    href={`https://www.amazon.com/s?k=KSM-66+ashwagandha+stress+adhd&tag=${AFFILIATE_TAGS.amazon}`}
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

            {/* Subtype considerations */}
            <div id="subtype-considerations">
              <h2 className="mb-3 text-2xl font-semibold tracking-tight text-ink">
                ADHD Subtype Considerations
              </h2>
              <p className="text-[1.01rem] leading-[1.85] text-[#46574d]">
                ADHD presentations differ. Inattentive features often emphasize difficulties with
                sustained focus, working memory, and organization. Combined or hyperactive-impulsive
                presentations may feature more prominent emotional dysregulation, restlessness, or
                impulsivity. Co-occurring anxiety or sleep disturbance is common across subtypes and
                can amplify core symptoms.
              </p>

              <h3 className="mt-5 mb-1 text-xl font-semibold tracking-tight text-ink">
                Subtype-Informed Starting Points
              </h3>
              <ul className="mt-2 ml-5 space-y-1.5 list-disc text-[1.01rem] leading-[1.85] text-[#46574d]">
                <li>
                  <strong>Primarily inattentive:</strong> Attention-focused combinations such as
                  L-theanine with caffeine where tolerated may receive earlier consideration.
                </li>
                <li>
                  <strong>Anxiety or sleep co-occurring:</strong> Calming or stress-modulating agents
                  such as L-theanine, magnesium, and ashwagandha may be explored more readily when
                  anxiety or sleep issues predominate.
                </li>
                <li>
                  <strong>Hyperactive-impulsive features:</strong> Agents supporting emotional
                  regulation and physical calm (magnesium, ashwagandha) may be prioritized alongside
                  attention support.
                </li>
              </ul>
              <p className="mt-3 text-[1.01rem] leading-[1.85] text-[#46574d]">
                These distinctions are probabilistic rather than prescriptive; individual response
                data ultimately guide decisions more than subtype labels. Professional assessment
                remains essential because overlapping conditions—including anxiety disorders, sleep
                apnea, and mood disorders—require targeted management beyond supplementation.
              </p>
            </div>

            <hr className="border-brand-900/10" />

            {/* Stack comparison table */}
            <div id="stack-comparison">
              <h2 className="mb-4 text-2xl font-semibold tracking-tight text-ink">
                Stack Comparison Table
              </h2>
              <p className="mb-4 text-[1.01rem] leading-[1.85] text-[#46574d]">
                Use this table to match your primary challenge and readiness level to the appropriate
                starting tier.
              </p>

              <ResponsiveTable label="ADHD stack comparison by tier, use case, and complexity">
                <table className="min-w-[680px] w-full text-sm">
                  <thead>
                    <tr className="border-b border-brand-900/10">
                      <th className="pb-2 pr-4 text-left text-xs font-bold uppercase tracking-wider text-muted">
                        Tier
                      </th>
                      <th className="pb-2 pr-4 text-left text-xs font-bold uppercase tracking-wider text-muted">
                        Agents
                      </th>
                      <th className="pb-2 pr-4 text-left text-xs font-bold uppercase tracking-wider text-muted">
                        Best For
                      </th>
                      <th className="pb-2 pr-4 text-left text-xs font-bold uppercase tracking-wider text-muted">
                        Complexity
                      </th>
                      <th className="pb-2 text-left text-xs font-bold uppercase tracking-wider text-muted">
                        Key Caution
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-900/5">
                    <tr className="align-top">
                      <td className="py-3 pr-4 font-medium text-ink">Beginner</td>
                      <td className="py-3 pr-4 text-[#46574d]">
                        Single agent (L-theanine or magnesium)
                      </td>
                      <td className="py-3 pr-4 text-[#46574d]">
                        First supplement trial; one dominant complaint
                      </td>
                      <td className="py-3 pr-4 text-[#46574d]">Very low</td>
                      <td className="py-3 text-[#46574d]">
                        Evaluate for 3–4 weeks before adding anything
                      </td>
                    </tr>
                    <tr className="align-top">
                      <td className="py-3 pr-4 font-medium text-ink">Intermediate</td>
                      <td className="py-3 pr-4 text-[#46574d]">
                        L-theanine ± caffeine + magnesium (sequential)
                      </td>
                      <td className="py-3 pr-4 text-[#46574d]">
                        Attention during day + sleep at night; single-agent insufficient
                      </td>
                      <td className="py-3 pr-4 text-[#46574d]">Low–Moderate</td>
                      <td className="py-3 text-[#46574d]">
                        Monitor interaction with stimulant medications
                      </td>
                    </tr>
                    <tr className="align-top">
                      <td className="py-3 pr-4 font-medium text-ink">Advanced</td>
                      <td className="py-3 pr-4 text-[#46574d]">
                        L-theanine + magnesium + ashwagandha (sequential)
                      </td>
                      <td className="py-3 pr-4 text-[#46574d]">
                        Attention + sleep + stress axis; prior tiers insufficient
                      </td>
                      <td className="py-3 pr-4 text-[#46574d]">Moderate–High</td>
                      <td className="py-3 text-[#46574d]">
                        Thyroid monitoring; professional oversight required
                      </td>
                    </tr>
                    <tr className="align-top">
                      <td className="py-3 pr-4 font-medium text-ink text-red-700">Avoid</td>
                      <td className="py-3 pr-4 text-[#46574d]">
                        Multiple stimulating agents + prescription stimulants without guidance
                      </td>
                      <td className="py-3 pr-4 text-[#46574d]">—</td>
                      <td className="py-3 pr-4 text-[#46574d]">—</td>
                      <td className="py-3 text-[#46574d]">
                        Additive cardiovascular / CNS stimulation risk
                      </td>
                    </tr>
                  </tbody>
                </table>
              </ResponsiveTable>
            </div>

            <hr className="border-brand-900/10" />

            {/* Common mistakes */}
            <div id="common-mistakes">
              <h2 className="mb-3 text-2xl font-semibold tracking-tight text-ink">
                Common Mistakes to Avoid
              </h2>
              <ul className="ml-5 space-y-1.5 list-disc text-[1.01rem] leading-[1.85] text-[#46574d]">
                <li>
                  Treating stacking as a substitute for addressing sleep, nutrition, or untreated
                  co-occurring conditions.
                </li>
                <li>Introducing multiple agents simultaneously.</li>
                <li>Neglecting product quality and third-party testing.</li>
                <li>Expecting rapid or complete resolution of symptoms.</li>
                <li>Failing to define and track concrete outcome measures.</li>
                <li>Continuing agents indefinitely without periodic reassessment.</li>
                <li>
                  Under-communicating with prescribing clinicians about all supplements in use.
                </li>
                <li>
                  Over-attributing causality—improvements or setbacks may stem from concurrent life
                  changes rather than the stack itself.
                </li>
              </ul>
            </div>

            <hr className="border-brand-900/10" />

            {/* Evidence ranking */}
            {/* TODO: Formalize evidence grades with specific study quality assessments and effect-size details in workbook */}
            <div id="evidence-ranking">
              <h2 className="mb-3 text-2xl font-semibold tracking-tight text-ink">
                Evidence Ranking for Cluster Compounds
              </h2>
              <p className="text-[1.01rem] leading-[1.85] text-[#46574d]">
                Human clinical evidence strength varies across the compounds referenced in this
                cluster. A practical ranking for decision-making places higher weight on compounds
                with replicated human outcome data in relevant populations, lower heterogeneity, and
                clearer safety profiles in the context of ADHD or common comorbidities.
              </p>
              <p className="mt-3 text-[1.01rem] leading-[1.85] text-[#46574d]">
                All rankings carry the caveat that &ldquo;limited but promising&rdquo; evidence does
                not equal proven efficacy, and absence of strong data for a compound does not prove
                ineffectiveness—only that more research is needed.
              </p>

              <div className="mt-5">
                <EvidenceSummaryCard
                  title="ADHD Stack — Combined Evidence Overview"
                  evidenceLevel="Limited"
                  humanEvidence="Magnesium has relatively consistent observational data linking lower status to ADHD plus some supportive supplementation trials, particularly when combined with vitamin D. L-theanine possesses promising but still limited RCT data in pediatric ADHD populations, especially in combination with caffeine (2020 RCT in boys with ADHD; 2024 systematic review). Ashwagandha shows stronger data for stress and anxiety reduction with only very preliminary, small-scale signals in ADHD contexts. Direct head-to-head or multi-ingredient stack trials remain scarce across all agents."
                  mechanisticEvidence="ADHD involves catecholaminergic signaling differences (dopamine, norepinephrine) in prefrontal and striatal networks. L-theanine promotes alpha-wave activity and may support inhibitory control. Magnesium modulates NMDA receptor function and is involved in sleep architecture. Ashwagandha modulates the HPA axis and reduces cortisol over weeks. The three mechanisms are conceptually complementary but clinical stack combination trials are absent."
                  safetyProfile="Each compound has an individually acceptable safety profile at studied doses in healthy adults. L-theanine: well tolerated; monitor for additive stimulation with prescription stimulants. Magnesium: GI tolerability concerns at high doses; caution with kidney disease. Ashwagandha: thyroid and autoimmune considerations; avoid in pregnancy. Combination safety data are very limited. Children, adolescents, and those on psychiatric medications require professional oversight."
                />
              </div>

              {/* Evidence summary table */}
              <div className="mt-6">
                <ResponsiveTable label="ADHD cluster compounds evidence summary">
                  <table className="min-w-[780px] w-full text-sm">
                    <thead>
                      <tr className="border-b border-brand-900/10">
                        <th className="pb-2 pr-4 text-left text-xs font-bold uppercase tracking-wider text-muted">
                          Compound
                        </th>
                        <th className="pb-2 pr-4 text-left text-xs font-bold uppercase tracking-wider text-muted">
                          Primary Potential Benefit in ADHD Context
                        </th>
                        <th className="pb-2 pr-4 text-left text-xs font-bold uppercase tracking-wider text-muted">
                          Key Supporting Evidence
                        </th>
                        <th className="pb-2 pr-4 text-left text-xs font-bold uppercase tracking-wider text-muted">
                          Limitations &amp; Notes
                        </th>
                        <th className="pb-2 pr-4 text-left text-xs font-bold uppercase tracking-wider text-muted">
                          Studied Doses
                        </th>
                        <th className="pb-2 text-left text-xs font-bold uppercase tracking-wider text-muted">
                          Related Article
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-900/5">
                      <tr className="align-top">
                        <td className="py-3 pr-4 font-medium text-ink">L-Theanine</td>
                        <td className="py-3 pr-4 text-[#46574d]">
                          Attention, inhibitory control, psychiatric symptom reduction
                        </td>
                        <td className="py-3 pr-4 text-[#46574d]">
                          2020 RCT in boys with ADHD (L-theanine ± caffeine); 2024 systematic review
                        </td>
                        <td className="py-3 pr-4 text-[#46574d]">
                          Small samples; limited adult data; combination often studied with caffeine
                        </td>
                        {/* TODO: Workbook verification required for dose ranges */}
                        <td className="py-3 pr-4 text-muted">
                          Pending workbook verification
                        </td>
                        <td className="py-3 text-[#46574d]">
                          <Link href="/articles/l-theanine-for-adhd" className="font-semibold text-brand-700 hover:text-brand-800 hover:underline">
                            L-Theanine for ADHD
                          </Link>
                        </td>
                      </tr>
                      <tr className="align-top">
                        <td className="py-3 pr-4 font-medium text-ink">Magnesium</td>
                        <td className="py-3 pr-4 text-[#46574d]">
                          Addressing documented lower status; possible support for conduct, anxiety,
                          sleep
                        </td>
                        <td className="py-3 pr-4 text-[#46574d]">
                          2019 meta-analysis (lower levels in ADHD); 2020 RCT (Mg + Vit D)
                        </td>
                        <td className="py-3 pr-4 text-[#46574d]">
                          Heterogeneity; best when status low; not core monotherapy
                        </td>
                        {/* TODO: Workbook verification required for dose ranges */}
                        <td className="py-3 pr-4 text-muted">
                          Pending workbook verification
                        </td>
                        <td className="py-3 text-[#46574d]">
                          <Link href="/articles/magnesium-for-adhd" className="font-semibold text-brand-700 hover:text-brand-800 hover:underline">
                            Magnesium for ADHD
                          </Link>
                        </td>
                      </tr>
                      <tr className="align-top">
                        <td className="py-3 pr-4 font-medium text-ink">Ashwagandha</td>
                        <td className="py-3 pr-4 text-[#46574d]">
                          Stress/anxiety reduction that may secondarily aid focus and emotional
                          regulation
                        </td>
                        <td className="py-3 pr-4 text-[#46574d]">
                          Small RCT in children with ADHD + anxiety; broader stress/anxiety reviews
                        </td>
                        <td className="py-3 pr-4 text-[#46574d]">
                          Very limited direct ADHD trials; caution in interpretation
                        </td>
                        {/* TODO: Workbook verification required for dose ranges */}
                        <td className="py-3 pr-4 text-muted">
                          Pending workbook verification
                        </td>
                        <td className="py-3 text-[#46574d]">
                          <Link href="/articles/ashwagandha-for-adhd" className="font-semibold text-brand-700 hover:text-brand-800 hover:underline">
                            Ashwagandha for ADHD
                          </Link>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </ResponsiveTable>
                <p className="mt-3 text-xs text-muted">
                  Dose ranges require workbook verification before publication. See individual
                  compound articles for full evidence reviews once available.
                </p>
              </div>
            </div>

            <hr className="border-brand-900/10" />

            {/* Monitoring */}
            <div id="monitoring">
              <h2 className="mb-3 text-2xl font-semibold tracking-tight text-ink">
                Monitoring and Tracking Strategies
              </h2>
              <p className="text-[1.01rem] leading-[1.85] text-[#46574d]">
                Effective stacking requires systematic observation. Useful approaches include daily
                brief journals capturing focus duration during key tasks, sleep latency and quality,
                emotional regulation incidents, and any side effects. Validated symptom scales, when
                appropriate and under clinical guidance, can provide more structured data. For
                nutrients such as magnesium, repeat laboratory assessment after a defined
                supplementation period may be informative if baseline deficiency was documented.
              </p>

              <h3 className="mt-5 mb-1 text-xl font-semibold tracking-tight text-ink">
                Go / No-Go Criteria
              </h3>
              <p className="text-[1.01rem] leading-[1.85] text-[#46574d]">
                Establish clear go/no-go criteria before starting: what specific improvement would
                justify continuation, and what adverse change would prompt discontinuation or medical
                consultation? Schedule periodic reviews—every 4–8 weeks—to decide whether to
                maintain, adjust, add, or taper components.
              </p>
              <ul className="mt-3 ml-5 space-y-1.5 list-disc text-[1.01rem] leading-[1.85] text-[#46574d]">
                <li>
                  Track 2–3 specific metrics daily: for example, minutes of sustained focus on
                  priority tasks, number of emotional regulation incidents per week, sleep onset
                  latency.
                </li>
                <li>
                  Use a consistent evaluation window before drawing conclusions—minimum 3–4 weeks
                  for most agents; 6–8 weeks for ashwagandha.
                </li>
                <li>
                  Tracking helps distinguish true effects from placebo, regression to the mean, or
                  concurrent lifestyle shifts.
                </li>
              </ul>
            </div>

            <hr className="border-brand-900/10" />

            {/* Safety */}
            <div id="safety">
              <h2 className="mb-4 text-2xl font-semibold tracking-tight text-ink">
                Safety, Quality, and Special Populations
              </h2>
              <SafetyNotice title="Safety Considerations — ADHD Stack Guide">
                <ul className="ml-5 space-y-1.5 list-disc">
                  <li>
                    <strong>Medication interactions:</strong> Combining supplements with prescription
                    stimulants or non-stimulants carries real additive or opposing risk. Consult your
                    prescriber before any change.
                  </li>
                  <li>
                    <strong>Gastrointestinal tolerability:</strong> Magnesium at higher doses
                    commonly causes GI effects including loose stools. Start low and titrate.
                  </li>
                  <li>
                    <strong>Thyroid parameters:</strong> Ashwagandha has been associated with
                    thyroid hormone changes in some reports. Monitor thyroid function if relevant,
                    especially with longer use.
                  </li>
                  <li>
                    <strong>Standardized extracts:</strong> Third-party testing for heavy metals,
                    microbes, and label accuracy is especially relevant for products intended for
                    daily use. Verify withanolide content for ashwagandha.
                  </li>
                  <li>
                    <strong>Special populations requiring extra caution:</strong> Children,
                    adolescents, older adults, and individuals with hepatic, renal, thyroid, or
                    cardiovascular conditions. All require additional caution and professional
                    oversight.
                  </li>
                  <li>
                    <strong>Pregnancy and breastfeeding:</strong> Insufficient safety data for most
                    of these supplements—consult a clinician.
                  </li>
                  <li>
                    <strong>Long-term combinations:</strong> Long-term safety data for many
                    combinations are limited. Periodic reassessment and openness to simplifying are
                    prudent.
                  </li>
                </ul>
              </SafetyNotice>
            </div>

            <hr className="border-brand-900/10" />

            {/* Research gaps */}
            <div id="research-gaps">
              <h2 className="mb-3 text-2xl font-semibold tracking-tight text-ink">
                Research Gaps and Realistic Expectations
              </h2>
              <p className="text-[1.01rem] leading-[1.85] text-[#46574d]">
                High-quality, adequately powered, long-duration randomized trials of specific
                multi-ingredient stacks in well-phenotyped ADHD populations—adults and
                children—are largely absent. Most available data derive from single-compound studies,
                short durations, or populations without confirmed ADHD diagnoses. Heterogeneity in
                extract composition, baseline nutrient status, outcome measures, and
                co-interventions complicates synthesis.
              </p>
              <p className="mt-3 text-[1.01rem] leading-[1.85] text-[#46574d]">
                Future studies would benefit from pragmatic designs that reflect real-world
                medication co-use, biomarker stratification, and functional outcomes important to
                patients.
              </p>
              <p className="mt-3 text-[1.01rem] leading-[1.85] text-[#46574d]">
                Current evidence supports cautious, individualized exploration of certain compounds
                as potential adjunctive supports for selected symptoms, but does not support strong
                efficacy claims for ADHD itself or for any particular stack as a broadly applicable
                solution. The most reliable path forward combines professional clinical care,
                foundational lifestyle optimization, and measured, monitored use of supplements
                where preliminary data and personal response justify continued evaluation.
              </p>
            </div>

            <hr className="border-brand-900/10" />

            {/* Conclusions */}
            <div id="conclusions">
              <h2 className="mb-3 text-2xl font-semibold tracking-tight text-ink">
                Conclusions
              </h2>
              <p className="text-[1.01rem] leading-[1.85] text-[#46574d]">
                An evidence-based ADHD stack guide rests on neurobiological plausibility tempered
                by rigorous outcome data, clear principles for minimizing variables and risk, tiered
                complexity matched to individual readiness and monitoring capacity, and explicit
                recognition of current research limitations. L-theanine, with or without caffeine,
                magnesium, and ashwagandha each carry preliminary signals relevant to focus, calm,
                stress, or sleep domains—yet none replaces established ADHD care.
              </p>
              <p className="mt-3 text-[1.01rem] leading-[1.85] text-[#46574d]">
                Thoughtful combinations may offer advantages for some individuals when built
                sequentially, tracked systematically, and integrated with professional guidance.
                Readers seeking deeper examination of individual compounds are directed to the
                related articles in this cluster. Revisit decisions regularly with a clinician as
                personal data and the broader evidence base evolve.
              </p>
              <p className="mt-3 text-[1.01rem] leading-[1.85] text-[#46574d]">
                For related stacking frameworks, see the{' '}
                <Link
                  href="/articles/anxiety-stack-guide"
                  className="font-semibold text-brand-700 hover:text-brand-800 hover:underline"
                >
                  Anxiety Stack Guide
                </Link>{' '}
                and{' '}
                <Link
                  href="/articles/sleep-stack-guide"
                  className="font-semibold text-brand-700 hover:text-brand-800 hover:underline"
                >
                  Sleep Stack Guide
                </Link>
                .
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
                    <p className="mt-2 text-sm leading-7 text-[#46574d]">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>

            <hr className="border-brand-900/10" />

            {/* Related articles */}
            <div id="related-articles">
              <h2 className="mb-4 text-2xl font-semibold tracking-tight text-ink">
                Related Articles
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {/* Future placeholders */}
                <Link
                  href="/articles/l-theanine-for-adhd"
                  className="group rounded-[0.75rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm transition hover:border-brand-700/30"
                >
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted">
                    Focus Cluster
                  </p>
                  <p className="font-semibold text-ink transition group-hover:text-brand-700">
                    L-Theanine for ADHD
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    Expanded analysis of the pediatric RCT, mechanisms, dosing, and comparison
                    with caffeine-containing protocols.
                  </p>
                </Link>
                <Link
                  href="/articles/magnesium-for-adhd"
                  className="group rounded-[0.75rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm transition hover:border-brand-700/30"
                >
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted">
                    Focus Cluster
                  </p>
                  <p className="font-semibold text-ink transition group-hover:text-brand-700">
                    Magnesium for ADHD
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    Deficiency prevalence, supplementation trial outcomes, different chemical forms,
                    and practical integration.
                  </p>
                </Link>
                <Link
                  href="/articles/ashwagandha-for-adhd"
                  className="group rounded-[0.75rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm transition hover:border-brand-700/30"
                >
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted">
                    Focus Cluster
                  </p>
                  <p className="font-semibold text-ink transition group-hover:text-brand-700">
                    Ashwagandha for ADHD
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    Stress-axis and anxiety pathways, the limited direct ADHD evidence base,
                    standardization, and monitoring.
                  </p>
                </Link>
                <div className="rounded-[0.75rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm opacity-70">
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted">
                    Focus Cluster — Coming Soon
                  </p>
                  <p className="font-semibold text-ink">Best Supplements for ADHD</p>
                  <p className="mt-1 text-xs text-muted">
                    Broader comparative overview of multiple options ranked by evidence strength
                    across symptom domains.
                  </p>
                </div>
                <div className="rounded-[0.75rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm opacity-70">
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted">
                    Focus Cluster — Coming Soon
                  </p>
                  <p className="font-semibold text-ink">L-Theanine vs Caffeine for Focus</p>
                  <p className="mt-1 text-xs text-muted">
                    Head-to-head and combination data for ADHD populations, jitter reduction, and
                    practical timing protocols.
                  </p>
                </div>
                <div className="rounded-[0.75rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm opacity-70">
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted">
                    Focus Cluster — Coming Soon
                  </p>
                  <p className="font-semibold text-ink">Citicoline vs Alpha-GPC</p>
                  <p className="mt-1 text-xs text-muted">
                    Cholinergic pathway support options sometimes considered in focus-oriented stacks
                    with comparative attention evidence.
                  </p>
                </div>
                {/* Existing articles */}
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
                    Alpha-wave evidence, dosage, safety, and how L-theanine addresses the sleep
                    disruption that amplifies ADHD symptoms.
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
                    Full evidence review: mechanisms, forms, dosage, and safety.
                  </p>
                </Link>
                <Link
                  href="/articles/ashwagandha-for-anxiety"
                  className="group rounded-[0.75rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm transition hover:border-brand-700/30"
                >
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted">
                    Anxiety Cluster
                  </p>
                  <p className="font-semibold text-ink transition group-hover:text-brand-700">
                    Ashwagandha for Anxiety
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    Stress-reduction evidence relevant to ADHD co-occurring anxiety.
                  </p>
                </Link>
                <Link
                  href="/articles/anxiety-stack-guide"
                  className="group rounded-[0.75rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm transition hover:border-brand-700/30"
                >
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted">
                    Anxiety Cluster
                  </p>
                  <p className="font-semibold text-ink transition group-hover:text-brand-700">
                    Anxiety Stack Guide
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    Stacking frameworks for co-occurring anxiety using ashwagandha, L-theanine, and
                    magnesium.
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
                    Evidence-based overview for anxiety symptoms that commonly co-occur with ADHD.
                  </p>
                </Link>
              </div>
            </div>

            <hr className="border-brand-900/10" />

            {/* Sources */}
            {/* TODO: Verify specific documented interaction cases and strength of evidence in primary sources for workbook */}
            {/* TODO: Formalize evidence grades with specific study quality assessments and effect-size details in workbook */}
            {/* TODO: Add exact PMIDs for L-theanine ADHD RCTs (2020 pediatric RCT; 2024 systematic review) from workbook */}
            {/* TODO: Add exact PMIDs for magnesium ADHD meta-analysis (2019) and RCT (Mg + Vit D, 2020) from workbook */}
            {/* TODO: Add exact PMIDs for ashwagandha ADHD + anxiety RCT from workbook */}
            {/* TODO: Add safety citations for medication interaction data once workbook verification complete */}
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
                        L-theanine ± caffeine in boys with ADHD — attention and inhibitory control
                        outcomes
                      </td>
                      <td className="py-3 pr-4 text-muted">—</td>
                      <td className="py-3 pr-4 text-muted">2020</td>
                      <td className="py-3 text-muted">
                        {/* TODO: Add exact PMID for 2020 pediatric ADHD RCT from workbook */}
                        PMID pending
                      </td>
                    </tr>
                    <tr className="align-top">
                      <td className="py-3 pr-3 text-muted">2</td>
                      <td className="py-3 pr-4 leading-6 text-ink">
                        L-theanine systematic review — ADHD and related outcomes
                      </td>
                      <td className="py-3 pr-4 text-muted">—</td>
                      <td className="py-3 pr-4 text-muted">2024</td>
                      <td className="py-3 text-muted">
                        {/* TODO: Add exact PMID for 2024 systematic review from workbook */}
                        PMID pending
                      </td>
                    </tr>
                    <tr className="align-top">
                      <td className="py-3 pr-3 text-muted">3</td>
                      <td className="py-3 pr-4 leading-6 text-ink">
                        Magnesium meta-analysis — lower levels in ADHD populations
                      </td>
                      <td className="py-3 pr-4 text-muted">—</td>
                      <td className="py-3 pr-4 text-muted">2019</td>
                      <td className="py-3 text-muted">
                        {/* TODO: Add exact PMID for 2019 magnesium meta-analysis from workbook */}
                        PMID pending
                      </td>
                    </tr>
                    <tr className="align-top">
                      <td className="py-3 pr-3 text-muted">4</td>
                      <td className="py-3 pr-4 leading-6 text-ink">
                        Magnesium + Vitamin D RCT — ADHD symptom outcomes
                      </td>
                      <td className="py-3 pr-4 text-muted">—</td>
                      <td className="py-3 pr-4 text-muted">2020</td>
                      <td className="py-3 text-muted">
                        {/* TODO: Add exact PMID for 2020 Mg + Vit D RCT from workbook */}
                        PMID pending
                      </td>
                    </tr>
                    <tr className="align-top">
                      <td className="py-3 pr-3 text-muted">5</td>
                      <td className="py-3 pr-4 leading-6 text-ink">
                        Ashwagandha RCT — children with ADHD and anxiety
                      </td>
                      <td className="py-3 pr-4 text-muted">—</td>
                      <td className="py-3 pr-4 text-muted">—</td>
                      <td className="py-3 text-muted">
                        {/* TODO: Add exact PMID for ashwagandha ADHD + anxiety RCT from workbook */}
                        PMID pending
                      </td>
                    </tr>
                    <tr className="align-top">
                      <td className="py-3 pr-3 text-muted">6</td>
                      <td className="py-3 pr-4 leading-6 text-ink">
                        Safety and interaction evidence — supplement–drug interactions with ADHD
                        medications
                      </td>
                      <td className="py-3 pr-4 text-muted">—</td>
                      <td className="py-3 pr-4 text-muted">—</td>
                      <td className="py-3 text-muted">
                        {/* TODO: Add safety citations from workbook */}
                        Citations pending
                      </td>
                    </tr>
                  </tbody>
                </table>
              </ResponsiveTable>
              <p className="mt-3 text-xs text-muted">
                PMID links and n-sizes will be added once the workbook evidence pipeline completes
                for this cluster. Full ingredient-level evidence references will be shared with the
                dedicated compound articles once published.
              </p>
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
                ['#introduction', 'Introduction'],
                ['#neurobiology', 'Neurobiology Foundations'],
                ['#why-stacks-fail', 'Why Stacks Fail'],
                ['#medication-interactions', 'Medication Interactions'],
                ['#beginner-stack', 'Beginner Stack'],
                ['#intermediate-stack', 'Intermediate Stack'],
                ['#advanced-stack', 'Advanced Stack'],
                ['#subtype-considerations', 'Subtype Considerations'],
                ['#stack-comparison', 'Stack Comparison'],
                ['#common-mistakes', 'Common Mistakes'],
                ['#evidence-ranking', 'Evidence Ranking'],
                ['#monitoring', 'Monitoring Strategies'],
                ['#safety', 'Safety &amp; Quality'],
                ['#research-gaps', 'Research Gaps'],
                ['#conclusions', 'Conclusions'],
                ['#faq', 'FAQ'],
                ['#related-articles', 'Related Articles'],
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
                href="/articles/anxiety-stack-guide"
                className="block text-sm font-medium text-brand-700 hover:text-brand-800 hover:underline"
              >
                Anxiety stack guide →
              </Link>
              <Link
                href="/articles/sleep-stack-guide"
                className="block text-sm font-medium text-brand-700 hover:text-brand-800 hover:underline"
              >
                Sleep stack guide →
              </Link>
              <Link
                href="/articles/l-theanine-for-sleep"
                className="block text-sm font-medium text-brand-700 hover:text-brand-800 hover:underline"
              >
                L-Theanine for sleep →
              </Link>
              <Link
                href="/articles/magnesium-for-sleep"
                className="block text-sm font-medium text-brand-700 hover:text-brand-800 hover:underline"
              >
                Magnesium for sleep →
              </Link>
              <Link
                href="/articles/ashwagandha-for-anxiety"
                className="block text-sm font-medium text-brand-700 hover:text-brand-800 hover:underline"
              >
                Ashwagandha for anxiety →
              </Link>
              <Link
                href="/articles/natural-anxiety-relief"
                className="block text-sm font-medium text-brand-700 hover:text-brand-800 hover:underline"
              >
                Natural anxiety relief →
              </Link>
              <Link
                href="/articles"
                className="block text-sm font-medium text-brand-700 hover:text-brand-800 hover:underline"
              >
                All articles →
              </Link>
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
