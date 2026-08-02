'use client'

import { useEffect, useMemo, useState } from 'react'

import { FilterChip } from '@/components/search/search-ui'

import type { AlkaloidDirectoryEntry } from './alkaloids'

type Filter = 'all' | 'human' | 'higher' | 'botanical' | 'isolated' | 'stimulant' | 'sedative' | 'interaction'

const FILTERS: Array<{ id: Filter; label: string }> = [
  { id: 'all', label: 'All entries' },
  { id: 'human', label: 'Human evidence' },
  { id: 'higher', label: 'Higher caution' },
  { id: 'botanical', label: 'Botanicals' },
  { id: 'isolated', label: 'Isolated compounds' },
  { id: 'stimulant', label: 'Stimulant risk' },
  { id: 'sedative', label: 'Sedative risk' },
  { id: 'interaction', label: 'Interaction risk' },
]

const SAFETY_STYLES = {
  standard:
    'border-emerald-700/20 bg-emerald-50 text-emerald-900 dark:border-emerald-400/25 dark:bg-emerald-950/40 dark:text-emerald-200',
  interaction:
    'border-amber-700/20 bg-amber-50 text-amber-950 dark:border-amber-400/25 dark:bg-amber-950/35 dark:text-amber-200',
  higher:
    'border-rose-700/20 bg-rose-50 text-rose-950 dark:border-rose-400/25 dark:bg-rose-950/35 dark:text-rose-200',
} as const

function matchesFilter(entry: AlkaloidDirectoryEntry, filter: Filter) {
  if (filter === 'all') return true
  if (filter === 'human') return entry.evidenceBand === 'human'
  if (filter === 'higher') return entry.safetyTier === 'higher'
  if (filter === 'botanical' || filter === 'isolated') return entry.formats.includes(filter)
  return entry.riskTags.some(tag => tag.includes(filter))
}

function ReferenceLinks({ ids }: { ids: number[] }) {
  if (!ids.length) return null

  return (
    <span className="ml-1 whitespace-nowrap text-xs font-semibold text-brand-800">
      {ids.map(id => (
        <a key={id} href={`#ref-${id}`} className="ml-1 underline decoration-current/25 underline-offset-2" aria-label={`Reference ${id}`}>
          [{id}]
        </a>
      ))}
    </span>
  )
}

