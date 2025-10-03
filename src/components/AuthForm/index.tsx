import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useDarkMode } from '../../hooks/useDarkMode'
import { useSweetAlert } from '../../hooks/useSweetAlert'
import { DollarSign } from 'lucide-react'
import { ThemeToggle } from './ThemeToggle'
import { TermsModal } from './TermsModal'
import { LoginForm } from './LoginForm'
import { SignUpForm } from './SignUpForm'

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

  const cycleTheme = () => {
    const themes = ['light', 'dark', 'system'] as const
    const currentIndex = themes.indexOf(theme)
    const nextIndex = (currentIndex + 1) % themes.length
    setTheme(themes[nextIndex])
  }

  const toggleAuthMode = () => {
    setIsLogin(!isLogin)
    setAcceptTerms(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-mint-50 via-white to-primary-50 dark:from-dark-900 dark:via-dark-800 dark:to-dark-900 flex items-center justify-center p-4 transition-all duration-500">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-bl from-primary-100/30 dark:from-primary-900/20 to-transparent rounded-full"></div>
        <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-accent-100/30 dark:from-accent-900/20 to-transparent rounded-full"></div>
      </div>

      <ThemeToggle theme={theme} onToggle={cycleTheme} />

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

          {isLogin ? (
            <LoginForm
              email={email}
              password={password}
              showPassword={showPassword}
              loading={loading}
              onEmailChange={setEmail}
              onPasswordChange={setPassword}
              onTogglePassword={() => setShowPassword(!showPassword)}
              onSubmit={handleSubmit}
            />
          ) : (
            <SignUpForm
              email={email}
              password={password}
              showPassword={showPassword}
              acceptTerms={acceptTerms}
              loading={loading}
              onEmailChange={setEmail}
              onPasswordChange={setPassword}
              onTogglePassword={() => setShowPassword(!showPassword)}
              onAcceptTermsChange={setAcceptTerms}
              onShowTerms={() => setShowTermsModal(true)}
              onSubmit={handleSubmit}
            />
          )}

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

          <div className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-br from-accent-400 to-accent-600 rounded-full opacity-60"></div>
          <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-gradient-to-br from-mint-400 to-mint-600 rounded-full opacity-60"></div>
        </div>
      </div>

      <TermsModal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        onAccept={() => setAcceptTerms(true)}
      />
    </div>
  )
}
