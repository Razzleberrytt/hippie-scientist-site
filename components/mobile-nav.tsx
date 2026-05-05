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
        className='rounded-full border border-neutral-200 px-4 py-2 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-100'
      >
        Menu
      </button>
      {open && (
        <nav
          aria-label='Mobile'
          className='absolute right-0 top-full z-20 mt-2 w-56 rounded-2xl border border-neutral-200 bg-white p-2 shadow-lg'
        >
          {links.map(link => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className='block rounded-xl px-4 py-3 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100 hover:text-neutral-900'
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </div>
  )
}
