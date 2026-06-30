'use client'

import { useEffect, useId, useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Search, SlidersHorizontal } from 'lucide-react'
import { useGlobalSearch, useListKeyboardNav } from './useGlobalSearch'
import { FilterChip, TypeBadge, EvidenceBadge, SafetyBadge } from './search-ui'
import type { SearchFacetOption } from '@/lib/search/types'

interface FacetGroupProps {
  title: string
  options: SearchFacetOption[]
  selected: string[]
  onToggle: (value: string) => void
  limit?: number
}

function FacetGroup({ title, options, selected, onToggle, limit }: FacetGroupProps) {
  const shown = limit ? options.slice(0, limit) : options
  if (shown.length === 0) return null
  return (
    <fieldset className="space-y-2">
      <legend className="text-[0.78rem] font-semibold tracking-[0.02em] text-brand-800">{title}</legend>
      <div className="flex flex-wrap gap-1.5">
        {shown.map((option) => (
          <FilterChip
            key={option.value}
            label={option.label}
            count={option.count}
            active={selected.includes(option.value)}
            onClick={() => onToggle(option.value)}
          />
        ))}
      </div>
    </fieldset>
  )
}

/**
 * Full-page global search. Combines herbs, compounds, and education with
 * faceted filtering (type, goal/pathway, evidence, safety), keyboard navigation
 * over results, and a mobile-friendly responsive layout. Fully static.
 */
