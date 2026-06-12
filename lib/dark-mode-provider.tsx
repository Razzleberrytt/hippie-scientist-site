'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

type DarkModeContextValue = {
  isDark: boolean
  toggle: () => void
}

const DarkModeContext = createContext<DarkModeContextValue>({
  isDark: false,
  toggle: () => undefined,
})

export function DarkModeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    // Initialize from localStorage or system preference
    let dark = false
    try {
      const stored = localStorage.getItem('theme')
      if (stored === 'dark') {
        dark = true
      } else if (!stored) {
        dark = window.matchMedia('(prefers-color-scheme: dark)').matches
      }
    } catch {
      // localStorage unavailable (private browsing, etc.)
    }
    setIsDark(dark)
    document.documentElement.classList.toggle('dark', dark)
  }, [])

  const toggle = () => {
    setIsDark((prev: boolean) => {
      const next = !prev
      document.documentElement.classList.toggle('dark', next)
      try {
        localStorage.setItem('theme', next ? 'dark' : 'light')
      } catch {
        // ignore
      }
      return next
    })
  }

  return (
    <DarkModeContext.Provider value={{ isDark, toggle }}>
      {children}
    </DarkModeContext.Provider>
  )
}

export function useDarkMode(): DarkModeContextValue {
  return useContext(DarkModeContext)
}
