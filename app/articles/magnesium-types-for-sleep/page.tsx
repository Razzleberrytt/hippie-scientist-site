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

const SLUG = 'magnesium-types-for-sleep'
const TITLE = 'Magnesium Types for Sleep: Glycinate vs Threonate vs Citrate'
const DESCRIPTION =
  'A practical comparison of magnesium glycinate, threonate, citrate, oxide, malate, and taurate for sleep — covering absorption, GI tolerability, best uses, safety, and buyer guidance.'
const DATE = '2026-06-09'
const AUTHOR = 'Will'
const READING_TIME = '13 min read'
const TAGS = ['magnesium', 'sleep', 'glycinate', 'threonate', 'citrate']
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
    question: 'What is the best magnesium for sleep?',
    answer:
      'Magnesium glycinate is the most widely recommended form for sleep. It has high bioavailability, excellent GI tolerability, and the glycine carrier molecule has independent calming and sleep-supporting properties. For those also prioritizing cognitive function, magnesium L-threonate is an alternative at a higher price point.',
  },
  {
    question: 'Is magnesium glycinate better than citrate for sleep?',
    answer:
      'For sleep specifically, glycinate is generally preferred over citrate. Both forms are better absorbed than oxide. Glycinate is gentler on the GI system at typical doses and the glycine component adds a calming effect. Citrate is better suited when constipation is also a concern, though higher doses of citrate can cause loose stools.',
  },
  {
    question: 'Is magnesium threonate worth it?',
    answer:
      'Magnesium L-threonate (often sold as Magtein™) is significantly more expensive than glycinate. The proposed advantage is better penetration into the central nervous system, supported by animal data and some early human trials showing cognitive benefits. If sleep is your only goal and budget matters, glycinate is likely adequate. If cognitive benefits alongside sleep are a priority, threonate may be worth the premium.',
  },
  {
    question: 'Why does magnesium upset my stomach?',
    answer:
      'GI upset from magnesium is most common with oxide and citrate forms, and at higher doses. Magnesium draws water into the gut osmotically, which can cause loose stools or cramping. Switching to magnesium glycinate, taking with food, and starting at lower doses (100–200 mg elemental) then titrating up usually resolves GI issues.',
  },
  {
    question: 'How much magnesium should I take for sleep?',
    answer:
      'Most sleep-focused protocols use 200–400 mg of elemental magnesium per day, taken in the evening. Check the label for elemental magnesium content — this differs from total product weight. The tolerable upper intake level from supplements is 350 mg/day for most adults per standard regulatory guidance (NIH Office of Dietary Supplements).',
  },
  {
    question: 'Can I combine magnesium with ashwagandha?',
    answer:
      'Yes. Magnesium and ashwagandha work through different primary mechanisms — magnesium via NMDA and GABA pathways, ashwagandha via HPA axis modulation — and are not known to interact adversely. They are commonly combined in sleep stacks. Start each supplement individually before combining to assess individual tolerability.',
  },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MagnesiumTypesForSleepPage() {
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
            Buyer&apos;s Guide
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
              Which Magnesium Type Is Best for Sleep?
            </h2>
            <div className="mt-3 space-y-3 text-[1.01rem] leading-[1.85] text-[#46574d]">
              <p>
                <strong>Best overall for sleep: Magnesium glycinate.</strong> High bioavailability,
                excellent GI tolerance, and the glycine co-carrier provides an additive calming
                effect. The default choice for most people.
              </p>
              <p>
                <strong>Best premium/cognitive option: Magnesium threonate.</strong> Proposed CNS
                targeting with early evidence for cognitive and sleep benefits. Considerably more
                expensive than glycinate.
              </p>
              <p>
                <strong>Best if constipation is also an issue: Magnesium citrate.</strong> Better
                absorbed than oxide; gentle laxative effect at moderate doses can be useful if
                constipation overlaps with your sleep goals. Not ideal as a default sleep form.
              </p>
              <p>
                <strong>Worst default sleep pick: Magnesium oxide.</strong> Cheapest and most
                common in stores, but substantially lower absorption limits its usefulness for
                sleep-specific applications. Best suited as a laxative.
              </p>
              <p>
                <strong>Best for muscle pain/fatigue overlap: Magnesium malate.</strong> Malate
                (malic acid) is involved in ATP production and may suit people whose sleep
                difficulty overlaps with muscle fatigue or fibromyalgia-like symptoms.
              </p>
              <p>
                <strong>Possible calming option: Magnesium taurate.</strong> Taurine has calming
                and cardiometabolic properties; limited direct sleep trial data but theoretically
                complementary for people with cardiovascular or anxiety overlap.
              </p>
            </div>
          </section>

          {/* Main article body */}
          <section className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8 space-y-8">

            {/* Comparison table */}
            <div id="comparison-table">
              <h2 className="mb-4 text-2xl font-semibold tracking-tight text-ink">
                Magnesium Forms Compared
              </h2>
              <p className="mb-4 text-[1.01rem] leading-[1.85] text-[#46574d]">
                The table below summarises the six most commonly discussed magnesium forms for
                sleep applications. Bioavailability rankings are relative — exact absorption
                percentages vary by individual, dose, and food intake and are approximate estimates.
              </p>

              <div className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-5 shadow-sm">
                <ResponsiveTable label="Magnesium forms comparison for sleep">
                  <table className="min-w-[760px] w-full text-sm">
                    <thead>
                      <tr className="border-b border-brand-900/10">
                        <th className="pb-2 pr-4 text-left text-xs font-bold uppercase tracking-wider text-muted">
                          Form
                        </th>
                        <th className="pb-2 pr-4 text-left text-xs font-bold uppercase tracking-wider text-muted">
                          Best For
                        </th>
                        <th className="pb-2 pr-4 text-left text-xs font-bold uppercase tracking-wider text-muted">
                          Sleep Fit
                        </th>
                        <th className="pb-2 pr-4 text-left text-xs font-bold uppercase tracking-wider text-muted">
                          GI Tolerance
                        </th>
                        <th className="pb-2 pr-4 text-left text-xs font-bold uppercase tracking-wider text-muted">
                          Cost
                        </th>
                        <th className="pb-2 pr-4 text-left text-xs font-bold uppercase tracking-wider text-muted">
                          Main Drawback
                        </th>
                        <th className="pb-2 text-left text-xs font-bold uppercase tracking-wider text-muted">
                          Buyer Verdict
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-900/5">
                      <tr className="align-top">
                        <td className="py-3 pr-4 font-medium text-ink">Glycinate</td>
                        <td className="py-3 pr-4 text-[#46574d]">Sleep, relaxation, general</td>
                        <td className="py-3 pr-4 text-[#46574d]">★★★★★</td>
                        <td className="py-3 pr-4 text-[#46574d]">Excellent</td>
                        <td className="py-3 pr-4 text-[#46574d]">Moderate</td>
                        <td className="py-3 pr-4 text-[#46574d]">Higher cost than oxide</td>
                        <td className="py-3 text-brand-700 font-semibold">Best overall pick</td>
                      </tr>
                      <tr className="align-top">
                        <td className="py-3 pr-4 font-medium text-ink">Threonate</td>
                        <td className="py-3 pr-4 text-[#46574d]">Sleep + cognition</td>
                        <td className="py-3 pr-4 text-[#46574d]">★★★★☆</td>
                        <td className="py-3 pr-4 text-[#46574d]">Good</td>
                        <td className="py-3 pr-4 text-[#46574d]">High</td>
                        <td className="py-3 pr-4 text-[#46574d]">Expensive; limited trial data</td>
                        <td className="py-3 text-[#46574d]">Premium option</td>
                      </tr>
                      <tr className="align-top">
                        <td className="py-3 pr-4 font-medium text-ink">Citrate</td>
                        <td className="py-3 pr-4 text-[#46574d]">Constipation + sleep overlap</td>
                        <td className="py-3 pr-4 text-[#46574d]">★★★☆☆</td>
                        <td className="py-3 pr-4 text-[#46574d]">Moderate</td>
                        <td className="py-3 pr-4 text-[#46574d]">Low–Moderate</td>
                        <td className="py-3 pr-4 text-[#46574d]">Laxative effect at high doses</td>
                        <td className="py-3 text-[#46574d]">If constipation overlaps</td>
                      </tr>
                      <tr className="align-top">
                        <td className="py-3 pr-4 font-medium text-ink">Oxide</td>
                        <td className="py-3 pr-4 text-[#46574d]">Laxative use; cheap repletion</td>
                        <td className="py-3 pr-4 text-[#46574d]">★☆☆☆☆</td>
                        <td className="py-3 pr-4 text-[#46574d]">Poor at higher doses</td>
                        <td className="py-3 pr-4 text-[#46574d]">Very low</td>
                        <td className="py-3 pr-4 text-[#46574d]">Low absorption; GI effects</td>
                        <td className="py-3 text-[#46574d]">Not recommended for sleep</td>
                      </tr>
                      <tr className="align-top">
                        <td className="py-3 pr-4 font-medium text-ink">Malate</td>
                        <td className="py-3 pr-4 text-[#46574d]">Muscle fatigue overlap</td>
                        <td className="py-3 pr-4 text-[#46574d]">★★★☆☆</td>
                        <td className="py-3 pr-4 text-[#46574d]">Good</td>
                        <td className="py-3 pr-4 text-[#46574d]">Moderate</td>
                        <td className="py-3 pr-4 text-[#46574d]">Limited direct sleep data</td>
                        <td className="py-3 text-[#46574d]">If muscle fatigue overlaps</td>
                      </tr>
                      <tr className="align-top">
                        <td className="py-3 pr-4 font-medium text-ink">Taurate</td>
                        <td className="py-3 pr-4 text-[#46574d]">Calming, cardiometabolic</td>
                        <td className="py-3 pr-4 text-[#46574d]">★★★☆☆</td>
                        <td className="py-3 pr-4 text-[#46574d]">Good</td>
                        <td className="py-3 pr-4 text-[#46574d]">Moderate–High</td>
                        <td className="py-3 pr-4 text-[#46574d]">Very limited human sleep data</td>
                        <td className="py-3 text-[#46574d]">Niche/overlap use</td>
                      </tr>
                    </tbody>
                  </table>
                </ResponsiveTable>
              </div>
            </div>

            <hr className="border-brand-900/10" />

            {/* Why form matters */}
            <div id="why-form-matters">
              <h2 className="mb-3 text-2xl font-semibold tracking-tight text-ink">
                Why Magnesium Form Matters
              </h2>
              <p className="text-[1.01rem] leading-[1.85] text-[#46574d]">
                Magnesium is a mineral — it cannot exist as a supplement on its own. It must be
                bound to a carrier molecule (a salt or amino acid) to be stable and absorbable.
                That carrier molecule determines four things that matter for sleep applications:
              </p>

              <h3 className="mt-5 mb-1 text-xl font-semibold tracking-tight text-ink">
                1. Elemental Magnesium Content
              </h3>
              <p className="text-[1.01rem] leading-[1.85] text-[#46574d]">
                A &quot;500 mg magnesium&quot; label almost never means 500 mg of actual magnesium.
                It refers to the total weight of the magnesium salt compound. For example,
                magnesium oxide has a high percentage of elemental magnesium by weight (~60%)
                because oxide is a small molecule. Magnesium glycinate has a lower percentage
                (~14%) because glycine is a heavier carrier. A label claiming 500 mg of magnesium
                glycinate delivers far less elemental magnesium than the same weight of magnesium
                oxide. Always look for &quot;elemental magnesium&quot; on the supplement facts panel
                — that is the number that matters.
              </p>

              <h3 className="mt-5 mb-1 text-xl font-semibold tracking-tight text-ink">
                2. Absorption Differences
              </h3>
              <p className="text-[1.01rem] leading-[1.85] text-[#46574d]">
                Not all magnesium is absorbed equally. Organic salts (glycinate, malate, citrate,
                threonate) are generally better absorbed than inorganic forms (oxide, carbonate).
                The exact absorption percentages vary by form, dose, individual magnesium status,
                and whether the supplement is taken with food.
                Absorption rankings, from best to worst, are broadly: threonate ≈ glycinate &gt;
                malate ≈ citrate &gt; oxide.
              </p>

              <h3 className="mt-5 mb-1 text-xl font-semibold tracking-tight text-ink">
                3. GI Tolerance
              </h3>
              <p className="text-[1.01rem] leading-[1.85] text-[#46574d]">
                Poorly absorbed magnesium stays in the gut and draws water osmotically — this is
                how magnesium oxide works as a laxative. Magnesium citrate has a similar but
                weaker effect at typical doses. Glycinate, malate, and threonate are absorbed more
                efficiently before reaching the colon, producing far less GI disruption. If
                previous magnesium experiences involved diarrhea or cramping, switching to
                glycinate usually resolves this.
              </p>

              <h3 className="mt-5 mb-1 text-xl font-semibold tracking-tight text-ink">
                4. Secondary Effects from the Carrier
              </h3>
              <p className="text-[1.01rem] leading-[1.85] text-[#46574d]">
                The bound molecule is not inert — it exerts its own biological effects. Glycine
                is an inhibitory amino acid and independent sleep-promoting agent. Taurine has
                calming and cardiovascular properties. Malate (malic acid) is a Krebs cycle
                intermediate involved in energy production. Threonate may help transport magnesium
                across the blood-brain barrier. These secondary effects are part of why form
                selection matters beyond simple bioavailability.
              </p>
            </div>

            <hr className="border-brand-900/10" />

            {/* Glycinate deep dive */}
            <div id="glycinate">
              <h2 className="mb-3 text-2xl font-semibold tracking-tight text-ink">
                Deep Dive: Magnesium Glycinate
              </h2>

              <EvidenceSummaryCard
                title="Magnesium Glycinate for Sleep"
                evidenceLevel="Limited"
                humanEvidence="Magnesium supplementation trials in older adults and deficient populations show improvements in sleep quality, sleep efficiency, and early morning awakening. Glycinate-specific sleep trials are limited — most evidence comes from magnesium supplementation studies that use various forms. Glycine independently has modest sleep trial support."
                mechanisticEvidence="Magnesium NMDA antagonism and GABA-A potentiation; glycine is an inhibitory amino acid with independent calming and core body temperature-lowering effects shown in small human trials. Additive mechanism with complementary pathways."
                safetyProfile="Excellent tolerability. Lowest GI side effect risk among magnesium forms at standard doses. Well-suited for daily use."
              />

              <div className="mt-5 space-y-3 text-[1.01rem] leading-[1.85] text-[#46574d]">
                <p>
                  Magnesium glycinate is magnesium bound to glycine — an amino acid that acts as
                  an inhibitory neurotransmitter in the central nervous system. This gives
                  glycinate a dual mechanism: magnesium contributes via NMDA receptor blockade and
                  GABA-A support, while glycine independently promotes sleep by lowering core body
                  temperature and modulating glycine receptors in the brainstem.
                </p>
                <p>
                  The combination makes glycinate the most commonly recommended magnesium form for
                  sleep in supplement-literate communities — and this recommendation is reasonable
                  based on mechanistic logic, even though dedicated glycinate-specific sleep RCTs
                  remain sparse.
                </p>
                <p>
                  <strong>Tolerability</strong> is a key advantage. Glycinate is absorbed
                  efficiently enough that minimal unabsorbed magnesium reaches the colon. People
                  who experienced GI issues with citrate or oxide typically tolerate glycinate
                  well, even at higher elemental doses.
                </p>
                <p>
                  <strong>Buyer notes:</strong> Look for products that list elemental magnesium
                  content explicitly on the supplement facts panel. Products providing 200–400 mg
                  of elemental magnesium per serving are consistent with sleep-focused protocols.
                  Avoid blends that combine magnesium glycinate with oxide as a filler to inflate
                  the milligram count on the front label.
                </p>
                <div className="mt-2">
                  <a
                    href={`https://www.amazon.com/s?k=magnesium+glycinate+sleep&tag=${AFFILIATE_TAGS.amazon}`}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    className="inline-flex items-center gap-1 rounded-full bg-brand-950 px-4 py-1.5 text-xs font-bold text-white transition hover:bg-brand-900"
                  >
                    Search magnesium glycinate on Amazon →
                  </a>
                </div>
              </div>
            </div>

            <hr className="border-brand-900/10" />

            {/* Threonate deep dive */}
            <div id="threonate">
              <h2 className="mb-3 text-2xl font-semibold tracking-tight text-ink">
                Deep Dive: Magnesium L-Threonate
              </h2>

              <EvidenceSummaryCard
                title="Magnesium L-Threonate for Sleep"
                evidenceLevel="Limited"
                humanEvidence="A small number of human trials (primarily Magtein™ brand) show improvements in sleep quality and cognitive performance in older adults. Sample sizes are modest and some trials were industry-funded. More robust independent replication is needed."
                mechanisticEvidence="Threonate is proposed to transport magnesium across the blood-brain barrier more effectively than other carriers, raising brain magnesium levels. Animal studies show significant increases in synaptic density and cognitive function. Human CNS magnesium elevation has not been directly confirmed non-invasively."
                safetyProfile="Generally well-tolerated. Good GI tolerability. Headaches and vivid dreams reported anecdotally in some users during initial use. Higher price point limits broad use."
              />

              <div className="mt-5 space-y-3 text-[1.01rem] leading-[1.85] text-[#46574d]">
                <p>
                  Magnesium L-threonate was developed by researchers at MIT and is commonly sold
                  under the Magtein™ brand name. The key theoretical advantage is that the
                  threonate carrier may facilitate magnesium transport across the blood-brain
                  barrier, raising CNS magnesium levels more effectively than other forms.
                </p>
                <p>
                  This is a plausible hypothesis with animal model support. However, the claim
                  that threonate raises brain magnesium levels in humans specifically has not been
                  confirmed with direct CNS measurement in published human trials — the benefit is
                  inferred from functional cognitive and sleep outcomes.
                </p>
                <p>
                  <strong>Cognitive positioning:</strong> Threonate is primarily marketed for
                  cognitive function (memory, learning, cognitive resilience) with sleep as a
                  secondary benefit. If cognitive improvements are also a goal alongside sleep,
                  threonate is a reasonable premium option.
                </p>
                <p>
                  <strong>Cost consideration:</strong> Threonate is typically 3–5× the cost of
                  equivalent elemental magnesium from glycinate. For people whose sole goal is
                  sleep improvement, the glycinate form at a fraction of the cost is the more
                  practical choice.
                </p>
                <p>
                  <strong>Dosing note:</strong> Magtein™ products typically deliver approximately
                  ~144 mg elemental magnesium at the standard product dose. Follow the specific
                  label — elemental magnesium per dose varies by product.
                </p>
                <div className="mt-2">
                  <a
                    href={`https://www.amazon.com/s?k=magnesium+l-threonate+magtein+sleep&tag=${AFFILIATE_TAGS.amazon}`}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    className="inline-flex items-center gap-1 rounded-full bg-brand-950 px-4 py-1.5 text-xs font-bold text-white transition hover:bg-brand-900"
                  >
                    Search magnesium threonate on Amazon →
                  </a>
                </div>
              </div>
            </div>

            <hr className="border-brand-900/10" />

            {/* Citrate deep dive */}
            <div id="citrate">
              <h2 className="mb-3 text-2xl font-semibold tracking-tight text-ink">
                Deep Dive: Magnesium Citrate
              </h2>
              <p className="text-[1.01rem] leading-[1.85] text-[#46574d]">
                Magnesium citrate is one of the most widely available and affordable &quot;quality&quot;
                magnesium forms — meaningfully better absorbed than oxide and considerably cheaper
                than glycinate or threonate. It is a reasonable general-purpose magnesium
                supplement.
              </p>
              <p className="mt-3 text-[1.01rem] leading-[1.85] text-[#46574d]">
                <strong>For sleep specifically:</strong> Citrate lacks the glycine co-mechanism
                that makes glycinate particularly well-suited for sleep. The laxative effect at
                moderate-to-high doses can be disruptive for sleep if GI symptoms occur overnight.
              </p>
              <p className="mt-3 text-[1.01rem] leading-[1.85] text-[#46574d]">
                <strong>When citrate is the better choice:</strong> If constipation overlaps with
                your sleep goals — or if you simply want an affordable magnesium with reasonable
                absorption for general repletion — citrate is practical. Start at 150–200 mg
                elemental and increase gradually to avoid GI effects. Take with food and in the
                evening if using for sleep.
              </p>
              <p className="mt-3 text-[1.01rem] leading-[1.85] text-[#46574d]">
                <strong>Not ideal as a default sleep form:</strong> For someone whose sole goal
                is improved sleep quality, glycinate is the better first choice. The laxative
                downside of citrate at doses needed for meaningful magnesium repletion is
                a practical drawback at bedtime.
              </p>
            </div>

            <hr className="border-brand-900/10" />

            {/* Oxide deep dive */}
            <div id="oxide">
              <h2 className="mb-3 text-2xl font-semibold tracking-tight text-ink">
                Deep Dive: Magnesium Oxide
              </h2>
              <p className="text-[1.01rem] leading-[1.85] text-[#46574d]">
                Magnesium oxide is the cheapest and most common magnesium form — it is the
                default in budget multivitamins and the primary active ingredient in most OTC
                laxative products. High elemental magnesium content by weight (~60%) makes it
                attractive on paper.
              </p>
              <p className="mt-3 text-[1.01rem] leading-[1.85] text-[#46574d]">
                In practice, absorption of magnesium oxide is substantially lower than organic
                forms. Most of the dose passes through the gastrointestinal tract largely
                unabsorbed, drawing water into the colon — hence its effectiveness as a laxative.
                A high on-label milligram count can be misleading if the form is poorly absorbed.
              </p>
              <p className="mt-3 text-[1.01rem] leading-[1.85] text-[#46574d]">
                <strong>For sleep:</strong> Not recommended as a primary sleep supplement. The
                small amount of magnesium that is absorbed may provide minor general benefits, but
                the GI side effects at doses needed for meaningful systemic magnesium delivery
                make it a poor choice for nightly use aimed at sleep improvement.
              </p>
              <p className="mt-3 text-[1.01rem] leading-[1.85] text-[#46574d]">
                <strong>Where it is useful:</strong> Short-term constipation relief. Budget-only
                situations where any magnesium form is better than none. Not for sleep-first
                supplementation goals.
              </p>
            </div>

            <hr className="border-brand-900/10" />

            {/* Malate and Taurate deep dive */}
            <div id="malate-taurate">
              <h2 className="mb-3 text-2xl font-semibold tracking-tight text-ink">
                Deep Dive: Magnesium Malate and Taurate
              </h2>

              <h3 className="mt-4 mb-2 text-xl font-semibold tracking-tight text-ink">
                Magnesium Malate
              </h3>
              <p className="text-[1.01rem] leading-[1.85] text-[#46574d]">
                Magnesium malate combines magnesium with malic acid — a Krebs cycle intermediate
                involved in ATP synthesis and energy metabolism. It is sometimes used in the
                context of fibromyalgia, chronic fatigue, and muscle pain, where both magnesium
                deficiency and malic acid may play overlapping roles.
              </p>
              <p className="mt-3 text-[1.01rem] leading-[1.85] text-[#46574d]">
                <strong>Sleep fit:</strong> If your sleep difficulty overlaps significantly with
                muscle pain, fatigue, or fibromyalgia-like symptoms, malate may be a better fit
                than glycinate due to the malic acid component addressing the metabolic overlap.
                Direct sleep-specific RCT evidence for malate is limited compared to glycinate.
              </p>
              <p className="mt-3 text-[1.01rem] leading-[1.85] text-[#46574d]">
                <strong>Evidence caveat:</strong> Most malate trial data comes from fibromyalgia
                and fatigue contexts, not sleep outcome studies. The sleep benefit is largely
                inferred from magnesium&apos;s general sleep mechanisms plus reduced muscle pain
                as a secondary sleep facilitator. No direct sleep-specific PMID for malate has been identified in the source registry.
              </p>

              <h3 className="mt-6 mb-2 text-xl font-semibold tracking-tight text-ink">
                Magnesium Taurate
              </h3>
              <p className="text-[1.01rem] leading-[1.85] text-[#46574d]">
                Magnesium taurate combines magnesium with taurine — a semi-essential amino acid
                with calming, GABA-modulating, and cardiometabolic properties. Taurine has been
                studied for anxiety reduction, blood pressure regulation, and cardiac function.
              </p>
              <p className="mt-3 text-[1.01rem] leading-[1.85] text-[#46574d]">
                <strong>Sleep fit:</strong> The taurine component&apos;s calming and GABA-supportive
                properties are theoretically complementary to magnesium&apos;s sleep mechanisms.
                Direct sleep RCT evidence for magnesium taurate is very limited. It is a
                reasonable niche consideration for people with cardiovascular or anxiety overlap
                alongside sleep goals.
              </p>
              <p className="mt-3 text-[1.01rem] leading-[1.85] text-[#46574d]">
                <strong>Evidence caveat:</strong> Do not confuse mechanistic plausibility with
                clinical evidence. Taurate&apos;s theoretical advantages are not yet backed by
                adequate sleep-specific human RCTs. No direct sleep-specific PMID for taurate has been identified in the source registry.
              </p>
            </div>

            <hr className="border-brand-900/10" />

            {/* Dosage and label reading */}
            <div id="dosage-label-reading">
              <h2 className="mb-4 text-2xl font-semibold tracking-tight text-ink">
                Dosage and Label Reading
              </h2>

              <div className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-5 shadow-sm">
                <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-muted">
                  Dosage Reference — Sleep Protocols by Form
                </p>
                <ResponsiveTable label="Magnesium dosage reference for sleep by form">
                  <table className="min-w-[580px] w-full text-sm">
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
                        <td className="py-3 pr-4 text-[#46574d]">
                          200–400 mg
                        </td>
                        <td className="py-3 pr-4 text-[#46574d]">30–60 min before bed</td>
                        <td className="py-3 text-[#46574d]">Start low; most recommended form for sleep</td>
                      </tr>
                      <tr className="align-top">
                        <td className="py-3 pr-4 font-medium text-ink">Threonate</td>
                        <td className="py-3 pr-4 text-[#46574d]">
                          ~144 mg (per typical Magtein™ label)
                        </td>
                        <td className="py-3 pr-4 text-[#46574d]">Evening; follow product label</td>
                        <td className="py-3 text-[#46574d]">Product-specific dosing; check elemental Mg on label</td>
                      </tr>
                      <tr className="align-top">
                        <td className="py-3 pr-4 font-medium text-ink">Citrate</td>
                        <td className="py-3 pr-4 text-[#46574d]">200–350 mg</td>
                        <td className="py-3 pr-4 text-[#46574d]">Evening, with food</td>
                        <td className="py-3 text-[#46574d]">Higher doses may cause loose stools; split if needed</td>
                      </tr>
                      <tr className="align-top">
                        <td className="py-3 pr-4 font-medium text-ink">Malate</td>
                        <td className="py-3 pr-4 text-[#46574d]">
                          200–400 mg
                        </td>
                        <td className="py-3 pr-4 text-[#46574d]">Evening; can split dose</td>
                        <td className="py-3 text-[#46574d]">Often used twice daily in fatigue protocols</td>
                      </tr>
                    </tbody>
                  </table>
                </ResponsiveTable>
                <p className="mt-3 text-xs text-muted">
                  Always check the supplement facts panel for <strong>elemental magnesium</strong>{' '}
                  content — not total product weight. The tolerable upper intake level from
                  supplements is 350 mg/day elemental magnesium for most adults per standard
                  regulatory guidance.
                </p>
              </div>

              <div className="mt-5 space-y-3 text-[1.01rem] leading-[1.85] text-[#46574d]">
                <p>
                  <strong>Start low, titrate up.</strong> Begin with 100–200 mg elemental and
                  increase over 1–2 weeks. This identifies your personal GI tolerance threshold
                  before committing to higher doses.
                </p>
                <p>
                  <strong>Timing for sleep.</strong> Evening dosing 30–60 minutes before bed is
                  the most common protocol in sleep-focused trials. Taking with a small snack
                  reduces GI discomfort risk.
                </p>
                <p>
                  <strong>Split dosing.</strong> If you experience GI symptoms at your target
                  dose, divide it — half in the morning and half in the evening. This is
                  particularly relevant for citrate at higher doses.
                </p>
                <p>
                  <strong>Reading labels.</strong> A product labelled &quot;Magnesium Glycinate
                  400 mg&quot; contains 400 mg of magnesium glycinate compound — not 400 mg of
                  elemental magnesium. The supplement facts panel will show the actual elemental
                  magnesium, which is typically 50–80 mg per 400 mg of magnesium glycinate
                  compound depending on the specific chelate form used.
                </p>
              </div>
            </div>

            <hr className="border-brand-900/10" />

            {/* Safety */}
            <div id="safety">
              <h2 className="mb-4 text-2xl font-semibold tracking-tight text-ink">
                Safety and Side Effects
              </h2>
              <SafetyNotice title="Safety Summary — Magnesium Types for Sleep">
                <ul className="ml-5 space-y-1.5 list-disc">
                  <li>
                    <strong>Generally well-tolerated</strong> at supplemental doses of 200–400 mg
                    elemental per day in healthy adults with normal kidney function. Glycinate and
                    threonate have the best tolerability profiles; oxide and citrate at higher doses
                    commonly cause GI effects.
                  </li>
                  <li>
                    <strong>Kidney disease:</strong> The kidneys are the primary route of magnesium
                    excretion. Supplementation in people with reduced kidney function (CKD stage 3+)
                    can cause hypermagnesemia. Consult a physician before supplementing with any
                    magnesium form if you have kidney disease.
                  </li>
                  <li>
                    <strong>GI effects:</strong> Diarrhea, loose stools, and cramping are the most
                    common dose-dependent side effects. Most common with oxide and citrate at
                    higher doses. Reduce dose or switch to glycinate if GI effects occur.
                  </li>
                  <li>
                    <strong>Drug interactions — medication spacing:</strong> Magnesium can reduce
                    the absorption of several medications. Separate magnesium supplements from
                    fluoroquinolone antibiotics (ciprofloxacin, levofloxacin), tetracycline
                    antibiotics, bisphosphonates (alendronate, risedronate), and thyroid
                    medications (levothyroxine) by at least 2 hours.
                  </li>
                  <li>
                    <strong>Do not exceed upper limit without clinical guidance:</strong> The
                    tolerable upper intake level from supplemental magnesium is 350 mg/day elemental
                    for most adults. Higher doses require medical supervision, particularly with
                    any degree of kidney impairment.
                  </li>
                  <li>
                    <strong>Pregnancy and lactation:</strong> Dietary magnesium is important during
                    pregnancy. High supplemental doses should be discussed with a healthcare
                    provider. IV magnesium is used medically in obstetric contexts under clinical
                    supervision — this is not relevant to standard oral supplementation.
                  </li>
                </ul>
              </SafetyNotice>
            </div>

            <hr className="border-brand-900/10" />

            {/* Decision tree */}
            <div id="which-type">
              <h2 className="mb-4 text-2xl font-semibold tracking-tight text-ink">
                Which Type Should You Buy?
              </h2>
              <p className="mb-4 text-[1.01rem] leading-[1.85] text-[#46574d]">
                Use this decision framework to match your situation to the most appropriate form:
              </p>
              <div className="space-y-3 rounded-[1rem] border border-brand-900/10 bg-brand-50/40 p-5">
                <div className="flex gap-3">
                  <span className="mt-0.5 flex-shrink-0 text-brand-700">→</span>
                  <p className="text-[1.01rem] leading-[1.85] text-[#46574d]">
                    <strong>If you just want sleep support:</strong>{' '}
                    <a
                      href={`https://www.amazon.com/s?k=magnesium+glycinate+sleep&tag=${AFFILIATE_TAGS.amazon}`}
                      target="_blank"
                      rel="noopener noreferrer sponsored"
                      className="font-semibold text-brand-700 hover:text-brand-800 hover:underline"
                    >
                      Magnesium glycinate
                    </a>
                    . Best overall combination of efficacy, tolerability, and cost for sleep.
                  </p>
                </div>
                <div className="flex gap-3">
                  <span className="mt-0.5 flex-shrink-0 text-brand-700">→</span>
                  <p className="text-[1.01rem] leading-[1.85] text-[#46574d]">
                    <strong>If budget is no issue and cognition also matters:</strong>{' '}
                    <a
                      href={`https://www.amazon.com/s?k=magnesium+l-threonate+magtein&tag=${AFFILIATE_TAGS.amazon}`}
                      target="_blank"
                      rel="noopener noreferrer sponsored"
                      className="font-semibold text-brand-700 hover:text-brand-800 hover:underline"
                    >
                      Magnesium threonate
                    </a>
                    . Premium option with cognitive overlap; not materially better than glycinate
                    for sleep alone.
                  </p>
                </div>
                <div className="flex gap-3">
                  <span className="mt-0.5 flex-shrink-0 text-brand-700">→</span>
                  <p className="text-[1.01rem] leading-[1.85] text-[#46574d]">
                    <strong>If constipation also matters:</strong>{' '}
                    <a
                      href={`https://www.amazon.com/s?k=magnesium+citrate+supplement&tag=${AFFILIATE_TAGS.amazon}`}
                      target="_blank"
                      rel="noopener noreferrer sponsored"
                      className="font-semibold text-brand-700 hover:text-brand-800 hover:underline"
                    >
                      Magnesium citrate
                    </a>
                    . The gentle laxative effect becomes an advantage if GI motility is also a goal.
                  </p>
                </div>
                <div className="flex gap-3">
                  <span className="mt-0.5 flex-shrink-0 text-brand-700">→</span>
                  <p className="text-[1.01rem] leading-[1.85] text-[#46574d]">
                    <strong>If cheapest option only:</strong>{' '}
                    Magnesium oxide is widely available and inexpensive. It delivers some systemic
                    magnesium even with low absorption, but is not ideal for sleep-specific use —
                    GI effects at effective doses are a consistent practical problem.
                  </p>
                </div>
                <div className="flex gap-3">
                  <span className="mt-0.5 flex-shrink-0 text-brand-700">→</span>
                  <p className="text-[1.01rem] leading-[1.85] text-[#46574d]">
                    <strong>If muscle fatigue overlaps:</strong>{' '}
                    <a
                      href={`https://www.amazon.com/s?k=magnesium+malate+supplement&tag=${AFFILIATE_TAGS.amazon}`}
                      target="_blank"
                      rel="noopener noreferrer sponsored"
                      className="font-semibold text-brand-700 hover:text-brand-800 hover:underline"
                    >
                      Magnesium malate
                    </a>
                    . Suited for fibromyalgia/fatigue overlap with sleep difficulty.
                  </p>
                </div>
                <div className="flex gap-3">
                  <span className="mt-0.5 flex-shrink-0 text-brand-700">→</span>
                  <p className="text-[1.01rem] leading-[1.85] text-[#46574d]">
                    <strong>If calming/cardiometabolic overlap matters:</strong>{' '}
                    <a
                      href={`https://www.amazon.com/s?k=magnesium+taurate+supplement&tag=${AFFILIATE_TAGS.amazon}`}
                      target="_blank"
                      rel="noopener noreferrer sponsored"
                      className="font-semibold text-brand-700 hover:text-brand-800 hover:underline"
                    >
                      Magnesium taurate
                    </a>
                    . Niche option; limited direct sleep evidence but taurine&apos;s calming and
                    cardiovascular properties may complement magnesium for specific profiles.
                  </p>
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
                    Evidence, mechanisms, and dosage for magnesium as a sleep supplement — the
                    broader clinical picture behind the forms reviewed here.
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
                    how it stacks with magnesium.
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
                    Direct comparison of mechanisms, evidence, cost, and use cases for the two
                    most popular sleep supplements.
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
                    How L-theanine promotes relaxation without sedation and when to use it
                    alongside magnesium.
                  </p>
                </Link>
              </div>
            </div>

            <hr className="border-brand-900/10" />

            {/* Sources */}
            <div id="sources">
              <h2 className="mb-4 text-2xl font-semibold tracking-tight text-ink">Sources</h2>
              <p className="mb-4 text-sm text-muted">
                PMID links and full citation details will be added once the workbook evidence
                pipeline is complete for each magnesium form. Evidence grades are provisional
                pending workbook verification.
              </p>
              <ResponsiveTable label="Article references">
                <table className="min-w-[600px] w-full text-sm">
                  <thead>
                    <tr className="border-b border-brand-900/10">
                      <th className="pb-2 pr-4 text-left text-xs font-bold uppercase tracking-wider text-muted">
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
                      <td className="py-3 pr-4 font-medium text-ink">Magnesium glycinate evidence</td>
                      <td className="py-3 pr-4 text-[#46574d]">
                        Abbasi et al. 2012 (Mg sleep RCT); Held et al. 2002; Nielsen et al. 2010
                      </td>
                      <td className="py-3 text-muted text-xs">
                        PMIDs pending
                      </td>
                    </tr>
                    <tr className="align-top">
                      <td className="py-3 pr-4 font-medium text-ink">Glycine sleep evidence</td>
                      <td className="py-3 pr-4 text-[#46574d]">
                        Yamadera et al. 2007 (glycine and subjective sleep quality)
                      </td>
                      <td className="py-3 text-muted text-xs">
                        PMID pending
                      </td>
                    </tr>
                    <tr className="align-top">
                      <td className="py-3 pr-4 font-medium text-ink">Magnesium threonate / Magtein evidence</td>
                      <td className="py-3 pr-4 text-[#46574d]">
                        Slutsky et al. 2010 (brain Mg elevation); human threonate cognition/sleep trials
                      </td>
                      <td className="py-3 text-muted text-xs">
                        PMIDs pending
                      </td>
                    </tr>
                    <tr className="align-top">
                      <td className="py-3 pr-4 font-medium text-ink">Magnesium citrate evidence</td>
                      <td className="py-3 pr-4 text-[#46574d]">
                        Comparative bioavailability studies; Mg citrate vs oxide absorption trials
                      </td>
                      <td className="py-3 text-muted text-xs">
                        PMIDs pending
                      </td>
                    </tr>
                    <tr className="align-top">
                      <td className="py-3 pr-4 font-medium text-ink">Magnesium safety / upper intake</td>
                      <td className="py-3 pr-4 text-[#46574d]">
                        NIH Office of Dietary Supplements Mg fact sheet; IOM Dietary Reference Intakes
                      </td>
                      <td className="py-3 text-muted text-xs">
                        Citation pending
                      </td>
                    </tr>
                    <tr className="align-top">
                      <td className="py-3 pr-4 font-medium text-ink">Elemental magnesium label guidance</td>
                      <td className="py-3 pr-4 text-[#46574d]">
                        FDA supplement labelling regulations; form-specific elemental content tables
                      </td>
                      <td className="py-3 text-muted text-xs">
                        Citation pending
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
                ['#comparison-table', 'Forms Compared'],
                ['#why-form-matters', 'Why Form Matters'],
                ['#glycinate', 'Glycinate'],
                ['#threonate', 'Threonate'],
                ['#citrate', 'Citrate'],
                ['#oxide', 'Oxide'],
                ['#malate-taurate', 'Malate &amp; Taurate'],
                ['#dosage-label-reading', 'Dosage &amp; Labels'],
                ['#safety', 'Safety'],
                ['#which-type', 'Which to Buy'],
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

          {/* Sleep cluster links */}
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
                href={`https://www.amazon.com/s?k=magnesium+l-threonate+magtein&tag=${AFFILIATE_TAGS.amazon}`}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="block text-sm font-medium text-brand-700 hover:text-brand-800 hover:underline"
              >
                Magnesium threonate →
              </a>
              <a
                href={`https://www.amazon.com/s?k=magnesium+citrate+supplement&tag=${AFFILIATE_TAGS.amazon}`}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="block text-sm font-medium text-brand-700 hover:text-brand-800 hover:underline"
              >
                Magnesium citrate →
              </a>
              <a
                href={`https://www.amazon.com/s?k=magnesium+malate+supplement&tag=${AFFILIATE_TAGS.amazon}`}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="block text-sm font-medium text-brand-700 hover:text-brand-800 hover:underline"
              >
                Magnesium malate →
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
