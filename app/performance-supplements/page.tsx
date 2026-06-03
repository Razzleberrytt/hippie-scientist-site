import type { Metadata } from 'next'
import Link from 'next/link'
import AffiliateDisclosure from '@/components/AffiliateDisclosure'
import EmailCapture from '@/components/EmailCapture'
import RecommendationSection from '@/components/RecommendationSection'
import { getRevenueProductSet } from '@/config/revenue-products'

export const metadata: Metadata = {
  title: 'Best Supplements for Performance | The Hippie Scientist',
  description: 'Science-backed supplements for performance. Dosage, effects, and safety.',
  alternates: { canonical: '/goals/energy' },
  robots: {
    index: false,
    follow: true,
  },
}

const comparisons = [
  { href: '/compare/creatine-vs-beta-alanine', label: 'Creatine vs Beta-Alanine' },
  { href: '/compare/caffeine-vs-l-theanine', label: 'Caffeine vs L-Theanine' },
]

export default function Page() {
  const revenueProducts = ['creatine', 'taurine', 'l-theanine']
    .map(slug => getRevenueProductSet(slug))
    .filter((set): set is NonNullable<typeof set> => Boolean(set))
    .flatMap(set => set.products)

  return (
    <div className='container-page py-10 space-y-8'>
      <section className='hero-shell rounded-[2rem] border border-brand-900/10 p-6 shadow-card sm:p-8'>
        <p className='eyebrow-label'>Category</p>
        <h1 className='mt-2 text-3xl font-semibold text-ink sm:text-4xl'>Best Supplements for Performance</h1>
        <p className='mt-4 max-w-2xl text-muted'>Explore performance supplements for strength, endurance, and training output. This guide connects key compounds with a complete performance stack.</p>
        <div className='mt-6 flex flex-wrap gap-3'>
          <Link href='/goals/recovery' className='inline-flex min-h-11 items-center rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 shadow-sm'>Explore Performance Supplements</Link>
          <Link href='/stacks/performance' className='inline-flex min-h-11 items-center rounded-full border border-stone-200 bg-white/50 px-5 py-2.5 text-sm font-medium text-stone-700 transition hover:bg-stone-50 hover:text-stone-900'>View Performance Stack</Link>
        </div>
      </section>

      <EmailCapture
        headline='Get the performance supplement shortlist'
        description='Occasional notes on training-output evidence, stimulant tradeoffs, recovery context, and product-quality checks.'
        location='performance-supplements'
      />

      <div className='space-y-3'>
        <AffiliateDisclosure />
        <RecommendationSection
          title='Performance-support product picks'
          description='Affiliate recommendations for common performance-support compounds. Review safety, dose, stimulant load, and product quality before buying.'
          products={revenueProducts}
        />
      </div>

      <section className='card-premium p-6'>
        <h2 className='text-xl font-semibold text-ink'>Related Comparisons</h2>
        <div className='mt-4 flex flex-wrap gap-3'>
          {comparisons.map(link => (
            <Link key={link.href} href={link.href} className='rounded-xl border border-brand-900/10 px-3 py-2 text-sm text-emerald-700 hover:bg-stone-50/50 hover:border-brand-900/20 transition'>
              {link.label}
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}

