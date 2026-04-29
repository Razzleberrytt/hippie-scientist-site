'use client'

import { useState } from 'react'
import Link from 'next/link'

type NavLink = { href: string; label: string }

export default function MobileNav({ links }: { links: NavLink[] }) {
  const [open, setOpen] = useState(false)

  return (
    <div className='relative md:hidden'>
      <button
        onClick={() => setOpen(o => !o)}
        className='list-none rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-white/90 transition hover:border-white/30 hover:bg-white/5'
      >
        Menu
      </button>
      {open && (
        <nav
          aria-label='Mobile'
          className='absolute right-0 top-full z-20 mt-2 w-52 rounded-2xl border border-white/10 bg-[var(--surface-2)] p-2 shadow-2xl'
        >
          {links.map(link => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className='block rounded-xl px-4 py-3 text-sm font-medium text-white/80 transition hover:bg-white/5 hover:text-white'
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </div>
  )
}
