'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import Fuse from 'fuse.js'
import { EvidenceBadge } from '@/components/ui'
import compounds from '@/public/data/compounds.json'

const firstEffect = (compound: any) => {
  const effects = Array.isArray(compound.primary_effects)
    ? compound.primary_effects
    : Array.isArray(compound.effects)
      ? compound.effects
      : []
  return effects.filter(Boolean).slice(0, 3)
}

export default function SearchPage() {
  const [query, setQuery] = useState('')

  const fuse = useMemo(() => new Fuse(compounds as any[], {
    keys: ['name', 'slug', 'effects', 'primary_effects'],
    threshold: 0.35,
  }), [])

  const results = useMemo(() => {
    if (!query) return compounds.slice(0, 20)
    return fuse.search(query).map(r => r.item)
  }, [query, fuse])

  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4">
      <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-card">
        <h1 className="text-3xl font-bold text-ink">Search</h1>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search magnesium, creatine..."
          className="mt-4 min-h-12 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-ink outline-none focus:border-teal-300 focus:ring-4 focus:ring-teal-100"
        />
      </section>

      <div className="grid gap-4 sm:grid-cols-2">
        {results.map((compound: any) => {
          const tags = firstEffect(compound)
          const evidence = compound.evidence_tier || compound.evidenceTier || compound.evidence_grade
          return (
            <Link key={compound.slug} href={`/compounds/${compound.slug}`} className="min-h-32 rounded-2xl border border-neutral-200 bg-white p-5 shadow-card transition hover:border-teal-200 hover:shadow-lg">
              <div className="flex items-start justify-between gap-3">
                <h2 className="font-bold text-ink">{compound.name || compound.slug}</h2>
                {evidence ? <EvidenceBadge value={evidence} /> : null}
              </div>
              {tags.length ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {tags.map((tag: string) => <span key={tag} className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-700">{tag}</span>)}
                </div>
              ) : null}
              <p className="mt-4 text-sm font-bold text-teal-700">Open profile →</p>
            </Link>
          )
        })}
      </div>
    </main>
  )
}
