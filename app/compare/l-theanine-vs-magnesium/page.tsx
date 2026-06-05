import Link from 'next/link'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import AffiliateDisclosure from '@/components/AffiliateDisclosure'
import { EnhancedEmailCapture } from '@/components/monetization/EnhancedEmailCapture'
import { RelatedDiscoveryWidget } from '@/components/monetization/RelatedDiscoveryWidget'
import RecommendationSection from '@/components/RecommendationSection'
import { getRevenueProductSet } from '@/config/revenue-products'

export default function LTheanineVsMagnesiumPage() {
  const theanineProducts = getRevenueProductSet('l-theanine')?.products ?? []
  const magnesiumProducts = getRevenueProductSet('magnesium')?.products ?? []
  const allProducts = [...theanineProducts, ...magnesiumProducts]

  return (
    <div className="container-page py-10 space-y-10">
      <AuthorityJsonLd
        title="L-Theanine vs Magnesium for Calm and Focus"
        description="Evidence-graded comparison of L-theanine and magnesium for calm focus, anxiety, and sleep. Mechanisms, overlapping NMDA and GABA pathways, stacking guidance, and when to use each."
        url="https://www.thehippiescientist.net/compare/l-theanine-vs-magnesium"
        type="Article"
      />

      <AuthorityBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Compare', href: '/compare' },
          { label: 'L-Theanine vs Magnesium' },
        ]}
      />

      {/* Hero */}
      <section className="space-y-5 max-w-4xl">
        <p className="eyebrow-label">Educational Comparison · Anxiety / Sleep / Cognition Clusters</p>
        <h1 className="text-5xl font-bold tracking-tight text-ink">
          L-Theanine vs Magnesium: Same Target, Different Scale
        </h1>
        <p className="text-lg leading-8 text-[#46574d]">
          Both modulate glutamate and support GABA. But L-theanine works acutely and specifically —
          it's a calm-focus tool with fast onset and no sedation. Magnesium works systemically and
          slowly — it's a baseline nervous system mineral that supports everything from sleep depth
          to stress resilience over weeks. The question is rarely which one to choose; it's which
          one to prioritize and how to stack them.
        </p>

        <div className="flex flex-wrap gap-3 pt-1">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 border border-green-200 px-3 py-1 text-xs font-semibold text-green-800">
            L-Theanine for calm focus — Evidence Grade: B
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 border border-green-200 px-3 py-1 text-xs font-semibold text-green-800">
            Magnesium for anxiety/sleep — Evidence Grade: B-C
          </span>
        </div>
      </section>

      {/* Overview cards */}
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="card-premium p-6 space-y-4">
          <p className="eyebrow-label">Amino Acid · Acute Acting</p>
          <h2 className="text-3xl font-semibold tracking-tight text-ink">L-Theanine</h2>
          <p className="text-sm leading-7 text-[#46574d]">
            Glutamate analog found in green tea. Modulates excitatory glutamate receptors (AMPA, kainate,
            NMDA), increases GABA, and promotes alpha-wave brain activity — the signature of relaxed
            alertness. Onset in 30–60 minutes. No sedation at typical doses. Most studied in combination
            with caffeine, where it reduces stimulant jitteriness without blunting alertness.
          </p>
          <Link href="/compounds/l-theanine" className="chip-readable">Explore L-Theanine</Link>
        </div>

        <div className="card-premium p-6 space-y-4">
          <p className="eyebrow-label">Essential Mineral · Systemic</p>
          <h2 className="text-3xl font-semibold tracking-tight text-ink">Magnesium</h2>
          <p className="text-sm leading-7 text-[#46574d]">
            The fourth most abundant mineral in the body. Acts as an endogenous NMDA channel blocker
            (voltage-gated), GABA co-factor, melatonin synthesis co-factor, and HPA axis regulator.
            Involved in 300+ enzymatic reactions. Effects are systemic and build over days to weeks of
            consistent dosing. Most adults have suboptimal intake; depletion directly impairs sleep and
            stress resilience.
          </p>
          <Link href="/compounds/magnesium" className="chip-readable">Explore Magnesium</Link>
        </div>
      </section>

      {/* Fast decision table */}
      <section className="card-premium p-6 space-y-5 max-w-5xl">
        <p className="eyebrow-label">Fast Decision</p>
        <h2 className="text-3xl font-semibold tracking-tight text-ink">Which one fits your situation?</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-ink">
              <tr className="border-b border-black/10">
                <th className="py-3 pr-4 font-semibold">Goal / Situation</th>
                <th className="py-3 pr-4 font-semibold">L-Theanine</th>
                <th className="py-3 pr-4 font-semibold">Magnesium</th>
              </tr>
            </thead>
            <tbody className="text-[#46574d]">
              <tr className="border-b border-black/10">
                <td className="py-3 pr-4 font-medium text-ink">Acute calm focus (daytime)</td>
                <td className="py-3 pr-4">✓ Primary choice — 30–60 min onset, no sedation</td>
                <td className="py-3 pr-4">Not primarily — systemic, slower, potentially sedating</td>
              </tr>
              <tr className="border-b border-black/10">
                <td className="py-3 pr-4 font-medium text-ink">With caffeine</td>
                <td className="py-3 pr-4">✓ Well-studied combination; blunts jitteriness, sustains focus</td>
                <td className="py-3 pr-4">Not typically used with caffeine</td>
              </tr>
              <tr className="border-b border-black/10">
                <td className="py-3 pr-4 font-medium text-ink">Sleep onset</td>
                <td className="py-3 pr-4">✓ Faster onset advantage; reduces racing thoughts</td>
                <td className="py-3 pr-4">Supports sleep onset via GABA/NMDA; slower to act</td>
              </tr>
              <tr className="border-b border-black/10">
                <td className="py-3 pr-4 font-medium text-ink">Sleep depth / quality</td>
                <td className="py-3 pr-4">Limited evidence for sleep architecture specifically</td>
                <td className="py-3 pr-4">✓ Primary choice — melatonin co-factor, NMDA regulation</td>
              </tr>
              <tr className="border-b border-black/10">
                <td className="py-3 pr-4 font-medium text-ink">Chronic stress / baseline anxiety</td>
                <td className="py-3 pr-4">Useful acutely; less evidence for long-term stress axis effects</td>
                <td className="py-3 pr-4">✓ Better for sustained stress resilience and HPA normalization</td>
              </tr>
              <tr className="border-b border-black/10">
                <td className="py-3 pr-4 font-medium text-ink">Onset speed</td>
                <td className="py-3 pr-4">30–60 minutes</td>
                <td className="py-3 pr-4">Days to weeks (systemic repletion)</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-medium text-ink">Stack together?</td>
                <td className="py-3 pr-4" colSpan={2}>Yes — complementary, not redundant. Especially for sleep.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Mechanism deep dive */}
      <section className="space-y-5 max-w-4xl">
        <p className="eyebrow-label">Mechanism</p>
        <h2 className="text-3xl font-semibold tracking-tight text-ink">Why the mechanisms overlap but don't duplicate</h2>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="card-premium p-6 space-y-3">
            <h3 className="text-xl font-semibold text-ink">L-Theanine</h3>
            <ul className="text-sm leading-7 text-[#46574d] space-y-2">
              <li><strong className="text-ink">Glutamate receptor inhibition:</strong> Structurally similar to glutamate; competes at AMPA, kainate, and NMDA receptor binding sites — reduces excitatory neurotransmission</li>
              <li><strong className="text-ink">GABA promotion:</strong> Increases GABA levels; mechanism not fully characterized but consistent across studies</li>
              <li><strong className="text-ink">Alpha wave induction:</strong> EEG studies show significant alpha-wave increase within 45 minutes — the electrophysiological signature of calm, alert focus</li>
              <li><strong className="text-ink">Caffeine cross-inhibition:</strong> Blocks caffeine's excitatory mechanism at adenosine-adjacent and glutamate receptors — reduces jitteriness without blunting alertness</li>
              <li><strong className="text-ink">Half-life:</strong> ~1 hour; duration of effect 3–5 hours</li>
            </ul>
          </div>

          <div className="card-premium p-6 space-y-3">
            <h3 className="text-xl font-semibold text-ink">Magnesium</h3>
            <ul className="text-sm leading-7 text-[#46574d] space-y-2">
              <li><strong className="text-ink">NMDA channel block:</strong> Mg²⁺ is an endogenous voltage-gated blocker of the NMDA ion channel at resting membrane potential — physiologically essential for preventing glutamate overactivation</li>
              <li><strong className="text-ink">GABA co-factor:</strong> Required for GABA synthesis and for maintaining receptor sensitivity; magnesium depletion directly reduces GABAergic tone</li>
              <li><strong className="text-ink">HPA axis regulation:</strong> Bidirectional relationship with cortisol — stress depletes magnesium; magnesium depletion increases cortisol reactivity</li>
              <li><strong className="text-ink">Melatonin co-factor:</strong> Required for pineal serotonin → melatonin conversion; sleep disruption is an early sign of magnesium insufficiency</li>
              <li><strong className="text-ink">Scope:</strong> 300+ enzymatic reactions; this is a foundational mineral, not a targeted supplement</li>
            </ul>
          </div>
        </div>

        <div className="rounded-2xl bg-stone-50 border border-stone-200 p-5 text-sm leading-7 text-[#46574d]">
          <p className="font-semibold text-ink">The instrument vs the note analogy</p>
          <p className="mt-2">
            Magnesium maintains the neurological environment in which glutamate and GABA signaling occurs.
            L-theanine plays a specific note within that environment. Both target glutamate and GABA, but
            magnesium does so as a systemic mineral that enables proper neurotransmitter function across
            the entire nervous system; L-theanine does so as an acute ligand at specific receptor sites.
            They are complementary at different levels of biological organization.
          </p>
        </div>
      </section>

      {/* Evidence section */}
      <section className="card-premium p-6 space-y-6 max-w-4xl">
        <p className="eyebrow-label">Evidence</p>
        <h2 className="text-3xl font-semibold tracking-tight text-ink">What the research shows</h2>

        <div className="space-y-5 text-sm leading-7 text-[#46574d]">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-bold text-green-800">Grade B</span>
              <span className="font-semibold text-ink">L-Theanine for calm focus</span>
            </div>
            <ul className="space-y-3">
              <li>
                <strong className="text-ink">Nobre et al. 2008</strong> (Asia Pac J Clin Nutr, PMID: 18296328):
                L-theanine 250mg produced significant increases in alpha-wave activity within 45 minutes.
                Alpha activity correlated with subjective calm without sedation. This EEG signal is
                the most replicated biological endpoint for L-theanine.
              </li>
              <li>
                <strong className="text-ink">Owen et al. 2008</strong> (Nutr Neurosci, PMID: 18681988):
                L-theanine + caffeine combination vs either alone and placebo. L-theanine + caffeine
                significantly improved speed and accuracy of attention-switching tasks. Reduced
                headache and tiredness compared to caffeine alone. This is the most-cited evidence
                for the combination stack.
              </li>
              <li>
                <strong className="text-ink">Ritsner et al. 2011</strong> (Clin Schizophr Relat Psychoses, PMID: 22374256):
                L-theanine 400mg/day for 8 weeks in a clinical population. Reduced anxiety and positive
                symptom severity. Higher dose; clinical context. Suggests effect at the anxiety end of the
                spectrum at elevated doses.
              </li>
            </ul>
          </div>

          <div className="border-t border-black/10 pt-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-bold text-yellow-800">Grade B-C</span>
              <span className="font-semibold text-ink">Magnesium for anxiety and sleep</span>
            </div>
            <ul className="space-y-3">
              <li>
                <strong className="text-ink">Boyle et al. 2017</strong> (Nutrients, PMID: 28445426):
                Systematic review and meta-analysis. "Evidence suggesting a beneficial effect of magnesium
                on subjective anxiety in anxiety-vulnerable samples is consistent and demonstrated across
                multiple study designs." Rated evidence quality as "poor to medium." Consistent direction;
                variable effect sizes.
              </li>
              <li>
                <strong className="text-ink">Tarleton et al. 2017</strong> (PLoS ONE, PMID: 28654669):
                Magnesium chloride 248mg/day for 6 weeks. Significantly reduced PHQ-9 depression and
                GAD-7 anxiety scores vs control. Did not require baseline magnesium deficiency for
                inclusion — effect seen in a general population, suggesting benefit beyond simple repletion.
              </li>
              <li>
                <strong className="text-ink">Abbasi et al. 2012</strong> (J Res Med Sci, PMID: 23853635):
                Magnesium 500mg/day for 8 weeks improved multiple insomnia parameters in elderly patients:
                ISI score, sleep efficiency, sleep time, sleep onset latency, serum melatonin, cortisol.
                Strong effect in magnesium-deficient elderly population.
              </li>
              <li className="text-xs text-[#46574d]/70">
                Grade B-C rationale: Consistent mechanistic basis and directionally consistent trial results,
                but variable study quality, frequent testing in deficient populations only, and moderate
                effect sizes. Evidence is weaker in non-deficient healthy adults.
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Dosing section */}
      <section className="grid gap-6 lg:grid-cols-2 max-w-5xl">
        <div className="card-premium p-6 space-y-3">
          <p className="eyebrow-label">Dosing</p>
          <h2 className="text-2xl font-semibold tracking-tight text-ink">L-Theanine</h2>
          <ul className="text-sm leading-7 text-[#46574d] space-y-2">
            <li><strong className="text-ink">Calm focus:</strong> 100–200mg, 30–60 min before the focus period</li>
            <li><strong className="text-ink">With caffeine:</strong> 200mg L-theanine per ~100mg caffeine (2:1 ratio by weight); adjust to your caffeine sensitivity</li>
            <li><strong className="text-ink">Sleep:</strong> 100–400mg 30–60 min before bed; lower end often sufficient</li>
            <li><strong className="text-ink">Anxiety (clinical range):</strong> 400mg/day used in clinical trials; most people see effects at 200mg</li>
            <li><strong className="text-ink">Tolerance:</strong> No evidence of tolerance or dependency; can be used as needed or daily</li>
            <li><strong className="text-ink">Safety ceiling:</strong> GRAS; no established upper limit causing harm in clinical literature</li>
          </ul>
        </div>

        <div className="card-premium p-6 space-y-3">
          <p className="eyebrow-label">Dosing</p>
          <h2 className="text-2xl font-semibold tracking-tight text-ink">Magnesium Glycinate</h2>
          <ul className="text-sm leading-7 text-[#46574d] space-y-2">
            <li><strong className="text-ink">Sleep/anxiety:</strong> 200–400mg elemental magnesium (check label for elemental content, not total capsule weight)</li>
            <li><strong className="text-ink">Timing:</strong> 30–60 min before bed for sleep support; can split AM/PM for anxiety baseline</li>
            <li><strong className="text-ink">Start low:</strong> 100–200mg elemental to assess GI tolerance</li>
            <li><strong className="text-ink">Form matters:</strong> Use glycinate or bisglycinate for bioavailability; avoid oxide for systemic goals</li>
            <li><strong className="text-ink">Consistency:</strong> Effects build over weeks; this is a chronic supplement, not acute relief</li>
            <li><strong className="text-ink">NIH upper limit:</strong> 350mg supplemental magnesium/day (above dietary intake); GI effects increase above this</li>
          </ul>
        </div>
      </section>

      {/* Safety */}
      <section className="card-premium p-6 space-y-5 max-w-5xl">
        <p className="eyebrow-label">Safety</p>
        <h2 className="text-3xl font-semibold tracking-tight text-ink">What to know before using each</h2>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-ink">L-Theanine</h3>
            <ul className="text-sm leading-7 text-[#46574d] space-y-2">
              <li><strong className="text-ink">Excellent safety profile.</strong> GRAS status; no significant adverse events in clinical trials at doses up to 400mg/day.</li>
              <li><strong className="text-ink">GABAergic additive effect:</strong> May have mild additive sedation with benzodiazepines, alcohol, or other GABAergic medications. Unlikely to be problematic at typical doses but worth noting.</li>
              <li><strong className="text-ink">Hypnotics:</strong> Avoid combining high-dose L-theanine with prescription sleeping medications without medical guidance.</li>
              <li><strong className="text-ink">Pregnancy:</strong> No concerning data in human trials; however, insufficient evidence to recommend freely during pregnancy. Conservative avoidance is reasonable.</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-ink">Magnesium</h3>
            <ul className="text-sm leading-7 text-[#46574d] space-y-2">
              <li><strong className="text-ink">Kidney disease: key contraindication.</strong> Magnesium is renally cleared; CKD patients are at risk for hypermagnesemia. Do not supplement without medical guidance if you have kidney disease.</li>
              <li><strong className="text-ink">Medication spacing:</strong> Space magnesium 2+ hours from quinolone antibiotics, tetracyclines, bisphosphonates, and levothyroxine — magnesium reduces their absorption.</li>
              <li><strong className="text-ink">GI effects:</strong> Well-absorbed forms (glycinate) are unlikely to cause diarrhea at typical doses. Oxide will. Citrate is intermediate.</li>
              <li><strong className="text-ink">Pregnancy:</strong> Magnesium is essential during pregnancy; supplementation is often appropriate but should be guided by a clinician, particularly with obstetric risk factors.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Stacking */}
      <section className="space-y-5 max-w-4xl">
        <p className="eyebrow-label">Stacking Guide</p>
        <h2 className="text-3xl font-semibold tracking-tight text-ink">How to use them together</h2>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="card-premium p-5 space-y-3">
            <p className="eyebrow-label">Sleep Stack</p>
            <h3 className="text-xl font-semibold text-ink">L-Theanine + Magnesium Glycinate</h3>
            <p className="text-sm leading-7 text-[#46574d]">
              The most evidence-supported natural sleep combination. Take both 30–60 minutes before bed:
              L-theanine (100–200mg) for sleep onset and quieting racing thoughts; magnesium glycinate
              (200–300mg elemental) for sleep depth, melatonin support, and muscle relaxation.
              They address different phases of the sleep transition and support different sleep parameters.
            </p>
            <p className="text-xs text-[#46574d]/70">
              Dose note: Start with one before adding the other to isolate responses.
            </p>
          </div>

          <div className="card-premium p-5 space-y-3">
            <p className="eyebrow-label">Calm Focus Stack</p>
            <h3 className="text-xl font-semibold text-ink">L-Theanine + Caffeine (morning)</h3>
            <p className="text-sm leading-7 text-[#46574d]">
              For daytime calm focus, L-theanine + caffeine is the better-studied pairing. Use magnesium
              in the evening, not the morning focus stack. High-dose morning magnesium may blunt the
              alertness you're trying to optimize. The L-theanine + caffeine ratio most studied:
              200mg theanine per 100mg caffeine.
            </p>
          </div>

          <div className="card-premium p-5 space-y-3">
            <p className="eyebrow-label">Anxiety Baseline Protocol</p>
            <h3 className="text-xl font-semibold text-ink">Magnesium daily + L-Theanine as needed</h3>
            <p className="text-sm leading-7 text-[#46574d]">
              For chronic anxiety support: magnesium glycinate daily (long-term HPA axis and NMDA
              normalization). L-theanine reserved for acutely stressful situations — presentations,
              difficult conversations, high-pressure work periods. This respects the different timescales
              of each compound rather than treating both as interchangeable.
            </p>
          </div>

          <div className="card-premium p-5 space-y-3">
            <p className="eyebrow-label">What Not to Stack</p>
            <h3 className="text-xl font-semibold text-ink">Avoid without clinician guidance</h3>
            <p className="text-sm leading-7 text-[#46574d]">
              Do not stack both L-theanine and magnesium alongside prescription benzodiazepines, sleep
              medications (zolpidem, eszopiclone), or other GABAergic drugs without medical oversight.
              The additive GABAergic effect may be clinically meaningful. Report supplement use to your
              prescriber as you would any other medication.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="card-premium p-6 space-y-5 max-w-4xl">
        <p className="eyebrow-label">FAQ</p>
        <h2 className="text-3xl font-semibold tracking-tight text-ink">Common questions</h2>

        <div className="space-y-5 text-sm leading-7 text-[#46574d]">
          <div>
            <h3 className="text-lg font-semibold text-ink">Is L-theanine or magnesium better for anxiety?</h3>
            <p>
              For acute situational anxiety (presentations, stressful events), L-theanine is better —
              faster onset, cleaner profile, no sedation. For chronic background anxiety and stress
              resilience over time, magnesium is more relevant — it addresses the systemic mineral
              environment in which the nervous system operates. Most people benefit from both, used
              at different times for different purposes.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-ink">Can you take L-theanine and magnesium together?</h3>
            <p>
              Yes. They work through overlapping but non-redundant mechanisms. The most common
              evidence-supported combination is for sleep: L-theanine (100–200mg) + magnesium glycinate
              (200–300mg elemental) 30–60 minutes before bed. They are not antagonistic and the combination
              is generally well-tolerated. Start each one individually before combining to understand
              your response to each.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-ink">Does L-theanine work without caffeine?</h3>
            <p>
              Yes. L-theanine has demonstrated alpha-wave induction and anxiety reduction in studies
              without caffeine. The caffeine combination has the most research support for focus and
              cognitive performance, but L-theanine alone is effective for calm focus, stress reduction,
              and sleep onset support. You don't need caffeine to benefit from it.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-ink">Will magnesium make me too sleepy for daytime use?</h3>
            <p>
              At typical doses (200–400mg elemental glycinate), magnesium does not cause the kind of
              sedation that would impair daytime function. However, it does have a calming effect that
              some people notice — this is more pronounced when taken in higher doses. For daytime anxiety
              support, starting with a lower dose (100–200mg elemental) and assessing your response
              before taking it in a work context is reasonable.
            </p>
          </div>
        </div>
      </section>

      <EnhancedEmailCapture
        headline="Calm focus and sleep stack research — evidence, not hype"
        description="Get evidence-graded analysis of L-theanine, magnesium, and calm-focus stacking protocols — including NMDA mechanism context, dosing ratios, and what the EEG studies actually show."
        benefit1="L-theanine + caffeine dosing: the studied ratios and how to adjust for your caffeine sensitivity"
        benefit2="Sleep stack protocol: L-theanine + magnesium timing, forms, and dose guidance"
        benefit3="NMDA and GABA mechanisms: why these two compounds stack but don't duplicate"
        ctaLabel="Join the list"
        location="compare-l-theanine-vs-magnesium"
      />

      <RelatedDiscoveryWidget
        heading="Explore calm focus and sleep depth"
        subheading="Compound profiles, mechanism education, and stack guides for the anxiety/sleep/focus overlap."
        items={[
          {
            type: 'guide',
            label: 'Comparison',
            title: 'Magnesium Glycinate vs Oxide',
            description: 'Why form matters: bioavailability explained, and why oxide is not a useful sleep supplement.',
            href: '/compare/magnesium-glycinate-vs-magnesium-oxide',
          },
          {
            type: 'guide',
            label: 'Comparison',
            title: 'Caffeine vs L-Theanine',
            description: 'The most-researched nootropic stack — mechanisms, studied ratios, and who benefits most.',
            href: '/compare/caffeine-vs-l-theanine',
          },
          {
            type: 'guide',
            label: 'Comparison',
            title: 'Magnesium Glycinate vs L-Threonate',
            description: 'Sleep vs cognition positioning — when the more expensive threonate form is worth it.',
            href: '/compare/magnesium-glycinate-vs-l-threonate-for-sleep',
          },
          {
            type: 'guide',
            label: 'Goal Guide',
            title: 'Sleep Goals',
            description: 'Map your sleep issue to the right supplement stack — onset, depth, anxiety, or recovery.',
            href: '/goals/sleep',
          },
          {
            type: 'guide',
            label: 'Goal Guide',
            title: 'Anxiety & Stress Goals',
            description: 'Identify your stress pattern and find the right anxiolytic, adaptogen, or mineral support.',
            href: '/goals/anxiety',
          },
          {
            type: 'guide',
            label: 'Education',
            title: 'GABA Pathway',
            description: 'How GABA works, why it matters for calm and sleep, and which supplements modulate it.',
            href: '/education/gaba',
          },
        ]}
      />

      <div className="space-y-3">
        <AffiliateDisclosure />
        <RecommendationSection
          title="L-Theanine and Magnesium product picks"
          description="Affiliate recommendations for both compounds. Review safety, form (glycinate for magnesium), dose, and timing before buying."
          products={allProducts}
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <Link href="/compare/magnesium-glycinate-vs-magnesium-oxide" className="chip-readable">Magnesium Glycinate vs Oxide</Link>
        <Link href="/compare/magnesium-glycinate-vs-l-threonate-for-sleep" className="chip-readable">Magnesium Glycinate vs L-Threonate</Link>
        <Link href="/education/gaba" className="chip-readable">GABA Pathway</Link>
        <Link href="/goals/sleep" className="chip-readable">Sleep Goals</Link>
        <Link href="/goals/anxiety" className="chip-readable">Anxiety Goals</Link>
        <Link href="/compare" className="chip-readable">All Comparisons</Link>
      </div>
    </div>
  )
}
