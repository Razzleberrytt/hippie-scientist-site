'use client'

import { Moon, Sun } from 'lucide-react'
import { useDarkMode } from '@/lib/dark-mode-provider'

type Props = {
  showLabel?: boolean
  className?: string
  locale?: 'en-US' | 'es'
}

export default function DarkModeToggle({ showLabel = false, className = '', locale = 'en-US' }: Props) {
  const { isDark, themePreference, toggle } = useDarkMode()
  const spanish = locale === 'es'
  const label = isDark
    ? (spanish ? 'Cambiar al modo claro' : 'Switch to light mode')
    : (spanish ? 'Cambiar al modo oscuro' : 'Switch to dark mode')
  const systemSuffix = themePreference === 'system'
    ? (spanish ? ' (siguiendo el sistema)' : ' (currently following system)')
    : ''

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={isDark}
      aria-label={label}
      title={`${label}${systemSuffix}`}
      className={`inline-flex min-h-11 min-w-11 items-center justify-center gap-1.5 rounded-full border border-brand-900/10 bg-[var(--surface-card)] px-2.5 text-sm font-semibold text-muted shadow-sm transition hover:border-brand-700/20 hover:bg-[var(--surface-subtle)] hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-700/40 focus-visible:ring-offset-1 dark:focus-visible:ring-offset-[var(--bg)] ${className}`}
    >
      {isDark ? <Sun aria-hidden="true" className="h-4 w-4" strokeWidth={2} /> : <Moon aria-hidden="true" className="h-4 w-4" strokeWidth={2} />}
      {showLabel && <span className="text-xs">{isDark ? (spanish ? 'Claro' : 'Light') : (spanish ? 'Oscuro' : 'Dark')}</span>}
    </button>
  )
}
