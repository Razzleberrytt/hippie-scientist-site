'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import type { ResearchReview, ResearchTopic } from '@/lib/mental-health-research-directory'

const groups: Array<{ id: ResearchTopic; label: string; description: string }> = [
  { id: 'relationships', label: 'Relationships & attachment', description: 'Limerence, attachment patterns, relationship grief, boundaries and safety' },
  { id: 'personality', label: 'Personality & diagnosis', description: 'Personality disorders, diagnostic overlap and long-term recovery evidence' },
  { id: 'emotions', label: 'Emotions & attention', description: 'Rejection sensitivity, dysregulation, rumination and emotional experiences' },
]

export function MentalHealthResearchDirectory({ reviews }: { reviews: ResearchReview[] }) {
  const [query, setQuery] = useState('')
  const [selectedTopic, setSelectedTopic] = useState<ResearchTopic | 'all'>('all')
  const search = query.trim().toLocaleLowerCase('en-US')

  const matches = useMemo(() => reviews.filter((review) => {
    if (selectedTopic !== 'all' && review.topic !== selectedTopic) return false
    return !search || (review.title + ' ' + review.description).toLocaleLowerCase('en-US').includes(search)
  }), [reviews, search, selectedTopic])

  return (
    <section id="research-directory" aria-labelledby="research-directory-title" className="mt-10 scroll-mt-24 rounded-3xl border border-[var(--border-soft)] bg-[var(--surface-subtle)] p-4 sm:p-7">
      <div className="max-w-3xl">
        <span className="text-xs font-bold uppercase tracking-widest text-[var(--accent-primary)]">Published evidence reviews</span>
        <h2 id="research-directory-title" className="mt-2 text-2xl font-bold text-ink sm:text-3xl">Find mental health research by topic</h2>
        <p className="mt-3 text-sm leading-6 text-muted">Search article titles or choose a topic. Browse evidence reviews on relationships, personality, mood and attention.</p>
      </div>
      <div className="mt-6 max-w-2xl">
        <label htmlFor="mental-health-research-search" className="block text-sm font-semibold text-ink">Search the mental health library</label>
        <input
          id="mental-health-research-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Try limerence, BPD, emotional regulation…"
          className="mt-2 min-h-12 w-full rounded-xl border border-[var(--border-soft)] bg-[var(--surface-card)] px-4 py-3 text-base text-ink outline-offset-2 focus-visible:outline-brand-700"
        />
      </div>
      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Filter research by topic">
        {[{ id: 'all' as const, label: 'All topics' }, ...groups].map((group) => {
          const isActive = selectedTopic === group.id
          return (
            <button
              key={group.id}
              type="button"
              onClick={() => setSelectedTopic(group.id)}
              aria-pressed={isActive}
              className={'min-h-11 rounded-full border px-4 py-2 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700 ' + (isActive ? 'border-brand-700 bg-brand-700 text-white' : 'border-[var(--border-soft)] bg-[var(--surface-card)] text-ink hover:border-brand-700/50')}
            >
              {group.label}
            </button>
          )
        })}
      </div>
      <p className="mt-4 text-sm text-muted" role="status" aria-live="polite">
        Showing {matches.length} of {reviews.length} published evidence reviews
      </p>
      {matches.length === 0 && (
        <div className="mt-5 rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-card)] p-5">
          <p className="font-semibold text-ink">No matching reviews yet</p>
          <p className="mt-2 text-sm text-muted">Try a shorter topic, or return to all published reviews.</p>
          <button type="button" className="mt-3 min-h-11 text-sm font-semibold text-[var(--accent-primary)] underline" onClick={() => { setQuery(''); setSelectedTopic('all') }}>Clear filters</button>
        </div>
      )}
      {groups.map((group) => {
        const articles = matches.filter((review) => review.topic === group.id)
        if (!articles.length) return null
        return (
          <section key={group.id} className="mt-8" aria-labelledby={'research-' + group.id}>
            <h3 id={'research-' + group.id} className="text-xl font-bold text-ink">{group.label}</h3>
            <p className="mt-1 text-sm leading-6 text-muted">{group.description}</p>
            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {articles.map((review) => (
                <Link
                  key={review.href}
                  href={review.href}
                  className="flex min-h-36 flex-col rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-card)] p-5 transition hover:-translate-y-0.5 hover:border-brand-700/30 hover:shadow-sm focus-visible:outline-2 focus-visible:outline-brand-700"
                >
                  <h4 className="text-base font-bold leading-snug text-ink">{review.title}</h4>
                  <p className="mt-2 flex-1 text-sm leading-6 text-muted">{review.description}</p>
                  <span className="mt-4 text-sm font-semibold text-[var(--accent-primary)]">Read research →</span>
                </Link>
              ))}
            </div>
          </section>
        )
      })}
    </section>
  )
}
