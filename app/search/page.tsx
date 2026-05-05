'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import Fuse from 'fuse.js'
import compounds from '@/public/data/compounds.json'

export default function SearchPage() {
  const [query, setQuery] = useState('')

  const fuse = useMemo(() => new Fuse(compounds as any[], {
    keys: ['name', 'slug', 'effects', 'primary_effects'],
    threshold: 0.35
  }), [])

  const results = useMemo(() => {
    if (!query) return compounds.slice(0, 20)
    return fuse.search(query).map(r => r.item)
  }, [query, fuse])

  return (
    <main className="max-w-6xl mx-auto px-4 space-y-6">
      <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-card">
        <h1 className="text-3xl font-bold text-ink">Search</h1>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search magnesium, creatine..."
          className="mt-4 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm"
        />
      </section>

      <div className="grid gap-4 sm:grid-cols-2">
        {results.map((c: any) => (
          <Link key={c.slug} href={`/compounds/${c.slug}`} className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-card hover:shadow-lg">
            <h2 className="font-bold text-ink">{c.name}</h2>
            <p className="text-sm text-muted">{c.effects?.[0] || 'General support'}</p>
          </Link>
        ))}
      </div>
    </main>
  )
}
