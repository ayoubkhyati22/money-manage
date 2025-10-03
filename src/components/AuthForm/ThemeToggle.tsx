import { Sun, Moon, Monitor } from 'lucide-react'

interface ThemeToggleProps {
  theme: 'light' | 'dark' | 'system'
  onToggle: () => void
}

export function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  const getThemeIcon = () => {
    switch (theme) {
      case 'light': return Sun
      case 'dark': return Moon
      case 'system': return Monitor
    }
  }

  const ThemeIcon = getThemeIcon()

  return (
    <button
      onClick={onToggle}
      className="fixed top-4 right-4 z-50 flex items-center justify-center w-12 h-12 bg-white/90 dark:bg-dark-800/90 backdrop-blur-sm border border-mint-200 dark:border-dark-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
      title={`Switch to ${theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light'} theme`}
    >
      <ThemeIcon className="w-5 h-5 text-dark-500 dark:text-dark-200" />
    </button>
  )
}
