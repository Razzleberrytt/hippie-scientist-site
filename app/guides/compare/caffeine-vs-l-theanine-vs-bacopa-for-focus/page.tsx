import type { Metadata } from 'next'
import { buildPageMetadata } from '../../../../src/lib/seo'

export const metadata: Metadata = buildPageMetadata({
  title: 'Caffeine vs L-Theanine vs Bacopa for Focus & Attention',
  description: 'Evidence-informed 3-way comparison of caffeine, L-theanine, and bacopa monnieri for acute alertness, calm concentration, long-term memory support, safety, and supplement selection.',
  path: '/compare/caffeine-vs-l-theanine-vs-bacopa-for-focus/',
})

import Link from 'next/link'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import AffiliateDisclosure from '../../../../components/AffiliateDisclosure'
import { EnhancedEmailCapture } from '@/components/monetization/EnhancedEmailCapture'
import { RelatedDiscoveryWidget } from '@/components/monetization/RelatedDiscoveryWidget'
import RecommendationSection from '@/components/RecommendationSection'
import { getRevenueProductSet } from '@/config/revenue-products'

export default function CaffeineVsLTheanineVsBacopaForFocusPage() {
  const revenueProducts = ['caffeine', 'l-theanine', 'bacopa']
    .map(slug => getRevenueProductSet(slug))
    .filter((set): set is NonNullable<typeof set> => Boolean(set))
    .flatMap(set => set.products)

  return (
    <div className="container-page py-10 space-y-10">
      <AuthorityJsonLd
        title="Caffeine vs L-Theanine vs Bacopa for Focus & Attention"
        description="Evidence-informed 3-way comparison of caffeine, L-theanine, and bacopa monnieri for acute alertness, calm concentration, long-term memory support, safety, and supplement selection."
        url="https://thehippiescientist.net/compare/caffeine-vs-l-theanine-vs-bacopa-for-focus"
        type="Article"
      />

      <AuthorityBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Compare', href: '/compare' },
          { label: 'Caffeine vs L-Theanine vs Bacopa for Focus' },
        ]}
      />

      <section className="space-y-5 max-w-4xl">
        <p className="eyebrow-label">Educational Comparison</p>
        <h1 className="text-5xl font-bold tracking-tight text-ink">
          Caffeine vs L-Theanine vs Bacopa: Which Supports Your Cognitive Pattern?
        </h1>
        <p className="text-lg leading-8 text-muted">
          If you are looking to boost focus, these three options work on completely different timelines.
          <strong> Caffeine</strong> provides rapid, stimulating alertness but can trigger jitters.
          <strong> L-Theanine</strong> promotes calm concentration and is commonly paired with caffeine to smooth its stimulant side effects.
          <strong> Bacopa Monnieri</strong> is a cumulative, non-stimulant adaptogen that supports long-term memory retention over several weeks.
        </p>
      </section>

      {/* 3-Column Core Comparison Cards */}
      <section className="grid gap-6 lg:grid-cols-3">
        <div className="card-premium p-6 space-y-4 flex flex-col justify-between">
          <div>
            <p className="eyebrow-label bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-full inline-block mb-2 text-xs font-semibold">
              Acute Stimulant
            </p>
            <h2 className="text-3xl font-semibold tracking-tight text-ink">Caffeine</h2>
            <p className="text-sm leading-7 text-muted mt-2">
              Best for immediate alertness and physical energy. It acts rapidly by blocking adenosine receptors, but can lead to tolerance, crashes, and sleep disruptions if used late in the day.
            </p>
          </div>
          <div className="pt-4">
            <Link href="/compounds/caffeine" className="chip-readable text-xs font-bold">
              Explore Caffeine →
            </Link>
          </div>
        </div>

        <div className="card-premium p-6 space-y-4 flex flex-col justify-between">
          <div>
            <p className="eyebrow-label bg-teal-50 text-teal-800 px-2 py-0.5 rounded-full inline-block mb-2 text-xs font-semibold">
              Relaxed Attention
            </p>
            <h2 className="text-3xl font-semibold tracking-tight text-ink">L-Theanine</h2>
            <p className="text-sm leading-7 text-muted mt-2">
              Best for calming overstimulation. It blocks glutamate receptors, generating alpha-wave activity to provide alert relaxation. It works within 30–90 minutes and is commonly paired with caffeine.
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
              Long-Term Nootropic
            </p>
            <h2 className="text-3xl font-semibold tracking-tight text-ink">Bacopa Monnieri</h2>
            <p className="text-sm leading-7 text-muted mt-2">
              Best for cumulative memory consolidation and learning. It works over 4–12 weeks of daily use by promoting synaptic growth and modulating acetylcholine systems.
            </p>
          </div>
          <div className="pt-4">
            <Link href="/herbs/bacopa" className="chip-readable text-xs font-bold">
              Explore Bacopa →
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
                <th className="py-3 pr-4 font-bold uppercase tracking-wider text-xs">Caffeine</th>
                <th className="py-3 pr-4 font-bold uppercase tracking-wider text-xs">L-Theanine</th>
                <th className="py-3 pr-4 font-bold uppercase tracking-wider text-xs">Bacopa Monnieri</th>
              </tr>
            </thead>
            <tbody className="text-muted divide-y divide-black/5">
              <tr>
                <td className="py-3.5 pr-4 font-semibold text-ink">Primary Fit</td>
                <td className="py-3.5 pr-4">Acute vigilance, sleep deprivation, physical endurance</td>
                <td className="py-3.5 pr-4">Quieting caffeine jitters, promoting calm focus</td>
                <td className="py-3.5 pr-4">Long-term memory retention, learning, study blocks</td>
              </tr>
              <tr>
                <td className="py-3.5 pr-4 font-semibold text-ink">Onset Speed</td>
                <td className="py-3.5 pr-4">15 to 45 minutes</td>
                <td className="py-3.5 pr-4">30 to 90 minutes</td>
                <td className="py-3.5 pr-4">4 to 12 weeks of daily dosing</td>
              </tr>
              <tr>
                <td className="py-3.5 pr-4 font-semibold text-ink">Primary Mechanism</td>
                <td className="py-3.5 pr-4">Adenosine receptor antagonist, dopamine release</td>
                <td className="py-3.5 pr-4">Glutamate blocker, increases GABA &amp; alpha waves</td>
                <td className="py-3.5 pr-4">Acetylcholine support, synaptic plasticity</td>
              </tr>
              <tr>
                <td className="py-3.5 pr-4 font-semibold text-ink">Evidence Grade</td>
                <td className="py-3.5 pr-4">
                  <span className="inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-800 border border-emerald-100">
                    Strong (alertness)
                  </span>
                </td>
                <td className="py-3.5 pr-4">
                  <span className="inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-800 border border-emerald-100">
                    Moderate
                  </span>
                </td>
                <td className="py-3.5 pr-4">
                  <span className="inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-800 border border-emerald-100">
                    Moderate (memory)
                  </span>
                </td>
              </tr>
              <tr>
                <td className="py-3.5 pr-4 font-semibold text-ink">Main Cautions</td>
                <td className="py-3.5 pr-4">Anxiety/panic triggers, high blood pressure, insomnia</td>
                <td className="py-3.5 pr-4">Mild hypotensive (low blood pressure) risk</td>
                <td className="py-3.5 pr-4">GI discomfort, thyroid caution, anticholinergic drugs</td>
              </tr>
              <tr>
                <td className="py-3.5 pr-4 font-semibold text-ink">Bottom Line</td>
                <td className="py-3.5 pr-4">Best for immediate, high-alert situations</td>
                <td className="py-3.5 pr-4">Best for smoothing stimulation and focus loops</td>
                <td className="py-3.5 pr-4">Best non-stimulant for steady memory building</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Practical Trade-offs Deep Dive */}
      <section className="grid gap-6 lg:grid-cols-3">
        <div className="card-premium p-6 space-y-3">
          <p className="eyebrow-label">Scenario 1</p>
          <h2 className="text-2xl font-semibold tracking-tight text-ink">The Acute Deadline</h2>
          <p className="text-sm leading-7 text-muted">
            If you need to stay alert for an immediate exam or task under mild sleep debt,
            <strong> Caffeine</strong> provides the strongest and fastest boost. Keep in mind that
            overuse or late-day consumption can ruin subsequent recovery cycles, creating a fatigue loop.
          </p>
        </div>
        <div className="card-premium p-6 space-y-3">
          <p className="eyebrow-label">Scenario 2</p>
          <h2 className="text-2xl font-semibold tracking-tight text-ink">The Focused Synergy</h2>
          <p className="text-sm leading-7 text-muted">
            If you love the focus caffeine provides but hate the racing heart rate and physical jitters,
            <strong> L-Theanine</strong> is the perfect partner. Studies suggest a 2:1 ratio (e.g. 200 mg L-theanine
            to 100 mg caffeine) optimizes attention while buffering stimulant side effects.
          </p>
        </div>
        <div className="card-premium p-6 space-y-3">
          <p className="eyebrow-label">Scenario 3</p>
          <h2 className="text-2xl font-semibold tracking-tight text-ink">Steady Memory Building</h2>
          <p className="text-sm leading-7 text-muted">
            If you want to boost learning rate or recall over a long-term project (such as learning a language
            or studying for licensing exams), <strong> Bacopa Monnieri</strong> is the target. It will not give
            immediate stimulation, so do not expect it to act like caffeine.
          </p>
        </div>
      </section>

      {/* Safety Considerations */}
      <section className="card-premium p-6 space-y-5 max-w-4xl border-l-4 border-rose-500 bg-rose-50/10">
        <p className="text-xs font-bold uppercase tracking-wider text-rose-900">Safety &amp; Clinical Cautions</p>
        <h2 className="text-2xl font-bold tracking-tight text-ink">Understanding Cognitive Stimulant Risks</h2>
        <div className="space-y-4 text-sm leading-relaxed text-muted">
          <p>
            Do not assume cognitive enhancers are without side effects or drug interactions:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong>Caffeine</strong> can elevate blood pressure and heart rate. It should be limited or avoided in individuals with cardiovascular conditions, panic disorders, or severe insomnia. Regular use leads to physical dependence and withdrawal symptoms (headaches, lethargy).
            </li>
            <li>
              <strong>L-Theanine</strong> has a high safety profile, but its ability to lower blood pressure means individuals already taking antihypertensives or with baseline hypotension should monitor their vitals.
            </li>
            <li>
              <strong>Bacopa Monnieri</strong> can cause mild gastrointestinal upset, nausea, or stomach cramping if taken on an empty stomach. Because it increases acetylcholine levels, avoid taking it alongside prescription anticholinergic drugs or acetylcholinesterase inhibitors unless under clinician supervision.
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
            <h3 className="text-lg font-semibold text-ink">How should I schedule my bacopa doses?</h3>
            <p>
              Because bacopa is fat-soluble and can trigger mild GI discomfort, it is best taken daily with a meal containing healthy fats. Dosing is cumulative, meaning missing days will reduce its memory consolidation effects.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-ink">Why does caffeine lose its focus-boosting effect?</h3>
            <p>
              The brain adapts to chronic caffeine use by building more adenosine receptors. Over time, you require more caffeine just to reach your baseline level of alertness. Cycling off caffeine (e.g. taking weekend breaks) helps reset this sensitivity.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-ink">Is there a non-stimulant focus stack?</h3>
            <p>
              Yes. Pairing L-theanine with bacopa monnieri is a popular non-stimulant combination that targets both acute bedtime-safe cognitive quieting and long-term memory support without touching cardiac pathways.
            </p>
          </div>
        </div>
      </section>

      <EnhancedEmailCapture
        headline="Cognitive Performance &amp; Focus Guide"
        description="Download our research notes on optimizing focus stacks, cycling caffeine, and using long-term nootropics safely."
        benefit1="Optimal ratios: configuring the caffeine + L-theanine focus stack"
        benefit2="Choline pairing: when to add Alpha-GPC or Citicoline to your routine"
        benefit3="Safe cycling: avoiding caffeine withdrawal and tolerance drift"
        ctaLabel="Get the focus guide"
        location="compare-caffeine-theanine-bacopa"
      />

      <RelatedDiscoveryWidget
        heading="Explore Focus &amp; Cognition"
        subheading="Compare nearby cognitive options, learn about adaptogen mechanisms, and review our evidence framework."
        items={[
          {
            type: 'compound',
            label: 'Compound',
            title: 'Caffeine',
            description: 'Vigilance stimulant that blocks adenosine. Highly effective, but sleep and anxiety risks apply.',
            href: '/compounds/caffeine',
          },
          {
            type: 'compound',
            label: 'Compound',
            title: 'L-Theanine',
            description: 'Glutamate-inhibiting amino acid. Smooths out caffeine jitters for calm daytime focus.',
            href: '/compounds/l-theanine',
          },
          {
            type: 'herb',
            label: 'Herb',
            title: 'Bacopa Monnieri',
            description: 'Traditional memory adaptogen. Strong for learning rates, with slow cumulative effects.',
            href: '/herbs/bacopa',
          },
          {
            type: 'guide',
            label: 'Guide',
            title: 'Focus Decisions',
            description: 'A comprehensive guide comparing focus options by onset speed, form, and dropdown risk.',
            href: '/guides/focus',
          },
        ]}
      />

      <div className="space-y-3">
        <AffiliateDisclosure />
        <RecommendationSection
          title="Caffeine, L-Theanine, and Bacopa Product Picks"
          description="Editor recommended options for clean, third-party tested nootropics. Review cardiac and drug cautions first."
          products={revenueProducts}
        />
      </div>
    </div>
  )
}
