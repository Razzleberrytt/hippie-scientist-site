import type { Metadata } from 'next'
import Link from 'next/link'
import { getCompounds, getHerbs } from '@/lib/runtime-data'
import { buildAmazonSearchUrl, getHerbSearchLinks } from '@/lib/affiliate'

type RecordItem = {
  slug: string
  name?: string | null
  displayName?: string | null
  summary?: string | null
  description?: string | null
  mechanism_summary?: string | null
  kind: 'herb' | 'compound'
}

const PICKS = [
  { slug: 'rhodiola-rosea', kind: 'herb' as const },
  { slug: 'creatine', kind: 'compound' as const },
  { slug: 'caffeine', kind: 'compound' as const },
]

const label = (item: RecordItem): string => item.displayName || item.name || item.slug
const summary = (item: RecordItem): string => item.mechanism_summary || item.summary || item.description || 'Profile details are still being expanded from the workbook.'
const href = (item: RecordItem): string => item.kind === 'herb' ? `/herbs/${item.slug}/` : `/compounds/${item.slug}/`
const affiliateUrl = (item: RecordItem): string => item.kind === 'herb' ? getHerbSearchLinks(label(item))[0]?.url || buildAmazonSearchUrl(label(item)) : buildAmazonSearchUrl(`${label(item)} supplement`)

export const metadata: Metadata = {
  title: 'Best Supplements for Fatigue & Burnout (2026 Guide)',
  description: 'Simple guide to herbs and supplements commonly discussed for fatigue, burnout, low energy, and stress-linked tiredness.',
  alternates: { canonical: '/top/best-supplements-for-fatigue' },
}

export default async function Page() {
  const [herbs, compounds] = await Promise.all([getHerbs(), getCompounds()])
  const herbMap = new Map((herbs as Omit<RecordItem, 'kind'>[]).map(item => [item.slug, { ...item, kind: 'herb' as const }]))
  const compoundMap = new Map((compounds as Omit<RecordItem, 'kind'>[]).map(item => [item.slug, { ...item, kind: 'compound' as const }]))
  const picks = PICKS.map(pick => pick.kind === 'herb' ? herbMap.get(pick.slug) : compoundMap.get(pick.slug)).filter((item): item is RecordItem => Boolean(item))

  return (
    <main className='mx-auto max-w-5xl space-y-6 px-4 py-8 text-white sm:px-6 lg:px-8'>
      <section className='rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.18),transparent_35%),linear-gradient(135deg,rgba(255,255,255,0.07),rgba(255,255,255,0.025))] p-6 shadow-2xl shadow-black/25 sm:p-8'>
        <p className='text-xs font-bold uppercase tracking-[0.2em] text-emerald-100/70'>Energy guide</p>
        <h1 className='mt-3 text-4xl font-black tracking-tight sm:text-6xl'>Best Supplements for Fatigue & Burnout</h1>
        <p className='mt-4 max-w-3xl text-base leading-7 text-white/70'>A practical guide to herbs and supplements commonly discussed for low energy, fatigue, burnout, and stress-linked tiredness. Educational only, not medical advice.</p>
      </section>

      <section className='rounded-3xl border border-white/10 bg-white/[0.035] p-5 sm:p-6'>
        <h2 className='text-2xl font-bold'>Fast answer</h2>
        <ul className='mt-4 space-y-3 text-sm leading-6 text-white/70'>
          <li><strong className='text-white'>Rhodiola rosea</strong> is often framed around fatigue and stress resilience.</li>
          <li><strong className='text-white'>Creatine</strong> is commonly discussed for performance, energy systems, and cognitive context.</li>
          <li><strong className='text-white'>Caffeine</strong> is the obvious short-term energy option, but context matters.</li>
        </ul>
      </section>

      <section className='grid gap-4'>
        {picks.map((item, index) => (
          <article key={`${item.kind}-${item.slug}`} className='rounded-3xl border border-white/10 bg-white/[0.04] p-5'>
            <p className='text-xs font-bold uppercase tracking-[0.2em] text-emerald-100/65'>Pick #{index + 1} · {item.kind}</p>
            <h2 className='mt-2 text-3xl font-bold'>{label(item)}</h2>
            <p className='mt-4 text-sm leading-6 text-white/68'>{summary(item)}</p>
            <div className='mt-5 flex flex-wrap gap-2'>
              <Link href={href(item)} className='rounded-2xl border border-white/10 px-4 py-2 text-sm font-bold text-white/75 hover:bg-white/5'>Read {label(item)} profile</Link>
              <a href={affiliateUrl(item)} target='_blank' rel='noopener noreferrer sponsored' className='rounded-2xl bg-emerald-300 px-4 py-2 text-sm font-bold text-slate-950 hover:bg-emerald-200'>Compare {label(item)} products →</a>
            </div>
          </article>
        ))}
      </section>

      <section className='rounded-3xl border border-white/10 bg-white/[0.035] p-5'>
        <h2 className='text-2xl font-bold'>Related guides</h2>
        <div className='mt-4 flex flex-wrap gap-2'>
          <Link href='/top/focus' className='rounded-2xl border border-blue-300/20 bg-blue-300/10 px-4 py-2 text-sm font-bold text-blue-100'>Best supplements for focus</Link>
          <Link href='/top/best-supplements-for-brain-fog' className='rounded-2xl border border-white/10 px-4 py-2 text-sm font-bold text-white/70'>Best supplements for brain fog</Link>
          <Link href='/top/stress' className='rounded-2xl border border-white/10 px-4 py-2 text-sm font-bold text-white/70'>Best herbs for stress</Link>
        </div>
      </section>
    </main>
  )
}
