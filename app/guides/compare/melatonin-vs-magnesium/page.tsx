import type { Metadata } from 'next'
import Image from 'next/image'
import { buildPageMetadata } from '../../../../src/lib/seo'

export const metadata: Metadata = buildPageMetadata({
  title: 'Melatonin vs Magnesium for Sleep: Which Works Better?',
  description: 'Melatonin vs magnesium for sleep — which works better, which is safer long-term, and how to take them together. Evidence-based comparison.',
  path: '/guides/compare/melatonin-vs-magnesium/',
})

import Link from 'next/link'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import CitationReadySummary from '@/components/seo/CitationReadySummary'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import RecommendationSection from '@/components/RecommendationSection'
import AffiliateDisclosure from '../../../../components/AffiliateDisclosure'
import { getRevenueProductSet } from '@/config/revenue-products'
import ConversionStickyCTA from '@/components/conversion-sticky-cta'
import References from '@/components/References'

const MELATONIN_VS_MAGNESIUM_REFS = [
  { n: 1, text: 'Ferracioli-Oda E, et al. (2013). Meta-analysis: melatonin for primary sleep disorders. PLoS ONE, 8(5): e63773.', url: 'https://pubmed.ncbi.nlm.nih.gov/23691095/' },
  { n: 2, text: 'Abbasi B, et al. (2012). Magnesium supplementation and primary insomnia. J Res Med Sci, 17(12): 1161-1169.', url: 'https://pubmed.ncbi.nlm.nih.gov/23853635/' },
  { n: 3, text: 'Brzezinski A, et al. (2005). Effects of exogenous melatonin on sleep: meta-analysis. Sleep Med Rev, 9(1): 41-50.', url: 'https://pubmed.ncbi.nlm.nih.gov/15649737/' },
  { n: 4, text: 'Nielsen FH, et al. (2010). Magnesium supplementation improves sleep in elderly. Magnes Res, 23(4): 158-168.', url: 'https://pubmed.ncbi.nlm.nih.gov/21199787/' },
  { n: 5, text: 'Rondanelli M, et al. (2011). Melatonin, magnesium, and zinc in primary insomnia. J Am Geriatr Soc, 59(1): 82-90.', url: 'https://pubmed.ncbi.nlm.nih.gov/21226679/' },
]

const citationUrls = MELATONIN_VS_MAGNESIUM_REFS.map((ref) => ref.url).filter(Boolean)

