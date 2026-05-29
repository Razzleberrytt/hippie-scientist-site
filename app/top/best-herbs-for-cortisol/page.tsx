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

const KEYWORDS = ['cortisol', 'stress', 'adaptogen', 'hpa', 'anxiety', 'calm']
const PREFERRED = ['ashwagandha', 'rhodiola-rosea', 'holy-basil']

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
  const haystack = [
    herb.slug,
    herb.name,
    herb.displayName,
    herb.summary,
    herb.description,
    herb.mechanism_summary,
    ...list(herb.primary_effects),
    ...list(herb.goal_tags),
  ].map(text).join(' ').toLowerCase()

  return KEYWORDS.some(keyword => haystack.includes(keyword))
}

const summaryFor = (herb: Herb): string => {
  const value = cleanSummary(text(herb.mechanism_summary) || text(herb.summary) || text(herb.description), 'herb')
  return value.length > 220 ? `${value.slice(0, 219).trimEnd()}…` : value
}

export const metadata: Metadata = {
  title: 'Best Herbs for Cortisol Support (2026 Guide)',
  description:
    'A practical guide to herbs commonly discussed for cortisol, stress response, adaptogen support, and calm.',
  alternates: { canonical: '/top/best-herbs-for-cortisol' },
}

export default async function CortisolPage() {
  const herbs = (await getHerbs()) as Herb[]
  const bySlug = new Map(herbs.map(herb => [herb.slug, herb]))
  const preferred = PREFERRED.map(slug => bySlug.get(slug)).filter((herb): herb is Herb => Boolean(herb))
  const fallback = herbs
    .filter(herb => matches(herb) && !preferred.some(item => item.slug === herb.slug))
    .sort((a, b) => scoreFor(b) - scoreFor(a))
    .slice(0, Math.max(0, 6 - preferred.length))
  const picks = [...preferred, ...fallback].slice(0, 6)
  const best = picks[0]
  const bestLabel = best ? labelFor(best) : 'Ashwagandha'
  const bestLinks = getHerbSearchLinks(bestLabel)

  return (
    <main className='container-page py-10 space-y-8'>
      <section className='hero-shell rounded-[2rem] border border-brand-900/10 p-6 shadow-card sm:p-8'>
        <p className='eyebrow-label'>Hormone stress guide</p>
        <h1 className='mt-2 text-3xl font-semibold text-ink sm:text-4xl'>Best Herbs for Cortisol Support</h1>
        <p className='mt-4 text-muted'>
          A quick guide to herbs commonly discussed for stress response, cortisol context, and adaptogen-style support. Educational only, not medical advice.
        </p>
        <p className='mt-3 text-sm text-muted'>
          Cortisol is usually about pattern and timing, not one “cortisol herb.” This page helps you compare common options before deeper profile reading.
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

      <AffiliateConversionCard
        eyebrow='Featured cortisol pick'
        title={bestLabel}
        description='Educational first-look option for cortisol, stress-response, and adaptogen-support research.'
        href={bestLinks[0]?.url || '#'}
        cta={`View ${bestLabel} options →`}
        secondaryHref='/compare/ashwagandha-vs-rhodiola'
        secondaryCta='Compare alternatives →'
      />

      <section className='card-premium p-6'>
        <h2 className='text-xl font-semibold text-ink'>Fast answer</h2>
        <p className='mt-3 text-sm leading-6 text-muted'>
          Ashwagandha, rhodiola, and holy basil are commonly discussed when people search for herbs related to cortisol and stress resilience.
        </p>
        <p className='mt-3 text-sm leading-6 text-muted'>
          Beginner guidance: compare how each option aligns with your day (wired-but-tired evenings, pressure-heavy workdays, or general tension) before choosing.
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
                <Link href={`/herbs/${herb.slug}/`} className='text-sm font-medium text-emerald-700 hover:underline'>
                  Learn more
                </Link>
                {links[0] ? (
                  <a href={links[0].url} target='_blank' rel='noopener noreferrer sponsored' className='text-sm font-medium text-emerald-700 hover:underline'>
                    Compare products
                  </a>
                ) : null}
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
          <Link href='/compare/ashwagandha-vs-rhodiola' className='text-sm font-medium text-emerald-700 hover:underline'>Ashwagandha vs rhodiola</Link>
        </div>
      </section>
    </main>
  )
}

