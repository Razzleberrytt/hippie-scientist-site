'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { GlobalSearchModal } from './search/GlobalSearchModal'
import DarkModeToggle from './DarkModeToggle'

const desktopLinks = [
  { href: '/', label: 'Home' },
  { href: '/herbs', label: 'Database' },
  { href: '/compounds', label: 'Compounds' },
  { href: '/guides', label: 'Guides' },
  { href: '/evidence-digest', label: 'Digest' },
  { href: '/safety-checker', label: 'Safety' },
]

export function Navigation() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname() || '/'

  // Scroll listener for subtle backdrop blur on sticky
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Keyboard: Esc closes mobile drawer
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileOpen) {
        setMobileOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [mobileOpen])

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    if (href === '/articles') return pathname === '/articles' || pathname.startsWith('/articles/') || pathname === '/learn' || pathname.startsWith('/learn/') || pathname === '/research-notes' || pathname.startsWith('/research-notes/') || pathname === '/blog' || pathname.startsWith('/blog/')
    if (href === '/guides') return pathname === '/guides' || pathname.startsWith('/guides/')
    return pathname === href || pathname.startsWith(href + '/')
  }

  const closeMobile = () => setMobileOpen(false)

  return (
    <nav
      className={`sticky top-0 z-50 border-b border-brand-900/10 transition-all ${
        scrolled ? 'bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80' : 'bg-white'
      }`}
      aria-label="Primary"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          {/* Logo — Fraunces via font-display */}
          <Link
            href="/"
            className="font-display text-xl font-semibold tracking-[-0.01em] text-ink transition hover:text-brand-800"
            aria-label="The Hippie Scientist home"
          >
            The Hippie Scientist
          </Link>

          {/* Desktop nav links */}
          <div className="hidden items-center gap-5 text-sm md:flex lg:gap-6">
            {desktopLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`font-medium transition-colors ${
                  isActive(link.href)
                    ? 'text-brand-800'
                    : 'text-ink/80 hover:text-ink'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side actions (desktop search trigger + mobile hamburger) */}
          <div className="flex items-center gap-2">
            {/* Global search command palette (Cmd/Ctrl+K, "/" hotkey, visible trigger) */}
            <GlobalSearchModal />
            <DarkModeToggle className="hidden md:inline-flex" />

            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="inline-flex items-center justify-center rounded-md p-2 text-ink/70 transition hover:bg-brand-50 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700 md:hidden"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer / overlay */}
      {mobileOpen && (
        <div id="mobile-nav" className="md:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/30"
            onClick={closeMobile}
            aria-hidden="true"
          />

          {/* Slide-in panel */}
          <div className="fixed inset-y-0 right-0 z-50 w-72 overflow-y-auto border-l border-brand-900/10 bg-white px-4 py-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <Link href="/" onClick={closeMobile} className="font-display text-lg font-semibold text-ink">
                The Hippie Scientist
              </Link>
              <button
                type="button"
                onClick={closeMobile}
                className="rounded p-2 text-ink/70 hover:bg-brand-50"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex flex-col gap-1 text-base">
              {desktopLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closeMobile}
                  className={`rounded-lg px-3 py-2.5 font-medium transition ${
                    isActive(link.href)
                      ? 'bg-brand-50 text-brand-900'
                      : 'text-ink hover:bg-brand-50/60'
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              <div className="my-2 h-px bg-brand-900/10" />

              <div className="flex items-center justify-between rounded-lg px-3 py-2.5">
                <span className="text-sm font-medium text-ink/70">Theme</span>
                <DarkModeToggle showLabel />
              </div>
            </nav>
          </div>
        </div>
      )}
    </nav>
  )
}
