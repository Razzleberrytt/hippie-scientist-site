'use client'

import Link from 'next/link'
import DesktopNav from './desktop-nav'
import MobileNav from './mobile-nav'
import '../styles/navbar.css'

const navLinks = [
  { href: '/goals', label: 'Goals' },
  { href: '/start-here/quiz', label: 'Quiz' },
  { href: '/safety-checker', label: 'Safety' },
  { href: '/herbs', label: 'Herbs' },
  { href: '/compounds', label: 'Compounds' },
  { href: '/compare', label: 'Compare' },
  { href: '/learn', label: 'Learn' },
  { href: '/search', label: 'Search' },
]

export default function Header() {
  return (
    <header className='sticky top-0 z-50 border-b border-brand-900/10 bg-white/[0.88] shadow-[0_1px_0_rgba(17,24,39,0.02)] backdrop-blur-xl supports-[backdrop-filter]:bg-white/[0.78]'>
      <div className='container-page flex min-h-[72px] items-center justify-between gap-6 py-3'>
        <Link
          href='/'
          aria-label='The Hippie Scientist Home'
          className='header-nav-link inline-flex items-center rounded-full px-1 py-2 text-lg font-black tracking-tight text-ink transition hover:text-emerald-700 focus:outline-none'
        >
          The Hippie Scientist
        </Link>

        {/* Desktop Nav using semantic nav with aria-label */}
        <nav aria-label='Primary desktop navigation' className='hidden md:block'>
          <DesktopNav links={navLinks} />
        </nav>

        {/* Mobile Nav using semantic nav with aria-label */}
        <nav aria-label='Primary mobile navigation' className='md:hidden'>
          <MobileNav links={navLinks} />
        </nav>
      </div>
    </header>
  )
}
