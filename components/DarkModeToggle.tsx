'use client'

import { Moon, Sun } from 'lucide-react'
import { useDarkMode } from '@/lib/dark-mode-provider'
import { DEFAULT_LOCALE, type SupportedLocale } from '@/src/lib/international-seo'

type DarkModeCopy = {
  toLight: string
  toDark: string
  systemSuffix: string
  light: string
  dark: string
}

const DARK_MODE_COPY: Record<SupportedLocale, DarkModeCopy> = {
  'en-US': { toLight: 'Switch to light mode', toDark: 'Switch to dark mode', systemSuffix: ' (currently following system)', light: 'Light', dark: 'Dark' },
  es: { toLight: 'Cambiar al modo claro', toDark: 'Cambiar al modo oscuro', systemSuffix: ' (siguiendo el sistema)', light: 'Claro', dark: 'Oscuro' },
  'pt-BR': { toLight: 'Mudar para o modo claro', toDark: 'Mudar para o modo escuro', systemSuffix: ' (seguindo o sistema)', light: 'Claro', dark: 'Escuro' },
  fr: { toLight: 'Passer au mode clair', toDark: 'Passer au mode sombre', systemSuffix: ' (selon le système)', light: 'Clair', dark: 'Sombre' },
  de: { toLight: 'Zum hellen Modus wechseln', toDark: 'Zum dunklen Modus wechseln', systemSuffix: ' (folgt derzeit dem System)', light: 'Hell', dark: 'Dunkel' },
  it: { toLight: 'Passa alla modalità chiara', toDark: 'Passa alla modalità scura', systemSuffix: ' (segue il sistema)', light: 'Chiaro', dark: 'Scuro' },
  nl: { toLight: 'Schakel naar lichte modus', toDark: 'Schakel naar donkere modus', systemSuffix: ' (volgt het systeem)', light: 'Licht', dark: 'Donker' },
  pl: { toLight: 'Przełącz na tryb jasny', toDark: 'Przełącz na tryb ciemny', systemSuffix: ' (zgodnie z ustawieniem systemu)', light: 'Jasny', dark: 'Ciemny' },
}

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
