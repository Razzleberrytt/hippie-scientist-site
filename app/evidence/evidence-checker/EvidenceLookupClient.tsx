'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'

export interface LookupCompound {
  slug: string
  name: string
  evidence_tier: string
}

const TIERS = [
  'Strong Human Evidence',
  'Moderate Human Evidence',
  'Limited Human Evidence',
  'Mechanistic Evidence',
] as const

const TIER_SHORT: Record<string, string> = {
  'Strong Human Evidence': 'Strong',
  'Moderate Human Evidence': 'Moderate',
  'Limited Human Evidence': 'Limited',
  'Mechanistic Evidence': 'Mechanism',
}

/* Tier badges follow the site evidence palette (strong=green, moderate=blue,
   limited=amber, mechanism-only=slate) using color families the dark-mode
   overrides in globals.css already remap. */
const TIER_BADGE: Record<string, string> = {
  'Strong Human Evidence': 'bg-emerald-50 border-emerald-200 text-emerald-800',
  'Moderate Human Evidence': 'bg-blue-50 border-blue-200 text-blue-800',
  'Limited Human Evidence': 'bg-amber-50 border-amber-200 text-amber-900',
  'Mechanistic Evidence': 'bg-slate-50 border-slate-200 text-slate-700',
}

const TIER_CHIP_ACTIVE: Record<string, string> = {
  'Strong Human Evidence': 'border-emerald-700/40 bg-emerald-50 text-emerald-800',
  'Moderate Human Evidence': 'border-blue-700/40 bg-blue-50 text-blue-800',
  'Limited Human Evidence': 'border-amber-700/40 bg-amber-50 text-amber-900',
  'Mechanistic Evidence': 'border-slate-500/40 bg-slate-50 text-slate-700',
}

