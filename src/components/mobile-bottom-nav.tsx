'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useId, useRef, useState } from 'react'
import { BookOpenCheck, Compass, Leaf, Library, Newspaper, Search, X } from 'lucide-react'

export const mobileBottomNavItems = [
  { href: '/library', label: 'Explore', Icon: Library },
  { href: '/guides', label: 'Topics', Icon: BookOpenCheck },
  { href: '/search', label: 'Search', Icon: Search },
  { href: '/herbs', label: 'Herbs', Icon: Leaf },
  { href: '/articles', label: 'Articles', Icon: Newspaper },
]

function toCanonicalHref(href: string) {
  if (!href || href === '/' || href.includes('?') || href.includes('#')) return href
  return href.endsWith('/') ? href : `${href}/`
}

/**
 * Mobile navigation as a corner widget rather than a docked bar.
 *
 * The bar version held a strip of the viewport on every page and every scroll
 * position. This collapses to a single button in the bottom-left corner and
 * opens the same destinations on demand, so reading space stays with the page.
 */
export default function MobileBottomNav() {
  const pathname = usePathname() || '/'
  const [open, setOpen] = useState(false)
  const panelId = useId()
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const panelRef = useRef<HTMLDivElement | null>(null)

  // Close on route change so the panel never survives a navigation.
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!open) return

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.stopPropagation()
        setOpen(false)
        triggerRef.current?.focus()
      }
    }

    function onPointerDown(event: PointerEvent) {
      const target = event.target as Node
      if (panelRef.current?.contains(target) || triggerRef.current?.contains(target)) return
      setOpen(false)
    }

    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('pointerdown', onPointerDown)
    // Move focus into the panel so keyboard and screen-reader users land there.
    panelRef.current?.querySelector<HTMLAnchorElement>('a')?.focus()

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('pointerdown', onPointerDown)
    }
  }, [open])

  return (
    <div className='mobile-bottom-nav pointer-events-none fixed bottom-[calc(env(safe-area-inset-bottom)+0.75rem)] left-3 z-[90] flex flex-col items-start gap-2 md:hidden'>
      <div
        id={panelId}
        ref={panelRef}
        hidden={!open}
        className='pointer-events-auto w-[13.5rem] origin-bottom-left overflow-hidden rounded-[1.25rem] border border-[color:var(--hs-hairline-strong)] bg-[color:var(--hs-surface)] p-1.5 shadow-[var(--hs-lift-hover)] motion-safe:animate-[hs-widget-in_160ms_cubic-bezier(0.22,1,0.36,1)]'
      >
        <nav aria-label='Primary mobile navigation'>
          <ul className='flex flex-col gap-0.5'>
            {mobileBottomNavItems.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
              const Icon = item.Icon

              return (
                <li key={item.href}>
                  <Link
                    href={toCanonicalHref(item.href)}
                    aria-current={active ? 'page' : undefined}
                    onClick={() => setOpen(false)}
                    className={`flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm transition ${
                      active
                        ? 'bg-[color:color-mix(in_srgb,var(--tone)_16%,transparent)] font-bold text-[color:var(--hs-ink)]'
                        : 'font-semibold text-[color:var(--hs-body)] hover:bg-[color:color-mix(in_srgb,var(--tone)_10%,transparent)] hover:text-[color:var(--hs-ink)]'
                    }`}
                  >
                    <Icon aria-hidden='true' className='h-[1.15rem] w-[1.15rem] shrink-0' strokeWidth={active ? 2.2 : 1.8} />
                    {item.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
      </div>

      <button
        ref={triggerRef}
        type='button'
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
        className='pointer-events-auto inline-flex h-13 w-13 min-h-12 min-w-12 items-center justify-center rounded-full border border-[color:var(--hs-hairline-strong)] bg-[color:var(--hs-surface)] text-[color:var(--hs-ink)] shadow-[var(--hs-lift)] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--hs-gold)] focus-visible:ring-offset-2 motion-safe:active:scale-95'
      >
        {open ? (
          <X aria-hidden='true' className='h-5 w-5' strokeWidth={2} />
        ) : (
          <Compass aria-hidden='true' className='h-5 w-5' strokeWidth={1.9} />
        )}
      </button>
    </div>
  )
}
