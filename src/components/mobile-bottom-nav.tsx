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
    <nav className="fixed inset-x-0 bottom-0 z-[90] border-t-2 border-brand-900/15 bg-white/95 shadow-[0_-12px_32px_rgba(16,32,24,0.12)] backdrop-blur-xl supports-[backdrop-filter]:bg-white/90 dark:border-[var(--border-strong)] dark:bg-[var(--surface-card-strong)] dark:shadow-[0_-12px_32px_rgba(0,0,0,0.34)] dark:supports-[backdrop-filter]:bg-[var(--surface-card-strong)] md:hidden">
      <div className="mx-auto flex max-w-2xl items-stretch gap-1.5 px-2 pb-[calc(env(safe-area-inset-bottom)+0.7rem)] pt-2.5">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname?.startsWith(`${item.href}/`)
          const Icon = item.Icon

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={`flex min-h-[3.45rem] min-w-0 flex-1 flex-col items-center justify-center gap-1.5 rounded-2xl px-0.5 py-2 text-center ${
                active
                  ? 'bg-brand-50 text-brand-900 opacity-100 shadow-sm ring-1 ring-brand-700/20 dark:bg-[var(--surface-subtle)] dark:text-[var(--text-primary)] dark:ring-[var(--border-strong)]'
                  : 'text-[#405047] opacity-75 hover:opacity-100 hover:text-ink dark:text-[var(--text-secondary)] dark:opacity-70 dark:hover:text-[var(--text-primary)]'
              }`}
            >
              <Icon aria-hidden="true" className="h-6 w-6" strokeWidth={active ? 2.5 : 2.2} />
              <span className={`max-w-full whitespace-nowrap text-[0.72rem] leading-none ${active ? 'font-semibold' : 'font-medium'}`}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
