'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

type NavLink = {
  href: string
  label: string
}

type MobileNavProps = {
  links: NavLink[]
  variant?: 'light' | 'dark'
}

export default function MobileNav({ links, variant = 'light' }: MobileNavProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const navRef = useRef<HTMLElement>(null)

  const isDark = variant === 'dark'

  useEffect(() => {
    if (!open) return

    const firstLink = navRef.current?.querySelector<HTMLAnchorElement>('a[href]')
    firstLink?.focus()

    function handlePointerDown(event: MouseEvent | TouchEvent) {
      const target = event.target

      if (target instanceof Node && !containerRef.current?.contains(target)) {
        setOpen(false)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault()
        setOpen(false)
        buttonRef.current?.focus()
        return
      }

      if (event.key !== 'Tab') return

      const focusable = containerRef.current?.querySelectorAll<HTMLElement>(
        'button, a[href]'
      )

      if (!focusable?.length) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('touchstart', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('touchstart', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  return (
    <div ref={containerRef} className='md:hidden'>
      <button
        ref={buttonRef}
        type='button'
        aria-expanded={open}
        aria-controls='mobile-navigation'
        onClick={() => setOpen(value => !value)}
        className={`rounded-full border px-4 py-2 text-sm font-black shadow-sm transition active:scale-[0.98] ${
          isDark
            ? 'border-emerald-300/15 bg-[#0b1d17]/90 text-zinc-100 hover:border-emerald-300/30 hover:bg-emerald-400/10'
            : 'border-slate-200 bg-white text-slate-900 hover:border-emerald-300 hover:bg-emerald-50'
        }`}
      >
        Menu
      </button>

      {open ? (
        <nav
          ref={navRef}
          id='mobile-navigation'
          aria-label='Mobile navigation'
          className={`absolute left-4 right-4 top-20 z-50 rounded-3xl p-2 shadow-2xl backdrop-blur ${
            isDark
              ? 'border border-emerald-300/10 bg-[#04120e]/95 shadow-black/40'
              : 'border border-slate-200 bg-white shadow-slate-900/15'
          }`}
        >
          <div className='grid gap-1'>
            {links.map(link => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`rounded-2xl px-4 py-3 text-base font-black transition ${
                  isDark
                    ? 'text-zinc-100 hover:bg-emerald-400/10 hover:text-emerald-200'
                    : 'text-slate-900 hover:bg-emerald-50 hover:text-emerald-800'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </nav>
      ) : null}
    </div>
  )
}
