'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { GlassCard } from '@/components/ui/GlassCard'
import { listContainer, listItem, springConfig } from '@/utils/springConfig'
import { cleanSummary, editorialUseCaseLabel, isClean } from '@/lib/display-utils'

type CompoundItem = {
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
  primary_effects?: string[]
  effects?: string[]
  tags?: string[]
}

type Props = { items: CompoundItem[] }

const filters = ['All', 'Focus', 'Sleep', 'Mood', 'Energy', 'Recovery', 'Stress', 'Fat Loss']

const clean = (value?: string) => (value ?? '').replace(/\s+/g, ' ').trim()

function score(item: CompoundItem) {
  let total = Number(item.evidenceScore || 0)
  if (item.isATier) total += 25
  if (item.profile_status === 'complete') total += 20
  if (item.summary_quality === 'strong') total += 15
  if (/high/i.test(item.evidenceTier || '')) total += 12
  if (/moderate/i.test(item.evidenceTier || '')) total += 8
  return total
}

function matchesFilter(item: CompoundItem, filter: string) {
  if (filter === 'All') return true
  const haystack = [
    item.title,
    item.summary,
    item.bestFor,
    item.domain,
    ...(item.primary_effects || []),
    ...(item.effects || []),
    ...(item.tags || []),
  ].join(' ').toLowerCase()
  return haystack.includes(filter.toLowerCase())
}

function EvidencePill({ value }: { value?: string }) {
  const text = clean(value) || 'Limited'
  const tone = /high|9|10/i.test(text)
    ? 'border-evidence-high/30 bg-evidence-high/10 text-evidence-high'
    : /moderate|6|7|8/i.test(text)
      ? 'border-evidence-moderate/30 bg-evidence-moderate/10 text-evidence-moderate'
      : 'border-evidence-limited/30 bg-evidence-limited/10 text-evidence-limited'
  return <span className={`rounded-full border px-2.5 py-1 text-[11px] font-bold ${tone}`}>{text}</span>
}

function CompoundCard({ item, index }: { item: CompoundItem; index: number }) {
  return (
    <motion.div variants={listItem} transition={{ ...springConfig.gentle, delay: Math.min(index * 0.015, 0.18) }}>
      <Link href={item.href} className="group block focus:outline-none">
        <GlassCard variant={item.isATier ? 'glow' : 'standard'} className="min-h-[260px] p-5 sm:p-6" delay={Math.min(index * 0.01, 0.16)}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-black uppercase tracking-[0.22em] text-brand/70">
                {item.domain || item.typeLabel || 'Compound'}
              </p>
              <h2 className="mt-2 line-clamp-2 text-2xl font-black tracking-[-0.04em] text-ink transition group-hover:text-brand">
                {item.title}
              </h2>
            </div>
            {item.isATier ? <span className="shrink-0 rounded-full border border-brand/40 bg-brand/15 px-2.5 py-1 text-[11px] font-black text-brand">Top</span> : null}
          </div>

          {item.summary && isClean(item.summary) ? <p className="mt-4 line-clamp-3 text-sm leading-6 text-[#46574d]">{cleanSummary(item.summary, 'compound')}</p> : null}

          <div className="mt-5 rounded-2xl border border-brand-900/10 bg-white/75 p-3">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#66756d]">Best for</p>
            <p className="mt-1 text-sm font-bold text-ink">{isClean(item.bestFor) ? editorialUseCaseLabel(item.bestFor) : 'General support'}</p>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="rounded-2xl border border-brand-900/10 bg-white/75 p-2.5">
              <p className="text-[9px] font-black uppercase tracking-[0.16em] text-[#7b887f]">Evidence</p>
              <div className="mt-1"><EvidencePill value={item.evidence} /></div>
            </div>
            <div className="rounded-2xl border border-brand-900/10 bg-white/75 p-2.5">
              <p className="text-[9px] font-black uppercase tracking-[0.16em] text-[#7b887f]">Safety</p>
              <p className="mt-1 truncate text-xs font-bold text-[#33443a]">{isClean(item.safety) ? item.safety : 'Review'}</p>
            </div>
            <div className="rounded-2xl border border-brand-900/10 bg-white/75 p-2.5">
              <p className="text-[9px] font-black uppercase tracking-[0.16em] text-[#7b887f]">Onset</p>
              <p className="mt-1 truncate text-xs font-bold text-[#33443a]">{item.timeToEffect || 'See profile'}</p>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between border-t border-brand-900/10 pt-4">
            <span className="text-xs font-bold text-[#66756d]">Decision profile</span>
            <motion.span transition={springConfig.micro} className="text-sm font-black text-brand group-hover:translate-x-1">
              Open →
            </motion.span>
          </div>
        </GlassCard>
      </Link>
    </motion.div>
  )
}

