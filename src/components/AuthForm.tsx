import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useSweetAlert } from '../hooks/useSweetAlert'
import { DollarSign, Mail, Lock, Eye, EyeOff } from 'lucide-react'

export function AuthForm() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { signIn, signUp } = useAuth()
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-mint-50 via-white to-primary-50 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-bl from-primary-100/30 to-transparent rounded-full"></div>
        <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-accent-100/30 to-transparent rounded-full"></div>
      </div>

      <div className="relative w-full max-w-md">
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-mint-200/50 p-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-400 to-primary-600 rounded-3xl mx-auto mb-6 shadow-xl">
              <DollarSign className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-semibold text-dark-500 mb-2">FinanceFlow</h1>
            <p className="text-dark-400 font-medium">
              {isLogin ? 'Welcome back to your financial journey!' : 'Start your smart finance journey'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-dark-500 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-dark-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 border-2 border-mint-200 rounded-xl focus:ring-4 focus:ring-primary-200 focus:border-primary-400 transition-all duration-300 bg-white/80 backdrop-blur-sm font-medium text-dark-600"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-dark-500 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-dark-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-14 py-4 border-2 border-mint-200 rounded-xl focus:ring-4 focus:ring-primary-200 focus:border-primary-400 transition-all duration-300 bg-white/80 backdrop-blur-sm font-medium text-dark-600"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-dark-400 hover:text-primary-600 transition-colors duration-300"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary-400 to-primary-600 hover:from-primary-500 hover:to-primary-700 text-white font-semibold py-4 px-4 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105"
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
              onClick={() => setIsLogin(!isLogin)}
              className="text-primary-600 hover:text-primary-700 font-medium transition-colors duration-300 group"
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
    </div>
  )
}