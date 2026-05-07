import type { Metadata } from 'next'
import Link from 'next/link'
import { getHerbs } from '@/lib/runtime-data'
import { getHerbSearchLinks } from '@/lib/affiliate'
import { cleanSummary } from '@/lib/display-utils'

type SleepHerb = {
  slug: string
  name?: string
  displayName?: string
  evidence_grade?: string
  net_score?: number | string
  primary_effects?: string[] | string
  goal_tags?: string[] | string
  mechanism_summary?: string
  summary?: string
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
  return herb.slug.split('-').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ')
}

const includesSleep = (herb: SleepHerb): boolean => {
  const primaryEffects = normalizeArray(herb.primary_effects)
  const goalTags = normalizeArray(herb.goal_tags)
  return [...primaryEffects, ...goalTags].includes('sleep')
}

export const metadata: Metadata = {
  title: 'Best Herbs for Sleep (Natural Sleep Aids Guide 2026)',
  description:
    'Discover natural sleep aids and herbs for insomnia, relaxation, and better rest. Ranked using evidence, mechanisms, and real-world usage.',
  alternates: { canonical: '/top/sleep' },
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
    <main className='mx-auto max-w-6xl space-y-6 px-4 py-8 text-white'>
      <section className='rounded-[2rem] border border-white/10 bg-white/[0.04] p-6'>
        <h1 className='text-4xl font-bold'>Best Herbs for Sleep</h1>
        <p className='mt-4 text-white/70'>
          These herbs are commonly used as natural sleep aids for insomnia, relaxation, and improving sleep quality.
        </p>
      </section>

      <section className='rounded-3xl border border-white/10 bg-white/[0.035] p-5'>
        <h2 className='text-2xl font-bold'>What herbs help with sleep and insomnia?</h2>
        <p className='mt-3 text-white/65'>
          Natural sleep herbs often support relaxation, reduce stress, or improve sleep onset. Popular examples include valerian, ashwagandha, lemon balm, and calming botanicals.
        </p>
        <div className='mt-4 flex flex-wrap gap-2'>
          <Link href='/compare/ashwagandha-vs-rhodiola-rosea'>Ashwagandha vs Rhodiola</Link>
          <Link href='/top/stress'>Best herbs for stress</Link>
          <Link href='/top/focus'>Best supplements for focus</Link>
        </div>
      </section>

      <section>
        <h2 className='text-xl font-semibold'>Top 3 Herbs</h2>
        <div className='mt-4 grid gap-4'>
          {topThree.map(herb => {
            const label = herbLabel(herb)
            const links = getHerbSearchLinks(label)
            return (
              <article key={herb.slug} className='border p-4 rounded-xl'>
                <h3 className='text-lg font-semibold'>{label}</h3>
                <p className='mt-2 text-sm text-white/70'>
                  {cleanSummary(herb.mechanism_summary || herb.summary, 'herb')}
                </p>
                <div className='mt-3 flex gap-2 flex-wrap'>
                  <Link href={`/herbs/${herb.slug}`}>Read {label} profile</Link>
                  {links[0] && (
                    <a href={links[0].url} target='_blank'>Compare {label} products →</a>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      </section>

      <section className='border-t border-white/10 pt-6'>
        <h2 className='text-2xl font-bold'>Related guides</h2>
        <div className='mt-3 flex gap-3 flex-wrap'>
          <Link href='/top/stress'>Best herbs for stress</Link>
          <Link href='/top/focus'>Best supplements for focus</Link>
        </div>
      </section>
    </main>
  )
}