export default function AlkaloidDirectory({ entries }: { entries: AlkaloidDirectoryEntry[] }) {
  const [filter, setFilter] = useState<Filter>('all')
  const [query, setQuery] = useState('')
  const [urlReady, setUrlReady] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const requestedFilter = params.get('filter')
    const requestedQuery = params.get('q')

    if (requestedFilter && FILTERS.some(option => option.id === requestedFilter)) {
      setFilter(requestedFilter as Filter)
    }
    if (requestedQuery) setQuery(requestedQuery)
    setUrlReady(true)
  }, [])

  useEffect(() => {
    if (!urlReady) return

    const url = new URL(window.location.href)
    if (filter === 'all') url.searchParams.delete('filter')
    else url.searchParams.set('filter', filter)
    if (query.trim()) url.searchParams.set('q', query.trim())
    else url.searchParams.delete('q')
    window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`)
  }, [filter, query, urlReady])

  const filteredEntries = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return entries.filter((entry) => {
      if (!matchesFilter(entry, filter)) return false
      if (!normalizedQuery) return true

      return [
        entry.name,
        entry.identity,
        entry.alkaloids,
        entry.classification,
        entry.safetyLabel,
        entry.humanEvidence,
        entry.traditionalEvidence,
        entry.mechanisticEvidence,
        entry.safetySummary,
        ...entry.riskTags,
      ].some((value) => value.toLowerCase().includes(normalizedQuery))
    })
  }, [entries, filter, query])

  return (
    <section id="directory" className="scroll-mt-24">
      <div className="rounded-3xl border border-brand-900/12 bg-[var(--surface-card)] p-5 shadow-sm sm:p-7">
        <div className="max-w-3xl">
          <p className="eyebrow-label">Ingredient directory</p>
          <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink">
            Compare the chemistry before the catalog
          </h2>
          <p className="mt-3 text-sm leading-7 text-muted">
            Evidence labels describe the kind of research available—not a recommendation. Higher-caution
            entries stay visible because hiding risk would make this directory less useful.
          </p>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-end">
          <fieldset>
            <legend className="mb-2 text-sm font-semibold text-ink">Filter the directory</legend>
            <div className="flex flex-wrap gap-2">
              {FILTERS.map((option) => (
                <FilterChip
                  key={option.id}
                  label={option.label}
                  active={filter === option.id}
                  count={entries.filter((entry) => matchesFilter(entry, option.id)).length}
                  onClick={() => setFilter(option.id)}
                />
              ))}
            </div>
          </fieldset>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-ink">Search names or classes</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Try “isoquinoline”"
              className="min-h-11 w-full rounded-xl border border-brand-900/15 bg-[var(--surface)] px-4 py-2 text-base text-ink outline-none transition placeholder:text-muted focus:border-brand-700 focus:ring-2 focus:ring-brand-700/20"
            />
          </label>
        </div>
      </div>

      <p className="my-5 text-sm text-muted" role="status" aria-live="polite">
        Showing {filteredEntries.length} of {entries.length} entries.
      </p>

      {filteredEntries.length ? (
        <div className="grid gap-5 lg:grid-cols-2">
          {filteredEntries.map((entry) => (
            <article
              key={entry.id}
              id={entry.id}
              className="scroll-mt-28 rounded-3xl border border-brand-900/12 bg-[var(--surface-card)] p-5 shadow-[0_8px_28px_rgba(13,23,18,0.05)] sm:p-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-display text-2xl font-semibold text-ink">{entry.name}</h3>
                  <p className="mt-1 text-sm italic leading-6 text-muted">{entry.identity}</p>
                </div>
                <span
                  className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${SAFETY_STYLES[entry.safetyTier]}`}
                >
                  {entry.safetyLabel}
                </span>
              </div>

              <dl className="mt-5 grid gap-3 rounded-2xl border border-brand-900/8 bg-[var(--surface-subtle)] p-4 text-sm">
                <div>
                  <dt className="text-xs font-bold uppercase tracking-wider text-muted">Named alkaloid(s)</dt>
                  <dd className="mt-1 font-medium text-ink">{entry.alkaloids}</dd>
                </div>
                <div>
                  <dt className="text-xs font-bold uppercase tracking-wider text-muted">Chemical class</dt>
                  <dd className="mt-1 font-medium text-ink">{entry.classification}</dd>
                </div>
                <div>
                  <dt className="text-xs font-bold uppercase tracking-wider text-muted">Evidence signal</dt>
                  <dd className="mt-1 font-medium text-ink">{entry.evidenceLabel}</dd>
                </div>
              </dl>

              <div className="mt-5 rounded-2xl border border-rose-900/10 bg-rose-50/55 p-4 text-sm leading-6 text-rose-950 dark:border-rose-400/20 dark:bg-rose-950/25 dark:text-rose-100">
                <strong>Safety read:</strong> {entry.safetySummary}<ReferenceLinks ids={entry.evidenceReferences.safety} />
              </div>

              <div className="mt-3 flex flex-wrap gap-2" aria-label="Risk and use tags">
                {entry.riskTags.map(tag => (
                  <span key={tag} className="rounded-full border border-brand-900/10 bg-[var(--surface-subtle)] px-2.5 py-1 text-xs font-medium text-muted">
                    {tag}
                  </span>
                ))}
              </div>

              <details className="group mt-4 rounded-2xl border border-brand-900/10">
                <summary className="cursor-pointer list-none px-4 py-3 text-sm font-semibold text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700/30">
                  <span className="flex items-center justify-between gap-3">
                    Evidence by source type
                    <span aria-hidden="true" className="text-brand-700 transition group-open:rotate-45">＋</span>
                  </span>
                </summary>
                <div className="space-y-4 border-t border-brand-900/8 px-4 py-4 text-sm leading-6 text-muted">
                  <p><strong className="text-ink">Human:</strong> {entry.humanEvidence}<ReferenceLinks ids={entry.evidenceReferences.human} /></p>
                  <p><strong className="text-ink">Traditional context:</strong> {entry.traditionalEvidence}<ReferenceLinks ids={entry.evidenceReferences.traditional} /></p>
                  <p><strong className="text-ink">Mechanistic/preclinical:</strong> {entry.mechanisticEvidence}<ReferenceLinks ids={entry.evidenceReferences.mechanistic} /></p>
                </div>
              </details>

              <div className="mt-5">
                <h4 className="text-sm font-semibold text-ink">What the label must make clear</h4>
                <ul className="mt-2 space-y-2 text-sm leading-6 text-muted">
                  {entry.labelChecks.map((check) => (
                    <li key={check} className="flex gap-2">
                      <span aria-hidden="true" className="mt-0.5 text-brand-700">✓</span>
                      <span>{check}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 border-t border-brand-900/8 pt-4 text-sm">
                {entry.internalLinks.map((link) => (
                  <a key={link.href} href={link.href} className="font-semibold text-brand-800 hover:underline">
                    {link.label} →
                  </a>
                ))}
                {entry.references.map(reference => (
                  <a key={reference} href={`#ref-${reference}`} className="font-semibold text-muted hover:text-ink hover:underline">
                    Source [{reference}]
                  </a>
                ))}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-brand-900/20 p-8 text-center">
          <p className="font-semibold text-ink">No entries match those filters.</p>
          <button
            type="button"
            className="mt-3 font-semibold text-brand-800 hover:underline"
            onClick={() => {
              setFilter('all')
              setQuery('')
            }}
          >
            Clear filters
          </button>
        </div>
      )}
    </section>
  )
}
