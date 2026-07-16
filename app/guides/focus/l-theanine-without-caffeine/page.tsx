import Link from 'next/link'
import Image from 'next/image'
import JsonLd from '@/components/seo/JsonLd'
import type { Metadata } from 'next'
import { buildPageMetadata, blogJsonLd, breadcrumbJsonLd, faqPageJsonLd, compactMetaTitle } from '../../../../src/lib/seo'
import LastUpdatedBadge from '../../../../src/components/editorial/LastUpdatedBadge'
import ResponsiveTable from '@/components/ui/ResponsiveTable'
import SafetyNotice from '@/components/evidence/SafetyNotice'
import EvidenceSummaryCard from '@/components/evidence/EvidenceSummaryCard'
import EmailCapture from '@/components/EmailCapture'
import NewsletterCtaBlock from '@/components/NewsletterCtaBlock'
import PathwayDiagram from '@/components/PathwayDiagram'
import EvidenceLegend from '@/components/EvidenceLegend'
import { pathwayDiagrams } from '@/lib/pathway-data'
import { getRevenueProductSet } from '@/config/revenue-products'
import RecommendationSection from '@/components/RecommendationSection'
import References from '@/components/References'

const SLUG = 'l-theanine-without-caffeine'
const TITLE = 'L-Theanine Without Caffeine for ADHD: Calm Focus Without the Jitters'
const DESCRIPTION =
  'Evidence guide to using L-theanine alone for ADHD — without caffeine. Covers how it produces calm alertness, alpha-wave effects, who benefits most, dosage, safety, and how it compares to the caffeine combination.'
const DATE = '2026-06-12'
const AUTHOR = 'Will'
const READING_TIME = '10 min read'
const TAGS = ['L-theanine', 'ADHD', 'focus', 'caffeine-free', 'calm']
const CATEGORY = 'Focus'

export const metadata: Metadata = buildPageMetadata({
  title: compactMetaTitle(TITLE),
  description: DESCRIPTION,
  path: `/guides/focus/${SLUG}`,
  openGraphType: 'article',
})

const FAQS = [
  {
    question: 'Does L-theanine work for ADHD without caffeine?',
    answer:
      'L-theanine without caffeine can support a state of calm alertness by increasing alpha-wave brain activity, which may help with the mentally overactivated pattern common in ADHD. It is not a stimulant and does not increase dopamine or norepinephrine in the way ADHD medications do — so expectations should be calibrated accordingly. It is most likely to be noticeable for people whose ADHD presentation includes anxiety, stress-driven mental noise, or difficulty settling the mind for focused work. For primarily inattentive ADHD without high mental arousal, the benefit may be more subtle.',
  },
  {
    question: 'Is L-theanine plus caffeine better than L-theanine alone for ADHD?',
    answer:
      'The L-theanine + caffeine combination has more published clinical evidence for cognitive outcomes than L-theanine alone. Caffeine provides direct alerting effects (adenosine antagonism), and L-theanine blunts caffeine\'s jitteriness while preserving its attentional benefits. For adults with ADHD who tolerate caffeine well, the combination is supported by stronger evidence. L-theanine alone is more appropriate for those who cannot tolerate caffeine, experience anxiety or sleep problems with caffeine, or prefer a stimulant-free approach.',
  },
  {
    question: 'What dose of L-theanine for daytime focus without caffeine?',
    answer:
      'Studies on daytime calm focus and attention typically use 100–200 mg of L-theanine. Starting at 100 mg and assessing response before increasing to 200 mg is a reasonable approach. L-theanine at these doses does not typically cause sedation in the daytime — the alpha-wave effect is described as relaxed wakefulness, not drowsiness. If you notice sedation at 200 mg, reduce to 100 mg.',
  },
  {
    question: 'When should I take L-theanine without caffeine for ADHD?',
    answer:
      'For daytime focus use, taking L-theanine 30–60 minutes before a planned focus session or work period is a common approach. It can also be taken in the morning as part of a routine. Because it does not contain caffeine, it can also be taken later in the day without affecting sleep — unlike caffeinated focus supplements.',
  },
  {
    question: 'Can L-theanine be taken alongside ADHD medication?',
    answer:
      'No established adverse interaction between supplemental L-theanine and common ADHD medications (methylphenidate, amphetamine salts, atomoxetine) has been identified. Some adults with ADHD use L-theanine during stimulant off-periods or on weekends when not taking medication. Inform your prescribing clinician about supplements you are taking; they can advise in the context of your specific medication regimen.',
  },
  {
    question: 'How is L-theanine different from ashwagandha for ADHD focus?',
    answer:
      'L-theanine works faster — effects may be noticeable within 30–60 minutes — and is more suitable for acute mental calm and daytime focus support. Ashwagandha works over weeks by reducing chronic HPA axis activation and cortisol, making it better suited for stress-driven ADHD difficulties over a longer time horizon. L-theanine is caffeine-free and can be taken as needed; ashwagandha is typically taken daily for weeks to months. Both are reasonable for ADHD; the choice depends on whether you need acute calm focus (L-theanine) or chronic stress management (ashwagandha).',
  },
]

