import type { Metadata } from 'next'
import Link from 'next/link'

import { getAllCompounds } from '@/lib/server/runtime-data'
import { getRuntimeVisibility } from '@/lib/runtime-visibility'
import { buildPageMetadata } from '@/lib/seo'
import { COMPOUNDS_PAGE_SIZE, clampPositiveInt, paginateItems, buildPaginatedHref } from '@/lib/pagination'
import { cleanSummary, formatDisplayLabel, list, text } from '@/lib/display-utils'
import { normalizeDecisionEvidence, normalizeDecisionSafety } from '@/lib/decision-primitives'

export const metadata: Metadata = buildPageMetadata({
  title: 'Compound Library',
  description: 'Browse 600+ compound profiles with mechanisms, evidence levels, safety status, and practical context. Evidence-first, no hype.',
  path: '/compounds',
})

export const dynamic = 'force-static'

interface Compound {
  slug?: string
  name?: string
  displayName?: string
  compoundName?: string
  canonicalCompoundName?: string
  summary?: string
  description?: string
  short_earthy_summary?: string
  effects?: unknown
  primary_effects?: unknown
  mechanism_categories?: unknown
  mechanisms?: unknown
  evidence_tier?: unknown
  evidenceTier?: unknown
  evidence_grade?: unknown
  evidenceLevel?: unknown
  safety_level?: unknown
  safetyLevel?: unknown
  safetyStatus?: unknown
  profile_status?: unknown
  safetyNotes?: unknown
  safety_notes?: unknown
  safety?: { interactions?: unknown; cautions?: unknown } | string | null
  interactions?: unknown
  cautions?: unknown
  [key: string]: unknown
}

type FilterState = {
  q: string
  category: string
  evidence: string
  safety: string
  sort: string
}

const CATEGORY_FILTERS = [
  { label: 'All categories', value: 'all' },
  { label: 'Calm & sleep', value: 'calm-sleep', terms: ['calm', 'sleep', 'gaba', 'sedative', 'relax', 'anxiety', 'melatonin'] },
  { label: 'Focus & neuro', value: 'focus', terms: ['focus', 'cognition', 'neuro', 'dopamine', 'acetylcholine', 'attention', 'brain'] },
  { label: 'Inflammation', value: 'inflammation', terms: ['inflammation', 'inflammatory', 'oxidative', 'antioxidant', 'immune', 'nf-kb', 'cytokine'] },
  { label: 'Metabolism', value: 'metabolism', terms: ['metabolic', 'metabolism', 'mitochondria', 'glucose', 'lipid', 'ampk', 'energy'] },
]

const EVIDENCE_FILTERS = [
  { label: 'Any evidence', value: 'all' },
  { label: 'Strong', value: 'strong' },
  { label: 'Moderate', value: 'moderate' },
  { label: 'Limited / prelim', value: 'limited' },
]

const SAFETY_FILTERS = [
  { label: 'Any safety', value: 'all' },
  { label: 'Generally well tolerated', value: 'Generally well tolerated' },
  { label: 'Use caution', value: 'Use caution' },
  { label: 'Interaction risk', value: 'Interaction risk' },
]

function getName(c: Compound): string {
  return (
    formatDisplayLabel(c.displayName) ||
    formatDisplayLabel(c.name) ||
    formatDisplayLabel(c.compoundName) ||
    formatDisplayLabel(c.canonicalCompoundName) ||
    formatDisplayLabel(c.slug) ||
    'Unknown compound'
  )
}

function getCategory(c: Compound): string {
  const effects = list(c.effects || c.primary_effects || c.mechanism_categories)
  const first = effects[0] ? formatDisplayLabel(effects[0]) : ''
  return first || 'Compound'
}

