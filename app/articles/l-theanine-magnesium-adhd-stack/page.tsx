import Link from 'next/link'
import type { Metadata } from 'next'
import { buildPageMetadata, blogJsonLd, breadcrumbJsonLd, faqPageJsonLd } from '../../../src/lib/seo'
import LastUpdatedBadge from '../../../src/components/editorial/LastUpdatedBadge'
import ResponsiveTable from '@/components/ui/ResponsiveTable'
import SafetyNotice from '@/components/evidence/SafetyNotice'
import EmailCapture from '@/components/EmailCapture'
import NewsletterCtaBlock from '@/components/NewsletterCtaBlock'
import PathwayDiagram from '@/components/PathwayDiagram'
import EvidenceLegend from '@/components/EvidenceLegend'
import { pathwayDiagrams } from '@/lib/pathway-data'
import { AFFILIATE_TAGS } from '@/config/affiliate'

const SLUG = 'l-theanine-magnesium-adhd-stack'
const TITLE = 'L-Theanine and Magnesium for ADHD: How to Stack Them Safely'
const DESCRIPTION =
  'Evidence-based guide to combining L-theanine and magnesium for ADHD. Covers mechanisms, synergy, safety, dosing order, timing, and drug interactions — including ADHD medication compatibility.'
const DATE = '2026-06-12'
const AUTHOR = 'Will'
const READING_TIME = '10 min read'
const TAGS = ['L-theanine', 'magnesium', 'ADHD', 'stacks', 'sleep']
const CATEGORY = 'ADHD Stacks'

export const metadata: Metadata = buildPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: `/articles/${SLUG}`,
  openGraphType: 'article',
})

const FAQS = [
  {
    question: 'Can I take L-theanine and magnesium together for ADHD?',
    answer:
      'For most healthy adults and children without relevant medical conditions, yes — combining L-theanine and magnesium is considered reasonable. They act through different mechanisms (L-theanine via alpha-wave induction and glutamate modulation; magnesium via NMDA blockade and GABA support), which means they are complementary rather than duplicative. No significant adverse interaction between the two has been established in available literature. Introduce one at a time before combining to identify which is producing which effect.',
  },
  {
    question: 'Does L-theanine make magnesium work better for ADHD?',
    answer:
      'Not through a direct pharmacological interaction — they do not amplify each other\'s absorption or binding. Rather, they address complementary aspects of ADHD-related difficulty: L-theanine works on mental calm and alpha-wave activity, while magnesium works on neural over-excitability and GABA pathways. Using both means broader coverage of the neurobiological targets relevant to ADHD hyperactivation and sleep difficulty.',
  },
  {
    question: 'When should I take L-theanine and magnesium for ADHD?',
    answer:
      'Evening use is the most common pattern for both. L-theanine (100–200 mg) and magnesium glycinate (200–400 mg elemental) taken 30–60 minutes before bed supports ADHD-related sleep onset difficulties and evening hyperactivation. For daytime calm focus, L-theanine can also be taken in the morning or with a focus session — magnesium is typically reserved for evening because it may increase sedation when combined with other sleep cues.',
  },
  {
    question: 'Is this stack safe with ADHD medications?',
    answer:
      'No established adverse interaction between supplemental L-theanine or magnesium and common ADHD stimulants (methylphenidate, amphetamine salts) has been documented. Some practitioners use magnesium to support side-effect management in stimulant users. However, you should inform your prescribing clinician that you are using these supplements, particularly if you observe changes in medication response. Do not adjust medication timing or dose based on supplement use without medical guidance.',
  },
  {
    question: 'How long does it take to notice effects from this stack?',
    answer:
      'L-theanine effects (if they occur) are often noticeable within the same day or evening — particularly the alpha-wave calming effect. Magnesium effects on sleep quality and neural excitability are more gradual: most users report noticing changes within 1–2 weeks of consistent daily use, with fuller effects developing at 4–6 weeks. If neither supplement produces any noticeable effect after 4–6 weeks of consistent use, reassess with a clinician — blood testing for magnesium status may be informative.',
  },
  {
    question: 'Should I start both supplements on the same day?',
    answer:
      'Starting them separately is strongly preferred. Begin one supplement, assess your response over 7–14 days, then add the second. If you start both simultaneously and experience an effect (positive or negative), you cannot determine which supplement is responsible. This makes it harder to optimise or troubleshoot. Starting separately also means smaller initial supplement burden and cleaner attribution of any side effects.',
  },
]

