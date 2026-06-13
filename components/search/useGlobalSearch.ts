'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import type { SearchDoc, SearchFacets, SearchFilterState } from '@/lib/search/types'
import { EMPTY_FILTERS } from '@/lib/search/types'
import {
  activeFilterCount,
  loadSearchEngine,
  runSearch,
  type SearchEngine,
} from '@/lib/search/search-engine'

export interface UseGlobalSearchOptions {
  /** Defer loading the engine until `active` is true (e.g. modal opened). */
  active?: boolean
  limit?: number
  initialQuery?: string
}

export interface UseGlobalSearch {
  ready: boolean
  query: string
  setQuery: (value: string) => void
  filters: SearchFilterState
  toggleFilter: <K extends keyof SearchFilterState>(key: K, value: SearchFilterState[K] extends Array<infer T> ? T : boolean) => void
  clearFilters: () => void
  activeFilters: number
  results: SearchDoc[]
  facets: SearchFacets | null
  totalIndexed: number
}

/** Loads the engine (once active) and derives filtered, ranked results. */
export function useGlobalSearch(options: UseGlobalSearchOptions = {}): UseGlobalSearch {
  const { active = true, limit = 50, initialQuery = '' } = options
  const [engine, setEngine] = useState<SearchEngine | null>(null)
  const [query, setQuery] = useState(initialQuery)
  const [filters, setFilters] = useState<SearchFilterState>(EMPTY_FILTERS)

  useEffect(() => {
    if (!active || engine) return
    let cancelled = false
    loadSearchEngine().then((loaded) => {
      if (!cancelled) setEngine(loaded)
    })
    return () => {
      cancelled = true
    }
  }, [active, engine])

  const toggleFilter = useCallback<UseGlobalSearch['toggleFilter']>((key, value) => {
    setFilters((prev) => {
      const current = prev[key]
      if (typeof current === 'boolean') {
        return { ...prev, [key]: !current }
      }
      const arr = current as unknown[]
      const exists = arr.includes(value)
      return {
        ...prev,
        [key]: exists ? arr.filter((v) => v !== value) : [...arr, value],
      }
    })
  }, [])

  const clearFilters = useCallback(() => setFilters(EMPTY_FILTERS), [])

  const results = useMemo(() => {
    if (!engine) return []
    return runSearch(engine, { query, filters, limit })
  }, [engine, query, filters, limit])

  return {
    ready: Boolean(engine),
    query,
    setQuery,
    filters,
    toggleFilter,
    clearFilters,
    activeFilters: activeFilterCount(filters),
    results,
    facets: engine?.facets ?? null,
    totalIndexed: engine?.docs.length ?? 0,
  }
}

export interface UseListKeyboardNavOptions {
  count: number
  onSelect: (index: number) => void
  /** Reset active index to 0 when this value changes (e.g. query/results). */
  resetKey?: unknown
}

/**
 * Roving-activedescendant keyboard navigation for a listbox of results.
 * Returns the active index plus an onKeyDown handler to attach to the input.
 */
export function useListKeyboardNav({ count, onSelect, resetKey }: UseListKeyboardNavOptions) {
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    setActiveIndex(0)
  }, [resetKey])

  useEffect(() => {
    if (activeIndex > count - 1) setActiveIndex(count > 0 ? count - 1 : 0)
  }, [count, activeIndex])

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (count === 0) return
      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault()
          setActiveIndex((i) => (i + 1) % count)
          break
        case 'ArrowUp':
          event.preventDefault()
          setActiveIndex((i) => (i - 1 + count) % count)
          break
        case 'Home':
          event.preventDefault()
          setActiveIndex(0)
          break
        case 'End':
          event.preventDefault()
          setActiveIndex(count - 1)
          break
        case 'Enter':
          event.preventDefault()
          onSelect(activeIndex)
          break
        default:
          break
      }
    },
    [count, onSelect, activeIndex],
  )

  return { activeIndex, setActiveIndex, onKeyDown }
}
