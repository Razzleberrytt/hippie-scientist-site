import type { Metadata } from 'next'
import Link from 'next/link'
import { ArticleLayout } from '@/components/articles'
import { getRevenueProductSet } from '@/config/revenue-products'
import RecommendationSection from '@/components/RecommendationSection'
import AffiliateDisclosure from '@/components/AffiliateDisclosure'
import EmailCapture from '@/components/EmailCapture'

export const metadata: Metadata = {
  title: 'Supplements for Brain Fog and Fatigue',
  description: 'A practical guide to supplements commonly discussed for brain fog, low energy, fatigue, and focus support.',
  alternates: { canonical: '/guides/supplements-for-brain-fog-and-fatigue/' },
}

export default function Page() {
  const lionsManeProducts = getRevenueProductSet('lions-mane')
  return (
    <ArticleLayout>
      <AffiliateDisclosure variant="compact" className="mb-6" />
      <section className='hero-shell rounded-[2rem] border border-brand-900/10 p-6 shadow-card sm:p-8'>
        <p className='eyebrow-label'>Guide</p>
        <h1 className='mt-2 text-3xl font-semibold text-ink sm:text-4xl'>Supplements for Brain Fog and Fatigue</h1>
        <p className='mt-4 text-muted'>Brain fog and fatigue can overlap with poor sleep, stress, low energy availability, or inconsistent focus. This guide points you toward research pages, not medical advice.</p>
      </section>

      <section className='card-premium p-6'>
        <h2 className='text-xl font-semibold text-ink'>Fast answer</h2>
        <ul className='mt-4 list-disc space-y-2 pl-5 text-muted'>
          <li><strong className='text-ink'>Creatine</strong> is commonly discussed for energy metabolism and performance context.</li>
          <li><strong className='text-ink'>Rhodiola</strong> is often framed around stress-linked fatigue.</li>
          <li><strong className='text-ink'>Caffeine + L-theanine</strong> is a popular focus stack when stimulation needs smoothing.</li>
        </ul>
      </section>

      {lionsManeProducts && (
        <RecommendationSection products={lionsManeProducts.products} />
      )}
      <EmailCapture location="guides-supplements-for-brain-fog-and-fatigue" className="mt-6" />

      <section className='card-premium p-6'>
        <h2 className='text-xl font-semibold text-ink'>Where to go next</h2>
        <div className='mt-4 flex flex-wrap gap-4'>
          <Link href='/guides/supplements-for-brain-fog-and-fatigue' className='text-sm font-medium text-emerald-700 hover:underline'>Best supplements for brain fog</Link>
          <Link href='/guides/supplements-for-brain-fog-and-fatigue' className='text-sm font-medium text-emerald-700 hover:underline'>Best supplements for fatigue</Link>
          <Link href='/compare/creatine-vs-caffeine' className='text-sm font-medium text-emerald-700 hover:underline'>Creatine vs caffeine</Link>
        </div>
      </section>
    </ArticleLayout>
  )
}

