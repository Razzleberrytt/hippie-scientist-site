import React, { createContext, useState, useEffect, useCallback } from 'react'

/* eslint-disable react-refresh/only-export-components */

type Theme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

export const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  setTheme: () => {},
  toggleTheme: () => {},
})

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    const stored = localStorage.getItem('theme')
    if (stored === 'dark' || stored === 'light') {
      return stored
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })

  // Function to apply theme class
  const applyTheme = useCallback((theme: Theme) => {
    document.documentElement.classList.remove('light', 'dark')
    document.body.classList.remove('light', 'dark')
    document.documentElement.classList.add(theme)
    document.body.classList.add(theme)
  }, [])

  // Update DOM and localStorage on theme change
  const setTheme = useCallback(
    (newTheme: Theme | ((prev: Theme) => Theme)) => {
      setThemeState(prev => {
        const value =
          typeof newTheme === 'function' ? (newTheme as (p: Theme) => Theme)(prev) : newTheme
        localStorage.setItem('theme', value)
        applyTheme(value)
        return value
      })
    },
    [applyTheme]
  )

  // Toggle function
  const toggleTheme = useCallback(() => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'))
  }, [setTheme])

  // Read theme from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('theme')
    if (stored === 'dark' || stored === 'light') {
      setThemeState(stored)
      applyTheme(stored)
    }
  }, [applyTheme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
