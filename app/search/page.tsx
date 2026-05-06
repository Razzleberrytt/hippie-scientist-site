'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import Fuse from 'fuse.js'
import compoundsData from '@/public/data/compounds.json'
import herbsData from '@/public/data/herbs.json'

type SearchType = 'Herb' | 'Compound'
type SearchItem = {
  slug: string
  name: string
  type: SearchType
  href: string
  summary: string
  effects: string[]
  evidence: string
  safety: string
  quality: string
  searchText: string
}

const INTERNAL_PATTERNS = [
  /research[_\s-]*only/i,
  /lean\s+(monograph\s+)?row/i,
  /schema\s*artifact/i,
  /bulk\s+enrichment/i,
  /bulk\s+mode/i,
  /placeholder/i,
  /enriched\s+in\s+bulk/i,
  /internal\s+cross-linking/i,
  /^n\/?a$/i,
  /^unknown$/i,
  /^tbd$/i,
  /^none$/i,
]

const suggestedSearches = ['sleep', 'stress', 'inflammation', 'focus', 'digestion', 'metabolism']

function text(value: unknown): string {
  if (value === null || value === undefined) return ''
  if (Array.isArray(value)) return value.map(text).filter(Boolean).join(', ')
  if (typeof value === 'object') {
    const record = value as Record<string, unknown>
    return text(record.label ?? record.name ?? record.title ?? record.text ?? record.value)
  }
  return String(value).replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim()
}

function isClean(value: unknown) {
  const normalized = text(value)
  return Boolean(normalized) && !INTERNAL_PATTERNS.some(pattern => pattern.test(normalized))
}

function list(value: unknown): string[] {
  if (value === null || value === undefined) return []
  const raw = Array.isArray(value) ? value : String(value).split(/\n|;|\|/)
  return raw
    .flatMap(item => text(item).split(/,(?=\s*[a-zA-Z])/))
    .map(item => item.replace(/^[-*•]\s*/, '').trim())
    .filter(isClean)
}

