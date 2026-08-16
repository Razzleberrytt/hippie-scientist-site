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

function isSpanishNavActive(pathname: string, href: string) {
  return pathname === href.replace(/\/$/, '') || pathname.startsWith(href)
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
        <div className='border-b border-[var(--border-soft)] bg-[var(--surface-card-strong)]/90'>
          <div className='mx-auto flex max-w-7xl justify-end px-4 sm:px-6 lg:px-8'>
            <Link
              href={spanishHref}
              hrefLang='es'
              className='inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 text-xs font-semibold text-[var(--text-secondary)] transition hover:bg-[var(--surface-subtle)] hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring-brand)]'
              aria-label='Ver esta sección en español'
            >
              <Languages className='h-3.5 w-3.5 text-[var(--accent-gold)]' aria-hidden='true' />
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
      className='sticky top-0 z-[110] border-b border-[var(--border-soft)] bg-[color:var(--surface-card-strong)]/95 backdrop-blur-xl'
      aria-label='Navegación principal'
    >
      <div className='mx-auto max-w-7xl px-3 sm:px-6 lg:px-8'>
        <div className='flex min-h-[4.6rem] items-center justify-between gap-3'>
          <Link
            href='/es/'
            className='flex min-w-0 items-center gap-2.5 font-display text-base font-semibold tracking-[-0.025em] text-[var(--text-primary)] sm:text-lg'
            aria-label='Inicio de The Hippie Scientist en español'
          >
            <span className='editorial-icon-disc h-9 w-9 shrink-0 border-none bg-transparent shadow-none'>
              <Leaf aria-hidden='true' className='h-6 w-6 text-[var(--accent-gold)]' strokeWidth={1.7} />
            </span>
            <span className='truncate'>The Hippie Scientist</span>
          </Link>

          <div className='hidden items-center gap-5 text-sm md:flex'>
            {spanishLinks.map((link) => {
              const active = isSpanishNavActive(pathname, link.href)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? 'page' : undefined}
                  className={`font-semibold transition ${active ? 'text-[var(--accent-gold)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
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
              className='inline-flex min-h-11 items-center gap-1.5 rounded-full border border-[var(--border-soft)] bg-[var(--surface-card)] px-3 py-2 text-xs font-bold text-[var(--text-secondary)] transition hover:border-[var(--border-strong)] hover:bg-[var(--surface-subtle)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring-brand)]'
            >
              <Languages className='h-3.5 w-3.5 text-[var(--accent-gold)]' aria-hidden='true' />
              English
            </Link>
            <DarkModeToggle />
          </div>
        </div>

        <div
          className='-mx-1 flex gap-1 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:hidden'
          aria-label='Secciones en español'
        >
          {spanishLinks.map((link) => {
            const active = isSpanishNavActive(pathname, link.href)
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? 'page' : undefined}
                className={`inline-flex min-h-11 shrink-0 items-center rounded-full px-3 py-2 text-xs font-semibold transition ${
                  active
                    ? 'bg-[#d0a35b] text-[#151719]'
                    : 'border border-[var(--border-soft)] bg-[var(--surface-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {link.label}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
