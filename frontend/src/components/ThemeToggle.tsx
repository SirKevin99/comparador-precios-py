import { Monitor, Moon, Sun } from 'lucide-react'

import { useTheme } from '../hooks/useTheme'

const ORDER: Array<'light' | 'dark' | 'system'> = ['light', 'dark', 'system']

function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const cycleTheme = () => {
    const currentIndex = ORDER.indexOf(theme)
    const nextTheme = ORDER[(currentIndex + 1) % ORDER.length]
    setTheme(nextTheme)
  }

  const icon =
    theme === 'light' ? (
      <Sun className="h-5 w-5 text-yellow-500" />
    ) : theme === 'dark' ? (
      <Moon className="h-5 w-5 text-blue-300" />
    ) : (
      <Monitor className="h-5 w-5 text-gray-500 dark:text-gray-300" />
    )

  return (
    <button
      type="button"
      title={`Tema: ${theme}`}
      aria-label={`Cambiar tema, actual: ${theme}`}
      onClick={cycleTheme}
      className="fixed right-4 top-4 z-50 rounded-full border border-gray-200 bg-white p-3 shadow-md transition-colors hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
    >
      {icon}
    </button>
  )
}

export default ThemeToggle