function unique(items: string[]) {
  const seen = new Set<string>()
  return items.filter(item => {
    const key = item.toLowerCase()
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function labelize(value: unknown, fallback = 'Review') {
  const clean = text(value)
  if (!isClean(clean)) return fallback
  return clean
    .split(' ')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function getName(item: any) {
  return text(item.displayName) || text(item.name) || text(item.slug).replace(/-/g, ' ')
}

function getSummary(item: any, type: SearchType) {
  const summary =
    item.short_earthy_summary ||
    item.shortEarthySummary ||
    item.summary ||
    item.coreInsight ||
    item.hero ||
    item.description

  if (isClean(summary)) return text(summary)
  return type === 'Herb'
    ? 'A botanical profile with evidence notes, mechanism context, safety cautions, and practical research framing.'
    : 'A compound profile with evidence notes, mechanism context, safety cautions, and practical scientific framing.'
}

function getEffects(item: any) {
  return unique([
    ...list(item.primary_effects),
    ...list(item.primaryEffects),
    ...list(item.effects),
    ...list(item.mechanisms),
    text(item.primaryDomain),
  ])
    .filter(isClean)
    .slice(0, 4)
}

function getEvidence(item: any) {
  return labelize(
    item.evidence_tier ||
      item.evidenceTier ||
      item.safety?.evidenceTier ||
      item.evidence_grade ||
      item.evidenceLevel ||
      item.summary_quality,
    'Evidence Review'
  )
}

function getSafety(item: any) {
  return labelize(
    item.safety_level ||
      item.safetyLevel ||
      item.safety?.confidence ||
      item.confidenceTier ||
      item.profile_status,
    'Safety Review'
  )
}

function getQuality(item: any) {
  return labelize(item.profile_status || item.summary_quality || item.review_status || item.status, 'Profile Review')
}

function evidenceClass(level: string) {
  const value = level.toLowerCase()

  if (value.includes('strong') || value.includes('high')) return 'evidence-pill-strong'
  if (value.includes('moderate') || value.includes('human')) return 'evidence-pill-moderate'
  return 'chip-readable'
}

function safetyClass(level: string) {
  const value = level.toLowerCase()

  if (value.includes('safe') || value.includes('complete') || value.includes('high')) return 'evidence-pill-strong'
  if (value.includes('caution') || value.includes('review') || value.includes('partial') || value.includes('moderate')) return 'chip-readable'
  return 'rounded-full border border-red-700/10 bg-red-50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-red-800'
}

function typeClass(type: SearchType) {
  return type === 'Herb'
    ? 'rounded-full border border-brand-700/10 bg-brand-50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-800'
    : 'rounded-full border border-blue-700/10 bg-blue-50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-blue-800'
}

function normalizeItem(item: any, type: SearchType): SearchItem | null {
  const slug = text(item.slug || item.id)
  if (!slug) return null

  const name = getName(item)
  const summary = getSummary(item, type)
  const effects = getEffects(item)
  const evidence = getEvidence(item)
  const safety = getSafety(item)
  const quality = getQuality(item)
  const href = type === 'Herb' ? `/herbs/${slug}` : `/compounds/${slug}`

  return {
    slug,
    name,
    type,
    href,
    summary,
    effects,
    evidence,
    safety,
    quality,
    searchText: [name, slug, summary, effects.join(' '), evidence, safety, quality].join(' '),
  }
}

function ResultCard({ item }: { item: SearchItem }) {
  return (
    <article className="card-premium group flex h-full flex-col p-5 sm:p-6">
      <div className="metadata-row">
        <span className={typeClass(item.type)}>{item.type}</span>
        <span className={evidenceClass(item.evidence)}>{item.evidence}</span>
        <span className={safetyClass(item.safety)}>{item.safety}</span>
      </div>

      <div className="mt-5 flex flex-1 flex-col">
        <div className="space-y-3">
          <div className="space-y-2">
            <p className="text-[0.7rem] font-bold uppercase tracking-[0.16em] text-brand-700">
              {item.quality}
            </p>
            <h2 className="max-w-[20ch] text-[1.45rem] font-semibold leading-tight tracking-tight text-ink transition-colors duration-300 group-hover:text-brand-700">
              {item.name}
            </h2>
          </div>

          <p className="line-clamp-4 text-sm leading-7 text-[#46574d]">
            {item.summary}
          </p>
        </div>

        {item.effects.length > 0 ? (
          <div className="mt-5 border-t border-brand-900/10 pt-4">
            <p className="mb-2 text-[0.68rem] font-bold uppercase tracking-[0.16em] text-[#66756d]">
              Signals
            </p>
            <div className="flex flex-wrap gap-2">
              {item.effects.map(effect => (
                <span key={effect} className="rounded-full border border-brand-900/10 bg-paper-50 px-3 py-1 text-xs font-medium text-[#33443a]">
                  {effect}
                </span>
              ))}
            </div>
          </div>
        ) : null}

        <div className="mt-auto pt-6">
          <Link href={item.href} className="button-secondary w-full rounded-full px-4 py-2.5 text-sm sm:w-auto">
            Open Profile
          </Link>
        </div>
      </div>
    </article>
  )
}

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const normalizedQuery = query.trim()

  const searchItems = useMemo(() => {
    const herbs = (herbsData as any[]).map(item => normalizeItem(item, 'Herb')).filter(Boolean) as SearchItem[]
    const compounds = (compoundsData as any[]).map(item => normalizeItem(item, 'Compound')).filter(Boolean) as SearchItem[]
    return [...herbs, ...compounds]
  }, [])

  const fuse = useMemo(() => new Fuse(searchItems, {
    keys: [
      { name: 'name', weight: 0.4 },
      { name: 'summary', weight: 0.2 },
      { name: 'effects', weight: 0.25 },
      { name: 'searchText', weight: 0.15 },
    ],
    threshold: 0.34,
    ignoreLocation: true,
  }), [searchItems])

  const results = useMemo(() => {
    if (!normalizedQuery) return searchItems.slice(0, 24)
    return fuse.search(normalizedQuery).map(result => result.item).slice(0, 48)
  }, [normalizedQuery, fuse, searchItems])

  const herbs = results.filter(item => item.type === 'Herb')
  const compounds = results.filter(item => item.type === 'Compound')
  const hasResults = results.length > 0

  return (
    <main className="min-h-screen bg-background text-ink">
      <section className="container-page py-12 sm:py-16 lg:py-20">
        <div className="section-spacing">
          <section className="hero-shell rounded-[2rem] border border-brand-900/10 p-6 shadow-card sm:p-8 lg:p-10">
            <div className="max-w-4xl space-y-6">
              <div className="space-y-3">
                <p className="eyebrow-label">Scientific Discovery</p>
                <h1 className="max-w-[13ch]">Search the Library</h1>
              </div>

              <p className="detail-reading text-[1.05rem] sm:text-lg">
                Search herbs and compounds by name, mechanism, evidence signal, safety context, or wellness target. Results are cleaned and grouped for fast scientific scanning.
              </p>

              <div className="surface-depth rounded-[1.75rem] p-3 sm:p-4">
                <label htmlFor="site-search" className="sr-only">Search herbs and compounds</label>
                <input
                  id="site-search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search sleep, magnesium, stress, inflammation..."
                  className="min-h-14 w-full rounded-2xl border border-brand-900/10 bg-white/90 px-5 py-4 text-base font-medium text-ink shadow-sm outline-none transition-all placeholder:text-[#7b887f] focus:border-brand-600/30 focus:bg-white focus:ring-4 focus:ring-brand-500/15 sm:text-lg"
                />
              </div>

              <div className="metadata-row">
                <span className="chip-readable">{searchItems.length} searchable profiles</span>
                <span className="chip-readable">{(herbsData as any[]).length} herbs</span>
                <span className="chip-readable">{(compoundsData as any[]).length} compounds</span>
              </div>
            </div>
          </section>

          <section className="surface-subtle rounded-[2rem] p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="eyebrow-label">Suggested searches</p>
                <p className="mt-2 text-sm leading-7 text-[#46574d]">Start with a wellness target, compound, botanical, or mechanism.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {suggestedSearches.map(term => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => setQuery(term)}
                    className="rounded-full border border-brand-900/10 bg-white/80 px-4 py-2 text-sm font-semibold text-[#33443a] shadow-sm transition hover:border-brand-700/20 hover:bg-white hover:text-brand-800"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {hasResults ? (
            <div className="detail-stack">
              {herbs.length > 0 ? (
                <section className="space-y-5">
                  <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                      <p className="eyebrow-label">Herbs</p>
                      <h2 className="mt-2 max-w-none text-2xl font-semibold tracking-tight text-ink sm:text-3xl">Botanical matches</h2>
                    </div>
                    <span className="chip-readable">{herbs.length} results</span>
                  </div>
                  <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {herbs.map(item => <ResultCard key={`${item.type}-${item.slug}`} item={item} />)}
                  </div>
                </section>
              ) : null}

              {compounds.length > 0 ? (
                <section className="space-y-5">
                  <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                      <p className="eyebrow-label">Compounds</p>
                      <h2 className="mt-2 max-w-none text-2xl font-semibold tracking-tight text-ink sm:text-3xl">Compound matches</h2>
                    </div>
                    <span className="chip-readable">{compounds.length} results</span>
                  </div>
                  <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {compounds.map(item => <ResultCard key={`${item.type}-${item.slug}`} item={item} />)}
                  </div>
                </section>
              ) : null}
            </div>
          ) : (
            <section className="section-frame text-center">
              <p className="eyebrow-label mx-auto">No matches found</p>
              <h2 className="mx-auto mt-3 max-w-[16ch] text-3xl font-semibold tracking-tight text-ink">Try a broader discovery path</h2>
              <p className="mx-auto mt-4 max-w-reading text-sm leading-7 text-[#46574d] sm:text-base">
                Search by outcome, mechanism, compound class, or common supplement name. You can also browse the full libraries directly.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                {suggestedSearches.slice(0, 4).map(term => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => setQuery(term)}
                    className="chip-readable hover:text-brand-800"
                  >
                    {term}
                  </button>
                ))}
              </div>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Link href="/herbs" className="button-secondary rounded-full">Browse Herbs</Link>
                <Link href="/compounds" className="button-primary rounded-full">Browse Compounds</Link>
              </div>
            </section>
          )}
        </div>
      </section>
    </main>
  )
}
