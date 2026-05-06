'use client'

import { useMemo, useState } from 'react'
import PremiumCard from '@/components/ui/PremiumCard'

type BrowserItem = {
  slug: string
  title: string
  summary?: string
  href: string
  typeLabel?: string
  evidence?: string
  evidenceTier?: string
  safety?: string
  bestFor?: string
  updatedAt?: string
  primary_effects?: string[]
  effects?: string[]
  tags?: string[]
}

const goals = ['All', 'Focus', 'Sleep', 'Stress', 'Energy', 'Mood', 'Recovery']
const tiers = ['All', 'Strong', 'Moderate', 'Limited', 'Theoretical']

export default function LibraryBrowser({ eyebrow, title, description, items }: any) {
  const [goal, setGoal] = useState('All')
  const [tier, setTier] = useState('All')
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    return items
      .filter((i: BrowserItem) => {
        if (!query.trim()) return true

        const haystack = JSON.stringify(i).toLowerCase()
        return haystack.includes(query.toLowerCase())
      })
      .filter((i: BrowserItem) => {
        if (goal === 'All') return true
        return JSON.stringify(i).toLowerCase().includes(goal.toLowerCase())
      })
      .filter((i: BrowserItem) => {
        if (tier === 'All') return true
        return String(i.evidenceTier || i.evidence).toLowerCase().includes(tier.toLowerCase())
      })
  }, [items, goal, tier, query])

  return (
    <div className="mx-auto w-full max-w-7xl space-y-10 py-2">
      <section className="hero-shell overflow-hidden rounded-[2rem] border border-brand-900/10 p-6 shadow-soft sm:p-8 lg:p-10">
        <div className="max-w-3xl space-y-5">
          {eyebrow ? (
            <div className="eyebrow inline-flex rounded-full border border-brand-700/10 bg-brand-700/10 px-4 py-2 text-brand-700">
              {eyebrow}
            </div>
          ) : null}

          <div>
            <h1 className="heading-premium text-ink">
              {title}
            </h1>

            {description ? (
              <p className="text-reading mt-4 text-lg text-muted-soft">
                {description}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-4 pt-4 lg:flex-row lg:flex-wrap">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search ${title.toLowerCase()}...`}
              aria-label={`Search ${title.toLowerCase()}`}
              className="w-full min-w-0 flex-1 rounded-2xl border border-brand-900/10 bg-white/90 px-4 py-3 text-sm text-ink shadow-sm outline-none transition placeholder:text-muted-soft focus:border-brand-700/30 focus:ring-4 focus:ring-brand-500/15"
            />

            <select
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              aria-label="Filter by goal"
              className="rounded-2xl border border-brand-900/10 bg-white/85 px-4 py-3 text-sm font-medium text-ink shadow-sm outline-none transition focus:border-brand-700/30 focus:ring-4 focus:ring-brand-500/15"
            >
              {goals.map((g) => <option key={g}>{g}</option>)}
            </select>

            <select
              value={tier}
              onChange={(e) => setTier(e.target.value)}
              aria-label="Filter by evidence"
              className="rounded-2xl border border-brand-900/10 bg-white/85 px-4 py-3 text-sm font-medium text-ink shadow-sm outline-none transition focus:border-brand-700/30 focus:ring-4 focus:ring-brand-500/15"
            >
              {tiers.map((t) => <option key={t}>{t}</option>)}
            </select>

            <div className="inline-flex items-center rounded-2xl border border-brand-900/10 bg-white/70 px-4 py-3 text-sm text-muted-soft shadow-sm">
              {filtered.length} profiles
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-7 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((item: BrowserItem) => {
          const tags = (item.primary_effects || item.effects || item.tags || []).slice(0, 3)

          return (
            <PremiumCard
              key={item.slug}
              href={item.href}
              title={item.title}
              summary={item.summary}
              evidence={item.evidenceTier || item.evidence}
              safety={item.safety}
              bestFor={item.bestFor}
              tags={tags}
            />
          )
        })}
      </section>
    </div>
  )
}
