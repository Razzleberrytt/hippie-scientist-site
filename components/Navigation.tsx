'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Leaf, Menu, X } from 'lucide-react'
import { GlobalSearchModal } from './search/GlobalSearchModal'
import DarkModeToggle from './DarkModeToggle'
import { mainNavigation } from '@/lib/navigation-config'

const primaryLinks = mainNavigation

function toCanonicalHref(href: string) {
  if (!href || href === '/' || href.includes('?') || href.includes('#')) return href
  return href.endsWith('/') ? href : `${href}/`
}

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
    if (href === '/guides') return pathname === '/guides' || pathname.startsWith('/guides/')
    if (href === '/learn') return pathname === '/learn' || pathname.startsWith('/learn/') || pathname.startsWith('/novel-psychoactive-substances')
    if (href === '/safety-checker') return pathname === '/safety-checker' || pathname.startsWith('/evidence/') || pathname.startsWith('/info/dosing') || pathname.startsWith('/info/supplement-safety-checklist')
    return pathname === href || pathname.startsWith(href + '/')
  }

  const closeMobile = () => setMobileOpen(false)

  return (
    <nav
      className={`sticky top-0 z-50 border-b border-black/5 transition-all dark:border-[var(--border-strong)] ${
        scrolled ? 'bg-white shadow-sm dark:bg-[var(--surface-card-strong)]' : 'bg-white dark:bg-[var(--surface-card)]'
      }`}
      aria-label="Primary"
    >
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between gap-2 sm:h-16">
          {/* Logo — Fraunces via font-display */}
          <Link
            href="/"
            className="flex min-w-0 items-center gap-2 font-display text-[1rem] font-bold italic tracking-[-0.02em] text-ink transition hover:text-brand-700 dark:text-[var(--text-primary)] sm:text-[1.15rem]"
            aria-label="The Hippie Scientist home"
          >
            <Leaf aria-hidden="true" className="h-5 w-5 shrink-0 text-brand-700 dark:text-[var(--accent-teal)]" strokeWidth={1.75} />
            <span className="max-w-[11.5rem] truncate sm:max-w-none">The Hippie Scientist</span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden items-center gap-6 text-sm md:flex lg:gap-7">
            {primaryLinks.map((link) => (
              <Link
                key={link.href}
                href={toCanonicalHref(link.href)}
                aria-current={isActive(link.href) ? 'page' : undefined}
                className={`font-medium transition-colors ${
                  isActive(link.href)
                    ? 'font-semibold text-brand-800 underline underline-offset-[6px] decoration-brand-700/35 decoration-2 dark:text-[var(--text-primary)] dark:decoration-[var(--accent-teal)]/40'
                    : 'text-ink/80 hover:text-ink dark:text-[var(--text-secondary)] dark:hover:text-[var(--text-primary)]'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side actions (desktop search trigger + mobile hamburger) */}
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            {/* Global search command palette (Cmd/Ctrl+K, "/" hotkey, visible trigger) */}
            <GlobalSearchModal />
            <DarkModeToggle className="hidden md:inline-flex" />

            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="inline-flex min-h-[42px] min-w-[42px] items-center justify-center rounded-full p-2 text-ink/70 transition hover:bg-brand-50 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700 focus-visible:ring-offset-2 dark:text-[var(--text-secondary)] dark:hover:bg-[var(--surface-subtle)] dark:hover:text-[var(--text-primary)] md:hidden"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav"
            >
              {mobileOpen ? <X aria-hidden="true" className="h-5 w-5" /> : <Menu aria-hidden="true" className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer / overlay */}
      {mobileOpen && (
        <div id="mobile-nav" className="md:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/35 backdrop-blur-[1px]"
            onClick={closeMobile}
            aria-hidden="true"
          />

          {/* Slide-in panel */}
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation menu"
            className="fixed inset-y-0 right-0 z-50 w-[min(22rem,calc(100vw-1rem))] overflow-y-auto rounded-l-2xl border-l border-brand-900/10 bg-white px-4 py-5 shadow-2xl dark:border-[var(--border-strong)] dark:bg-[var(--surface-card-strong)]"
            style={{ height: '100dvh' }}
          >
            <div className="mb-5 flex items-center justify-between gap-3">
              <Link href="/" onClick={closeMobile} className="flex min-w-0 items-center gap-2 font-display text-base font-semibold text-ink dark:text-[var(--text-primary)]">
                <Leaf aria-hidden="true" className="h-[1.125rem] w-[1.125rem] shrink-0 text-brand-700 dark:text-[var(--accent-teal)]" strokeWidth={1.75} />
                <span className="truncate">The Hippie Scientist</span>
              </Link>
              <button
                type="button"
                onClick={closeMobile}
                className="flex min-h-[42px] min-w-[42px] items-center justify-center rounded-full p-2 text-ink/70 hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700 focus-visible:ring-offset-2 dark:text-[var(--text-secondary)] dark:hover:bg-[var(--surface-subtle)] dark:hover:text-[var(--text-primary)]"
                aria-label="Close menu"
              >
                <X aria-hidden="true" className="h-5 w-5" />
              </button>
            </div>

            {/* Mobile search — mirrors desktop command palette */}
            <div className="mb-4">
              <GlobalSearchModal />
            </div>

            <nav className="flex flex-col gap-1.5 text-base" aria-label="Mobile primary links">
              {primaryLinks.map((link) => (
                <div key={link.href}>
                  <Link
                    href={toCanonicalHref(link.href)}
                    onClick={closeMobile}
                    aria-current={isActive(link.href) ? 'page' : undefined}
                    className={`block rounded-xl px-3.5 py-3 font-semibold transition ${
                      isActive(link.href)
                        ? 'border-l-2 border-brand-700 bg-brand-50 pl-3 text-brand-900 dark:border-[var(--accent-teal)] dark:bg-[var(--surface-subtle)] dark:text-[var(--text-primary)]'
                        : 'text-ink hover:bg-brand-50/70 dark:text-[var(--text-secondary)] dark:hover:bg-[var(--surface-subtle)] dark:hover:text-[var(--text-primary)]'
                    }`}
                  >
                    {link.label}
                  </Link>
                  {link.children && link.children.length > 0 ? (
                    <div className="ml-3 mt-1.5 border-l border-brand-900/10 pl-3 dark:border-[var(--border-soft)]">
                      {link.children.map((child) => (
                        <Link
                          key={child.href}
                          href={toCanonicalHref(child.href)}
                          onClick={closeMobile}
                          aria-current={isActive(child.href) ? 'page' : undefined}
                          className="block rounded-lg px-3 py-2.5 text-sm font-medium text-ink/75 transition hover:bg-brand-50/60 hover:text-ink dark:text-[var(--text-secondary)] dark:hover:bg-[var(--surface-subtle)] dark:hover:text-[var(--text-primary)]"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  ) : null}
                </div>
              ))}

              <div className="my-2 h-px bg-brand-900/10 dark:bg-[var(--border-soft)]" />

              <div className="flex items-center justify-between rounded-xl bg-brand-50/60 px-3.5 py-3 dark:bg-[var(--surface-subtle)]">
                <span className="text-sm font-semibold text-ink/70 dark:text-[var(--text-secondary)]">Theme</span>
                <DarkModeToggle showLabel />
              </div>
            </nav>
          </div>
        </div>
      )}
    </nav>
  )
}
