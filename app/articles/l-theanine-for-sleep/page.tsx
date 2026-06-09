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

const SLUG = 'l-theanine-for-sleep'
const TITLE = 'L-Theanine for Sleep: Benefits, Dosage, Safety, and How It Compares'
const DESCRIPTION =
  'A practical evidence-based guide to L-theanine for sleep, including relaxation, alpha waves, dosage, safety, timing, and how it compares with magnesium and ashwagandha.'
const DATE = '2026-06-09'
const AUTHOR = 'Will'
const READING_TIME = '13 min read'
const TAGS = ['l-theanine', 'sleep', 'amino-acids', 'relaxation', 'stress']
const CATEGORY = 'amino-acids'

export const metadata = buildPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: `/articles/${SLUG}`,
  openGraphType: 'article',
})

// ─── FAQ data (also used for JSON-LD) ────────────────────────────────────────

const FAQS = [
  {
    question: 'Does L-theanine make you sleepy?',
    answer:
      'Not in the way a sedative does. L-theanine appears to promote a state of calm alertness by increasing alpha-wave activity in the brain, which may ease the mental transition toward sleep. It is not a direct sedative and does not reliably cause drowsiness on its own. People who find it most useful for sleep typically report that it helps quiet mental chatter rather than producing heavy tiredness.',
  },
  {
    question: 'How long before bed should I take L-theanine?',
    answer:
      'A commonly used timing is 30–60 minutes before bed. Some people take it earlier in the evening as part of a general wind-down routine. Avoid L-theanine products that also contain caffeine when using it for sleep purposes — these are intended for daytime focus use and the caffeine content would be counterproductive near bedtime.',
  },
  {
    question: 'Is L-theanine better than magnesium for sleep?',
    answer:
      'They address different aspects of sleep difficulty. L-theanine may be better suited when racing thoughts or mental tension are the primary barrier to sleep. Magnesium may be more helpful when physical tension, restlessness, or suboptimal mineral status is the main issue. For most people without a specific stress-driven sleep problem, magnesium glycinate is a reasonable first choice. L-theanine becomes a stronger candidate when the mind-won\'t-quiet pattern is dominant.',
  },
  {
    question: 'Can I take L-theanine with magnesium?',
    answer:
      'For most healthy adults, yes. L-theanine and magnesium work through different mechanisms and no significant adverse interaction between them is established. They are commonly combined in sleep stacks. As with any new supplement, start one first and assess your response before adding a second.',
  },
  {
    question: 'Can I take L-theanine with ashwagandha?',
    answer:
      'Generally yes, for healthy adults without relevant contraindications. L-theanine may offer shorter-term relaxation support, while ashwagandha addresses chronic stress adaptation over weeks. They complement each other conceptually, though direct combination clinical trials are limited. Start one at a time to identify effects before combining.',
  },
  {
    question: 'Is L-theanine safe every night?',
    answer:
      'L-theanine has a generally favorable safety profile in typical supplemental use based on available data. It has been consumed in significant quantities as a component of tea for centuries. However, formal long-term supplementation safety data beyond several months is limited. At standard doses (100–200 mg), daily use appears well-tolerated in healthy adults. Consult a healthcare provider if you take sedative medications, have psychiatric conditions, or are pregnant or breastfeeding.',
  },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LTheanineForSleepPage() {
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
          <span className="text-muted">June 9, 2026</span>
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
              Does L-Theanine Help With Sleep?
            </h2>
            <ul className="mt-4 space-y-2">
              <li className="flex gap-2 text-[1.01rem] leading-[1.85] text-[#46574d]">
                <span className="mt-1 flex-shrink-0 text-brand-700">▸</span>
                <span>
                  <strong>L-theanine may help most</strong> when racing thoughts, stress, or mental
                  tension are the main barrier to falling asleep — not when the problem is primarily
                  physical fatigue or circadian disruption.
                </span>
              </li>
              <li className="flex gap-2 text-[1.01rem] leading-[1.85] text-[#46574d]">
                <span className="mt-1 flex-shrink-0 text-brand-700">▸</span>
                <span>
                  <strong>It is not usually a strong sedative.</strong> L-theanine promotes
                  relaxation and calms mental arousal rather than producing direct drowsiness.
                </span>
              </li>
              <li className="flex gap-2 text-[1.01rem] leading-[1.85] text-[#46574d]">
                <span className="mt-1 flex-shrink-0 text-brand-700">▸</span>
                <span>
                  <strong>It may be better for relaxation than for severe insomnia.</strong> The
                  evidence base for direct sleep-outcome improvement is more limited than for
                  supplements like ashwagandha in stressed populations.
                </span>
              </li>
              <li className="flex gap-2 text-[1.01rem] leading-[1.85] text-[#46574d]">
                <span className="mt-1 flex-shrink-0 text-brand-700">▸</span>
                <span>
                  <strong>It pairs naturally with magnesium or ashwagandha</strong> in a sleep
                  stack — L-theanine for mental relaxation, magnesium for physical tension, and
                  ashwagandha for chronic stress adaptation.
                </span>
              </li>
            </ul>
          </section>

          {/* Main article body */}
          <section className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8 space-y-8">

            {/* What Is L-Theanine */}
            <div id="what-is-l-theanine">
              <h2 className="mb-3 text-2xl font-semibold tracking-tight text-ink">
                What Is L-Theanine?
              </h2>
              <p className="text-[1.01rem] leading-[1.85] text-[#46574d]">
                L-theanine is a non-protein amino acid found naturally in tea leaves
                (<em>Camellia sinensis</em>), and in small amounts in some mushrooms. It is one of
                the primary bioactive compounds responsible for the characteristic umami and calming
                qualities of green and black tea, and has been consumed by humans as part of tea
                for centuries.
              </p>
              <p className="mt-3 text-[1.01rem] leading-[1.85] text-[#46574d]">
                As a supplement, L-theanine is most commonly used for:
              </p>
              <ul className="mt-2 ml-5 space-y-1 list-disc text-[1.01rem] leading-[1.85] text-[#46574d]">
                <li>Relaxation and stress reduction without sedation</li>
                <li>Daytime focus and attention, often combined with caffeine</li>
                <li>Evening wind-down and pre-sleep relaxation</li>
                <li>Reducing anxiety and mental tension</li>
              </ul>
              <p className="mt-3 text-[1.01rem] leading-[1.85] text-[#46574d]">
                L-theanine is <strong>not the same as melatonin, GABA, or magnesium</strong>. It
                does not directly signal the circadian clock (melatonin), act as the primary
                inhibitory neurotransmitter (GABA), or function as an essential mineral
                (magnesium). Its mechanisms are more indirect and modulatory in nature.
              </p>
              <p className="mt-3 text-[1.01rem] leading-[1.85] text-[#46574d]">
                During the day, L-theanine is frequently paired with caffeine — a combination
                studied for attentional benefits. For sleep use, caffeine-free standalone
                L-theanine supplements (or caffeine-free tea forms) are appropriate. Green tea
                itself contains both L-theanine and caffeine, making it poorly suited for evening
                sleep support.
              </p>
            </div>

            <hr className="border-brand-900/10" />

            {/* How L-Theanine May Affect Sleep */}
            <div id="mechanisms">
              <h2 className="mb-3 text-2xl font-semibold tracking-tight text-ink">
                How L-Theanine May Affect Sleep
              </h2>
              <p className="text-[1.01rem] leading-[1.85] text-[#46574d]">
                L-theanine&apos;s proposed effects on sleep are primarily indirect — it appears to
                reduce the mental arousal and stress-related hyperactivation that can delay sleep
                onset, rather than producing direct sedation.
              </p>

              <h3 className="mt-5 mb-1 text-xl font-semibold tracking-tight text-ink">
                Alpha-Wave Activity
              </h3>
              <p className="text-[1.01rem] leading-[1.85] text-[#46574d]">
                One of the most replicated findings is that L-theanine appears to increase alpha
                brainwave activity — the neural oscillation pattern associated with calm, wakeful
                relaxation. This effect has been observed in EEG studies within roughly 30–60
                minutes of ingestion. Alpha waves are prominent during relaxed wakefulness and
                the early stages of the sleep transition, which may support a smoother onset of
                sleep in people who are mentally overactivated at bedtime.
              </p>

              <h3 className="mt-5 mb-1 text-xl font-semibold tracking-tight text-ink">
                Relaxation Without Heavy Sedation
              </h3>
              <p className="text-[1.01rem] leading-[1.85] text-[#46574d]">
                Unlike benzodiazepines, antihistamines, or valerian at higher doses, L-theanine
                does not typically produce strong drowsiness. The experience most often described
                is a quieting of mental noise without impairment of cognitive function — which may
                be why it is also used during the day for calm focus. For sleep, this means it may
                lower the activation threshold for sleep onset without making the next morning
                feel heavy.
              </p>

              <h3 className="mt-5 mb-1 text-xl font-semibold tracking-tight text-ink">
                Glutamate / GABA Modulation
              </h3>
              <p className="text-[1.01rem] leading-[1.85] text-[#46574d]">
                Mechanistic evidence suggests L-theanine may modulate glutamate (excitatory) and
                GABA (inhibitory) neurotransmitter systems — though the precise mechanisms at
                typical supplemental doses in humans are not fully characterized. It has structural
                similarity to glutamate and may interact with glutamate receptors, potentially
                reducing excitatory tone. Some preclinical data also suggests effects on GABA-A
                receptor activity. These pathways remain under investigation and should be
                described cautiously.
              </p>

              <h3 className="mt-5 mb-1 text-xl font-semibold tracking-tight text-ink">
                Stress-Response Modulation
              </h3>
              <p className="text-[1.01rem] leading-[1.85] text-[#46574d]">
                L-theanine has been studied for its effects on physiological stress markers,
                including heart rate, salivary cortisol, and self-reported anxiety. Some trials
                suggest attenuation of acute stress responses. For sleep, this may be relevant
                because elevated evening stress physiology (elevated cortisol, increased heart
                rate, heightened sympathetic tone) is a primary driver of delayed sleep onset and
                fragmented sleep.
              </p>

              <h3 className="mt-5 mb-1 text-xl font-semibold tracking-tight text-ink">
                Reduced Mental Arousal Before Bed
              </h3>
              <p className="text-[1.01rem] leading-[1.85] text-[#46574d]">
                The combination of alpha-wave promotion, reduced stress reactivity, and possible
                glutamate modulation may collectively reduce the mental arousal state that keeps
                cognitively overactive individuals awake. This makes L-theanine most likely
                to show benefit in people whose primary sleep complaint is an inability to quiet
                racing thoughts — rather than difficulty maintaining sleep once asleep, or early
                morning awakening unrelated to stress.
              </p>
            </div>

            <hr className="border-brand-900/10" />

            {/* Evidence Summary */}
            {/* TODO: Replace evidence grade with workbook-verified grade once evidence pipeline runs for L-theanine sleep */}
            {/* TODO: Insert exact PMIDs for L-theanine sleep trials from workbook */}
            {/* TODO: Verify trial n-sizes for sleep-specific outcomes */}
            {/* TODO: Verify stress/anxiety outcomes relevant to sleep from workbook */}
            <div id="evidence-summary">
              <h2 className="mb-4 text-2xl font-semibold tracking-tight text-ink">
                Evidence Summary
              </h2>

              <EvidenceSummaryCard
                title="L-Theanine &amp; Sleep Quality"
                evidenceLevel="Limited"
                humanEvidence="Some controlled trials suggest L-theanine may improve subjective sleep quality, sleep satisfaction, and reduce sleep latency — particularly in populations with anxiety, stress, or hyperarousal at baseline. Evidence specific to sleep outcomes (distinct from general relaxation) is less robust than the relaxation literature. Direct sleep RCT evidence is limited; most well-designed trials have focused on stress and anxiety outcomes, from which sleep benefits are often inferred. TODO: verify n-sizes and PSQI/ISI outcomes from workbook evidence pipeline."
                mechanisticEvidence="Alpha-wave induction is the most replicated finding in EEG studies. Proposed modulation of glutamate/GABA signaling is biologically plausible but incompletely characterized at typical human doses. Stress-response attenuation (cortisol, heart rate) is supported by some trials. Mechanistic data is reasonably coherent but clinical translation to sleep endpoints requires further trial-level confirmation."
                safetyProfile="Generally well-tolerated in available trials and in long-term tea consumption. Reported adverse effects are mild (headache, dizziness, GI discomfort) and uncommon. No major drug interactions established, though caution is warranted with sedatives and blood pressure medications. Pregnancy/breastfeeding safety data is insufficient."
              />

              <div className="mt-4 rounded-[1rem] border border-brand-900/10 bg-brand-50/60 p-4 text-sm leading-7 text-[#46574d]">
                <p className="font-semibold text-ink">Key studies referenced:</p>
                {/* TODO: Populate PMID links from workbook once evidence pipeline is complete */}
                {/* TODO: Verify L-theanine ADHD/pediatric sleep evidence before including — only cite if verified */}
                <ul className="mt-2 ml-5 space-y-1 list-disc">
                  <li>
                    L-theanine and sleep quality in boys with ADHD — naturalistic sleep improvement
                    observed (TODO: confirm PMID and n-size from workbook)
                  </li>
                  <li>
                    L-theanine and stress responses — attenuation of physiological arousal markers
                    in multiple trials (TODO: confirm PMIDs from workbook)
                  </li>
                  <li>
                    L-theanine alpha-wave EEG studies — increased alpha activity within 30–60 min
                    of ingestion (TODO: confirm PMIDs from workbook)
                  </li>
                </ul>
                <p className="mt-2 text-xs text-muted">
                  Full reference table in Sources section below. PMID links and n-sizes will be
                  added once workbook evidence pipeline is complete for L-theanine.
                </p>
              </div>
            </div>

            <hr className="border-brand-900/10" />

            {/* Dosage and Timing */}
            {/* TODO: Verify exact dose range from workbook evidence pipeline */}
            {/* TODO: Verify timing recommendations from L-theanine sleep trials */}
            {/* TODO: Verify pediatric/ADHD sleep dosing if referenced — confirm before citing */}
            <div id="dosage">
              <h2 className="mb-4 text-2xl font-semibold tracking-tight text-ink">
                Dosage and Timing
              </h2>

              <div className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-5 shadow-sm">
                <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-muted">
                  Dosage Reference — Sleep Protocols
                </p>
                <ResponsiveTable label="L-theanine dosage reference table for sleep">
                  <table className="min-w-[520px] w-full text-sm">
                    <thead>
                      <tr className="border-b border-brand-900/10">
                        <th className="pb-2 pr-4 text-left text-xs font-bold uppercase tracking-wider text-muted">
                          Use Case
                        </th>
                        <th className="pb-2 pr-4 text-left text-xs font-bold uppercase tracking-wider text-muted">
                          Dose Range
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
                        <td className="py-3 pr-4 font-medium text-ink">Pre-sleep relaxation</td>
                        {/* TODO: Verify exact dose range from workbook — 100–200 mg is commonly cited but confirm */}
                        <td className="py-3 pr-4 text-[#46574d]">100–200 mg (TODO: verify)</td>
                        <td className="py-3 pr-4 text-[#46574d]">30–60 min before bed</td>
                        <td className="py-3 text-[#46574d]">
                          Caffeine-free product only; start at lower end
                        </td>
                      </tr>
                      <tr className="align-top">
                        <td className="py-3 pr-4 font-medium text-ink">Evening wind-down</td>
                        <td className="py-3 pr-4 text-[#46574d]">100–200 mg (TODO: verify)</td>
                        <td className="py-3 pr-4 text-[#46574d]">1–2 hours before bed</td>
                        <td className="py-3 text-[#46574d]">
                          Can be taken earlier as part of wind-down routine
                        </td>
                      </tr>
                      <tr className="align-top">
                        <td className="py-3 pr-4 font-medium text-ink">Stack with magnesium</td>
                        <td className="py-3 pr-4 text-[#46574d]">100–200 mg (TODO: verify)</td>
                        <td className="py-3 pr-4 text-[#46574d]">
                          Both 30–60 min before bed
                        </td>
                        <td className="py-3 text-[#46574d]">
                          Introduce one at a time before combining
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </ResponsiveTable>
                <p className="mt-3 text-xs text-muted">
                  Dose ranges above reflect commonly used supplemental amounts and require
                  verification against workbook evidence data. Do not use caffeinated tea or
                  caffeine-containing L-theanine extracts near bedtime.
                </p>
              </div>

              <div className="mt-4 rounded-[1rem] border border-brand-900/10 bg-brand-50/60 p-4 text-sm leading-7 text-[#46574d]">
                <p className="font-semibold text-ink">Practical timing notes:</p>
                <ul className="mt-2 ml-5 space-y-1 list-disc">
                  <li>
                    Most commercial L-theanine products offer 100 mg or 200 mg per serving —
                    starting at the lower end is reasonable for a first trial.
                  </li>
                  <li>
                    If using L-theanine earlier in the evening for general wind-down rather than
                    as a direct pre-sleep supplement, the timing flexibility is wider.
                  </li>
                  <li>
                    <strong>Avoid caffeine-containing products near bedtime.</strong> Green tea
                    extract products and &ldquo;nootropic&rdquo; blends often combine L-theanine
                    with caffeine — these are not appropriate for sleep use.
                  </li>
                </ul>
              </div>
            </div>

            <hr className="border-brand-900/10" />

            {/* L-Theanine vs Magnesium */}
            <div id="vs-magnesium">
              <h2 className="mb-4 text-2xl font-semibold tracking-tight text-ink">
                L-Theanine vs Magnesium for Sleep
              </h2>
              <p className="mb-4 text-[1.01rem] leading-[1.85] text-[#46574d]">
                Both L-theanine and magnesium are commonly used for sleep support, but they suit
                different patterns of sleep difficulty.
              </p>

              <ResponsiveTable label="L-theanine vs magnesium for sleep comparison">
                <table className="min-w-[560px] w-full text-sm">
                  <thead>
                    <tr className="border-b border-brand-900/10">
                      <th className="pb-2 pr-4 text-left text-xs font-bold uppercase tracking-wider text-muted">
                        Factor
                      </th>
                      <th className="pb-2 pr-4 text-left text-xs font-bold uppercase tracking-wider text-muted">
                        L-Theanine
                      </th>
                      <th className="pb-2 text-left text-xs font-bold uppercase tracking-wider text-muted">
                        Magnesium
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-900/5">
                    <tr className="align-top">
                      <td className="py-3 pr-4 font-medium text-ink">Primary benefit</td>
                      <td className="py-3 pr-4 text-[#46574d]">
                        Mental relaxation, quieting racing thoughts
                      </td>
                      <td className="py-3 text-[#46574d]">
                        Physical relaxation, muscle tension, mineral support
                      </td>
                    </tr>
                    <tr className="align-top">
                      <td className="py-3 pr-4 font-medium text-ink">Best suited for</td>
                      <td className="py-3 pr-4 text-[#46574d]">
                        Mind-racing at bedtime, stress-driven mental arousal
                      </td>
                      <td className="py-3 text-[#46574d]">
                        Body tension, restlessness, general sleep quality
                      </td>
                    </tr>
                    <tr className="align-top">
                      <td className="py-3 pr-4 font-medium text-ink">Main mechanism</td>
                      <td className="py-3 pr-4 text-[#46574d]">
                        Alpha-wave induction, glutamate modulation, stress attenuation
                      </td>
                      <td className="py-3 text-[#46574d]">
                        NMDA antagonism, GABA support, melatonin pathway, muscle relaxation
                      </td>
                    </tr>
                    <tr className="align-top">
                      <td className="py-3 pr-4 font-medium text-ink">Evidence strength</td>
                      <td className="py-3 pr-4 text-[#46574d]">
                        Limited (direct sleep); Moderate (relaxation/stress)
                      </td>
                      <td className="py-3 text-[#46574d]">
                        Limited–Moderate (sleep), stronger in deficient populations
                      </td>
                    </tr>
                    <tr className="align-top">
                      <td className="py-3 pr-4 font-medium text-ink">First-line choice?</td>
                      <td className="py-3 pr-4 text-[#46574d]">
                        When mental tension is the dominant issue
                      </td>
                      <td className="py-3 text-[#46574d]">
                        Usually a better baseline first choice for most people
                      </td>
                    </tr>
                    <tr className="align-top">
                      <td className="py-3 pr-4 font-medium text-ink">Can combine?</td>
                      <td className="py-3 pr-4 text-[#46574d]">Yes</td>
                      <td className="py-3 text-[#46574d]">Yes — reasonable relaxation stack</td>
                    </tr>
                  </tbody>
                </table>
              </ResponsiveTable>

              <p className="mt-4 text-[1.01rem] leading-[1.85] text-[#46574d]">
                Magnesium is generally the more reasonable first supplement to try because it
                addresses a wider range of sleep barriers (mineral repletion, muscle relaxation,
                nervous system excitability), has fewer form-selection pitfalls, and has a broader
                safety dataset. L-theanine becomes a stronger candidate when the problem is
                specifically mental: a busy, anxious mind that won&apos;t quieten even when the
                body feels tired.
              </p>

              <p className="mt-3 text-sm text-muted">
                For a detailed evidence review of magnesium for sleep, see the{' '}
                <Link
                  href="/articles/magnesium-for-sleep"
                  className="font-semibold text-brand-700 hover:text-brand-800 hover:underline"
                >
                  Magnesium for Sleep article
                </Link>{' '}
                and the{' '}
                <Link
                  href="/articles/magnesium-types-for-sleep"
                  className="font-semibold text-brand-700 hover:text-brand-800 hover:underline"
                >
                  Magnesium Types for Sleep guide
                </Link>
                .
              </p>
            </div>

            <hr className="border-brand-900/10" />

            {/* L-Theanine vs Ashwagandha */}
            <div id="vs-ashwagandha">
              <h2 className="mb-4 text-2xl font-semibold tracking-tight text-ink">
                L-Theanine vs Ashwagandha for Sleep
              </h2>
              <p className="mb-4 text-[1.01rem] leading-[1.85] text-[#46574d]">
                Both L-theanine and ashwagandha are used to address stress-related sleep
                difficulties, but they work on different timescales and suit different patterns of
                chronic vs acute stress.
              </p>

              <ResponsiveTable label="L-theanine vs ashwagandha for sleep comparison">
                <table className="min-w-[560px] w-full text-sm">
                  <thead>
                    <tr className="border-b border-brand-900/10">
                      <th className="pb-2 pr-4 text-left text-xs font-bold uppercase tracking-wider text-muted">
                        Factor
                      </th>
                      <th className="pb-2 pr-4 text-left text-xs font-bold uppercase tracking-wider text-muted">
                        L-Theanine
                      </th>
                      <th className="pb-2 text-left text-xs font-bold uppercase tracking-wider text-muted">
                        Ashwagandha
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-900/5">
                    <tr className="align-top">
                      <td className="py-3 pr-4 font-medium text-ink">Effect timescale</td>
                      <td className="py-3 pr-4 text-[#46574d]">
                        Shorter-term relaxation; effects may be noticeable within hours
                      </td>
                      <td className="py-3 text-[#46574d]">
                        Stress adaptation over weeks; effects typically at 6–8 weeks
                      </td>
                    </tr>
                    <tr className="align-top">
                      <td className="py-3 pr-4 font-medium text-ink">Best suited for</td>
                      <td className="py-3 pr-4 text-[#46574d]">
                        Situational or acute mental tension at bedtime
                      </td>
                      <td className="py-3 text-[#46574d]">
                        Chronic stress as the primary driver of poor sleep
                      </td>
                    </tr>
                    <tr className="align-top">
                      <td className="py-3 pr-4 font-medium text-ink">Trial speed</td>
                      <td className="py-3 pr-4 text-[#46574d]">
                        Easier to trial quickly — effects (or lack thereof) apparent within days
                      </td>
                      <td className="py-3 text-[#46574d]">
                        Requires weeks to properly evaluate; do not assess on a few nights
                      </td>
                    </tr>
                    <tr className="align-top">
                      <td className="py-3 pr-4 font-medium text-ink">Evidence strength (sleep)</td>
                      <td className="py-3 pr-4 text-[#46574d]">
                        Limited direct sleep RCTs
                      </td>
                      <td className="py-3 text-[#46574d]">
                        Moderate — multiple RCTs in stressed adults
                      </td>
                    </tr>
                    <tr className="align-top">
                      <td className="py-3 pr-4 font-medium text-ink">Safety profile</td>
                      <td className="py-3 pr-4 text-[#46574d]">
                        Fewer contraindications; no pregnancy / thyroid concerns established
                      </td>
                      <td className="py-3 text-[#46574d]">
                        Avoid in pregnancy; thyroid, autoimmune cautions
                      </td>
                    </tr>
                  </tbody>
                </table>
              </ResponsiveTable>

              <p className="mt-4 text-[1.01rem] leading-[1.85] text-[#46574d]">
                If you want to trial a relaxation supplement quickly and your main complaint is an
                overactive mind at bedtime, L-theanine may give a faster signal (positive or null).
                If chronic, ongoing stress is your primary sleep disruptor and you are willing to
                commit to a 6–8 week trial, ashwagandha has more direct evidence for sleep quality
                improvement in that population.
              </p>

              <p className="mt-3 text-sm text-muted">
                For the full clinical review of ashwagandha for sleep, see the{' '}
                <Link
                  href="/articles/ashwagandha-for-sleep"
                  className="font-semibold text-brand-700 hover:text-brand-800 hover:underline"
                >
                  Ashwagandha for Sleep article
                </Link>{' '}
                and the{' '}
                <Link
                  href="/articles/ashwagandha-vs-magnesium-for-sleep"
                  className="font-semibold text-brand-700 hover:text-brand-800 hover:underline"
                >
                  Ashwagandha vs Magnesium for Sleep comparison
                </Link>
                .
              </p>
            </div>

            <hr className="border-brand-900/10" />

            {/* Can You Combine */}
            {/* TODO: Search workbook for any direct combination trial evidence (L-theanine + magnesium or L-theanine + ashwagandha co-administration) */}
            <div id="combining">
              <h2 className="mb-3 text-2xl font-semibold tracking-tight text-ink">
                Can You Combine L-Theanine With Magnesium or Ashwagandha?
              </h2>
              <p className="text-[1.01rem] leading-[1.85] text-[#46574d]">
                Combining these supplements is a common approach in sleep stacks, and for most
                healthy adults it is generally considered reasonable. However, cautious language
                is warranted: direct combination clinical trials are limited, and the evidence base
                for any specific multi-supplement combination is thinner than for each supplement
                studied individually.
              </p>

              <div className="mt-4 space-y-4">
                <div className="rounded-[1rem] border border-brand-900/10 bg-brand-50/60 p-4 text-sm leading-7 text-[#46574d]">
                  <p className="font-semibold text-ink">L-Theanine + Magnesium</p>
                  <p className="mt-1">
                    A reasonable relaxation stack. L-theanine targets mental calm; magnesium
                    addresses physical tension and NMDA/GABA pathways. No known adverse
                    interaction. Take both 30–60 minutes before bed.
                  </p>
                </div>
                <div className="rounded-[1rem] border border-brand-900/10 bg-brand-50/60 p-4 text-sm leading-7 text-[#46574d]">
                  <p className="font-semibold text-ink">L-Theanine + Ashwagandha</p>
                  <p className="mt-1">
                    A stress and relaxation support combination. L-theanine may offer more
                    immediate relaxation, while ashwagandha works on chronic HPA axis adaptation
                    over weeks. No established adverse interaction in healthy adults.
                  </p>
                </div>
                <div className="rounded-[1rem] border border-brand-900/10 bg-brand-50/60 p-4 text-sm leading-7 text-[#46574d]">
                  <p className="font-semibold text-ink">All Three (L-Theanine + Magnesium + Ashwagandha)</p>
                  <p className="mt-1">
                    A possible sleep stack. Direct combination trials for all three together are
                    likely limited or absent (TODO: confirm workbook evidence status). Combining
                    three supplements simultaneously makes it difficult to identify what is
                    helping or causing side effects.
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-[1rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm text-sm leading-7 text-[#46574d]">
                <p className="font-semibold text-ink">Practical approach for combining:</p>
                <ul className="mt-2 ml-5 space-y-1 list-disc">
                  <li>
                    Start one supplement at a time. Assess your response over 1–2 weeks before
                    adding a second.
                  </li>
                  <li>
                    If you take prescription sedatives, benzodiazepines, z-drugs, or psychiatric
                    medications, consult a clinician before adding any sleep supplement.
                  </li>
                  <li>
                    Starting all three on the same night makes it impossible to attribute effects
                    or side effects to any single supplement.
                  </li>
                </ul>
              </div>
            </div>

            <hr className="border-brand-900/10" />

            {/* Product Recommendations */}
            <div id="product-recommendations">
              <h2 className="mb-3 text-2xl font-semibold tracking-tight text-ink">
                L-Theanine Product Options
              </h2>
              <p className="text-[1.01rem] leading-[1.85] text-[#46574d]">
                These products represent the dose ranges and forms most consistent with L-theanine
                sleep and relaxation use. Affiliate links support this site at no additional cost
                to you.
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm">
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted">
                    L-Theanine — Lower Dose
                  </p>
                  <p className="font-semibold text-ink">L-Theanine 100 mg</p>
                  <p className="mt-1 text-xs leading-5 text-[#46574d]">
                    A conservative starting dose for pre-sleep relaxation. Caffeine-free standalone
                    supplement. Good for sensitive users or first-time trial.
                  </p>
                  <a
                    href={`https://www.amazon.com/s?k=l-theanine+100mg+sleep&tag=${AFFILIATE_TAGS.amazon}`}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    className="mt-3 inline-flex items-center gap-1 rounded-full bg-brand-950 px-4 py-1.5 text-xs font-bold text-white transition hover:bg-brand-900"
                  >
                    View on Amazon →
                  </a>
                </div>
                <div className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm">
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted">
                    L-Theanine — Standard Dose
                  </p>
                  <p className="font-semibold text-ink">L-Theanine 200 mg</p>
                  <p className="mt-1 text-xs leading-5 text-[#46574d]">
                    The most common dose used in relaxation and sleep-support trials. Caffeine-free
                    only. Avoid &ldquo;focus blend&rdquo; products containing caffeine for
                    nighttime use.
                  </p>
                  <a
                    href={`https://www.amazon.com/s?k=l-theanine+200mg+sleep&tag=${AFFILIATE_TAGS.amazon}`}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    className="mt-3 inline-flex items-center gap-1 rounded-full bg-brand-950 px-4 py-1.5 text-xs font-bold text-white transition hover:bg-brand-900"
                  >
                    View on Amazon →
                  </a>
                </div>
                <div className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm">
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted">
                    L-Theanine + Magnesium Stack
                  </p>
                  <p className="font-semibold text-ink">L-Theanine &amp; Magnesium Glycinate</p>
                  <p className="mt-1 text-xs leading-5 text-[#46574d]">
                    Combined mental and physical relaxation support. Look for products with
                    L-theanine 100–200 mg and magnesium glycinate 200–400 mg elemental — no
                    caffeine or melatonin added.
                  </p>
                  <a
                    href={`https://www.amazon.com/s?k=l-theanine+magnesium+glycinate+sleep&tag=${AFFILIATE_TAGS.amazon}`}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    className="mt-3 inline-flex items-center gap-1 rounded-full bg-brand-950 px-4 py-1.5 text-xs font-bold text-white transition hover:bg-brand-900"
                  >
                    View on Amazon →
                  </a>
                </div>
                <div className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm">
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted">
                    Caffeine-Free Sleep Stack
                  </p>
                  <p className="font-semibold text-ink">Sleep Support Stack (No Caffeine)</p>
                  <p className="mt-1 text-xs leading-5 text-[#46574d]">
                    Multi-ingredient sleep formulas combining L-theanine with magnesium and/or
                    ashwagandha. Verify that the product is caffeine-free and contains clinically
                    relevant dose amounts before purchasing.
                  </p>
                  <a
                    href={`https://www.amazon.com/s?k=l-theanine+ashwagandha+magnesium+sleep+stack+caffeine+free&tag=${AFFILIATE_TAGS.amazon}`}
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
            {/* TODO: Add workbook-verified safety citations for L-theanine */}
            {/* TODO: Verify blood pressure interaction evidence from workbook */}
            <div id="safety">
              <h2 className="mb-4 text-2xl font-semibold tracking-tight text-ink">
                Safety and Side Effects
              </h2>
              <SafetyNotice title="Safety Summary — L-Theanine for Sleep">
                <ul className="ml-5 space-y-1.5 list-disc">
                  <li>
                    <strong>Generally well-tolerated</strong> in typical supplemental use. L-theanine
                    has a long history of consumption as a tea component and has been studied in
                    clinical trials without major safety signals at standard doses.
                  </li>
                  <li>
                    <strong>Common mild side effects</strong> may include headache, dizziness,
                    and GI discomfort — these are reported infrequently in trials and are not
                    specific to sleep-dose ranges.
                  </li>
                  <li>
                    <strong>Sedative medications:</strong> L-theanine may add to the CNS-depressant
                    effects of prescription sedatives, benzodiazepines, z-drugs, or other
                    sleep medications. Do not combine without clinician guidance.
                  </li>
                  <li>
                    <strong>Blood pressure medications:</strong> Some evidence suggests L-theanine
                    may have mild blood pressure-lowering effects. Use with caution if you take
                    antihypertensive medications (TODO: verify from workbook safety data).
                  </li>
                  <li>
                    <strong>Psychiatric medications:</strong> Consult a clinician before combining
                    L-theanine with anxiolytics, antidepressants, or antipsychotics.
                  </li>
                  <li>
                    <strong>Pregnancy and breastfeeding:</strong> Insufficient human safety data
                    for supplemental L-theanine during pregnancy or breastfeeding. Consult a
                    clinician before use.
                  </li>
                  <li>
                    <strong>Do not use to cover up severe insomnia.</strong> Persistent insomnia,
                    sleep apnea symptoms, or major daytime impairment warrant clinical evaluation.
                    L-theanine is not a substitute for medical assessment or CBT-I.
                  </li>
                </ul>
              </SafetyNotice>
            </div>

            <hr className="border-brand-900/10" />

            {/* Who Should Try It */}
            <div id="decision-framework">
              <h2 className="mb-4 text-2xl font-semibold tracking-tight text-ink">
                Who Should Try It?
              </h2>
              <div className="rounded-[1rem] border border-brand-900/10 bg-brand-50/60 p-5">
                <ul className="space-y-3 text-[1.01rem] leading-[1.85] text-[#46574d]">
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 font-bold text-ink">
                      Try L-theanine if:
                    </span>
                    <span>
                      Racing thoughts, mental chatter, or stress-driven mental arousal keep
                      you awake at bedtime. It is most likely to show benefit in this pattern.
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 font-bold text-ink">
                      Try magnesium first if:
                    </span>
                    <span>
                      Muscle tension, physical restlessness, or general sleep quality without
                      a strong mental arousal component is your main issue. Magnesium glycinate
                      is typically the better first-line sleep supplement for most people.
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 font-bold text-ink">
                      Try ashwagandha if:
                    </span>
                    <span>
                      Chronic, ongoing stress is the primary driver of your sleep problems and
                      you are willing to commit to a 6–8 week trial. Ashwagandha has more
                      direct sleep-outcome evidence in chronically stressed populations.
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 font-bold text-ink">
                      Consult a sleep specialist or doctor if:
                    </span>
                    <span>
                      Sleep problems are severe, chronic (more than 3 months), or include
                      symptoms of sleep apnea (loud snoring, witnessed pauses, gasping,
                      excessive daytime sleepiness). No supplement addresses obstructive sleep
                      apnea, and supplements are not a substitute for clinical evaluation.
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            <hr className="border-brand-900/10" />

            {/* What Not To Do */}
            <div id="what-not-to-do">
              <h2 className="mb-4 text-2xl font-semibold tracking-tight text-ink">
                What Not To Do
              </h2>
              <ul className="space-y-3 text-[1.01rem] leading-[1.85] text-[#46574d]">
                <li className="flex gap-2">
                  <span className="mt-1 flex-shrink-0 text-brand-700">✕</span>
                  <span>
                    <strong>Do not take caffeinated green tea at bedtime</strong> for L-theanine
                    content. Green tea contains caffeine alongside L-theanine; for sleep purposes,
                    use caffeine-free standalone supplements only.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-1 flex-shrink-0 text-brand-700">✕</span>
                  <span>
                    <strong>Do not stack five sleep aids at once.</strong> Adding L-theanine on top
                    of melatonin, magnesium, ashwagandha, and valerian simultaneously makes it
                    impossible to know what is working and increases the risk of additive effects.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-1 flex-shrink-0 text-brand-700">✕</span>
                  <span>
                    <strong>Do not assume &ldquo;natural&rdquo; means risk-free.</strong> L-theanine
                    has drug interaction potential (sedatives, blood pressure medications) and
                    populations who should avoid it or use it cautiously (pregnant/breastfeeding,
                    on sedative medication).
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-1 flex-shrink-0 text-brand-700">✕</span>
                  <span>
                    <strong>Do not megadose.</strong> Evidence does not support dose escalation
                    beyond studied ranges, and very high doses of any supplement increase the risk
                    of adverse effects without established additional benefit.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-1 flex-shrink-0 text-brand-700">✕</span>
                  <span>
                    <strong>Do not ignore sleep apnea signs.</strong> Loud snoring, witnessed
                    breathing pauses, gasping awake, or severe daytime sleepiness should prompt
                    medical evaluation — not supplementation. Sleep apnea is common,
                    underdiagnosed, and not addressable by any supplement.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-1 flex-shrink-0 text-brand-700">✕</span>
                  <span>
                    <strong>Do not mix with prescription sedatives</strong> (benzodiazepines,
                    z-drugs, barbiturates) without medical advice. The combination may produce
                    excessive CNS depression.
                  </span>
                </li>
              </ul>
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
                  href="/articles/best-herbs-for-sleep"
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
                    Evidence, magnesium types, dosage, and safety — and how magnesium compares
                    to L-theanine and ashwagandha.
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
                    Deep dive: glycinate vs threonate vs citrate vs oxide — which form to
                    choose for sleep.
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
                    Evidence, dosage, and mechanisms for ashwagandha — and how it compares
                    to L-theanine.
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
                    Side-by-side comparison — mechanisms, evidence, safety, and whether combining
                    them makes sense.
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
              </div>
            </div>

            <hr className="border-brand-900/10" />

            {/* Sources */}
            {/* TODO: Replace placeholder stubs with workbook-verified references once evidence pipeline runs for L-theanine */}
            {/* TODO: Add exact PMIDs for L-theanine sleep trials */}
            {/* TODO: Add exact PMIDs for L-theanine stress/anxiety trials */}
            {/* TODO: Add exact PMIDs for L-theanine safety evidence */}
            {/* TODO: Add exact PMIDs for L-theanine + caffeine trials — only include if caffeine interaction is discussed */}
            {/* TODO: Confirm whether any direct combination trial (L-theanine + magnesium or L-theanine + ashwagandha) exists in workbook */}
            {/* TODO: Include L-theanine pediatric/ADHD sleep evidence only if verified from workbook */}
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
                        L-theanine sleep evidence — sleep quality outcomes in clinical populations
                      </td>
                      <td className="py-3 pr-4 text-muted">—</td>
                      <td className="py-3 pr-4 text-muted">—</td>
                      <td className="py-3 text-muted">
                        {/* TODO: Add PMID for L-theanine sleep RCT from workbook */}
                        TODO: Add PMID — workbook verification required
                      </td>
                    </tr>
                    <tr className="align-top">
                      <td className="py-3 pr-3 text-muted">2</td>
                      <td className="py-3 pr-4 leading-6 text-ink">
                        L-theanine stress/anxiety evidence — stress marker attenuation, alpha-wave
                        induction
                      </td>
                      <td className="py-3 pr-4 text-muted">—</td>
                      <td className="py-3 pr-4 text-muted">—</td>
                      <td className="py-3 text-muted">
                        {/* TODO: Add PMIDs for L-theanine stress trials from workbook */}
                        TODO: Add PMIDs — workbook verification required
                      </td>
                    </tr>
                    <tr className="align-top">
                      <td className="py-3 pr-3 text-muted">3</td>
                      <td className="py-3 pr-4 leading-6 text-ink">
                        L-theanine safety evidence — adverse event profile in clinical trials and
                        post-market surveillance
                      </td>
                      <td className="py-3 pr-4 text-muted">—</td>
                      <td className="py-3 pr-4 text-muted">—</td>
                      <td className="py-3 text-muted">
                        {/* TODO: Add PMID for L-theanine safety reference from workbook */}
                        TODO: Add PMID — workbook verification required
                      </td>
                    </tr>
                    <tr className="align-top">
                      <td className="py-3 pr-3 text-muted">4</td>
                      <td className="py-3 pr-4 leading-6 text-ink">
                        L-theanine + caffeine evidence — combination effects on cognitive performance
                        (daytime use; cited for contrast)
                      </td>
                      <td className="py-3 pr-4 text-muted">—</td>
                      <td className="py-3 pr-4 text-muted">—</td>
                      <td className="py-3 text-muted">
                        {/* TODO: Add PMIDs for L-theanine + caffeine evidence only if referenced in article */}
                        TODO: Add PMIDs — workbook verification required
                      </td>
                    </tr>
                    <tr className="align-top">
                      <td className="py-3 pr-3 text-muted">5</td>
                      <td className="py-3 pr-4 leading-6 text-ink">
                        L-theanine pediatric/ADHD sleep evidence — only to be included if
                        workbook verification confirms evidence quality
                      </td>
                      <td className="py-3 pr-4 text-muted">—</td>
                      <td className="py-3 pr-4 text-muted">—</td>
                      <td className="py-3 text-muted">
                        {/* TODO: Verify from workbook before including — do not cite unverified pediatric evidence */}
                        TODO: Workbook verification required before inclusion
                      </td>
                    </tr>
                    <tr className="align-top">
                      <td className="py-3 pr-3 text-muted">6</td>
                      <td className="py-3 pr-4 leading-6 text-ink">
                        Combination evidence — L-theanine + magnesium or L-theanine + ashwagandha
                        co-administration
                      </td>
                      <td className="py-3 pr-4 text-muted">—</td>
                      <td className="py-3 pr-4 text-muted">—</td>
                      <td className="py-3 text-muted">
                        {/* TODO: Search workbook for any direct combination trial */}
                        TODO: Search workbook — combination evidence status unknown
                      </td>
                    </tr>
                  </tbody>
                </table>
              </ResponsiveTable>
              <p className="mt-3 text-xs text-muted">
                PMID links, author details, and n-sizes will be added once the workbook evidence
                pipeline completes for L-theanine. Magnesium evidence references are shared with
                the{' '}
                <Link
                  href="/articles/magnesium-for-sleep"
                  className="font-semibold text-brand-700 hover:text-brand-800 hover:underline"
                >
                  Magnesium for Sleep article
                </Link>
                . Ashwagandha evidence references are shared with the{' '}
                <Link
                  href="/articles/ashwagandha-for-sleep"
                  className="font-semibold text-brand-700 hover:text-brand-800 hover:underline"
                >
                  Ashwagandha for Sleep article
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
                ['#mechanisms', 'How It Affects Sleep'],
                ['#evidence-summary', 'Evidence Summary'],
                ['#dosage', 'Dosage &amp; Timing'],
                ['#product-recommendations', 'Product Options'],
                ['#vs-magnesium', 'vs Magnesium'],
                ['#vs-ashwagandha', 'vs Ashwagandha'],
                ['#combining', 'Combining Supplements'],
                ['#safety', 'Safety &amp; Side Effects'],
                ['#decision-framework', 'Who Should Try It?'],
                ['#what-not-to-do', 'What Not To Do'],
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
                href="/articles/best-herbs-for-sleep"
                className="block text-sm font-medium text-brand-700 hover:text-brand-800 hover:underline"
              >
                Best herbs for sleep →
              </Link>
              <Link
                href="/articles/magnesium-for-sleep"
                className="block text-sm font-medium text-brand-700 hover:text-brand-800 hover:underline"
              >
                Magnesium for sleep →
              </Link>
              <Link
                href="/articles/magnesium-types-for-sleep"
                className="block text-sm font-medium text-brand-700 hover:text-brand-800 hover:underline"
              >
                Magnesium types for sleep →
              </Link>
              <Link
                href="/articles/ashwagandha-for-sleep"
                className="block text-sm font-medium text-brand-700 hover:text-brand-800 hover:underline"
              >
                Ashwagandha for sleep →
              </Link>
              <Link
                href="/articles/ashwagandha-vs-magnesium-for-sleep"
                className="block text-sm font-medium text-brand-700 hover:text-brand-800 hover:underline"
              >
                Ashwagandha vs magnesium →
              </Link>
              <Link
                href="/sleep-herbs-vs-melatonin"
                className="block text-sm font-medium text-brand-700 hover:text-brand-800 hover:underline"
              >
                Sleep herbs vs melatonin →
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
