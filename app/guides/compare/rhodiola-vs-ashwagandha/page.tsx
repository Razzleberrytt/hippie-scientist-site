import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { buildPageMetadata } from '../../../../src/lib/seo'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import CitationReadySummary from '@/components/seo/CitationReadySummary'
import AffiliateDisclosure from '../../../../components/AffiliateDisclosure'
import { EnhancedEmailCapture } from '@/components/monetization/EnhancedEmailCapture'
import { RelatedDiscoveryWidget } from '@/components/monetization/RelatedDiscoveryWidget'
import RecommendationSection from '@/components/RecommendationSection'
import { getRevenueProductSet } from '@/config/revenue-products'
import ConversionStickyCTA from '@/components/conversion-sticky-cta'
import References from '@/components/References'

export const metadata: Metadata = buildPageMetadata({
  title: 'Rhodiola vs Ashwagandha for Stress & Fatigue',
  description: 'Evidence-informed comparison of rhodiola and ashwagandha for stress resilience, fatigue, sleep-adjacent tradeoffs, and product selection.',
  path: '/guides/compare/rhodiola-vs-ashwagandha/',
  openGraphType: 'article',
})

const RHODIOLA_VS_ASHWAGANDHA_REFS = [
  { n: 1, text: 'Panossian A, Wikman G. (2010). Effects of adaptogens on the central nervous system. Pharmaceuticals, 3(1): 188-224.', url: 'https://pubmed.ncbi.nlm.nih.gov/27713248/' },
  { n: 2, text: 'Chandrasekhar K, et al. (2012). Ashwagandha root extract safety and efficacy in reducing stress. Indian J Psychol Med, 34(3): 255-262.', url: 'https://pubmed.ncbi.nlm.nih.gov/23439798/' },
  { n: 3, text: 'Olsson EM, et al. (2009). Rhodiola rosea for stress-related fatigue. Planta Med, 75(2): 105-112.', url: 'https://pubmed.ncbi.nlm.nih.gov/19016404/' },
  { n: 4, text: 'Ishaque S, et al. (2012). Rhodiola rosea for physical and mental fatigue. BMC Complement Altern Med, 12: 70.', url: 'https://pubmed.ncbi.nlm.nih.gov/22643043/' },
  { n: 5, text: 'Lopresti AL, et al. (2019). Ashwagandha for stress and anxiety. Medicine, 98(37): e17186.', url: 'https://pubmed.ncbi.nlm.nih.gov/31517876/' },
]