function getBrief(c: Compound): string {
  const raw = c.summary || c.description || c.short_earthy_summary || ''
  const cleaned = cleanSummary(raw, 'compound')
  const genericFallback = 'Compound profile with evidence, safety, and practical fit.'
  if (cleaned && cleaned !== genericFallback) return cleaned.slice(0, 130)

  // Build a synthetic description from structured data when no prose summary exists
  const name = getName(c)
  const effects = list(c.primary_effects || c.effects)
    .map(formatDisplayLabel)
    .filter(Boolean)
    .slice(0, 2)
  const ev = getEvidenceLabel(c)

  if (effects.length > 0) {
    const effText = effects.map(e => e.toLowerCase()).join(' and ')
    const evTone = /strong/i.test(ev) ? 'Human-trial evidence.' : /moderate/i.test(ev) ? 'Moderate evidence base.' : ''
    return [`${name} studied for ${effText}.`, evTone].filter(Boolean).join(' ')
  }

  const mechs = list(c.mechanisms || c.mechanism_categories)
    .map(formatDisplayLabel)
    .filter(Boolean)
    .slice(0, 2)

  if (mechs.length > 0) {
    return `${name} acts via ${mechs.map(m => m.toLowerCase()).join(' and ')} pathways.`
  }

  return `${name} — mechanism, evidence, and safety context. Profile data in progress.`
}

function getEvidenceLabel(c: Compound): string {
  return normalizeDecisionEvidence(
    c.evidence_tier || c.evidenceTier || c.evidence_grade || c.evidenceLevel
  )
}

function getSafetyLabel(c: Compound): string {
  const safetyObject = c.safety && typeof c.safety === 'object' ? c.safety : null
  return normalizeDecisionSafety(
    c.safety_level || c.safetyLevel || c.safetyStatus || c.profile_status,
    {
      hasSafetyNotes: Boolean(c.safetyNotes || c.safety_notes || c.safety),
      hasInteractions: Boolean(safetyObject?.interactions || c.interactions),
      hasCautions: Boolean(safetyObject?.cautions || c.cautions),
      notes: text(c.safetyNotes || c.safety_notes || c.safety),
      interactions: text(safetyObject?.interactions || c.interactions),
    }
  )
}

function getBestFor(c: Compound): string {
  const primary = list(c.primary_effects || c.effects)
    .map(formatDisplayLabel)
    .filter(Boolean)
    .slice(0, 3)
  if (primary.length > 0) return primary.join(' • ')
  const mech = list(c.mechanisms || c.mechanism_categories)
    .map(formatDisplayLabel)
    .filter(Boolean)
    .slice(0, 2)
  return mech.length > 0 ? mech.join(' • ') : 'Research context'
}

function getSearchCorpus(c: Compound): string {
  return [
    getName(c),
    getBrief(c),
    getCategory(c),
    getEvidenceLabel(c),
    getSafetyLabel(c),
    ...list(c.mechanisms),
    ...list(c.primary_effects),
    ...list(c.effects),
  ]
    .map((v) => text(v).toLowerCase())
    .join(' ')
}

function matchesCategory(c: Compound, value: string): boolean {
  if (value === 'all') return true
  const opt = CATEGORY_FILTERS.find((o) => o.value === value)
  if (!opt || !opt.terms) return true
  const corpus = getSearchCorpus(c)
  return opt.terms.some((t) => corpus.includes(t))
}

function matchesEvidence(c: Compound, value: string): boolean {
  if (value === 'all') return true
  const label = getEvidenceLabel(c).toLowerCase()
  if (value === 'strong') return label.includes('strong')
  if (value === 'moderate') return label.includes('moderate')
  if (value === 'limited') return label.includes('limited') || label.includes('prelim') || label.includes('insufficient') || label.includes('traditional')
  return true
}

function matchesSafety(c: Compound, value: string): boolean {
  if (value === 'all') return true
  const label = getSafetyLabel(c)
  return label === value
}

function filterCompounds(items: Compound[], f: FilterState): Compound[] {
  const q = f.q.trim().toLowerCase()
  return items.filter((c) => {
    const corpus = getSearchCorpus(c)
    const qOk = !q || q.split(/\s+/).every((term) => corpus.includes(term))
    const catOk = matchesCategory(c, f.category)
    const evOk = matchesEvidence(c, f.evidence)
    const safeOk = matchesSafety(c, f.safety)
    return qOk && catOk && evOk && safeOk
  })
}

