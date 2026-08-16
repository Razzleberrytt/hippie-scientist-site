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
          className='rounded-xl border border-[color:var(--hs-hairline-strong)] bg-[color:var(--hs-surface)] p-2 shadow-[var(--hs-lift)] lg:hidden'
        >
          <button
            type='button'
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((open) => !open)}
            className='flex min-h-12 w-full items-center justify-between px-3 py-2 text-left text-sm font-semibold text-[color:var(--hs-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--hs-gold)] focus-visible:ring-offset-2'
          >
            On this page
            <svg
              aria-hidden='true'
              viewBox='0 0 16 16'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
              className={`size-4 shrink-0 text-[color:var(--hs-body)] transition-transform ${mobileOpen ? 'rotate-180' : ''}`}
            >
              <path d='M4 6l4 4 4-4' strokeLinecap='round' strokeLinejoin='round' />
            </svg>
          </button>
          {mobileOpen ? (
            <div
              className='mt-2 overflow-y-auto overscroll-contain border-t border-[color:var(--hs-hairline)] pt-2 pr-1 [scrollbar-width:thin]'
              style={{ maxHeight: 'min(55dvh, 28rem)' }}
            >
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
