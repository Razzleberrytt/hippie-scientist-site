'use client'

import { useState, useEffect, useRef, type KeyboardEvent as ReactKeyboardEvent } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Leaf, Menu, X } from 'lucide-react'
import { GlobalSearchModal } from './search/GlobalSearchModal'
import DarkModeToggle from './DarkModeToggle'
import { primaryNavigation, type PrimaryNavigationItem } from '@/lib/primary-navigation'

const primaryLinks = primaryNavigation

function toCanonicalHref(href: string) {
  if (!href || href === '/' || href.includes('?') || href.includes('#')) return href
  return href.endsWith('/') ? href : `${href}/`
}

function groupChildren(children: PrimaryNavigationItem[] = []) {
  const groups = new Map<string, PrimaryNavigationItem[]>()

  for (const child of children) {
    const section = child.section || ''
    const existing = groups.get(section) || []
    existing.push(child)
    groups.set(section, existing)
  }

  return Array.from(groups.entries()).map(([section, items]) => ({ section, items }))
}

function normalizePath(path: string) {
  return path === '/' ? '/' : path.replace(/\/$/, '')
}

function pathMatches(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`)
}

function isCurrentPage(pathname: string, href: string) {
  return normalizePath(pathname) === normalizePath(href)
}

export function Navigation() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const mobileTriggerRef = useRef<HTMLButtonElement>(null)
  const mobileDialogRef = useRef<HTMLDivElement>(null)
  const mobileCloseRef = useRef<HTMLButtonElement>(null)
  const pathname = usePathname() || '/'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!mobileOpen) return

    const previousOverflow = document.body.style.overflow
    const mobileTrigger = mobileTriggerRef.current
    document.body.style.overflow = 'hidden'
    const focusFrame = requestAnimationFrame(() => mobileCloseRef.current?.focus())

    return () => {
      cancelAnimationFrame(focusFrame)
      document.body.style.overflow = previousOverflow
      requestAnimationFrame(() => mobileTrigger?.focus())
    }
  }, [mobileOpen])

  const isPrimaryActive = (link: PrimaryNavigationItem) => {
    const prefixes = link.activePrefixes?.length ? link.activePrefixes : [link.href]
    return prefixes.some((prefix) => pathMatches(pathname, prefix))
  }

  const closeMobile = () => setMobileOpen(false)

  const handleMobileDialogKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      closeMobile()
      return
    }

    if (event.key !== 'Tab') return

    const focusable = mobileDialogRef.current?.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
    )
    if (!focusable?.length) return

    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }

  return (
    <nav
      className={`site-primary-nav sticky top-0 z-[110] border-b border-[var(--border-soft)] bg-[color:var(--surface-elevated)]/92 backdrop-blur-xl transition-all ${
        scrolled ? 'shadow-[0_12px_32px_-28px_rgba(29,29,31,0.38)] dark:shadow-[0_14px_36px_-28px_rgba(0,0,0,0.8)]' : ''
      }`}
      aria-label='Primary'
    >
      <div className='mx-auto max-w-7xl px-3 sm:px-6 lg:px-8'>
        <div className='flex h-[4.35rem] items-center justify-between gap-2 sm:h-[4.8rem] sm:gap-3'>
          <Link
            href='/'
            prefetch={false}
            className='flex min-w-0 items-center gap-2 font-display text-[0.9rem] font-semibold tracking-[-0.025em] text-[var(--text-primary)] transition hover:text-[var(--text-primary)] sm:gap-2.5 sm:text-[1.28rem]'
            aria-label='The Hippie Scientist home'
          >
            <span className='editorial-icon-disc h-9 w-9 shrink-0 border-none bg-transparent shadow-none sm:h-10 sm:w-10'>
              <Leaf aria-hidden='true' className='h-6 w-6 text-[var(--hs-gold)]' strokeWidth={1.7} />
            </span>
            <span className='max-w-[13rem] truncate sm:max-w-none'>The Hippie Scientist</span>
          </Link>

          <div className='hidden items-center gap-5 text-sm lg:flex lg:gap-7'>
            {primaryLinks.map((link) => {
              const hasChildren = Boolean(link.children?.length)
              const childGroups = groupChildren(link.children)
              const isMegaMenu = childGroups.length > 1
              const active = isPrimaryActive(link)
              const current = isCurrentPage(pathname, link.href)
              const menuWidth = childGroups.length === 2
                ? 'w-[min(46rem,calc(100vw-2rem))]'
                : 'w-[min(58rem,calc(100vw-2rem))]'
              const menuGrid = childGroups.length === 2
                ? 'grid-cols-2'
                : 'grid-cols-3'

              return (
                <div key={link.href} className='group relative'>
                  <Link
                    href={toCanonicalHref(link.href)}
                    prefetch={false}
                    aria-current={current ? 'page' : undefined}
                    aria-haspopup={hasChildren ? 'true' : undefined}
                    className={`relative flex items-center gap-1 py-2 font-semibold transition-colors ${
                      active
                        ? 'text-[var(--text-primary)] after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:rounded-full after:bg-[var(--hs-gold)]'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    <span>{link.label}</span>
                    {hasChildren ? (
                      <span aria-hidden='true' className='text-[0.65rem] leading-none text-[var(--hs-gold)] transition-transform group-hover:rotate-180 group-focus-within:rotate-180'>
                        ▾
                      </span>
                    ) : null}
                  </Link>

                  {hasChildren ? (
                    <div
                      className={`invisible absolute left-1/2 top-full z-50 -translate-x-1/2 pt-3 opacity-0 transition duration-150 ease-out group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100 ${
                        isMegaMenu ? menuWidth : 'w-80'
                      }`}
                    >
                      <div className={`overflow-hidden rounded-3xl border border-[var(--border-soft)] bg-[var(--surface-elevated)] shadow-[0_24px_56px_-34px_rgba(29,29,31,0.34)] ring-1 ring-white/50 dark:shadow-[0_28px_64px_-34px_rgba(0,0,0,0.78)] dark:ring-white/5 ${isMegaMenu ? `grid ${menuGrid} gap-2 p-3` : 'p-2'}`}>
                        {childGroups.map(({ section, items }) => (
                          <div key={section || 'links'} className={isMegaMenu ? 'rounded-2xl bg-[var(--surface-subtle)] p-2' : ''}>
                            {section ? (
                              <p className='px-3 pb-2 pt-2 text-xs font-semibold leading-5 text-[var(--text-secondary)]'>
                                {section}
                              </p>
                            ) : null}
                            {items.map((child) => (
                              <Link
                                key={child.href}
                                href={toCanonicalHref(child.href)}
                                prefetch={false}
                                aria-current={isCurrentPage(pathname, child.href) ? 'page' : undefined}
                                className='block rounded-2xl px-3 py-2.5 transition hover:bg-[var(--surface-card)] focus-visible:bg-[var(--surface-card)] focus-visible:outline-none'
                              >
                                <span className='block text-sm font-semibold text-[var(--text-primary)]'>{child.label}</span>
                                {child.description ? (
                                  <span className='mt-1 block text-xs leading-snug text-[var(--text-secondary)]'>{child.description}</span>
                                ) : null}
                              </Link>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              )
            })}
          </div>

          <div className='flex shrink-0 items-center gap-2'>
            <GlobalSearchModal enableHotkeys={!mobileOpen} />
            <div className='hidden lg:block'>
              <DarkModeToggle />
            </div>
            <button
              ref={mobileTriggerRef}
              type='button'
              onClick={() => setMobileOpen(!mobileOpen)}
              className='inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-[var(--border-soft)] bg-[var(--surface-card)] p-2 text-[var(--text-primary)] shadow-sm transition hover:border-[color:var(--hs-gold)] hover:bg-[var(--surface-card-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring-brand)] focus-visible:ring-offset-2 lg:hidden'
              aria-label={mobileOpen ? 'Close mobile navigation menu' : 'Open mobile navigation menu'}
              aria-expanded={mobileOpen}
              aria-controls='mobile-nav'
            >
              {mobileOpen ? <X aria-hidden='true' className='h-5 w-5' /> : <Menu aria-hidden='true' className='h-5 w-5' />}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div id='mobile-nav' className='lg:hidden'>
          <div className='fixed inset-0 z-40 bg-[rgba(20,22,22,0.42)] backdrop-blur-sm' onClick={closeMobile} aria-hidden='true' />
          {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- modal dialog handles Escape and Tab focus containment */}
          <div
            ref={mobileDialogRef}
            role='dialog'
            aria-modal='true'
            aria-label='Mobile navigation menu'
            onKeyDown={handleMobileDialogKeyDown}
            className='fixed inset-y-0 right-0 z-50 w-[min(22rem,calc(100vw-1rem))] overflow-y-auto rounded-l-[2rem] border-l border-[var(--border-soft)] bg-[var(--surface-elevated)] px-5 py-6 shadow-2xl'
            style={{ height: '100dvh' }}
          >
            <div className='mb-6 flex items-center justify-between gap-3'>
              <Link href='/' prefetch={false} onClick={closeMobile} aria-label='The Hippie Scientist home' className='flex min-w-0 items-center gap-2.5 font-display text-lg font-semibold text-[var(--text-primary)]'>
                <Leaf aria-hidden='true' className='h-5 w-5 shrink-0 text-[var(--hs-gold)]' strokeWidth={1.7} />
                <span className='truncate'>The Hippie Scientist</span>
              </Link>
              <button
                ref={mobileCloseRef}
                type='button'
                onClick={closeMobile}
                className='flex min-h-11 min-w-11 items-center justify-center rounded-full border border-[var(--border-soft)] bg-[var(--surface-subtle)] p-2 text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring-brand)]'
                aria-label='Close mobile navigation menu'
              >
                <X aria-hidden='true' className='h-5 w-5' />
              </button>
            </div>

            <div className='mb-5'>
              <GlobalSearchModal />
            </div>

            <nav className='flex flex-col gap-2 text-base' aria-label='Mobile primary links'>
              {primaryLinks.map((link) => {
                const active = isPrimaryActive(link)
                const current = isCurrentPage(pathname, link.href)

                return (
                  <Link
                    key={link.href}
                    href={toCanonicalHref(link.href)}
                    prefetch={false}
                    onClick={closeMobile}
                    aria-current={current ? 'page' : undefined}
                    className={`block rounded-2xl px-4 py-3.5 font-semibold transition ${
                      active
                        ? 'border border-[var(--border-strong)] bg-[var(--surface-subtle)] text-[var(--text-primary)] shadow-sm'
                        : 'text-[var(--text-secondary)] hover:bg-[var(--surface-subtle)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    {link.label}
                  </Link>
                )
              })}

              <div className='my-2 h-px bg-[var(--border-soft)]' />
              <div className='flex items-center justify-between rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-subtle)] px-4 py-3'>
                <span className='text-sm font-semibold text-[var(--text-secondary)]'>Theme</span>
                <DarkModeToggle showLabel />
              </div>
            </nav>
          </div>
        </div>
      )}
    </nav>
  )
}
