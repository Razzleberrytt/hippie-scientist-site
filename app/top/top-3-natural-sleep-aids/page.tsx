import type { Metadata } from 'next'
import Link from 'next/link'
import { getHerbs } from '@/lib/runtime-data'
import { getHerbSearchLinks } from '@/lib/affiliate'
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
const summary = (h: Herb): string => h.mechanism_summary || h.summary || 'Profile details are still being expanded from the workbook.'

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
    <main className='mx-auto max-w-5xl space-y-6 px-4 py-8 text-white sm:px-6 lg:px-8'>
      <section className='rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(139,92,246,0.18),transparent_35%),linear-gradient(135deg,rgba(255,255,255,0.07),rgba(255,255,255,0.025))] p-6 shadow-2xl shadow-black/25 sm:p-8'>
        <p className='text-xs font-bold uppercase tracking-[0.2em] text-violet-100/70'>Sleep guide</p>
        <h1 className='mt-3 text-4xl font-black tracking-tight sm:text-6xl'>Top 3 Natural Sleep Aids</h1>
        <p className='mt-4 max-w-3xl text-base leading-7 text-white/70'>A simple starting point for herbs commonly discussed around sleep onset, relaxation, and nighttime calm. Educational only, not medical advice.</p>
      </section>

      <AffiliateConversionCard
        eyebrow='Best overall sleep pick'
        title={bestLabel}
        description='Best overall starting point for natural sleep-aid research and nighttime relaxation support.'
        href={bestLinks[0]?.url || '#'}
        cta={`View ${bestLabel} options →`}
        secondaryHref='/top/sleep'
        secondaryCta='See full sleep guide →'
      />

      <section className='rounded-3xl border border-white/10 bg-white/[0.035] p-5 sm:p-6'>
        <h2 className='text-2xl font-bold'>Fast answer</h2>
        <ul className='mt-4 space-y-3 text-sm leading-6 text-white/70'>
          <li><strong className='text-white'>Valerian</strong> is commonly discussed for sleep onset and nighttime rest.</li>
          <li><strong className='text-white'>Lemon balm</strong> is often connected with gentle calm and relaxation.</li>
          <li><strong className='text-white'>Passionflower</strong> is often framed around relaxation and nervous-system support.</li>
        </ul>
      </section>

      <section className='grid gap-4'>
        {picks.map((h, i) => {
          const name = label(h)
          const links = getHerbSearchLinks(name)
          return (
            <article key={h.slug} className='rounded-3xl border border-white/10 bg-white/[0.04] p-5'>
              <p className='text-xs font-bold uppercase tracking-[0.2em] text-violet-100/65'>Pick #{i + 1}</p>
              <h2 className='mt-2 text-3xl font-bold'>{name}</h2>
              <p className='mt-4 text-sm leading-6 text-white/68'>{summary(h)}</p>
              <div className='mt-5 flex flex-wrap gap-2'>
                {links[0] ? <a href={links[0].url} target='_blank' rel='noopener noreferrer sponsored' className='rounded-2xl bg-emerald-300 px-4 py-2 text-sm font-bold text-slate-950 hover:bg-emerald-200'>View {name} products →</a> : null}
                <Link href={`/herbs/${h.slug}/`} className='rounded-2xl border border-white/10 px-4 py-2 text-sm font-bold text-white/75 hover:bg-white/5'>Learn more →</Link>
              </div>
            </article>
          )
        })}
      </section>

      <section className='rounded-3xl border border-white/10 bg-white/[0.035] p-5'>
        <h2 className='text-2xl font-bold'>Related guides</h2>
        <div className='mt-4 flex flex-wrap gap-2'>
          <Link href='/top/sleep' className='rounded-2xl border border-violet-300/20 bg-violet-300/10 px-4 py-2 text-sm font-bold text-violet-100'>Best herbs for sleep</Link>
          <Link href='/top/stress' className='rounded-2xl border border-white/10 px-4 py-2 text-sm font-bold text-white/70'>Best herbs for stress</Link>
          <Link href='/top/top-3-herbs-for-anxiety' className='rounded-2xl border border-white/10 px-4 py-2 text-sm font-bold text-white/70'>Top 3 herbs for anxiety</Link>
        </div>
      </section>
    </main>
  )
}
