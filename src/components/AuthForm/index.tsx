import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useDarkMode } from '../../hooks/useDarkMode'
import { useSweetAlert } from '../../hooks/useSweetAlert'
import { DollarSign } from 'lucide-react'
import { ThemeToggle } from './ThemeToggle'
import { TermsModal } from './TermsModal'
import { LoginForm } from './LoginForm'
import { MultiStepSignUpForm } from './MultiStepSignUpForm'
import { supabase } from '../../lib/supabase'

export function AuthForm() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [showTermsModal, setShowTermsModal] = useState(false)
  
  // Registration data state
  const [registrationData, setRegistrationData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: ''
  })
  
  const { signIn, signUp } = useAuth()
  const { theme, setTheme } = useDarkMode()
  const { showError, showSuccess, showInfo } = useSweetAlert()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (isLogin) {
      // Login flow
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
        await signIn(email, password)
        await showSuccess('Welcome Back!', 'You have successfully logged in')
      } catch (error: any) {
        console.error('Auth error:', error)
        await showError('Login Failed', error.message || 'An unexpected error occurred')
      } finally {
        setLoading(false)
      }
    } else {
      // Registration flow
      if (!registrationData.email || !registrationData.password) {
        await showError('Missing Information', 'Please complete all required fields')
        return
      }

      if (registrationData.password.length < 6) {
        await showError('Password Too Short', 'Password must be at least 6 characters long')
        return
      }

      if (registrationData.password !== registrationData.confirmPassword) {
        await showError('Password Mismatch', 'Passwords do not match')
        return
      }

      if (!acceptTerms) {
        await showError('Terms Required', 'Please accept the terms and conditions to continue')
        return
      }

      setLoading(true)
      try {
        // Create auth account
        await signUp(registrationData.email, registrationData.password)
        
        // Get the user after signup
        const { data: { user } } = await supabase.auth.getUser()
        
        if (user) {
          // Create user profile
          const { error: profileError } = await supabase
            .from('user_profiles')
            .insert([{
              user_id: user.id,
              first_name: registrationData.firstName,
              last_name: registrationData.lastName,
              phone_number: registrationData.phoneNumber || null
            }])

          if (profileError) {
            console.error('Error creating profile:', profileError)
          }
        }
        
        await showInfo(
          'Account Created!',
          'Please check your email for verification link before signing in'
        )
        
        // Reset registration form
        setRegistrationData({
          firstName: '',
          lastName: '',
          email: '',
          phoneNumber: '',
          password: '',
          confirmPassword: ''
        })
        setAcceptTerms(false)
      } catch (error: any) {
        console.error('Auth error:', error)
        await showError('Sign Up Failed', error.message || 'An unexpected error occurred')
      } finally {
        setLoading(false)
      }
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
    // Reset forms when switching
    setEmail('')
    setPassword('')
    setRegistrationData({
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      password: '',
      confirmPassword: ''
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-mint-50 via-white to-primary-50 dark:from-dark-900 dark:via-dark-800 dark:to-dark-900 flex items-center justify-center p-4 transition-all duration-500">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-bl from-primary-100/30 dark:from-primary-900/20 to-transparent rounded-full"></div>
        <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-accent-100/30 dark:from-accent-900/20 to-transparent rounded-full"></div>
      </div>

      <ThemeToggle theme={theme} onToggle={cycleTheme} />

      <div className="relative w-full max-w-2xl">
        <div className="bg-white/95 dark:bg-dark-800/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-mint-200/50 dark:border-dark-600/50 p-6 sm:p-8">
          <div className="text-center mb-6">
            <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl mx-auto mb-4 shadow-lg">
              <DollarSign className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-semibold text-dark-500 dark:text-dark-100 mb-1">FinanceFlow</h1>
            <p className="text-sm text-dark-400 dark:text-dark-300 font-medium">
              {isLogin ? 'Welcome back!' : 'Create your account'}
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
            <MultiStepSignUpForm
              registrationData={registrationData}
              onRegistrationDataChange={setRegistrationData}
              showPassword={showPassword}
              showConfirmPassword={showConfirmPassword}
              loading={loading}
              acceptTerms={acceptTerms}
              onTogglePassword={() => setShowPassword(!showPassword)}
              onToggleConfirmPassword={() => setShowConfirmPassword(!showConfirmPassword)}
              onAcceptTermsChange={setAcceptTerms}
              onShowTerms={() => setShowTermsModal(true)}
              onSubmit={handleSubmit}
            />
          )}

          <div className="mt-6 text-center">
            <button
              onClick={toggleAuthMode}
              className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium transition-colors duration-300 group"
            >
              <span className="group-hover:underline decoration-2 underline-offset-4">
                {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
              </span>
            </button>
          </div>

          <div className="absolute -top-3 -right-3 w-6 h-6 bg-gradient-to-br from-accent-400 to-accent-600 rounded-full opacity-60"></div>
          <div className="absolute -bottom-3 -left-3 w-5 h-5 bg-gradient-to-br from-mint-400 to-mint-600 rounded-full opacity-60"></div>
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