export default function LTheanineMagnesiumAdhdStackPage() {
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      {faqLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />}

      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-muted">
        <Link href="/articles/" className="transition hover:text-ink">Articles</Link>
        <span>/</span>
        <span className="text-ink line-clamp-1">{TITLE}</span>
      </nav>

      {/* Hero */}
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
          <Link href="/about/" rel="author" className="font-medium text-ink hover:underline">
            {AUTHOR}
          </Link>
        </p>
        <div className="mt-3">
          <LastUpdatedBadge date={DATE} label="Last updated" />
        </div>
        <p className="mt-4 max-w-3xl text-base leading-7 text-[#46574d]">{DESCRIPTION}</p>
      </section>

      {/* Disclosure */}
      <div className="mt-4 rounded-[1rem] border border-brand-900/10 bg-brand-50/60 px-5 py-3 text-xs leading-6 text-muted">
        <strong className="text-ink">Affiliate disclosure:</strong> This article contains affiliate
        links. We may earn a commission at no additional cost to you. We only link to products
        consistent with the evidence and dose ranges reviewed on this page.
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_240px]">
        <div className="space-y-6">

          {/* Quick Verdict */}
          <section className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8">
            <p className="eyebrow-label">Quick Verdict</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
              Is This Stack Worth Trying for ADHD?
            </h2>
            <ul className="mt-4 space-y-2">
              {[
                ['Safe to combine for most healthy adults', 'No established adverse interaction. Both are well-tolerated at supplemental doses.'],
                ['Complementary mechanisms — not duplicative', 'L-theanine targets mental arousal and alpha waves; magnesium targets neural over-excitability and GABA. They cover different ground.'],
                ['Best evidence is for individual components', 'Direct combination trials in ADHD are limited. Individual evidence for each compound is more robust.'],
                ['Start one at a time — always', 'Introduce supplements separately over 1–2 weeks each to identify what works and attribute any effects correctly.'],
              ].map(([bold, rest]) => (
                <li key={bold as string} className="flex gap-2 text-[1.01rem] leading-[1.85] text-[#46574d]">
                  <span className="mt-1 flex-shrink-0 text-brand-700">▸</span>
                  <span><strong>{bold as string}.</strong> {rest as string}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8 space-y-8">

            <div id="why-combine">
              <h2 className="mb-3 text-2xl font-semibold tracking-tight text-ink">
                Why Combine These Two for ADHD?
              </h2>
              <p className="text-[1.01rem] leading-[1.85] text-[#46574d]">
                ADHD often involves hyperactivation across multiple dimensions: mental (racing thoughts,
                difficulty quieting the mind), physical (motor restlessness), and neurochemical (imbalanced
                excitatory/inhibitory signaling). A single supplement is unlikely to address all of these.
              </p>
              <p className="mt-3 text-[1.01rem] leading-[1.85] text-[#46574d]">
                L-theanine and magnesium together cover more of this territory than either alone:
              </p>
              <ul className="mt-3 ml-5 space-y-1 list-disc text-[1.01rem] leading-[1.85] text-[#46574d]">
                <li>L-theanine for mental calm, alpha-wave induction, and reducing stress-driven mental arousal</li>
                <li>Magnesium for neural excitability regulation (NMDA), muscle relaxation, GABA support, and sleep architecture</li>
                <li>Both are non-stimulant, non-sedative at typical doses — appropriate for use alongside ADHD medication</li>
              </ul>
            </div>

            <hr className="border-brand-900/10" />

            {/* Two mechanism diagrams */}
            <div id="mechanisms">
              <h2 className="mb-4 text-2xl font-semibold tracking-tight text-ink">
                How Each Works — Separate Pathways
              </h2>
              <p className="mb-4 text-[1.01rem] leading-[1.85] text-[#46574d]">
                These two pathways are distinct — they don&apos;t share primary receptors or neurotransmitters,
                which is why combining them is additive rather than redundant.
              </p>
              <div className="space-y-4">
                <div>
                  <p className="mb-2 text-sm font-semibold text-ink">L-Theanine Pathway:</p>
                  <PathwayDiagram data={pathwayDiagrams['l-theanine-focus']} />
                </div>
                <div>
                  <p className="mb-2 text-sm font-semibold text-ink">Magnesium Pathway:</p>
                  <PathwayDiagram data={pathwayDiagrams['magnesium-adhd']} />
                </div>
              </div>
              <EvidenceLegend highlightTier="limited" className="mt-4" />
            </div>

            <hr className="border-brand-900/10" />

            {/* Synergy table */}
            <div id="synergy">
              <h2 className="mb-4 text-2xl font-semibold tracking-tight text-ink">
                Synergy Overview
              </h2>
              <ResponsiveTable label="L-theanine and magnesium synergy for ADHD">
                <table className="min-w-[580px] w-full text-sm">
                  <thead>
                    <tr className="border-b border-brand-900/10">
                      {['ADHD Challenge', 'L-Theanine Contribution', 'Magnesium Contribution'].map((h) => (
                        <th key={h} className="pb-2 pr-4 text-left text-xs font-bold uppercase tracking-wider text-muted">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-900/5">
                    {[
                      ['Sleep onset', 'Mental quiet, reduced racing thoughts', 'NMDA calm, muscle relaxation, GABA support'],
                      ['Evening hyperactivation', 'Alpha-wave induction, mental de-arousal', 'Neural excitability regulation'],
                      ['Emotional dysregulation', 'Mild GABA modulation, stress attenuation', 'GABA support, potential cortisol-adjacent effects'],
                      ['Daytime focus (L-theanine only)', '↑ Alpha, calm alertness without sedation', '(Not typically used in daytime)'],
                      ['Physical restlessness', 'Limited direct effect', 'Muscle relaxation, magnesium\'s role in motor nerve conduction'],
                    ].map(([challenge, lt, mg]) => (
                      <tr key={challenge as string} className="align-top">
                        <td className="py-3 pr-4 font-medium text-ink">{challenge}</td>
                        <td className="py-3 pr-4 text-[#46574d]">{lt}</td>
                        <td className="py-3 text-[#46574d]">{mg}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </ResponsiveTable>
            </div>

            <hr className="border-brand-900/10" />

            {/* How to Stack */}
            <div id="how-to-stack">
              <h2 className="mb-4 text-2xl font-semibold tracking-tight text-ink">
                How to Stack Them: A Practical Protocol
              </h2>
              <div className="space-y-4">
                {[
                  {
                    step: '1',
                    title: 'Start with magnesium glycinate alone',
                    body: 'Week 1–2: Take 200 mg elemental magnesium glycinate 30–60 minutes before bed. Assess sleep quality and evening calm. Magnesium deficiency is common in ADHD, so this may produce noticeable results quickly.',
                  },
                  {
                    step: '2',
                    title: 'Evaluate and add L-theanine',
                    body: 'If magnesium is producing benefit but you still notice mental racing or stress-driven arousal at bedtime, add L-theanine 100–200 mg at the same time (30–60 min before bed). Start at 100 mg.',
                  },
                  {
                    step: '3',
                    title: 'For daytime calm focus',
                    body: 'L-theanine can also be used alone during the day (100–200 mg, standalone, caffeine-free) for calm alertness. Magnesium is typically not added to daytime stacks unless deficiency correction is the primary goal.',
                  },
                  {
                    step: '4',
                    title: 'Monitor and adjust',
                    body: 'After 4–6 weeks on the full stack, assess whether both supplements are contributing. If results are good, continue. If sleep worsened or any side effects emerged, step back to one supplement and reassess.',
                  },
                ].map(({ step, title, body }) => (
                  <div key={step} className="flex gap-4 rounded-[1rem] border border-brand-900/10 bg-brand-50/40 p-4">
                    <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-brand-700 text-xs font-bold text-white">
                      {step}
                    </span>
                    <div>
                      <p className="font-semibold text-ink">{title}</p>
                      <p className="mt-1 text-sm leading-6 text-[#46574d]">{body}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 rounded-[1rem] border border-brand-900/10 bg-white/90 p-5 shadow-sm">
                <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-muted">
                  Stack Reference — Evening Protocol
                </p>
                <ResponsiveTable label="L-theanine magnesium stack dosage">
                  <table className="min-w-[500px] w-full text-sm">
                    <thead>
                      <tr className="border-b border-brand-900/10">
                        {['Supplement', 'Dose', 'Timing', 'Notes'].map((h) => (
                          <th key={h} className="pb-2 pr-4 text-left text-xs font-bold uppercase tracking-wider text-muted">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-900/5">
                      {[
                        ['Magnesium Glycinate', '200–300 mg elemental', '30–60 min before bed', 'Introduce first; confirm tolerance'],
                        ['L-Theanine', '100–200 mg', 'Same time as magnesium', 'Add after 1–2 weeks on Mg alone'],
                      ].map(([supp, dose, timing, notes]) => (
                        <tr key={supp as string} className="align-top">
                          <td className="py-3 pr-4 font-medium text-ink">{supp}</td>
                          <td className="py-3 pr-4 text-[#46574d]">{dose}</td>
                          <td className="py-3 pr-4 text-[#46574d]">{timing}</td>
                          <td className="py-3 text-[#46574d]">{notes}</td>
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
              <h2 className="mb-3 text-2xl font-semibold tracking-tight text-ink">Product Options</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  {
                    eyebrow: 'Magnesium Glycinate',
                    name: 'Magnesium Glycinate 400mg',
                    desc: 'Best form for the stack. Check the elemental magnesium per serving on the label.',
                    query: 'magnesium+glycinate+sleep+calm',
                    cta: 'View on Amazon →',
                  },
                  {
                    eyebrow: 'L-Theanine (Caffeine-Free)',
                    name: 'L-Theanine 100–200mg',
                    desc: 'Choose a standalone product without added caffeine. Look for "caffeine-free" clearly stated.',
                    query: 'l-theanine+200mg+caffeine+free+sleep',
                    cta: 'View on Amazon →',
                  },
                  {
                    eyebrow: 'Combined Stack',
                    name: 'L-Theanine + Magnesium Combo',
                    desc: 'Pre-combined sleep stack products. Verify dose amounts match the ranges on this page.',
                    query: 'l-theanine+magnesium+glycinate+sleep+stack',
                    cta: 'View combo products →',
                  },
                ].map(({ eyebrow, name, desc, query, cta }) => (
                  <div key={name} className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm">
                    <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted">{eyebrow}</p>
                    <p className="font-semibold text-ink">{name}</p>
                    <p className="mt-1 text-xs leading-5 text-[#46574d]">{desc}</p>
                    <a
                      href={`https://www.amazon.com/s?k=${query}&tag=${AFFILIATE_TAGS.amazon}`}
                      target="_blank"
                      rel="noopener noreferrer sponsored"
                      className="mt-3 inline-flex items-center gap-1 rounded-full bg-brand-950 px-4 py-1.5 text-xs font-bold text-white transition hover:bg-brand-900"
                    >
                      {cta}
                    </a>
                  </div>
                ))}
              </div>
            </div>

            <hr className="border-brand-900/10" />

            {/* Safety */}
            <div id="safety">
              <h2 className="mb-4 text-2xl font-semibold tracking-tight text-ink">Safety and Interactions</h2>
              <SafetyNotice title="Stack Safety — L-Theanine + Magnesium for ADHD">
                <ul className="ml-5 space-y-1.5 list-disc">
                  {[
                    ['No established adverse L-theanine + magnesium interaction', 'No pharmacokinetic or pharmacodynamic interaction has been identified between supplemental L-theanine and magnesium in available literature.'],
                    ['ADHD stimulant medications', 'No established interaction with methylphenidate or amphetamine salts. Inform your prescriber that you are supplementing; do not adjust medication dose based on supplement use.'],
                    ['Sedative medications', 'Both L-theanine and magnesium have mild CNS-calming properties. Use caution when combining with benzodiazepines, z-drugs, or other sedative medications.'],
                    ['Kidney disease', 'Magnesium is renally cleared. Do not supplement without clinician guidance if you have kidney impairment.'],
                    ['Tolerable upper level for magnesium', 'Do not exceed 350 mg supplemental magnesium per day without medical oversight. This does not include dietary magnesium.'],
                    ['Pregnancy and breastfeeding', 'Insufficient safety data for supplemental L-theanine. Supplemental magnesium may be appropriate in some cases — consult a clinician.'],
                  ].map(([bold, text]) => (
                    <li key={bold as string}>
                      <strong>{bold as string}.</strong> {text as string}
                    </li>
                  ))}
                </ul>
              </SafetyNotice>
            </div>

            <hr className="border-brand-900/10" />

            {/* FAQ */}
            <div id="faq">
              <h2 className="mb-4 text-2xl font-semibold tracking-tight text-ink">Frequently Asked Questions</h2>
              <div className="space-y-4">
                {FAQS.map((faq, i) => (
                  <div key={i} className="rounded-[0.75rem] border border-brand-900/10 bg-brand-50/40 p-4">
                    <h3 className="font-semibold text-ink">{faq.question}</h3>
                    <p className="mt-2 text-sm leading-7 text-[#46574d]">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>

            <hr className="border-brand-900/10" />

            <div id="related">
              <h2 className="mb-4 text-2xl font-semibold tracking-tight text-ink">Related Articles</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  ['/articles/best-supplements-for-adhd', 'Cornerstone', 'Best Supplements for ADHD', 'Full evidence-ranked guide.'],
                  ['/articles/magnesium-for-adhd', 'ADHD Cluster', 'Magnesium for ADHD', 'Evidence review of magnesium for ADHD.'],
                  ['/articles/l-theanine-for-adhd', 'ADHD Cluster', 'L-Theanine for ADHD', 'Evidence review of L-theanine for ADHD.'],
                  ['/articles/magnesium-glycinate-vs-citrate-for-adhd', 'ADHD Cluster', 'Glycinate vs Citrate for ADHD', 'Which magnesium form works best.'],
                  ['/articles/best-magnesium-supplement-for-adhd', 'Buying Guide', 'Best Magnesium for ADHD', 'Which product to buy first.'],
                  ['/articles/adhd-stack-guide', 'Stack Guide', 'ADHD Stack Guide', 'Full supplement stacking guide for ADHD.'],
                  ['/articles/sleep-and-adhd', 'Sleep + ADHD', 'Sleep and ADHD', 'Why sleep matters so much in ADHD.'],
                  ['/goals/focus', 'Goal Hub', 'Focus Goal Hub', 'Compare all focus supplements.'],
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
            description="Evidence-first supplement updates, stack guides, and ADHD research notes. No diagnosis or personal medical advice."
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
                ['#why-combine', 'Why Combine?'],
                ['#mechanisms', 'Mechanisms'],
                ['#synergy', 'Synergy Table'],
                ['#how-to-stack', 'How to Stack'],
                ['#products', 'Products'],
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
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted">ADHD cluster</p>
            <div className="mt-3 space-y-2">
              {[
                ['/articles/best-supplements-for-adhd', 'Best supplements for ADHD →'],
                ['/articles/magnesium-for-adhd', 'Magnesium for ADHD →'],
                ['/articles/l-theanine-for-adhd', 'L-Theanine for ADHD →'],
                ['/articles/adhd-stack-guide', 'ADHD stack guide →'],
                ['/guides/adhd-supplements', 'ADHD supplements guide →'],
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
        <Link href="/articles/" className="text-sm font-semibold text-brand-700 hover:text-brand-800">
          ← Back to Articles
        </Link>
      </div>
    </article>
  )
}
