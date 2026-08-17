'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Leaf } from 'lucide-react'
import { DEFAULT_LOCALE, getLocalizedRoute } from '@/src/lib/international-seo'
import { LOCALIZED_CHROME, getLocaleFromPathname } from '@/src/lib/localized-chrome'

const footerLinkClass =
  '-mx-2 inline-flex min-h-11 items-center rounded-xl px-2 font-semibold text-[var(--text-secondary)] transition hover:bg-[var(--surface-subtle)] hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring-brand)]'

export default function LocalizedFooter() {
  const pathname = usePathname() || '/'
  const locale = getLocaleFromPathname(pathname)
  if (locale === DEFAULT_LOCALE) return null

  const config = LOCALIZED_CHROME[locale]
  const englishHref = getLocalizedRoute(pathname, DEFAULT_LOCALE) || '/'

  return (
    <footer className='border-t border-[var(--border-soft)] bg-[var(--surface-card-strong)]' lang={locale}>
      <div className='mx-auto grid max-w-7xl gap-8 px-5 py-10 sm:px-8 md:grid-cols-[1.2fr_1fr] lg:px-10'>
        <div>
          <Link href={config.homeHref} className='inline-flex min-h-11 items-center gap-2 font-display text-lg font-semibold text-[var(--text-primary)]'>
            <Leaf className='h-5 w-5 text-[var(--accent-gold)]' aria-hidden='true' />
            The Hippie Scientist
          </Link>
          <p className='mt-3 max-w-xl text-sm leading-6 text-[var(--text-secondary)]'>{config.footerDescription}</p>
        </div>
        <nav className='grid grid-cols-2 gap-x-6 text-sm' aria-label={config.footerAriaLabel}>
          {config.links.map((link) => (
            <Link key={link.href} href={link.href} className={footerLinkClass}>{link.label}</Link>
          ))}
          <Link href={englishHref} hrefLang='en-US' lang='en' className={footerLinkClass}>English</Link>
        </nav>
      </div>
      <div className='border-t border-[var(--border-soft)] px-5 py-5 text-center text-xs leading-5 text-[var(--text-muted)]'>
        {config.footerDisclaimer}
      </div>
    </footer>
  )
}
