'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Leaf, Search, Shield, Sparkles, Target } from 'lucide-react'

const navItems = [
  {
    href: '/goals',
    label: 'Goals',
    Icon: Target,
  },
  {
    href: '/safety-checker',
    label: 'Safety',
    Icon: Shield,
  },
  {
    href: '/herbs',
    label: 'Herbs',
    Icon: Leaf,
  },
  {
    href: '/compounds',
    label: 'Compounds',
    Icon: Sparkles,
  },
  {
    href: '/search',
    label: 'Search',
    Icon: Search,
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
                  ? 'border-b-2 border-brand-800 bg-brand-50 text-brand-900 opacity-100 shadow-sm dark:border-brand-700 dark:bg-[var(--surface-subtle)] dark:text-brand-800'
                  : 'text-[#405047] opacity-85 hover:bg-brand-50/60 hover:text-ink hover:opacity-100 dark:text-[var(--text-secondary)] dark:opacity-90 dark:hover:bg-[var(--surface-subtle)] dark:hover:text-[var(--text-primary)]'
              }`}
            >
              <Icon aria-hidden="true" className="h-6 w-6" strokeWidth={active ? 2.5 : 2.2} />
              <span className={`max-w-full whitespace-nowrap text-[0.76rem] leading-none ${active ? 'font-semibold' : 'font-medium'}`}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
