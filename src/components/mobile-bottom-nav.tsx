'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  {
    href: '/explore',
    label: 'Explore',
    icon: '◌',
  },
  {
    href: '/herbs',
    label: 'Herbs',
    icon: '❋',
  },
  {
    href: '/compounds',
    label: 'Compounds',
    icon: '⬡',
  },
  {
    href: '/compare',
    label: 'Compare',
    icon: '⇄',
  },
  {
    href: '/learn',
    label: 'Learn',
    icon: '◫',
  },
]

export default function MobileBottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed inset-x-0 bottom-0 z-[90] border-t border-brand-900/10 bg-white/88 backdrop-blur-xl supports-[backdrop-filter]:bg-white/75 md:hidden">
      <div className="mx-auto flex max-w-2xl items-center justify-around px-2 py-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)]">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname?.startsWith(`${item.href}/`)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex min-w-[64px] flex-col items-center gap-1 rounded-2xl px-3 py-2 text-center transition-all duration-200 ${
                active
                  ? 'bg-brand-900/8 text-brand-800 shadow-sm'
                  : 'text-[#5c6d63] hover:bg-black/[0.03] hover:text-ink'
              }`}
            >
              <span className="text-base leading-none">{item.icon}</span>
              <span className="text-[11px] font-semibold tracking-tight">
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
