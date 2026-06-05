import Link from 'next/link'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import AffiliateDisclosure from '@/components/AffiliateDisclosure'
import { EnhancedEmailCapture } from '@/components/monetization/EnhancedEmailCapture'
import { RelatedDiscoveryWidget } from '@/components/monetization/RelatedDiscoveryWidget'
import RecommendationSection from '@/components/RecommendationSection'
import { getRevenueProductSet } from '@/config/revenue-products'

export default function MagnesiumGlycinateVsMagnesiumOxidePage() {
  const magnesiumProducts = getRevenueProductSet('magnesium')?.products ?? []

  return (
    <div className="container-page py-10 space-y-10">
      <AuthorityJsonLd
        title="Magnesium Glycinate vs Magnesium Oxide"
        description="Evidence-graded comparison of magnesium glycinate and magnesium oxide: bioavailability, sleep, anxiety, cost per absorbed milligram, and when each form makes sense."
        url="https://www.thehippiescientist.net/compare/magnesium-glycinate-vs-magnesium-oxide"
        type="Article"
      />

      <AuthorityBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Compare', href: '/compare' },
          { label: 'Magnesium Glycinate vs Magnesium Oxide' },
        ]}
      />

      {/* Hero */}
      <section className="space-y-5 max-w-4xl">
        <p className="eyebrow-label">Educational Comparison · Sleep / Recovery Cluster</p>
        <h1 className="text-5xl font-bold tracking-tight text-ink">
          Magnesium Glycinate vs Magnesium Oxide: This Is Not a Close Call
        </h1>
        <p className="text-lg leading-8 text-[#46574d]">
          Magnesium oxide absorbs at roughly 4%. Magnesium glycinate absorbs at roughly 60–80%.
          For sleep, anxiety, muscle recovery, or systemic magnesium repletion, glycinate is almost
          always the correct form. Oxide has one legitimate use case — as a laxative — and should
          not be chosen when the goal is anything else.
        </p>

        <div className="flex flex-wrap gap-3 pt-1">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 border border-green-200 px-3 py-1 text-xs font-semibold text-green-800">
            Glycinate for sleep/anxiety — Evidence Grade: B
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-semibold text-amber-800">
            Oxide for systemic repletion — Evidence Grade: D
          </span>
        </div>
      </section>

      {/* Overview cards */}
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="card-premium p-6 space-y-4">
          <p className="eyebrow-label">Chelated Form · High Bioavailability</p>
          <h2 className="text-3xl font-semibold tracking-tight text-ink">Magnesium Glycinate</h2>
          <p className="text-sm leading-7 text-[#46574d]">
            Magnesium chelated with two glycine molecules. Absorbed via amino acid transporter pathways
            in the small intestine — bypassing the solubility and osmotic limitations of inorganic
            magnesium forms. Bioavailability ~60–80%. Gentle on the GI tract. The glycine component
            adds mild inhibitory neurotransmitter support. The correct form for most supplement goals.
          </p>
          <Link href="/compounds/magnesium" className="chip-readable">Explore Magnesium</Link>
        </div>

        <div className="card-premium p-6 space-y-4">
          <p className="eyebrow-label">Inorganic Salt · Low Bioavailability</p>
          <h2 className="text-3xl font-semibold tracking-tight text-ink">Magnesium Oxide</h2>
          <p className="text-sm leading-7 text-[#46574d]">
            The most common form found in cheap multivitamins and some dedicated magnesium supplements.
            Bioavailability ~4% (Lindberg et al. 1990). Most of the magnesium passes through the gut
            unabsorbed, drawing water osmotically into the colon. This is why oxide works as a laxative.
            It is a poor choice for systemic magnesium support.
          </p>
        </div>
      </section>

      {/* Core comparison table */}
      <section className="card-premium p-6 space-y-5 max-w-5xl">
        <p className="eyebrow-label">Fast Decision</p>
        <h2 className="text-3xl font-semibold tracking-tight text-ink">Head-to-head: what actually matters</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-ink">
              <tr className="border-b border-black/10">
                <th className="py-3 pr-4 font-semibold">Factor</th>
                <th className="py-3 pr-4 font-semibold">Magnesium Glycinate</th>
                <th className="py-3 pr-4 font-semibold">Magnesium Oxide</th>
              </tr>
            </thead>
            <tbody className="text-[#46574d]">
              <tr className="border-b border-black/10">
                <td className="py-3 pr-4 font-medium text-ink">Bioavailability</td>
                <td className="py-3 pr-4">~60–80%</td>
                <td className="py-3 pr-4">~4% (Lindberg et al. 1990)</td>
              </tr>
              <tr className="border-b border-black/10">
                <td className="py-3 pr-4 font-medium text-ink">Absorption route</td>
                <td className="py-3 pr-4">Amino acid transporters (active, efficient)</td>
                <td className="py-3 pr-4">Passive diffusion; limited by solubility</td>
              </tr>
              <tr className="border-b border-black/10">
                <td className="py-3 pr-4 font-medium text-ink">Absorbed from 400mg elemental dose</td>
                <td className="py-3 pr-4">~240–320mg</td>
                <td className="py-3 pr-4">~16mg</td>
              </tr>
              <tr className="border-b border-black/10">
                <td className="py-3 pr-4 font-medium text-ink">GI tolerance</td>
                <td className="py-3 pr-4">Excellent; rarely causes diarrhea at typical doses</td>
                <td className="py-3 pr-4">Reliably causes diarrhea at effective doses</td>
              </tr>
              <tr className="border-b border-black/10">
                <td className="py-3 pr-4 font-medium text-ink">Best use case</td>
                <td className="py-3 pr-4">Sleep, anxiety, muscle recovery, systemic repletion</td>
                <td className="py-3 pr-4">Laxative (constipation, bowel prep)</td>
              </tr>
              <tr className="border-b border-black/10">
                <td className="py-3 pr-4 font-medium text-ink">Monthly cost</td>
                <td className="py-3 pr-4">~$15–30</td>
                <td className="py-3 pr-4">~$5–10</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-medium text-ink">Cost per mg absorbed</td>
                <td className="py-3 pr-4">Low</td>
                <td className="py-3 pr-4">Very high (appears cheap; is not)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Bioavailability explainer */}
      <section className="space-y-5 max-w-4xl">
        <p className="eyebrow-label">The Core Issue</p>
        <h2 className="text-3xl font-semibold tracking-tight text-ink">Why bioavailability is everything here</h2>

        <div className="card-premium p-6 space-y-4">
          <p className="text-sm leading-7 text-[#46574d]">
            Magnesium oxide is sparingly soluble in water. It requires stomach acid to partially ionize
            into Mg²⁺ ions, and even then, most passes through the GI tract unabsorbed. The unabsorbed
            magnesium draws water osmotically into the large intestine — producing the laxative effect.
            This is a predictable consequence of the form's chemistry, not a batch quality issue.
          </p>
          <p className="text-sm leading-7 text-[#46574d]">
            Magnesium glycinate uses a completely different route. The magnesium-glycine chelate is
            recognized by amino acid transporters in the small intestinal wall. These are active transport
            systems with high capacity and specificity — they pull the molecule across the intestinal
            lining efficiently, irrespective of osmotic or solubility dynamics. This is why chelated
            magnesium forms consistently outperform inorganic salts in bioavailability studies.
          </p>

          <div className="rounded-2xl bg-stone-50 border border-stone-200 p-5 text-sm leading-7 text-[#46574d]">
            <p className="font-semibold text-ink">The oxide illusion: appears cheaper, costs more per absorbed mg</p>
            <p className="mt-2">
              If magnesium oxide costs $8/month and glycinate costs $24/month but glycinate delivers
              15–20× more absorbed magnesium per dose, you are paying far more per unit of actual systemic
              magnesium with the oxide form. The label price is not the cost that matters.
            </p>
          </div>
        </div>
      </section>

      {/* Mechanism */}
      <section className="space-y-5 max-w-4xl">
        <p className="eyebrow-label">Mechanism</p>
        <h2 className="text-3xl font-semibold tracking-tight text-ink">What magnesium actually does once absorbed</h2>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="card-premium p-5 space-y-3">
            <h3 className="text-xl font-semibold text-ink">Sleep support</h3>
            <ul className="text-sm leading-7 text-[#46574d] space-y-1">
              <li><strong className="text-ink">NMDA channel blocker:</strong> Mg²⁺ physically blocks NMDA calcium channels at resting membrane potential — reduces neuronal overactivation</li>
              <li><strong className="text-ink">GABA co-factor:</strong> required for GABA synthesis and for maintaining GABA receptor sensitivity</li>
              <li><strong className="text-ink">Melatonin co-factor:</strong> involved in pineal conversion of serotonin to melatonin; magnesium depletion reduces melatonin output</li>
              <li><strong className="text-ink">HPA axis:</strong> magnesium depletion elevates cortisol; repletion supports stress-axis normalization</li>
            </ul>
          </div>

          <div className="card-premium p-5 space-y-3">
            <h3 className="text-xl font-semibold text-ink">Glycine bonus (glycinate form)</h3>
            <ul className="text-sm leading-7 text-[#46574d] space-y-1">
              <li>Glycine is an inhibitory neurotransmitter in the spinal cord and brainstem (glycine receptor agonism)</li>
              <li>Clinical evidence: 3g glycine before bed reduces fatigue, improves sleep quality, reduces daytime sleepiness (Bannai et al. 2012, PMID: 22293532)</li>
              <li>At typical supplement doses (200–400mg elemental Mg as glycinate), the glycine content is ~800mg–1.6g — additive but below the clinical sleep dose</li>
              <li>This glycine co-effect is absent in oxide, citrate, and other inorganic forms</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Evidence section */}
      <section className="card-premium p-6 space-y-5 max-w-4xl">
        <p className="eyebrow-label">Evidence</p>
        <h2 className="text-3xl font-semibold tracking-tight text-ink">What research shows for magnesium and sleep</h2>

        <div className="space-y-5 text-sm leading-7 text-[#46574d]">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-bold text-green-800">Grade B</span>
              <span className="font-semibold text-ink">Magnesium for sleep (deficient populations)</span>
            </div>
            <p>
              <strong className="text-ink">Abbasi et al. 2012</strong> (J Res Med Sci, PMID: 23853635):
              Magnesium 500mg/day for 8 weeks in elderly insomnia patients. Significant improvements
              in Insomnia Severity Index score, sleep efficiency, sleep time, sleep onset latency,
              early morning awakening, serum renin, melatonin, and serum cortisol. Effect size was
              clinically meaningful in this deficient population. Notably conducted with magnesium oxide —
              even with low bioavailability, some effect was detected, suggesting that the body's
              correction of magnesium deficiency drives the sleep benefit.
            </p>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-bold text-yellow-800">Grade B-C</span>
              <span className="font-semibold text-ink">Magnesium for sleep (non-deficient healthy adults)</span>
            </div>
            <p>
              Evidence is weaker in non-deficient healthy adult populations. Zhang et al. 2022 meta-analysis
              found improvements in observational data but mixed RCT results. The mechanism is credible
              and the safety profile is favorable, but the effect size in people who are not magnesium-deficient
              is unclear. Many adults in Western diets do have suboptimal magnesium intake (below the
              ~400mg RDA), which may explain why responses are heterogeneous.
            </p>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-bold text-green-800">Grade A</span>
              <span className="font-semibold text-ink">Magnesium oxide as laxative</span>
            </div>
            <p>
              Well-established clinical evidence for constipation and bowel preparation. Used in clinical
              settings. This is the one indication where oxide's mechanism (osmotic gut effect) is the
              therapeutic goal, not a limitation.
            </p>
          </div>
        </div>
      </section>

      {/* Dosing */}
      <section className="grid gap-6 lg:grid-cols-2 max-w-5xl">
        <div className="card-premium p-6 space-y-3">
          <p className="eyebrow-label">Dosing</p>
          <h2 className="text-2xl font-semibold tracking-tight text-ink">Magnesium Glycinate</h2>
          <ul className="text-sm leading-7 text-[#46574d] space-y-2">
            <li><strong className="text-ink">Sleep/anxiety dose:</strong> 200–400mg elemental magnesium — read labels for "elemental" amount, not total capsule weight</li>
            <li><strong className="text-ink">Label math:</strong> Glycinate capsules often contain 50–100mg elemental Mg each; a "400mg" capsule may contain only 50–80mg elemental</li>
            <li><strong className="text-ink">Timing:</strong> 30–60 minutes before bed for sleep; can be split AM/PM for anxiety support</li>
            <li><strong className="text-ink">Start low:</strong> 100–200mg elemental for first 1–2 weeks</li>
            <li><strong className="text-ink">NIH upper limit:</strong> 350mg supplemental magnesium/day (above dietary intake); above this, GI effects increase even with well-absorbed forms</li>
          </ul>
        </div>

        <div className="card-premium p-6 space-y-3">
          <p className="eyebrow-label">Dosing</p>
          <h2 className="text-2xl font-semibold tracking-tight text-ink">Magnesium Oxide</h2>
          <ul className="text-sm leading-7 text-[#46574d] space-y-2">
            <li><strong className="text-ink">Laxative dose:</strong> 400–1,200mg elemental magnesium oxide (use lower end for gentle effect)</li>
            <li><strong className="text-ink">Sleep/anxiety: not appropriate.</strong> The dose required to absorb meaningful systemic magnesium from oxide would reliably cause diarrhea.</li>
            <li><strong className="text-ink">Multivitamin context:</strong> Small amounts of oxide in multivitamins (&lt;100mg) are minimally absorbed and functionally irrelevant for magnesium repletion goals</li>
          </ul>
        </div>
      </section>

      {/* Safety */}
      <section className="card-premium p-6 space-y-5 max-w-5xl">
        <p className="eyebrow-label">Safety</p>
        <h2 className="text-3xl font-semibold tracking-tight text-ink">Who should be cautious</h2>

        <div className="grid gap-5 md:grid-cols-3">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-ink">Kidney disease</h3>
            <p className="text-sm leading-7 text-[#46574d]">
              Most important contraindication. Magnesium is renally cleared; CKD stage 3+ patients
              cannot excrete excess magnesium effectively. Hypermagnesemia risk — can cause
              neuromuscular problems, cardiac arrhythmia, respiratory depression in severe cases.
              Do not supplement without medical guidance if you have kidney disease.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-ink">Medication interactions</h3>
            <p className="text-sm leading-7 text-[#46574d]">
              Space magnesium at least 2 hours from quinolone antibiotics (ciprofloxacin),
              tetracyclines (doxycycline), bisphosphonates (alendronate), and levothyroxine —
              magnesium reduces their absorption. Neuromuscular blockers (for surgery): clinician
              should be aware of supplementation. IV magnesium has different interaction profile.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-ink">Special populations</h3>
            <p className="text-sm leading-7 text-[#46574d]">
              Pregnancy: magnesium is essential during pregnancy; supplemental magnesium is often
              recommended but should be at doses guided by a clinician, especially with history of
              preeclampsia or cardiac conditions. Breastfeeding: generally considered safe at
              normal dietary supplement doses with clinician guidance.
            </p>
          </div>
        </div>

        <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 text-sm leading-6 text-amber-900">
          <p className="font-semibold">What to look for on labels</p>
          <p className="mt-1">
            Always check for the <em>elemental magnesium</em> amount per serving — not the total weight
            of the magnesium compound. Prefer products with third-party testing verification (USP, NSF,
            Informed Sport, or Labdoor). Avoid products that promise to "cure" insomnia or anxiety —
            supplement language should be qualified and proportionate.
          </p>
        </div>
      </section>

      {/* Stack section */}
      <section className="space-y-5 max-w-4xl">
        <p className="eyebrow-label">Stack Context</p>
        <h2 className="text-3xl font-semibold tracking-tight text-ink">Where magnesium glycinate fits</h2>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="card-premium p-5 space-y-3">
            <p className="eyebrow-label">Sleep Stack</p>
            <h3 className="text-xl font-semibold text-ink">Glycinate + L-Theanine</h3>
            <p className="text-sm leading-7 text-[#46574d]">
              Complementary mechanisms for sleep onset and quality. L-theanine acts faster (30–60 min),
              promoting alpha waves and reducing sleep-onset anxiety. Magnesium provides systemic NMDA
              and GABA support, melatonin co-factor function, and muscle relaxation. Together they address
              different aspects of sleep disruption without redundancy.
            </p>
            <Link href="/compare/l-theanine-vs-magnesium" className="chip-readable">L-Theanine vs Magnesium</Link>
          </div>

          <div className="card-premium p-5 space-y-3">
            <p className="eyebrow-label">Extended Sleep Stack</p>
            <h3 className="text-xl font-semibold text-ink">Glycinate + Melatonin</h3>
            <p className="text-sm leading-7 text-[#46574d]">
              Magnesium is a co-factor for pineal melatonin synthesis. Combined with low-dose exogenous
              melatonin (0.5–1mg, not the 10mg high-dose common in the US), this covers both the
              internal melatonin production pathway and circadian signal reinforcement. Start with
              magnesium alone before adding melatonin.
            </p>
          </div>

          <div className="card-premium p-5 space-y-3">
            <p className="eyebrow-label">Anxiety Baseline Stack</p>
            <h3 className="text-xl font-semibold text-ink">Glycinate + Ashwagandha</h3>
            <p className="text-sm leading-7 text-[#46574d]">
              Magnesium supports baseline nervous system regulation (NMDA, GABA, cortisol normalization).
              Ashwagandha addresses the HPA axis more directly via cortisol reduction (withanolides).
              Complementary mechanisms for chronic stress support. Ashwagandha cautions apply (thyroid,
              pregnancy, autoimmune, sedative interactions).
            </p>
          </div>

          <div className="card-premium p-5 space-y-3">
            <p className="eyebrow-label">Glycine Amplification</p>
            <h3 className="text-xl font-semibold text-ink">Glycinate + Standalone Glycine</h3>
            <p className="text-sm leading-7 text-[#46574d]">
              If you specifically want to leverage glycine's sleep effects (Bannai et al. 2012 used 3g),
              the glycine content of magnesium glycinate (800mg–1.6g at typical doses) may not reach the
              clinical threshold. Adding separate glycine powder (3–5g before bed) closes this gap.
              Well-tolerated and inexpensive.
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
            <h3 className="text-lg font-semibold text-ink">Is magnesium oxide a waste of money for sleep?</h3>
            <p>
              For most people, yes. Its ~4% bioavailability means you're absorbing a small fraction
              of the labeled elemental magnesium. The Abbasi 2012 study did show sleep improvements
              even with oxide, but those participants were elderly and likely magnesium-deficient,
              where even a small absorbed fraction may have been enough to correct a deficit. In
              non-deficient users, oxide is a poor choice for sleep support.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-ink">Can I just take more magnesium oxide to compensate for lower absorption?</h3>
            <p>
              Not practically. To absorb ~300mg elemental magnesium from oxide, you would need
              approximately 7,500mg oxide — which would cause severe osmotic diarrhea long before
              you achieved meaningful absorption. The laxative effect is not avoidable at doses
              sufficient for systemic repletion.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-ink">Is magnesium glycinate the best magnesium form overall?</h3>
            <p>
              Glycinate is the best all-purpose form for most users. Magnesium malate may be preferred
              for energy and muscle recovery (malic acid is involved in the citric acid cycle). Magnesium
              L-threonate is specifically marketed for brain penetration and cognitive support. Citrate is
              cheaper than glycinate with decent bioavailability but more laxative effect. Glycinate is the
              best compromise of bioavailability, GI tolerance, and sleep/anxiety support.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-ink">How long does magnesium supplementation take to work?</h3>
            <p>
              For acute effects (muscle relaxation, sleep onset support): noticeable in 1–3 days for
              some users. For systemic repletion effects (if deficient): 4–6 weeks of consistent use.
              Magnesium is not a fast-acting compound like L-theanine. Consistent daily dosing matters
              more than timing optimization.
            </p>
          </div>
        </div>
      </section>

      <EnhancedEmailCapture
        headline="Magnesium form guide — what actually absorbs"
        description="Get evidence-graded analysis of magnesium forms, sleep stack protocols, and bioavailability comparisons — written for people who want to know what the research actually shows."
        benefit1="Bioavailability ranked: glycinate vs oxide vs citrate vs threonate vs malate"
        benefit2="Sleep stack protocols: which magnesium combos have research support"
        benefit3="Label reading guide: elemental magnesium, chelation claims, and what to ignore"
        ctaLabel="Join the list"
        location="compare-magnesium-glycinate-vs-oxide"
      />

      <RelatedDiscoveryWidget
        heading="Explore magnesium depth"
        subheading="Form comparisons, sleep stacks, and evidence context for the most common mineral supplement."
        items={[
          {
            type: 'guide',
            label: 'Compound',
            title: 'Magnesium Overview',
            description: 'Full evidence profile across all forms: mechanisms, RCT data, dosing, safety, and form-by-form comparison.',
            href: '/compounds/magnesium',
          },
          {
            type: 'guide',
            label: 'Comparison',
            title: 'Magnesium Glycinate vs L-Threonate',
            description: 'When the more expensive brain-penetrating form makes sense — and when glycinate is enough.',
            href: '/compare/magnesium-glycinate-vs-l-threonate-for-sleep',
          },
          {
            type: 'guide',
            label: 'Comparison',
            title: 'L-Theanine vs Magnesium',
            description: 'Two calming compounds with overlapping but distinct mechanisms — which to prioritize and how to stack them.',
            href: '/compare/l-theanine-vs-magnesium',
          },
          {
            type: 'guide',
            label: 'Goal Guide',
            title: 'Sleep Goal Guide',
            description: 'Map your sleep problem to the right supplement stack — onset, depth, anxiety, and recovery.',
            href: '/goals/sleep',
          },
          {
            type: 'guide',
            label: 'Stack',
            title: 'Sleep Stack',
            description: 'Evidence-guided sleep supplement protocol with timing, dosing, and safety context.',
            href: '/best-supplements-for-sleep',
          },
          {
            type: 'guide',
            label: 'Comparison',
            title: 'Ashwagandha vs Magnesium',
            description: 'For anxiety and stress: when to use each, and how the mechanisms differ.',
            href: '/goals/anxiety',
          },
        ]}
      />

      <div className="space-y-3">
        <AffiliateDisclosure />
        <RecommendationSection
          title="Magnesium glycinate product picks"
          description="Magnesium glycinate products reviewed for elemental magnesium content accuracy, chelation quality, and third-party testing. Magnesium oxide products are excluded — not the right form for systemic goals."
          products={magnesiumProducts}
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <Link href="/compare/magnesium-glycinate-vs-l-threonate-for-sleep" className="chip-readable">Magnesium Glycinate vs L-Threonate</Link>
        <Link href="/compare/l-theanine-vs-magnesium" className="chip-readable">L-Theanine vs Magnesium</Link>
        <Link href="/best-supplements-for-sleep" className="chip-readable">Sleep Supplement Guide</Link>
        <Link href="/goals/sleep" className="chip-readable">Sleep Goals</Link>
        <Link href="/compare" className="chip-readable">All Comparisons</Link>
      </div>
    </div>
  )
}