export default function GlobalSearch() {
  const router = useRouter()
  const search = useGlobalSearch({ limit: 60 })
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const listboxId = useId()
  const optionPrefix = useId()

  const navigate = (index: number) => {
    const doc = search.results[index]
    if (doc) router.push(doc.href)
  }

  const { activeIndex, setActiveIndex, onKeyDown } = useListKeyboardNav({
    count: search.results.length,
    onSelect: navigate,
    resetKey: `${search.query}|${search.activeFilters}`,
  })

  // Keep the active card in view during keyboard navigation.
  useEffect(() => {
    const node = listRef.current?.querySelector<HTMLElement>(`#${CSS.escape(`${optionPrefix}-${activeIndex}`)}`)
    node?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex, optionPrefix])

  const facetFilterMap = useMemo(
    () =>
      ({
        goals: 'goals',
        pathways: 'pathways',
        evidenceGrades: 'evidenceGrades',
        safety: 'safety',
      }) as const,
    [],
  )

  const activeOptionId = search.results.length ? `${optionPrefix}-${activeIndex}` : undefined

  return (
    <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
      {/* Filters sidebar */}
      <aside className="space-y-5 lg:sticky lg:top-20 lg:self-start" aria-label="Search filters">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-sm font-bold text-ink">
            <SlidersHorizontal className="h-4 w-4 text-brand-700" aria-hidden="true" />
            Filters
          </span>
          {search.activeFilters > 0 && (
            <button
              type="button"
              onClick={search.clearFilters}
              className="text-xs font-semibold text-brand-700 hover:text-brand-900"
            >
              Clear ({search.activeFilters})
            </button>
          )}
        </div>

        {search.facets && (
          <div className="space-y-5 rounded-2xl border border-brand-900/10 bg-white/80 p-4">
            <FacetGroup
              title="Content type"
              options={search.facets.types}
              selected={search.filters.types}
              onToggle={(v) => search.toggleFilter('types', v as never)}
            />
            <FacetGroup
              title="Goal / use case"
              options={search.facets.goals}
              selected={search.filters.goals}
              onToggle={(v) => search.toggleFilter(facetFilterMap.goals, v as never)}
              limit={12}
            />
            <FacetGroup
              title="Pathway"
              options={search.facets.pathways}
              selected={search.filters.pathways}
              onToggle={(v) => search.toggleFilter(facetFilterMap.pathways, v as never)}
              limit={10}
            />
            <FacetGroup
              title="Evidence grade"
              options={search.facets.evidenceGrades}
              selected={search.filters.evidenceGrades}
              onToggle={(v) => search.toggleFilter(facetFilterMap.evidenceGrades, v as never)}
            />
            <FacetGroup
              title="Safety"
              options={search.facets.safety.filter((o) => o.value !== 'Educational')}
              selected={search.filters.safety}
              onToggle={(v) => search.toggleFilter(facetFilterMap.safety, v as never)}
            />

            <fieldset className="space-y-2 border-t border-brand-900/10 pt-4">
              <legend className="text-[0.78rem] font-semibold tracking-[0.02em] text-brand-800">
                Safety considerations
              </legend>
              <div className="flex flex-wrap gap-1.5">
                <FilterChip
                  label="Has interactions"
                  active={search.filters.hasInteractions}
                  onClick={() => search.toggleFilter('hasInteractions', true as never)}
                />
                <FilterChip
                  label="Has contraindications"
                  active={search.filters.hasContraindications}
                  onClick={() => search.toggleFilter('hasContraindications', true as never)}
                />
              </div>
            </fieldset>
          </div>
        )}
      </aside>

      {/* Search + results */}
      <div className="space-y-5">
        <div className="relative rounded-2xl border border-brand-900/10 bg-white/90 p-2.5 shadow-sm sm:p-3">
          <div className="flex items-center gap-2.5 px-2">
            <Search className="h-5 w-5 shrink-0 text-brand-700" aria-hidden="true" />
            <label htmlFor="global-search-input" className="sr-only">
              Search herbs, compounds, and education
            </label>
            <input
              id="global-search-input"
              ref={inputRef}
              type="search"
              role="combobox"
              aria-expanded={search.results.length > 0}
              aria-controls={listboxId}
              aria-activedescendant={activeOptionId}
              aria-autocomplete="list"
              autoComplete="off"
              value={search.query}
              onChange={(e) => search.setQuery(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Try sleep, ashwagandha, GABA, dopamine, evidence levels…"
              className="min-h-12 w-full bg-transparent py-2 text-base text-ink outline-none placeholder:text-muted/60 dark:placeholder:text-[var(--text-muted)]/50 sm:text-lg"
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-muted" aria-live="polite" aria-atomic="true">
            {!search.ready
              ? 'Loading search…'
              : `${search.results.length} result${search.results.length === 1 ? '' : 's'}` +
                (search.query ? ` for “${search.query}”` : '') +
                (search.activeFilters ? ` · ${search.activeFilters} filter${search.activeFilters === 1 ? '' : 's'}` : '')}
          </p>
          {search.totalIndexed > 0 && (
            <span className="hidden text-xs text-muted sm:inline">
              {search.totalIndexed} entries indexed
            </span>
          )}
        </div>

        {search.ready && search.results.length === 0 ? (
          <div className="rounded-2xl border border-brand-900/10 bg-white/85 p-6 text-sm leading-6 text-muted">
            No matches. Try a broader term (sleep, stress, focus) or clear filters.
          </div>
        ) : (
          <ul
            ref={listRef}
            id={listboxId}
            role="listbox"
            aria-label="Search results"
            className="grid gap-3 sm:grid-cols-2"
          >
            {search.results.map((doc, index) => (
              <li role="option" aria-selected={index === activeIndex} id={`${optionPrefix}-${index}`} key={doc.id}>
                <Link
                  href={doc.href}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={`flex h-full flex-col gap-2 rounded-2xl border bg-white/90 p-4 shadow-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-700/40 ${
                    index === activeIndex
                      ? 'border-brand-700/40 ring-2 ring-brand-700/20'
                      : 'border-brand-900/10 hover:border-brand-700/20 hover:shadow-md'
                  }`}
                >
                  <div className="flex flex-wrap items-center gap-1.5">
                    <TypeBadge type={doc.type} />
                    <EvidenceBadge grade={doc.evidenceGrade} />
                    <SafetyBadge safety={doc.safety} />
                  </div>
                  <h3 className="text-lg font-semibold leading-tight text-ink">{doc.title}</h3>
                  {doc.summary && (
                    <p className="line-clamp-2 text-sm leading-6 text-muted">{doc.summary}</p>
                  )}
                  {doc.tags.length > 0 && (
                    <div className="mt-auto flex flex-wrap gap-1 pt-1">
                      {doc.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-brand-50 px-2 py-0.5 text-[0.72rem] font-medium text-brand-800"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
