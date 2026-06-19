import type { Metadata } from 'next'
import { buildPageMetadata } from '../../../src/lib/seo'

export const metadata: Metadata = buildPageMetadata({
  title: 'Curcumin vs Boswellia vs Omega-3 for Pain & Inflammation',
  description: 'Evidence-informed 3-way comparison of curcumin, boswellia, and omega-3 (EPA/DHA) for joint pain, inflammatory discomfort, mechanism, onset, safety, and supplement selection.',
  path: '/compare/curcumin-vs-boswellia-vs-omega-3/',
})

import Link from 'next/link'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import AffiliateDisclosure from '../../../components/AffiliateDisclosure'
import { EnhancedEmailCapture } from '@/components/monetization/EnhancedEmailCapture'
import { RelatedDiscoveryWidget } from '@/components/monetization/RelatedDiscoveryWidget'
import RecommendationSection from '@/components/RecommendationSection'
import { getRevenueProductSet } from '@/config/revenue-products'

export default function CurcuminVsBoswelliaVsOmega3Page() {
  const revenueProducts = ['turmeric', 'boswellia', 'omega-3']
    .map(slug => getRevenueProductSet(slug))
    .filter((set): set is NonNullable<typeof set> => Boolean(set))
    .flatMap(set => set.products)

  return (
    <div className="container-page py-10 space-y-10">
      <AuthorityJsonLd
        title="Curcumin vs Boswellia vs Omega-3 for Pain & Inflammation"
        description="Evidence-informed 3-way comparison of curcumin, boswellia, and omega-3 (EPA/DHA) for joint pain, inflammatory discomfort, mechanism, onset, safety, and supplement selection."
        url="https://thehippiescientist.net/compare/curcumin-vs-boswellia-vs-omega-3"
        type="Article"
      />

      <AuthorityBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Compare', href: '/compare' },
          { label: 'Curcumin vs Boswellia vs Omega-3' },
        ]}
      />

      <section className="space-y-5 max-w-4xl">
        <p className="eyebrow-label">Educational Comparison</p>
        <h1 className="text-5xl font-bold tracking-tight text-ink">
          Curcumin vs Boswellia vs Omega-3: Which Fits Your Inflammatory Pain?
        </h1>
        <p className="text-lg leading-8 text-[#46574d]">
          These three are the most studied natural options for inflammatory and joint discomfort, and they
          work through different routes.
          <strong> Curcumin</strong> broadly dampens inflammatory signaling (NF-κB, COX-2).
          <strong> Boswellia</strong> targets the 5-LOX/leukotriene pathway that curcumin largely misses.
          <strong> Omega-3 (EPA/DHA)</strong> shifts your baseline lipid balance toward resolving inflammation
          over the longer term. None is a painkiller in the pharmaceutical sense — each works on a
          days-to-weeks timeline.
        </p>
      </section>

      {/* 3-Column Core Comparison Cards */}
      <section className="grid gap-6 lg:grid-cols-3">
        <div className="card-premium p-6 space-y-4 flex flex-col justify-between">
          <div>
            <p className="eyebrow-label bg-amber-50 text-amber-800 px-2 py-0.5 rounded-full inline-block mb-2 text-xs font-semibold">
              Broad Anti-Inflammatory
            </p>
            <h2 className="text-3xl font-semibold tracking-tight text-ink">Curcumin</h2>
            <p className="text-sm leading-7 text-[#46574d] mt-2">
              Best for inflammatory joint discomfort with the strongest human trial base of the three.
              Absorption is poor on its own — look for bioavailability-enhanced forms (phytosome, or paired
              with piperine). Typically reviewed over 1–4 weeks.
            </p>
          </div>
          <div className="pt-4">
            <Link href="/compounds/curcumin" className="chip-readable text-xs font-bold">
              Explore Curcumin →
            </Link>
          </div>
        </div>

        <div className="card-premium p-6 space-y-4 flex flex-col justify-between">
          <div>
            <p className="eyebrow-label bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-full inline-block mb-2 text-xs font-semibold">
              5-LOX Pathway
            </p>
            <h2 className="text-3xl font-semibold tracking-tight text-ink">Boswellia</h2>
            <p className="text-sm leading-7 text-[#46574d] mt-2">
              Best for knee and mobility-related joint pain. Its boswellic acids (notably AKBA) inhibit the
              5-lipoxygenase pathway, a different inflammatory route than curcumin — which is why the two are
              often stacked. Look for AKBA-standardized extracts.
            </p>
          </div>
          <div className="pt-4">
            <Link href="/compounds/boswellia" className="chip-readable text-xs font-bold">
              Explore Boswellia →
            </Link>
          </div>
        </div>

        <div className="card-premium p-6 space-y-4 flex flex-col justify-between">
          <div>
            <p className="eyebrow-label bg-blue-50 text-blue-800 px-2 py-0.5 rounded-full inline-block mb-2 text-xs font-semibold">
              Baseline Lipid Shift
            </p>
            <h2 className="text-3xl font-semibold tracking-tight text-ink">Omega-3 (EPA/DHA)</h2>
            <p className="text-sm leading-7 text-[#46574d] mt-2">
              Best for systemic, low-grade inflammation tied to an inflammatory dietary pattern. It works
              slowly by changing the raw materials your body uses to build inflammatory and pro-resolving
              signals. The longest timeline of the three (weeks to months).
            </p>
          </div>
          <div className="pt-4">
            <Link href="/compounds/omega-3" className="chip-readable text-xs font-bold">
              Explore Omega-3 →
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
                <th className="py-3 pr-4 font-bold uppercase tracking-wider text-xs">Curcumin</th>
                <th className="py-3 pr-4 font-bold uppercase tracking-wider text-xs">Boswellia</th>
                <th className="py-3 pr-4 font-bold uppercase tracking-wider text-xs">Omega-3 (EPA/DHA)</th>
              </tr>
            </thead>
            <tbody className="text-[#46574d] divide-y divide-black/5">
              <tr>
                <td className="py-3.5 pr-4 font-semibold text-ink">Primary Fit</td>
                <td className="py-3.5 pr-4">Inflammatory joint discomfort, broad inflammatory load</td>
                <td className="py-3.5 pr-4">Knee and mobility-related joint pain</td>
                <td className="py-3.5 pr-4">Systemic low-grade inflammation, dietary imbalance</td>
              </tr>
              <tr>
                <td className="py-3.5 pr-4 font-semibold text-ink">Onset Speed</td>
                <td className="py-3.5 pr-4">1 to 4 weeks</td>
                <td className="py-3.5 pr-4">Days to 2 weeks</td>
                <td className="py-3.5 pr-4">2 to 8 weeks (or longer)</td>
              </tr>
              <tr>
                <td className="py-3.5 pr-4 font-semibold text-ink">Primary Mechanism</td>
                <td className="py-3.5 pr-4">NF-κB and COX-2 down-regulation</td>
                <td className="py-3.5 pr-4">5-LOX / leukotriene inhibition (AKBA)</td>
                <td className="py-3.5 pr-4">EPA/DHA shift toward pro-resolving mediators</td>
              </tr>
              <tr>
                <td className="py-3.5 pr-4 font-semibold text-ink">Evidence Grade</td>
                <td className="py-3.5 pr-4">
                  <span className="inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-800 border border-emerald-100">
                    Moderate to Strong (OA)
                  </span>
                </td>
                <td className="py-3.5 pr-4">
                  <span className="inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-800 border border-emerald-100">
                    Moderate
                  </span>
                </td>
                <td className="py-3.5 pr-4">
                  <span className="inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-800 border border-emerald-100">
                    Moderate
                  </span>
                </td>
              </tr>
              <tr>
                <td className="py-3.5 pr-4 font-semibold text-ink">Main Cautions</td>
                <td className="py-3.5 pr-4">Anticoagulants, gallbladder disease, reflux sensitivity</td>
                <td className="py-3.5 pr-4">Pregnancy, resin hypersensitivity, brand variability</td>
                <td className="py-3.5 pr-4">Bleeding disorders, anticoagulants, peri-surgical periods</td>
              </tr>
              <tr>
                <td className="py-3.5 pr-4 font-semibold text-ink">Bottom Line</td>
                <td className="py-3.5 pr-4">Best-evidenced starting point for joint inflammation</td>
                <td className="py-3.5 pr-4">Best for a different pathway — strong stack partner</td>
                <td className="py-3.5 pr-4">Best foundational, whole-body inflammatory support</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Practical Trade-offs Deep Dive */}
      <section className="grid gap-6 lg:grid-cols-3">
        <div className="card-premium p-6 space-y-3">
          <p className="eyebrow-label">Scenario 1</p>
          <h2 className="text-2xl font-semibold tracking-tight text-ink">Inflammatory Joint Pain</h2>
          <p className="text-sm leading-7 text-[#46574d]">
            If your discomfort is clearly joint-centered with an inflammatory component, <strong>curcumin</strong>
            has the most supportive human trial data, much of it in osteoarthritis-adjacent pain. Choose a
            bioavailability-enhanced form — plain turmeric powder is poorly absorbed and unlikely to reach
            studied levels.
          </p>
        </div>
        <div className="card-premium p-6 space-y-3">
          <p className="eyebrow-label">Scenario 2</p>
          <h2 className="text-2xl font-semibold tracking-tight text-ink">Hitting a Different Pathway</h2>
          <p className="text-sm leading-7 text-[#46574d]">
            If curcumin alone has plateaued, <strong>boswellia</strong> targets the separate 5-LOX leukotriene
            route. Because the mechanisms differ, the two are frequently combined — but add one at a time so
            you can tell which is actually helping before stacking.
          </p>
        </div>
        <div className="card-premium p-6 space-y-3">
          <p className="eyebrow-label">Scenario 3</p>
          <h2 className="text-2xl font-semibold tracking-tight text-ink">Whole-Body Baseline</h2>
          <p className="text-sm leading-7 text-[#46574d]">
            If your inflammation is systemic and lifestyle-linked rather than one painful joint,
            <strong> omega-3</strong> is the foundational play. Expect a slow build — it changes baseline lipid
            chemistry over weeks, so judge it on a 2-month horizon, not by day-three relief.
          </p>
        </div>
      </section>

      {/* Safety Considerations */}
      <section className="card-premium p-6 space-y-5 max-w-4xl border-l-4 border-rose-500 bg-rose-50/10">
        <p className="text-xs font-bold uppercase tracking-wider text-rose-900">Safety &amp; Clinical Cautions</p>
        <h2 className="text-2xl font-bold tracking-tight text-ink">Important Physiological Limits</h2>
        <div className="space-y-4 text-sm leading-relaxed text-[#46574d]">
          <p>
            All three carry a shared bleeding-risk theme. This matters most if you take anticoagulants or have
            surgery coming up:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong>Curcumin</strong> can have mild antiplatelet effects and may stimulate gallbladder
              contraction — use caution with anticoagulants, gallstones or gallbladder disease, and active acid
              reflux. High-absorption formulas raise effective exposure, so &quot;more bioavailable&quot; also
              means &quot;treat the dose more seriously.&quot;
            </li>
            <li>
              <strong>Boswellia</strong> is generally well tolerated but should be avoided in pregnancy and in
              anyone with resin hypersensitivity. Potency varies widely between brands, so AKBA standardization
              matters for both effect and consistency.
            </li>
            <li>
              <strong>Omega-3</strong> at higher doses can extend bleeding time. Coordinate with a clinician if
              you use blood thinners or are approaching a procedure, and pause as advised peri-operatively.
            </li>
          </ul>
          <p>
            Stacking all three compounds the bleeding caution. Review interactions on the{' '}
            <Link href="/safety-checker" className="font-semibold text-emerald-700 hover:underline">safety checker</Link>{' '}
            and with a qualified clinician before combining.
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="card-premium p-6 space-y-4 max-w-4xl">
        <p className="eyebrow-label">FAQ</p>
        <h2 className="text-3xl font-semibold tracking-tight text-ink">Common Questions</h2>
        <div className="space-y-4 text-sm leading-7 text-[#46574d]">
          <div>
            <h3 className="text-lg font-semibold text-ink">Can I take curcumin and boswellia together?</h3>
            <p>
              Yes — because they hit different inflammatory pathways (COX-2/NF-κB vs 5-LOX), they are a common
              and rational pairing, and some products combine them. Add them one at a time so you can judge each
              one&apos;s effect, and review the combined bleeding caution if you take anticoagulants.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-ink">Why isn&apos;t plain turmeric powder enough?</h3>
            <p>
              Curcumin is poorly absorbed on its own. Most positive trials use bioavailability-enhanced forms
              (phytosome/Meriva, or curcumin paired with piperine). Culinary turmeric delivers far less curcumin
              than the studied doses, so it is unlikely to reproduce trial results.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-ink">Which one works fastest?</h3>
            <p>
              Boswellia tends to show the quickest subjective change (days to ~2 weeks), curcumin over 1–4 weeks,
              and omega-3 the slowest (weeks to months) because it works by shifting baseline lipid chemistry
              rather than acutely blocking an enzyme.
            </p>
          </div>
        </div>
      </section>

      <EnhancedEmailCapture
        headline="Inflammation &amp; Joint Support Guide"
        description="Download our evidence-first guide to curcumin absorption forms, AKBA-standardized boswellia, omega-3 dosing, and the bleeding-risk checklist for stacking them."
        benefit1="Pick a curcumin that actually absorbs: phytosome vs piperine"
        benefit2="Read a boswellia label: why AKBA standardization matters"
        benefit3="Anticoagulant and pre-surgery safety limits for all three"
        ctaLabel="Get the inflammation guide"
        location="compare-curcumin-boswellia-omega-3"
      />

      <RelatedDiscoveryWidget
        heading="Explore Pain & Inflammation Support"
        subheading="Dig deeper into mechanisms, dosage forms, and the full decision guides."
        items={[
          {
            type: 'compound',
            label: 'Compound',
            title: 'Curcumin',
            description: 'Broad NF-κB/COX-2 anti-inflammatory with the strongest human trial base — absorption is everything.',
            href: '/compounds/curcumin',
          },
          {
            type: 'compound',
            label: 'Compound',
            title: 'Boswellia',
            description: '5-LOX leukotriene inhibitor (AKBA). A different pathway and a natural stack partner for curcumin.',
            href: '/compounds/boswellia',
          },
          {
            type: 'compound',
            label: 'Compound',
            title: 'Omega-3 (EPA/DHA)',
            description: 'Foundational lipid-balance support that shifts baseline inflammation over weeks to months.',
            href: '/compounds/omega-3',
          },
          {
            type: 'guide',
            label: 'Guide',
            title: 'Pain Support Decisions',
            description: 'The full decision guide comparing pain options by mechanism, onset, and risk.',
            href: '/goals/pain',
          },
          {
            type: 'guide',
            label: 'Guide',
            title: 'Inflammation Support Decisions',
            description: 'Compare inflammation options by evidence grade, timing, and safety boundaries.',
            href: '/goals/inflammation',
          },
        ]}
      />

      <div className="space-y-3">
        <AffiliateDisclosure />
        <RecommendationSection
          title="Curcumin, Boswellia, and Omega-3 Product Picks"
          description="Affiliate recommended options selected by editorial standards. Review absorption form, AKBA standardization, and bleeding-risk warnings first."
          products={revenueProducts}
        />
      </div>
    </div>
  )
}
