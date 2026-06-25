'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BookOpen, Leaf, Search, Sparkles, Target } from 'lucide-react'

const navItems = [
  {
    href: '/goals',
    label: 'Goals',
    Icon: Target,
  },
  {
    href: '/herbs',
    label: 'Herbs',
    Icon: Leaf,
  },
  {
    href: '/search',
    label: 'Search',
    Icon: Search,
  },
  {
    href: '/compounds',
    label: 'Compounds',
    Icon: Sparkles,
  },
  {
    href: '/articles',
    label: 'Articles',
    Icon: BookOpen,
  },
]

export default function MobileBottomNav() {
  const pathname = usePathname() || '/'

  return (
    <nav aria-label="Primary mobile navigation" className="mobile-bottom-nav fixed inset-x-0 bottom-0 z-[90] border-t border-brand-900/15 bg-white/94 shadow-[0_-10px_28px_rgba(16,32,24,0.10)] backdrop-blur-xl supports-[backdrop-filter]:bg-white/88 dark:border-[var(--border-strong)] dark:bg-[rgba(28,52,41,0.92)] dark:shadow-[0_-10px_28px_rgba(0,0,0,0.30)] dark:supports-[backdrop-filter]:bg-[rgba(28,52,41,0.86)] md:hidden">
      <div className="mx-auto flex max-w-2xl items-stretch gap-1 px-2 pb-[calc(env(safe-area-inset-bottom)+0.45rem)] pt-1.5">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname?.startsWith(`${item.href}/`)
          const Icon = item.Icon

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={`flex min-h-[3rem] min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-xl px-0.5 py-1.5 text-center transition ${
                active
                  ? 'bg-brand-50 text-brand-900 opacity-100 shadow-sm ring-1 ring-brand-700/20 dark:bg-[rgba(255,255,255,0.08)] dark:text-[var(--text-primary)] dark:ring-white/15'
                  : 'text-[#405047] opacity-75 hover:opacity-100 hover:text-ink dark:text-[var(--text-secondary)] dark:opacity-70 dark:hover:text-[var(--text-primary)]'
              }`}
            >
              <Icon aria-hidden="true" className="h-5 w-5" strokeWidth={active ? 2.45 : 2.1} />
              <span className={`max-w-full whitespace-nowrap text-[0.66rem] leading-none ${active ? 'font-semibold' : 'font-medium'}`}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
