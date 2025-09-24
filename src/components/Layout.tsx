// src/components/Layout.tsx
import { ReactNode, useState, useEffect, useRef } from 'react'
import { useAuth } from '../hooks/useAuth'
import { ThemeSelector } from './ThemeSelector'
import { LogOut, DollarSign, Menu, X, User } from 'lucide-react'

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-mint-50 via-white to-primary-50 dark:from-dark-900 dark:via-dark-800 dark:to-dark-900">
      {/* Header */}
      <header className="sticky top-0 bg-white/95 dark:bg-dark-800/95 backdrop-blur-sm shadow-lg border-b border-mint-200/50 dark:border-dark-600/50 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">

            {/* Logo */}
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="flex items-center justify-center w-10 h-10 sm:w-14 sm:h-14 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl sm:rounded-2xl shadow-lg">
                <DollarSign className="w-5 h-5 sm:w-8 sm:h-8 text-white" />
              </div>
              <div>
                <h1 className="text-sm sm:text-2xl font-semibold text-dark-500 dark:text-white">FinanceFlow</h1>
                <p className="text-xs sm:text-sm text-dark-400 dark:text-dark-300 font-medium hidden sm:block">
                  Manage your funds smartly
                </p>
              </div>
            </div>

            {/* Desktop User Info and Controls */}
            <div className="hidden lg:flex items-center space-x-6">
              {/* Theme Selector */}
              <ThemeSelector />

              <div className="text-right">
                <p className="text-sm font-medium text-dark-500 dark:text-dark-200">{user?.email}</p>
                <p className="text-xs text-dark-400 dark:text-dark-300">Welcome back!</p>
              </div>

              <button
                onClick={signOut}
                className="flex items-center space-x-2 px-4 py-3 text-sm font-medium text-dark-500 dark:text-dark-200 hover:text-white hover:bg-gradient-to-r hover:from-accent-400 hover:to-accent-500 rounded-xl transition-all duration-300 hover:shadow-lg border border-mint-200 dark:border-dark-600 hover:border-accent-400"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>

            {/* Mobile User Menu */}
            <div className="lg:hidden relative" ref={menuRef}>
              <button
                onClick={toggleMenu}
                className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-dark-500 dark:text-dark-200 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-dark-700 rounded-lg border border-mint-200 dark:border-dark-600 transition-all duration-300"
              >
                <User className="w-5 h-5" />
                <span className="truncate max-w-[120px]">{user?.email}</span>
                {isMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>

              {/* Mobile Dropdown */}
              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-dark-800 rounded-xl shadow-lg border border-mint-200 dark:border-dark-600 py-2 z-50 animate-fade-in">
                  <div className="px-4 py-2">
                    <p className="text-sm font-medium text-dark-600 dark:text-dark-200 truncate">{user?.email}</p>
                    <p className="text-xs text-dark-400 dark:text-dark-300">Welcome back!</p>
                  </div>

                  {/* Theme Selector in Mobile Dropdown */}
                  <ThemeSelector inDropdown={true} />

                  <div className="border-t border-mint-200/70 dark:border-dark-600 my-1"></div>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center space-x-2 w-full px-4 py-2 text-sm font-medium text-dark-500 dark:text-dark-200 hover:text-white hover:bg-gradient-to-r hover:from-accent-400 hover:to-accent-500 transition-colors duration-300"
                  >
                    <LogOut className="w-4 h-4" />
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
      <footer className="hidden md:block bg-white/95 dark:bg-dark-800/95 backdrop-blur-sm border-t border-mint-200/50 dark:border-dark-600/50 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-8 sm:py-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {/* Company Info */}
              <div className="md:col-span-2">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl shadow-md">
                    <DollarSign className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-dark-500 dark:text-dark-100">FinanceFlow</h3>
                </div>
                <p className="text-sm text-dark-400 dark:text-dark-300 mb-4 max-w-md">
                  Manage your funds smartly across multiple banks with intelligent goal tracking and transaction management.
                  Take control of your financial future today.
                </p>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-dark-400 dark:text-dark-300">All systems operational</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Section */}
            <div className="border-t border-mint-200/50 dark:border-dark-600/50 mt-8 pt-8">
              <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
                <div className="flex items-center space-x-4">
                  <p className="text-sm text-dark-400 dark:text-dark-300">
                    © {new Date().getFullYear()} FinanceFlow. All rights reserved.
                  </p>
                </div>

                <div className="flex items-center space-x-6">
                  {/* Version Info */}
                  <div className="hidden sm:flex items-center space-x-2">
                    <div className="w-1 h-1 bg-dark-400 dark:bg-dark-500 rounded-full"></div>
                    <span className="text-xs text-dark-400 dark:text-dark-300 font-mono">v1.0.0</span>
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