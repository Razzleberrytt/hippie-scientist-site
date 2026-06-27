import Link from 'next/link'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import AffiliateDisclosure from '@/components/AffiliateDisclosure'
import { EnhancedEmailCapture } from '@/components/monetization/EnhancedEmailCapture'
import { RelatedDiscoveryWidget } from '@/components/monetization/RelatedDiscoveryWidget'
import RecommendationSection from '@/components/RecommendationSection'
import { getRevenueProductSet } from '@/config/revenue-products'

export default function AshwagandhaVsRhodiolaForStressPage() {
  const revenueProducts = ['ashwagandha', 'rhodiola']
    .map(slug => getRevenueProductSet(slug))
    .filter((set): set is NonNullable<typeof set> => Boolean(set))
    .flatMap(set => set.products)

  return (
    <div className="container-page py-10 space-y-10">
      <AuthorityJsonLd
        title="Ashwagandha vs Rhodiola for Stress"
        description="Evidence-informed comparison of ashwagandha and rhodiola for stress patterns, fatigue, calm support, safety, and supplement selection."
        url="https://thehippiescientist.net/compare/ashwagandha-vs-rhodiola-for-stress"
        type="Article"
      />

      <AuthorityBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Compare', href: '/compare' },
          { label: 'Ashwagandha vs Rhodiola for Stress' },
        ]}
      />

      <section className="space-y-5 max-w-4xl">
        <p className="eyebrow-label">Educational Comparison</p>
        <h1 className="text-5xl font-bold tracking-tight text-ink">
          Ashwagandha vs Rhodiola for Stress: Which Adaptogen Fits Your Situation?
        </h1>
        <p className="text-lg leading-8 text-[#46574d]">
          Ashwagandha usually fits tense, wired, sleep-disrupting stress. Rhodiola usually fits stress that feels more like fatigue, burnout, and low stamina. Neither herb should be treated as a replacement for medical care.
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="card-premium p-6 space-y-4">
          <p className="eyebrow-label">Calming Adaptogen</p>
          <h2 className="text-3xl font-semibold tracking-tight text-ink">Ashwagandha</h2>
          <p className="text-sm leading-7 text-[#46574d]">
            Better suited for stress patterns involving tension, evening rumination, and sleep-adjacent stress. It has strong commercial demand, but it also carries meaningful safety caveats.
          </p>
          <Link href="/herbs/ashwagandha" className="chip-readable">Explore Ashwagandha</Link>
        </div>

        <div className="card-premium p-6 space-y-4">
          <p className="eyebrow-label">Anti-Fatigue Adaptogen</p>
          <h2 className="text-3xl font-semibold tracking-tight text-ink">Rhodiola</h2>
          <p className="text-sm leading-7 text-[#46574d]">
            Better suited for fatigue-heavy stress, cognitive burnout, and low resilience. It is often positioned as more energizing, so late-day use may not fit everyone.
          </p>
          <Link href="/herbs/rhodiola" className="chip-readable">Explore Rhodiola</Link>
        </div>
      </section>

      <section className="card-premium p-6 space-y-5 max-w-5xl">
        <p className="eyebrow-label">Fast Decision</p>
        <h2 className="text-3xl font-semibold tracking-tight text-ink">Which one makes more sense?</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-ink">
              <tr className="border-b border-black/10">
                <th className="py-3 pr-4 font-semibold">Factor</th>
                <th className="py-3 pr-4 font-semibold">Ashwagandha</th>
                <th className="py-3 pr-4 font-semibold">Rhodiola</th>
              </tr>
            </thead>
            <tbody className="text-[#46574d]">
              <tr className="border-b border-black/10"><td className="py-3 pr-4 font-medium text-ink">Best fit</td><td className="py-3 pr-4">Tense stress, calm support, sleep-linked stress</td><td className="py-3 pr-4">Fatigue, burnout, low stamina</td></tr>
              <tr className="border-b border-black/10"><td className="py-3 pr-4 font-medium text-ink">Feel</td><td className="py-3 pr-4">More calming</td><td className="py-3 pr-4">More activating</td></tr>
              <tr className="border-b border-black/10"><td className="py-3 pr-4 font-medium text-ink">Main caution</td><td className="py-3 pr-4">Pregnancy, thyroid, liver, autoimmune, sedative concerns</td><td className="py-3 pr-4">Insomnia, stimulation, bipolar-spectrum caution</td></tr>
              <tr><td className="py-3 pr-4 font-medium text-ink">Bottom line</td><td className="py-3 pr-4">Better for wired stress</td><td className="py-3 pr-4">Better for tired stress</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="card-premium p-6 space-y-3"><p className="eyebrow-label">Stress Pattern</p><h2 className="text-2xl font-semibold tracking-tight text-ink">Wired vs tired</h2><p className="text-sm leading-7 text-[#46574d]">The better choice depends less on which herb is more popular and more on whether the stress pattern is overactivated or depleted.</p></div>
        <div className="card-premium p-6 space-y-3"><p className="eyebrow-label">Product Filter</p><h2 className="text-2xl font-semibold tracking-tight text-ink">Look for standardization</h2><p className="text-sm leading-7 text-[#46574d]">For either herb, prefer transparent extract standardization, clear plant part labeling, and third-party testing where available.</p></div>
        <div className="card-premium p-6 space-y-3"><p className="eyebrow-label">Safety</p><h2 className="text-2xl font-semibold tracking-tight text-ink">Do not ignore cautions</h2><p className="text-sm leading-7 text-[#46574d]">Pregnancy, psychiatric medication, thyroid concerns, liver history, autoimmune disease, or bipolar-spectrum conditions deserve clinician review before use.</p></div>
      </section>

      <section className="card-premium p-6 space-y-4 max-w-4xl">
        <p className="eyebrow-label">FAQ</p>
        <h2 className="text-3xl font-semibold tracking-tight text-ink">Common questions</h2>
        <div className="space-y-4 text-sm leading-7 text-[#46574d]">
          <div><h3 className="text-lg font-semibold text-ink">Is ashwagandha or rhodiola better for stress?</h3><p>Ashwagandha usually fits tense, sleep-disrupting stress. Rhodiola usually fits fatigue-heavy stress and burnout.</p></div>
          <div><h3 className="text-lg font-semibold text-ink">Can you take ashwagandha and rhodiola together?</h3><p>Some products combine adaptogens, but combining them can make effects and side effects harder to judge. Start conservatively and review medication or health concerns first.</p></div>
          <div><h3 className="text-lg font-semibold text-ink">Which one is better for fatigue?</h3><p>Rhodiola is usually the more fatigue-oriented option. Ashwagandha is usually more calming and sleep-adjacent.</p></div>
        </div>
      </section>

      <EnhancedEmailCapture
        headline='Adaptogen comparison + stress-pattern matching'
        description='Get curated ashwagandha vs rhodiola insights, personalized stress-pattern frameworks, and safety context delivered to your inbox.'
        benefit1='Wired vs tired: identify your stress pattern and pick the right adaptogen'
        benefit2='Safety deep-dive: pregnancy, thyroid, medication, and autoimmune considerations'
        benefit3='Product quality checks: standardization, plant part, and third-party testing guidance'
        ctaLabel='Join the list'
        location='compare-ashwagandha-vs-rhodiola-for-stress'
      />

      <RelatedDiscoveryWidget
        heading='Explore stress-support depth'
        subheading='Dig deeper into adaptogen stacking, stress patterns, and evidence for both herbs.'
        items={[
          {
            type: 'herb',
            label: 'Herb',
            title: 'Ashwagandha',
            description: 'Calming adaptogen for tense, wired stress. Strong evidence for cortisol and anxiety, with meaningful safety caveats.',
            href: '/herbs/ashwagandha',
          },
          {
            type: 'herb',
            label: 'Herb',
            title: 'Rhodiola',
            description: 'Energizing adaptogen for fatigue-linked stress. Evidence for resilience, cognition, and burnout recovery.',
            href: '/herbs/rhodiola',
          },
          {
            type: 'guide',
            label: 'Guide',
            title: 'Stress Patterns',
            description: 'Map your stress as tension, fatigue, rumination, or shutdown to match the right herb and support.',
            href: '/goals/stress',
          },
          {
            type: 'protocol',
            label: 'Protocol',
            title: 'Adaptogen Stack',
            description: 'When and how to safely combine ashwagandha, rhodiola, and other adaptogens for synergy.',
            href: '/guides/best-adaptogens-for-stress',
          },
          {
            type: 'guide',
            label: 'Guide',
            title: 'Sleep Spillover',
            description: 'How stress disrupts sleep and which adaptogen supports sleep recovery without overstimulation.',
            href: '/guides/best-supplements-for-sleep',
          },
          {
            type: 'guide',
            label: 'Guide',
            title: 'Burnout Recovery',
            description: 'When fatigue dominates stress: recognizing burnout and choosing herbs that rebuild resilience.',
            href: '/guides/burnout-recovery',
          },
        ]}
      />

      <div className="space-y-3">
        <AffiliateDisclosure />
        <RecommendationSection
          title="Ashwagandha and rhodiola product picks"
          description="Affiliate recommendations for this comparison. Review safety, dose, timing, and product quality before buying."
          products={revenueProducts}
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <Link href="/compare/rhodiola-vs-ashwagandha" className="chip-readable">Rhodiola vs Ashwagandha</Link>
        <Link href="/guides/stress-regulation" className="chip-readable">Stress Regulation</Link>
        <Link href="/education/what-are-adaptogens" className="chip-readable">Adaptogens</Link>
      </div>
    </div>
  )
}
