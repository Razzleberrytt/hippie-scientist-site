'use client'

import { useMemo, useState } from 'react'
import HerbCard from '@/components/herbs/HerbCard'
import CompoundCard from '@/components/compounds/CompoundCard'

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

const tiers = ['All', 'Strong', 'Moderate', 'Limited', 'Theoretical']

export default function LibraryBrowser({ eyebrow, title, description, items }: any) {
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
        if (tier === 'All') return true
        return String(i.evidenceTier || i.evidence).toLowerCase().includes(tier.toLowerCase())
      })
  }, [items, tier, query])

  const isHerbs = title.toLowerCase().includes('herb')

  return (
    <div className="container-page section-spacing py-8 sm:py-12 lg:py-14">
      <section className="hero-shell overflow-hidden rounded-[2.2rem] border border-brand-900/10 card-spacing shadow-soft">
        <div className="max-w-4xl section-spacing">
          {eyebrow ? (
            <div className="eyebrow-label inline-flex rounded-full border border-brand-700/10 bg-white/60 px-4 py-2 backdrop-blur-md">
              {eyebrow}
            </div>
          ) : null}

          <div className="space-y-6">
            <h1 className="heading-premium max-w-4xl text-balance text-ink">
              {title}
            </h1>

            {description ? (
              <p className="text-reading max-w-2xl text-lg text-muted-soft sm:text-xl">
                {description}
              </p>
            ) : null}
          </div>
        </div>
      </section>

      <section className="surface-subtle card-spacing">
        <div className="grid gap-4 lg:grid-cols-[1fr_220px_auto]">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${title.toLowerCase()}...`}
            aria-label={`Search ${title.toLowerCase()}`}
            className="rounded-2xl border border-brand-900/10 bg-white/80 px-5 py-3 text-sm text-ink shadow-sm outline-none transition placeholder:text-muted-soft focus:border-brand-700/30 focus:ring-4 focus:ring-brand-500/15"
          />

          <select
            value={tier}
            onChange={(e) => setTier(e.target.value)}
            aria-label="Filter by evidence"
            className="rounded-2xl border border-brand-900/10 bg-white/80 px-4 py-3 text-sm font-medium text-ink shadow-sm outline-none transition focus:border-brand-700/30 focus:ring-4 focus:ring-brand-500/15"
          >
            {tiers.map((t) => <option key={t}>{t}</option>)}
          </select>

          <div className="inline-flex items-center justify-center rounded-2xl border border-brand-900/10 bg-white/70 px-4 py-3 text-sm text-muted-soft shadow-sm">
            {filtered.length} profiles
          </div>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((item: BrowserItem) => {
          if (isHerbs) {
            return <HerbCard key={item.slug} herb={item as any} />
          }

          return <CompoundCard key={item.slug} compound={item as any} />
        })}
      </section>
    </div>
  )
}