const L_THEANINE_WITHOUT_CAFFEINE_REFS = [
  { n: 1, text: 'Nobre AC, et al. (2008). L-theanine and mental state. Asia Pac J Clin Nutr, 17(S1): 167-168.', url: 'https://pubmed.ncbi.nlm.nih.gov/18296328/' },
  { n: 2, text: 'Haskell CF, et al. (2008). L-theanine, caffeine and cognition. Biol Psychol, 77(2): 113-122.', url: 'https://pubmed.ncbi.nlm.nih.gov/18006208/' },
  { n: 3, text: 'Kimura K, et al. (2007). L-theanine reduces stress responses. Biol Psychol, 74(1): 39-45.', url: 'https://pubmed.ncbi.nlm.nih.gov/16930802/' },
  { n: 4, text: 'Giesbrecht T, et al. (2010). L-theanine and caffeine on cognitive performance. Nutr Neurosci, 13(6): 283-290.', url: 'https://pubmed.ncbi.nlm.nih.gov/21040626/' },
]

export default function LTheanineWithoutCaffeinePage() {
  const lTheanineProducts = getRevenueProductSet('l-theanine')
  const breadcrumbLd = breadcrumbJsonLd([
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
      <JsonLd schema={articleLd} />
      <JsonLd schema={breadcrumbLd} />
      {faqLd && <JsonLd schema={faqLd} />}

      <nav className="mb-6 flex items-center gap-2 text-sm text-muted">
        <Link href="/guides/" className="transition hover:text-ink">Articles</Link>
        <span>/</span>
        <span className="text-ink line-clamp-1">{TITLE}</span>
      </nav>

      <section className="rounded-[1.5rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8 lg:p-10">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-full border border-brand-900/10 bg-brand-50 px-2.5 py-0.5 font-bold uppercase tracking-wider text-brand-800">
            {CATEGORY}
          </span>
          {TAGS.slice(0, 3).map((tag) => (
            <span key={tag} className="rounded-full border border-brand-900/10 bg-white px-2.5 py-0.5 font-semibold text-muted capitalize">
              {tag}
            </span>
          ))}
          <span className="text-muted">June 12, 2026</span>
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

        <figure className="mt-6">
          <div className="overflow-hidden rounded-2xl border border-brand-900/10 shadow-sm bg-white">
            <Image
              src="/images/guides/l-theanine-without-caffeine.jpg"
              alt="Caffeine-free L-theanine capsules with green tea leaves for calm focus"
              width={1536}
              height={1024}
              priority
              className="w-full h-auto"
            />
          </div>
          <figcaption className="mt-3 text-center text-sm text-muted">
            L-theanine without caffeine — calm focus without the stimulant.
          </figcaption>
        </figure>
      </section>

      <div className="mt-4 rounded-[1rem] border border-brand-900/10 bg-brand-50/60 px-5 py-3 text-xs leading-6 text-muted">
        <strong className="text-ink">Affiliate disclosure:</strong> This article contains affiliate
        links. Purchases may earn us a commission at no additional cost to you.
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_240px]">
        <div className="space-y-6">

          {/* Fastest useful choice */}
          <section className="rounded-[1rem] border border-brand-700/20 bg-brand-50/60 p-6 shadow-sm sm:p-8">
            <p className="eyebrow-label">Fastest useful choice</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
              If you only try one thing: L-theanine 100 mg alone
            </h2>
            <p className="mt-3 text-[1.01rem] leading-[1.85] text-muted">
              <strong>L-theanine 100&nbsp;mg alone (no caffeine) is itself the fastest useful choice for
              stimulant-free ADHD focus.</strong> Effects within 30–60 minutes, no crash, no sleep
              disruption, no dependency. If 100&nbsp;mg is not enough, increase to 200&nbsp;mg before
              considering other compounds. For comparison with the caffeine combination, see{' '}
              <Link href="/guides/focus/l-theanine-vs-caffeine-for-focus/" className="font-semibold text-brand-700 hover:underline">
                L-Theanine vs Caffeine for Focus
              </Link>
              . For the broader evidence review, see the{' '}
              <Link href="/guides/herbs/l-theanine/" className="font-semibold text-brand-700 hover:underline">
                full L-theanine article
              </Link>
              .
            </p>
          </section>

          {/* Quick Verdict */}
          <section className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8">
            <p className="eyebrow-label">Quick Verdict</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
              Can L-Theanine Support ADHD Focus Without Caffeine?
            </h2>
            <ul className="mt-4 space-y-2">
              {[
                ['Yes — but the effect is calm alertness, not stimulation', 'L-theanine increases alpha-wave activity, producing a state of relaxed wakefulness. This is different from how caffeine or ADHD medications work.'],
                ['Most useful when mental noise is the problem', 'If ADHD manifests as a busy, anxious mind that can\'t settle for focused work, L-theanine may help reduce that barrier.'],
                ['Less effective for pure inattention without hyperactivation', 'If the main challenge is low dopamine / norepinephrine rather than mental hyperactivation, L-theanine\'s mechanism is a poor fit.'],
                ['No crash, no sleep disruption', 'Unlike caffeine, L-theanine can be taken later in the day without disrupting sleep — and is also useful as a pre-sleep calm support.'],
              ].map(([bold, rest]) => (
                <li key={bold as string} className="flex gap-2 text-[1.01rem] leading-[1.85] text-muted">
                  <span className="mt-1 flex-shrink-0 text-brand-700">▸</span>
                  <span><strong>{bold as string}.</strong> {rest as string}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8 space-y-8">

            <div id="what-is-l-theanine">
              <h2 className="mb-3 text-2xl font-semibold tracking-tight text-ink">
                What Is L-Theanine and Why Does It Matter for ADHD?
              </h2>
              <p className="text-[1.01rem] leading-[1.85] text-muted">
                L-theanine is a non-protein amino acid found in tea leaves (<em>Camellia sinensis</em>).
                It is the compound responsible for the calming quality of green tea that offsets green
                tea&apos;s caffeine content — a natural calm + alertness combination that has been observed
                for centuries.
              </p>
              <p className="mt-3 text-[1.01rem] leading-[1.85] text-muted">
                In the context of ADHD, L-theanine is interesting precisely because many people with
                ADHD experience <strong>hyperactivation</strong> — a mental state of over-arousal that
                paradoxically makes focus harder, not easier. The hyperactivated brain generates too much
                &ldquo;noise&rdquo; (racing thoughts, anxiety, mental restlessness) to sustain a single
                attentional thread. L-theanine&apos;s alpha-wave induction directly addresses this pattern.
              </p>
              <p className="mt-3 text-[1.01rem] leading-[1.85] text-muted">
                Importantly, this article focuses on <strong>L-theanine alone, without caffeine</strong>.
                The caffeine+L-theanine combination is separately studied and has stronger evidence for
                cognitive outcomes — but is not appropriate for people who cannot tolerate caffeine,
                experience anxiety with stimulants, or want a truly stimulant-free option.
              </p>
            </div>

            <hr className="border-brand-900/10" />

            {/* Mechanism */}
            <div id="mechanism">
              <h2 className="mb-4 text-2xl font-semibold tracking-tight text-ink">
                How L-Theanine Produces Calm Focus
              </h2>
              <PathwayDiagram data={pathwayDiagrams['l-theanine-focus']} />
              <div className="mt-4 space-y-3">
                <div className="rounded-[1rem] border border-brand-900/10 bg-brand-50/60 p-4">
                  <p className="font-semibold text-ink">Alpha Waves: The &ldquo;Calm Focus&rdquo; Brainwave</p>
                  <p className="mt-1 text-sm leading-6 text-muted">
                    Alpha waves (8–12 Hz) are the neural oscillation pattern associated with calm, relaxed
                    wakefulness — the &ldquo;flow state&rdquo; precursor. L-theanine consistently increases
                    alpha-wave power in EEG studies within 30–60 minutes of ingestion, making it one of the
                    more mechanistically well-characterized supplements for this purpose.
                  </p>
                </div>
                <div className="rounded-[1rem] border border-brand-900/10 bg-brand-50/60 p-4">
                  <p className="font-semibold text-ink">Glutamate / GABA Modulation</p>
                  <p className="mt-1 text-sm leading-6 text-muted">
                    L-theanine has structural similarity to glutamate and may modulate AMPA, NMDA, and
                    kainate receptors to reduce excitatory tone. It also appears to support GABA activity,
                    the brain&apos;s primary inhibitory neurotransmitter. The net effect is a reduction in
                    neural hyperactivation without producing strong sedation.
                  </p>
                </div>
                <div className="rounded-[1rem] border border-brand-900/10 bg-brand-50/60 p-4">
                  <p className="font-semibold text-ink">What L-Theanine Does NOT Do</p>
                  <p className="mt-1 text-sm leading-6 text-muted">
                    L-theanine does not meaningfully increase dopamine or norepinephrine — the
                    catecholamines central to stimulant ADHD medication efficacy. It is not a stimulant.
                    It does not block adenosine receptors (caffeine does this). Its mechanism is calming
                    and inhibitory-supportive, not activating.
                  </p>
                </div>
              </div>
              <EvidenceLegend highlightTier="moderate" className="mt-4" />
            </div>

            <hr className="border-brand-900/10" />

            {/* Evidence */}
            <div id="evidence">
              <h2 className="mb-4 text-2xl font-semibold tracking-tight text-ink">Evidence Summary</h2>
              <EvidenceSummaryCard
                title="L-Theanine (No Caffeine) — Calm Focus &amp; ADHD"
                evidenceLevel="Moderate"
                humanEvidence="EEG studies consistently show alpha-wave induction within 30–60 minutes. Human trials on attention and focus with standalone L-theanine (no caffeine) show modest but consistent positive effects — particularly in populations with anxiety, stress, or high baseline mental arousal. Direct ADHD-specific trials without caffeine co-administration are limited but suggest potential benefit for hyperactivation-associated presentation."
                mechanisticEvidence="Alpha-wave induction is the most replicated finding. Glutamate modulation and GABA support are plausible based on preclinical data and L-theanine's structural similarity to glutamate. Mechanism is coherent with the hyperactivation phenotype common in ADHD."
                safetyProfile="Well-tolerated. No significant drug interactions with ADHD medications established. No crash or post-dose rebound. Safe for most evening use without sleep disruption. Insufficient data for pregnancy/breastfeeding. Caution with sedative medications."
              />
            </div>

            <hr className="border-brand-900/10" />

            {/* With vs Without Caffeine */}
            <div id="with-vs-without-caffeine">
              <h2 className="mb-4 text-2xl font-semibold tracking-tight text-ink">
                With Caffeine vs Without: Which Is Better for ADHD?
              </h2>
              <ResponsiveTable label="L-theanine with caffeine vs without caffeine for ADHD">
                <table className="min-w-[580px] w-full text-sm">
                  <thead>
                    <tr className="border-b border-brand-900/10">
                      {['Factor', 'L-Theanine Alone', 'L-Theanine + Caffeine'].map((h) => (
                        <th key={h} className="pb-2 pr-4 text-left text-xs font-bold uppercase tracking-wider text-muted">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-900/5">
                    {[
                      ['Evidence base', 'Moderate (alpha-wave; limited ADHD-specific)', 'Strong (cognitive outcomes, attention, arousal)'],
                      ['Mechanism', 'Alpha-wave induction, glutamate/GABA modulation', 'Adenosine block (caffeine) + alpha-wave balance (theanine)'],
                      ['Effect quality', 'Calm alertness, reduced mental noise', 'Alert focus, improved reaction time, reduced jitteriness'],
                      ['Sleep impact', 'None — can take any time of day', 'Caffeine disrupts sleep if taken too late'],
                      ['Suitable for caffeine-sensitive', '★★★ Yes', '✕ No'],
                      ['Suitable for anxiety-prone ADHD', '★★★ Yes — calming', '★★ Mixed — caffeine may worsen anxiety'],
                      ['Use with ADHD meds', 'Generally fine (no interaction)', 'Discuss with prescriber — caffeine + stimulants'],
                      ['Evening / sleep use', '★★★ Yes — also good for sleep', '✕ No — caffeine too late disrupts sleep'],
                    ].map(([factor, solo, combo]) => (
                      <tr key={factor as string} className="align-top">
                        <td className="py-3 pr-4 font-medium text-ink">{factor}</td>
                        <td className="py-3 pr-4 text-muted">{solo}</td>
                        <td className="py-3 text-muted">{combo}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </ResponsiveTable>
              <p className="mt-4 text-[1.01rem] leading-[1.85] text-muted">
                <strong>Use L-theanine alone if:</strong> you are caffeine-sensitive, prone to anxiety,
                want a stimulant-free approach, need evening/late-day use, or are already on ADHD
                stimulant medication.
              </p>
              <p className="mt-3 text-sm text-muted">
                For the full comparison, see{' '}
                <Link href="/guides/focus/l-theanine-vs-caffeine-for-focus/"
                  className="font-semibold text-brand-700 hover:underline">
                  L-Theanine vs Caffeine for Focus
                </Link>.
              </p>
            </div>

            <hr className="border-brand-900/10" />

            {/* Dosage */}
            <div id="dosage">
              <h2 className="mb-4 text-2xl font-semibold tracking-tight text-ink">Dosage for Daytime ADHD Focus</h2>
              <div className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-5 shadow-sm">
                <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-muted">Dosage Reference — Stimulant-Free Focus</p>
                <ResponsiveTable label="L-theanine dosage for ADHD focus without caffeine">
                  <table className="min-w-[520px] w-full text-sm">
                    <thead>
                      <tr className="border-b border-brand-900/10">
                        {['Use Case', 'Dose', 'Timing', 'Notes'].map((h) => (
                          <th key={h} className="pb-2 pr-4 text-left text-xs font-bold uppercase tracking-wider text-muted">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-900/5">
                      {[
                        ['Daytime calm focus', '100–200 mg', '30–60 min before work session', 'Caffeine-free only'],
                        ['Morning routine', '100 mg', 'With breakfast', 'Good starting dose for first trial'],
                        ['Evening / pre-sleep', '100–200 mg', '30–60 min before bed', 'No caffeine effect on sleep'],
                        ['Anxiety-dominant ADHD', '200 mg', 'Before high-stress periods', 'May reduce both anxiety and hyperactivation'],
                      ].map(([use, dose, timing, notes]) => (
                        <tr key={use as string} className="align-top">
                          <td className="py-3 pr-4 font-medium text-ink">{use}</td>
                          <td className="py-3 pr-4 text-muted">{dose}</td>
                          <td className="py-3 pr-4 text-muted">{timing}</td>
                          <td className="py-3 text-muted">{notes}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </ResponsiveTable>
              </div>
            </div>

            <hr className="border-brand-900/10" />

            {/* Products */}
            <div id="products">
              <h2 className="mb-3 text-2xl font-semibold tracking-tight text-ink">Caffeine-Free L-Theanine Products</h2>
              <p className="mb-4 text-[1.01rem] leading-[1.85] text-muted">
                The key is choosing a <strong>standalone, caffeine-free</strong> product. Many &ldquo;focus
                blend&rdquo; products combine L-theanine with caffeine — these are for daytime use only and
                not appropriate if you want a stimulant-free approach.
              </p>
              {lTheanineProducts && (
                <RecommendationSection
                  title="Caffeine-free L-theanine picks"
                  description="Standalone L-theanine capsules — no caffeine or focus-blend fillers. Use these as sourcing starting points, not medical recommendations."
                  products={lTheanineProducts.products}
                />
              )}

              <div className="mt-4 rounded-[1rem] border border-amber-200 bg-amber-50/60 p-4">
                <p className="font-semibold text-amber-900">What to avoid when buying caffeine-free L-theanine:</p>
                <ul className="mt-2 ml-5 space-y-1 list-disc text-sm text-amber-800">
                  <li>Products labeled &ldquo;Focus Blend&rdquo; or &ldquo;Energy + Focus&rdquo; — these almost always contain caffeine</li>
                  <li>Green tea extracts — these contain caffeine unless specifically decaffeinated</li>
                  <li>Nootropic stacks without full ingredient disclosure</li>
                </ul>
              </div>
            </div>

            <hr className="border-brand-900/10" />

            {/* Who Benefits Most */}
            <div id="who-benefits">
              <h2 className="mb-4 text-2xl font-semibold tracking-tight text-ink">Who Benefits Most From Solo L-Theanine?</h2>
              <div className="space-y-3">
                {[
                  {
                    label: 'Strong candidate',
                    color: 'border-emerald-200 bg-emerald-50/60',
                    items: [
                      'ADHD with high baseline anxiety or mental hyperactivation',
                      'Caffeine-sensitive or caffeine-intolerant individuals',
                      'People on ADHD stimulant medication wanting a calm complement (check with prescriber)',
                      'Evening or late-day focus need (no sleep disruption from caffeine)',
                    ],
                  },
                  {
                    label: 'Weaker candidate',
                    color: 'border-amber-200 bg-amber-50/60',
                    items: [
                      'Primarily inattentive ADHD without hyperactivation or anxiety',
                      'Expecting stimulant-level alertness or dopamine-driven motivation',
                      'Severe ADHD where evidence-based medical treatment has not been optimized',
                    ],
                  },
                ].map(({ label, color, items }) => (
                  <div key={label} className={`rounded-[1rem] border p-4 ${color}`}>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted">{label}</p>
                    <ul className="mt-2 ml-5 space-y-1 list-disc text-sm leading-6 text-muted">
                      {items.map((item) => <li key={item}>{item}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            <hr className="border-brand-900/10" />

            <div id="safety">
              <h2 className="mb-4 text-2xl font-semibold tracking-tight text-ink">Safety</h2>
              <SafetyNotice title="Safety Summary — L-Theanine Without Caffeine">
                <ul className="ml-5 space-y-1.5 list-disc">
                  {[
                    ['Generally well-tolerated', 'L-theanine has a good safety profile at typical supplemental doses (100–400 mg/day) based on available evidence and its long history in tea consumption.'],
                    ['No crash or withdrawal', 'Unlike caffeine, L-theanine does not produce dependence, tolerance, or withdrawal effects at supplemental doses.'],
                    ['Sedative medications', 'L-theanine has mild calming properties. Combining with benzodiazepines, z-drugs, or other CNS depressants requires medical supervision.'],
                    ['ADHD medications', 'No established adverse interaction, but inform your prescriber you are supplementing.'],
                    ['Blood pressure', 'Some evidence for mild blood pressure-lowering effects. Caution if you take antihypertensives.'],
                    ['Pregnancy and breastfeeding', 'Insufficient safety data for supplemental doses. Consult a clinician before use.'],
                    ['Product labeling warning', 'Always verify the product is caffeine-free. Green tea and many focus blends contain both L-theanine and caffeine.'],
                  ].map(([bold, text]) => (
                    <li key={bold as string}><strong>{bold as string}.</strong> {text as string}</li>
                  ))}
                </ul>
              </SafetyNotice>
            </div>

            <hr className="border-brand-900/10" />

            <div id="faq">
              <h2 className="mb-4 text-2xl font-semibold tracking-tight text-ink">Frequently Asked Questions</h2>
              <div className="space-y-4">
                {FAQS.map((faq, i) => (
                  <div key={i} className="rounded-[0.75rem] border border-brand-900/10 bg-brand-50/40 p-4">
                    <h3 className="font-semibold text-ink">{faq.question}</h3>
                    <p className="mt-2 text-sm leading-7 text-muted">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>

            <hr className="border-brand-900/10" />

            <div id="related">
              <h2 className="mb-4 text-2xl font-semibold tracking-tight text-ink">Related Articles</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  ['/guides/adhd/best-supplements-for-adhd/', 'Cornerstone', 'Best Supplements for ADHD', 'Full evidence-ranked guide.'],
                  ['/guides/adhd/l-theanine-for-adhd/', 'ADHD Cluster', 'L-Theanine for ADHD', 'Full evidence review including sleep.'],
                  ['/guides/focus/l-theanine-vs-caffeine-for-focus', 'ADHD Cluster', 'L-Theanine vs Caffeine', 'Direct comparison for focus.'],
                  ['/guides/adhd/l-theanine-magnesium-adhd-stack', 'Stack Guide', 'L-Theanine + Magnesium Stack', 'Combine for broader ADHD support.'],
                  ['/guides/sleep/l-theanine-for-sleep', 'Sleep Cluster', 'L-Theanine for Sleep', 'Nighttime calm without caffeine.'],
                  ['/guides/adhd/adhd-stack-guide', 'ADHD Cluster', 'ADHD Stack Guide', 'Building a safe ADHD supplement stack.'],
                  ['/guides/herbs/ashwagandha/', 'Umbrella', 'Ashwagandha Article', 'Full evidence review across stress, anxiety, sleep, and focus.'],
                  ['/guides/adhd/ashwagandha-for-adhd', 'ADHD Cluster', 'Ashwagandha for ADHD', 'Chronic stress and focus support.'],
                  ['/guides/focus', 'Goal Hub', 'Focus Goal Hub', 'Compare all focus supplements.'],
                ].map(([href, eyebrow, label, desc]) => (
                  <Link key={href as string} href={href as string}
                    className="group rounded-[0.75rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm transition hover:border-brand-700/30">
                    <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted">{eyebrow}</p>
                    <p className="font-semibold text-ink transition group-hover:text-brand-700">{label}</p>
                    <p className="mt-1 text-xs text-muted">{desc}</p>
                  </Link>
                ))}
              </div>
            </div>

          </section>

          <EmailCapture
            headline="Get the ADHD supplement checklist"
            description="Evidence-first supplement guides, safety context, and ADHD research notes. No diagnosis or personal medical advice."
            ctaLabel="Get Checklist"
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
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted">In this article</p>
            <nav className="mt-3 space-y-1.5" aria-label="Article sections">
              {[
                ['#what-is-l-theanine', 'What Is L-Theanine?'],
                ['#mechanism', 'How It Works'],
                ['#evidence', 'Evidence Summary'],
                ['#with-vs-without-caffeine', 'With vs Without Caffeine'],
                ['#dosage', 'Dosage Guide'],
                ['#products', 'Caffeine-Free Products'],
                ['#who-benefits', 'Who Benefits?'],
                ['#safety', 'Safety'],
                ['#faq', 'FAQ'],
              ].map(([href, label]) => (
                <a key={href} href={href as string}
                  className="block text-sm text-brand-700 hover:text-brand-800 hover:underline">
                  {label}
                </a>
              ))}
            </nav>
          </div>
          <div className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Focus + ADHD cluster</p>
            <div className="mt-3 space-y-2">
              {[
                ['/guides/adhd/best-supplements-for-adhd/', 'Best supplements for ADHD →'],
                ['/guides/adhd/l-theanine-for-adhd/', 'L-Theanine for ADHD →'],
                ['/guides/focus/l-theanine-vs-caffeine-for-focus', 'L-Theanine vs Caffeine →'],
                ['/guides/adhd/adhd-stack-guide', 'ADHD stack guide →'],
                ['/guides/sleep/l-theanine-for-sleep', 'L-Theanine for sleep →'],
                ['/guides/focus', 'Focus goal hub →'],
              ].map(([href, label]) => (
                <Link key={href as string} href={href as string}
                  className="block text-sm font-medium text-brand-700 hover:text-brand-800 hover:underline">
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </div>

      <div className="mt-8">
        <Link href="/guides/" className="text-sm font-semibold text-brand-700 hover:text-brand-800">
          ← Back to Articles
        </Link>
      </div>
      <References refs={L_THEANINE_WITHOUT_CAFFEINE_REFS} />
    </article>
  )
}