function CompoundRow({ compound }: { compound: LookupCompound }) {
  return (
    <Link
      href={`/compounds/${compound.slug}/`}
      className="flex min-h-11 items-center justify-between gap-4 rounded-xl border border-brand-900/10 bg-white/70 px-4 py-2.5 transition hover:border-brand-700/30 hover:bg-white"
    >
      <span className="truncate text-sm font-medium text-ink">{compound.name}</span>
      <span
        className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-[0.06em] ${
          TIER_BADGE[compound.evidence_tier] || 'bg-slate-50 border-slate-200 text-slate-700'
        }`}
      >
        {TIER_SHORT[compound.evidence_tier] || compound.evidence_tier}
      </span>
    </Link>
  )
}

export default function EvidenceLookupClient({ compounds }: { compounds: LookupCompound[] }) {
  const [query, setQuery] = useState('')
  const [tier, setTier] = useState<string | null>(null)
  const [openLetters, setOpenLetters] = useState<Set<string>>(new Set())

  const byLetter = useMemo(() => {
    const groups: Record<string, LookupCompound[]> = {}
    for (const c of compounds) {
      const letter = c.name.charAt(0).toUpperCase()
      if (!groups[letter]) groups[letter] = []
      groups[letter].push(c)
    }
    return groups
  }, [compounds])

  const letters = useMemo(() => Object.keys(byLetter).sort(), [byLetter])

  const tierCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const c of compounds) counts[c.evidence_tier] = (counts[c.evidence_tier] || 0) + 1
    return counts
  }, [compounds])

  // Deep links (#letter-X) should land on an expanded section.
  useEffect(() => {
    const match = window.location.hash.match(/^#letter-(.)$/)
    if (match) {
      setOpenLetters((prev) => new Set(prev).add(match[1].toUpperCase()))
    }
  }, [])

  const normalizedQuery = query.trim().toLowerCase()
  const filtering = normalizedQuery.length > 0 || tier !== null

  const matches = useMemo(() => {
    if (!filtering) return []
    return compounds.filter(
      (c) =>
        (!normalizedQuery || c.name.toLowerCase().includes(normalizedQuery)) &&
        (!tier || c.evidence_tier === tier),
    )
  }, [compounds, filtering, normalizedQuery, tier])

  const openLetter = (letter: string) => {
    setOpenLetters((prev) => new Set(prev).add(letter))
  }

  const toggleLetter = (letter: string, open: boolean) => {
    setOpenLetters((prev) => {
      const next = new Set(prev)
      if (open) next.add(letter)
      else next.delete(letter)
      return next
    })
  }

  return (
    <div className="max-w-3xl space-y-6">
      {/* Search + tier filter */}
      <div className="space-y-3">
        <label htmlFor="evidence-lookup-search" className="sr-only">
          Search compounds by name
        </label>
        <input
          id="evidence-lookup-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search compounds by name…"
          className="w-full rounded-xl border border-brand-900/15 bg-white px-4 py-3 text-sm text-ink shadow-sm placeholder:text-muted"
        />
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by evidence tier">
          <button
            type="button"
            onClick={() => setTier(null)}
            aria-pressed={tier === null}
            className={`min-h-9 rounded-full border px-3.5 py-1 text-xs font-semibold transition ${
              tier === null
                ? 'border-brand-700/40 bg-brand-50 text-brand-800'
                : 'border-brand-900/10 bg-white/70 text-muted hover:border-brand-700/25 hover:text-ink'
            }`}
          >
            All ({compounds.length})
          </button>
          {TIERS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTier((current) => (current === t ? null : t))}
              aria-pressed={tier === t}
              className={`min-h-9 rounded-full border px-3.5 py-1 text-xs font-semibold transition ${
                tier === t
                  ? TIER_CHIP_ACTIVE[t]
                  : 'border-brand-900/10 bg-white/70 text-muted hover:border-brand-700/25 hover:text-ink'
              }`}
            >
              {TIER_SHORT[t]} ({tierCounts[t] || 0})
            </button>
          ))}
        </div>
      </div>

      {filtering ? (
        <section aria-label="Search results" className="space-y-3">
          <p className="text-sm text-muted" role="status">
            {matches.length} of {compounds.length} compounds
            {normalizedQuery ? ` matching “${query.trim()}”` : ''}
            {tier ? ` with ${TIER_SHORT[tier].toLowerCase()} evidence` : ''}.
          </p>
          {matches.length > 0 ? (
            <div className="space-y-2">
              {matches.map((compound) => (
                <CompoundRow key={compound.slug} compound={compound} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-brand-900/10 bg-white/70 px-4 py-6 text-sm text-muted">
              No compounds match. Try a shorter name fragment or clear the tier filter.
            </div>
          )}
        </section>
      ) : (
        <>
          {/* Alphabet nav */}
          <nav aria-label="Jump to letter" className="flex flex-wrap gap-1.5">
            {letters.map((letter) => (
              <a
                key={letter}
                href={`#letter-${letter}`}
                onClick={() => openLetter(letter)}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-brand-900/10 bg-white text-sm font-semibold text-ink transition hover:border-brand-700/30 hover:bg-brand-50"
              >
                {letter}
              </a>
            ))}
          </nav>

          {/* Collapsible letter sections. All rows are server-rendered inside
              (closed) details, so every compound link stays in the static HTML. */}
          <div className="space-y-3">
            {letters.map((letter) => {
              const group = byLetter[letter]
              const isOpen = openLetters.has(letter)
              return (
                <details
                  key={letter}
                  id={`letter-${letter}`}
                  open={isOpen}
                  onToggle={(event) => toggleLetter(letter, (event.target as HTMLDetailsElement).open)}
                  className="scroll-mt-24"
                >
                  <summary className="flex items-center justify-between gap-4">
                    <span>
                      {letter}
                      <span className="ml-2 text-sm font-normal text-muted">
                        ({group.length} compound{group.length !== 1 ? 's' : ''})
                      </span>
                    </span>
                    <span aria-hidden="true" className={`text-muted transition-transform ${isOpen ? 'rotate-180' : ''}`}>
                      v
                    </span>
                  </summary>
                  <div className="space-y-2">
                    {group.map((compound) => (
                      <CompoundRow key={compound.slug} compound={compound} />
                    ))}
                  </div>
                </details>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
