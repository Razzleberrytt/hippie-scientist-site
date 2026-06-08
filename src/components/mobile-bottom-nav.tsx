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
  const pathname = usePathname()

  return (
    <nav className="fixed inset-x-0 bottom-0 z-[90] border-t border-brand-900/10 bg-white/[0.92] shadow-[0_-10px_30px_rgba(17,24,39,0.08)] backdrop-blur-xl supports-[backdrop-filter]:bg-white/80 md:hidden">
      <div className="mx-auto flex max-w-2xl items-stretch gap-1 px-2 pb-[calc(env(safe-area-inset-bottom)+0.65rem)] pt-2">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname?.startsWith(`${item.href}/`)
          const Icon = item.Icon

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={`flex min-h-[3.25rem] min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-2xl px-1.5 py-2 text-center transition-all duration-200 ${
                active
                  ? 'bg-brand-100 border-b-2 border-brand-700 text-brand-700 shadow-md font-bold'
                  : 'text-[#5c6d63] hover:bg-black/[0.03] hover:text-ink'
              }`}
            >
              <Icon aria-hidden="true" className={`h-[1.05rem] w-[1.05rem] transition-all ${active ? 'fill-current' : ''}`} strokeWidth={active ? 2.5 : 2.2} />
              <span className="max-w-full truncate text-xs font-semibold leading-none tracking-tight">
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
