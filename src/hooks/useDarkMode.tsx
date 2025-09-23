// src/hooks/useDarkMode.tsx
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

type Theme = 'light' | 'dark' | 'system'

interface DarkModeContextType {
  theme: Theme
  isDark: boolean
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const DarkModeContext = createContext<DarkModeContextType>({} as DarkModeContextType)

export function DarkModeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    // Check localStorage first, then default to system
    const stored = localStorage.getItem('theme') as Theme
    return stored || 'system'
  })

  const [isDark, setIsDark] = useState(false)

  // Function to get system preference
  const getSystemPreference = () => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  }

  // Function to apply theme
  const applyTheme = (newTheme: Theme) => {
    const root = document.documentElement
    
    if (newTheme === 'system') {
      const systemIsDark = getSystemPreference()
      setIsDark(systemIsDark)
      root.classList.toggle('dark', systemIsDark)
    } else {
      const shouldBeDark = newTheme === 'dark'
      setIsDark(shouldBeDark)
      root.classList.toggle('dark', shouldBeDark)
    }
  }

  // Update theme
  const updateTheme = (newTheme: Theme) => {
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    applyTheme(newTheme)
  }

  // Toggle between light and dark (not system)
  const toggleTheme = () => {
    const newTheme = isDark ? 'light' : 'dark'
    updateTheme(newTheme)
  }

  // Initialize theme on mount
  useEffect(() => {
    applyTheme(theme)
  }, [])

  // Listen for system theme changes
  useEffect(() => {
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      
      const handleChange = () => {
        applyTheme('system')
      }

      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    }
  }, [theme])

  return (
    <DarkModeContext.Provider
      value={{
        theme,
        isDark,
        setTheme: updateTheme,
        toggleTheme,
      }}
    >
      {children}
    </DarkModeContext.Provider>
  )
}

export function useDarkMode() {
  const context = useContext(DarkModeContext)
  if (context === undefined) {
    throw new Error('useDarkMode must be used within a DarkModeProvider')
  }
  return context
}