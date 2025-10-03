import { Mail, Lock, Eye, EyeOff } from 'lucide-react'

interface SignUpFormProps {
  email: string
  password: string
  showPassword: boolean
  acceptTerms: boolean
  loading: boolean
  onEmailChange: (email: string) => void
  onPasswordChange: (password: string) => void
  onTogglePassword: () => void
  onAcceptTermsChange: (accepted: boolean) => void
  onShowTerms: () => void
  onSubmit: (e: React.FormEvent) => void
}

export function SignUpForm({
  email,
  password,
  showPassword,
  acceptTerms,
  loading,
  onEmailChange,
  onPasswordChange,
  onTogglePassword,
  onAcceptTermsChange,
  onShowTerms,
  onSubmit
}: SignUpFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
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
            onChange={(e) => onEmailChange(e.target.value)}
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
            onChange={(e) => onPasswordChange(e.target.value)}
            className="w-full pl-12 pr-14 py-4 border-2 border-mint-200 dark:border-dark-600 rounded-xl focus:ring-4 focus:ring-primary-200 dark:focus:ring-primary-800/30 focus:border-primary-400 dark:focus:border-primary-500 transition-all duration-300 bg-white/80 dark:bg-dark-700/80 backdrop-blur-sm font-medium text-dark-600 dark:text-dark-200"
            placeholder="Enter your password"
            required
          />
          <button
            type="button"
            onClick={onTogglePassword}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-dark-400 dark:text-dark-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-300"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-start space-x-3">
          <div className="flex items-center h-6">
            <input
              id="accept-terms"
              type="checkbox"
              checked={acceptTerms}
              onChange={(e) => onAcceptTermsChange(e.target.checked)}
              className="w-5 h-5 text-primary-600 bg-white dark:bg-dark-700 border-2 border-mint-200 dark:border-dark-600 rounded focus:ring-primary-500 dark:focus:ring-primary-400 focus:ring-2 transition-colors"
              required
            />
          </div>
          <div className="text-sm">
            <label htmlFor="accept-terms" className="text-dark-500 dark:text-dark-200">
              I accept the{' '}
              <button
                type="button"
                onClick={onShowTerms}
                className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 underline font-medium transition-colors"
              >
                Terms and Conditions
              </button>
              {' '}and{' '}
              <button
                type="button"
                onClick={onShowTerms}
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

      <button
        type="submit"
        disabled={loading || !acceptTerms}
        className="w-full bg-gradient-to-r from-primary-400 to-primary-600 hover:from-primary-500 hover:to-primary-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-4 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105 disabled:hover:scale-100"
      >
        {loading ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Loading...</span>
          </div>
        ) : (
          <span className="text-lg">Create Account</span>
        )}
      </button>
    </form>
  )
}
