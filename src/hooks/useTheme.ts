import { useCallback, useEffect } from 'react'
import { STORAGE_KEYS } from '../lib/constants'
import { useLocalStorage } from './useLocalStorage'

export type Theme = 'light' | 'dark'

function getSystemTheme(): Theme {
  if (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  ) {
    return 'dark'
  }

  return 'light'
}

export function useTheme() {
  const [theme, setTheme] = useLocalStorage<Theme>(
    STORAGE_KEYS.theme,
    getSystemTheme(),
  )

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', theme === 'dark')
    root.style.colorScheme = theme
  }, [theme])

  const toggleTheme = useCallback(() => {
    setTheme((current) => (current === 'dark' ? 'light' : 'dark'))
  }, [setTheme])

  return { theme, toggleTheme } as const
}
