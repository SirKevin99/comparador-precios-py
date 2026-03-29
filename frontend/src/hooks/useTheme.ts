import { useEffect, useMemo, useState } from 'react'

import { useThemeStore } from '../store/themeStore'

type ResolvedTheme = 'light' | 'dark'

const getSystemTheme = (): ResolvedTheme => {
  if (typeof window === 'undefined') {
    return 'light'
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export const useTheme = () => {
  const { theme, setTheme } = useThemeStore()
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(getSystemTheme)

  const isDark = useMemo(() => {
    if (theme === 'system') {
      return systemTheme === 'dark'
    }
    return theme === 'dark'
  }, [theme, systemTheme])

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleSystemThemeChange = (event: MediaQueryListEvent) => {
      setSystemTheme(event.matches ? 'dark' : 'light')
    }

    setSystemTheme(mediaQuery.matches ? 'dark' : 'light')
    mediaQuery.addEventListener('change', handleSystemThemeChange)
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange)
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
  }, [isDark])

  return { isDark, theme, setTheme }
}
