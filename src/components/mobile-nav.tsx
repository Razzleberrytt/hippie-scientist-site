'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

type NavLink = {
  href: string
  label: string
}

type MobileNavProps = {
  links: NavLink[]
}

export default function MobileNav({ links }: MobileNavProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const navRef = useRef<HTMLElement>(null)

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
        className='rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-900 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-50 active:scale-[0.98]'
      >
        Menu
      </button>

      {open ? (
        <nav
          ref={navRef}
          id='mobile-navigation'
          aria-label='Mobile navigation'
          className='absolute left-4 right-4 top-20 z-50 rounded-3xl border border-slate-200 bg-white p-2 shadow-2xl shadow-slate-900/15 backdrop-blur'
        >
          <div className='grid gap-1'>
            {links.map(link => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className='rounded-2xl px-4 py-3 text-base font-black text-slate-900 transition hover:bg-emerald-50 hover:text-emerald-800'
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
