import type { Metadata } from 'next'
import Link from 'next/link'
import { getHerbs } from '@/lib/runtime-data'
import { getHerbSearchLinks } from '@/lib/affiliate'
import { AffiliateConversionCard } from '@/components/affiliate-conversion-card'
import { cleanSummary } from '@/lib/display-utils'

type Herb = {
  slug: string
  name?: string | null
  displayName?: string | null
  summary?: string | null
  description?: string | null
  mechanism_summary?: string | null
  net_score?: number | string | null
  primary_effects?: unknown
  goal_tags?: unknown
}

const KEYWORDS = ['anxiety', 'calm', 'relax', 'nervous', 'stress', 'gaba']
const preferredSlugs = ['ashwagandha', 'lemon-balm', 'passionflower']

const text = (value: unknown): string =>
  typeof value === 'string' ? value.trim() : value === null || value === undefined ? '' : String(value).trim()

const list = (value: unknown): string[] => {
  if (Array.isArray(value)) return value.map(text).filter(Boolean)
  const normalized = text(value)
  return normalized ? normalized.split(/,|;|\|/).map(item => item.trim()).filter(Boolean) : []
}

const labelFor = (herb: Herb): string =>
  text(herb.displayName) || text(herb.name) || herb.slug.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ')

const scoreFor = (herb: Herb): number => {
  const raw = herb.net_score
  if (typeof raw === 'number') return Number.isFinite(raw) ? raw : 0
  if (typeof raw === 'string') return Number.parseFloat(raw) || 0
  return 0
}

const matches = (herb: Herb): boolean => {
  const haystack = [herb.slug, herb.name, herb.displayName, herb.summary, herb.description, herb.mechanism_summary, ...list(herb.primary_effects), ...list(herb.goal_tags)]
    .map(text)
    .join(' ')
    .toLowerCase()
  return KEYWORDS.some(keyword => haystack.includes(keyword))
}

const summaryFor = (herb: Herb): string => {
  const value = cleanSummary(text(herb.mechanism_summary) || text(herb.summary) || text(herb.description), 'herb')
  return value.length > 220 ? `${value.slice(0, 219).trimEnd()}…` : value
}

export const metadata: Metadata = {
  title: 'Top 3 Herbs for Anxiety (Calm Support Guide 2026)',
  description: 'A simple guide to herbs commonly discussed for anxiety, calm, relaxation, and nervous-system support with profile and product comparison links.',
  alternates: { canonical: '/top/top-3-herbs-for-anxiety' },
}

export default async function TopThreeAnxietyHerbsPage() {
  const herbs = (await getHerbs()) as Herb[]
  const bySlug = new Map(herbs.map(herb => [herb.slug, herb]))
  const preferred = preferredSlugs.map(slug => bySlug.get(slug)).filter((herb): herb is Herb => Boolean(herb))
  const fallback = herbs.filter(herb => matches(herb) && !preferred.some(item => item.slug === herb.slug)).sort((a, b) => scoreFor(b) - scoreFor(a)).slice(0, Math.max(0, 3 - preferred.length))
  const picks = [...preferred, ...fallback].slice(0, 3)
  const best = picks[0]
  const bestLabel = best ? labelFor(best) : 'Ashwagandha'
  const bestLinks = getHerbSearchLinks(bestLabel)

  return (
    <main className='container-page py-10 space-y-8'>
      <section className='hero-shell rounded-[2rem] border border-brand-900/10 p-6 shadow-card sm:p-8'>
        <p className='eyebrow-label'>Quick guide</p>
        <h1 className='mt-2 text-3xl font-semibold text-ink sm:text-4xl'>Top 3 Herbs for Anxiety</h1>
        <p className='mt-4 text-muted'>A practical starting point for calm, relaxation, and anxiety-related herb research. Educational context only, not medical advice.</p>
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
        title={bestLabel}
        description='Educational first-look option for calm, relaxation, and stress-linked anxiety research.'
        href={bestLinks[0]?.url || '#'}
        cta={`View ${bestLabel} options →`}
        secondaryHref='/top/stress'
        secondaryCta='Compare stress-support herbs →'
      />

      <section className='card-premium p-6'>
        <h2 className='text-xl font-semibold text-ink'>Fast answer</h2>
        <ul className='mt-4 space-y-3 text-sm leading-6 text-muted'>
          <li><strong className='text-ink'>Ashwagandha</strong> is often discussed for stress-linked anxiety and calm support.</li>
          <li><strong className='text-ink'>Lemon balm</strong> is commonly associated with gentle relaxation.</li>
          <li><strong className='text-ink'>Passionflower</strong> is often connected with calm and nervous-system support.</li>
        </ul>
        <p className='mt-4 text-sm leading-6 text-muted'>
          Route-specific note: these three are common “entry” herbs, but they are not interchangeable. Some people prioritize daytime composure, others prioritize evening calm and sleep carryover.
        </p>
      </section>

      <section className='grid gap-4'>
        {picks.map((herb, index) => {
          const label = labelFor(herb)
          const links = getHerbSearchLinks(label)
          return (
            <article key={herb.slug} className='card-premium p-6'>
              <p className='text-xs font-semibold uppercase tracking-wider text-emerald-700'>Pick #{index + 1}</p>
              <h2 className='mt-2 text-2xl font-semibold text-ink'>{label}</h2>
              <p className='mt-3 text-sm leading-6 text-muted'>{summaryFor(herb)}</p>
              <div className='mt-4 flex flex-wrap gap-4'>
                <Link href={`/herbs/${herb.slug}/`} className='text-sm font-medium text-emerald-700 hover:underline'>Learn more</Link>
                {links[0] ? <a href={links[0].url} target='_blank' rel='noopener noreferrer sponsored' className='text-sm font-medium text-emerald-700 hover:underline'>Compare products</a> : null}
              </div>
            </article>
          )
        })}
      </section>

      <section className='card-premium p-6'>
        <h2 className='text-xl font-semibold text-ink'>Related guides</h2>
        <div className='mt-4 flex flex-wrap gap-4'>
          <Link href='/top/stress' className='text-sm font-medium text-emerald-700 hover:underline'>Best herbs for stress</Link>
          <Link href='/top/top-3-herbs-for-stress' className='text-sm font-medium text-emerald-700 hover:underline'>Top 3 herbs for stress</Link>
          <Link href='/top/sleep' className='text-sm font-medium text-emerald-700 hover:underline'>Best herbs for sleep</Link>
        </div>
      </section>
    </main>
  )
}

