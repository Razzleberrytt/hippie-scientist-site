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
  domain?: string
  isATier?: boolean
  bestFor?: string
  evidence?: string
  safety?: string
  timeToEffect?: string
  profile_status?: string
  summary_quality?: string
  evidenceScore?: number
  evidenceTier?: string
  role?: string
  goalTags?: string[]
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

const goals = ['All', 'Focus', 'Sleep', 'Stress', 'Energy', 'Mood', 'Recovery', 'Fat Loss']
const tiers = ['All', 'High', 'Moderate', 'Limited']
const roles = ['All', 'Anchor', 'Amplifier', 'Support']

function haystack(item: BrowserItem) {
  return [item.title, item.summary, item.bestFor, item.domain, item.role, ...(item.goalTags || []), ...(item.primary_effects || []), ...(item.effects || []), ...(item.tags || [])].join(' ').toLowerCase()
}

function matchesTier(item: BrowserItem, tier: string) {
  if (tier === 'All') return true
  const value = `${item.evidenceTier || item.evidence || ''}`.toLowerCase()
  if (tier === 'High') return /high|strong|likely|effective|9|10/.test(value)
  if (tier === 'Moderate') return /moderate|mixed|emerging|6|7|8/.test(value)
  return /limited|low|insufficient|weak|1|2|3|4|5/.test(value) || !value
}

function decisionScore(item: BrowserItem) {
  let score = Number(item.evidenceScore || 0)
  if (item.profile_status === 'complete') score += 30
  if (item.summary_quality === 'strong') score += 20
  if (/high|strong/i.test(item.evidenceTier || item.evidence || '')) score += 10
  if (/moderate/i.test(item.evidenceTier || item.evidence || '')) score += 6
  return score
}

export default function LibraryBrowser({ eyebrow = 'Library', title, description, items }: Props) {
  const [goal, setGoal] = useState('All')
  const [tier, setTier] = useState('All')
  const [role, setRole] = useState('All')

  const filtered = useMemo(() => {
    return [...items]
      .filter(item => goal === 'All' || haystack(item).includes(goal.toLowerCase()))
      .filter(item => matchesTier(item, tier))
      .filter(item => role === 'All' || String(item.role || '').toLowerCase().includes(role.toLowerCase()))
      .sort((a, b) => decisionScore(b) - decisionScore(a) || a.title.localeCompare(b.title))
  }, [items, goal, tier, role])

  return (
    <div className="mx-auto w-full max-w-7xl space-y-7 py-2">
      <section className="rounded-[2rem] border border-neutral-200 bg-white p-6 shadow-card">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">{eyebrow}</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-ink sm:text-5xl">{title}</h1>
        {description ? <p className="mt-3 max-w-2xl text-base text-muted">{description}</p> : null}

        <div className="mt-6 grid gap-3 lg:grid-cols-3">
          <select value={goal} onChange={e => setGoal(e.target.value)} className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm font-semibold text-ink">
            {goals.map(value => <option key={value}>{value}</option>)}
          </select>
          <select value={tier} onChange={e => setTier(e.target.value)} className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm font-semibold text-ink">
            {tiers.map(value => <option key={value}>{value}</option>)}
          </select>
          <select value={role} onChange={e => setRole(e.target.value)} className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm font-semibold text-ink">
            {roles.map(value => <option key={value}>{value}</option>)}
          </select>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map(item => {
          const tags = (item.primary_effects || item.effects || item.tags || []).slice(0, 3)
          return (
            <Link key={item.slug} href={item.href} className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-card transition hover:border-teal-200 hover:shadow-lg">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-700">{item.typeLabel || eyebrow}</p>
                  <h2 className="mt-2 text-xl font-bold text-ink">{item.title}</h2>
                </div>
                <EvidenceBadge value={item.evidenceTier || item.evidence || 'Limited'} />
              </div>
              {item.summary ? <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted">{item.summary}</p> : null}
              <div className="mt-4 flex flex-wrap gap-2">
                {item.role ? <RoleBadge role={item.role} /> : null}
                {tags.map(tag => <span key={tag} className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-700">{tag}</span>)}
              </div>
              <p className="mt-4 text-sm font-bold text-teal-700">Open profile →</p>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
