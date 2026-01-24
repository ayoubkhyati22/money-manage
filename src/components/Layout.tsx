import { ReactNode, useState, useEffect, useRef } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useDarkMode } from '../hooks/useDarkMode'

import {
  LayoutDashboard,
  Target,
  Building2,
  ArrowDownCircle,
  History,
  LogOut,
  Moon,
  Sun,
  Menu,
  X,
  ChevronLeft,
  User,
  Settings,
  Bell,
  Search,
  Wallet,
  ArrowRight,
  Zap,
  Text
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface LayoutProps {
  children: ReactNode
}

type ActiveTab = 'overview' | 'goals' | 'banks' | 'transactions' | 'history'

const navigationItems = [
  { id: 'overview' as const, label: 'Overview', icon: LayoutDashboard },
  { id: 'goals' as const, label: 'Goals', icon: Target },
  { id: 'banks' as const, label: 'Banks', icon: Building2 },
  { id: 'transactions' as const, label: 'Withdraw', icon: ArrowDownCircle },
  { id: 'history' as const, label: 'History', icon: History },
]

export function Layout({ children }: LayoutProps) {
  const { user, signOut } = useAuth()
  const { isDarkMode, toggleDarkMode } = useDarkMode()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview')
  const sidebarRef = useRef<HTMLDivElement>(null)

  // Dispatch tab change event
  const handleTabChange = (tabId: ActiveTab) => {
    setActiveTab(tabId)
    window.dispatchEvent(new CustomEvent('tabChange', { detail: tabId }))
    setMobileMenuOpen(false)
  }

  // Close mobile menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setMobileMenuOpen(false)
      }
    }
    if (mobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [mobileMenuOpen])

  // Listen for external tab change requests
  useEffect(() => {
    const handleNavigateToDCA = () => handleTabChange('overview')
    const handleNavigateToSTOCKS = () => handleTabChange('overview')

    window.addEventListener('navigateToDCA', handleNavigateToDCA)
    window.addEventListener('navigateToSTOCKS', handleNavigateToSTOCKS)
    return () => {
      window.removeEventListener('navigateToDCA', handleNavigateToDCA)
      window.removeEventListener('navigateToSTOCKS', handleNavigateToSTOCKS)
    }
  }, [])

  const userInitials = user?.email?.split('@')[0]?.slice(0, 2)?.toUpperCase() || 'U'
  const userName = user?.email?.split('@')[0] || 'User'

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-900">
      {/* Desktop Sidebar */}
      <aside
        ref={sidebarRef}
        className={`fixed left-0 top-0 h-full z-40 hidden lg:flex flex-col transition-all duration-300 ease-out
          ${sidebarCollapsed ? 'w-20' : 'w-72'}
          bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 shadow-sidebar dark:shadow-sidebar-dark`}
      >
        {/* Logo Area */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-700">
          <motion.div
            className="flex items-center gap-3"
            initial={false}
            animate={{ opacity: sidebarCollapsed ? 0 : 1 }}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            {!sidebarCollapsed && (
              <span className="font-display font-bold text-lg text-slate-800 dark:text-white">
                FinanceFlow
              </span>
            )}
          </motion.div>
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <ChevronLeft className={`w-5 h-5 text-slate-500 transition-transform duration-300 ${sidebarCollapsed ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navigationItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            return (
              <motion.button
                key={item.id}
                onClick={() => handleTabChange(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative
                  ${isActive
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute left-0 w-1 h-8 bg-primary-500 rounded-r-full"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-primary-500' : ''}`} />
                {!sidebarCollapsed && (
                  <span className="font-medium truncate">{item.label}</span>
                )}
                {sidebarCollapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-slate-900 dark:bg-slate-700 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                    {item.label}
                  </div>
                )}
              </motion.button>
            )
          })}
        </nav>

        {/* User Section */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
  
  {/* --- NOVANTEK POWERED BANNER --- */}
  <motion.a
    href="https://www.novaytek.com/"
    target="_blank"
    rel="noopener noreferrer"
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    className={`group relative overflow-hidden flex items-center bg-gradient-to-br from-[#1a1a2e] to-[#16213e] dark:from-indigo-950 dark:to-slate-950 rounded-2xl p-3 shadow-lg shadow-indigo-500/10 transition-all ${
      sidebarCollapsed ? 'justify-center h-12' : 'justify-between min-h-[64px]'
    }`}
  >
    {/* Decorative Glowing Pulse */}
    <div className="absolute top-0 right-0 w-24 h-24 bg-primary-500/10 blur-[40px] -mr-10 -mt-10 group-hover:bg-primary-500/20 transition-all duration-500" />
    
    <div className="flex items-center gap-3">
      {/* Tiny icon-only version for Collapsed state */}
      <div className="flex-shrink-0 w-6 flex items-center justify-center">
        <Zap className="w-4 h-4 text-primary-400 group-hover:animate-pulse" />
      </div>

      {!sidebarCollapsed && (
        <div className="flex flex-col">
          <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-slate-500 leading-tight">
            Powered By
          </span>
          <span>NOVAYTEK</span>
         
        </div>
      )}
    </div>

    {!sidebarCollapsed && (
      <div className="bg-white/10 p-1.5 rounded-lg backdrop-blur-md border border-white/5 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
        <ArrowRight size={14} className="text-white" />
      </div>
    )}
  </motion.a>

  {/* Theme Toggle */}
  <button
    onClick={toggleDarkMode}
    className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
  >
    {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    {!sidebarCollapsed && (
      <span className="font-medium text-sm">{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
    )}
  </button>

  {/* User Info Container */}
  <div className={`flex items-center gap-3 px-3 py-3 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40 backdrop-blur-sm ${sidebarCollapsed ? 'justify-center' : ''}`}>
    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-indigo-500/20 flex-shrink-0">
      {userInitials}
    </div>
    {!sidebarCollapsed && (
      <div className="flex-1 min-w-0">
        <p className="font-bold text-slate-800 dark:text-slate-100 text-sm truncate leading-tight">
          {userName}
        </p>
        <p className="text-[11px] text-slate-500 dark:text-slate-500 truncate mt-0.5">
          {user?.email}
        </p>
      </div>
    )}
  </div>

  {/* Sign Out */}
  <button
    onClick={signOut}
    className="w-full group flex items-center gap-3 px-3 py-3 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-600 dark:hover:text-red-400 transition-all"
  >
    <div className="p-1 rounded-lg group-hover:bg-red-100 dark:group-hover:bg-red-900/30 transition-colors">
        <LogOut className="w-4 h-4" />
    </div>
    {!sidebarCollapsed && <span className="font-semibold text-sm">Sign Out</span>}
  </button>
</div>
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-700 z-40 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg">
            <Wallet className="w-4 h-4 text-white" />
          </div>
          <span className="font-display font-bold text-slate-800 dark:text-white">FinanceFlow</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            {isDarkMode ? <Sun className="w-5 h-5 text-slate-600 dark:text-slate-300" /> : <Moon className="w-5 h-5 text-slate-600" />}
          </button>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center text-white font-semibold text-xs">
            {userInitials}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className={`min-h-screen transition-all duration-300 ${sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-72'} pt-16 lg:pt-0 pb-24 lg:pb-0`}>
        {/* Desktop Top Bar */}
        <div className="hidden lg:flex h-16 items-center justify-between px-6 border-b border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-display font-semibold text-slate-800 dark:text-white capitalize">
              {activeTab === 'overview' ? 'Dashboard' : activeTab}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 w-64 bg-slate-100 dark:bg-slate-700 border-none rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50"
              />
            </div>

            {/* Notifications */}
            <button className="relative p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
              <Bell className="w-5 h-5 text-slate-600 dark:text-slate-300" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-danger-500 rounded-full"></span>
            </button>

            {/* Settings */}
            <button className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
              <Settings className="w-5 h-5 text-slate-600 dark:text-slate-300" />
            </button>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-4 lg:p-6">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50">
        <div className="mx-4 mb-4">
          <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-700/50 px-2 py-2">
            <div className="flex justify-around items-center">
              {navigationItems.map((item) => {
                const Icon = item.icon
                const isActive = activeTab === item.id
                return (
                  <motion.button
                    key={item.id}
                    onClick={() => handleTabChange(item.id)}
                    className={`relative flex flex-col items-center gap-1 py-2 px-3 rounded-xl transition-all ${
                      isActive
                        ? 'text-primary-600 dark:text-primary-400'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}
                    whileTap={{ scale: 0.95 }}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="mobileActiveTab"
                        className="absolute inset-0 bg-primary-100 dark:bg-primary-900/30 rounded-xl"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                    <Icon className={`w-5 h-5 relative z-10 ${isActive ? 'text-primary-500' : ''}`} />
                    <span className={`text-[10px] font-medium relative z-10 ${isActive ? 'text-primary-600 dark:text-primary-400' : ''}`}>
                      {item.label}
                    </span>
                  </motion.button>
                )
              })}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="lg:hidden fixed left-0 top-0 h-full w-72 bg-white dark:bg-slate-800 shadow-xl z-50"
            >
              {/* Mobile sidebar content */}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