export default function MelatoninVsMagnesiumPage() {
  const revenueProducts = ['melatonin', 'magnesium']
    .map((slug) => getRevenueProductSet(slug))
    .filter((set): set is NonNullable<typeof set> => Boolean(set))
    .flatMap((set) => set.products)

  return (
    <div className="container-page py-10 space-y-10">
      <AuthorityJsonLd
        title="Melatonin vs Magnesium for Sleep: Which Works Better?"
        description="Melatonin vs Magnesium for sleep — which works better, which is safer long-term, and how to take them together. Evidence-based comparison with dosing and timing guide.
      "
        url="https://thehippiescientist.net/guides/compare/melatonin-vs-magnesium"
        type="Article"
        breadcrumbs={[
          { name: 'Home', url: 'https://thehippiescientist.net/' },
          { name: 'Compare', url: 'https://thehippiescientist.net/guides/compare/' },
          { name: 'Melatonin vs Magnesium', url: 'https://thehippiescientist.net/guides/compare/melatonin-vs-magnesium/' },
        ]}
        citationUrls={citationUrls}
      />

      <AuthorityBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Compare', href: '/guides/compare/' },
          { label: 'Melatonin vs Magnesium' },
        ]}
      />

      <section className="space-y-4 max-w-4xl">
        <p className="eyebrow-label">Evidence-Based Comparison · Sleep</p>

        <h1 className="text-4xl font-bold tracking-tight text-ink">
          Melatonin vs Magnesium for Sleep: Which Works Better?
        </h1>

        <p className="text-lg leading-8 text-muted">
          Melatonin and magnesium are two of the most commonly used sleep supplements, but they work through completely different mechanisms. This guide compares the evidence, practical dosing, and safety trade-offs.
        </p>

        <figure className="mt-6">
          <div className="overflow-hidden rounded-2xl border border-brand-900/10 shadow-sm bg-white">
            <Image
              src="/images/guides/compare-melatonin-vs-magnesium.jpg"
              alt="Melatonin tablets beside magnesium capsules and powder for sleep"
              width={1536}
              height={1024}
              priority
              className="w-full h-auto"
            />
          </div>
          <figcaption className="mt-3 text-center text-sm text-muted">
            Melatonin vs magnesium — timing vs relaxation for sleep.
          </figcaption>
        </figure>
      </section>

      <CitationReadySummary
        answer="Melatonin is usually the better fit when the main problem is falling asleep late, jet lag, or a shifted circadian rhythm. Magnesium glycinate is usually the better first choice when the problem is tension, restless legs, stress-related sleep quality, or waking during the night."
        bestFor={[
          'Melatonin: short-term sleep timing support, travel, jet lag, or delayed sleep onset.',
          'Magnesium glycinate: longer-term relaxation support, muscle tension, restless legs, and sleep maintenance.',
          'Together: reasonable for some adults when doses stay low and timing is staggered.',
        ]}
        evidenceLevel="Melatonin has stronger meta-analysis evidence for sleep-onset timing; magnesium evidence is smaller but practically relevant for older adults, deficiency risk, and relaxation-related sleep problems."
        safetyNote="Avoid high-dose melatonin by default. Review magnesium form, kidney disease, sedatives, pregnancy, and medication context before combining sleep supplements."
        notClaiming="This page is not claiming either supplement treats insomnia, replaces sleep disorder care, or works better than behavioral sleep changes."
        referencesHref="#references"
      />

      <section className="grid gap-6 md:grid-cols-2">
        <div className="card-premium p-6 space-y-4">
          <h2 className="text-2xl font-semibold">Melatonin</h2>
          <p className="text-sm leading-7 text-muted">
            Melatonin helps you fall asleep faster. Best for short-term use, jet lag, and circadian rhythm shifts. Typical dose: 0.5-5 mg, 30 min before bed.
          </p>
          <Link href="/compounds/melatonin" className="chip-readable">
            Explore Melatonin
          </Link>
        </div>

        <div className="card-premium p-6 space-y-4">
          <h2 className="text-2xl font-semibold">Magnesium (Glycinate)</h2>
          <p className="text-sm leading-7 text-muted">
            Magnesium glycinate helps you stay asleep and supports deeper rest. Safer for long-term nightly use. Typical dose: 200-400 mg, 1-2 hours before bed.
          </p>
          <Link href="/compounds/magnesium-glycinate" className="chip-readable">
            Explore Magnesium
          </Link>
        </div>
      </section>

      <section className="surface-subtle rounded-3xl p-6 space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">
          Melatonin vs magnesium: quick answer
        </h2>

        <p className="text-sm leading-7 text-muted">
          Choose melatonin for sleep-onset issues and jet lag. Choose magnesium for sleep maintenance, restless legs, and long-term nightly use. Both can be taken together with staggered timing.
        </p>

        <div className="flex flex-wrap gap-3">
          <Link href="/guides/sleep/" className="chip-readable">
            Sleep Goal Hub
          </Link>
          <Link href="/safety-checker/" className="chip-readable">
            Safety Checker
          </Link>
          <Link href="/info/dosing/" className="chip-readable">
            Dosing Guide
          </Link>
          <Link href="/guides/compare/" className="chip-readable">
            All Comparisons
          </Link>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2">
        <article className="card-premium p-6 space-y-3">
          <h2 className="text-xl font-semibold tracking-tight text-ink">
            Magnesium glycinate vs melatonin: the core difference
          </h2>
          <p className="text-sm leading-7 text-muted">
            Magnesium glycinate supports relaxation physiology and muscle comfort; melatonin is a timing signal. If your body feels tense but your schedule is normal, compare magnesium first. If your sleep clock is shifted, compare low-dose melatonin first.
          </p>
          <div className="flex flex-wrap gap-2">
            <Link href="/compounds/magnesium-glycinate/" className="chip-readable">Magnesium glycinate</Link>
            <Link href="/compounds/melatonin/" className="chip-readable">Melatonin</Link>
          </div>
        </article>

        <article className="card-premium p-6 space-y-3">
          <h2 className="text-xl font-semibold tracking-tight text-ink">
            Can you take magnesium and melatonin together?
          </h2>
          <p className="text-sm leading-7 text-muted">
            Many adults tolerate the combination, but the safer experiment is staggered and low-dose: magnesium earlier in the evening, then 0.3-1 mg melatonin only if sleep onset remains the bottleneck. Check medication and pregnancy context first.
          </p>
          <Link href="/info/dosing/" className="chip-readable">Review dosing basics</Link>
        </article>

        <article className="card-premium p-6 space-y-3">
          <h2 className="text-xl font-semibold tracking-tight text-ink">
            Side effects: melatonin vs magnesium
          </h2>
          <p className="text-sm leading-7 text-muted">
            Melatonin is more likely to cause next-day grogginess, vivid dreams, or timing mismatch when the dose is too high. Magnesium is more likely to cause loose stools depending on the form and dose; kidney disease changes the safety calculation.
          </p>
          <Link href="/safety-checker/" className="chip-readable">Check safety context</Link>
        </article>

        <article className="card-premium p-6 space-y-3">
          <h2 className="text-xl font-semibold tracking-tight text-ink">
            Which is better for staying asleep?
          </h2>
          <p className="text-sm leading-7 text-muted">
            Magnesium is usually the better first comparison for staying asleep because it maps to relaxation, muscle tension, and nighttime restlessness. Melatonin can help timing, but more melatonin does not reliably mean deeper or longer sleep.
          </p>
          <Link href="/guides/sleep/" className="chip-readable">Explore sleep guides</Link>
        </article>
      </section>

      <AffiliateDisclosure />
      <RecommendationSection
        title="Melatonin &amp; Magnesium Product Picks"
        description="Editor-recommended options for clean, third-party tested melatonin and magnesium formulations."
        products={revenueProducts}
      />
      <ConversionStickyCTA
        brand={revenueProducts[0]?.brand}
        name={revenueProducts[0]?.title}
        href={revenueProducts[0]?.affiliateUrl || '#'}
      />

      <section className="card-premium p-6 space-y-4 max-w-4xl mb-8"><h2 className="text-2xl font-semibold tracking-tight text-ink">Practical recommendation</h2><p className="text-sm leading-7 text-muted">For most people with sleep issues, start with magnesium glycinate (200-400 mg before bed) for one week before adding anything else. Magnesium addresses the most common sleep disruptors — muscle tension, restless legs, and stress-related poor sleep quality. If sleep onset specifically is the problem after one week of magnesium, add low-dose melatonin (0.3-1 mg, not 3-10 mg) 1-2 hours before bed. The combination of magnesium + low-dose melatonin is well-tolerated and addresses both sleep quality and sleep timing. If you wake up groggy, reduce the melatonin dose — the dose-response curve is flat and more is not better. Avoid high-dose melatonin (5-10 mg) which produces supraphysiological levels and next-day impairment.</p></section>

      <References refs={MELATONIN_VS_MAGNESIUM_REFS} />
    </div>
  )
}
