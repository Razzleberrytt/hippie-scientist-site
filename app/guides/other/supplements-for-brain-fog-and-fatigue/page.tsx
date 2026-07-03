import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArticleLayout } from '@/components/articles'
import { getRevenueProductSet } from '@/config/revenue-products'
import RecommendationSection from '@/components/RecommendationSection'
import AffiliateDisclosure from '@/components/AffiliateDisclosure'
import EmailCapture from '@/components/EmailCapture'
import References from '@/components/References'

export const metadata: Metadata = {
  title: 'Supplements for Brain Fog and Fatigue',
  description: 'A practical guide to supplements commonly discussed for brain fog, low energy, fatigue, and focus support.',
  alternates: { canonical: '/guides/other/supplements-for-brain-fog-and-fatigue/' },
}

const SUPPLEMENTS_FOR_BRAIN_FOG_AND_FATIGUE_REFS = [
  { n: 1, text: 'Kennedy DO. (2016). B vitamins and the brain: mechanisms, dose and efficacy. Nutrients, 8(2): 68.', url: 'https://pubmed.ncbi.nlm.nih.gov/26828517/' },
  { n: 2, text: 'Pase MP, et al. (2012). Bacopa monnieri cognitive effects review. J Altern Complement Med, 18(7): 647-652.', url: 'https://pubmed.ncbi.nlm.nih.gov/22747190/' },
  { n: 3, text: 'Nehlig A. (2010). Is caffeine a cognitive enhancer? J Alzheimers Dis, 20(S1): S85-S94.', url: 'https://pubmed.ncbi.nlm.nih.gov/20182035/' },
]

export default function Page() {
  const lionsManeProducts = getRevenueProductSet('lions-mane')
  return (
    <ArticleLayout>
      <AffiliateDisclosure variant="compact" className="mb-6" />
      <section className='hero-shell rounded-[2rem] border border-brand-900/10 p-6 shadow-card sm:p-8'>
        <p className='eyebrow-label'>Guide</p>
        <h1 className='mt-2 text-3xl font-semibold text-ink sm:text-4xl'>Supplements for Brain Fog and Fatigue</h1>
        <p className='mt-4 text-muted'>Brain fog and fatigue can overlap with poor sleep, stress, low energy availability, or inconsistent focus. This guide points you toward research pages, not medical advice.</p>

        <figure className="mt-6">
          <div className="overflow-hidden rounded-2xl border border-brand-900/10 shadow-sm bg-white">
            <Image
              src="/images/guides/supplements-for-brain-fog-and-fatigue.jpg"
              alt="Nootropic and B-vitamin supplements with green tea and lion's mane for brain fog and fatigue"
              width={1536}
              height={1024}
              priority
              className="w-full h-auto"
            />
          </div>
          <figcaption className="mt-3 text-center text-sm text-muted">
            Supplements that may help lift brain fog and fatigue.
          </figcaption>
        </figure>
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
      <References refs={SUPPLEMENTS_FOR_BRAIN_FOG_AND_FATIGUE_REFS} />
        <RecommendationSection products={lionsManeProducts.products} />
      )}
      <EmailCapture location="guides-supplements-for-brain-fog-and-fatigue" className="mt-6" />

      <section className='card-premium p-6'>
        <h2 className='text-xl font-semibold text-ink'>Where to go next</h2>
        <div className='mt-4 flex flex-wrap gap-4'>
          <Link href='/guides/other/supplements-for-brain-fog-and-fatigue' className='text-sm font-medium text-emerald-700 hover:underline'>Best supplements for brain fog</Link>
          <Link href='/guides/other/supplements-for-brain-fog-and-fatigue' className='text-sm font-medium text-emerald-700 hover:underline'>Best supplements for fatigue</Link>
          <Link href='/guides/focus/best-nootropics-for-focus' className='text-sm font-medium text-emerald-700 hover:underline'>Creatine vs caffeine</Link>
        </div>
      </section>
    </ArticleLayout>
  )
}

