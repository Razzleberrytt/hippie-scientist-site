import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArticleLayout } from '@/components/articles'
import { getRevenueProductSet } from '@/config/revenue-products'
import RecommendationSection from '@/components/RecommendationSection'
import AffiliateDisclosure from '@/components/AffiliateDisclosure'
import EmailCapture from '@/components/EmailCapture'

export const metadata: Metadata = {
  title: 'Natural Alternatives to Anxiety Medication',
  description: 'Educational overview of supportive herbs and non-supplement routines for anxiety-related stress patterns.',
  alternates: { canonical: '/guides/anxiety/best-herbs-for-anxiety/' },
}

export default function Page() {
  const ashwagandhaProducts = getRevenueProductSet('ashwagandha')
  return (
    <ArticleLayout>
      <AffiliateDisclosure variant="compact" className="mb-6" />
      <section className="hero-shell rounded-[2rem] border border-brand-900/10 p-6 shadow-card sm:p-8">
        <p className="eyebrow-label">Educational only</p>
        <h1 className="mt-2 text-3xl font-semibold text-ink sm:text-4xl">Natural Alternatives to Anxiety Medication</h1>
        <p className="detail-reading mt-4 text-muted">This page does not recommend replacing prescribed treatment. It is a learning guide about supportive lifestyle and supplement options to discuss with a licensed clinician.</p>

        <figure className="mt-6">
          <div className="overflow-hidden rounded-2xl border border-brand-900/10 shadow-sm bg-white">
            <Image
              src="/images/guides/natural-alternatives-to-anxiety-medication.jpg"
              alt="Calming herbs and supplements considered as natural alternatives to anxiety medication"
              width={1536}
              height={1024}
              priority
              className="w-full h-auto"
            />
          </div>
          <figcaption className="mt-3 text-center text-sm text-muted">
            Natural options people consider alongside or instead of anxiety medication.
          </figcaption>
        </figure>
      </section>
      <section className="card-premium p-6 space-y-3">
        <h2 className="text-2xl font-semibold text-ink">Supportive options often discussed</h2>
        <ul className="list-disc pl-5 text-muted space-y-2">
          <li>Ashwagandha and lemon balm for stress-context calming support.</li>
          <li>Sleep consistency, morning light exposure, and caffeine timing.</li>
          <li>Structured therapy, breathwork, and exercise for longer-term resilience.</li>
        </ul>
      </section>
      {ashwagandhaProducts && (
        <RecommendationSection products={ashwagandhaProducts.products} />
      )}
      <EmailCapture location="guides-natural-alternatives-to-anxiety-medication" className="mt-6" />
      <div className="flex flex-wrap gap-4">
        <Link href="/guides/anxiety/best-herbs-for-anxiety" className="text-sm font-medium text-emerald-700 hover:underline">Top anxiety herbs</Link>
        <Link href="/guides/anxiety/natural-anxiolytics-beyond-ashwagandha" className="text-sm font-medium text-emerald-700 hover:underline">Natural anxiolytics cluster</Link>
      </div>
    </ArticleLayout>
  )
}
