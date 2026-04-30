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
        className='rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-white/80 transition hover:border-white/30 hover:bg-white/5 hover:text-white'
      >
        Menu
      </button>

      {open ? (
        <nav
          id='mobile-navigation'
          aria-label='Mobile navigation'
          className='absolute left-4 right-4 top-20 z-50 rounded-3xl border border-white/10 bg-[#070814]/95 p-3 shadow-2xl backdrop-blur'
        >
          <div className='grid gap-1'>
            {links.map(link => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className='rounded-2xl px-4 py-3 text-sm font-medium text-white/75 transition hover:bg-white/5 hover:text-white'
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
