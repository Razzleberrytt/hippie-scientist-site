'use client'

import { useState, useEffect } from 'react'

type TocItem = { id: string; label: string }
type ProfileTOCVariant = 'all' | 'mobile' | 'desktop'

export default function ProfileTOC({ items, variant = 'all' }: { items: TocItem[]; variant?: ProfileTOCVariant }) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find(e => e.isIntersecting)
        if (visible) setActiveId(visible.target.id)
      },
      { rootMargin: '-20% 0px -70% 0px' }
    )
    items.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [items])

  if (items.length === 0) return null

  const links = (
    <ol className="space-y-1">
      {items.map(({ id, label }) => {
        const isActive = activeId === id
        return (
          <li key={id}>
            <a
              href={`#${id}`}
              onClick={() => setMobileOpen(false)}
              className={`block rounded-xl px-3 py-2 text-sm transition-colors ${
                isActive
                  ? 'bg-brand-50 font-semibold text-brand-900 shadow-sm dark:bg-white/10 dark:text-brand-50'
                  : 'text-muted hover:bg-brand-50/60 hover:text-ink dark:hover:bg-white/10 dark:hover:text-brand-50'
              }`}
            >
              {label}
            </a>
          </li>
        )
      })}
    </ol>
  )

  return (
    <>
      {variant !== 'desktop' ? (
        <nav
          aria-label="Page sections"
          className="rounded-2xl border border-brand-900/10 bg-white/90 p-3 shadow-sm backdrop-blur lg:hidden dark:border-white/10 dark:bg-white/5"
        >
          <button
            type="button"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen(open => !open)}
            className="flex w-full items-center justify-between rounded-xl px-2 py-1 text-left text-sm font-semibold text-ink"
          >
            On this page
            <span aria-hidden="true" className={`text-muted transition-transform ${mobileOpen ? 'rotate-180' : ''}`}>
              v
            </span>
          </button>
          {mobileOpen ? <div className="mt-3 border-t border-brand-900/10 pt-3 dark:border-white/10">{links}</div> : null}
        </nav>
      ) : null}

      {variant !== 'mobile' ? (
        <nav
          aria-label="Page sections"
          className="hidden w-56 shrink-0 self-start rounded-2xl border border-brand-900/10 bg-white/75 p-3 shadow-sm backdrop-blur lg:sticky lg:top-24 lg:block dark:border-white/10 dark:bg-white/5"
        >
          <p className="eyebrow-label mb-3 px-2">On this page</p>
          {links}
        </nav>
      ) : null}
    </>
  )
}
