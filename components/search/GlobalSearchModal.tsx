'use client'

import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Search } from 'lucide-react'
import { useGlobalSearch, useListKeyboardNav } from './useGlobalSearch'
import { FilterChip, ResultRow } from './search-ui'
import type { SearchContentType } from '@/lib/search/types'

const TYPE_FILTERS: SearchContentType[] = ['Herb', 'Compound', 'Education']

/**
 * Global command-palette search.
 *
 * - Opens with Cmd/Ctrl+K (or "/" when not typing in a field) and via the
 *   visible trigger button.
 * - Accessible combobox + listbox with full keyboard navigation, focus trap,
 *   scroll lock, and focus restoration.
 * - Loads the search engine lazily on first open (code-split index + Fuse).
 */
export function GlobalSearchModal() {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const listboxId = useId()
  const optionPrefix = useId()

  const search = useGlobalSearch({ active: open, limit: 24 })

  const close = useCallback(() => {
    setOpen(false)
    // Restore focus to the trigger for keyboard users.
    requestAnimationFrame(() => triggerRef.current?.focus())
  }, [])

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

  // Global hotkeys: Cmd/Ctrl+K, and "/" when not focused in an input.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const mod = event.metaKey || event.ctrlKey
      if (mod && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setOpen((v) => !v)
        return
      }
      const target = event.target as HTMLElement | null
      const typing =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      if (event.key === '/' && !typing && !open) {
        event.preventDefault()
        setOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  // Scroll lock + focus input on open.
  useEffect(() => {
    if (!open) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const focusTimer = requestAnimationFrame(() => inputRef.current?.focus())
    return () => {
      document.body.style.overflow = prevOverflow
      cancelAnimationFrame(focusTimer)
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

  const activeOptionId = search.results.length ? `${optionPrefix}-${activeIndex}` : undefined

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-full border border-brand-900/10 bg-white px-3 py-1.5 text-sm text-ink/70 transition hover:border-brand-700/25 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700"
        aria-label="Open search"
        aria-keyshortcuts="Meta+K Control+K"
      >
        <Search className="h-4 w-4" aria-hidden="true" />
        <span className="hidden sm:inline">Search</span>
        <kbd className="hidden rounded border border-brand-900/15 bg-stone-50 px-1.5 py-0.5 text-[10px] font-semibold text-ink/50 md:inline">
          ⌘K
        </kbd>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-start justify-center px-4 pt-[12vh] sm:pt-[15vh]"
          role="presentation"
        >
          <div
            className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
            onClick={close}
            aria-hidden="true"
          />
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label="Site search"
            onKeyDown={onDialogKeyDown}
            className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-brand-900/10 bg-white shadow-2xl"
          >
            {/* Search input (combobox) */}
            <div className="flex items-center gap-2.5 border-b border-brand-900/10 px-4">
              <Search className="h-5 w-5 shrink-0 text-brand-700" aria-hidden="true" />
              <input
                ref={inputRef}
                type="text"
                role="combobox"
                aria-expanded={search.results.length > 0}
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
                className="min-h-14 w-full bg-transparent py-3 text-base text-ink outline-none placeholder:text-[#7b887f]"
              />
              <kbd className="hidden shrink-0 rounded border border-brand-900/15 bg-stone-50 px-1.5 py-0.5 text-[10px] font-semibold text-ink/40 sm:inline">
                Esc
              </kbd>
            </div>

            {/* Quick type filters */}
            <div className="flex flex-wrap items-center gap-1.5 border-b border-brand-900/10 px-4 py-2">
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
                  className="ml-auto text-xs font-semibold text-brand-700 hover:text-brand-900"
                >
                  Clear filters
                </button>
              )}
            </div>

            {/* Results listbox */}
            <ul
              id={listboxId}
              role="listbox"
              aria-label="Search results"
              className="max-h-[50vh] space-y-0.5 overflow-y-auto overscroll-contain p-2"
            >
              {!search.ready ? (
                <li className="px-3 py-6 text-center text-sm text-[#5f6f66]">Loading search…</li>
              ) : search.results.length === 0 ? (
                <li className="px-3 py-6 text-center text-sm text-[#5f6f66]">
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

            {/* Footer / live region */}
            <div className="flex items-center justify-between border-t border-brand-900/10 bg-stone-50/60 px-4 py-2 text-[11px] text-[#5f6f66]">
              <span aria-live="polite" aria-atomic="true">
                {search.ready
                  ? `${search.results.length} result${search.results.length === 1 ? '' : 's'}`
                  : ''}
              </span>
              <span className="hidden items-center gap-3 sm:flex">
                <span>↑↓ navigate</span>
                <span>↵ open</span>
                <Link
                  href="/search"
                  onClick={close}
                  className="font-semibold text-brand-700 hover:text-brand-900"
                >
                  Advanced search →
                </Link>
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default GlobalSearchModal
