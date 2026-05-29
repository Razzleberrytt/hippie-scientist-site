import type { Metadata } from 'next'
import Link from 'next/link'
import { getCompounds, getHerbs } from '@/lib/runtime-data'
import { buildAmazonSearchUrl, getHerbSearchLinks } from '@/lib/affiliate'
import { cleanSummary } from '@/lib/display-utils'

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
const summary = (item: RecordItem): string => cleanSummary(item.mechanism_summary || item.summary || item.description, item.kind)
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
    <main className='container-page py-10 space-y-8'>
      <section className='hero-shell rounded-[2rem] border border-brand-900/10 p-6 shadow-card sm:p-8'>
        <p className='eyebrow-label'>Energy guide</p>
        <h1 className='mt-2 text-3xl font-semibold text-ink sm:text-4xl'>Best Supplements for Fatigue & Burnout</h1>
        <p className='mt-4 text-muted'>A practical guide to herbs and supplements commonly discussed for low energy, fatigue, burnout, and stress-linked tiredness. Educational only, not medical advice.</p>
        <p className='mt-3 text-sm text-muted'>Use this page to separate short-lift options from recovery-oriented options. Fatigue stacks usually work better when matched to pattern, not hype.</p>
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
        <h2 className='text-xl font-semibold text-ink'>Fast answer</h2>
        <ul className='mt-4 space-y-3 text-sm leading-6 text-muted'>
          <li><strong className='text-ink'>Rhodiola rosea</strong> is often framed around fatigue and stress resilience.</li>
          <li><strong className='text-ink'>Creatine</strong> is commonly discussed for performance, energy systems, and cognitive context.</li>
          <li><strong className='text-ink'>Caffeine</strong> may support short-term alertness for some people, but context and tolerance matter.</li>
        </ul>
      </section>

      <section className='card-premium p-6'>
        <h2 className='text-xl font-semibold text-ink'>How the three picks differ</h2>
        <ul className='mt-3 space-y-2 text-sm leading-6 text-muted'>
          <li><strong className='text-ink'>Rhodiola:</strong> usually framed for stress-linked fatigue and resilience.</li>
          <li><strong className='text-ink'>Creatine:</strong> often discussed as baseline energy-system support over time.</li>
          <li><strong className='text-ink'>Caffeine:</strong> fast alertness, but with tolerance and timing tradeoffs.</li>
        </ul>
      </section>

      <section className='grid gap-4'>
        {picks.map((item, index) => (
          <article key={`${item.kind}-${item.slug}`} className='card-premium p-6'>
            <p className='text-xs font-semibold uppercase tracking-wider text-emerald-700'>Pick #{index + 1} · {item.kind}</p>
            <h2 className='mt-2 text-2xl font-semibold text-ink'>{label(item)}</h2>
            <p className='mt-3 text-sm leading-6 text-muted'>{summary(item)}</p>
            <div className='mt-4 flex flex-wrap gap-4'>
              <Link href={href(item)} className='text-sm font-medium text-emerald-700 hover:underline'>Read {label(item)} profile</Link>
              <a href={affiliateUrl(item)} target='_blank' rel='noopener noreferrer sponsored' className='text-sm font-medium text-emerald-700 hover:underline'>Compare {label(item)} products</a>
            </div>
          </article>
        ))}
      </section>

      <section className='card-premium p-6'>
        <h2 className='text-xl font-semibold text-ink'>Related guides</h2>
        <div className='mt-4 flex flex-wrap gap-4'>
          <Link href='/top/focus' className='text-sm font-medium text-emerald-700 hover:underline'>Best supplements for focus</Link>
          <Link href='/top/best-supplements-for-brain-fog' className='text-sm font-medium text-emerald-700 hover:underline'>Best supplements for brain fog</Link>
          <Link href='/top/stress' className='text-sm font-medium text-emerald-700 hover:underline'>Best herbs for stress</Link>
        </div>
      </section>
    </main>
  )
}
