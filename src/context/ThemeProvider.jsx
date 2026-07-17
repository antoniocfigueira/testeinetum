import { useCallback, useEffect, useMemo, useState } from 'react'
import ThemeContext from './themeContext.js'

const STORAGE_KEY = 'inetum-travel-theme'
const DARK_THEME = 'dark'
const LIGHT_THEME = 'light'

function getInitialTheme() {
  const documentTheme = document.documentElement.dataset.theme

  if (documentTheme === DARK_THEME || documentTheme === LIGHT_THEME) {
    return documentTheme
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? DARK_THEME
    : LIGHT_THEME
}

function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme)

  useEffect(() => {
    const root = document.documentElement
    const themeColor = document.querySelector('meta[name="theme-color"]')

    root.dataset.theme = theme
    root.style.colorScheme = theme
    themeColor?.setAttribute(
      'content',
      theme === DARK_THEME ? '#1c1c1e' : '#f2f2f7',
    )
    try {
      localStorage.setItem(STORAGE_KEY, theme)
    } catch {
      return undefined
    }
  }, [theme])

  const toggleTheme = useCallback(() => {
    setTheme((currentTheme) =>
      currentTheme === LIGHT_THEME ? DARK_THEME : LIGHT_THEME,
    )
  }, [])

  const value = useMemo(
    () => ({
      isDark: theme === DARK_THEME,
      setTheme,
      theme,
      toggleTheme,
    }),
    [theme, toggleTheme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export default ThemeProvider