export default function CompoundsBrowserV2({ items }: Props) {
  const [activeFilter, setActiveFilter] = useState('All')
  const [query, setQuery] = useState('')
  const { scrollYProgress } = useScroll()
  const y = useTransform(scrollYProgress, [0, 0.2, 1], [18, 0, -10])
  const opacity = useTransform(scrollYProgress, [0, 0.08, 1], [0.88, 1, 1])
  const scale = useTransform(scrollYProgress, [0, 0.18, 1], [0.96, 1, 1])

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return [...items]
      .filter(item => matchesFilter(item, activeFilter))
      .filter(item => {
        if (!q) return true
        return [item.title, item.summary, item.bestFor, item.domain, ...(item.tags || [])].join(' ').toLowerCase().includes(q)
      })
      .sort((a, b) => score(b) - score(a) || a.title.localeCompare(b.title))
  }, [items, activeFilter, query])

  return (
    <main className="mx-auto w-full max-w-7xl space-y-8 pb-[calc(6rem+env(safe-area-inset-bottom))] text-ink">
      <section className="relative overflow-hidden rounded-[2rem] border border-brand-900/10 bg-white/85 p-5 shadow-glass backdrop-blur-md sm:p-8 lg:p-10">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand/20 blur-3xl" />
        <div className="absolute -bottom-28 left-1/4 h-72 w-72 rounded-full bg-info/10 blur-3xl" />
        <div className="relative z-10 grid gap-7 lg:grid-cols-[1fr_0.75fr] lg:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.28em] text-brand/70">Compound decision engine</p>
            <h1 className="mt-4 max-w-3xl text-5xl font-black leading-[0.93] tracking-[-0.07em] text-ink sm:text-7xl">
              Browse compounds without the supplement-store noise
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[#46574d] sm:text-lg">
              Scan evidence, safety, onset, and practical fit before opening a full compound profile.
            </p>
          </div>
          <GlassCard variant="frosted" className="p-4" enableShine={false}>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-3xl font-black text-ink">{items.length}</p>
                <p className="mt-1 text-[10px] font-black uppercase tracking-[0.16em] text-[#66756d]">Profiles</p>
              </div>
              <div>
                <p className="text-3xl font-black text-brand">{items.filter(i => i.isATier).length}</p>
                <p className="mt-1 text-[10px] font-black uppercase tracking-[0.16em] text-[#66756d]">Top picks</p>
              </div>
              <div>
                <p className="text-3xl font-black text-info">{visible.length}</p>
                <p className="mt-1 text-[10px] font-black uppercase tracking-[0.16em] text-[#66756d]">Showing</p>
              </div>
            </div>
          </GlassCard>
        </div>
      </section>

      <section className="sticky top-16 z-20 rounded-[1.5rem] border border-brand-900/10 bg-white/90 p-3 backdrop-blur-xl">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <label className="sr-only" htmlFor="compound-search">Search compounds</label>
          <input
            id="compound-search"
            value={query}
            onChange={event => setQuery(event.target.value)}
            placeholder="Search creatine, magnesium, berberine..."
            className="min-h-12 rounded-2xl border border-brand-900/10 bg-white/90 px-4 text-sm font-semibold text-ink outline-none placeholder:text-[#7b887f] focus:border-brand/50 focus:ring-4 focus:ring-brand/10"
          />
          <div className="flex gap-2 overflow-x-auto pb-1 lg:pb-0">
            {filters.map(filter => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`min-h-11 shrink-0 rounded-full px-4 text-xs font-black transition ${
                  activeFilter === filter
                    ? 'bg-brand-100 text-brand-900 shadow-glow'
                    : 'border border-brand-900/10 bg-white/75 text-[#46574d] hover:text-brand-800'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </section>

      <motion.section variants={listContainer} initial="hidden" animate="show" className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {visible.map((item, index) => <CompoundCard key={item.slug} item={item} index={index} />)}
      </motion.section>

      {!visible.length ? (
        <GlassCard variant="standard" className="p-8 text-center" enableShine={false}>
          <h2 className="text-2xl font-black">No compounds found</h2>
          <p className="mt-2 text-sm text-[#46574d]">Try a broader search or switch the filter back to All.</p>
        </GlassCard>
      ) : null}

      <motion.div style={{ y, opacity, scale }} className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] left-1/2 z-40 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 lg:right-6 lg:left-auto lg:w-80 lg:translate-x-0">
        <Link href="/compare" className="group block rounded-3xl border border-brand/35 bg-brand/15 p-2 shadow-glow backdrop-blur-xl">
          <div className="rounded-2xl bg-brand px-5 py-4 text-center text-sm font-black text-ink transition group-hover:scale-[1.01]">
            Start assessment →
          </div>
        </Link>
      </motion.div>
    </main>
  )
}
