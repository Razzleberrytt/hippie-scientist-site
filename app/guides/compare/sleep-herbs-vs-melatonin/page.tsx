import type { Metadata } from 'next'
import Link from 'next/link'
import { buildPageMetadata } from '../../../../src/lib/seo'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import AffiliateDisclosure from '../../../../components/AffiliateDisclosure'
import { EnhancedEmailCapture } from '@/components/monetization/EnhancedEmailCapture'
import { RelatedDiscoveryWidget } from '@/components/monetization/RelatedDiscoveryWidget'
import RecommendationSection from '@/components/RecommendationSection'
import { getRevenueProductSet } from '@/config/revenue-products'

export const metadata: Metadata = buildPageMetadata({
  title: 'Sleep Herbs vs Melatonin: Evidence Comparison',
  description:
    'Evidence-graded comparison of melatonin, magnesium, L-theanine, and valerian for sleep. Understand mechanisms, onset, evidence quality, safety, and when to use each — or stack them.',
  path: '/guides/compare/sleep-herbs-vs-melatonin/',
  openGraphType: 'article',
})

export default function SleepHerbsVsMelatoninComparePage() {
  const melatoninProducts = getRevenueProductSet('melatonin')?.products ?? []
  const magnesiumProducts = getRevenueProductSet('magnesium')?.products ?? []
  const theanineProducts = getRevenueProductSet('l-theanine')?.products ?? []
  const valerianProducts = getRevenueProductSet('valerian')?.products ?? []
  const allProducts = [...melatoninProducts, ...magnesiumProducts, ...theanineProducts, ...valerianProducts]

  return (
    <div className="container-page py-10 space-y-10">
      <AuthorityJsonLd
        title="Sleep Herbs vs Melatonin – Magnesium, L-Theanine & Valerian Compared"
        description="Evidence-graded comparison of melatonin, magnesium, L-theanine, and valerian for sleep. Mechanisms, dosing, stacking guidance, and safety context."
        url="https://thehippiescientist.net/guides/compare/sleep-herbs-vs-melatonin"
        type="Article"
      />

      <AuthorityBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Compare', href: '/compare' },
          { label: 'Sleep Herbs vs Melatonin' },
        ]}
      />

      {/* Hero */}
      <section className="space-y-5 max-w-4xl">
        <p className="eyebrow-label">Educational Comparison · Sleep Cluster</p>
        <h1 className="text-5xl font-bold tracking-tight text-ink">
          Sleep Herbs vs Melatonin: Choosing the Right Tool for Your Sleep Problem
        </h1>
        <p className="text-lg leading-8 text-muted">
          Melatonin signals timing — it tells your brain it is night. Magnesium, L-theanine, and valerian
          work differently: they relax muscles, quiet mental chatter, and support GABA pathways.
          The question is not which one is "best" — it is which matches the reason you are not sleeping.
        </p>

        <div className="flex flex-wrap gap-3 pt-1">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 border border-green-200 px-3 py-1 text-xs font-semibold text-green-800">
            Melatonin (circadian) — Evidence Grade: A
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 border border-green-200 px-3 py-1 text-xs font-semibold text-green-800">
            Magnesium (sleep quality) — Evidence Grade: B–C
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 border border-green-200 px-3 py-1 text-xs font-semibold text-green-800">
            L-Theanine (sleep onset) — Evidence Grade: B
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-50 border border-yellow-200 px-3 py-1 text-xs font-semibold text-yellow-800">
            Valerian (sedation) — Evidence Grade: C
          </span>
        </div>
      </section>

      {/* Overview cards — 2 rows of 2 */}
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="card-premium p-6 space-y-4">
          <p className="eyebrow-label">Hormone · Circadian Timing</p>
          <h2 className="text-3xl font-semibold tracking-tight text-ink">Melatonin</h2>
          <p className="text-sm leading-7 text-muted">
            Melatonin is produced by the pineal gland in response to darkness. It signals to the body
            that it is time to sleep — it shifts the circadian window, not the depth or quality of sleep
            directly. It is best supported by evidence for jet lag, shift work, and delayed sleep phase
            syndrome. At low doses (0.3–1 mg), it mimics physiological release without receptor
            downregulation.
          </p>
          <Link href="/compounds/melatonin" className="chip-readable">Explore Melatonin</Link>
        </div>

        <div className="card-premium p-6 space-y-4">
          <p className="eyebrow-label">Essential Mineral · Systemic</p>
          <h2 className="text-3xl font-semibold tracking-tight text-ink">Magnesium</h2>
          <p className="text-sm leading-7 text-muted">
            Magnesium is involved in GABA receptor modulation, NMDA channel blocking, melatonin
            synthesis co-factor activity, and HPA axis regulation. It works systemically over days
            to weeks — not as an acute sleep aid but as a foundational mineral for sleep quality and
            depth. Most adults are below optimal intake. Magnesium glycinate is the preferred form for
            sleep due to high bioavailability and low GI impact.
          </p>
          <Link href="/compounds/magnesium" className="chip-readable">Explore Magnesium</Link>
        </div>

        <div className="card-premium p-6 space-y-4">
          <p className="eyebrow-label">Amino Acid · Acute Acting</p>
          <h2 className="text-3xl font-semibold tracking-tight text-ink">L-Theanine</h2>
          <p className="text-sm leading-7 text-muted">
            L-theanine is a glutamate analog found in green tea. It increases alpha-wave brain activity
            (relaxed alertness), modulates excitatory glutamate receptors, and promotes GABA — quieting
            a racing mind without causing sedation. Onset is 30–60 minutes. It is particularly useful
            for sleep onset when the problem is mental chatter rather than a shifted schedule or physical
            tension.
          </p>
          <Link href="/compounds/l-theanine" className="chip-readable">Explore L-Theanine</Link>
        </div>

        <div className="card-premium p-6 space-y-4">
          <p className="eyebrow-label">Botanical Herb · Mild Sedative</p>
          <h2 className="text-3xl font-semibold tracking-tight text-ink">Valerian Root</h2>
          <p className="text-sm leading-7 text-muted">
            Valerian root (Valeriana officinalis) increases GABA availability by inhibiting its
            degradation and reuptake. It has a long traditional history for situational insomnia and
            nervous tension. Human trial evidence is inconsistent — systematic reviews show mixed results,
            and effect sizes are often modest. It may be better tolerated in combination with hops or
            lemon balm than as a standalone option.
          </p>
          <Link href="/herbs/valerian" className="chip-readable">Explore Valerian</Link>
        </div>
      </section>

      {/* Fast decision table */}
      <section className="card-premium p-6 space-y-5 max-w-5xl">
        <p className="eyebrow-label">Fast Decision</p>
        <h2 className="text-3xl font-semibold tracking-tight text-ink">Which one fits your sleep problem?</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-ink">
              <tr className="border-b border-black/10">
                <th className="py-3 pr-3 font-semibold">Sleep Problem</th>
                <th className="py-3 pr-3 font-semibold">Melatonin</th>
                <th className="py-3 pr-3 font-semibold">Magnesium</th>
                <th className="py-3 pr-3 font-semibold">L-Theanine</th>
                <th className="py-3 pr-3 font-semibold">Valerian</th>
              </tr>
            </thead>
            <tbody className="text-muted">
              <tr className="border-b border-black/10">
                <td className="py-3 pr-3 font-medium text-ink">Can't fall asleep (shifted schedule / jet lag)</td>
                <td className="py-3 pr-3">✓ Primary choice — Grade A for circadian</td>
                <td className="py-3 pr-3">Secondary — not circadian-specific</td>
                <td className="py-3 pr-3">Not primarily</td>
                <td className="py-3 pr-3">Not primarily</td>
              </tr>
              <tr className="border-b border-black/10">
                <td className="py-3 pr-3 font-medium text-ink">Racing thoughts / mental chatter at bedtime</td>
                <td className="py-3 pr-3">Not primarily — timing tool, not calming</td>
                <td className="py-3 pr-3">Supports; slower onset</td>
                <td className="py-3 pr-3">✓ Primary — fast alpha-wave induction</td>
                <td className="py-3 pr-3">May help; mixed evidence</td>
              </tr>
              <tr className="border-b border-black/10">
                <td className="py-3 pr-3 font-medium text-ink">Physical tension / muscle restlessness</td>
                <td className="py-3 pr-3">Not helpful</td>
                <td className="py-3 pr-3">✓ Primary — NMDA block, muscle relaxation</td>
                <td className="py-3 pr-3">Partial</td>
                <td className="py-3 pr-3">Mild</td>
              </tr>
              <tr className="border-b border-black/10">
                <td className="py-3 pr-3 font-medium text-ink">Poor sleep depth / waking during night</td>
                <td className="py-3 pr-3">Limited evidence for architecture</td>
                <td className="py-3 pr-3">✓ Better — melatonin co-factor, REM support</td>
                <td className="py-3 pr-3">Limited specific evidence</td>
                <td className="py-3 pr-3">Inconsistent</td>
              </tr>
              <tr className="border-b border-black/10">
                <td className="py-3 pr-3 font-medium text-ink">Situational / occasional poor night</td>
                <td className="py-3 pr-3">Reasonable at low dose</td>
                <td className="py-3 pr-3">Limited acute use; effects build over days</td>
                <td className="py-3 pr-3">✓ Good acute option — 100–200 mg</td>
                <td className="py-3 pr-3">Reasonable traditional option</td>
              </tr>
              <tr>
                <td className="py-3 pr-3 font-medium text-ink">Onset</td>
                <td className="py-3 pr-3">30–60 min</td>
                <td className="py-3 pr-3">Days to weeks</td>
                <td className="py-3 pr-3">30–90 min</td>
                <td className="py-3 pr-3">30–60 min</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Mechanism deep dive */}
      <section className="space-y-5 max-w-4xl">
        <p className="eyebrow-label">Mechanism</p>
        <h2 className="text-3xl font-semibold tracking-tight text-ink">Four different tools for four different sleep problems</h2>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="card-premium p-6 space-y-3">
            <h3 className="text-xl font-semibold text-ink">Melatonin</h3>
            <ul className="text-sm leading-7 text-muted space-y-2">
              <li><strong className="text-ink">MT1/MT2 receptor agonism:</strong> Binds melatonin receptors in the suprachiasmatic nucleus — shifts the circadian clock signal toward sleep</li>
              <li><strong className="text-ink">Not a sedative:</strong> Does not cause sedation or hypnotic GABA activity at physiological doses — it signals timing, not depth</li>
              <li><strong className="text-ink">Dose matters critically:</strong> Most commercial products contain 3–10 mg, far above the physiological 0.3–1 mg range shown to be effective without causing receptor desensitization or morning grogginess</li>
              <li><strong className="text-ink">Endogenous suppression:</strong> Exogenous melatonin can suppress pineal production if taken chronically at high doses — use the lowest effective dose</li>
            </ul>
          </div>

          <div className="card-premium p-6 space-y-3">
            <h3 className="text-xl font-semibold text-ink">Magnesium</h3>
            <ul className="text-sm leading-7 text-muted space-y-2">
              <li><strong className="text-ink">NMDA voltage block:</strong> Mg²⁺ is an endogenous blocker of NMDA ion channels — prevents glutamate over-excitation that keeps the nervous system aroused</li>
              <li><strong className="text-ink">GABA co-factor:</strong> Required for GABA receptor function and GABA synthesis; deficiency reduces GABAergic tone</li>
              <li><strong className="text-ink">Melatonin co-factor:</strong> Required for pineal serotonin → melatonin conversion — magnesium deficiency can reduce endogenous melatonin output</li>
              <li><strong className="text-ink">HPA axis:</strong> Bidirectional relationship with cortisol — depletion increases cortisol reactivity; repletion supports HPA normalization over weeks</li>
            </ul>
          </div>

          <div className="card-premium p-6 space-y-3">
            <h3 className="text-xl font-semibold text-ink">L-Theanine</h3>
            <ul className="text-sm leading-7 text-muted space-y-2">
              <li><strong className="text-ink">Glutamate receptor modulation:</strong> Structurally similar to glutamate; competes at AMPA, kainate, and NMDA receptor binding sites — reduces excitatory tone acutely</li>
              <li><strong className="text-ink">Alpha-wave induction:</strong> EEG studies consistently show significant alpha-wave increase within 45 minutes — the electrophysiological signature of calm alertness, helpful for transitioning to sleep</li>
              <li><strong className="text-ink">GABA promotion:</strong> Increases GABA levels; mechanism not fully characterized but replicated across multiple studies</li>
              <li><strong className="text-ink">Half-life ~1 hour:</strong> Short acting — useful for sleep onset rather than sleep maintenance; non-sedating at typical doses</li>
            </ul>
          </div>

          <div className="card-premium p-6 space-y-3">
            <h3 className="text-xl font-semibold text-ink">Valerian Root</h3>
            <ul className="text-sm leading-7 text-muted space-y-2">
              <li><strong className="text-ink">GABA reuptake inhibition:</strong> Valerenic acid inhibits GABA transaminase and GABA reuptake, increasing synaptic GABA availability</li>
              <li><strong className="text-ink">GABA-A partial agonism:</strong> Some evidence for direct GABA-A receptor binding at low efficacy — a mild benzodiazepine-adjacent mechanism without the potency or dependency risk</li>
              <li><strong className="text-ink">Adenosine pathway:</strong> May also interact with adenosine receptors involved in sleep pressure accumulation — less well characterized</li>
              <li><strong className="text-ink">Inconsistent active constituent standardization:</strong> Valerenic acid content varies widely across products, contributing to inconsistent trial results</li>
            </ul>
          </div>
        </div>

        <div className="rounded-2xl bg-stone-50 border border-stone-200 p-5 text-sm leading-7 text-muted">
          <p className="font-semibold text-ink">The core distinction</p>
          <p className="mt-2">
            Melatonin is a timing signal. It does not relax you — it tells your brain it is night.
            The three botanical/mineral options work through GABAergic and glutamatergic mechanisms
            to reduce nervous system arousal. If your sleep problem is about when you sleep, melatonin
            may help. If it is about the quality of sleep or difficulty winding down, the others are
            more likely to address the root cause.
          </p>
        </div>
      </section>

      {/* Evidence section */}
      <section className="card-premium p-6 space-y-6 max-w-4xl">
        <p className="eyebrow-label">Evidence</p>
        <h2 className="text-3xl font-semibold tracking-tight text-ink">What the research shows</h2>

        <div className="space-y-6 text-sm leading-7 text-muted">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-bold text-green-800">Grade A</span>
              <span className="font-semibold text-ink">Melatonin for circadian sleep problems</span>
            </div>
            <ul className="space-y-3">
              <li>
                <strong className="text-ink">Ferracioli-Oda et al. 2013</strong> (PLoS ONE, PMID: 23691095):
                Meta-analysis of 19 randomized trials. Melatonin significantly reduced sleep onset
                latency (weighted mean difference −7.06 min), increased sleep duration, and improved
                overall sleep quality. Effect sizes strongest for circadian-related sleep disorders
                (jet lag, shift work, delayed sleep phase) versus primary insomnia.
              </li>
              <li>
                <strong className="text-ink">Brzezinski et al. 2005</strong> (Sleep Med Rev):
                Low physiological doses (0.3–1 mg) effectively shift circadian phase and improve sleep
                with fewer next-day effects than pharmacological doses (3–10 mg). High commercial doses
                saturate MT1/MT2 receptors without additional benefit.
              </li>
            </ul>
          </div>

          <div className="border-t border-black/10 pt-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-bold text-yellow-800">Grade B–C</span>
              <span className="font-semibold text-ink">Magnesium for sleep quality</span>
            </div>
            <ul className="space-y-3">
              <li>
                <strong className="text-ink">Abbasi et al. 2012</strong> (J Res Med Sci, PMID: 23853635):
                Magnesium 500 mg/day for 8 weeks in elderly insomnia patients. Significantly improved
                Insomnia Severity Index, sleep efficiency, sleep time, sleep onset latency, serum
                melatonin, and cortisol. Strong effects — but in a magnesium-deficient elderly population;
                generalizability to healthy younger adults is limited.
              </li>
              <li>
                <strong className="text-ink">Schwalfenberg &amp; Genuis 2017</strong> (Scientifica, PMID: 28748216):
                Review of magnesium in health and disease. Confirms melatonin synthesis co-factor role
                and GABAergic mechanisms; contextualizes widespread population insufficiency.
              </li>
              <li className="text-xs text-muted/70">
                Grade B–C rationale: Mechanistically compelling and directionally consistent, but most
                trials are in deficient or elderly populations. Evidence for non-deficient healthy adults
                is weaker. Effects build over weeks — not an acute sleep intervention.
              </li>
            </ul>
          </div>

          <div className="border-t border-black/10 pt-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-bold text-green-800">Grade B</span>
              <span className="font-semibold text-ink">L-Theanine for sleep onset</span>
            </div>
            <ul className="space-y-3">
              <li>
                <strong className="text-ink">Nobre et al. 2008</strong> (Asia Pac J Clin Nutr, PMID: 18296328):
                L-theanine 250 mg produced significant alpha-wave increases within 45 minutes in healthy
                volunteers. Alpha-wave activity correlates with the subjective experience of relaxed
                alertness that supports sleep transition — without sedation.
              </li>
              <li>
                <strong className="text-ink">Hidese et al. 2019</strong> (Nutrients, PMID: 31623400):
                L-theanine 200 mg/day for 4 weeks in healthy adults. Improved sleep latency, sleep quality,
                and next-day alertness scores on PSQI. Well-tolerated; no adverse events. Direct sleep
                endpoint data rather than just mechanism proxies.
              </li>
            </ul>
          </div>

          <div className="border-t border-black/10 pt-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-bold text-red-800">Grade C</span>
              <span className="font-semibold text-ink">Valerian for sleep</span>
            </div>
            <ul className="space-y-3">
              <li>
                <strong className="text-ink">Bent et al. 2006</strong> (Am J Med, PMID: 16427424):
                Systematic review of 16 eligible studies. Valerian may improve sleep quality without
                producing side effects — but evidence is insufficient to confirm efficacy. Most studies
                had methodological limitations including poor blinding and inconsistent outcome measures.
              </li>
              <li>
                <strong className="text-ink">Koetter et al. 2007</strong> (Phytother Res, PMID: 17676834):
                Fixed valerian–hops combination improved sleep quality versus placebo at 4 weeks.
                Combination products may perform better than valerian alone — the hops component adds
                complementary mechanisms.
              </li>
              <li className="text-xs text-muted/70">
                Grade C rationale: Mechanistically plausible, traditionally supported, but human RCT
                evidence is inconsistent across studies, with variable standardization and small effect
                sizes in better-designed trials.
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Dosing */}
      <section className="grid gap-6 lg:grid-cols-2 max-w-5xl">
        <div className="card-premium p-6 space-y-3">
          <p className="eyebrow-label">Dosing</p>
          <h2 className="text-2xl font-semibold tracking-tight text-ink">Melatonin</h2>
          <ul className="text-sm leading-7 text-muted space-y-2">
            <li><strong className="text-ink">Physiological dose:</strong> 0.3–1 mg — this is the dose that mimics natural pineal output and has the strongest circadian evidence</li>
            <li><strong className="text-ink">Common commercial dose:</strong> 3–10 mg — effective but often more than necessary; increases risk of next-morning grogginess and receptor desensitization</li>
            <li><strong className="text-ink">Timing:</strong> 30–60 minutes before desired sleep time; for jet lag, match destination local sleep schedule</li>
            <li><strong className="text-ink">Avoid:</strong> Nightly use at high doses long-term; this may suppress pineal output over time</li>
            <li><strong className="text-ink">Not for:</strong> Underlying anxiety, physical tension, or poor sleep architecture — melatonin does not fix these</li>
          </ul>
        </div>

        <div className="card-premium p-6 space-y-3">
          <p className="eyebrow-label">Dosing</p>
          <h2 className="text-2xl font-semibold tracking-tight text-ink">Magnesium Glycinate</h2>
          <ul className="text-sm leading-7 text-muted space-y-2">
            <li><strong className="text-ink">Sleep/anxiety:</strong> 200–400 mg elemental magnesium (check label — elemental content is lower than total capsule weight)</li>
            <li><strong className="text-ink">Timing:</strong> 30–60 minutes before bed for sleep use</li>
            <li><strong className="text-ink">Start low:</strong> 100–200 mg elemental to assess GI tolerance; increase over 1–2 weeks</li>
            <li><strong className="text-ink">Form matters:</strong> Glycinate or bisglycinate for absorption and low GI impact; avoid oxide</li>
            <li><strong className="text-ink">Timeline:</strong> Full effects build over weeks of consistent daily use — not an acute sleep aid</li>
            <li><strong className="text-ink">NIH tolerable upper limit:</strong> 350 mg supplemental per day (above dietary intake)</li>
          </ul>
        </div>

        <div className="card-premium p-6 space-y-3">
          <p className="eyebrow-label">Dosing</p>
          <h2 className="text-2xl font-semibold tracking-tight text-ink">L-Theanine</h2>
          <ul className="text-sm leading-7 text-muted space-y-2">
            <li><strong className="text-ink">Sleep onset:</strong> 100–400 mg, 30–60 minutes before bed; lower end (100–200 mg) is often sufficient</li>
            <li><strong className="text-ink">Hidese et al. dose:</strong> 200 mg/day was effective for sleep quality improvements</li>
            <li><strong className="text-ink">Tolerance:</strong> No evidence of tolerance or dependency; can be used as-needed or daily</li>
            <li><strong className="text-ink">No sedation:</strong> Does not cause drowsiness — works by quieting mental chatter, not inducing pharmacological sleep</li>
            <li><strong className="text-ink">Safety ceiling:</strong> GRAS status; no significant adverse events at doses up to 400 mg/day in clinical literature</li>
          </ul>
        </div>

        <div className="card-premium p-6 space-y-3">
          <p className="eyebrow-label">Dosing</p>
          <h2 className="text-2xl font-semibold tracking-tight text-ink">Valerian Root</h2>
          <ul className="text-sm leading-7 text-muted space-y-2">
            <li><strong className="text-ink">Standard dose range:</strong> 300–600 mg of valerian root extract, 30–60 minutes before bed</li>
            <li><strong className="text-ink">Standardization:</strong> Look for products standardized to 0.8% valerenic acid; unstandardized root powder results are highly variable</li>
            <li><strong className="text-ink">Short-term use:</strong> Most trials ran 4–6 weeks; long-term safety data beyond this window is limited</li>
            <li><strong className="text-ink">Morning drowsiness:</strong> May cause residual sedation at higher doses — start low and evaluate response before increasing</li>
            <li><strong className="text-ink">Combination products:</strong> May perform better with hops (Humulus lupulus) — look for fixed-ratio combination extracts</li>
          </ul>
        </div>
      </section>

      {/* Safety */}
      <section className="card-premium p-6 space-y-5 max-w-5xl">
        <p className="eyebrow-label">Safety</p>
        <h2 className="text-3xl font-semibold tracking-tight text-ink">What to know before using each</h2>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-ink">Melatonin</h3>
            <ul className="text-sm leading-7 text-muted space-y-2">
              <li><strong className="text-ink">Dose is the main concern.</strong> High commercial doses (5–10 mg) cause next-morning grogginess and may suppress pineal output with chronic use. Keep to 0.3–1 mg when possible.</li>
              <li><strong className="text-ink">Children and adolescents:</strong> Use only under clinical guidance — melatonin affects reproductive and developmental hormones and the long-term pediatric data is limited.</li>
              <li><strong className="text-ink">Autoimmune conditions:</strong> Melatonin has immune-modulating effects; use with caution if managing an autoimmune condition or taking immunosuppressants.</li>
              <li><strong className="text-ink">Pregnancy/nursing:</strong> Insufficient safety data; conservative avoidance is reasonable.</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-ink">Magnesium</h3>
            <ul className="text-sm leading-7 text-muted space-y-2">
              <li><strong className="text-ink">Kidney disease: key contraindication.</strong> Magnesium is renally cleared; CKD patients cannot excrete excess and are at risk for hypermagnesemia. Do not supplement without clinician clearance.</li>
              <li><strong className="text-ink">Medication spacing:</strong> Space 2+ hours from quinolone antibiotics, tetracyclines, bisphosphonates, and levothyroxine — magnesium reduces their absorption.</li>
              <li><strong className="text-ink">GI effects:</strong> Glycinate is unlikely to cause diarrhea at typical doses. Avoid oxide and citrate in higher doses.</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-ink">L-Theanine</h3>
            <ul className="text-sm leading-7 text-muted space-y-2">
              <li><strong className="text-ink">Excellent safety profile.</strong> GRAS status; no significant adverse events at clinical doses.</li>
              <li><strong className="text-ink">Additive GABAergic effect:</strong> May mildly potentiate benzodiazepines, alcohol, or other GABAergic drugs — unlikely to be problematic at typical doses but worth noting.</li>
              <li><strong className="text-ink">Prescription sleep medications:</strong> Avoid combining high-dose L-theanine with zolpidem, eszopiclone, or similar drugs without medical guidance.</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-ink">Valerian Root</h3>
            <ul className="text-sm leading-7 text-muted space-y-2">
              <li><strong className="text-ink">Drug interactions:</strong> GABAergic mechanism means additive potential with benzodiazepines, alcohol, barbiturates, and central nervous system depressants. Do not combine with prescription sleep medications without medical oversight.</li>
              <li><strong className="text-ink">Liver:</strong> Rare case reports of hepatotoxicity; mechanism unclear. Avoid prolonged high-dose use or if you have underlying liver disease.</li>
              <li><strong className="text-ink">Surgery:</strong> Discontinue 2+ weeks before elective surgery due to CNS depressant interaction risk with anesthesia.</li>
              <li><strong className="text-ink">Pregnancy:</strong> Insufficient safety data; avoid during pregnancy.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Stacking guide */}
      <section className="space-y-5 max-w-4xl">
        <p className="eyebrow-label">Stacking Guide</p>
        <h2 className="text-3xl font-semibold tracking-tight text-ink">How to combine them safely</h2>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="card-premium p-5 space-y-3">
            <p className="eyebrow-label">Best Evidence Stack</p>
            <h3 className="text-xl font-semibold text-ink">L-Theanine + Magnesium Glycinate</h3>
            <p className="text-sm leading-7 text-muted">
              The most evidence-supported natural sleep combination. L-theanine (100–200 mg) quiets
              racing thoughts at sleep onset; magnesium glycinate (200–300 mg elemental) supports
              sleep depth, melatonin synthesis, and physical relaxation over consistent use. They address
              complementary phases of sleep transition. Start each individually before combining.
            </p>
          </div>

          <div className="card-premium p-5 space-y-3">
            <p className="eyebrow-label">Circadian Reset Stack</p>
            <h3 className="text-xl font-semibold text-ink">Low-dose Melatonin + L-Theanine</h3>
            <p className="text-sm leading-7 text-muted">
              For jet lag, delayed schedule, or shift work patterns: melatonin (0.3–1 mg) shifts the
              circadian signal; L-theanine (100–200 mg) helps quiet the mind that may still be running
              at full alertness when the schedule says it should be sleeping. Useful when the problem
              is both timing and mental arousal.
            </p>
          </div>

          <div className="card-premium p-5 space-y-3">
            <p className="eyebrow-label">Foundational Sleep Protocol</p>
            <h3 className="text-xl font-semibold text-ink">Daily Magnesium + As-needed L-Theanine</h3>
            <p className="text-sm leading-7 text-muted">
              Magnesium glycinate daily (long-term sleep architecture and HPA axis support). L-theanine
              reserved for nights when mental chatter is the specific barrier — high-stress periods,
              before important events, or when anxiety is elevated. This uses each compound at its
              correct timescale.
            </p>
          </div>

          <div className="card-premium p-5 space-y-3">
            <p className="eyebrow-label">What to Avoid</p>
            <h3 className="text-xl font-semibold text-ink">Do not stack without clinician guidance</h3>
            <p className="text-sm leading-7 text-muted">
              Do not combine valerian or L-theanine with prescription benzodiazepines, zolpidem,
              eszopiclone, or similar sleep medications without medical oversight. The additive GABAergic
              effect may be clinically meaningful. Report all supplement use to your prescriber — supplements
              are biologically active even when sold over the counter.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="card-premium p-6 space-y-5 max-w-4xl">
        <p className="eyebrow-label">FAQ</p>
        <h2 className="text-3xl font-semibold tracking-tight text-ink">Common questions</h2>

        <div className="space-y-5 text-sm leading-7 text-muted">
          <div>
            <h3 className="text-lg font-semibold text-ink">Is melatonin better than magnesium for sleep?</h3>
            <p>
              They work on completely different problems. Melatonin is better when your sleep problem is
              about timing — jet lag, shift work, or a delayed sleep phase. Magnesium is better when
              your problem is about quality — poor sleep depth, frequent waking, or physical tension.
              If both are issues, they can be used together.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-ink">Is 10 mg melatonin safe?</h3>
            <p>
              10 mg is far above the physiological dose shown to be effective. Research supports 0.3–1 mg
              as sufficient for circadian effects. High doses increase the risk of next-day grogginess,
              vivid dreams, and may suppress the pineal gland's natural production with chronic use.
              Start lower than you think you need.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-ink">Can you take L-theanine and melatonin together?</h3>
            <p>
              Yes — they work through entirely different pathways and are not antagonistic. L-theanine
              addresses mental arousal; melatonin addresses circadian timing. Combining them for nights
              when both a shifted schedule and mental chatter are problems is a reasonable approach at
              typical doses. Start each individually first to understand your response.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-ink">Does valerian root actually work?</h3>
            <p>
              The evidence is mixed. Mechanistically it is plausible — valerenic acid inhibits GABA
              breakdown, which should support sleep. But clinical trials show inconsistent results,
              partly because valerian root products vary widely in standardization. Combination products
              with hops have somewhat better trial support. It is not a first-line recommendation,
              but it may be worth trying if better-evidenced options have not helped.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-ink">What is the best natural sleep supplement?</h3>
            <p>
              There is no single best — it depends on what is causing the sleep problem. For most people
              with non-circadian sleep issues (anxiety, tension, poor depth), starting with magnesium
              glycinate daily and L-theanine as needed is the most evidence-supported, safest combination.
              Melatonin at low doses is appropriate for jet lag or schedule misalignment. Valerian is
              reasonable to try as an add-on if the first-tier options are insufficient.
            </p>
          </div>
        </div>
      </section>

      <EnhancedEmailCapture
        headline="Sleep supplement research — evidence, not hype"
        description="Get evidence-graded analysis of melatonin, magnesium, L-theanine, and valerian — including dosing context, mechanism explainers, and how to build a sleep stack that matches your actual sleep problem."
        benefit1="Melatonin dose reality: why less is often more, and when to use it"
        benefit2="Sleep stack protocol: L-theanine + magnesium timing, forms, and dose guidance"
        benefit3="Mechanism explainers: GABA, NMDA, and circadian biology in plain language"
        ctaLabel="Join the list"
        location="compare-sleep-herbs-vs-melatonin"
      />

      <RelatedDiscoveryWidget
        heading="Explore sleep and calm further"
        subheading="Compound profiles, mechanism education, and comparison guides for the sleep cluster."
        items={[
          {
            type: 'guide',
            label: 'Comparison',
            title: 'L-Theanine vs Magnesium',
            description: 'Acute calm focus vs systemic mineral support — mechanisms, stacking, and dosing for anxiety and sleep.',
            href: '/guides/compare/ashwagandha-vs-l-theanine-vs-magnesium',
          },
          {
            type: 'guide',
            label: 'Comparison',
            title: 'Magnesium Glycinate vs L-Threonate for Sleep',
            description: 'When the more expensive threonate form is worth it — sleep vs cognition positioning.',
            href: '/guides/sleep/magnesium-types-for-sleep',
          },
          {
            type: 'guide',
            label: 'Comparison',
            title: 'Magnesium Glycinate vs Oxide',
            description: 'Why form matters: bioavailability explained, and why oxide is not a useful sleep supplement.',
            href: '/guides/sleep/magnesium-types-for-sleep',
          },
          {
            type: 'guide',
            label: 'Goal Guide',
            title: 'Sleep Goals',
            description: 'Map your sleep issue to the right supplement — onset, depth, anxiety, or recovery.',
            href: '/guides/sleep',
          },
          {
            type: 'guide',
            label: 'Education',
            title: 'GABA Pathway',
            description: 'How GABA works, why it matters for calm and sleep, and which supplements modulate it.',
            href: '/learn/gaba',
          },
          {
            type: 'guide',
            label: 'Education',
            title: 'How Sleep Affects Neurochemistry',
            description: 'The biology of why sleep deprivation impairs cognition, mood, and recovery.',
            href: '/learn/how-sleep-affects-neurochemistry',
          },
        ]}
      />

      <div className="space-y-3">
        <AffiliateDisclosure />
        <RecommendationSection
          title="Sleep supplement product picks"
          description="Affiliate recommendations for melatonin, magnesium, L-theanine, and valerian. Review safety, form, dose, and timing guidance on each compound page before buying."
          products={allProducts}
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <Link href="/guides/compare/ashwagandha-vs-l-theanine-vs-magnesium" className="chip-readable">L-Theanine vs Magnesium</Link>
        <Link href="/guides/sleep/magnesium-types-for-sleep" className="chip-readable">Magnesium Glycinate vs L-Threonate</Link>
        <Link href="/guides/sleep/magnesium-types-for-sleep" className="chip-readable">Magnesium Glycinate vs Oxide</Link>
        <Link href="/guides/sleep" className="chip-readable">Sleep Goals</Link>
        <Link href="/learn/gaba" className="chip-readable">GABA Pathway</Link>
        <Link href="/guides/compare/" className="chip-readable">All Comparisons</Link>
      </div>
    </div>
  )
}
