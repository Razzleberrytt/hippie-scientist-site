'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'

type Compound = {
  slug: string
  name: string
  summary: string
  evidence_grade: string
  evidence_tier: string
}

const TIER_COLORS: Record<string, string> = {
  'Strong Human Evidence': 'bg-emerald-50 border-emerald-200 text-emerald-800',
  'Moderate Human Evidence': 'bg-lime-50 border-lime-200 text-lime-800',
  'Limited Human Evidence': 'bg-amber-50 border-amber-200 text-amber-800',
  'Mechanism Only': 'bg-orange-50 border-orange-200 text-orange-800',
  'Insufficient Evidence': 'bg-red-50 border-red-200 text-red-800',
}

const GRADE_LABELS: Record<string, string> = {
  'a': 'A — Strong',
  'b': 'B — Moderate',
  'c': 'C — Limited',
  'd': 'D — Mechanism Only',
  'f': 'F — Insufficient',
}

export default function EvidenceCheckerPage() {
  const [compounds, setCompounds] = useState<Compound[]>([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/data/compounds.json')
      .then(res => res.json())
      .then((data: any[]) => {
        const mapped: Compound[] = data
          .filter((c: any) => c.name && c.evidence_grade)
          .map((c: any) => ({
            slug: c.slug,
            name: c.name,
            summary: c.summary || '',
            evidence_grade: c.evidence_grade,
            evidence_tier: c.evidence_tier || '',
          }))
          .sort((a: Compound, b: Compound) => a.name.localeCompare(b.name))
        setCompounds(mapped)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const results = useMemo(() => {
    if (!query.trim()) return []
    const q = query.toLowerCase()
    return compounds
      .filter(c => c.name.toLowerCase().includes(q))
      .slice(0, 20)
  }, [query, compounds])

  return (
    <div className="container-page py-10 space-y-8">
      <section className="space-y-4 max-w-3xl">
        <p className="eyebrow-label">Evidence Database</p>
        <h1 className="text-4xl font-bold tracking-tight text-ink sm:text-5xl">
          Supplement Evidence Lookup
        </h1>
        <p className="text-lg leading-8 text-[#46574d]">
          Search 557 compounds for their evidence grade — based on analysis of 816 peer-reviewed studies. 
          Grades reflect the strength of human clinical trial data, not marketing claims.
        </p>
      </section>

      {/* Search */}
      <div className="max-w-xl">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Type a supplement name — e.g. magnesium, ashwagandha, berberine..."
          className="w-full rounded-xl border border-brand-900/20 bg-white px-5 py-4 text-base text-ink placeholder:text-muted focus:border-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-700/20"
          autoFocus
        />
      </div>

      {/* Results */}
      {loading ? (
        <p className="text-muted text-sm">Loading compound database…</p>
      ) : results.length > 0 ? (
        <div className="max-w-3xl space-y-3">
          <p className="text-xs text-muted">{results.length} result{results.length !== 1 ? 's' : ''}</p>
          {results.map(compound => (
            <Link
              key={compound.slug}
              href={`/compounds/${compound.slug}/`}
              className="block card-premium p-5 transition hover:border-brand-700/30 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2 min-w-0">
                  <h2 className="font-semibold text-ink truncate">{compound.name}</h2>
                  {compound.summary && (
                    <p className="text-sm leading-6 text-[#46574d] line-clamp-2">{compound.summary}</p>
                  )}
                </div>
                <div className="shrink-0 flex flex-col items-end gap-1.5">
                  <span className={`rounded-full border px-3 py-0.5 text-xs font-bold ${TIER_COLORS[compound.evidence_tier] || 'bg-gray-50 border-gray-200 text-gray-600'}`}>
                    {compound.evidence_grade.toUpperCase()}
                  </span>
                  <span className="text-[0.65rem] text-muted whitespace-nowrap">{compound.evidence_tier}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : query.trim() ? (
        <div className="max-w-xl card-premium p-6 text-center space-y-2">
          <p className="text-ink font-semibold">No compounds found for "{query}"</p>
          <p className="text-sm text-muted">Try a different name or browse all compounds.</p>
          <Link href="/compounds/" className="inline-block mt-2 text-sm font-bold text-brand-700 hover:text-brand-800">
            Browse all compounds →
          </Link>
        </div>
      ) : null}

      {/* Grade legend */}
      {query.trim() && results.length > 0 && (
        <details className="max-w-3xl card-premium p-5 cursor-pointer">
          <summary className="text-sm font-semibold text-ink">How evidence grades work</summary>
          <div className="mt-4 space-y-2 text-sm leading-7 text-[#46574d]">
            <p><strong>Grade A:</strong> Multiple high-quality RCTs with consistent findings. Meta-analyses available.</p>
            <p><strong>Grade B:</strong> Several RCTs with generally positive findings. Some inconsistency possible.</p>
            <p><strong>Grade C:</strong> Limited human trials, small samples, or mixed results.</p>
            <p><strong>Grade D:</strong> Only mechanistic/animal data. No human clinical trials.</p>
            <p><strong>Grade F:</strong> Human trials show no benefit, or safety concerns predominate.</p>
            <div className="pt-2">
              <Link href="/methodology/" className="text-sm font-bold text-brand-700 hover:text-brand-800">
                Full methodology →
              </Link>
            </div>
          </div>
        </details>
      )}

      {/* Browse all link — always visible */}
      {!query.trim() && (
        <div className="max-w-xl card-premium p-6 text-center space-y-3">
          <p className="text-ink font-semibold">Search 557 compounds by evidence grade</p>
          <p className="text-sm text-muted">Start typing above, or browse the full database.</p>
          <Link href="/compounds/" className="inline-block rounded-full bg-brand-800 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand-700">
            Browse all compounds →
          </Link>
        </div>
      )}
    </div>
  )
}