export default function RhodiolaVsAshwagandhaComparePage() {
  const revenueProducts = ['rhodiola', 'ashwagandha']
    .map((slug) => getRevenueProductSet(slug))
    .filter((set): set is NonNullable<typeof set> => Boolean(set))
    .flatMap((set) => set.products)

  return (
    <div className="container-page py-10 space-y-10">
      <AuthorityJsonLd
        title="Rhodiola vs Ashwagandha for Stress & Fatigue"
        description="Evidence-informed comparison of rhodiola and ashwagandha for stress resilience, fatigue, sleep-adjacent tradeoffs, and product selection.
      "
        url="https://thehippiescientist.net/guides/compare/rhodiola-vs-ashwagandha"
        type="Article"
      />

      <AuthorityBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Compare', href: '/guides/compare' },
          { label: 'Rhodiola vs Ashwagandha' },
        ]}
      />

      <section className="space-y-5 max-w-4xl">
        <p className="eyebrow-label">Educational Comparison</p>
        <h1 className="text-5xl font-bold tracking-tight text-ink">
          Rhodiola vs Ashwagandha: Which Fits Your Stress Pattern?
        </h1>
        <p className="text-lg leading-8 text-muted">
          Rhodiola is usually the better fit for fatigue-heavy, overextended days.
          Ashwagandha is usually the better fit for longer-running stress load and evening unwind support.
        </p>

        <figure className="mt-6">
          <div className="overflow-hidden rounded-2xl border border-brand-900/10 shadow-sm bg-white">
            <Image
              src="/images/guides/rhodiola-vs-ashwagandha.jpg"
              alt="Rhodiola root and flowers beside ashwagandha root and powder, two adaptogens"
              width={1536}
              height={1024}
              priority
              className="w-full h-auto"
            />
          </div>
          <figcaption className="mt-3 text-center text-sm text-muted">
            Rhodiola vs ashwagandha — stimulating vs calming adaptogens.
          </figcaption>
        </figure>
      </section>

      <CitationReadySummary
        answer="Rhodiola is usually the better fit for mental fatigue, overextended days, and daytime output. Ashwagandha is usually the better fit for ongoing stress load, evening wind-down, and calming an overstimulated nervous system."
        bestFor={[
          'Rhodiola: mental fatigue, burnout-adjacent exhaustion, and stress resilience without sedation.',
          'Ashwagandha: steady stress support, evening settling, and situations where calm matters more than activation.',
          'Together: rhodiola in the morning for output, ashwagandha at night for wind-down — a common, well-tolerated pairing.',
        ]}
        evidenceLevel="Human trials support rhodiola for stress-related fatigue and ashwagandha for perceived stress and anxiety, though effect sizes are modest and study quality varies."
        safetyNote="Rhodiola can feel overstimulating for some people and is best avoided late in the day. Ashwagandha may affect thyroid hormone levels and should be reviewed with a clinician during pregnancy or with thyroid or autoimmune conditions."
        notClaiming="This page is not claiming rhodiola or ashwagandha treats clinical burnout, generalized anxiety disorder, or diagnosed thyroid conditions."
        referencesHref="#references"
      />

      <AffiliateDisclosure />

      <section className="grid gap-6 lg:grid-cols-2">
        <article className="card-premium p-6 space-y-4">
          <p className="eyebrow-label">Fatigue-forward</p>
          <h2 className="text-3xl font-semibold tracking-tight text-ink">Rhodiola</h2>
          <p className="text-sm leading-7 text-muted">
            Better for mental fatigue, stress resilience, and daytime output when you do not want a sedating option.
          </p>
          <Link href="/herbs/rhodiola/" className="chip-readable text-xs font-bold">Explore Rhodiola →</Link>
        </article>

        <article className="card-premium p-6 space-y-4">
          <p className="eyebrow-label">Stress-load forward</p>
          <h2 className="text-3xl font-semibold tracking-tight text-ink">Ashwagandha</h2>
          <p className="text-sm leading-7 text-muted">
            Better for steady stress support, evening settling, and routines where calm matters more than activation.
          </p>
          <Link href="/herbs/ashwagandha/" className="chip-readable text-xs font-bold">Explore Ashwagandha →</Link>
        </article>
      </section>

      <section className="space-y-6">
        <EnhancedEmailCapture
          headline="Get the comparison notes"
          description="Save the tradeoffs, dosing reminders, and safety checks before you buy."
        />

        {revenueProducts.length > 0 ? (
          <RecommendationSection
            title="If you choose either path"
            products={revenueProducts}
          />
        ) : null}
      </section>

      <RelatedDiscoveryWidget
        heading="Continue comparing"
        subheading="Move from this pair into related stress and focus decisions."
        items={[
          {
            href: '/guides/compare/ashwagandha-vs-l-theanine-vs-magnesium',
            label: 'Stress comparison',
            title: 'Ashwagandha vs L-Theanine vs Magnesium',
            description: 'A three-way stress comparison that splits calming, timing, and muscle-relaxation roles.',
            type: 'comparison',
          },
          {
            href: '/guides/compare/caffeine-vs-l-theanine-vs-bacopa-for-focus',
            label: 'Focus comparison',
            title: 'Caffeine vs L-Theanine vs Bacopa',
            description: 'A focus comparison that separates acute stimulation from calm concentration and long-term memory support.',
            type: 'comparison',
          },
        ]}
      />
      <ConversionStickyCTA
        brand={revenueProducts[0]?.brand}
        name={revenueProducts[0]?.title}
        href={revenueProducts[0]?.affiliateUrl || '#'}
      />

      <section className="card-premium p-6 space-y-4 max-w-4xl mb-8">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">How to choose</h2>
        <p className="text-sm leading-7 text-muted">Ask yourself: am I wired or tired? If you feel anxious, overstimulated, and cannot wind down at night — ashwagandha (calming). If you feel exhausted, unmotivated, and burned out — rhodiola (stimulating). If both: ashwagandha at night, rhodiola in the morning — this is a common and well-tolerated stack. Start with one for 2-4 weeks before adding the other. Do not expect acute effects — adaptogens work cumulatively. If you feel nothing after 4 weeks, the adaptogen is likely not a fit for your stress pattern.</p>
        <div className="flex flex-wrap gap-3">
          <Link href="/info/dosing/" className="chip-readable text-xs font-bold">Review dosing basics</Link>
          <Link href="/safety-checker/" className="chip-readable text-xs font-bold">Check safety context</Link>
        </div>
      </section>

      <References refs={RHODIOLA_VS_ASHWAGANDHA_REFS} />
    </div>
  )
}
