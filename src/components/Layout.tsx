import { ReactNode, useState, useEffect, useRef } from 'react'
import { useAuth } from '../hooks/useAuth'
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
    <div className="min-h-screen bg-gradient-to-br from-mint-50 via-white to-primary-50">
      {/* Header */}
      <header className="sticky top-0 bg-white/95 backdrop-blur-sm shadow-lg border-b border-mint-200/50 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            
            {/* Logo */}
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl sm:rounded-2xl shadow-lg">
                <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-semibold text-dark-500">FinanceFlow</h1>
                <p className="text-xs sm:text-sm text-dark-400 font-medium hidden sm:block">
                  Manage your funds smartly
                </p>
              </div>
            </div>

            {/* Desktop User Info */}
            <div className="hidden lg:flex items-center space-x-6">
              <div className="text-right">
                <p className="text-sm font-medium text-dark-500">{user?.email}</p>
                <p className="text-xs text-dark-400">Welcome back!</p>
              </div>
              <button
                onClick={signOut}
                className="flex items-center space-x-2 px-4 py-3 text-sm font-medium text-dark-500 hover:text-white hover:bg-gradient-to-r hover:from-accent-400 hover:to-accent-500 rounded-xl transition-all duration-300 hover:shadow-lg border border-mint-200 hover:border-accent-400"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>

            {/* Mobile User Menu */}
            <div className="lg:hidden relative" ref={menuRef}>
              <button
                onClick={toggleMenu}
                className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-dark-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg border border-mint-200 transition-all duration-300"
              >
                <User className="w-5 h-5" />
                <span className="truncate max-w-[120px]">{user?.email}</span>
                {isMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>

              {/* Dropdown */}
              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-mint-200 py-2 z-50 animate-fade-in">
                  <div className="px-4 py-2">
                    <p className="text-sm font-medium text-dark-600 truncate">{user?.email}</p>
                    <p className="text-xs text-dark-400">Welcome back!</p>
                  </div>
                  <div className="border-t border-mint-200/70 my-1"></div>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center space-x-2 w-full px-4 py-2 text-sm font-medium text-dark-500 hover:text-white hover:bg-gradient-to-r hover:from-accent-400 hover:to-accent-500 transition-colors duration-300"
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
    </div>
  )
}
