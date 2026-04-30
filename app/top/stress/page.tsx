import type { Metadata } from 'next'
import Link from 'next/link'
import { getHerbs } from '@/lib/runtime-data'
import { getHerbSearchLinks } from '@/lib/affiliate'

type HerbRecord = {
  slug: string
  name?: string | null
  displayName?: string | null
  summary?: string | null
  description?: string | null
  evidence_grade?: string | null
  net_score?: number | string | null
  primary_effects?: unknown
  goal_tags?: unknown
  mechanism_summary?: string | null
}

const KEYWORDS = ['stress', 'anxiety', 'cortisol', 'calm', 'relax', 'adaptogen']

const text = (value: unknown): string =>
  typeof value === 'string' ? value.trim() : value === null || value === undefined ? '' : String(value).trim()

const list = (value: unknown): string[] => {
  if (Array.isArray(value)) return value.map(text).filter(Boolean)
  const normalized = text(value)
  return normalized ? normalized.split(/,|;|\|/).map(item => item.trim()).filter(Boolean) : []
}

const titleFor = (herb: HerbRecord): string =>
  text(herb.displayName) || text(herb.name) || herb.slug.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ')

const scoreFor = (herb: HerbRecord): number => {
  const raw = herb.net_score
  if (typeof raw === 'number') return Number.isFinite(raw) ? raw : 0
  if (typeof raw === 'string') {
    const parsed = Number.parseFloat(raw)
    return Number.isFinite(parsed) ? parsed : 0
  }
  return 0
}

const matchesGoal = (herb: HerbRecord): boolean => {
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

export const metadata: Metadata = {
  title: 'Best Herbs for Stress (2026 Evidence-Aware Guide)',
  description:
    'Compare herbs for stress, anxiety, calm, cortisol, and adaptogen support. Ranked from The Hippie Scientist workbook dataset with safety-first context.',
  alternates: { canonical: '/top/stress' },
}

export default async function StressPage() {
  const herbs = (await getHerbs()) as HerbRecord[]
  const ranked = herbs.filter(matchesGoal).sort((a, b) => scoreFor(b) - scoreFor(a)).slice(0, 12)

  return (
    <main className='mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6 lg:px-8'>
      <section className='rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.16),transparent_35%),linear-gradient(135deg,rgba(255,255,255,0.07),rgba(255,255,255,0.025))] p-6 shadow-2xl shadow-black/25 sm:p-8'>
        <p className='text-xs font-bold uppercase tracking-[0.2em] text-emerald-100/70'>Stress guide</p>
        <h1 className='mt-3 text-4xl font-black tracking-tight text-white sm:text-6xl'>Best Herbs for Stress</h1>
        <p className='mt-4 max-w-3xl text-base leading-7 text-white/70'>
          These herbs are commonly connected with stress, anxiety, calm, cortisol, and adaptogen-style support. Rankings use the current workbook dataset as a discovery layer, not as personal medical advice.
        </p>
      </section>

      <section className='rounded-3xl border border-white/10 bg-white/[0.035] p-5 sm:p-6'>
        <h2 className='text-2xl font-bold text-white'>What herbs help with stress and anxiety?</h2>
        <p className='mt-3 text-sm leading-6 text-white/65'>
          Common stress-support herbs include adaptogens and calming botanicals such as ashwagandha, rhodiola, lemon balm, passionflower, and other plants that may appear in the dataset when their profile mentions stress, calm, cortisol, anxiety, relaxation, or adaptogen context.
        </p>
        <div className='mt-4 flex flex-wrap gap-2'>
          <Link href='/compare/ashwagandha-vs-rhodiola-rosea' className='rounded-2xl border border-emerald-300/20 bg-emerald-300/10 px-4 py-2 text-sm font-bold text-emerald-100 hover:bg-emerald-300/15'>Compare ashwagandha vs rhodiola</Link>
          <Link href='/top/sleep' className='rounded-2xl border border-white/10 px-4 py-2 text-sm font-bold text-white/70 hover:bg-white/5'>Best herbs for sleep</Link>
          <Link href='/top/focus' className='rounded-2xl border border-white/10 px-4 py-2 text-sm font-bold text-white/70 hover:bg-white/5'>Best supplements for focus</Link>
        </div>
      </section>

      <section className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
        {ranked.map((herb, index) => {
          const label = titleFor(herb)
          const links = getHerbSearchLinks(label)
          return (
            <article key={herb.slug} className='rounded-3xl border border-white/10 bg-white/[0.04] p-5'>
              <div className='flex items-start justify-between gap-3'>
                <h2 className='text-xl font-bold text-white'>#{index + 1} {label}</h2>
                <span className='rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-white/55'>Score {scoreFor(herb) || 'N/A'}</span>
              </div>
              <p className='mt-3 text-sm leading-6 text-white/65'>{text(herb.summary) || text(herb.description) || 'Profile summary coming soon.'}</p>
              <div className='mt-4 flex flex-wrap gap-2'>
                <Link href={`/herbs/${herb.slug}/`} className='rounded-2xl border border-white/10 px-4 py-2 text-sm font-bold text-white/75 transition hover:bg-white/5 hover:text-white'>Read {label} profile</Link>
                {links[0] ? <a href={links[0].url} target='_blank' rel='noopener noreferrer sponsored' className='rounded-2xl bg-emerald-300 px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-emerald-200'>Compare {label} products →</a> : null}
              </div>
            </article>
          )
        })}
      </section>

      <section className='rounded-3xl border border-white/10 bg-white/[0.035] p-5'>
        <h2 className='text-2xl font-bold text-white'>Related natural wellness guides</h2>
        <div className='mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
          <Link href='/top/sleep' className='rounded-2xl border border-violet-300/20 bg-violet-300/10 p-4 text-white hover:bg-violet-300/15'>Best herbs for sleep</Link>
          <Link href='/top/focus' className='rounded-2xl border border-blue-300/20 bg-blue-300/10 p-4 text-white hover:bg-blue-300/15'>Best supplements for focus</Link>
          <Link href='/herbs' className='rounded-2xl border border-emerald-300/20 bg-emerald-300/10 p-4 text-white hover:bg-emerald-300/15'>Browse all herbs</Link>
        </div>
      </section>
    </main>
  )
}
