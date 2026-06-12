'use client'

import { useDarkMode } from '@/lib/dark-mode-provider'

type Props = {
  /** Show a text label alongside the icon */
  showLabel?: boolean
  /** Additional CSS classes */
  className?: string
}

export default function DarkModeToggle({ showLabel = false, className = '' }: Props) {
  const { isDark, toggle } = useDarkMode()

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={isDark}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`inline-flex min-h-9 min-w-9 items-center justify-center gap-1.5 rounded-full border border-brand-900/10 bg-white/80 px-2.5 text-sm font-semibold text-[#46574d] transition hover:border-brand-700/20 hover:bg-brand-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-700/40 focus-visible:ring-offset-1 ${className}`}
    >
      {/* Sun icon (shown in dark mode to indicate "switch to light") */}
      {isDark ? (
        <svg
          aria-hidden="true"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
        </svg>
      ) : (
        /* Moon icon (shown in light mode to indicate "switch to dark") */
        <svg
          aria-hidden="true"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
      {showLabel && (
        <span className="text-xs">{isDark ? 'Light' : 'Dark'}</span>
      )}
    </button>
  )
}
