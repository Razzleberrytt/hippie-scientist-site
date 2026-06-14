'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

type NavLink = {
  href: string
  label: string
}

type DesktopNavProps = {
  links: NavLink[]
}

export default function DesktopNav({ links }: DesktopNavProps) {
  const pathname = usePathname() || '/'

  return (
    <nav className='hidden items-center gap-1.5 md:flex' aria-label='Primary navigation'>
      {links.map(link => {
        const active =
          pathname === link.href ||
          (link.href !== '/' && pathname?.startsWith(`${link.href}/`))
        const isGoals = link.href === '/goals'

        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? 'page' : undefined}
            className={`rounded-full px-3.5 py-2 text-sm font-semibold transition duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white lg:px-4 ${
              active
                ? 'bg-brand-900/8 text-emerald-800'
                : isGoals
                  ? 'text-emerald-700 bg-emerald-50/40 border border-emerald-600/20 font-bold hover:bg-emerald-50 hover:text-emerald-800'
                  : 'text-[#5c6d63] hover:bg-emerald-50 hover:text-emerald-800'
            }`}
          >
            {link.label}
          </Link>
        )
      })}
    </nav>
  )
}
