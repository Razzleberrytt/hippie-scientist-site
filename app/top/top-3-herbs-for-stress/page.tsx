import type { Metadata } from 'next'
import Link from 'next/link'
import { getHerbs } from '@/lib/runtime-data'
import { getHerbSearchLinks } from '@/lib/affiliate'

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

  return STRESS_KEYWORDS.some(keyword => haystack.includes(keyword))
}

const summaryFor = (herb: Herb): string => {
  const value = text(herb.mechanism_summary) || text(herb.summary) || text(herb.description) || 'Profile details are still being expanded from the workbook.'
  return value.length > 220 ? `${value.slice(0, 219).trimEnd()}…` : value
}

export const metadata: Metadata = {
  title: 'Top 3 Herbs for Stress (2026 Guide)',
  description:
    'A simple guide to the top 3 herbs for stress, anxiety, calm, and cortisol support with profile links and product comparison paths.',
  alternates: { canonical: '/top/top-3-herbs-for-stress' },
}

export default async function TopThreeStressHerbsPage() {
  const herbs = (await getHerbs()) as Herb[]
  const bySlug = new Map(herbs.map(herb => [herb.slug, herb]))

  const preferred = preferredSlugs
    .map(slug => bySlug.get(slug))
    .filter((herb): herb is Herb => Boolean(herb))

  const fallback = herbs
    .filter(herb => matchesStress(herb) && !preferred.some(item => item.slug === herb.slug))
    .sort((a, b) => scoreFor(b) - scoreFor(a))
    .slice(0, Math.max(0, 3 - preferred.length))

  const picks = [...preferred, ...fallback].slice(0, 3)

  return (
    <main className='mx-auto max-w-5xl space-y-6 px-4 py-8 text-white sm:px-6 lg:px-8'>
      <section className='rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.18),transparent_35%),linear-gradient(135deg,rgba(255,255,255,0.07),rgba(255,255,255,0.025))] p-6 shadow-2xl shadow-black/25 sm:p-8'>
        <p className='text-xs font-bold uppercase tracking-[0.2em] text-emerald-100/70'>Quick guide</p>
        <h1 className='mt-3 text-4xl font-black tracking-tight sm:text-6xl'>Top 3 Herbs for Stress</h1>
        <p className='mt-4 max-w-3xl text-base leading-7 text-white/70'>
          A practical starting point for stress, anxiety, calm, and adaptogen-style support. This is educational research context, not medical advice.
        </p>
      </section>

      <section className='rounded-3xl border border-white/10 bg-white/[0.035] p-5 sm:p-6'>
        <h2 className='text-2xl font-bold'>Fast answer</h2>
        <ul className='mt-4 space-y-3 text-sm leading-6 text-white/70'>
          <li><strong className='text-white'>Ashwagandha</strong> is commonly discussed for long-term stress and calm support.</li>
          <li><strong className='text-white'>Rhodiola rosea</strong> is often framed around fatigue, resilience, and stress-linked energy.</li>
          <li><strong className='text-white'>Lemon balm</strong> is a gentler calming herb often connected with relaxation.</li>
        </ul>
      </section>

      <section className='grid gap-4'>
        {picks.map((herb, index) => {
          const label = labelFor(herb)
          const links = getHerbSearchLinks(label)
          return (
            <article key={herb.slug} className='rounded-3xl border border-white/10 bg-white/[0.04] p-5'>
              <div className='flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
                <div>
                  <p className='text-xs font-bold uppercase tracking-[0.2em] text-emerald-100/65'>Pick #{index + 1}</p>
                  <h2 className='mt-2 text-3xl font-bold'>{label}</h2>
                </div>
                <span className='w-fit rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-white/55'>Score {scoreFor(herb) || 'N/A'}</span>
              </div>

              <p className='mt-4 text-sm leading-6 text-white/68'>{summaryFor(herb)}</p>

              <div className='mt-5 flex flex-wrap gap-2'>
                <Link href={`/herbs/${herb.slug}/`} className='rounded-2xl border border-white/10 px-4 py-2 text-sm font-bold text-white/75 transition hover:bg-white/5 hover:text-white'>Read {label} profile</Link>
                {links[0] ? (
                  <a href={links[0].url} target='_blank' rel='noopener noreferrer sponsored' className='rounded-2xl bg-emerald-300 px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-emerald-200'>Compare {label} products →</a>
                ) : null}
              </div>
            </article>
          )
        })}
      </section>

      <section className='rounded-3xl border border-white/10 bg-white/[0.035] p-5'>
        <h2 className='text-2xl font-bold'>Related guides</h2>
        <div className='mt-4 flex flex-wrap gap-2'>
          <Link href='/top/stress' className='rounded-2xl border border-emerald-300/20 bg-emerald-300/10 px-4 py-2 text-sm font-bold text-emerald-100 hover:bg-emerald-300/15'>Best herbs for stress</Link>
          <Link href='/compare/ashwagandha-vs-rhodiola-rosea' className='rounded-2xl border border-white/10 px-4 py-2 text-sm font-bold text-white/70 hover:bg-white/5'>Ashwagandha vs rhodiola</Link>
          <Link href='/top/sleep' className='rounded-2xl border border-white/10 px-4 py-2 text-sm font-bold text-white/70 hover:bg-white/5'>Best herbs for sleep</Link>
          <Link href='/top/focus' className='rounded-2xl border border-white/10 px-4 py-2 text-sm font-bold text-white/70 hover:bg-white/5'>Best supplements for focus</Link>
        </div>
      </section>
    </main>
  )
}
