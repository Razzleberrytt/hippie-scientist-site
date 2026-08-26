import Link from 'next/link'
import { Languages } from 'lucide-react'

import {
  LOCALE_CONFIG,
  getCurrentLocaleAlternates,
  getLocaleFromPathname,
  type SupportedLocale,
} from '@/src/lib/international-seo'
import { LOCALIZED_CHROME } from '@/src/lib/localized-chrome'

/**
 * Render only languages that have an explicit reciprocal route in the canonical
 * international SEO registry. Locale labels and path detection come from the
 * same registry so adding a language cannot silently drift across UI surfaces.
 */
export default function LanguageSwitcher({ path }: { path: string }) {
  const current = getLocaleFromPathname(path)
  const currentChrome = LOCALIZED_CHROME[current]
  const alternates = getCurrentLocaleAlternates(path).filter(
    (alternate): alternate is { locale: SupportedLocale; url: string } => alternate.locale !== 'x-default',
  )

  if (alternates.length <= 1) return null

  return (
    <nav aria-label={currentChrome.languagesAriaLabel} className='mt-5 flex flex-wrap items-center gap-2'>
      <span className='mr-1 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.12em] text-[var(--text-muted)]'>
        <Languages className='h-3.5 w-3.5' aria-hidden='true' />
        {currentChrome.languagesAriaLabel}
      </span>
      {alternates.map(({ locale, url }) => {
        const active = locale === current
        const label = LOCALE_CONFIG[locale]
        return active ? (
          <span
            key={locale}
            aria-current='page'
            title={label.languageLabel}
            className='rounded-full border border-[var(--border-strong)] bg-[var(--surface-subtle)] px-3 py-1.5 text-xs font-bold text-[var(--text-primary)]'
          >
            {label.shortLabel}
          </span>
        ) : (
          <Link
            key={locale}
            href={new URL(url).pathname}
            hrefLang={locale}
            title={label.languageLabel}
            className='rounded-full border border-[var(--border-soft)] px-3 py-1.5 text-xs font-semibold text-[var(--text-secondary)] transition hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]'
          >
            {label.shortLabel}
          </Link>
        )
      })}
    </nav>
  )
}
