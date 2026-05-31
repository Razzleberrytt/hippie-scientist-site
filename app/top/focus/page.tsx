import type { Metadata } from 'next'
import Link from 'next/link'
import { getCompounds } from '@/lib/runtime-data'
import { buildAmazonSearchUrl } from '@/lib/affiliate'
import { cleanSummary } from '@/lib/display-utils'
import AffiliateDisclosure from '@/components/AffiliateDisclosure'
import EmailCapture from '@/components/EmailCapture'
import RecommendationSection from '@/components/RecommendationSection'
import { getRevenueProductSet } from '@/config/revenue-products'

type CompoundRecord = {
  slug: string
  name?: string | null
  displayName?: string | null
  summary?: string | null
  description?: string | null
  net_score?: number | string | null
}

const text = (v: unknown): string =>
  typeof v === 'string' ? v.trim() : v ? String(v).trim() : ''

const titleFor = (c: CompoundRecord): string =>
  text(c.displayName) || text(c.name) || c.slug

const scoreFor = (c: CompoundRecord): number => {
  const raw = c.net_score
  if (typeof raw === 'number') return raw
  if (typeof raw === 'string') return parseFloat(raw) || 0
  return 0
}

export const metadata: Metadata = {
  title: 'Best Supplements for Focus & Cognitive Performance (2026)',
  description:
    'Compare top supplements for focus, memory, and cognitive performance. Ranked using evidence, mechanisms, and real-world use.',
  alternates: { canonical: '/top/focus' },
}

export default async function FocusPage() {
  const compounds = (await getCompounds()) as CompoundRecord[]
  const ranked = compounds.sort((a, b) => scoreFor(b) - scoreFor(a)).slice(0, 12)
  const revenueProducts = ['l-theanine', 'lions-mane']
    .map(slug => getRevenueProductSet(slug))
    .filter((set): set is NonNullable<typeof set> => Boolean(set))
    .flatMap(set => set.products)

  return (
    <main className='container-page py-10 space-y-8'>
      <section className='hero-shell rounded-[2rem] border border-brand-900/10 p-6 shadow-card sm:p-8'>
        <p className='eyebrow-label'>Focus guide</p>
        <h1 className='mt-2 text-3xl font-semibold text-ink sm:text-4xl'>Best Supplements for Focus</h1>
        <p className='mt-4 text-muted'>
          These supplements are often discussed for focus, memory, and cognitive performance. Rankings are based on dataset signals and research context.
        </p>
        <p className='mt-3 text-sm text-muted'>
          For beginners: separate short-term alertness tools from longer-horizon support. A useful stack decision is often about tradeoffs (speed vs steadiness), not just “strongest” effect.
        </p>
      </section>

      <section className='card-premium p-6'>
        <h2 className='text-xl font-semibold text-ink'>How to use this ranking responsibly</h2>
        <p className='mt-3 text-sm leading-6 text-muted'>
          This page is an educational comparison starting point. Ranking position reflects dataset signals, not a guarantee that one option will work best for you.
        </p>
        <ul className='mt-3 space-y-2 text-sm leading-6 text-muted'>
          <li>Evidence quality and study design vary by herb or compound.</li>
          <li>Safety context matters: medications, health conditions, and pregnancy or nursing status can change fit.</li>
          <li>Individual response varies, so use full profiles and clinical guidance before decisions.</li>
        </ul>
      </section>

      <section className='card-premium p-6'>
        <h2 className='text-xl font-semibold text-ink'>What supplements improve focus?</h2>
        <p className='mt-3 text-sm text-muted'>
          Popular focus supplements include compounds that influence neurotransmitters, energy metabolism, and stress response — such as caffeine, L-theanine, creatine, and others found in the dataset.
        </p>
        <div className='mt-4 flex flex-wrap gap-4'>
          <Link href='/compare/creatine-vs-caffeine' className='text-sm font-medium text-emerald-700 hover:underline'>Creatine vs caffeine</Link>
          <Link href='/top/stress' className='text-sm font-medium text-emerald-700 hover:underline'>Best herbs for stress</Link>
          <Link href='/top/sleep' className='text-sm font-medium text-emerald-700 hover:underline'>Best herbs for sleep</Link>
        </div>
      </section>

      <section className='card-premium p-6'>
        <h2 className='text-xl font-semibold text-ink'>How approaches differ</h2>
        <ul className='mt-3 space-y-2 text-sm leading-6 text-muted'>
          <li><strong className='text-ink'>Stimulant-forward:</strong> faster perceived alertness, but tolerance and timing are practical constraints.</li>
          <li><strong className='text-ink'>Stress-buffering:</strong> can feel gentler and steadier when focus drops are stress-linked.</li>
          <li><strong className='text-ink'>Energy-metabolism support:</strong> usually framed as consistency over time, not immediate “kick.”</li>
        </ul>
      </section>

      <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-4'>
        {ranked.map((c, i) => (
          <div key={c.slug} className='card-premium p-6 flex flex-col justify-between'>
            <div>
              <p className='text-xs font-semibold uppercase tracking-wider text-emerald-700'>Pick #{i + 1}</p>
              <h2 className='mt-2 text-xl font-semibold text-ink'>{titleFor(c)}</h2>
              <p className='mt-3 text-sm text-muted'>{cleanSummary(c.summary || c.description, 'compound')}</p>
            </div>
            <div className='mt-4 flex flex-col gap-2'>
              <Link href={`/compounds/${c.slug}`} className='text-sm font-medium text-emerald-700 hover:underline'>Read full profile</Link>
              <a href={buildAmazonSearchUrl(c.slug)} target='_blank' rel='noopener noreferrer nofollow sponsored' className='text-sm font-medium text-emerald-700 hover:underline'>Compare products</a>
            </div>
          </div>
        ))}
      </div>

      <EmailCapture
        headline='Get the focus supplement shortlist'
        description='Occasional notes on focus-support evidence, stimulant tradeoffs, safety context, and product-quality checks.'
        location='top-focus'
      />

      <div className='space-y-3'>
        <AffiliateDisclosure />
        <RecommendationSection
          title='Focus-support product picks'
          description='Affiliate recommendations for common focus-support compounds. Review safety, dose, and product quality before buying.'
          products={revenueProducts}
        />
      </div>

      <section className='card-premium p-6'>
        <h2 className='text-xl font-semibold text-ink'>Related guides</h2>
        <div className='mt-4 flex flex-wrap gap-4'>
          <Link href='/top/stress' className='text-sm font-medium text-emerald-700 hover:underline'>Best herbs for stress</Link>
          <Link href='/top/sleep' className='text-sm font-medium text-emerald-700 hover:underline'>Best herbs for sleep</Link>
        </div>
      </section>
    </main>
  )
}
