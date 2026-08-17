'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Languages, Leaf } from 'lucide-react'
import { Navigation } from '@/components/Navigation'
import DarkModeToggle from '@/components/DarkModeToggle'
import {
  DEFAULT_LOCALE,
  LOCALE_CONFIG,
  SUPPORTED_LOCALES,
  getLocalizedRoute,
  type SupportedLocale,
} from '@/src/lib/international-seo'
import { LOCALIZED_CHROME, getLocaleFromPathname } from '@/src/lib/localized-chrome'

function isNavActive(pathname: string, href: string) {
  return pathname === href.replace(/\/$/, '') || pathname.startsWith(href)
}

function LanguageLinks({ pathname, currentLocale, compact = false }: { pathname: string; currentLocale: SupportedLocale; compact?: boolean }) {
  const currentConfig = LOCALIZED_CHROME[currentLocale]
  const links = SUPPORTED_LOCALES.flatMap((locale) => {
    if (locale === currentLocale) return []
    const href = getLocalizedRoute(pathname, locale)
    if (!href) return []
    return [{ locale, href, label: LOCALIZED_CHROME[locale].languageLabel }]
  })

  if (!links.length) return null

  return (
    <div className={`flex items-center ${compact ? 'gap-1' : 'gap-1.5'} overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden`} aria-label={currentConfig.languagesAriaLabel}>
      <Languages className='h-3.5 w-3.5 shrink-0 text-[var(--accent-gold)]' aria-hidden='true' />
      {links.map((link) => (
        <Link
          key={link.locale}
          href={link.href}
          hrefLang={link.locale}
          className='inline-flex min-h-11 shrink-0 items-center rounded-full px-2.5 py-2 text-xs font-semibold text-[var(--text-secondary)] transition hover:bg-[var(--surface-subtle)] hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring-brand)]'
          aria-label={`${link.label}: ${currentConfig.equivalentPageLabel}`}
        >
          <span lang={link.locale}>{link.label}</span>
        </Link>
      ))}
    </div>
  )
}

export default function LocalizedNavigation() {
  const pathname = usePathname() || '/'
  const locale = getLocaleFromPathname(pathname)
  const config = LOCALIZED_CHROME[locale]
  const localeMeta = LOCALE_CONFIG[locale]

  useEffect(() => {
    document.documentElement.lang = locale
    document.documentElement.dir = localeMeta.textDirection
    document.documentElement.dataset.locale = locale
  }, [locale, localeMeta.textDirection])

  if (locale === DEFAULT_LOCALE) {
    return (
      <>
        <Navigation />
        <div className='border-b border-[var(--border-soft)] bg-[var(--surface-card-strong)]/90'>
          <div className='mx-auto flex max-w-7xl justify-end px-4 sm:px-6 lg:px-8'>
            <LanguageLinks pathname={pathname} currentLocale={locale} />
          </div>
        </div>
      </>
    )
  }

  return (
    <nav
      className='sticky top-0 z-[110] border-b border-[var(--border-soft)] bg-[color:var(--surface-card-strong)]/95 backdrop-blur-xl'
      aria-label={config.navAriaLabel}
      lang={locale}
    >
      <div className='mx-auto max-w-7xl px-3 sm:px-6 lg:px-8'>
        <div className='flex min-h-[4.6rem] items-center justify-between gap-3'>
          <Link
            href={config.homeHref}
            className='flex min-w-0 items-center gap-2.5 font-display text-base font-semibold tracking-[-0.025em] text-[var(--text-primary)] sm:text-lg'
            aria-label={`The Hippie Scientist — ${config.languageLabel}`}
          >
            <span className='editorial-icon-disc h-9 w-9 shrink-0 border-none bg-transparent shadow-none'>
              <Leaf aria-hidden='true' className='h-6 w-6 text-[var(--accent-gold)]' strokeWidth={1.7} />
            </span>
            <span className='truncate'>The Hippie Scientist</span>
          </Link>

          <div className='hidden items-center gap-5 text-sm lg:flex'>
            {config.links.map((link) => {
              const active = isNavActive(pathname, link.href)
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
            <div className='hidden sm:block'>
              <LanguageLinks pathname={pathname} currentLocale={locale} compact />
            </div>
            <DarkModeToggle locale={locale} />
          </div>
        </div>

        <div className='-mx-1 flex items-center gap-1 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:hidden' aria-label={config.sectionsAriaLabel}>
          {config.links.map((link) => {
            const active = isNavActive(pathname, link.href)
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? 'page' : undefined}
                className={`inline-flex min-h-11 shrink-0 items-center rounded-full px-3 py-2 text-xs font-semibold transition ${active ? 'bg-[#d0a35b] text-[#151719]' : 'border border-[var(--border-soft)] bg-[var(--surface-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
              >
                {link.label}
              </Link>
            )
          })}
          <div className='sm:hidden'>
            <LanguageLinks pathname={pathname} currentLocale={locale} compact />
          </div>
        </div>
      </div>
    </nav>
  )
}
