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

const SLUG = 'l-theanine-for-adhd'
const TITLE = 'L-Theanine for ADHD: Evidence on Sleep, Attention, and Calm Focus Support'
const DESCRIPTION =
  'L-Theanine shows moderate evidence for improving sleep quality in children with ADHD and preliminary benefits for attention when combined with low-dose caffeine. This evidence-first guide covers mechanisms, pediatric and adult data, dosing, safety, and practical expectations.'
const DATE = '2026-06-10'
const AUTHOR = 'Will'
const READING_TIME = '14 min read'
const TAGS = ['l-theanine', 'adhd', 'focus', 'sleep', 'amino-acids']
const CATEGORY = 'focus'

export const metadata = buildPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: `/articles/${SLUG}`,
  openGraphType: 'article',
})

// ─── FAQ data (also used for JSON-LD) ────────────────────────────────────────

const FAQS = [
  {
    question: 'Does L-theanine help with ADHD?',
    answer:
      'Current evidence is strongest for sleep quality support in children with ADHD. Attention benefits appear more preliminary and are often discussed in combination with low-dose caffeine. It is not a primary treatment for ADHD.',
  },
  {
    question: 'How much L-theanine should I take for ADHD?',
    answer:
      'Research doses have included 400 mg per day for sleep in children and weight-based single doses around 2.5 mg/kg in attention studies. Individual needs vary. Work with a clinician to determine appropriate dosing.',
  },
  {
    question: 'Is L-theanine safe for children with ADHD?',
    answer:
      'One six-week randomized trial in boys aged 8–12 using 400 mg daily found it generally well tolerated for sleep support. Data in younger children and long-term use are limited. Clinical supervision is recommended.',
  },
  {
    question: 'Can I take L-theanine with my ADHD medication?',
    answer:
      'Many people discuss this combination anecdotally, but systematic safety and efficacy data are lacking. Always consult the prescribing clinician before combining supplements with prescription medications.',
  },
  {
    question: 'How long does it take for L-theanine to work?',
    answer:
      'Acute effects on relaxation or focus, when noticeable, often appear within 30–60 minutes. Sleep-related changes in research were measured after weeks of consistent use.',
  },
  {
    question: 'Should I take L-theanine with caffeine?',
    answer:
      'Some research suggests the combination may offer more noticeable attention support than L-theanine alone. Individual caffeine sensitivity varies. Starting with lower doses of both is prudent.',
  },
  {
    question: 'What are the side effects of L-theanine?',
    answer:
      'L-theanine is generally well tolerated. Reported side effects are uncommon and can include headache, dizziness, or gastrointestinal discomfort. One study noted transient facial tics in a single child that resolved after stopping.',
  },
  {
    question: 'Can L-theanine replace my ADHD medication?',
    answer:
      'No. L-theanine has not been shown to match the effect size or consistency of standard ADHD treatments for core symptoms. It may serve as a complementary support for specific issues such as sleep under appropriate guidance.',
  },
  {
    question: 'Is there good evidence for L-theanine in adult ADHD?',
    answer:
      'Large, well-controlled trials in adults with confirmed ADHD are currently lacking. Most cognitive research has been done in healthy adults or non-ADHD populations.',
  },
  {
    question: 'How do I know if L-theanine is helping me?',
    answer:
      'Track sleep metrics, daily focus ratings, and any side effects systematically over several weeks. Compare periods with and without the supplement if appropriate. Discuss findings with a clinician.',
  },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LTheanineForADHDPage() {
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
        you. We only link to L-theanine forms and dose ranges consistent with the clinical protocols
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
              What Does L-Theanine Actually Do for ADHD?
            </h2>
            <ul className="mt-4 space-y-2">
              <li className="flex gap-2 text-[1.01rem] leading-[1.85] text-[#46574d]">
                <span className="mt-1 flex-shrink-0 text-brand-700">▸</span>
                <span>
                  <strong>Strongest evidence is for sleep</strong> — one six-week RCT in boys
                  aged 8–12 with ADHD found objective sleep efficiency improvements at 400 mg/day.
                  This is the most direct human evidence available.
                </span>
              </li>
              <li className="flex gap-2 text-[1.01rem] leading-[1.85] text-[#46574d]">
                <span className="mt-1 flex-shrink-0 text-brand-700">▸</span>
                <span>
                  <strong>Attention data is more preliminary</strong> — a small crossover study
                  showed signals for sustained attention mainly when L-theanine was combined with
                  low-dose caffeine, not as a standalone.
                </span>
              </li>
              <li className="flex gap-2 text-[1.01rem] leading-[1.85] text-[#46574d]">
                <span className="mt-1 flex-shrink-0 text-brand-700">▸</span>
                <span>
                  <strong>Adult ADHD data are absent</strong> — no large RCTs in confirmed adult
                  ADHD populations exist. Findings from healthy adult studies do not transfer
                  directly.
                </span>
              </li>
              <li className="flex gap-2 text-[1.01rem] leading-[1.85] text-[#46574d]">
                <span className="mt-1 flex-shrink-0 text-brand-700">▸</span>
                <span>
                  <strong>Not a replacement for established ADHD treatment.</strong> L-theanine
                  may serve as a low-risk adjunct for sleep or calm focus under clinical guidance,
                  but effect sizes do not approach those of stimulant medications.
                </span>
              </li>
            </ul>
            <div className="mt-4 rounded-[0.75rem] border border-amber-300/60 bg-amber-50/60 px-4 py-3 text-sm leading-6 text-[#46574d]">
              <strong className="text-ink">Important:</strong> No supplement diagnoses, treats,
              cures, or prevents ADHD. Consult a qualified healthcare professional before starting
              any supplement, especially in children or if prescription medications are in use.
            </div>
          </section>

          {/* Main article body */}
          <section className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8 space-y-8">

            {/* What L-Theanine Is */}
            <div id="what-is-l-theanine">
              <h2 className="mb-3 text-2xl font-semibold tracking-tight text-ink">
                What L-Theanine Is
              </h2>
              <p className="text-[1.01rem] leading-[1.85] text-[#46574d]">
                L-Theanine is an amino acid derivative primarily found in the leaves of{' '}
                <em>Camellia sinensis</em>, the plant used to make green, black, and oolong tea.
                It was first isolated in 1949 and has been studied for its effects on the central
                nervous system. Unlike many amino acids, L-theanine is not used to build proteins.
                Instead, it influences brain chemistry in ways that can promote relaxation without
                drowsiness.
              </p>
              <p className="mt-3 text-[1.01rem] leading-[1.85] text-[#46574d]">
                In tea, L-theanine contributes to the beverage&apos;s characteristic umami flavor
                and is thought to work together with caffeine and other compounds. When taken as a
                concentrated supplement, it is usually extracted and purified. The form used in
                many human studies is Suntheanine, a patented high-purity version produced through
                enzymatic synthesis or fermentation processes.
              </p>
              <p className="mt-3 text-[1.01rem] leading-[1.85] text-[#46574d]">
                Bioavailability of L-theanine is relatively high. It is absorbed in the small
                intestine and reaches peak blood levels within about 30 to 60 minutes. It crosses
                the blood-brain barrier and can influence brain wave patterns and neurotransmitter
                activity. Supplements are available in capsule, tablet, chewable, and powder forms.
                Some products combine it with caffeine or other ingredients marketed for focus.
              </p>
              <p className="mt-3 text-[1.01rem] leading-[1.85] text-[#46574d]">
                Quality can vary between brands. Third-party testing for purity and accurate
                labeling is recommended because supplement manufacturing standards differ.
              </p>
            </div>

            <hr className="border-brand-900/10" />

            {/* How It Works */}
            <div id="mechanisms">
              <h2 className="mb-3 text-2xl font-semibold tracking-tight text-ink">
                How L-Theanine Works in the Brain
              </h2>
              <p className="text-[1.01rem] leading-[1.85] text-[#46574d]">
                L-Theanine affects several systems involved in attention, arousal, and stress
                regulation. Its effects are generally described as subtle and dose-dependent rather
                than strongly stimulating or sedating.
              </p>

              <h3 className="mt-5 mb-1 text-xl font-semibold tracking-tight text-ink">
                Alpha-Wave Activity
              </h3>
              <p className="text-[1.01rem] leading-[1.85] text-[#46574d]">
                It increases alpha brain wave activity. Alpha waves are associated with a state of
                relaxed wakefulness. This pattern may support selective attention and reduce the
                mental restlessness that many people with ADHD describe.
              </p>

              <h3 className="mt-5 mb-1 text-xl font-semibold tracking-tight text-ink">
                GABA and Glutamate Modulation
              </h3>
              <p className="text-[1.01rem] leading-[1.85] text-[#46574d]">
                L-Theanine interacts with GABA-A receptors. GABA is the brain&apos;s primary
                inhibitory neurotransmitter. By supporting GABA activity, L-theanine can promote
                calmer neural signaling. At the same time, it appears to modulate glutamate, an
                excitatory neurotransmitter. This dual action may help balance excitatory and
                inhibitory tone.
              </p>

              <h3 className="mt-5 mb-1 text-xl font-semibold tracking-tight text-ink">
                Dopamine Pathways
              </h3>
              <p className="text-[1.01rem] leading-[1.85] text-[#46574d]">
                Research in animal models suggests L-theanine can influence dopamine release in
                certain brain regions, including the striatum. Dopamine dysregulation is central to
                ADHD. Human data directly linking L-theanine to dopamine changes in ADHD
                populations remain limited.
              </p>

              <h3 className="mt-5 mb-1 text-xl font-semibold tracking-tight text-ink">
                Default Mode Network
              </h3>
              <p className="text-[1.01rem] leading-[1.85] text-[#46574d]">
                L-Theanine also affects the default mode network, a set of brain regions active
                during mind-wandering and self-referential thinking. In some imaging studies, the
                combination of L-theanine and caffeine reduced activity in parts of this network
                during attention tasks. This may relate to fewer intrusive thoughts or
                distractibility.
              </p>
              <p className="mt-3 text-[1.01rem] leading-[1.85] text-[#46574d]">
                These mechanisms provide a plausible basis for exploring L-theanine in ADHD, but
                biological plausibility does not equal clinical effectiveness. Individual responses
                vary based on dose, timing, co-ingested substances, and personal neurochemistry.
              </p>
            </div>

            <hr className="border-brand-900/10" />

            {/* Sleep Effects */}
            <div id="sleep-effects">
              <h2 className="mb-3 text-2xl font-semibold tracking-tight text-ink">
                Sleep Effects in ADHD
              </h2>
              <p className="text-[1.01rem] leading-[1.85] text-[#46574d]">
                Sleep problems are very common in ADHD and can worsen daytime symptoms such as
                inattention, irritability, and emotional dysregulation. Improving sleep is therefore
                a meaningful treatment target.
              </p>
              <p className="mt-3 text-[1.01rem] leading-[1.85] text-[#46574d]">
                One randomized, double-blind, placebo-controlled trial examined L-theanine in boys
                diagnosed with ADHD. Participants were boys aged 8 to 12 years. They received
                400 mg per day of L-theanine, given as 200 mg twice daily, or matching placebo for
                six weeks. Sleep was measured objectively using actigraphy.
              </p>
              <p className="mt-3 text-[1.01rem] leading-[1.85] text-[#46574d]">
                The study found improvements in sleep efficiency and reductions in nighttime
                awakenings with L-theanine compared to placebo. The supplement was generally well
                tolerated over the six-week period. One participant experienced transient facial
                tics that resolved after stopping the supplement.
              </p>
              <p className="mt-3 text-[1.01rem] leading-[1.85] text-[#46574d]">
                This remains the largest and most direct human trial of L-theanine specifically in
                an ADHD population for sleep outcomes. Results suggest a potential adjunctive role
                for sleep support in children with ADHD who also have documented sleep difficulties.
                Replication in larger and more diverse groups is needed.
              </p>
              <p className="mt-3 text-[1.01rem] leading-[1.85] text-[#46574d]">
                Other research on L-theanine and sleep in non-ADHD populations has shown mixed but
                generally positive effects on subjective sleep quality and relaxation. The
                ADHD-specific data are more limited but point in a similar direction for sleep
                architecture.
              </p>
              <div className="mt-4 rounded-[1rem] border border-brand-900/10 bg-brand-50/60 p-4 text-sm leading-7 text-[#46574d]">
                <p className="font-semibold text-ink">Key study — sleep in pediatric ADHD:</p>
                <ul className="mt-2 ml-5 space-y-1 list-disc">
                  <li>
                    Lyon et al. 2011 — randomized, double-blind, placebo-controlled trial; boys aged
                    8–12 with ADHD; 400 mg/day L-theanine (2 × 200 mg) for 6 weeks; primary
                    outcome: actigraphy-measured sleep. PMID: 22214254 (pending workbook
                    verification of all details)
                  </li>
                </ul>
                <p className="mt-2 text-xs text-muted">
                  Full reference details including n, exact outcome measures, and adverse event
                  profile will be confirmed once workbook evidence pipeline is complete.
                </p>
              </div>
              <p className="mt-4 text-sm text-muted">
                For related sleep approaches, see{' '}
                <Link
                  href="/articles/l-theanine-for-sleep"
                  className="font-semibold text-brand-700 hover:text-brand-800 hover:underline"
                >
                  L-Theanine for Sleep
                </Link>{' '}
                and the{' '}
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

            {/* Attention and Cognitive Effects */}
            <div id="attention-effects">
              <h2 className="mb-3 text-2xl font-semibold tracking-tight text-ink">
                Attention and Cognitive Effects in ADHD
              </h2>
              <p className="text-[1.01rem] leading-[1.85] text-[#46574d]">
                Evidence for L-theanine&apos;s effects on core attention symptoms in ADHD is more
                preliminary than the sleep data.
              </p>
              <p className="mt-3 text-[1.01rem] leading-[1.85] text-[#46574d]">
                A small randomized, placebo-controlled crossover study in boys with ADHD tested
                single doses of L-theanine, caffeine, their combination, and placebo. Doses were
                weight-based, approximately 2.5 mg/kg L-theanine and 2.0 mg/kg caffeine.
                Participants completed cognitive testing and functional MRI during attention and
                inhibitory control tasks.
              </p>
              <p className="mt-3 text-[1.01rem] leading-[1.85] text-[#46574d]">
                L-theanine alone was associated with some improvement in overall cognitive
                performance scores. The combination of L-theanine and caffeine showed more
                consistent signals for sustained attention and a trend toward better inhibitory
                control. Brain imaging suggested reduced activity in brain networks linked to
                mind-wandering during task performance.
              </p>
              <p className="mt-3 text-[1.01rem] leading-[1.85] text-[#46574d]">
                The sample size was very small, and the design was acute — meaning single-dose
                rather than chronic daily use. These factors limit how far the findings can be
                generalized. Larger, longer-term studies are required before firm conclusions can
                be drawn about attention benefits in everyday settings.
              </p>
              <p className="mt-3 text-[1.01rem] leading-[1.85] text-[#46574d]">
                Standalone L-theanine has not demonstrated robust, consistent effects on
                hyperactivity or impulsivity in the available ADHD trials. Most signals for
                attention appear stronger when it is paired with low-dose caffeine.
              </p>
              <div className="mt-4 rounded-[1rem] border border-brand-900/10 bg-brand-50/60 p-4 text-sm leading-7 text-[#46574d]">
                <p className="font-semibold text-ink">Key study — attention in pediatric ADHD:</p>
                <ul className="mt-2 ml-5 space-y-1 list-disc">
                  <li>
                    Kahathuduwa et al. 2020 — small randomized crossover design; boys with ADHD;
                    single doses of L-theanine (~2.5 mg/kg) ± caffeine (~2.0 mg/kg); outcomes:
                    cognitive performance and fMRI. Full PMID, n, and outcome details pending
                    workbook verification.
                  </li>
                </ul>
                <p className="mt-2 text-xs text-muted">
                  Given the small sample size and acute design, findings are hypothesis-generating
                  rather than definitive.
                </p>
              </div>
            </div>

            <hr className="border-brand-900/10" />

            {/* L-Theanine and Caffeine */}
            <div id="caffeine-combination">
              <h2 className="mb-3 text-2xl font-semibold tracking-tight text-ink">
                L-Theanine and Caffeine Combination
              </h2>
              <p className="text-[1.01rem] leading-[1.85] text-[#46574d]">
                The combination of L-theanine and caffeine is one of the more studied pairings for
                cognitive effects. L-theanine is thought to moderate some of the peripheral and
                central side effects of caffeine, such as jitteriness or sleep disruption, while
                preserving or enhancing its attention-promoting properties.
              </p>
              <p className="mt-3 text-[1.01rem] leading-[1.85] text-[#46574d]">
                In the small ADHD crossover study mentioned above, the combination produced the
                clearest benefits on sustained attention measures and showed a trend for improved
                inhibitory control. It also appeared to reduce task-related activity in the default
                mode network.
              </p>
              <p className="mt-3 text-[1.01rem] leading-[1.85] text-[#46574d]">
                Typical ratios used in research approximate 1:1 to 2:1 L-theanine to caffeine by
                weight. Many commercial products use 100–200 mg L-theanine with 50–100 mg caffeine
                per serving. Individual responses vary; some people are more sensitive to caffeine
                even at low doses.
              </p>
              <p className="mt-3 text-[1.01rem] leading-[1.85] text-[#46574d]">
                Long-term daily use of the combination specifically in ADHD populations has not
                been well studied. Most data come from single-dose or short-term experiments.
                Whether tolerance develops or whether benefits persist over weeks to months remains
                an open question.
              </p>
              <p className="mt-3 text-[1.01rem] leading-[1.85] text-[#46574d]">
                For people who already use caffeine and find it helpful but jittery, adding
                L-theanine is a common self-experiment. Starting with lower doses of both and
                monitoring response is prudent. This combination is not appropriate for children
                without explicit clinician guidance.
              </p>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm">
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted">
                    L-Theanine Standalone
                  </p>
                  <p className="font-semibold text-ink">L-Theanine 200 mg</p>
                  <p className="mt-1 text-xs leading-5 text-[#46574d]">
                    Caffeine-free option. Suitable for sleep support or for those sensitive to
                    caffeine. Consistent with the dose used in the key pediatric ADHD sleep trial.
                  </p>
                  <a
                    href={`https://www.amazon.com/s?k=l-theanine+200mg+adhd&tag=${AFFILIATE_TAGS.amazon}`}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    className="mt-3 inline-flex items-center gap-1 rounded-full bg-brand-950 px-4 py-1.5 text-xs font-bold text-white transition hover:bg-brand-900"
                  >
                    View on Amazon →
                  </a>
                </div>
                <div className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm">
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted">
                    L-Theanine + Caffeine
                  </p>
                  <p className="font-semibold text-ink">L-Theanine &amp; Caffeine Stack</p>
                  <p className="mt-1 text-xs leading-5 text-[#46574d]">
                    Combination studied for attention support. Typical ratios: 100–200 mg
                    L-theanine with 50–100 mg caffeine. Daytime use only; not for sleep or for
                    children without clinician approval.
                  </p>
                  <a
                    href={`https://www.amazon.com/s?k=l-theanine+caffeine+focus+adhd&tag=${AFFILIATE_TAGS.amazon}`}
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

            {/* Pediatric Evidence */}
            <div id="pediatric-evidence">
              <h2 className="mb-3 text-2xl font-semibold tracking-tight text-ink">
                Pediatric ADHD Evidence
              </h2>
              <p className="text-[1.01rem] leading-[1.85] text-[#46574d]">
                The strongest pediatric data come from the six-week randomized controlled trial in
                boys aged 8–12 with ADHD using 400 mg daily L-theanine for sleep. Objective sleep
                improvements were observed.
              </p>
              <p className="mt-3 text-[1.01rem] leading-[1.85] text-[#46574d]">
                The attention-focused study was also conducted in boys with ADHD but was very small
                and acute. No large, long-term trials have examined daily L-theanine for core ADHD
                symptoms such as inattention or hyperactivity in children.
              </p>
              <p className="mt-3 text-[1.01rem] leading-[1.85] text-[#46574d]">
                Current evidence supports considering L-theanine primarily as a sleep-support
                option in school-age boys with ADHD and documented sleep difficulties, rather than
                as a broad-spectrum ADHD treatment. Use in younger children or girls has even less
                direct research.
              </p>
              <p className="mt-3 text-[1.01rem] leading-[1.85] text-[#46574d]">
                Any use in children should involve discussion with a pediatrician or qualified
                clinician familiar with the child&apos;s full medical history and current
                treatments.
              </p>
            </div>

            <hr className="border-brand-900/10" />

            {/* Adult ADHD Evidence Gap */}
            <div id="adult-evidence-gap">
              <h2 className="mb-3 text-2xl font-semibold tracking-tight text-ink">
                Adult ADHD Evidence Gap
              </h2>
              <p className="text-[1.01rem] leading-[1.85] text-[#46574d]">
                There are currently no large randomized controlled trials of L-theanine
                specifically in adults diagnosed with ADHD. Most human research on L-theanine and
                cognition has been conducted in healthy adults or mixed populations without
                confirmed ADHD.
              </p>
              <p className="mt-3 text-[1.01rem] leading-[1.85] text-[#46574d]">
                Some mechanistic and general cognitive studies in adults show benefits for
                attention, reaction time, and stress reduction under certain conditions,
                particularly when L-theanine is combined with caffeine. However, these findings
                cannot be directly extrapolated to ADHD populations or to the specific symptom
                profile of adult ADHD, which often includes emotional dysregulation, executive
                function challenges, and co-occurring anxiety or sleep issues.
              </p>
              <p className="mt-3 text-[1.01rem] leading-[1.85] text-[#46574d]">
                The absence of robust adult ADHD data represents a clear evidence gap. Adults
                considering L-theanine should treat expectations as lower and monitor response
                carefully. Clinical supervision is advisable, especially if other medications or
                health conditions are present.
              </p>
            </div>

            <hr className="border-brand-900/10" />

            {/* Evidence Summary */}
            <div id="evidence-summary">
              <h2 className="mb-4 text-2xl font-semibold tracking-tight text-ink">
                Evidence Summary
              </h2>

              <EvidenceSummaryCard
                title="L-Theanine &amp; ADHD"
                evidenceLevel="Limited"
                humanEvidence="Strongest evidence is a single 6-week RCT showing improved objective sleep efficiency in boys aged 8–12 with ADHD at 400 mg/day (Lyon 2011; details pending workbook verification). A small acute crossover study in boys with ADHD suggests attention benefits with the L-theanine + caffeine combination (Kahathuduwa 2020; details pending workbook verification). No large RCTs in adults with confirmed ADHD. No direct evidence for hyperactivity or impulsivity outcomes."
                mechanisticEvidence="Alpha-wave induction is the most replicated neurophysiological finding in EEG studies. Proposed modulation of GABA-A receptors and glutamate activity is biologically plausible but incompletely characterized at typical human doses. Animal model data suggest dopamine pathway influence, but human ADHD data are limited. Default mode network activity reduction during attention tasks has been observed with the caffeine combination in imaging studies."
                safetyProfile="Generally well tolerated in available ADHD trials. Most common adverse events are mild: headache, dizziness, GI discomfort. One pediatric trial noted transient facial tics in a single participant that resolved on discontinuation. No major drug interactions established, but caution is warranted with sedating medications and blood pressure medications. Insufficient safety data for pregnancy or breastfeeding."
              />

              {/* Evidence Table */}
              <div className="mt-6">
                <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-muted">
                  Evidence Summary Table
                </p>
                <ResponsiveTable label="L-theanine ADHD evidence summary by outcome area">
                  <table className="min-w-[700px] w-full text-sm">
                    <thead>
                      <tr className="border-b border-brand-900/10">
                        <th className="pb-2 pr-4 text-left text-xs font-bold uppercase tracking-wider text-muted">
                          Area
                        </th>
                        <th className="pb-2 pr-4 text-left text-xs font-bold uppercase tracking-wider text-muted">
                          Population
                        </th>
                        <th className="pb-2 pr-4 text-left text-xs font-bold uppercase tracking-wider text-muted">
                          Key Study
                        </th>
                        <th className="pb-2 pr-4 text-left text-xs font-bold uppercase tracking-wider text-muted">
                          Main Finding
                        </th>
                        <th className="pb-2 text-left text-xs font-bold uppercase tracking-wider text-muted">
                          Evidence Strength
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-900/5">
                      <tr className="align-top">
                        <td className="py-3 pr-4 font-medium text-ink">Sleep quality</td>
                        <td className="py-3 pr-4 text-[#46574d]">Boys 8–12 with ADHD</td>
                        <td className="py-3 pr-4 text-[#46574d]">
                          RCT, 6 weeks, 400 mg/day (Lyon 2011 — pending verification)
                        </td>
                        <td className="py-3 pr-4 text-[#46574d]">
                          Improved objective sleep efficiency
                        </td>
                        <td className="py-3 text-[#46574d] font-medium">Moderate</td>
                      </tr>
                      <tr className="align-top">
                        <td className="py-3 pr-4 font-medium text-ink">Sustained attention</td>
                        <td className="py-3 pr-4 text-[#46574d]">Boys with ADHD</td>
                        <td className="py-3 pr-4 text-[#46574d]">
                          Small crossover, single dose + caffeine (Kahathuduwa 2020 — pending verification)
                        </td>
                        <td className="py-3 pr-4 text-[#46574d]">
                          Improvement with combination
                        </td>
                        <td className="py-3 text-[#46574d] font-medium">Preliminary</td>
                      </tr>
                      <tr className="align-top">
                        <td className="py-3 pr-4 font-medium text-ink">Inhibitory control</td>
                        <td className="py-3 pr-4 text-[#46574d]">Boys with ADHD</td>
                        <td className="py-3 pr-4 text-[#46574d]">
                          Same small crossover (Kahathuduwa 2020 — pending verification)
                        </td>
                        <td className="py-3 pr-4 text-[#46574d]">
                          Trend with combination
                        </td>
                        <td className="py-3 text-[#46574d] font-medium">Preliminary</td>
                      </tr>
                      <tr className="align-top">
                        <td className="py-3 pr-4 font-medium text-ink">Adult ADHD data</td>
                        <td className="py-3 pr-4 text-[#46574d]">Adults with ADHD</td>
                        <td className="py-3 pr-4 text-[#46574d]">No large RCTs identified</td>
                        <td className="py-3 pr-4 text-[#46574d]">Evidence gap</td>
                        <td className="py-3 text-[#46574d] font-medium">Limited</td>
                      </tr>
                      <tr className="align-top">
                        <td className="py-3 pr-4 font-medium text-ink">General cognition</td>
                        <td className="py-3 pr-4 text-[#46574d]">Mixed / healthy adults</td>
                        <td className="py-3 pr-4 text-[#46574d]">
                          Multiple studies, often with caffeine (verify relevance before citation)
                        </td>
                        <td className="py-3 pr-4 text-[#46574d]">
                          Variable attention support
                        </td>
                        <td className="py-3 text-[#46574d] font-medium">Moderate (non-ADHD)</td>
                      </tr>
                    </tbody>
                  </table>
                </ResponsiveTable>
              </div>
            </div>

            <hr className="border-brand-900/10" />

            {/* Dosing and Timing */}
            <div id="dosing">
              <h2 className="mb-4 text-2xl font-semibold tracking-tight text-ink">
                Dosing and Timing
              </h2>
              <p className="mb-4 text-[1.01rem] leading-[1.85] text-[#46574d]">
                Doses used in published research vary by goal and population.
              </p>

              <div className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-5 shadow-sm">
                <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-muted">
                  Dosage Reference — ADHD Protocols
                </p>
                <ResponsiveTable label="L-theanine dosage reference table for ADHD">
                  <table className="min-w-[540px] w-full text-sm">
                    <thead>
                      <tr className="border-b border-brand-900/10">
                        <th className="pb-2 pr-4 text-left text-xs font-bold uppercase tracking-wider text-muted">
                          Use Case
                        </th>
                        <th className="pb-2 pr-4 text-left text-xs font-bold uppercase tracking-wider text-muted">
                          Dose (Research)
                        </th>
                        <th className="pb-2 pr-4 text-left text-xs font-bold uppercase tracking-wider text-muted">
                          Timing
                        </th>
                        <th className="pb-2 text-left text-xs font-bold uppercase tracking-wider text-muted">
                          Notes
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-900/5">
                      <tr className="align-top">
                        <td className="py-3 pr-4 font-medium text-ink">
                          Sleep (pediatric ADHD)
                        </td>
                        <td className="py-3 pr-4 text-[#46574d]">400 mg/day (2 × 200 mg)</td>
                        <td className="py-3 pr-4 text-[#46574d]">Morning + afternoon/evening</td>
                        <td className="py-3 text-[#46574d]">
                          Key RCT protocol; boys aged 8–12; clinician oversight required
                        </td>
                      </tr>
                      <tr className="align-top">
                        <td className="py-3 pr-4 font-medium text-ink">
                          Acute attention (boys with ADHD)
                        </td>
                        <td className="py-3 pr-4 text-[#46574d]">~2.5 mg/kg (single dose)</td>
                        <td className="py-3 pr-4 text-[#46574d]">Morning (daytime tasks)</td>
                        <td className="py-3 text-[#46574d]">
                          Often paired with ~2.0 mg/kg caffeine; acute design only
                        </td>
                      </tr>
                      <tr className="align-top">
                        <td className="py-3 pr-4 font-medium text-ink">
                          General adult use
                        </td>
                        <td className="py-3 pr-4 text-[#46574d]">100–400 mg/serving</td>
                        <td className="py-3 pr-4 text-[#46574d]">Depends on goal</td>
                        <td className="py-3 text-[#46574d]">
                          No ADHD-specific adult RCT to anchor dosing
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </ResponsiveTable>
                <p className="mt-3 text-xs text-muted">
                  All dose ranges require verification against workbook evidence data before
                  final publication. Individual dosing decisions for children must involve a
                  clinician.
                </p>
              </div>

              <div className="mt-4 rounded-[1rem] border border-brand-900/10 bg-brand-50/60 p-4 text-sm leading-7 text-[#46574d]">
                <p className="font-semibold text-ink">Practical timing considerations:</p>
                <ul className="mt-2 ml-5 space-y-1 list-disc">
                  <li>
                    For sleep support, earlier evening dosing may be more appropriate; the
                    pediatric trial split the dose across morning and afternoon/evening.
                  </li>
                  <li>
                    For focus support during the day, morning or early afternoon dosing is
                    typical.
                  </li>
                  <li>
                    When combined with caffeine, taking them together is the most common approach.
                    Avoid this near bedtime.
                  </li>
                  <li>
                    L-Theanine can be taken with or without food. Individual sensitivity varies;
                    starting lower and titrating is a reasonable approach.
                  </li>
                </ul>
              </div>
            </div>

            <hr className="border-brand-900/10" />

            {/* Medication Interactions */}
            <div id="medication-interactions">
              <h2 className="mb-3 text-2xl font-semibold tracking-tight text-ink">
                Medication Interaction Caution
              </h2>
              <p className="text-[1.01rem] leading-[1.85] text-[#46574d]">
                L-Theanine has relatively few well-documented drug interactions compared to many
                supplements. However, caution is still warranted.
              </p>
              <p className="mt-3 text-[1.01rem] leading-[1.85] text-[#46574d]">
                Because it can promote relaxation and influence GABA activity, additive effects
                with sedating medications — including some antihistamines, benzodiazepines, or
                sleep aids — are theoretically possible. Monitoring for excessive drowsiness is
                prudent.
              </p>
              <p className="mt-3 text-[1.01rem] leading-[1.85] text-[#46574d]">
                L-Theanine may also interact with blood pressure medications in some individuals,
                though clinical significance appears low at typical supplemental doses.
              </p>
              <p className="mt-3 text-[1.01rem] leading-[1.85] text-[#46574d]">
                People taking stimulant medications for ADHD sometimes add L-theanine to smooth
                jitteriness or support sleep. While this combination is commonly discussed
                anecdotally, it has not been systematically studied for safety or efficacy in ADHD
                populations. Coordination with the prescribing clinician is important to avoid
                unintended effects on sleep, appetite, or mood.
              </p>
              <p className="mt-3 text-[1.01rem] leading-[1.85] text-[#46574d]">
                Anyone considering L-theanine while on prescription medications should disclose
                supplement use to their healthcare providers and discuss potential interactions.
              </p>
              <p className="mt-3 text-sm text-muted">
                For a broader look at supplement interactions relevant to ADHD, see the{' '}
                <Link
                  href="/articles/adhd-stack-guide"
                  className="font-semibold text-brand-700 hover:text-brand-800 hover:underline"
                >
                  ADHD Stack Guide
                </Link>
                .
              </p>
            </div>

            <hr className="border-brand-900/10" />

            {/* Who Might Benefit */}
            <div id="who-benefits">
              <h2 className="mb-4 text-2xl font-semibold tracking-tight text-ink">
                Who Might Benefit Most
              </h2>
              <div className="rounded-[1rem] border border-brand-900/10 bg-brand-50/60 p-5">
                <p className="mb-3 text-sm font-semibold text-ink">
                  L-Theanine may be most relevant for individuals with ADHD who:
                </p>
                <ul className="space-y-3 text-[1.01rem] leading-[1.85] text-[#46574d]">
                  <li className="flex gap-2">
                    <span className="mt-1 flex-shrink-0 text-brand-700">▸</span>
                    <span>
                      Experience significant sleep difficulties that worsen daytime symptoms.
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-1 flex-shrink-0 text-brand-700">▸</span>
                    <span>
                      Find low-dose caffeine helpful for focus but experience jitteriness or
                      sleep disruption from it.
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-1 flex-shrink-0 text-brand-700">▸</span>
                    <span>
                      Prefer non-stimulant supportive options and are looking for something with
                      a generally favorable safety profile.
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-1 flex-shrink-0 text-brand-700">▸</span>
                    <span>
                      Are already using evidence-based ADHD treatments and want to explore
                      adjunctive support for sleep or calm focus under clinical guidance.
                    </span>
                  </li>
                </ul>
                <p className="mt-4 text-sm text-[#46574d]">
                  It is not positioned as a replacement for behavioral interventions, medication
                  when indicated, or foundational lifestyle factors such as consistent sleep
                  hygiene, exercise, and nutrition.
                </p>
              </div>
            </div>

            <hr className="border-brand-900/10" />

            {/* Who Should Avoid */}
            <div id="safety">
              <h2 className="mb-4 text-2xl font-semibold tracking-tight text-ink">
                Safety, Side Effects, and Who Should Avoid It
              </h2>
              <SafetyNotice title="Safety Summary — L-Theanine for ADHD">
                <ul className="ml-5 space-y-1.5 list-disc">
                  <li>
                    <strong>Generally well tolerated</strong> in available ADHD trials and in
                    long-term tea consumption. Reported adverse effects are mild and uncommon:
                    headache, dizziness, GI discomfort.
                  </li>
                  <li>
                    <strong>Transient facial tics</strong> were observed in one child in the key
                    pediatric sleep trial and resolved after stopping the supplement. Monitor for
                    new neurological symptoms.
                  </li>
                  <li>
                    <strong>Sedating medications:</strong> Additive CNS-depressant effects are
                    theoretically possible with benzodiazepines, antihistamines, sleep aids, or
                    other sedatives. Do not combine without clinician guidance.
                  </li>
                  <li>
                    <strong>Blood pressure medications:</strong> L-theanine may have mild
                    blood-pressure-lowering effects; use caution with antihypertensive treatment.
                  </li>
                  <li>
                    <strong>Stimulant ADHD medications:</strong> Combination has not been
                    systematically studied. Always disclose to the prescribing clinician.
                  </li>
                  <li>
                    <strong>Young children:</strong> Very limited safety and efficacy data below
                    school age. The key pediatric trial enrolled boys aged 8–12.
                  </li>
                  <li>
                    <strong>Girls and women:</strong> Most ADHD trials enrolled only boys. Direct
                    applicability to female populations is uncertain.
                  </li>
                  <li>
                    <strong>Psychiatric or neurological conditions:</strong> GABA and glutamate
                    modulation may be relevant to certain conditions; specialist discussion is
                    essential.
                  </li>
                  <li>
                    <strong>Pregnancy and breastfeeding:</strong> Insufficient safety data.
                    Consult a clinician before use.
                  </li>
                </ul>
              </SafetyNotice>
            </div>

            <hr className="border-brand-900/10" />

            {/* What Not to Expect */}
            <div id="realistic-expectations">
              <h2 className="mb-4 text-2xl font-semibold tracking-tight text-ink">
                What Not to Expect
              </h2>
              <ul className="space-y-3 text-[1.01rem] leading-[1.85] text-[#46574d]">
                <li className="flex gap-2">
                  <span className="mt-1 flex-shrink-0 text-brand-700">✕</span>
                  <span>
                    <strong>Do not expect stimulant-level effects.</strong> L-theanine is not a
                    cure for ADHD and does not produce the robust, rapid effects seen with
                    stimulant medications in most people. Standalone benefits for inattention,
                    hyperactivity, and impulsivity appear modest or inconsistent.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-1 flex-shrink-0 text-brand-700">✕</span>
                  <span>
                    <strong>Do not treat it as a complete ADHD management strategy.</strong> It
                    is unlikely to replace the need for behavioral strategies, organizational
                    support, therapy, and medication when appropriate.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-1 flex-shrink-0 text-brand-700">✕</span>
                  <span>
                    <strong>Do not expect dramatic sleep transformation.</strong> Sleep
                    improvements, when they occur, tend to be moderate rather than dramatic.
                    Consistent sleep hygiene practices remain foundational.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-1 flex-shrink-0 text-brand-700">✕</span>
                  <span>
                    <strong>Individual responses vary widely.</strong> Some people notice clear
                    benefits for calm focus or sleep; others notice little difference.
                    Expectation management is important to avoid unnecessary supplementation.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-1 flex-shrink-0 text-brand-700">✕</span>
                  <span>
                    <strong>Do not assume findings in healthy adults translate to ADHD.</strong>{' '}
                    Most adult cognitive studies were conducted in people without confirmed ADHD.
                    Results do not transfer directly.
                  </span>
                </li>
              </ul>
            </div>

            <hr className="border-brand-900/10" />

            {/* Tracking Response */}
            <div id="tracking">
              <h2 className="mb-3 text-2xl font-semibold tracking-tight text-ink">
                Tracking Your Response
              </h2>
              <p className="text-[1.01rem] leading-[1.85] text-[#46574d]">
                If trialing L-theanine, systematic tracking helps determine whether it is
                providing meaningful benefit.
              </p>
              <div className="mt-4 rounded-[1rem] border border-brand-900/10 bg-brand-50/60 p-5 text-sm leading-7 text-[#46574d]">
                <p className="font-semibold text-ink">Useful tracking measures:</p>
                <ul className="mt-2 ml-5 space-y-1 list-disc">
                  <li>
                    Sleep diary or wearable data — sleep onset, awakenings, total sleep time,
                    morning refreshment.
                  </li>
                  <li>
                    Simple daily ratings of focus, distractibility, and emotional regulation,
                    for example on a 1–10 scale at consistent times of day.
                  </li>
                  <li>
                    Tracking of any side effects or changes in energy, mood, or appetite.
                  </li>
                  <li>
                    Notes on timing, dose, and whether caffeine was co-ingested.
                  </li>
                </ul>
                <p className="mt-3">
                  Review trends after two to four weeks of consistent use. If no clear benefit is
                  observed, continuing may not be warranted. If benefits are noticed, periodic
                  re-evaluation — including breaks — can help confirm ongoing value and minimize
                  unnecessary long-term supplementation.
                </p>
                <p className="mt-2">
                  Work with a clinician to interpret tracking data, especially for children or
                  when other treatments are in place.
                </p>
              </div>
            </div>

            <hr className="border-brand-900/10" />

            {/* Conclusion */}
            <div id="conclusion">
              <h2 className="mb-3 text-2xl font-semibold tracking-tight text-ink">
                Conclusion
              </h2>
              <p className="text-[1.01rem] leading-[1.85] text-[#46574d]">
                L-Theanine has the most consistent human evidence for supporting objective sleep
                quality in school-age boys with ADHD at a dose of 400 mg per day. Data on
                attention and cognitive effects are more preliminary, with the strongest signals
                appearing when L-theanine is combined with low-dose caffeine in small acute
                studies.
              </p>
              <p className="mt-3 text-[1.01rem] leading-[1.85] text-[#46574d]">
                Adult ADHD data are notably lacking. Safety at studied doses appears favorable for
                short- to medium-term use in the populations examined, but individual responses
                vary and medication interactions, while uncommon, should be considered.
              </p>
              <p className="mt-3 text-[1.01rem] leading-[1.85] text-[#46574d]">
                L-Theanine can be viewed as a low-risk adjunctive option worth discussing with a
                healthcare provider, particularly when sleep difficulties are prominent or when
                exploring non-stimulant supportive strategies. It is not a standalone solution for
                ADHD and should be integrated thoughtfully into a broader management plan.
              </p>
              <p className="mt-3 text-[1.01rem] leading-[1.85] text-[#46574d]">
                Expectations should remain modest and evidence-based. Systematic tracking and
                clinical oversight help ensure any trial is informative and safe.
              </p>
              <p className="mt-4 text-sm text-muted">
                For building a broader supplement approach to ADHD, see the{' '}
                <Link
                  href="/articles/adhd-stack-guide"
                  className="font-semibold text-brand-700 hover:text-brand-800 hover:underline"
                >
                  ADHD Stack Guide
                </Link>
                . For co-occurring anxiety, see the{' '}
                <Link
                  href="/articles/anxiety-stack-guide"
                  className="font-semibold text-brand-700 hover:text-brand-800 hover:underline"
                >
                  Anxiety Stack Guide
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

            {/* Related Articles */}
            <div id="related-articles">
              <h2 className="mb-4 text-2xl font-semibold tracking-tight text-ink">
                Related Articles
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                <Link
                  href="/articles/adhd-stack-guide"
                  className="group rounded-[0.75rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm transition hover:border-brand-700/30"
                >
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted">
                    Focus Cluster Hub
                  </p>
                  <p className="font-semibold text-ink transition group-hover:text-brand-700">
                    ADHD Stack Guide
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    Evidence-based framework for supplement combinations in ADHD — tiers,
                    medication interactions, and monitoring strategies.
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
                    Alpha-wave evidence, dosage, safety, and how L-theanine addresses the sleep
                    disruption that amplifies ADHD symptoms.
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
                    How to combine L-theanine, magnesium, ashwagandha, and other sleep
                    supplements safely and effectively.
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
                    Stacking frameworks for co-occurring anxiety — ashwagandha, L-theanine, and
                    magnesium combinations.
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
                        L-theanine sleep outcomes in boys with ADHD — randomized, double-blind,
                        placebo-controlled, 6 weeks, actigraphy-measured sleep efficiency
                      </td>
                      <td className="py-3 pr-4 text-muted">Lyon et al.</td>
                      <td className="py-3 pr-4 text-muted">2011</td>
                      <td className="py-3 text-muted">
                        PMID 22214254 (pending workbook verification)
                      </td>
                    </tr>
                    <tr className="align-top">
                      <td className="py-3 pr-3 text-muted">2</td>
                      <td className="py-3 pr-4 leading-6 text-ink">
                        L-theanine ± caffeine attention and fMRI outcomes in boys with ADHD —
                        small randomized crossover, single dose, cognitive performance and
                        inhibitory control
                      </td>
                      <td className="py-3 pr-4 text-muted">Kahathuduwa et al.</td>
                      <td className="py-3 pr-4 text-muted">2020</td>
                      <td className="py-3 text-muted">
                        PMID pending workbook verification
                      </td>
                    </tr>
                    <tr className="align-top">
                      <td className="py-3 pr-3 text-muted">3</td>
                      <td className="py-3 pr-4 leading-6 text-ink">
                        L-theanine safety and tolerability — adverse event profile in clinical
                        trials and supplemental use
                      </td>
                      <td className="py-3 pr-4 text-muted">—</td>
                      <td className="py-3 pr-4 text-muted">—</td>
                      <td className="py-3 text-muted">
                        PMID pending workbook review
                      </td>
                    </tr>
                    <tr className="align-top">
                      <td className="py-3 pr-3 text-muted">4</td>
                      <td className="py-3 pr-4 leading-6 text-ink">
                        L-theanine and caffeine — general cognitive performance, attention, and
                        alpha-wave effects (non-ADHD populations; cited for mechanistic context)
                      </td>
                      <td className="py-3 pr-4 text-muted">—</td>
                      <td className="py-3 pr-4 text-muted">—</td>
                      <td className="py-3 text-muted">
                        PMIDs pending workbook verification
                      </td>
                    </tr>
                    <tr className="align-top">
                      <td className="py-3 pr-3 text-muted">5</td>
                      <td className="py-3 pr-4 leading-6 text-ink">
                        Adult ADHD evidence survey — absence of large RCTs for L-theanine in
                        confirmed adult ADHD populations
                      </td>
                      <td className="py-3 pr-4 text-muted">—</td>
                      <td className="py-3 pr-4 text-muted">—</td>
                      <td className="py-3 text-muted">
                        Evidence gap — pending workbook review
                      </td>
                    </tr>
                  </tbody>
                </table>
              </ResponsiveTable>
              <p className="mt-3 text-xs text-muted">
                PMID links, author details, and n-sizes will be confirmed once the workbook
                evidence pipeline completes for L-theanine ADHD studies. See the{' '}
                <Link
                  href="/articles/adhd-stack-guide"
                  className="font-semibold text-brand-700 hover:text-brand-800 hover:underline"
                >
                  ADHD Stack Guide
                </Link>{' '}
                for related compound evidence. Sleep-specific L-theanine references are shared
                with the{' '}
                <Link
                  href="/articles/l-theanine-for-sleep"
                  className="font-semibold text-brand-700 hover:text-brand-800 hover:underline"
                >
                  L-Theanine for Sleep article
                </Link>
                .
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
                ['#what-is-l-theanine', 'What Is L-Theanine?'],
                ['#mechanisms', 'How It Works'],
                ['#sleep-effects', 'Sleep Effects in ADHD'],
                ['#attention-effects', 'Attention &amp; Cognition'],
                ['#caffeine-combination', 'L-Theanine + Caffeine'],
                ['#pediatric-evidence', 'Pediatric Evidence'],
                ['#adult-evidence-gap', 'Adult Evidence Gap'],
                ['#evidence-summary', 'Evidence Summary'],
                ['#dosing', 'Dosing &amp; Timing'],
                ['#medication-interactions', 'Medication Interactions'],
                ['#who-benefits', 'Who Might Benefit'],
                ['#safety', 'Safety &amp; Side Effects'],
                ['#realistic-expectations', 'Realistic Expectations'],
                ['#tracking', 'Tracking Response'],
                ['#conclusion', 'Conclusion'],
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
                href="/articles/adhd-stack-guide"
                className="block text-sm font-medium text-brand-700 hover:text-brand-800 hover:underline"
              >
                ADHD stack guide →
              </Link>
              <Link
                href="/articles/l-theanine-for-sleep"
                className="block text-sm font-medium text-brand-700 hover:text-brand-800 hover:underline"
              >
                L-Theanine for sleep →
              </Link>
              <Link
                href="/articles/sleep-stack-guide"
                className="block text-sm font-medium text-brand-700 hover:text-brand-800 hover:underline"
              >
                Sleep stack guide →
              </Link>
              <Link
                href="/articles/anxiety-stack-guide"
                className="block text-sm font-medium text-brand-700 hover:text-brand-800 hover:underline"
              >
                Anxiety stack guide →
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
