// src/components/Layout.tsx
import { ReactNode, useState, useEffect, useRef } from 'react'
import { useAuth } from '../hooks/useAuth'
import { ThemeSelector } from './ThemeSelector'
import { LogOut, DollarSign, Menu, X, User, LineChart } from 'lucide-react'

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  const { user, signOut } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

  const handleSignOut = () => {
    setIsMenuOpen(false)
    signOut()
  }

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Navigate to DCA section
  const handleNavigateToDCA = () => {
    setIsMenuOpen(false)
    // Dispatch custom event to change active tab
    window.dispatchEvent(new CustomEvent('navigateToDCA'))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-mint-50 via-white to-primary-50 dark:from-dark-900 dark:via-dark-800 dark:to-dark-900">
      {/* Header */}
      <header className="sticky top-0 bg-white/95 dark:bg-dark-800/95 backdrop-blur-sm shadow-md border-b border-mint-200/50 dark:border-dark-600/50 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
          <div className="flex justify-between items-center h-12 sm:h-14">

            {/* Logo */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg sm:rounded-xl shadow-md">
                <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xs sm:text-lg font-semibold text-dark-500 dark:text-white">FinanceFlow</h1>
                <p className="text-[10px] sm:text-xs text-dark-400 dark:text-dark-300 font-medium hidden sm:block">
                  Manage your funds smartly
                </p>
              </div>
            </div>

            {/* Desktop User Info and Controls */}
            <div className="hidden lg:flex items-center space-x-3">
              {/* DCA Button for Desktop */}
              <button
                onClick={handleNavigateToDCA}
                className="flex items-center space-x-1.5 px-3 py-2 text-xs font-medium text-dark-500 dark:text-dark-200 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-dark-700 rounded-lg transition-all duration-300 border border-mint-200 dark:border-dark-600"
                title="DCA Investments"
              >
                <LineChart className="w-3.5 h-3.5" />
                <span>DCA</span>
              </button>

              {/* Theme Selector */}
              <ThemeSelector />

              <div className="text-right">
                <p className="text-xs font-medium text-dark-500 dark:text-dark-200">{user?.email}</p>
                <p className="text-[10px] text-dark-400 dark:text-dark-300">Welcome back!</p>
              </div>

              <button
                onClick={signOut}
                className="flex items-center space-x-1.5 px-3 py-2 text-xs font-medium text-dark-500 dark:text-dark-200 hover:text-white hover:bg-gradient-to-r hover:from-accent-400 hover:to-accent-500 rounded-lg transition-all duration-300 hover:shadow-md border border-mint-200 dark:border-dark-600 hover:border-accent-400"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>

            {/* Mobile User Menu */}
            <div className="lg:hidden relative" ref={menuRef}>
              <button
                onClick={toggleMenu}
                className="flex items-center space-x-1.5 px-2 py-1.5 text-xs font-medium text-dark-500 dark:text-dark-200 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-dark-700 rounded-lg border border-mint-200 dark:border-dark-600 transition-all duration-300"
              >
                <User className="w-4 h-4" />
                <span className="truncate max-w-[100px]">{user?.email}</span>
                {isMenuOpen ? <X className="w-3.5 h-3.5" /> : <Menu className="w-3.5 h-3.5" />}
              </button>

              {/* Mobile Dropdown */}
              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-dark-800 rounded-lg shadow-lg border border-mint-200 dark:border-dark-600 py-1.5 z-50 animate-fade-in">
                  <div className="px-3 py-1.5">
                    <p className="text-xs font-medium text-dark-600 dark:text-dark-200 truncate">{user?.email}</p>
                    <p className="text-[10px] text-dark-400 dark:text-dark-300">Welcome back!</p>
                  </div>

                  {/* DCA Navigation in Mobile Dropdown */}
                  <div className="px-3 py-1.5 border-t border-mint-200/70 dark:border-dark-600 mt-1">
                    <p className="text-[10px] font-medium text-dark-400 dark:text-dark-300 mb-1">Quick Access</p>
                  </div>
                  <button
                    onClick={handleNavigateToDCA}
                    className="flex items-center justify-between w-full px-3 py-1.5 text-xs font-medium text-dark-500 dark:text-dark-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-dark-700 transition-colors duration-300"
                  >
                    <div className="flex items-center space-x-1.5">
                      <LineChart className="w-3.5 h-3.5" />
                      <span>DCA Investments</span>
                    </div>
                  </button>

                  {/* Theme Selector in Mobile Dropdown */}
                  <ThemeSelector inDropdown={true} />

                  <div className="border-t border-mint-200/70 dark:border-dark-600 my-1"></div>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center space-x-1.5 w-full px-3 py-1.5 text-xs font-medium text-dark-500 dark:text-dark-200 hover:text-white hover:bg-gradient-to-r hover:from-accent-400 hover:to-accent-500 transition-colors duration-300"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative">
        {children}
      </main>

      {/* Footer */}
      <footer className="hidden md:block bg-white/95 dark:bg-dark-800/95 backdrop-blur-sm border-t border-mint-200/50 dark:border-dark-600/50 mt-8">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
          <div className="py-4 sm:py-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Company Info */}
              <div className="md:col-span-2">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg shadow-md">
                    <DollarSign className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-base font-semibold text-dark-500 dark:text-dark-100">FinanceFlow</h3>
                </div>
                <p className="text-xs text-dark-400 dark:text-dark-300 mb-2 max-w-md">
                  Manage your funds smartly across multiple banks with intelligent goal tracking and transaction management.
                  Take control of your financial future today.
                </p>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1.5">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-[10px] text-dark-400 dark:text-dark-300">All systems operational</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Section */}
            <div className="border-t border-mint-200/50 dark:border-dark-600/50 mt-4 pt-4">
              <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
                <div className="flex items-center space-x-3">
                  <p className="text-xs text-dark-400 dark:text-dark-300">
                    © {new Date().getFullYear()} FinanceFlow. All rights reserved.
                  </p>
                </div>

                <div className="flex items-center space-x-4">
                  {/* Version Info */}
                  <div className="hidden sm:flex items-center space-x-1.5">
                    <div className="w-1 h-1 bg-dark-400 dark:bg-dark-500 rounded-full"></div>
                    <span className="text-[10px] text-dark-400 dark:text-dark-300 font-mono">v1.0.0</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>

    </div>
  )
}