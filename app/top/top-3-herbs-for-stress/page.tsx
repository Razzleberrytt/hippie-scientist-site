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

const STRESS_KEYWORDS = ['stress', 'anxiety', 'cortisol', 'calm', 'relax', 'adaptogen']
const preferredSlugs = ['ashwagandha', 'rhodiola-rosea', 'lemon-balm']

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

const matchesStress = (herb: Herb): boolean => {
  const haystack = [herb.slug, herb.name, herb.displayName, herb.summary, herb.description, herb.mechanism_summary, ...list(herb.primary_effects), ...list(herb.goal_tags)]
    .map(text)
    .join(' ')
    .toLowerCase()
  return STRESS_KEYWORDS.some(keyword => haystack.includes(keyword))
}

const summaryFor = (herb: Herb): string => {
  const value = cleanSummary(text(herb.mechanism_summary) || text(herb.summary) || text(herb.description), 'herb')
  return value.length > 220 ? `${value.slice(0, 219).trimEnd()}…` : value
}

export const metadata: Metadata = {
  title: 'Top 3 Herbs for Stress (2026 Guide)',
  description: 'A simple guide to the top 3 herbs for stress, anxiety, calm, and cortisol support with profile links and product comparison paths.',
  alternates: { canonical: '/top/top-3-herbs-for-stress' },
}

export default async function TopThreeStressHerbsPage() {
  const herbs = (await getHerbs()) as Herb[]
  const bySlug = new Map(herbs.map(herb => [herb.slug, herb]))
  const preferred = preferredSlugs.map(slug => bySlug.get(slug)).filter((herb): herb is Herb => Boolean(herb))
  const fallback = herbs
    .filter(herb => matchesStress(herb) && !preferred.some(item => item.slug === herb.slug))
    .sort((a, b) => scoreFor(b) - scoreFor(a))
    .slice(0, Math.max(0, 3 - preferred.length))
  const picks = [...preferred, ...fallback].slice(0, 3)
  const best = picks[0]
  const bestLabel = best ? labelFor(best) : 'Ashwagandha'
  const bestLinks = getHerbSearchLinks(bestLabel)

  return (
    <main className='container-page py-10 space-y-8'>
      <section className='hero-shell rounded-[2rem] border border-brand-900/10 p-6 shadow-card sm:p-8'>
        <p className='eyebrow-label'>Quick guide</p>
        <h1 className='mt-2 text-3xl font-semibold text-ink sm:text-4xl'>Top 3 Herbs for Stress</h1>
        <p className='mt-4 text-muted'>A practical starting point for stress, anxiety, calm, and adaptogen-style support. This is educational research context, not medical advice.</p>
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
        description='Educational first-look option for stress, calm, and cortisol-support research.'
        href={bestLinks[0]?.url || '#'}
        cta={`View ${bestLabel} options →`}
        secondaryHref='/compare/ashwagandha-vs-rhodiola'
        secondaryCta='Compare alternatives →'
      />

      <section className='card-premium p-6'>
        <h2 className='text-xl font-semibold text-ink'>Fast answer</h2>
        <ul className='mt-4 space-y-3 text-sm leading-6 text-muted'>
          <li><strong className='text-ink'>Ashwagandha</strong> is commonly discussed for long-term stress and calm support.</li>
          <li><strong className='text-ink'>Rhodiola rosea</strong> is often framed around fatigue, resilience, and stress-linked energy.</li>
          <li><strong className='text-ink'>Lemon balm</strong> is a gentler calming herb often connected with relaxation.</li>
        </ul>
        <p className='mt-4 text-sm leading-6 text-muted'>
          Interpretation tip: “best” depends on stress pattern. For many beginners, the useful first split is steady resilience support versus quick calming support.
        </p>
      </section>

      <section className='grid gap-4'>
        {picks.map((herb, index) => {
          const label = labelFor(herb)
          const links = getHerbSearchLinks(label)
          return (
            <article key={herb.slug} className='card-premium p-6 flex flex-col justify-between'>
              <div>
                <div className='flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
                  <div>
                    <p className='text-xs font-semibold uppercase tracking-wider text-emerald-700'>Pick #{index + 1}</p>
                    <h2 className='mt-2 text-2xl font-semibold text-ink'>{label}</h2>
                  </div>
                  <span className='w-fit rounded-full border border-brand-900/10 bg-brand-900/5 px-3 py-1 text-xs text-muted'>Score {scoreFor(herb) || 'N/A'}</span>
                </div>
                <p className='mt-3 text-sm leading-6 text-muted'>{summaryFor(herb)}</p>
              </div>
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
          <Link href='/compare/ashwagandha-vs-rhodiola' className='text-sm font-medium text-emerald-700 hover:underline'>Ashwagandha vs rhodiola</Link>
          <Link href='/top/sleep' className='text-sm font-medium text-emerald-700 hover:underline'>Best herbs for sleep</Link>
          <Link href='/top/focus' className='text-sm font-medium text-emerald-700 hover:underline'>Best supplements for focus</Link>
        </div>
      </section>
    </main>
  )
}

