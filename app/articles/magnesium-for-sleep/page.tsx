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

const SLUG = 'magnesium-for-sleep'
const TITLE = 'Magnesium for Sleep: Evidence, Types, Dosage, and What to Expect'
const DESCRIPTION =
  'Does magnesium improve sleep? A review of the clinical evidence, proposed mechanisms, the four main magnesium forms, dosage protocols, and how it compares to ashwagandha and other sleep supplements.'
const DATE = '2026-06-09'
const AUTHOR = 'Will'
const READING_TIME = '11 min read'
const TAGS = ['magnesium', 'sleep', 'minerals', 'glycinate', 'threonate']
const CATEGORY = 'minerals'

export const metadata = buildPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: `/articles/${SLUG}`,
  openGraphType: 'article',
})

// ─── FAQ data (also used for JSON-LD) ────────────────────────────────────────

const FAQS = [
  {
    question: 'How long does magnesium take to work for sleep?',
    answer:
      'Some people notice lighter relaxation effects within the first week. Consistent improvements in sleep quality are more commonly reported after 4–8 weeks of daily use, based on available clinical data.',
  },
  {
    question: 'Should I take magnesium at night for sleep?',
    answer:
      'Evening dosing (30–60 minutes before bed) is the most commonly studied timing for sleep applications. Taking it with a light meal or snack may reduce the risk of GI discomfort.',
  },
  {
    question: 'Which form of magnesium is best for sleep?',
    answer:
      'Magnesium glycinate is widely recommended for sleep due to its high bioavailability and glycine content (glycine has independent calming and sleep-promoting properties). Magnesium L-threonate is also used, particularly where cognitive benefits are a priority. Magnesium oxide has poor bioavailability and is generally not preferred for sleep applications.',
  },
  {
    question: 'Is magnesium safe to take every night?',
    answer:
      'Daily magnesium supplementation at moderate doses (200–400 mg elemental) is generally considered safe for healthy adults. The tolerable upper limit from supplements is 350 mg/day for most adults. Very high doses can cause diarrhea and GI upset. Consult a healthcare provider if you have kidney disease or take medications.',
  },
  {
    question: 'Can I take magnesium with ashwagandha for sleep?',
    answer:
      'These two supplements have different primary mechanisms (magnesium works at the cellular/NMDA level; ashwagandha primarily through HPA axis modulation). They are not known to interact adversely and are commonly combined in sleep stacks, though clinical trials examining the combination are limited.',
  },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MagnesiumForSleepPage() {
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
        you. We only link to magnesium forms and dose ranges consistent with the clinical protocols
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
              Does Magnesium Help With Sleep?
            </h2>
            <p className="mt-3 text-[1.01rem] leading-[1.85] text-[#46574d]">
              <strong>Possibly, particularly in people with low magnesium status or deficiency.</strong>{' '}
              Some clinical trials show improvements in sleep quality, sleep efficiency, and morning
              alertness with magnesium supplementation. The effect appears most consistent in older
              adults and individuals with suboptimal dietary magnesium intake.
            </p>
            <p className="mt-3 text-[1.01rem] leading-[1.85] text-[#46574d]">
              The overall evidence base is smaller and more heterogeneous than for some other sleep
              interventions. Magnesium is not a direct sedative. Its proposed benefits likely stem from
              correcting deficiency-related dysregulation of neurological processes involved in
              relaxation and sleep architecture, rather than from a pharmacological sleep-inducing
              effect.
            </p>
          </section>

          {/* Main article body */}
          <section className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8 space-y-8">

            {/* Introduction */}
            <div id="introduction">
              <h2 className="mb-3 text-2xl font-semibold tracking-tight text-ink">Introduction</h2>
              <p className="text-[1.01rem] leading-[1.85] text-[#46574d]">
                Magnesium is one of the most abundant minerals in the human body and is involved in
                over 300 enzymatic reactions. Despite its ubiquity, dietary magnesium insufficiency is
                common — estimated surveys suggest a meaningful proportion of adults in Western
                countries consume less than the recommended daily amount.
              </p>
              <p className="mt-3 text-[1.01rem] leading-[1.85] text-[#46574d]">
                Interest in magnesium for sleep has grown substantially, driven partly by consumer
                reports and partly by a coherent mechanistic story linking magnesium to the NMDA
                glutamate system, GABA activity, and melatonin synthesis pathways. This article
                reviews the clinical evidence, breaks down the differences between common magnesium
                forms, outlines clinically-informed dosing, and compares magnesium to{' '}
                <Link
                  href="/articles/ashwagandha-for-sleep"
                  className="font-semibold text-brand-700 hover:text-brand-800 hover:underline"
                >
                  ashwagandha for sleep
                </Link>
                .
              </p>
            </div>

            <hr className="border-brand-900/10" />

            {/* What Is Magnesium */}
            <div id="what-is-magnesium">
              <h2 className="mb-3 text-2xl font-semibold tracking-tight text-ink">
                What Is Magnesium?
              </h2>
              <p className="text-[1.01rem] leading-[1.85] text-[#46574d]">
                Magnesium (Mg) is an essential macromineral — the fourth most abundant mineral in the
                body and the second most common intracellular cation. It is required as a cofactor for
                ATP synthesis, DNA and RNA metabolism, protein synthesis, and the function of hundreds
                of enzymes.
              </p>
              <p className="mt-3 text-[1.01rem] leading-[1.85] text-[#46574d]">
                Dietary sources include leafy green vegetables, legumes, nuts, seeds, and whole grains.
                Magnesium content in food has declined in many modern diets due to soil depletion and
                food processing. Refined grains, for instance, lose a substantial portion of their
                magnesium during milling.
              </p>
              <p className="mt-3 text-[1.01rem] leading-[1.85] text-[#46574d]">
                Magnesium supplementation comes in many salt forms with different bioavailability and
                tissue distribution profiles. The form matters significantly for both tolerability and
                intended effect.
              </p>
            </div>

            <hr className="border-brand-900/10" />

            {/* How Magnesium May Affect Sleep */}
            <div id="mechanisms">
              <h2 className="mb-3 text-2xl font-semibold tracking-tight text-ink">
                How Magnesium May Affect Sleep
              </h2>
              <p className="text-[1.01rem] leading-[1.85] text-[#46574d]">
                Several mechanistic pathways have been proposed, based primarily on preclinical
                research and inference from deficiency studies:
              </p>

              <h3 className="mt-5 mb-1 text-xl font-semibold tracking-tight text-ink">
                1. NMDA Receptor Antagonism
              </h3>
              <p className="text-[1.01rem] leading-[1.85] text-[#46574d]">
                Magnesium ions block NMDA glutamate receptors in a voltage-dependent manner. This
                reduces excitatory glutamatergic neurotransmission, which may facilitate the shift
                from wakefulness to sleep by reducing cortical excitability. Magnesium deficiency
                has been associated with NMDA receptor hyperactivation in animal models.
              </p>

              <h3 className="mt-5 mb-1 text-xl font-semibold tracking-tight text-ink">
                2. GABA-A Receptor Potentiation
              </h3>
              <p className="text-[1.01rem] leading-[1.85] text-[#46574d]">
                Magnesium may enhance the activity of GABA — the primary inhibitory neurotransmitter
                — at GABA-A receptors. Some preclinical evidence suggests magnesium increases both
                GABA receptor density and sensitivity, though the translation to clinically meaningful
                sedation at standard supplemental doses in humans is not firmly established.
              </p>

              <h3 className="mt-5 mb-1 text-xl font-semibold tracking-tight text-ink">
                3. Melatonin Synthesis Support
              </h3>
              <p className="text-[1.01rem] leading-[1.85] text-[#46574d]">
                Magnesium is a cofactor in the enzymatic conversion pathway that produces melatonin.
                Deficiency may limit melatonin production. A small number of studies in older adults
                have measured serum melatonin changes alongside magnesium supplementation, though
                findings are not consistent across trials.
              </p>

              <h3 className="mt-5 mb-1 text-xl font-semibold tracking-tight text-ink">
                4. HPA Axis and Cortisol Modulation
              </h3>
              <p className="text-[1.01rem] leading-[1.85] text-[#46574d]">
                Magnesium appears to modulate the HPA axis stress response. Deficiency is associated
                with elevated inflammatory markers and stress sensitivity in animal models.
                Magnesium supplementation has reduced cortisol in some human studies, though the
                effect size and consistency vary across trials.
              </p>

              <h3 className="mt-5 mb-1 text-xl font-semibold tracking-tight text-ink">
                5. Glycine (Magnesium Glycinate Specific)
              </h3>
              <p className="text-[1.01rem] leading-[1.85] text-[#46574d]">
                In the glycinate form, magnesium is bound to glycine — an inhibitory amino acid
                that independently promotes sleep. Glycine supplementation has been shown in some
                small trials to reduce core body temperature and improve subjective sleep quality.
                This additive effect may account for why magnesium glycinate is more commonly
                preferred for sleep applications than other forms.
              </p>
            </div>

            <hr className="border-brand-900/10" />

            {/* Evidence Summary */}
            {/* TODO: Replace summary text with workbook-verified evidence once the evidence pipeline runs for magnesium-sleep */}
            {/* TODO: Insert exact trial PMID links from workbook once available */}
            <div id="evidence-summary">
              <h2 className="mb-4 text-2xl font-semibold tracking-tight text-ink">
                Evidence Summary
              </h2>

              <EvidenceSummaryCard
                title="Magnesium &amp; Sleep Quality"
                evidenceLevel="Limited"
                humanEvidence="Some RCTs and observational studies suggest magnesium supplementation improves sleep quality, sleep efficiency, and early morning awakening, particularly in older adults and deficient populations. Evidence in healthy, magnesium-replete younger adults is more limited. Trial sizes tend to be small."
                mechanisticEvidence="NMDA antagonism, GABA-A potentiation, and melatonin synthesis support are biologically plausible and supported by preclinical data. Human mechanistic evidence is indirect — derived mainly from deficiency correction studies rather than pharmacological effects."
                safetyProfile="Generally well-tolerated at supplemental doses (200–400 mg elemental/day). The most common adverse effect is GI upset, particularly with oxide and citrate forms at higher doses. Contraindicated or requires caution in kidney disease."
              />

              <div className="mt-4 rounded-[1rem] border border-brand-900/10 bg-brand-50/60 p-4 text-sm leading-7 text-[#46574d]">
                <p className="font-semibold text-ink">Key trials and reviews referenced:</p>
                {/* TODO: Populate PMID links from workbook once evidence pipeline is complete */}
                <ul className="mt-2 ml-5 space-y-1 list-disc">
                  <li>
                    Abbasi et al. — magnesium supplementation in elderly adults with insomnia,
                    randomized, double-blind, placebo-controlled
                  </li>
                  <li>
                    Nielsen et al. — magnesium deficiency and sleep disruption, crossover design
                  </li>
                  <li>
                    Held et al. — magnesium and melatonin/cortisol in older adults, short-term
                    supplementation
                  </li>
                </ul>
                <p className="mt-2 text-xs text-muted">
                  Full reference table in Sources section below. PMID links and n-sizes will be added
                  once workbook evidence pipeline is complete.
                </p>
              </div>
            </div>

            <hr className="border-brand-900/10" />

            {/* Magnesium Types Comparison */}
            {/* TODO: Verify bioavailability figures against workbook compound data for magnesium forms */}
            <div id="types-comparison">
              <h2 className="mb-4 text-2xl font-semibold tracking-tight text-ink">
                Magnesium Types Comparison
              </h2>
              <p className="mb-4 text-[1.01rem] leading-[1.85] text-[#46574d]">
                Not all magnesium supplements are equal. The mineral must be bound to a carrier
                molecule (a salt), which affects absorption, GI tolerability, tissue distribution,
                and secondary effects. The four forms most commonly discussed in the context of
                sleep are:
              </p>

              <div className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-5 shadow-sm">
                <ResponsiveTable label="Magnesium forms comparison table">
                  <table className="min-w-[620px] w-full text-sm">
                    <thead>
                      <tr className="border-b border-brand-900/10">
                        <th className="pb-2 pr-4 text-left text-xs font-bold uppercase tracking-wider text-muted">
                          Form
                        </th>
                        <th className="pb-2 pr-4 text-left text-xs font-bold uppercase tracking-wider text-muted">
                          Bioavailability
                        </th>
                        <th className="pb-2 pr-4 text-left text-xs font-bold uppercase tracking-wider text-muted">
                          GI Tolerance
                        </th>
                        <th className="pb-2 pr-4 text-left text-xs font-bold uppercase tracking-wider text-muted">
                          Sleep Relevance
                        </th>
                        <th className="pb-2 text-left text-xs font-bold uppercase tracking-wider text-muted">
                          Notes
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-900/5">
                      <tr className="align-top">
                        <td className="py-3 pr-4 font-medium text-ink">Glycinate</td>
                        <td className="py-3 pr-4 text-[#46574d]">High</td>
                        <td className="py-3 pr-4 text-[#46574d]">Excellent</td>
                        <td className="py-3 pr-4 text-[#46574d]">
                          Most recommended for sleep
                        </td>
                        <td className="py-3 text-[#46574d]">
                          Glycine co-carrier has independent calming effects; well-studied
                        </td>
                      </tr>
                      <tr className="align-top">
                        <td className="py-3 pr-4 font-medium text-ink">L-Threonate</td>
                        <td className="py-3 pr-4 text-[#46574d]">High (CNS-targeted)</td>
                        <td className="py-3 pr-4 text-[#46574d]">Good</td>
                        <td className="py-3 pr-4 text-[#46574d]">
                          Used for cognitive + sleep overlap
                        </td>
                        <td className="py-3 text-[#46574d]">
                          May cross blood-brain barrier more effectively; limited but promising
                          human trial data
                        </td>
                      </tr>
                      <tr className="align-top">
                        <td className="py-3 pr-4 font-medium text-ink">Citrate</td>
                        <td className="py-3 pr-4 text-[#46574d]">Moderate–High</td>
                        <td className="py-3 pr-4 text-[#46574d]">Moderate</td>
                        <td className="py-3 pr-4 text-[#46574d]">General use; some sleep benefit</td>
                        <td className="py-3 text-[#46574d]">
                          Affordable and widely available; higher doses may cause loose stools
                        </td>
                      </tr>
                      <tr className="align-top">
                        <td className="py-3 pr-4 font-medium text-ink">Oxide</td>
                        <td className="py-3 pr-4 text-[#46574d]">Low</td>
                        <td className="py-3 pr-4 text-[#46574d]">Poor at higher doses</td>
                        <td className="py-3 pr-4 text-[#46574d]">Not preferred for sleep</td>
                        <td className="py-3 text-[#46574d]">
                          Most common and cheapest form; mainly used as a laxative; low absorption
                          limits sleep utility
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </ResponsiveTable>
              </div>

              <div className="mt-5 space-y-5">
                <div>
                  <h3 className="mb-1 text-xl font-semibold tracking-tight text-ink">
                    Magnesium Glycinate
                  </h3>
                  <p className="text-[1.01rem] leading-[1.85] text-[#46574d]">
                    The most widely recommended form for sleep applications. Glycine, the bound amino
                    acid, is itself an inhibitory neurotransmitter and has been studied for its own
                    sleep-promoting effects. The combination of high magnesium bioavailability and
                    glycine synergy makes this the default choice for most people targeting sleep
                    quality.
                  </p>
                </div>

                <div>
                  <h3 className="mb-1 text-xl font-semibold tracking-tight text-ink">
                    Magnesium L-Threonate
                  </h3>
                  <p className="text-[1.01rem] leading-[1.85] text-[#46574d]">
                    Developed to enhance brain magnesium levels via the threonate carrier&apos;s
                    proposed ability to cross the blood-brain barrier more readily. Some animal and
                    early human research suggests cognitive benefits alongside sleep improvement.
                    More expensive than glycinate; limited but growing clinical data. A reasonable
                    choice for those prioritizing both sleep and cognitive function.
                  </p>
                </div>

                <div>
                  <h3 className="mb-1 text-xl font-semibold tracking-tight text-ink">
                    Magnesium Citrate
                  </h3>
                  <p className="text-[1.01rem] leading-[1.85] text-[#46574d]">
                    A practical, widely available, mid-range option. Bioavailability is meaningfully
                    better than oxide, and it is substantially cheaper than glycinate or threonate.
                    At higher doses (above ~400 mg elemental), loose stools become more likely.
                    Suitable for general magnesium repletion; reasonable for sleep support at lower
                    to moderate doses.
                  </p>
                </div>

                <div>
                  <h3 className="mb-1 text-xl font-semibold tracking-tight text-ink">
                    Magnesium Oxide
                  </h3>
                  <p className="text-[1.01rem] leading-[1.85] text-[#46574d]">
                    The most common form in cheap multivitamins and laxative products. Absorption is
                    substantially lower than other organic salt forms. While a small amount of
                    elemental magnesium is still absorbed, the dose required to deliver meaningful
                    systemic magnesium is poorly tolerated. Not the preferred choice for sleep
                    applications.
                  </p>
                </div>
              </div>
            </div>

            <hr className="border-brand-900/10" />

            {/* Dosage */}
            {/* TODO: Verify elemental magnesium content calculations for each form against workbook compound data */}
            {/* TODO: Confirm upper tolerable intake level citation from workbook once evidence pipeline runs */}
            <div id="dosage">
              <h2 className="mb-4 text-2xl font-semibold tracking-tight text-ink">
                Dosage and Usage
              </h2>

              <div className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-5 shadow-sm">
                <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-muted">
                  Dosage Reference — Sleep Protocols
                </p>
                <ResponsiveTable label="Magnesium dosage reference table">
                  <table className="min-w-[560px] w-full text-sm">
                    <thead>
                      <tr className="border-b border-brand-900/10">
                        <th className="pb-2 pr-4 text-left text-xs font-bold uppercase tracking-wider text-muted">
                          Form
                        </th>
                        <th className="pb-2 pr-4 text-left text-xs font-bold uppercase tracking-wider text-muted">
                          Elemental Dose
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
                        <td className="py-3 pr-4 font-medium text-ink">Glycinate</td>
                        <td className="py-3 pr-4 text-[#46574d]">200–400 mg</td>
                        <td className="py-3 pr-4 text-[#46574d]">30–60 min before bed</td>
                        <td className="py-3 text-[#46574d]">Most recommended for sleep; start low</td>
                      </tr>
                      <tr className="align-top">
                        <td className="py-3 pr-4 font-medium text-ink">L-Threonate</td>
                        <td className="py-3 pr-4 text-[#46574d]">
                          ~144 mg elemental (per typical label dose)
                        </td>
                        <td className="py-3 pr-4 text-[#46574d]">Evening, with or without food</td>
                        <td className="py-3 text-[#46574d]">
                          {/* TODO: Verify typical Magtein™ dose from workbook */}
                          Higher price point; follow product-specific label
                        </td>
                      </tr>
                      <tr className="align-top">
                        <td className="py-3 pr-4 font-medium text-ink">Citrate</td>
                        <td className="py-3 pr-4 text-[#46574d]">200–350 mg</td>
                        <td className="py-3 pr-4 text-[#46574d]">Evening, with food</td>
                        <td className="py-3 text-[#46574d]">
                          Higher doses may cause loose stools; split if needed
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </ResponsiveTable>
                <p className="mt-3 text-xs text-muted">
                  Elemental magnesium content (not product weight) is the relevant dosing figure.
                  The tolerable upper intake level from supplements is 350 mg/day for adults per
                  most regulatory guidance. Individual needs vary — consult a healthcare provider to
                  check your magnesium status before supplementing at high doses.
                </p>
              </div>
            </div>

            <hr className="border-brand-900/10" />

            {/* Affiliate Product Recommendations */}
            <div id="product-recommendations">
              <h2 className="mb-3 text-2xl font-semibold tracking-tight text-ink">
                Affiliate Product Recommendations
              </h2>
              <p className="text-[1.01rem] leading-[1.85] text-[#46574d]">
                These products use the magnesium forms and dose ranges most relevant to sleep
                applications reviewed in this article. Affiliate links support this site at no
                additional cost to you.
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm">
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted">
                    Best for: Sleep Quality &amp; Relaxation
                  </p>
                  <p className="font-semibold text-ink">Magnesium Glycinate</p>
                  <p className="mt-1 text-xs leading-5 text-[#46574d]">
                    High bioavailability, gentle on the stomach. Look for products providing
                    200–400 mg elemental magnesium per serving with no fillers or unnecessary
                    additives.
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
                    Best for: Sleep + Cognitive Function
                  </p>
                  <p className="font-semibold text-ink">Magnesium L-Threonate</p>
                  <p className="mt-1 text-xs leading-5 text-[#46574d]">
                    CNS-targeted delivery. Commonly sold as Magtein™. Higher price point than
                    glycinate, but preferred when cognitive benefits are also a goal.
                  </p>
                  <a
                    href={`https://www.amazon.com/s?k=magnesium+l-threonate+magtein&tag=${AFFILIATE_TAGS.amazon}`}
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
              <SafetyNotice title="Safety Summary — Magnesium for Sleep">
                <ul className="ml-5 space-y-1.5 list-disc">
                  <li>
                    <strong>Generally well-tolerated</strong> at supplemental doses of 200–400 mg
                    elemental per day in healthy adults with normal kidney function.
                  </li>
                  <li>
                    <strong>GI effects</strong> (diarrhea, loose stools, cramping) are the most
                    common dose-dependent side effects, especially with oxide and citrate forms.
                    Starting low and taking with food reduces incidence.
                  </li>
                  <li>
                    <strong>Kidney disease:</strong> The kidneys regulate magnesium excretion.
                    Supplementation in people with reduced kidney function (CKD stage 3+) can
                    cause hypermagnesemia. Consult a physician before supplementing.
                  </li>
                  <li>
                    <strong>Drug interactions:</strong> Magnesium may interfere with the absorption
                    of bisphosphonates, some antibiotics (fluoroquinolones, tetracyclines), and
                    certain blood pressure medications. Separate doses by at least 2 hours when
                    taking with these medications.
                  </li>
                  <li>
                    <strong>Hypermagnesemia (excess):</strong> Very high doses or impaired excretion
                    can cause muscle weakness, low blood pressure, bradycardia, and in severe cases
                    cardiac arrest. Toxicity from food alone is not a practical concern; risk is
                    from high-dose supplementation plus impaired kidney function.
                  </li>
                  <li>
                    <strong>Pregnancy/lactation:</strong> Dietary magnesium is safe and important
                    during pregnancy. High supplemental doses should be discussed with a healthcare
                    provider.
                  </li>
                </ul>
              </SafetyNotice>
            </div>

            <hr className="border-brand-900/10" />

            {/* Magnesium vs Ashwagandha */}
            <div id="comparison">
              <h2 className="mb-4 text-2xl font-semibold tracking-tight text-ink">
                Magnesium vs Ashwagandha for Sleep
              </h2>
              <p className="mb-4 text-[1.01rem] leading-[1.85] text-[#46574d]">
                Both magnesium and ashwagandha are commonly used for sleep support, but they work
                through different mechanisms and suit different situations. Comparing them directly
                can help inform a more targeted approach.
              </p>

              <ResponsiveTable label="Magnesium vs ashwagandha sleep comparison">
                <table className="min-w-[600px] w-full text-sm">
                  <thead>
                    <tr className="border-b border-brand-900/10">
                      <th className="pb-2 pr-4 text-left text-xs font-bold uppercase tracking-wider text-muted">
                        Factor
                      </th>
                      <th className="pb-2 pr-4 text-left text-xs font-bold uppercase tracking-wider text-muted">
                        Magnesium
                      </th>
                      <th className="pb-2 text-left text-xs font-bold uppercase tracking-wider text-muted">
                        Ashwagandha
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-900/5">
                    <tr className="align-top">
                      <td className="py-3 pr-4 font-medium text-ink">Primary mechanism</td>
                      <td className="py-3 pr-4 text-[#46574d]">
                        NMDA antagonism, GABA support, melatonin pathway
                      </td>
                      <td className="py-3 text-[#46574d]">HPA axis, cortisol, GABA-A</td>
                    </tr>
                    <tr className="align-top">
                      <td className="py-3 pr-4 font-medium text-ink">Best suited for</td>
                      <td className="py-3 pr-4 text-[#46574d]">
                        Deficiency correction, muscle tension, general sleep quality
                      </td>
                      <td className="py-3 text-[#46574d]">Stress-driven poor sleep, anxiety</td>
                    </tr>
                    <tr className="align-top">
                      <td className="py-3 pr-4 font-medium text-ink">Evidence quality</td>
                      <td className="py-3 pr-4 text-[#46574d]">Limited–Moderate (smaller RCTs)</td>
                      <td className="py-3 text-[#46574d]">Moderate (multiple RCTs)</td>
                    </tr>
                    <tr className="align-top">
                      <td className="py-3 pr-4 font-medium text-ink">Onset of effect</td>
                      <td className="py-3 pr-4 text-[#46574d]">1–4+ weeks</td>
                      <td className="py-3 text-[#46574d]">6–8 weeks (most trials)</td>
                    </tr>
                    <tr className="align-top">
                      <td className="py-3 pr-4 font-medium text-ink">Key safety concern</td>
                      <td className="py-3 pr-4 text-[#46574d]">Kidney function, GI upset</td>
                      <td className="py-3 text-[#46574d]">Rare hepatotoxicity, thyroid effects</td>
                    </tr>
                    <tr className="align-top">
                      <td className="py-3 pr-4 font-medium text-ink">Stackable?</td>
                      <td className="py-3 pr-4 text-[#46574d]">Yes, no known interaction</td>
                      <td className="py-3 text-[#46574d]">Yes, commonly combined</td>
                    </tr>
                  </tbody>
                </table>
              </ResponsiveTable>

              <p className="mt-3 text-sm text-muted">
                For a comprehensive look at ashwagandha&apos;s sleep evidence, see the{' '}
                <Link
                  href="/articles/ashwagandha-for-sleep"
                  className="font-semibold text-brand-700 hover:text-brand-800 hover:underline"
                >
                  Ashwagandha for Sleep article
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
                    Evidence, dosage, and mechanisms for ashwagandha as a sleep supplement — and
                    how it compares to other options.
                  </p>
                </Link>
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
                    passionflower, and more — with decision framework and combination guidance.
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
                <div className="rounded-[0.75rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm opacity-60">
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted">
                    Coming Soon
                  </p>
                  <p className="font-semibold text-ink">Sleep Stack Guide</p>
                  <p className="mt-1 text-xs text-muted">
                    How to combine magnesium, ashwagandha, and other sleep supplements safely.
                  </p>
                </div>
              </div>
            </div>

            <hr className="border-brand-900/10" />

            {/* Sources */}
            {/* TODO: Replace placeholder stubs with workbook-verified references once evidence pipeline runs */}
            {/* TODO: Add full citation details and PMIDs for all trials once workbook evidence pipeline is complete */}
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
                        The effect of magnesium supplementation on primary insomnia in elderly: A
                        double-blind placebo-controlled clinical trial
                      </td>
                      <td className="py-3 pr-4 text-muted">
                        Abbasi B, Kimiagar M, Sadeghniiat K, Shirazi MM, Hedayati M, Rashidkhani B
                      </td>
                      <td className="py-3 pr-4 text-muted">2012</td>
                      <td className="py-3 text-muted">
                        {/* TODO: Confirm PMID from workbook */}
                        TODO: Add PMID
                      </td>
                    </tr>
                    <tr className="align-top">
                      <td className="py-3 pr-3 text-muted">2</td>
                      <td className="py-3 pr-4 leading-6 text-ink">
                        Magnesium deprivation disrupts sleep in rats: behavioral and EEG findings
                      </td>
                      <td className="py-3 pr-4 text-muted">Nielsen FH, Johnson LK, Zeng H</td>
                      <td className="py-3 pr-4 text-muted">2010</td>
                      <td className="py-3 text-muted">
                        {/* TODO: Confirm PMID from workbook */}
                        TODO: Add PMID
                      </td>
                    </tr>
                    <tr className="align-top">
                      <td className="py-3 pr-3 text-muted">3</td>
                      <td className="py-3 pr-4 leading-6 text-ink">
                        Oral Mg(2+) supplementation reverses age-related neuroendocrine and sleep EEG
                        changes in humans
                      </td>
                      <td className="py-3 pr-4 text-muted">
                        Held K, Antonijevic IA, Künzel H, Uhr M, Wetter TC, Golly IC, Steiger A,
                        Murck H
                      </td>
                      <td className="py-3 pr-4 text-muted">2002</td>
                      <td className="py-3 text-muted">
                        {/* TODO: Confirm PMID from workbook */}
                        TODO: Add PMID
                      </td>
                    </tr>
                    <tr className="align-top">
                      <td className="py-3 pr-3 text-muted">4</td>
                      <td className="py-3 pr-4 leading-6 text-ink">
                        Enhancement of Learning and Memory by Elevating Brain Magnesium
                      </td>
                      <td className="py-3 pr-4 text-muted">
                        Slutsky I, Abumaria N, Wu LJ, Huang C, Zhang L, Li B, Zhao X, Govindarajan A,
                        Zhao MG, Zhuo M, Tonegawa S, Liu G
                      </td>
                      <td className="py-3 pr-4 text-muted">2010</td>
                      <td className="py-3 text-muted">
                        {/* TODO: Confirm PMID from workbook */}
                        TODO: Add PMID
                      </td>
                    </tr>
                    <tr className="align-top">
                      <td className="py-3 pr-3 text-muted">5</td>
                      <td className="py-3 pr-4 leading-6 text-ink">
                        Glycine ingestion improves subjective sleep quality in human volunteers,
                        correlating with polysomnographic changes
                      </td>
                      <td className="py-3 pr-4 text-muted">
                        Yamadera W, Inagawa K, Chiba S, Bannai M, Takahashi M, Nakayama K
                      </td>
                      <td className="py-3 pr-4 text-muted">2007</td>
                      <td className="py-3 text-muted">
                        {/* TODO: Confirm PMID from workbook */}
                        TODO: Add PMID
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
                ['#introduction', 'Introduction'],
                ['#what-is-magnesium', 'What Is Magnesium?'],
                ['#mechanisms', 'How It Affects Sleep'],
                ['#evidence-summary', 'Evidence Summary'],
                ['#types-comparison', 'Magnesium Types'],
                ['#dosage', 'Dosage &amp; Usage'],
                ['#product-recommendations', 'Product Picks'],
                ['#safety', 'Safety &amp; Side Effects'],
                ['#comparison', 'vs Ashwagandha'],
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
                href="/articles/ashwagandha-for-sleep"
                className="block text-sm font-medium text-brand-700 hover:text-brand-800 hover:underline"
              >
                Ashwagandha for sleep →
              </Link>
              <Link
                href="/sleep-herbs-vs-melatonin"
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