function buildFilterUrl(base: string, next: Partial<FilterState>, page?: number) {
  const p = new URLSearchParams()
  if (next.q) p.set('q', next.q)
  if (next.category && next.category !== 'all') p.set('category', next.category)
  if (next.evidence && next.evidence !== 'all') p.set('evidence', next.evidence)
  if (next.safety && next.safety !== 'all') p.set('safety', next.safety)
  if (next.sort && next.sort !== 'alpha') p.set('sort', next.sort)
  if (page && page > 1) p.set('page', String(page))
  const qs = p.toString()
  return qs ? `${base}?${qs}` : base
}

function EvidenceBadge({ label }: { label: string }) {
  const tone = /strong/i.test(label) ? 'strong' : /moderate/i.test(label) ? 'moderate' : 'limited'
  const cls =
    tone === 'strong'
      ? 'border-emerald-800/30 bg-emerald-50 text-emerald-800'
      : tone === 'moderate'
      ? 'border-blue-700/30 bg-blue-50 text-blue-800'
      : 'border-amber-700/30 bg-amber-50 text-amber-800'
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-px text-[10px] font-semibold uppercase tracking-[0.06em] ${cls}`}>
      {label.replace(' evidence', '')}
    </span>
  )
}

function CompoundCard({ c }: { c: Compound }) {
  const name = getName(c)
  const cat = getCategory(c)
  const desc = getBrief(c)
  const ev = getEvidenceLabel(c)
  const best = getBestFor(c)
  const slug = c.slug || ''
  const href = `/compounds/${slug}`

  return (
    <Link
      href={href}
      className="group flex h-full flex-col rounded-[0.85rem] border border-brand-900/10 bg-white/80 p-4 shadow-sm transition hover:border-brand-700/30 hover:bg-white"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-base font-semibold tracking-tight text-ink group-hover:text-brand-800">{name}</h3>
        <EvidenceBadge label={ev} />
      </div>
      <div className="mt-0.5 text-[11px] font-medium uppercase tracking-[0.08em] text-[#5f6f66]">{cat}</div>
      <p className="mt-2 line-clamp-3 text-sm leading-6 text-[#46574d]">{desc || 'Compound profile with mechanism, evidence, and safety context.'}</p>
      {best && best !== 'Research context' && (
        <div className="mt-2 text-[11px] text-[#5f6f66] line-clamp-1">Best for: {best}</div>
      )}
      <span className="mt-auto pt-3 text-xs font-semibold text-brand-800 group-hover:underline">View profile →</span>
    </Link>
  )
}

export default async function CompoundsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const sp = await searchParams

  const f: FilterState = {
    q: text(Array.isArray(sp.q) ? sp.q[0] : sp.q),
    category: text(Array.isArray(sp.category) ? sp.category[0] : sp.category) || 'all',
    evidence: text(Array.isArray(sp.evidence) ? sp.evidence[0] : sp.evidence) || 'all',
    safety: text(Array.isArray(sp.safety) ? sp.safety[0] : sp.safety) || 'all',
    sort: text(Array.isArray(sp.sort) ? sp.sort[0] : sp.sort) || 'alpha',
  }

  const page = clampPositiveInt(Array.isArray(sp.page) ? sp.page[0] : sp.page, 1)

  const raw = await getAllCompounds()
  const allCompounds: Compound[] = raw.filter((c: Record<string, unknown>) => c?.slug && getRuntimeVisibility(c).canRender)

  const filtered = filterCompounds(allCompounds, f)

  // Apply sort (default alpha by name; evidence strength secondary)
  const sorted = [...filtered]
  if (f.sort === 'evidence') {
    sorted.sort((a, b) => {
      const ea = getEvidenceLabel(a)
      const eb = getEvidenceLabel(b)
      const rank = (s: string) => /strong/i.test(s) ? 3 : /moderate/i.test(s) ? 2 : 1
      const r = rank(eb) - rank(ea)
      return r !== 0 ? r : getName(a).localeCompare(getName(b))
    })
  } else {
    sorted.sort((a, b) => getName(a).localeCompare(getName(b)))
  }

  const paged = paginateItems(sorted, page, COMPOUNDS_PAGE_SIZE)

  const total = filtered.length
  const showingFrom = paged.pageItems.length > 0 ? (paged.currentPage - 1) * paged.pageSize + 1 : 0
  const showingTo = Math.min(paged.currentPage * paged.pageSize, total)

  const basePath = '/compounds'

  // Server-rendered crawlable index (first 200)
  const indexLinks = allCompounds.slice(0, 200)

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:py-8">
      {/* Hero */}
      <section className="hero-shell rounded-[0.95rem] border border-brand-900/10 px-4 py-5 shadow-sm sm:px-6 sm:py-6">
        <p className="eyebrow-label">Compound decision library</p>
        <h1 className="mt-2 max-w-3xl font-display text-3xl font-semibold tracking-tight text-ink sm:text-5xl">
          Compound Library
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#46574d]">
          Mechanism, evidence strength, and safety context for bioactive molecules and supplement constituents.
        </p>
        <p className="mt-2 text-sm font-semibold text-[#46574d]">Browsing {total} compounds</p>
      </section>

      {/* Search + filters (server, URL-driven) */}
      <section className="rounded-[0.85rem] border border-brand-900/10 bg-white/85 p-4 shadow-sm">
        <form action={basePath} className="space-y-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label htmlFor="q" className="sr-only">Search compounds</label>
              <input
                id="q"
                name="q"
                type="search"
                defaultValue={f.q}
                placeholder="Search compound, mechanism, or effect"
                className="w-full rounded-full border border-brand-900/10 bg-white px-4 py-2.5 text-sm text-ink shadow-sm placeholder:text-[#7b8a81]"
              />
            </div>
            <button type="submit" className="button-primary min-h-10 px-5">Search</button>
          </div>

          {/* Category chips */}
          <div>
            <div className="mb-1 text-xs font-bold uppercase tracking-[0.12em] text-[#5f6f66]">Category</div>
            <div className="flex flex-wrap gap-2">
              {CATEGORY_FILTERS.map((opt) => {
                const href = buildFilterUrl(basePath, { ...f, category: opt.value }, 1)
                const active = f.category === opt.value
                return (
                  <Link
                    key={opt.value}
                    href={href}
                    className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${active ? 'border-brand-700/25 bg-brand-50 text-brand-900' : 'border-brand-900/10 bg-white/80 text-[#33443a] hover:border-brand-700/20'}`}
                  >
                    {opt.label}
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Evidence + Safety row */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <div className="mb-1 text-xs font-bold uppercase tracking-[0.12em] text-[#5f6f66]">Evidence level</div>
              <div className="flex flex-wrap gap-2">
                {EVIDENCE_FILTERS.map((opt) => {
                  const href = buildFilterUrl(basePath, { ...f, evidence: opt.value }, 1)
                  const active = f.evidence === opt.value
                  return (
                    <Link
                      key={opt.value}
                      href={href}
                      className={`rounded-full border px-2.5 py-1 text-xs font-semibold transition ${active ? 'border-brand-700/25 bg-brand-50 text-brand-900' : 'border-brand-900/10 bg-white/80 text-[#33443a] hover:border-brand-700/20'}`}
                    >
                      {opt.label}
                    </Link>
                  )
                })}
              </div>
            </div>
            <div>
              <div className="mb-1 text-xs font-bold uppercase tracking-[0.12em] text-[#5f6f66]">Safety status</div>
              <div className="flex flex-wrap gap-2">
                {SAFETY_FILTERS.map((opt) => {
                  const href = buildFilterUrl(basePath, { ...f, safety: opt.value }, 1)
                  const active = f.safety === opt.value
                  return (
                    <Link
                      key={opt.value}
                      href={href}
                      className={`rounded-full border px-2.5 py-1 text-xs font-semibold transition ${active ? 'border-brand-700/25 bg-brand-50 text-brand-900' : 'border-brand-900/10 bg-white/80 text-[#33443a] hover:border-brand-700/20'}`}
                    >
                      {opt.label}
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Sort options (server-driven) */}
          <div>
            <div className="mb-1 text-xs font-bold uppercase tracking-[0.12em] text-[#5f6f66]">Sort</div>
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'A–Z', value: 'alpha' },
                { label: 'Evidence strength', value: 'evidence' },
              ].map((opt) => {
                const href = buildFilterUrl(basePath, { ...f, sort: opt.value }, 1)
                const active = (f.sort || 'alpha') === opt.value
                return (
                  <Link
                    key={opt.value}
                    href={href}
                    className={`rounded-full border px-2.5 py-1 text-xs font-semibold transition ${active ? 'border-brand-700/25 bg-brand-50 text-brand-900' : 'border-brand-900/10 bg-white/80 text-[#33443a] hover:border-brand-700/20'}`}
                  >
                    {opt.label}
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Active filters reset */}
          {(f.q || f.category !== 'all' || f.evidence !== 'all' || f.safety !== 'all' || (f.sort && f.sort !== 'alpha')) && (
            <div className="pt-1">
              <Link href={basePath} className="text-xs font-semibold text-brand-800 underline-offset-2 hover:underline">
                Clear all filters
              </Link>
            </div>
          )}
        </form>
      </section>

      {/* Results header + pagination (top) */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-semibold text-[#46574d]">
          {total === 0 ? 'No compounds match' : `Showing ${showingFrom}–${showingTo} of ${total}`}
        </p>
        <nav className="text-sm" aria-label="Pagination">
          {paged.hasPrev ? (
            <Link rel="prev" href={buildPaginatedHref(basePath, paged.currentPage - 1, (() => { const pp = new URLSearchParams(); if (f.q) pp.set('q', f.q); if (f.category !== 'all') pp.set('category', f.category); if (f.evidence !== 'all') pp.set('evidence', f.evidence); if (f.safety !== 'all') pp.set('safety', f.safety); return pp })())} className="mr-4">
              ← Previous
            </Link>
          ) : null}
          <span className="text-[#5f6f66]">Page {paged.currentPage} of {paged.totalPages}</span>
          {paged.hasNext ? (
            <Link rel="next" href={buildPaginatedHref(basePath, paged.currentPage + 1, (() => { const pp = new URLSearchParams(); if (f.q) pp.set('q', f.q); if (f.category !== 'all') pp.set('category', f.category); if (f.evidence !== 'all') pp.set('evidence', f.evidence); if (f.safety !== 'all') pp.set('safety', f.safety); return pp })())} className="ml-4">
              Next →
            </Link>
          ) : null}
        </nav>
      </div>

      {/* Cards */}
      {paged.pageItems.length === 0 ? (
        <div className="rounded-[0.85rem] border border-brand-900/10 bg-white/80 p-6 text-sm text-[#46574d]">
          No compounds matched your filters. <Link href={basePath} className="font-semibold text-brand-800">Reset</Link>.
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {paged.pageItems.map((c) => (
            <CompoundCard key={c.slug || getName(c)} c={c} />
          ))}
        </div>
      )}

      {/* Bottom pagination */}
      {paged.totalPages > 1 && (
        <nav className="rounded-[0.8rem] border border-brand-900/10 bg-white/80 p-3 text-sm" aria-label="Pagination bottom">
          <p className="font-semibold">Page {paged.currentPage} of {paged.totalPages}</p>
          <div className="mt-1 flex gap-4">
            {paged.hasPrev ? <Link rel="prev" href={buildPaginatedHref(basePath, paged.currentPage - 1, (() => { const pp = new URLSearchParams(); if (f.q) pp.set('q', f.q); if (f.category !== 'all') pp.set('category', f.category); if (f.evidence !== 'all') pp.set('evidence', f.evidence); if (f.safety !== 'all') pp.set('safety', f.safety); return pp })())} >← Previous page</Link> : null}
            {paged.hasNext ? <Link rel="next" href={buildPaginatedHref(basePath, paged.currentPage + 1, (() => { const pp = new URLSearchParams(); if (f.q) pp.set('q', f.q); if (f.category !== 'all') pp.set('category', f.category); if (f.evidence !== 'all') pp.set('evidence', f.evidence); if (f.safety !== 'all') pp.set('safety', f.safety); return pp })())} >Next page →</Link> : null}
          </div>
        </nav>
      )}

      {/* Server-rendered crawlable index for SEO */}
      <nav aria-label="Compound profiles index" className="sr-only">
        <ul>
          {indexLinks.map((c) => {
            const s = c.slug || ''
            return (
              <li key={s}>
                <Link href={`/compounds/${s}`}>{getName(c)}</Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )
}
