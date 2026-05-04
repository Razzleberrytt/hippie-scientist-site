'use client'

import Link from 'next/link'
import { useState } from 'react'

type NavLink = {
  href: string
  label: string
}

type MobileNavProps = {
  links: NavLink[]
}

export default function MobileNav({ links }: MobileNavProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className='md:hidden'>
      <button
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
