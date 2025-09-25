// src/components/AuthForm.tsx
import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useDarkMode } from '../hooks/useDarkMode'
import { useSweetAlert } from '../hooks/useSweetAlert'
import { DollarSign, Mail, Lock, Eye, EyeOff, Sun, Moon, Monitor, X, FileText } from 'lucide-react'

export function AuthForm() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [showTermsModal, setShowTermsModal] = useState(false)
  const { signIn, signUp } = useAuth()
  const { theme, setTheme } = useDarkMode()
  const { showError, showSuccess, showInfo } = useSweetAlert()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      await showError('Missing Information', 'Please enter both email and password')
      return
    }

    if (password.length < 6) {
      await showError('Password Too Short', 'Password must be at least 6 characters long')
      return
    }

    if (!isLogin && !acceptTerms) {
      await showError('Terms Required', 'Please accept the terms and conditions to continue')
      return
    }

    setLoading(true)
    try {
      if (isLogin) {
        await signIn(email, password)
        await showSuccess('Welcome Back!', 'You have successfully logged in')
      } else {
        await signUp(email, password)
        await showInfo(
          'Account Created!',
          'Please check your email for verification link before signing in'
        )
      }
    } catch (error: any) {
      console.error('Auth error:', error)
      await showError(
        isLogin ? 'Login Failed' : 'Sign Up Failed',
        error.message || 'An unexpected error occurred'
      )
    } finally {
      setLoading(false)
    }
  }

  const getThemeIcon = () => {
    switch (theme) {
      case 'light': return Sun
      case 'dark': return Moon
      case 'system': return Monitor
    }
  }

  const cycleTheme = () => {
    const themes = ['light', 'dark', 'system'] as const
    const currentIndex = themes.indexOf(theme)
    const nextIndex = (currentIndex + 1) % themes.length
    setTheme(themes[nextIndex])
  }

  const ThemeIcon = getThemeIcon()

  // Reset acceptTerms when switching between login/signup
  const toggleAuthMode = () => {
    setIsLogin(!isLogin)
    setAcceptTerms(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-mint-50 via-white to-primary-50 dark:from-dark-900 dark:via-dark-800 dark:to-dark-900 flex items-center justify-center p-4 transition-all duration-500">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-bl from-primary-100/30 dark:from-primary-900/20 to-transparent rounded-full"></div>
        <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-accent-100/30 dark:from-accent-900/20 to-transparent rounded-full"></div>
      </div>

      {/* Theme Toggle Button - Top Right */}
      <button
        onClick={cycleTheme}
        className="fixed top-4 right-4 z-50 flex items-center justify-center w-12 h-12 bg-white/90 dark:bg-dark-800/90 backdrop-blur-sm border border-mint-200 dark:border-dark-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
        title={`Switch to ${theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light'} theme`}
      >
        <ThemeIcon className="w-5 h-5 text-dark-500 dark:text-dark-200" />
      </button>

      <div className="relative w-full max-w-md">
        <div className="bg-white/95 dark:bg-dark-800/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-mint-200/50 dark:border-dark-600/50 p-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-400 to-primary-600 rounded-3xl mx-auto mb-6 shadow-xl">
              <DollarSign className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-semibold text-dark-500 dark:text-dark-100 mb-2">FinanceFlow</h1>
            <p className="text-dark-400 dark:text-dark-300 font-medium">
              {isLogin ? 'Welcome back to your financial journey!' : 'Start your smart finance journey'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-dark-500 dark:text-dark-200 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-dark-400 dark:text-dark-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 border-2 border-mint-200 dark:border-dark-600 rounded-xl focus:ring-4 focus:ring-primary-200 dark:focus:ring-primary-800/30 focus:border-primary-400 dark:focus:border-primary-500 transition-all duration-300 bg-white/80 dark:bg-dark-700/80 backdrop-blur-sm font-medium text-dark-600 dark:text-dark-200"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-dark-500 dark:text-dark-200 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-dark-400 dark:text-dark-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-14 py-4 border-2 border-mint-200 dark:border-dark-600 rounded-xl focus:ring-4 focus:ring-primary-200 dark:focus:ring-primary-800/30 focus:border-primary-400 dark:focus:border-primary-500 transition-all duration-300 bg-white/80 dark:bg-dark-700/80 backdrop-blur-sm font-medium text-dark-600 dark:text-dark-200"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-dark-400 dark:text-dark-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-300"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Terms and Conditions Checkbox - Only show for sign up */}
            {!isLogin && (
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="flex items-center h-6">
                    <input
                      id="accept-terms"
                      type="checkbox"
                      checked={acceptTerms}
                      onChange={(e) => setAcceptTerms(e.target.checked)}
                      className="w-5 h-5 text-primary-600 bg-white dark:bg-dark-700 border-2 border-mint-200 dark:border-dark-600 rounded focus:ring-primary-500 dark:focus:ring-primary-400 focus:ring-2 transition-colors"
                      required
                    />
                  </div>
                  <div className="text-sm">
                    <label htmlFor="accept-terms" className="text-dark-500 dark:text-dark-200">
                      I accept the{' '}
                      <button
                        type="button"
                        onClick={() => setShowTermsModal(true)}
                        className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 underline font-medium transition-colors"
                      >
                        Terms and Conditions
                      </button>
                      {' '}and{' '}
                      <button
                        type="button"
                        onClick={() => setShowTermsModal(true)}
                        className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 underline font-medium transition-colors"
                      >
                        Privacy Policy
                      </button>
                    </label>
                  </div>
                </div>
                {!acceptTerms && (
                  <p className="text-xs text-amber-600 dark:text-amber-400 ml-8">
                    Please accept the terms and conditions to continue
                  </p>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || (!isLogin && !acceptTerms)}
              className="w-full bg-gradient-to-r from-primary-400 to-primary-600 hover:from-primary-500 hover:to-primary-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-4 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105 disabled:hover:scale-100"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Loading...</span>
                </div>
              ) : (
                <span className="text-lg">{isLogin ? 'Sign In' : 'Create Account'}</span>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <button
              onClick={toggleAuthMode}
              className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium transition-colors duration-300 group"
            >
              <span className="group-hover:underline decoration-2 underline-offset-4">
                {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
              </span>
            </button>
          </div>

          {/* Decorative Elements */}
          <div className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-br from-accent-400 to-accent-600 rounded-full opacity-60"></div>
          <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-gradient-to-br from-mint-400 to-mint-600 rounded-full opacity-60"></div>
        </div>
      </div>

      {/* Terms and Conditions Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-2xl max-w-lg w-full border border-mint-200 dark:border-dark-600">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-mint-200 dark:border-dark-600 bg-gradient-to-r from-primary-50 to-mint-50 dark:from-primary-900/30 dark:to-mint-900/30">
              <div className="flex items-center space-x-2">
                <div className="flex items-center justify-center w-8 h-8 bg-primary-500 rounded-lg">
                  <FileText className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-lg font-semibold text-dark-600 dark:text-dark-100">Terms & Privacy</h2>
              </div>
              <button
                onClick={() => setShowTermsModal(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-dark-500 dark:text-dark-300" />
              </button>
            </div>

            {/* Modal Content - Compact Summary */}
            <div className="p-4">
              <div className="text-center mb-4">
                <h3 className="text-base font-semibold text-dark-600 dark:text-dark-100 mb-2">FinanceFlow Service Agreement</h3>
                <p className="text-sm text-dark-500 dark:text-dark-300">Summary of key terms for your account</p>
              </div>

              <div className="space-y-3 text-sm text-dark-500 dark:text-dark-200">
                <div className="flex items-start space-x-3 p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-1.5 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium text-dark-600 dark:text-dark-100">Personal Finance Management</p>
                    <p className="text-xs">Track funds across banks, set goals, and manage transactions securely</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 bg-mint-50 dark:bg-mint-900/20 rounded-lg">
                  <div className="w-2 h-2 bg-mint-500 rounded-full mt-1.5 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium text-dark-600 dark:text-dark-100">Privacy & Security</p>
                    <p className="text-xs">Your data is encrypted and never shared without consent</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 bg-accent-50 dark:bg-accent-900/20 rounded-lg">
                  <div className="w-2 h-2 bg-accent-500 rounded-full mt-1.5 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium text-dark-600 dark:text-dark-100">Account Responsibility</p>
                    <p className="text-xs">You're responsible for account security and data accuracy</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-dark-700/50 rounded-lg">
                  <div className="w-2 h-2 bg-gray-500 rounded-full mt-1.5 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium text-dark-600 dark:text-dark-100">Service Availability</p>
                    <p className="text-xs">Service provided "as is" with standard industry protections</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                <p className="text-xs text-blue-700 dark:text-blue-300 text-center">
                  <strong>Complete terms available at:</strong> financeflow.app/terms<br/>
                  <span className="opacity-75">Last updated: {new Date().toLocaleDateString()}</span>
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between p-4 border-t border-mint-200 dark:border-dark-600 bg-gray-50 dark:bg-dark-900/30">
              <button
                onClick={() => setShowTermsModal(false)}
                className="px-3 py-1.5 text-sm text-gray-600 dark:text-dark-300 hover:text-gray-800 dark:hover:text-dark-100 font-medium transition-colors"
              >
                Cancel
              </button>
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowTermsModal(false)}
                  className="px-3 py-1.5 text-sm bg-gray-200 dark:bg-dark-700 text-gray-700 dark:text-dark-200 hover:bg-gray-300 dark:hover:bg-dark-600 rounded-lg transition-colors"
                >
                  Read Later
                </button>
                <button
                  onClick={() => {
                    setAcceptTerms(true)
                    setShowTermsModal(false)
                  }}
                  className="px-4 py-1.5 text-sm bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105"
                >
                  Accept & Continue
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}