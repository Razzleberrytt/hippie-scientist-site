'use client'

import { useState, useEffect } from 'react'
import '@/styles/profile-rendering-performance.css'

type TocItem = { id: string; label: string }
type ProfileTOCVariant = 'all' | 'mobile' | 'desktop'

const QUICK_TOC_PRIORITIES = [
  /decision|verdict|summary|overview/i,
  /evidence/i,
  /safety|interaction/i,
  /dos|how to use/i,
  /source|reference|citation/i,
]

export function getActiveTocLabel(items: TocItem[], activeId: string | null) {
  return items.find(({ id }) => id === activeId)?.label || items[0]?.label || ''
}

export function getQuickTocItems(items: TocItem[], limit = 4) {
  const selected: TocItem[] = []

  for (const pattern of QUICK_TOC_PRIORITIES) {
    const match = items.find(
      (item) =>
        !selected.some((selectedItem) => selectedItem.id === item.id) &&
        pattern.test(`${item.id} ${item.label}`),
    )
    if (match) selected.push(match)
    if (selected.length >= limit) return selected
  }

  for (const item of items) {
    if (!selected.some((selectedItem) => selectedItem.id === item.id)) selected.push(item)
    if (selected.length >= limit) break
  }

  return selected
}

export default function ProfileTOC({ items, variant = 'all' }: { items: TocItem[]; variant?: ProfileTOCVariant }) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting)
        if (visible) setActiveId(visible.target.id)
      },
      { rootMargin: '-20% 0px -70% 0px' },
    )

    items.forEach(({ id }) => {
      const element = document.getElementById(id)
      if (element) observer.observe(element)
    })

    return () => observer.disconnect()
  }, [items])

  if (items.length === 0) return null

  const activeLabel = getActiveTocLabel(items, activeId)
  const quickItems = getQuickTocItems(items)

  const links = (
    <ol className='space-y-0.5'>
      {items.map(({ id, label }) => {
        const isActive = activeId === id
        return (
          <li key={id}>
            <a
              href={`#${id}`}
              onClick={() => setMobileOpen(false)}
              aria-current={isActive ? 'location' : undefined}
              className={`flex min-h-11 items-center border-l-2 px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--hs-gold)] focus-visible:ring-offset-2 ${
                isActive
                  ? 'border-[color:var(--hs-gold)] bg-[color:color-mix(in_srgb,var(--tone)_9%,transparent)] font-semibold text-[color:var(--hs-ink)]'
                  : 'border-transparent text-[color:var(--hs-body)] hover:border-[color:var(--hs-hairline-strong)] hover:bg-[color:color-mix(in_srgb,var(--tone)_6%,transparent)] hover:text-[color:var(--hs-ink)]'
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
          aria-label='Page sections'
          className='sticky top-[4.35rem] z-40 -mx-1 overflow-hidden rounded-2xl border border-[color:var(--hs-hairline)] bg-[color:color-mix(in_srgb,var(--hs-surface)_94%,transparent)] shadow-[0_12px_30px_-24px_rgba(53,47,65,0.42)] backdrop-blur-xl lg:hidden'
          data-mobile-quick-jumps='true'
        >
          <div className='flex min-h-12 items-center gap-1.5 p-1.5'>
            <div
              className='flex min-w-0 flex-1 gap-1.5 overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'
              aria-label='Quick jumps'
            >
              {quickItems.map(({ id, label }) => {
                const isActive = activeId === id
                return (
                  <a
                    key={id}
                    href={`#${id}`}
                    aria-current={isActive ? 'location' : undefined}
                    className={`inline-flex min-h-10 shrink-0 items-center rounded-xl border px-3 text-xs font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--hs-gold)] ${
                      isActive
                        ? 'border-[color:var(--hs-gold)] bg-[color:color-mix(in_srgb,var(--hs-gold)_10%,var(--hs-surface))] text-[color:var(--tone-ink)]'
                        : 'border-[color:var(--hs-hairline)] bg-[color:var(--hs-surface)] text-[color:var(--hs-body)]'
                    }`}
                  >
                    {label}
                  </a>
                )
              })}
            </div>

            <button
              type='button'
              aria-expanded={mobileOpen}
              aria-label={`${mobileOpen ? 'Hide' : 'Show'} all page sections. Current section: ${activeLabel}`}
              onClick={() => setMobileOpen((open) => !open)}
              className='grid min-h-10 min-w-10 shrink-0 place-items-center rounded-xl border border-[color:var(--hs-hairline-strong)] bg-[color:var(--hs-surface)] text-[color:var(--hs-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[color:var(--hs-gold)]'
            >
              <svg
                aria-hidden='true'
                viewBox='0 0 16 16'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                className={`size-4 transition-transform ${mobileOpen ? 'rotate-180' : ''}`}
              >
                <path d='M4 6l4 4 4-4' strokeLinecap='round' strokeLinejoin='round' />
              </svg>
            </button>
          </div>

          {mobileOpen ? (
            <div
              className='overflow-y-auto overscroll-contain border-t border-[color:var(--hs-hairline)] px-2 py-2 pr-3 [scrollbar-width:thin]'
              style={{ maxHeight: 'min(55dvh, 28rem)' }}
            >
              <p className='px-3 pb-2 pt-1 text-[0.64rem] font-extrabold uppercase tracking-[0.16em] text-[color:var(--hs-gold-ink)]'>
                All sections
              </p>
              {links}
            </div>
          ) : null}
        </nav>
      ) : null}

      {variant !== 'mobile' ? (
        <nav
          aria-label='Page sections'
          className='hidden w-56 shrink-0 self-start lg:sticky lg:top-24 lg:block'
        >
          <div className='border-l border-[color:var(--hs-hairline-strong)] pl-3'>
            <p className='eyebrow-label mb-3 px-2'>On this page</p>
            {links}
          </div>
        </nav>
      ) : null}
    </>
  )
}
