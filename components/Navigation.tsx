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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && mobileOpen) setMobileOpen(false)
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
      className={`sticky top-0 z-50 border-b border-[#123c2f]/10 bg-[#fffdf8]/94 backdrop-blur-xl transition-all dark:border-[var(--border-strong)] dark:bg-[rgba(20,38,29,0.94)] ${
        scrolled ? 'shadow-[0_8px_28px_rgba(58,45,24,0.08)]' : ''
      }`}
      aria-label='Primary'
    >
      <div className='mx-auto max-w-7xl px-3 sm:px-6 lg:px-8'>
        <div className='flex h-[4.35rem] items-center justify-between gap-2 sm:h-[4.8rem] sm:gap-3'>
          <Link
            href='/'
            className='flex min-w-0 items-center gap-2 font-display text-[0.9rem] font-semibold tracking-[-0.025em] text-[#123c2f] transition hover:text-[#315f50] dark:text-[var(--text-primary)] sm:gap-2.5 sm:text-[1.28rem]'
            aria-label='The Hippie Scientist home'
          >
            <span className='editorial-icon-disc h-9 w-9 shrink-0 border-none bg-transparent shadow-none sm:h-10 sm:w-10'>
              <Leaf aria-hidden='true' className='h-6 w-6 text-[#315f50] dark:text-[var(--accent-teal)]' strokeWidth={1.7} />
            </span>
            <span className='max-w-[13rem] truncate sm:max-w-none'>The Hippie Scientist</span>
          </Link>

          <div className='hidden items-center gap-6 text-sm md:flex lg:gap-8'>
            {primaryLinks.map((link) => {
              const hasChildren = Boolean(link.children?.length)

              return (
                <div key={link.href} className='group relative'>
                  <Link
                    href={toCanonicalHref(link.href)}
                    aria-current={isActive(link.href) ? 'page' : undefined}
                    aria-haspopup={hasChildren ? 'true' : undefined}
                    className={`relative flex items-center gap-1 py-2 font-semibold transition-colors ${
                      isActive(link.href)
                        ? 'text-[#123c2f] after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:rounded-full after:bg-[#b88a42] dark:text-[var(--text-primary)]'
                        : 'text-[#44544d] hover:text-[#123c2f] dark:text-[var(--text-secondary)] dark:hover:text-[var(--text-primary)]'
                    }`}
                  >
                    <span>{link.label}</span>
                    {hasChildren ? (
                      <span aria-hidden='true' className='text-[0.65rem] leading-none text-[#8a6a38] transition-transform group-hover:rotate-180 group-focus-within:rotate-180 dark:text-[var(--accent-gold)]'>
                        ▾
                      </span>
                    ) : null}
                  </Link>

                  {hasChildren ? (
                    <div className='invisible absolute left-1/2 top-full z-50 w-72 -translate-x-1/2 pt-3 opacity-0 transition duration-150 ease-out group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100'>
                      <div className='overflow-hidden rounded-3xl border border-[#123c2f]/10 bg-[#fffdf8] p-2 shadow-[0_18px_48px_rgba(45,35,19,0.14)] ring-1 ring-white/60 dark:border-[var(--border-strong)] dark:bg-[var(--surface-card-strong)] dark:ring-white/5'>
                        {link.children?.map((child) => (
                          <Link
                            key={child.href}
                            href={toCanonicalHref(child.href)}
                            aria-current={isActive(child.href) ? 'page' : undefined}
                            className='block rounded-2xl px-4 py-3 transition hover:bg-[#f5efe2] focus-visible:bg-[#f5efe2] focus-visible:outline-none dark:hover:bg-[var(--surface-subtle)] dark:focus-visible:bg-[var(--surface-subtle)]'
                          >
                            <span className='block text-sm font-semibold text-[#123c2f] dark:text-[var(--text-primary)]'>{child.label}</span>
                            {child.description ? (
                              <span className='mt-1 block text-xs leading-snug text-[#526159] dark:text-[var(--text-secondary)]'>{child.description}</span>
                            ) : null}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              )
            })}
          </div>

          <div className='flex shrink-0 items-center gap-2'>
            <GlobalSearchModal />
            <DarkModeToggle className='hidden md:inline-flex' />
            <button
              type='button'
              onClick={() => setMobileOpen(!mobileOpen)}
              className='inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-[#123c2f]/10 bg-[#fffdf8]/85 p-2 text-[#123c2f] shadow-sm transition hover:border-[#b88a42]/30 hover:bg-[#f5efe2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b88a42]/50 focus-visible:ring-offset-2 dark:border-[var(--border-soft)] dark:bg-[var(--surface-card)] dark:text-[var(--text-primary)] md:hidden'
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
              aria-controls='mobile-nav'
            >
              {mobileOpen ? <X aria-hidden='true' className='h-5 w-5' /> : <Menu aria-hidden='true' className='h-5 w-5' />}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div id='mobile-nav' className='md:hidden'>
          <div className='fixed inset-0 z-40 bg-[#123c2f]/25 backdrop-blur-sm' onClick={closeMobile} aria-hidden='true' />
          <div
            role='dialog'
            aria-modal='true'
            aria-label='Mobile navigation menu'
            className='fixed inset-y-0 right-0 z-50 w-[min(22rem,calc(100vw-1rem))] overflow-y-auto rounded-l-[2rem] border-l border-[#123c2f]/10 bg-[#fffdf8] px-5 py-6 shadow-2xl dark:border-[var(--border-strong)] dark:bg-[var(--surface-card-strong)]'
            style={{ height: '100dvh' }}
          >
            <div className='mb-6 flex items-center justify-between gap-3'>
              <Link href='/' onClick={closeMobile} className='flex min-w-0 items-center gap-2.5 font-display text-lg font-semibold text-[#123c2f] dark:text-[var(--text-primary)]'>
                <Leaf aria-hidden='true' className='h-5 w-5 shrink-0 text-[#315f50] dark:text-[var(--accent-teal)]' strokeWidth={1.7} />
                <span className='truncate'>The Hippie Scientist</span>
              </Link>
              <button
                type='button'
                onClick={closeMobile}
                className='flex min-h-11 min-w-11 items-center justify-center rounded-full border border-[#123c2f]/10 bg-[#f5efe2]/70 p-2 text-[#123c2f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b88a42]/50 dark:border-[var(--border-soft)] dark:bg-[var(--surface-subtle)] dark:text-[var(--text-primary)]'
                aria-label='Close menu'
              >
                <X aria-hidden='true' className='h-5 w-5' />
              </button>
            </div>

            <div className='mb-5'>
              <GlobalSearchModal />
            </div>

            <nav className='flex flex-col gap-2 text-base' aria-label='Mobile primary links'>
              {primaryLinks.map((link) => (
                <div key={link.href}>
                  <Link
                    href={toCanonicalHref(link.href)}
                    onClick={closeMobile}
                    aria-current={isActive(link.href) ? 'page' : undefined}
                    className={`block rounded-2xl px-4 py-3.5 font-semibold transition ${
                      isActive(link.href)
                        ? 'border border-[#b88a42]/20 bg-[#f5efe2] text-[#123c2f] shadow-sm dark:border-[var(--border-strong)] dark:bg-[var(--surface-subtle)] dark:text-[var(--text-primary)]'
                        : 'text-[#33433c] hover:bg-[#f5efe2]/70 hover:text-[#123c2f] dark:text-[var(--text-secondary)] dark:hover:bg-[var(--surface-subtle)] dark:hover:text-[var(--text-primary)]'
                    }`}
                  >
                    {link.label}
                  </Link>
                  {link.children && link.children.length > 0 ? (
                    <div className='ml-4 mt-2 border-l border-[#123c2f]/10 pl-3 dark:border-[var(--border-soft)]'>
                      {link.children.map((child) => (
                        <Link
                          key={child.href}
                          href={toCanonicalHref(child.href)}
                          onClick={closeMobile}
                          aria-current={isActive(child.href) ? 'page' : undefined}
                          className='block rounded-xl px-3 py-2.5 text-sm font-medium text-[#526159] transition hover:bg-[#f5efe2]/65 hover:text-[#123c2f] dark:text-[var(--text-secondary)] dark:hover:bg-[var(--surface-subtle)] dark:hover:text-[var(--text-primary)]'
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  ) : null}
                </div>
              ))}

              <div className='my-2 h-px bg-[#123c2f]/10 dark:bg-[var(--border-soft)]' />
              <div className='flex items-center justify-between rounded-2xl border border-[#123c2f]/10 bg-[#f5efe2]/65 px-4 py-3 dark:border-[var(--border-soft)] dark:bg-[var(--surface-subtle)]'>
                <span className='text-sm font-semibold text-[#44544d] dark:text-[var(--text-secondary)]'>Theme</span>
                <DarkModeToggle showLabel />
              </div>
            </nav>
          </div>
        </div>
      )}
    </nav>
  )
}
