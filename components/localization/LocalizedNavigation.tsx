'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Languages, Leaf } from 'lucide-react'
import { Navigation } from '@/components/Navigation'
import DarkModeToggle from '@/components/DarkModeToggle'
import {
  DEFAULT_LOCALE,
  SPANISH_LOCALE,
  getLocalizedRoute,
} from '@/src/lib/international-seo'

const spanishLinks = [
  { href: '/es/hierbas/', label: 'Hierbas' },
  { href: '/es/compuestos/', label: 'Compuestos' },
  { href: '/es/objetivos/', label: 'Objetivos' },
  { href: '/es/metodologia/', label: 'Metodología' },
  { href: '/es/seguridad/', label: 'Seguridad' },
]

function isSpanishPath(pathname: string) {
  return pathname === '/es' || pathname.startsWith('/es/')
}

export default function LocalizedNavigation() {
  const pathname = usePathname() || '/'
  const spanish = isSpanishPath(pathname)

  useEffect(() => {
    document.documentElement.lang = spanish ? SPANISH_LOCALE : DEFAULT_LOCALE
    document.documentElement.dir = 'ltr'
  }, [spanish])

  if (!spanish) {
    const spanishHref = getLocalizedRoute(pathname, SPANISH_LOCALE) || '/es/'
    return (
      <>
        <Navigation />
        <div className='border-b border-[#123c2f]/10 bg-[#fffdf8]/90 dark:border-[var(--border-soft)] dark:bg-[var(--surface-card-strong)]'>
          <div className='mx-auto flex max-w-7xl justify-end px-4 py-1.5 sm:px-6 lg:px-8'>
            <Link
              href={spanishHref}
              hrefLang='es'
              className='inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold text-[#526159] transition hover:bg-[#f5efe2] hover:text-[#123c2f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b88a42]/50 dark:text-[var(--text-secondary)] dark:hover:bg-[var(--surface-subtle)] dark:hover:text-[var(--text-primary)]'
              aria-label='Ver esta sección en español'
            >
              <Languages className='h-3.5 w-3.5' aria-hidden='true' />
              Español
            </Link>
          </div>
        </div>
      </>
    )
  }

  const englishHref = getLocalizedRoute(pathname, DEFAULT_LOCALE) || '/'

  return (
    <nav
      className='sticky top-0 z-[110] border-b border-[#123c2f]/10 bg-[#fffdf8]/95 backdrop-blur-xl dark:border-[var(--border-strong)] dark:bg-[rgba(20,38,29,0.95)]'
      aria-label='Navegación principal'
    >
      <div className='mx-auto max-w-7xl px-3 sm:px-6 lg:px-8'>
        <div className='flex min-h-[4.6rem] items-center justify-between gap-3'>
          <Link
            href='/es/'
            className='flex min-w-0 items-center gap-2.5 font-display text-base font-semibold tracking-[-0.025em] text-[#123c2f] dark:text-[var(--text-primary)] sm:text-lg'
            aria-label='Inicio de The Hippie Scientist en español'
          >
            <span className='editorial-icon-disc h-9 w-9 shrink-0 border-none bg-transparent shadow-none'>
              <Leaf aria-hidden='true' className='h-6 w-6 text-[#315f50] dark:text-[var(--accent-teal)]' strokeWidth={1.7} />
            </span>
            <span className='truncate'>The Hippie Scientist</span>
          </Link>

          <div className='hidden items-center gap-5 text-sm md:flex'>
            {spanishLinks.map((link) => {
              const active = pathname === link.href.replace(/\/$/, '') || pathname.startsWith(link.href)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? 'page' : undefined}
                  className={`font-semibold transition ${
                    active
                      ? 'text-[#123c2f] dark:text-[var(--text-primary)]'
                      : 'text-[#526159] hover:text-[#123c2f] dark:text-[var(--text-secondary)] dark:hover:text-[var(--text-primary)]'
                  }`}
                >
                  {link.label}
                </Link>
              )
            })}
          </div>

          <div className='flex shrink-0 items-center gap-2'>
            <Link
              href={englishHref}
              hrefLang='en-US'
              className='inline-flex min-h-10 items-center gap-1.5 rounded-full border border-[#123c2f]/10 bg-[#fffdf8] px-3 py-2 text-xs font-bold text-[#44544d] transition hover:border-[#b88a42]/30 hover:bg-[#f5efe2] dark:border-[var(--border-soft)] dark:bg-[var(--surface-card)] dark:text-[var(--text-secondary)] dark:hover:bg-[var(--surface-subtle)]'
            >
              <Languages className='h-3.5 w-3.5' aria-hidden='true' />
              English
            </Link>
            <DarkModeToggle />
          </div>
        </div>

        <div className='-mx-1 flex gap-1 overflow-x-auto pb-2 md:hidden' aria-label='Secciones en español'>
          {spanishLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className='shrink-0 rounded-full bg-[#f5efe2]/75 px-3 py-2 text-xs font-semibold text-[#33433c] dark:bg-[var(--surface-subtle)] dark:text-[var(--text-secondary)]'
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}
