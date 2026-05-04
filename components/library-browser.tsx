'use client'

import { useMemo, useState } from 'react'
import Card from '@/components/Card'

type BrowserItem = {
  slug: string
  title: string
  summary?: string
  href: string
  typeLabel?: string
  domain?: string
  isATier?: boolean
  meta?: string[]
  bestFor?: string
  evidence?: string
  safety?: string
  timeToEffect?: string
  profile_status?: string
  summary_quality?: string
  evidenceScore?: number
  evidenceTier?: string
  primary_effects?: string[]
  effects?: string[]
  tags?: string[]
}

type Props = {
  eyebrow?: string
  title: string
  description?: string
  items: BrowserItem[]
}

const goals = [
  'All',
  'Focus',
  'Sleep',
  'Anxiety',
  'Energy',
  'Fat Loss',
  'Mood',
  'Recovery',
]

function decisionScore(item: BrowserItem) {
  let score = 0
  if (item.profile_status === 'complete') score += 30
  if (item.summary_quality === 'strong') score += 20
  if (item.evidenceScore) score += item.evidenceScore
  const tier = (item.evidenceTier || '').toLowerCase()
  if (tier.includes('high')) score += 10
  if (tier.includes('moderate')) score += 6
  return score
}

export default function LibraryBrowser({ eyebrow = 'Library', title, description, items }: Props) {
  const [activeGoal, setActiveGoal] = useState('All')

  const filtered = useMemo(() => {
    let list = [...items]

    if (activeGoal !== 'All') {
      const goal = activeGoal.toLowerCase()
      list = list.filter(item => {
        const text = [
          item.bestFor,
          ...(item.primary_effects || []),
          ...(item.effects || []),
          ...(item.tags || []),
        ]
          .join(' ')
          .toLowerCase()
        return text.includes(goal)
      })
    }

    list.sort((a, b) => decisionScore(b) - decisionScore(a))

    return list
  }, [items, activeGoal])

  return (
    <div className="mx-auto w-full max-w-7xl space-y-7 py-2">
      <section className="rounded-[2rem] bg-slate-950 p-6 text-white">
        <p className="text-xs font-black uppercase tracking-[0.26em] text-emerald-200/75">{eyebrow}</p>
        <h1 className="mt-3 text-4xl font-black sm:text-6xl">{title}</h1>
        {description ? <p className="mt-4 text-base text-white/70">{description}</p> : null}

        <div className="mt-5 flex flex-wrap gap-2">
          {goals.map(goal => (
            <button
              key={goal}
              onClick={() => setActiveGoal(goal)}
              className={`rounded-full px-4 py-2 text-xs font-black transition ${
                activeGoal === goal ? 'bg-white text-black' : 'bg-white/10 text-white/70'
              }`}
            >
              {goal}
            </button>
          ))}
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map(item => (
          <Card
            key={item.slug}
            title={item.title}
            subtitle={item.domain || item.typeLabel}
            description={item.summary}
            href={item.href}
            badge={item.isATier ? 'Top pick' : item.typeLabel}
            bestFor={item.bestFor}
            evidence={item.evidence}
            safety={item.safety}
            timeToEffect={item.timeToEffect}
          />
        ))}
      </div>
    </div>
  )
}
