import type { Metadata } from 'next'
import Link from 'next/link'
import { getCompounds } from '@/lib/runtime-data'
import { buildAmazonSearchUrl } from '@/lib/affiliate'
import { AffiliateConversionCard } from '@/components/affiliate-conversion-card'

type Compound = { slug: string; name?: string; displayName?: string; summary?: string }

const PICKS = ['caffeine','l-theanine','creatine']
const label = (c: Compound): string => c.displayName || c.name || c.slug

export const metadata: Metadata = {
  title: 'Top 3 Supplements for Focus (2026 Guide)',
  description: 'Simple breakdown of supplements for focus and cognitive performance.',
  alternates: { canonical: '/top/top-3-supplements-for-focus' },
}

export default async function Page(){
  const compounds = (await getCompounds()) as Compound[]
  const map = new Map(compounds.map(c=>[c.slug,c]))
  const picks = PICKS.map(s=>map.get(s)).filter((item): item is Compound => Boolean(item))
  const best = picks[0]
  const bestLabel = best ? label(best) : 'Caffeine'

  return (
    <main className='container-page py-10 space-y-8'>
      <section className='hero-shell rounded-[2rem] border border-brand-900/10 p-6 shadow-card sm:p-8'>
        <p className='eyebrow-label'>Focus guide</p>
        <h1 className='mt-2 text-3xl font-semibold text-ink sm:text-4xl'>Top 3 Supplements for Focus</h1>
        <p className='mt-4 text-muted'>A simple starting point for cognitive performance, clarity, and focus-related supplement research. Educational only.</p>
      </section>

      <AffiliateConversionCard
        eyebrow='Best overall focus pick'
        title={bestLabel}
        description='Best overall starting point for focus and cognitive performance support.'
        href={buildAmazonSearchUrl(`${bestLabel} supplement`)}
        cta={`View ${bestLabel} options →`}
        secondaryHref='/top/focus'
        secondaryCta='See full focus guide →'
      />

      <section className='grid gap-4'>
        {picks.map((c,i)=>(
          <article key={c.slug} className='card-premium p-6 flex flex-col justify-between'>
            <div>
              <p className='text-xs font-semibold uppercase tracking-wider text-emerald-700'>Pick #{i+1}</p>
              <h2 className='mt-2 text-2xl font-semibold text-ink'>{label(c)}</h2>
              <p className='mt-3 text-sm text-muted'>{c.summary}</p>
            </div>
            <div className='mt-4 flex flex-wrap gap-4'>
              <Link href={`/compounds/${c.slug}`} className='text-sm font-medium text-emerald-700 hover:underline'>Learn more</Link>
              <a href={buildAmazonSearchUrl(`${label(c)} supplement`)} target='_blank' rel='noopener noreferrer sponsored' className='text-sm font-medium text-emerald-700 hover:underline'>View products</a>
            </div>
          </article>
        ))}
      </section>
    </main>
  )
}

