import Link from 'next/link'
import { Languages } from 'lucide-react'

import {
  DEFAULT_LOCALE,
  getCurrentLocaleAlternates,
  type SupportedLocale,
} from '@/src/lib/international-seo'

const LABELS: Record<SupportedLocale, { short: string; name: string }> = {
  'en-US': { short: 'EN', name: 'English' },
  es: { short: 'ES', name: 'Español' },
  'pt-BR': { short: 'PT', name: 'Português' },
  fr: { short: 'FR', name: 'Français' },
  de: { short: 'DE', name: 'Deutsch' },
}

function localeFromPath(path: string): SupportedLocale {
  if (path.startsWith('/es/')) return 'es'
  if (path.startsWith('/pt/')) return 'pt-BR'
  if (path.startsWith('/fr/')) return 'fr'
  if (path.startsWith('/de/')) return 'de'
  return DEFAULT_LOCALE
}

/**
 * Render only languages that have an explicit reciprocal route in the canonical
 * international SEO registry. This prevents the UI from linking to translated
 * pages that do not actually exist.
 */
export default function LanguageSwitcher({ path }: { path: string }) {
  const current = localeFromPath(path)
  const alternates = getCurrentLocaleAlternates(path).filter(
    (alternate): alternate is { locale: SupportedLocale; url: string } => alternate.locale !== 'x-default',
  )

  if (alternates.length <= 1) return null

  return (
    <nav aria-label='Language' className='mt-5 flex flex-wrap items-center gap-2'>
      <span className='mr-1 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.12em] text-[var(--text-muted)]'>
        <Languages className='h-3.5 w-3.5' aria-hidden='true' />
        Language
      </span>
      {alternates.map(({ locale, url }) => {
        const active = locale === current
        const label = LABELS[locale]
        return active ? (
          <span
            key={locale}
            aria-current='page'
            title={label.name}
            className='rounded-full border border-[var(--border-strong)] bg-[var(--surface-subtle)] px-3 py-1.5 text-xs font-bold text-[var(--text-primary)]'
          >
            {label.short}
          </span>
        ) : (
          <Link
            key={locale}
            href={new URL(url).pathname}
            hrefLang={locale}
            title={label.name}
            className='rounded-full border border-[var(--border-soft)] px-3 py-1.5 text-xs font-semibold text-[var(--text-secondary)] transition hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]'
          >
            {label.short}
          </Link>
        )
      })}
    </nav>
  )
}
