import type { Metadata } from 'next'
import Link from 'next/link'
import { getHerbs } from '@/lib/runtime-data'
import { getHerbSearchLinks } from '@/lib/affiliate'

type SleepHerb = {
  slug: string
  name?: string
  displayName?: string
  evidence_grade?: string
  net_score?: number | string
  primary_effects?: string[] | string
  goal_tags?: string[] | string
  mechanism_summary?: string
}

const EVIDENCE_WEIGHT: Record<string, number> = { A: 3, B: 2, C: 1 }

const normalizeArray = (value: string[] | string | undefined): string[] => {
  if (!value) return []
  if (Array.isArray(value)) return value.map(item => String(item).trim().toLowerCase()).filter(Boolean)
  return value.split(',').map(item => item.trim().toLowerCase()).filter(Boolean)
}

const toScore = (value: number | string | undefined): number => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : -Infinity
  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value)
    return Number.isFinite(parsed) ? parsed : -Infinity
  }
  return -Infinity
}

const getEvidenceRank = (grade?: string): number => EVIDENCE_WEIGHT[(grade ?? '').trim().toUpperCase()] ?? 0

const herbLabel = (herb: SleepHerb): string => {
  const preferred = herb.displayName?.trim() || herb.name?.trim()
  if (preferred) return preferred
  return herb.slug
    .split('-')
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

const includesSleep = (herb: SleepHerb): boolean => {
  const primaryEffects = normalizeArray(herb.primary_effects)
  const goalTags = normalizeArray(herb.goal_tags)
  return [...primaryEffects, ...goalTags].includes('sleep')
}

export const metadata: Metadata = {
  title: 'Top Herbs for Sleep',
  description: 'Ranked sleep-support herbs using dataset-driven evidence grade and net score.',
}

export default async function TopSleepPage() {
  const herbs = (await getHerbs()) as SleepHerb[]

  const ranked = herbs
    .filter(includesSleep)
    .sort((a, b) => {
      const scoreDiff = toScore(b.net_score) - toScore(a.net_score)
      if (scoreDiff !== 0) return scoreDiff
      return getEvidenceRank(b.evidence_grade) - getEvidenceRank(a.evidence_grade)
    })

  const topThree = ranked.slice(0, 3)

  return (
    <main className='min-h-screen bg-slate-950 text-slate-100'>
      <div className='mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8'>
        <section className='space-y-3'>
          <p className='text-xs uppercase tracking-[0.2em] text-cyan-300'>Top Picks</p>
          <h1 className='text-3xl font-semibold sm:text-4xl'>Top Herbs for Sleep</h1>
          <p className='max-w-2xl text-sm text-slate-300 sm:text-base'>
            Ranked from the live dataset by net score, then evidence grade.
          </p>
        </section>

        <section className='mt-8'>
          <h2 className='text-xl font-semibold'>Top 3 Herbs</h2>
          <div className='mt-4 grid gap-4'>
            {topThree.map(herb => {
              const label = herbLabel(herb)
              const links = getHerbSearchLinks(label)
              return (
                <article key={herb.slug} className='rounded-xl border border-slate-800 bg-slate-900 p-4'>
                  <div className='flex items-center justify-between gap-3'>
                    <h3 className='text-lg font-semibold'>{label}</h3>
                    <span className='rounded-full bg-slate-800 px-2 py-1 text-xs'>Evidence {herb.evidence_grade ?? 'N/A'}</span>
                  </div>
                  <p className='mt-3 text-sm text-slate-300'>
                    {herb.mechanism_summary?.trim() || 'Mechanism summary not yet available in dataset.'}
                  </p>
                  <div className='mt-4 flex flex-wrap gap-2'>
                    {links.map(link => (
                      <a key={link.url} href={link.url} target='_blank' rel='nofollow sponsored noopener noreferrer' className='rounded-md bg-cyan-500/20 px-3 py-1.5 text-sm text-cyan-200 hover:bg-cyan-500/30'>
                        {link.label}
                      </a>
                    ))}
                    <Link href={`/herbs/${herb.slug}`} className='rounded-md border border-slate-700 px-3 py-1.5 text-sm text-slate-200 hover:bg-slate-800'>
                      View profile
                    </Link>
                  </div>
                </article>
              )
            })}
          </div>
        </section>

        <section className='mt-10'>
          <h2 className='text-xl font-semibold'>Full Ranked List</h2>
          <div className='mt-4 grid gap-3'>
            {ranked.map(herb => {
              const label = herbLabel(herb)
              const effects = normalizeArray(herb.primary_effects)
              const links = getHerbSearchLinks(label)
              return (
                <article key={herb.slug} className='rounded-lg border border-slate-800 bg-slate-900 p-4'>
                  <h3 className='text-base font-semibold'>{label}</h3>
                  <p className='mt-1 text-sm text-slate-300'>Evidence grade: {herb.evidence_grade ?? 'N/A'}</p>
                  <p className='text-sm text-slate-300'>Net score: {Number.isFinite(toScore(herb.net_score)) ? toScore(herb.net_score) : 'N/A'}</p>
                  <p className='mt-1 text-sm text-slate-300'>Primary effects: {effects.length > 0 ? effects.join(', ') : 'N/A'}</p>
                  <div className='mt-3 flex flex-wrap gap-2'>
                    {links.map(link => (
                      <a key={link.url} href={link.url} target='_blank' rel='nofollow sponsored noopener noreferrer' className='rounded-md bg-slate-800 px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-700'>
                        {link.label}
                      </a>
                    ))}
                  </div>
                </article>
              )
            })}
          </div>
        </section>

        <section className='mt-10 rounded-xl border border-slate-800 bg-slate-900 p-4'>
          <h2 className='text-xl font-semibold'>Decision Helper</h2>
          <ul className='mt-3 space-y-2 text-sm text-slate-200'>
            <li><span className='text-cyan-300'>Sleep latency</span> → valerian</li>
            <li><span className='text-cyan-300'>Stress-linked sleep issues</span> → ashwagandha</li>
            <li><span className='text-cyan-300'>Mild calm support</span> → lemon balm</li>
          </ul>
        </section>
      </div>
    </main>
  )
}
