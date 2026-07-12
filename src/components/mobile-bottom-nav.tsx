'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BookOpenCheck, Leaf, Search, Sparkles, Library } from 'lucide-react'

export const mobileBottomNavItems = [
  { href: '/guides', label: 'Guides', Icon: Library },
  { href: '/herbs', label: 'Herbs', Icon: Leaf },
  { href: '/search', label: 'Search', Icon: Search },
  { href: '/compounds', label: 'Compounds', Icon: Sparkles },
  { href: '/guides/best', label: 'Best', Icon: BookOpenCheck },
]

function toCanonicalHref(href: string) {
  if (!href || href === '/' || href.includes('?') || href.includes('#')) return href
  return href.endsWith('/') ? href : `${href}/`
}

export default function MobileBottomNav() {
  const pathname = usePathname() || '/'

  return (
    <nav
      aria-label='Primary mobile navigation'
      className='editorial-mobile-dock mobile-bottom-nav fixed inset-x-3 bottom-[calc(env(safe-area-inset-bottom)+0.5rem)] z-[90] mx-auto max-w-[34rem] overflow-hidden rounded-[1.25rem] md:hidden'
    >
      <div className='flex items-center gap-0.5 px-1 py-1'>
        {mobileBottomNavItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
          const isSearch = item.label === 'Search'
          const Icon = item.Icon

          return (
            <Link
              key={item.href}
              href={toCanonicalHref(item.href)}
              aria-current={active ? 'page' : undefined}
              className={`group relative flex min-h-[2.9rem] min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-0.5 text-center transition ${
                active && !isSearch
                  ? 'text-[#123c2f] dark:text-[var(--text-primary)]'
                  : 'text-[#526159] hover:text-[#123c2f] dark:text-[var(--text-secondary)] dark:hover:text-[var(--text-primary)]'
              }`}
            >
              <span
                className={`inline-flex items-center justify-center transition ${
                  isSearch
                    ? 'editorial-mobile-search h-8 w-10 rounded-full'
                    : active
                      ? 'h-7 w-9 rounded-full bg-[#dfe9dc] dark:bg-[rgba(255,255,255,0.09)]'
                      : 'h-7 w-9 rounded-full'
                }`}
              >
                <Icon aria-hidden='true' className='h-5 w-5' strokeWidth={active || isSearch ? 2.2 : 1.8} />
              </span>
              <span className={`max-w-full whitespace-nowrap text-[0.69rem] leading-none ${active ? 'font-bold' : 'font-semibold'}`}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
