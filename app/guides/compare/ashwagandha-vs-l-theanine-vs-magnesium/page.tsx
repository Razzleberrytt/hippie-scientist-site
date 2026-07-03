import type { Metadata } from 'next'
import Image from 'next/image'
import { buildPageMetadata } from '../../../../src/lib/seo'

export const metadata: Metadata = buildPageMetadata({
  title: 'Ashwagandha vs L-Theanine vs Magnesium',
  description: 'Evidence-informed 3-way comparison of ashwagandha, L-theanine, and magnesium for chronic tension, acute stress buffering, sleep latency, safety, and supplement selection.',
  path: '/guides/compare/ashwagandha-vs-l-theanine-vs-magnesium/',
})

import Link from 'next/link'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import AffiliateDisclosure from '../../../../components/AffiliateDisclosure'
import { EnhancedEmailCapture } from '@/components/monetization/EnhancedEmailCapture'
import { RelatedDiscoveryWidget } from '@/components/monetization/RelatedDiscoveryWidget'
import RecommendationSection from '@/components/RecommendationSection'
import { getRevenueProductSet } from '@/config/revenue-products'

export default function AshwagandhaVsLTheanineVsMagnesiumPage() {
  const revenueProducts = ['ashwagandha', 'l-theanine', 'magnesium']
    .map(slug => getRevenueProductSet(slug))
    .filter((set): set is NonNullable<typeof set> => Boolean(set))
    .flatMap(set => set.products)

  return (
    <div className="container-page py-10 space-y-10">
      <AuthorityJsonLd
        title="Ashwagandha vs L-Theanine vs Magnesium for Stress & Anxiety"
        description="Evidence-informed 3-way comparison of ashwagandha, L-theanine, and magnesium for chronic tension, acute stress buffering, sleep latency, safety, and supplement selection."
        url="https://thehippiescientist.net/guides/compare/ashwagandha-vs-l-theanine-vs-magnesium"
        type="Article"
      />

      <AuthorityBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Compare', href: '/compare' },
          { label: 'Ashwagandha vs L-Theanine vs Magnesium' },
        ]}
      />

      <section className="space-y-5 max-w-4xl">
        <p className="eyebrow-label">Educational Comparison</p>
        <h1 className="text-5xl font-bold tracking-tight text-ink">
          Ashwagandha vs L-Theanine vs Magnesium: Which Fits Your Stress Pattern?
        </h1>
        <p className="text-lg leading-8 text-muted">
          Choosing between these three popular options depends on your specific stress presentation.
          Ashwagandha is an adaptogen suited for chronic, daily tension. L-Theanine is an amino acid that excels at acute, situational stress.
          Magnesium glycinate is a mineral that addresses baseline physical relaxation and evening recovery.
        </p>

        <figure className="mt-6">
          <div className="overflow-hidden rounded-2xl border border-brand-900/10 shadow-sm bg-white">
            <Image
              src="/images/guides/ashwagandha-vs-l-theanine-vs-magnesium.jpg"
              alt="Ashwagandha root, green tea (L-theanine), and magnesium capsules compared"
              width={1536}
              height={1024}
              priority
              className="w-full h-auto"
            />
          </div>
          <figcaption className="mt-3 text-center text-sm text-muted">
            Ashwagandha vs L-theanine vs magnesium — three different jobs.
          </figcaption>
        </figure>
      </section>

      {/* 3-Column Core Comparison Cards */}
      <section className="grid gap-6 lg:grid-cols-3">
        <div className="card-premium p-6 space-y-4 flex flex-col justify-between">
          <div>
            <p className="eyebrow-label bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-full inline-block mb-2 text-xs font-semibold">
              Daily Adaptogen
            </p>
            <h2 className="text-3xl font-semibold tracking-tight text-ink">Ashwagandha</h2>
            <p className="text-sm leading-7 text-muted mt-2">
              Best for chronic, ongoing cortisol-driven stress. It requires consistent daily use over 2–8 weeks to show noticeable effects on subjective anxiety scales.
            </p>
          </div>
          <div className="pt-4">
            <Link href="/herbs/ashwagandha" className="chip-readable text-xs font-bold">
              Explore Ashwagandha →
            </Link>
          </div>
        </div>

        <div className="card-premium p-6 space-y-4 flex flex-col justify-between">
          <div>
            <p className="eyebrow-label bg-teal-50 text-teal-800 px-2 py-0.5 rounded-full inline-block mb-2 text-xs font-semibold">
              Acute Stress Buffer
            </p>
            <h2 className="text-3xl font-semibold tracking-tight text-ink">L-Theanine</h2>
            <p className="text-sm leading-7 text-muted mt-2">
              Best for acute, situational stress (such as presentations or exams) or racing thoughts. It promotes alpha-wave brain activity, taking effect within 30–90 minutes.
            </p>
          </div>
          <div className="pt-4">
            <Link href="/compounds/l-theanine" className="chip-readable text-xs font-bold">
              Explore L-Theanine →
            </Link>
          </div>
        </div>

        <div className="card-premium p-6 space-y-4 flex flex-col justify-between">
          <div>
            <p className="eyebrow-label bg-blue-50 text-blue-800 px-2 py-0.5 rounded-full inline-block mb-2 text-xs font-semibold">
              Baseline Relaxation
            </p>
            <h2 className="text-3xl font-semibold tracking-tight text-ink">Magnesium</h2>
            <p className="text-sm leading-7 text-muted mt-2">
              Best for physical muscle tension and baseline recovery. Using magnesium glycinate in the evening supports sleep wind-down and addresses dietary mineral gaps.
            </p>
          </div>
          <div className="pt-4">
            <Link href="/compounds/magnesium" className="chip-readable text-xs font-bold">
              Explore Magnesium →
            </Link>
          </div>
        </div>
      </section>

      {/* Head-to-Head Comparison Table */}
      <section className="card-premium p-6 space-y-5 max-w-5xl">
        <p className="eyebrow-label">Decision Table</p>
        <h2 className="text-3xl font-semibold tracking-tight text-ink">Head-to-Head Comparison</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="text-ink">
              <tr className="border-b border-black/10">
                <th className="py-3 pr-4 font-bold uppercase tracking-wider text-xs">Factor</th>
                <th className="py-3 pr-4 font-bold uppercase tracking-wider text-xs">Ashwagandha</th>
                <th className="py-3 pr-4 font-bold uppercase tracking-wider text-xs">L-Theanine</th>
                <th className="py-3 pr-4 font-bold uppercase tracking-wider text-xs">Magnesium (Glycinate)</th>
              </tr>
            </thead>
            <tbody className="text-muted divide-y divide-black/5">
              <tr>
                <td className="py-3.5 pr-4 font-semibold text-ink">Primary Fit</td>
                <td className="py-3.5 pr-4">Chronic, generalized stress &amp; cortisol regulation</td>
                <td className="py-3.5 pr-4">Acute situational stress, racing thoughts, jitters</td>
                <td className="py-3.5 pr-4">Physical tension, muscle cramps, baseline deficiency</td>
              </tr>
              <tr>
                <td className="py-3.5 pr-4 font-semibold text-ink">Onset Speed</td>
                <td className="py-3.5 pr-4">2 to 8 weeks of daily use</td>
                <td className="py-3.5 pr-4">30 to 90 minutes (rapid)</td>
                <td className="py-3.5 pr-4">Days to weeks of steady dosing</td>
              </tr>
              <tr>
                <td className="py-3.5 pr-4 font-semibold text-ink">Primary Mechanism</td>
                <td className="py-3.5 pr-4">HPA-axis regulation, cortisol reduction</td>
                <td className="py-3.5 pr-4">Glutamate receptor blocker, GABA support</td>
                <td className="py-3.5 pr-4">NMDA receptor blocker, muscle relaxation</td>
              </tr>
              <tr>
                <td className="py-3.5 pr-4 font-semibold text-ink">Evidence Grade</td>
                <td className="py-3.5 pr-4">
                  <span className="inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-800 border border-emerald-100">
                    Moderate to Strong
                  </span>
                </td>
                <td className="py-3.5 pr-4">
                  <span className="inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-800 border border-emerald-100">
                    Moderate
                  </span>
                </td>
                <td className="py-3.5 pr-4">
                  <span className="inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-800 border border-emerald-100">
                    Limited to Moderate
                  </span>
                </td>
              </tr>
              <tr>
                <td className="py-3.5 pr-4 font-semibold text-ink">Main Cautions</td>
                <td className="py-3.5 pr-4">Pregnancy, thyroid meds, autoimmune conditions</td>
                <td className="py-3.5 pr-4">Low blood pressure (hypotension) risk</td>
                <td className="py-3.5 pr-4">Severe kidney disease (impaired clearance)</td>
              </tr>
              <tr>
                <td className="py-3.5 pr-4 font-semibold text-ink">Bottom Line</td>
                <td className="py-3.5 pr-4">Excellent for long-term daily resilience</td>
                <td className="py-3.5 pr-4">Ideal for fast-acting daytime calm</td>
                <td className="py-3.5 pr-4">Best basic daily mineral wind-down</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Practical Trade-offs Deep Dive */}
      <section className="grid gap-6 lg:grid-cols-3">
        <div className="card-premium p-6 space-y-3">
          <p className="eyebrow-label">Scenario 1</p>
          <h2 className="text-2xl font-semibold tracking-tight text-ink">The Wired-Tired Pattern</h2>
          <p className="text-sm leading-7 text-muted">
            If your stress manifests as ongoing, physical and mental exhaustion paired with high evening tension,
            <strong> Ashwagandha</strong> is generally the more targeted option. It aims to support baseline adaptation,
            but you must monitor for rare side effects like emotional blunting (anhedonia).
          </p>
        </div>
        <div className="card-premium p-6 space-y-3">
          <p className="eyebrow-label">Scenario 2</p>
          <h2 className="text-2xl font-semibold tracking-tight text-ink">Acute Performance Jitters</h2>
          <p className="text-sm leading-7 text-muted">
            If you need calm focus during a demanding meeting or to take the edge off caffeine consumption,
            <strong> L-Theanine</strong> is the ideal choice. It crosses the blood-brain barrier rapidly to
            increase alpha-wave activity without inducing grogginess.
          </p>
        </div>
        <div className="card-premium p-6 space-y-3">
          <p className="eyebrow-label">Scenario 3</p>
          <h2 className="text-2xl font-semibold tracking-tight text-ink">Physical &amp; Evening Tension</h2>
          <p className="text-sm leading-7 text-muted">
            If your stress triggers muscle tightness, jaw-clenching, or sleep-onset disruption,
            <strong> Magnesium glycinate</strong> provides the double benefit of glycine (a calming neurotransmitter)
            paired with highly absorbable elemental magnesium.
          </p>
        </div>
      </section>

      {/* Scientific/Safety Considerations */}
      <section className="card-premium p-6 space-y-5 max-w-4xl border-l-4 border-rose-500 bg-rose-50/10">
        <p className="text-xs font-bold uppercase tracking-wider text-rose-900">Safety &amp; Clinical Cautions</p>
        <h2 className="text-2xl font-bold tracking-tight text-ink">Understanding the Physiological Boundaries</h2>
        <div className="space-y-4 text-sm leading-relaxed text-muted">
          <p>
            While all three compounds are widely available, they have active physiological targets and must be approached with caution:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong>Ashwagandha</strong> can stimulate thyroid hormone synthesis (avoid if you have hyperthyroidism or take thyroid meds) and may increase immune activity (caution in autoimmune conditions like lupus, RA, or MS). Do not use during pregnancy.
            </li>
            <li>
              <strong>L-Theanine</strong> can moderately lower blood pressure. If you already have low blood pressure or take antihypertensive medications, consult your physician.
            </li>
            <li>
              <strong>Magnesium</strong> relies heavily on kidney clearance. If you have any history of kidney disease or renal impairment, supplementing magnesium can cause dangerous buildup (hypermagnesemia).
            </li>
          </ul>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="card-premium p-6 space-y-4 max-w-4xl">
        <p className="eyebrow-label">FAQ</p>
        <h2 className="text-3xl font-semibold tracking-tight text-ink">Common Questions</h2>
        <div className="space-y-4 text-sm leading-7 text-muted">
          <div>
            <h3 className="text-lg font-semibold text-ink">Can I take all three together?</h3>
            <p>
              Many users stack them, particularly in evening routines. However, to identify what actually works for you and avoid compound side effects, we strongly recommend starting with one ingredient at a time and evaluating it for at least a week before adding others.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-ink">Does magnesium glycinate or L-theanine work faster?</h3>
            <p>
              L-theanine works much faster (usually within 30 to 90 minutes) for acute mental chatter. Magnesium glycinate acts over several days to correct baseline cell levels, though the glycine component can offer mild acute bedtime relaxation.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-ink">Should I take ashwagandha in the morning or night?</h3>
            <p>
              If ashwagandha is used to support evening calm, a split dose (morning and evening) or a single evening dose is common. If it causes daytime lethargy, move the entire dose to 1 hour before sleep.
            </p>
          </div>
        </div>
      </section>

      <EnhancedEmailCapture
        headline="Stress Pattern Matching Framework"
        description="Get our evidence-based guide on mapping your daily stress pattern, selecting clinically backed dosages, and avoiding adaptogen safety traps."
        benefit1="Identify your stress subtype: overactivated cortisol vs. physical exhaustion"
        benefit2="Exact clinical dosages and extract standardizations (KSM-66 vs. Shoden)"
        benefit3="Safe stacking guidelines to avoid liver and thyroid complications"
        ctaLabel="Get the stress guide"
        location="compare-ashwagandha-vs-l-theanine-vs-magnesium"
      />

      <RelatedDiscoveryWidget
        heading="Explore Stress &amp; Anxiety Support"
        subheading="Dig deeper into adaptogen science, stress pathways, and our evidence grading methodology."
        items={[
          {
            type: 'herb',
            label: 'Herb',
            title: 'Ashwagandha',
            description: 'Calming adaptogen that lowers cortisol. Strong human trials, with clear thyroid and autoimmune limits.',
            href: '/herbs/ashwagandha',
          },
          {
            type: 'compound',
            label: 'Compound',
            title: 'L-Theanine',
            description: 'Amino acid that blocks glutamate receptors to promote relaxation and focused attention.',
            href: '/compounds/l-theanine',
          },
          {
            type: 'compound',
            label: 'Compound',
            title: 'Magnesium',
            description: 'Essential mineral for muscle relaxation, NMDA pathway regulation, and sleep support.',
            href: '/compounds/magnesium',
          },
          {
            type: 'guide',
            label: 'Guide',
            title: 'Stress Resilience',
            description: 'How to map your stress pattern (wired vs. tired) to select the right adaptogen.',
            href: '/guides/anxiety',
          },
        ]}
      />

      <div className="space-y-3">
        <AffiliateDisclosure />
        <RecommendationSection
          title="Ashwagandha, L-Theanine, and Magnesium Product Picks"
          description="Editor recommended options for clean, third-party tested formulations. Review safety warnings before supplementing."
          products={revenueProducts}
        />
      </div>
    </div>
  )
}
