'use client'

import { Moon, Sun } from 'lucide-react'
import { useDarkMode } from '@/lib/dark-mode-provider'

type Props = {
  /** Show a text label alongside the icon */
  showLabel?: boolean
  /** Additional CSS classes */
  className?: string
}

export default function DarkModeToggle({ showLabel = false, className = '' }: Props) {
  const { isDark, themePreference, toggle } = useDarkMode()
  const label = isDark ? 'Switch to light mode' : 'Switch to dark mode'

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={isDark}
      aria-label={label}
      title={`${label}${themePreference === 'system' ? ' (currently following system)' : ''}`}
      className={`inline-flex min-h-11 min-w-11 items-center justify-center gap-1.5 rounded-full border border-brand-900/10 bg-white/80 px-2.5 text-sm font-semibold text-muted shadow-sm transition hover:border-brand-700/20 hover:bg-brand-50 hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-700/40 focus-visible:ring-offset-1 dark:focus-visible:ring-offset-[var(--bg)] ${className}`}
    >
      {isDark ? (
        <Sun
          aria-hidden="true"
          className="h-4 w-4"
          strokeWidth={2}
        />
      ) : (
        <Moon
          aria-hidden="true"
          className="h-4 w-4"
          strokeWidth={2}
        />
      )}
      {showLabel && (
        <span className="text-xs">{isDark ? 'Light' : 'Dark'}</span>
      )}
    </button>
  )
}
