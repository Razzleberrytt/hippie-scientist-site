'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import DesktopNav from '@/components/desktop-nav'
import MobileNav from '@/components/mobile-nav'

type NavLink = {
  href: string
  label: string
}

type SiteHeaderProps = {
  links: NavLink[]
}

export default function SiteHeader({ links }: SiteHeaderProps) {
  const pathname = usePathname()
  const isHome = pathname === '/'

  return (
    <header
      className={isHome
        ? 'sticky top-0 z-50 border-b border-emerald-300/10 bg-[#04120e]/80 text-zinc-100 backdrop-blur-xl'
        : 'sticky top-0 z-50 border-b border-brand-900/10 bg-white/[0.88] text-ink shadow-[0_1px_0_rgba(17,24,39,0.02)] backdrop-blur-xl supports-[backdrop-filter]:bg-white/[0.78]'}
    >
      <div className='container-page flex min-h-[72px] items-center justify-between gap-6 py-3'>
        <Link
          href='/'
          className={isHome
            ? 'inline-flex items-center rounded-full px-1 py-2 text-lg font-black tracking-tight text-zinc-100 transition hover:text-emerald-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#04120e]'
            : 'inline-flex items-center rounded-full px-1 py-2 text-lg font-black tracking-tight text-ink transition hover:text-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white'}
        >
          The Hippie Scientist
        </Link>

        <DesktopNav links={links} variant={isHome ? 'dark' : 'light'} />

        <MobileNav links={links} variant={isHome ? 'dark' : 'light'} />
      </div>
    </header>
  )
}
