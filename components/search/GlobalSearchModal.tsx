'use client'

import { useCallback, useEffect, useId, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Search, X } from 'lucide-react'
import { useGlobalSearch, useListKeyboardNav } from './useGlobalSearch'
import { FilterChip, ResultRow } from './search-ui'
import type { SearchContentType } from '@/lib/search/types'

const TYPE_FILTERS: SearchContentType[] = ['Herb', 'Compound', 'Education']

type GlobalSearchModalProps = {
  open: boolean
  onClose: () => void
  dialogId?: string
}

/**
 * Heavy global command-palette dialog.
 *
 * Navigation owns the lightweight trigger, hotkeys, and open state so this
 * module can be code-split and loaded only after the first search interaction.
 * Once loaded, this component stays mounted while closed so query/filter state
 * survives reopening; the search engine/index itself still activates lazily only
 * while `open` is true.
 */
export function GlobalSearchModal({ open, onClose, dialogId: providedDialogId }: GlobalSearchModalProps) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const generatedDialogId = useId()
  const dialogId = providedDialogId ?? generatedDialogId
  const listboxId = useId()
  const optionPrefix = useId()

  const search = useGlobalSearch({ active: open, limit: 24 })
  const close = useCallback(() => onClose(), [onClose])

  const navigate = useCallback(
    (index: number) => {
      const doc = search.results[index]
      if (!doc) return
      close()
      router.push(doc.href)
    },
    [search.results, close, router],
  )

  const { activeIndex, setActiveIndex, onKeyDown } = useListKeyboardNav({
    count: search.results.length,
    onSelect: navigate,
    resetKey: `${search.query}|${search.activeFilters}`,
  })

  // Scroll lock + focus input on open.
  useEffect(() => {
    if (!open) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const focusFrame = requestAnimationFrame(() => inputRef.current?.focus())
    return () => {
      document.body.style.overflow = prevOverflow
      cancelAnimationFrame(focusFrame)
    }
  }, [open])

  // Escape to close + simple focus trap within the dialog.
  const onDialogKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        close()
        return
      }
      if (event.key !== 'Tab') return
      const focusables = dialogRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])',
      )
      if (!focusables || focusables.length === 0) return
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    },
    [close],
  )

  const activeOptionId = search.results[activeIndex] ? `${optionPrefix}-${activeIndex}` : undefined

  useEffect(() => {
    if (!activeOptionId) return
    document.getElementById(activeOptionId)?.scrollIntoView({ block: 'nearest' })
  }, [activeOptionId])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-4 sm:pb-4 sm:pt-[12vh] lg:pt-[15vh]"
      role="presentation"
    >
      <div
        className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
        onClick={close}
        aria-hidden="true"
      />
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- modal dialog requires onKeyDown for Escape/Tab focus trapping */}
      <div
        ref={dialogRef}
        id={dialogId}
        role="dialog"
        aria-modal="true"
        aria-label="Site search"
        onKeyDown={onDialogKeyDown}
        className="relative flex max-h-[calc(100dvh-1.5rem-env(safe-area-inset-top)-env(safe-area-inset-bottom))] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-brand-900/10 bg-white shadow-2xl dark:border-[var(--border-strong)] dark:bg-[var(--surface-card-strong)] sm:max-h-[76vh]"
      >
        <div className="flex shrink-0 items-center gap-2.5 border-b border-brand-900/10 px-4">
          <Search className="h-5 w-5 shrink-0 text-brand-700" aria-hidden="true" />
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-expanded='true'
            aria-controls={listboxId}
            aria-activedescendant={activeOptionId}
            aria-autocomplete="list"
            aria-label="Search herbs, compounds, and education"
            autoComplete="off"
            spellCheck={false}
            value={search.query}
            onChange={(e) => search.setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Search herbs, compounds, and education…"
            className="min-h-14 w-full bg-transparent py-3 text-base text-ink outline-none placeholder:text-muted/60 dark:placeholder:text-[var(--text-muted)]/50"
          />
          <kbd className="hidden shrink-0 rounded border border-brand-900/15 bg-brand-50/60 px-1.5 py-0.5 text-[10px] font-semibold text-ink/75 dark:border-[var(--border-soft)] dark:bg-[var(--surface-neutral)] dark:text-[var(--text-muted)] sm:inline">
            Esc
          </kbd>
          <button
            type="button"
            onClick={close}
            aria-label="Close site search"
            className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-full text-muted transition hover:bg-brand-50 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700 dark:hover:bg-[var(--surface-subtle)] dark:hover:text-[var(--text-primary)]"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div role="group" aria-label="Filter by content type" className="flex shrink-0 flex-wrap items-center gap-1.5 border-b border-brand-900/10 px-4 py-2">
          {TYPE_FILTERS.map((type) => (
            <FilterChip
              key={type}
              label={type}
              active={search.filters.types.includes(type)}
              onClick={() => search.toggleFilter('types', type)}
            />
          ))}
          {search.activeFilters > 0 && (
            <button
              type="button"
              onClick={search.clearFilters}
              className="ml-auto rounded text-xs font-semibold text-brand-700 hover:text-brand-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700"
            >
              Clear filters
            </button>
          )}
        </div>

        <ul
          id={listboxId}
          role="listbox"
          aria-label="Search results"
          aria-busy={!search.ready}
          className="min-h-0 flex-1 space-y-0.5 overflow-y-auto overscroll-contain p-2 sm:max-h-[50vh]"
        >
          {!search.ready ? (
            <li role="option" aria-disabled="true" aria-selected="false" className="px-3 py-6 text-center text-sm text-muted">Loading search…</li>
          ) : search.results.length === 0 ? (
            <li role="option" aria-disabled="true" aria-selected="false" className="px-3 py-6 text-center text-sm text-muted">
              {search.query ? `No matches for “${search.query}”.` : 'Start typing to search.'}
            </li>
          ) : (
            search.results.map((doc, index) => (
              <ResultRow
                key={doc.id}
                doc={doc}
                id={`${optionPrefix}-${index}`}
                active={index === activeIndex}
                onHover={() => setActiveIndex(index)}
                onSelect={() => navigate(index)}
              />
            ))
          )}
        </ul>

        <div className="flex shrink-0 items-center justify-between gap-3 border-t border-brand-900/10 bg-[var(--surface-subtle)] px-4 py-2 text-[11px] text-muted">
          <span aria-live="polite" aria-atomic="true" className="min-w-0">
            {search.ready
              ? `${search.results.length} result${search.results.length === 1 ? '' : 's'} shown`
              : ''}
          </span>
          <div className="flex shrink-0 items-center gap-3">
            <span className="hidden items-center gap-3 sm:flex">
              <span>↑↓ navigate</span>
              <span>↵ open</span>
            </span>
            <Link
              href="/search/"
              onClick={close}
              className="rounded font-semibold text-brand-700 hover:text-brand-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700"
            >
              Advanced search →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GlobalSearchModal
