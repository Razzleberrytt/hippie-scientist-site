'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

type NavLink = {
  href: string
  label: string
}

type DesktopNavProps = {
  links: NavLink[]
  variant?: 'light' | 'dark'
}

export default function DesktopNav({ links, variant = 'light' }: DesktopNavProps) {
  const pathname = usePathname()
  const isDark = variant === 'dark'

  return (
    <nav className='hidden items-center gap-1.5 md:flex' aria-label='Primary navigation'>
      {links.map(link => {
        const active =
          pathname === link.href ||
          (link.href !== '/' && pathname?.startsWith(`${link.href}/`))

        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? 'page' : undefined}
            className={`rounded-full px-3.5 py-2 text-sm font-semibold transition duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 lg:px-4 ${
              isDark
                ? `focus-visible:ring-offset-[#04120e] ${
                    active
                      ? 'bg-emerald-300/15 text-emerald-100'
                      : 'text-zinc-200 hover:bg-emerald-400/10 hover:text-emerald-200'
                  }`
                : `focus-visible:ring-offset-white ${
                    active
                      ? 'bg-brand-900/8 text-emerald-800'
                      : 'text-[#5c6d63] hover:bg-emerald-50 hover:text-emerald-800'
                  }`
            }`}
          >
            {link.label}
          </Link>
        )
      })}
    </nav>
  )
}
