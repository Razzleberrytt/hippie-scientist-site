import type { Metadata } from 'next'
import Link from 'next/link'
import { getHerbs } from '@/lib/runtime-data'
import { getHerbSearchLinks } from '@/lib/affiliate'
import { cleanSummary } from '@/lib/display-utils'
import { AffiliateConversionCard } from '@/components/affiliate-conversion-card'

type Herb = {
  slug: string
  name?: string | null
  displayName?: string | null
  summary?: string | null
  mechanism_summary?: string | null
}

const PICKS = ['valerian', 'lemon-balm', 'passionflower']
const label = (h: Herb): string => h.displayName || h.name || h.slug
const summary = (h: Herb): string => cleanSummary(h.mechanism_summary || h.summary, 'herb')

export const metadata: Metadata = {
  title: 'Top 3 Natural Sleep Aids (2026 Guide)',
  description: 'Simple guide to natural sleep aids for insomnia, relaxation, and better sleep.',
  alternates: { canonical: '/top/top-3-natural-sleep-aids' },
}

export default async function Page() {
  const herbs = (await getHerbs()) as Herb[]
  const map = new Map(herbs.map(h => [h.slug, h]))
  const picks = PICKS.map(s => map.get(s)).filter((item): item is Herb => Boolean(item))
  const best = picks[0]
  const bestLabel = best ? label(best) : 'Valerian'
  const bestLinks = getHerbSearchLinks(bestLabel)

  return (
    <main className='container-page py-10 space-y-8'>
      <section className='hero-shell rounded-[2rem] border border-brand-900/10 p-6 shadow-card sm:p-8'>
        <p className='eyebrow-label'>Sleep guide</p>
        <h1 className='mt-2 text-3xl font-semibold text-ink sm:text-4xl'>Top 3 Natural Sleep Aids</h1>
        <p className='mt-4 text-muted'>A simple starting point for herbs commonly discussed around sleep onset, relaxation, and nighttime calm. Educational only, not medical advice.</p>
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

      <AffiliateConversionCard
        eyebrow='Featured sleep pick'
        title={bestLabel}
        description='Educational first-look option for natural sleep-aid research and nighttime relaxation context.'
        href={bestLinks[0]?.url || '#'}
        cta={`View ${bestLabel} options →`}
        secondaryHref='/top/sleep'
        secondaryCta='See full sleep guide →'
      />

      <section className='card-premium p-6'>
        <h2 className='text-xl font-semibold text-ink'>Fast answer</h2>
        <ul className='mt-4 space-y-3 text-sm leading-6 text-muted'>
          <li><strong className='text-ink'>Valerian</strong> is commonly discussed for sleep onset and nighttime rest.</li>
          <li><strong className='text-ink'>Lemon balm</strong> is often connected with gentle calm and relaxation.</li>
          <li><strong className='text-ink'>Passionflower</strong> is often framed around relaxation and nervous-system support.</li>
        </ul>
        <p className='mt-4 text-sm leading-6 text-muted'>
          Sleep-note nuance: these are often chosen for different reasons (sleep onset, tension reduction, nighttime calm), so matching the pattern is usually more helpful than rotating randomly.
        </p>
      </section>

      <section className='grid gap-4'>
        {picks.map((h, i) => {
          const name = label(h)
          const links = getHerbSearchLinks(name)
          return (
            <article key={h.slug} className='card-premium p-6 flex flex-col justify-between'>
              <div>
                <p className='text-xs font-semibold uppercase tracking-wider text-emerald-700'>Pick #{i + 1}</p>
                <h2 className='mt-2 text-2xl font-semibold text-ink'>{name}</h2>
                <p className='mt-3 text-sm leading-6 text-muted'>{summary(h)}</p>
              </div>
              <div className='mt-4 flex flex-wrap gap-4'>
                <Link href={`/herbs/${h.slug}/`} className='text-sm font-medium text-emerald-700 hover:underline'>Learn more</Link>
                {links[0] ? <a href={links[0].url} target='_blank' rel='noopener noreferrer sponsored' className='text-sm font-medium text-emerald-700 hover:underline'>Compare products</a> : null}
              </div>
            </article>
          )
        })}
      </section>

      <section className='card-premium p-6'>
        <h2 className='text-xl font-semibold text-ink'>Related guides</h2>
        <div className='mt-4 flex flex-wrap gap-4'>
          <Link href='/top/sleep' className='text-sm font-medium text-emerald-700 hover:underline'>Best herbs for sleep</Link>
          <Link href='/top/stress' className='text-sm font-medium text-emerald-700 hover:underline'>Best herbs for stress</Link>
          <Link href='/top/top-3-herbs-for-anxiety' className='text-sm font-medium text-emerald-700 hover:underline'>Top 3 herbs for anxiety</Link>
        </div>
      </section>
    </main>
  )
}

