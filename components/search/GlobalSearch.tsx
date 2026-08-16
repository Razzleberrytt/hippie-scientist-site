'use client'

import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronDown, Search, SlidersHorizontal } from 'lucide-react'
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
    <fieldset className="space-y-2.5">
      <legend className="text-[0.68rem] font-bold uppercase tracking-[0.13em] text-[color:var(--hs-body)]">
        {title}
      </legend>
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
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  const navigate = (index: number) => {
    const doc = search.results[index]
    if (doc) router.push(doc.href)
  }

  const { activeIndex, setActiveIndex, onKeyDown } = useListKeyboardNav({
    count: search.results.length,
    onSelect: navigate,
    resetKey: `${search.query}|${search.activeFilters}`,
  })

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

  const activeOptionId = search.results[activeIndex] ? `${optionPrefix}-${activeIndex}` : undefined

  return (
    <div className="grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-10">
      <aside className="space-y-3 lg:sticky lg:top-20 lg:self-start lg:space-y-5" aria-label="Search filters">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setMobileFiltersOpen((open) => !open)}
            aria-expanded={mobileFiltersOpen}
            aria-controls="search-filter-panel"
            className="flex min-h-11 items-center gap-2 rounded-xl text-sm font-semibold text-[color:var(--hs-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--hs-gold)] lg:hidden"
          >
            <SlidersHorizontal className="h-4 w-4 text-[color:var(--tone-ink)]" aria-hidden="true" />
            <span>Refine index{search.activeFilters ? ` (${search.activeFilters})` : ''}</span>
            <ChevronDown
              aria-hidden="true"
              className={`h-4 w-4 text-[color:var(--hs-body)] transition-transform ${mobileFiltersOpen ? 'rotate-180' : ''}`}
            />
          </button>
          <span className="hidden items-center gap-2 text-sm font-semibold text-[color:var(--hs-ink)] lg:flex">
            <SlidersHorizontal className="h-4 w-4 text-[color:var(--tone-ink)]" aria-hidden="true" />
            Refine index
          </span>
          {search.activeFilters > 0 ? (
            <button
              type="button"
              onClick={search.clearFilters}
              className="rounded text-xs font-semibold text-[color:var(--tone-ink)] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--hs-gold)]"
            >
              Clear ({search.activeFilters})
            </button>
          ) : null}
        </div>

        {search.facets ? (
          <div
            id="search-filter-panel"
            className={`${mobileFiltersOpen ? 'block' : 'hidden'} space-y-5 rounded-[1.4rem] border border-[color:var(--hs-hairline)] bg-[color:color-mix(in_srgb,var(--hs-surface)_88%,transparent)] p-4 sm:p-5 lg:block`}
          >
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

            <fieldset className="space-y-2.5 border-t border-[color:var(--hs-hairline)] pt-4">
              <legend className="text-[0.68rem] font-bold uppercase tracking-[0.13em] text-[color:var(--hs-body)]">
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
        ) : null}
      </aside>

      <div className="min-w-0 space-y-5">
        <div className="relative overflow-hidden rounded-[1.35rem] border border-[color:var(--hs-hairline-strong)] bg-[color:var(--hs-surface)] p-2.5 shadow-[0_12px_32px_-26px_rgba(49,42,52,0.36)] focus-within:border-[color:color-mix(in_srgb,var(--hs-gold)_55%,var(--hs-hairline))] focus-within:ring-2 focus-within:ring-[color:color-mix(in_srgb,var(--hs-gold)_12%,transparent)] sm:p-3">
          <div aria-hidden="true" className="absolute inset-y-0 left-0 w-1 bg-[linear-gradient(180deg,var(--hs-gold),var(--tone))]" />
          <div className="flex items-center gap-2.5 px-2 pl-3">
            <Search className="h-5 w-5 shrink-0 text-[color:var(--tone-ink)]" aria-hidden="true" />
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
              aria-keyshortcuts="ArrowDown ArrowUp Enter"
              autoComplete="off"
              spellCheck={false}
              value={search.query}
              onChange={(e) => search.setQuery(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Try sleep, ashwagandha, GABA, dopamine, evidence levels…"
              className="min-h-12 w-full bg-transparent py-2 text-base text-[color:var(--hs-ink)] outline-none placeholder:text-[color:color-mix(in_srgb,var(--hs-body)_62%,transparent)] sm:text-lg"
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 border-b border-[color:var(--hs-hairline)] pb-3">
          <p className="text-sm text-[color:var(--hs-body)]" aria-live="polite" aria-atomic="true">
            {!search.ready
              ? 'Loading search…'
              : `${search.results.length} result${search.results.length === 1 ? '' : 's'}` +
                (search.query ? ` for “${search.query}”` : '') +
                (search.activeFilters ? ` · ${search.activeFilters} filter${search.activeFilters === 1 ? '' : 's'}` : '')}
          </p>
          {search.totalIndexed > 0 ? (
            <span className="hidden font-mono text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-[color:var(--hs-body)] sm:inline">
              {search.totalIndexed} indexed
            </span>
          ) : null}
        </div>

        {search.ready && search.results.length === 0 ? (
          <ul id={listboxId} role="listbox" aria-label="Search results" className="border-b border-[color:var(--hs-hairline)]">
            <li role="option" aria-disabled="true" aria-selected="false" className="py-7 text-sm leading-6 text-[color:var(--hs-body)]">
              No matches. Try a broader term (sleep, stress, focus) or clear filters.
            </li>
          </ul>
        ) : (
          <ul
            ref={listRef}
            id={listboxId}
            role="listbox"
            aria-label="Search results"
            aria-busy={!search.ready}
            className="divide-y divide-[color:var(--hs-hairline)] border-b border-[color:var(--hs-hairline)]"
          >
            {search.results.map((doc, index) => (
              <li role="option" aria-selected={index === activeIndex} id={`${optionPrefix}-${index}`} key={doc.id}>
                <Link
                  href={doc.href}
                  onMouseEnter={() => setActiveIndex(index)}
                  onFocus={() => setActiveIndex(index)}
                  className={`group grid grid-cols-[2rem_minmax(0,1fr)] gap-3 px-1 py-5 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[color:var(--hs-gold)] sm:grid-cols-[2.5rem_minmax(0,1fr)] sm:gap-4 sm:px-2 ${
                    index === activeIndex
                      ? 'bg-[color:color-mix(in_srgb,var(--tone)_7%,transparent)] shadow-[inset_2px_0_0_var(--hs-gold)]'
                      : 'hover:bg-[color:color-mix(in_srgb,var(--tone)_4%,transparent)]'
                  }`}
                >
                  <span aria-hidden="true" className="pt-1 font-mono text-[0.64rem] font-bold tracking-[0.12em] text-[color:var(--hs-gold-ink)]">
                    {String(index + 1).padStart(2, '0')}
                  </span>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <TypeBadge type={doc.type} />
                      <EvidenceBadge grade={doc.evidenceGrade} />
                      <SafetyBadge safety={doc.safety} />
                    </div>
                    <h3 className="mt-2 font-display text-xl font-semibold leading-tight tracking-[-0.025em] text-[color:var(--hs-ink)] transition group-hover:text-[color:var(--tone-ink)]">
                      {doc.title}
                    </h3>
                    {doc.summary ? (
                      <p className="mt-2 line-clamp-2 max-w-3xl text-sm leading-6 text-[color:var(--hs-body)]">{doc.summary}</p>
                    ) : null}
                    {doc.tags.length > 0 ? (
                      <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1">
                        {doc.tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="text-[0.7rem] font-semibold text-[color:var(--tone-ink)]">
                            {tag}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
