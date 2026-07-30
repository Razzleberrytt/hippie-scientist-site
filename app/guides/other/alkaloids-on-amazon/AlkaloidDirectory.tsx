'use client'

import { useMemo, useState } from 'react'

import { FilterChip } from '@/components/search/search-ui'

import type { AlkaloidDirectoryEntry } from './alkaloids'

type Filter = 'all' | 'human' | 'higher' | 'botanical' | 'isolated'

const FILTERS: Array<{ id: Filter; label: string }> = [
  { id: 'all', label: 'All entries' },
  { id: 'human', label: 'Human evidence' },
  { id: 'higher', label: 'Higher caution' },
  { id: 'botanical', label: 'Botanicals' },
  { id: 'isolated', label: 'Isolated compounds' },
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
  return entry.formats.includes(filter)
}

export default function AlkaloidDirectory({ entries }: { entries: AlkaloidDirectoryEntry[] }) {
  const [filter, setFilter] = useState<Filter>('all')
  const [query, setQuery] = useState('')

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
                <strong>Safety read:</strong> {entry.safetySummary}
              </div>

              <details className="group mt-4 rounded-2xl border border-brand-900/10">
                <summary className="cursor-pointer list-none px-4 py-3 text-sm font-semibold text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700/30">
                  <span className="flex items-center justify-between gap-3">
                    Evidence by source type
                    <span aria-hidden="true" className="text-brand-700 transition group-open:rotate-45">＋</span>
                  </span>
                </summary>
                <div className="space-y-4 border-t border-brand-900/8 px-4 py-4 text-sm leading-6 text-muted">
                  <p><strong className="text-ink">Human:</strong> {entry.humanEvidence}</p>
                  <p><strong className="text-ink">Traditional context:</strong> {entry.traditionalEvidence}</p>
                  <p><strong className="text-ink">Mechanistic/preclinical:</strong> {entry.mechanisticEvidence}</p>
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
                <a href={`#ref-${entry.references[0]}`} className="font-semibold text-muted hover:text-ink hover:underline">
                  Source{entry.references.length > 1 ? 's' : ''} [{entry.references.join(', ')}]
                </a>
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
