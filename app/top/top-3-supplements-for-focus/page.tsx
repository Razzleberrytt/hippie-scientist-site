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
    <main className='mx-auto max-w-5xl space-y-6 px-4 py-8 text-white sm:px-6 lg:px-8'>
      <section className='rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.18),transparent_35%),linear-gradient(135deg,rgba(255,255,255,0.07),rgba(255,255,255,0.025))] p-6 shadow-2xl shadow-black/25 sm:p-8'>
        <p className='text-xs font-bold uppercase tracking-[0.2em] text-blue-100/70'>Focus guide</p>
        <h1 className='mt-3 text-4xl font-black tracking-tight sm:text-6xl'>Top 3 Supplements for Focus</h1>
        <p className='mt-4 max-w-3xl text-base leading-7 text-white/70'>A simple starting point for cognitive performance, clarity, and focus-related supplement research. Educational only.</p>
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
          <article key={c.slug} className='rounded-3xl border border-white/10 bg-white/[0.04] p-5'>
            <p className='text-xs font-bold uppercase tracking-[0.2em] text-blue-100/65'>Pick #{i+1}</p>
            <h2 className='mt-2 text-3xl font-bold'>{label(c)}</h2>
            <p className='mt-4 text-sm text-white/70'>{c.summary}</p>
            <div className='mt-5 flex gap-2'>
              <a href={buildAmazonSearchUrl(`${label(c)} supplement`)} target='_blank' rel='noopener noreferrer sponsored' className='bg-emerald-300 text-black px-4 py-2 rounded-xl font-bold'>View products →</a>
              <Link href={`/compounds/${c.slug}`}>Learn more →</Link>
            </div>
          </article>
        ))}
      </section>
    </main>
  )
}
