'use client'

import { Moon, Sun } from 'lucide-react'
import { useDarkMode } from '@/lib/dark-mode-provider'
import { DEFAULT_LOCALE, type SupportedLocale } from '@/src/lib/international-seo'
import { DARK_MODE_COPY } from '@/src/lib/localized-theme-copy'

type Props = {
  showLabel?: boolean
  className?: string
  locale?: SupportedLocale
}

export default function DarkModeToggle({ showLabel = false, className = '', locale = DEFAULT_LOCALE }: Props) {
  const { isDark, themePreference, toggle } = useDarkMode()
  const copy = DARK_MODE_COPY[locale]
  const label = isDark ? copy.toLight : copy.toDark
  const systemSuffix = themePreference === 'system' ? copy.systemSuffix : ''

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={isDark}
      aria-label={label}
      title={`${label}${systemSuffix}`}
      lang={locale}
      className={`inline-flex min-h-11 min-w-11 items-center justify-center gap-1.5 rounded-full border border-brand-900/10 bg-[var(--surface-card)] px-2.5 text-sm font-semibold text-muted shadow-sm transition hover:border-brand-700/20 hover:bg-[var(--surface-subtle)] hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-700/40 focus-visible:ring-offset-1 dark:focus-visible:ring-offset-[var(--bg)] ${className}`}
    >
      {isDark ? <Sun aria-hidden="true" className="h-4 w-4" strokeWidth={2} /> : <Moon aria-hidden="true" className="h-4 w-4" strokeWidth={2} />}
      {showLabel && <span className="text-xs">{isDark ? copy.light : copy.dark}</span>}
    </button>
  )
}
