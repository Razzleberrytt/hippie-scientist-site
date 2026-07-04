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
      />

      <AuthorityBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Compare', href: '/compare' },
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
          When to choose which
        </h2>

        <p className="text-sm leading-7 text-muted">
          Choose melatonin for sleep-onset issues and jet lag. Choose magnesium for sleep maintenance, restless legs, and long-term nightly use. Both can be taken together with staggered timing.
        </p>

        <div className="flex flex-wrap gap-3">
          <Link href="/guides/sleep/" className="chip-readable">
            Sleep Goal Hub
          </Link>
          <Link href="/guides/compare/" className="chip-readable">
            All Comparisons
          </Link>
        </div>
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
      <References refs={MELATONIN_VS_MAGNESIUM_REFS} />
    </div>
  )
}
