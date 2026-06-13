'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

type ThemePreference = 'light' | 'dark' | 'system'

type DarkModeContextValue = {
  isDark: boolean
  themePreference: ThemePreference
  toggle: () => void
  setThemePreference: (preference: ThemePreference) => void
}

const DarkModeContext = createContext<DarkModeContextValue>({
  isDark: false,
  themePreference: 'system',
  toggle: () => undefined,
  setThemePreference: () => undefined,
})

const THEME_STORAGE_KEY = 'theme'

function getSystemPrefersDark() {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

function getStoredPreference(): ThemePreference {
  if (typeof window === 'undefined') return 'system'
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY)
    return stored === 'light' || stored === 'dark' ? stored : 'system'
  } catch {
    return 'system'
  }
}

function resolvePreference(preference: ThemePreference) {
  return preference === 'system' ? getSystemPrefersDark() : preference === 'dark'
}

function applyTheme(isDark: boolean) {
  if (typeof document === 'undefined') return
  document.documentElement.classList.toggle('dark', isDark)
  document.documentElement.dataset.theme = isDark ? 'dark' : 'light'
}

export function DarkModeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(false)
  const [themePreference, setThemePreferenceState] = useState<ThemePreference>('system')

  useEffect(() => {
    const preference = getStoredPreference()
    const nextIsDark = resolvePreference(preference)
    setThemePreferenceState(preference)
    setIsDark(nextIsDark)
    applyTheme(nextIsDark)
  }, [])

  useEffect(() => {
    if (themePreference !== 'system') return undefined

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const syncSystemTheme = (event: MediaQueryListEvent) => {
      setIsDark(event.matches)
      applyTheme(event.matches)
    }

    mediaQuery.addEventListener('change', syncSystemTheme)
    return () => mediaQuery.removeEventListener('change', syncSystemTheme)
  }, [themePreference])

  const setThemePreference = useCallback((preference: ThemePreference) => {
    const nextIsDark = resolvePreference(preference)
    setThemePreferenceState(preference)
    setIsDark(nextIsDark)
    applyTheme(nextIsDark)

    try {
      if (preference === 'system') {
        localStorage.removeItem(THEME_STORAGE_KEY)
      } else {
        localStorage.setItem(THEME_STORAGE_KEY, preference)
      }
    } catch {
      // localStorage can be unavailable in private contexts.
    }
  }, [])

  const toggle = useCallback(() => {
    setIsDark((currentIsDark) => {
      const nextIsDark = !currentIsDark
      const nextPreference: ThemePreference = nextIsDark ? 'dark' : 'light'
      setThemePreferenceState(nextPreference)
      applyTheme(nextIsDark)
      try {
        localStorage.setItem(THEME_STORAGE_KEY, nextPreference)
      } catch {
        // localStorage can be unavailable in private contexts.
      }
      return nextIsDark
    })
  }, [])

  const value = useMemo(
    () => ({ isDark, themePreference, toggle, setThemePreference }),
    [isDark, setThemePreference, themePreference, toggle],
  )

  return (
    <DarkModeContext.Provider value={value}>
      {children}
    </DarkModeContext.Provider>
  )
}

export function useDarkMode(): DarkModeContextValue {
  return useContext(DarkModeContext)
}
