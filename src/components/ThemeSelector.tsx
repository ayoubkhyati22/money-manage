// src/components/ThemeSelector.tsx
import { useDarkMode } from '../hooks/useDarkMode'
import { Sun, Moon, Monitor, Check } from 'lucide-react'

interface ThemeSelectorProps {
  inDropdown?: boolean
}

export function ThemeSelector({ inDropdown = false }: ThemeSelectorProps) {
  const { theme, setTheme } = useDarkMode()

  const themes = [
    { id: 'light', label: 'Light', icon: Sun },
    { id: 'dark', label: 'Dark', icon: Moon },
    { id: 'system', label: 'System', icon: Monitor },
  ] as const

  if (inDropdown) {
    return (
      <>
        <div className="px-3 py-1.5 border-t border-mint-200/70 dark:border-dark-600 mt-1">
          <p className="text-[10px] font-medium text-dark-400 dark:text-dark-300 mb-1">Theme</p>
        </div>
        {themes.map((themeOption) => {
          const Icon = themeOption.icon
          const isSelected = theme === themeOption.id
          
          return (
            <button
              key={themeOption.id}
              onClick={() => setTheme(themeOption.id)}
              className={`flex items-center justify-between w-full px-3 py-1.5 text-xs font-medium transition-colors duration-300 ${
                isSelected
                  ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30'
                  : 'text-dark-500 dark:text-dark-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-dark-700'
              }`}
            >
              <div className="flex items-center space-x-1.5">
                <Icon className="w-3.5 h-3.5" />
                <span>{themeOption.label}</span>
              </div>
              {isSelected && <Check className="w-3.5 h-3.5" />}
            </button>
          )
        })}
      </>
    )
  }

  return (
    <div className="flex items-center space-x-1 bg-white dark:bg-dark-800 border border-mint-200 dark:border-dark-600 rounded-lg p-0.5">
      {themes.map((themeOption) => {
        const Icon = themeOption.icon
        const isSelected = theme === themeOption.id
        
        return (
          <button
            key={themeOption.id}
            onClick={() => setTheme(themeOption.id)}
            className={`flex items-center space-x-1 px-2 py-1.5 rounded-md text-xs font-medium transition-all duration-300 ${
              isSelected
                ? 'bg-primary-400 text-white shadow-sm'
                : 'text-dark-500 dark:text-dark-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-dark-700'
            }`}
            title={`Switch to ${themeOption.label.toLowerCase()} theme`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{themeOption.label}</span>
          </button>
        )
      })}
    </div>
  )
}