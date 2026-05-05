'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { EvidenceBadge, RoleBadge } from '@/components/ui/Card'

type BrowserItem = {
  slug: string
  title: string
  summary?: string
  href: string
  typeLabel?: string
  evidence?: string
  evidenceTier?: string
  role?: string
  updatedAt?: string
  primary_effects?: string[]
  effects?: string[]
  tags?: string[]
}

const goals = ['All', 'Focus', 'Sleep', 'Stress', 'Energy', 'Mood', 'Recovery']
const tiers = ['All', 'High', 'Moderate', 'Limited']

export default function LibraryBrowser({ title, description, items }: any) {
  const [goal, setGoal] = useState('All')
  const [tier, setTier] = useState('All')

  const filtered = useMemo(() => {
    return items
      .filter((i: any) => goal === 'All' || JSON.stringify(i).toLowerCase().includes(goal.toLowerCase()))
      .filter((i: any) => tier === 'All' || String(i.evidenceTier || i.evidence).toLowerCase().includes(tier.toLowerCase()))
  }, [items, goal, tier])

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 py-2">
      <section className="rounded-[2rem] border border-neutral-200 bg-white p-6 shadow-card">
        <h1 className="text-4xl font-bold text-ink">{title}</h1>
        {description && <p className="mt-2 text-muted">{description}</p>}

        <div className="mt-5 flex gap-3 flex-wrap">
          <select value={goal} onChange={e => setGoal(e.target.value)} className="rounded-xl border px-4 py-2">
            {goals.map(g => <option key={g}>{g}</option>)}
          </select>
          <select value={tier} onChange={e => setTier(e.target.value)} className="rounded-xl border px-4 py-2">
            {tiers.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((item: any) => {
          const tags = (item.primary_effects || item.effects || item.tags || []).slice(0, 3)
          return (
            <Link key={item.slug} href={item.href} className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-card">
              <div className="flex justify-between">
                <h2 className="text-lg font-bold text-ink">{item.title}</h2>
                <EvidenceBadge value={item.evidenceTier || item.evidence} />
              </div>

              {tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {tags.map((t: string) => <span key={t} className="text-xs bg-neutral-100 px-3 py-1 rounded-full">{t}</span>)}
                </div>
              )}

              {item.updatedAt && (
                <p className="mt-3 text-xs text-muted">Updated {item.updatedAt}</p>
              )}

              <p className="mt-4 text-sm font-bold text-teal-700">Open →</p>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
