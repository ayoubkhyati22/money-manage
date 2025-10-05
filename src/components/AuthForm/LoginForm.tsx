import { Mail, Lock, Eye, EyeOff, Zap } from 'lucide-react'

interface LoginFormProps {
  email: string
  password: string
  showPassword: boolean
  loading: boolean
  onEmailChange: (email: string) => void
  onPasswordChange: (password: string) => void
  onTogglePassword: () => void
  onSubmit: (e: React.FormEvent) => void
}

export function LoginForm({
  email,
  password,
  showPassword,
  loading,
  onEmailChange,
  onPasswordChange,
  onTogglePassword,
  onSubmit
}: LoginFormProps) {
  const handleDemoLogin = () => {
    // Set demo credentials
    onEmailChange('test@financeflow.com')
    onPasswordChange('test123')
    
    // Wait a brief moment for state to update, then submit
    setTimeout(() => {
      const form = document.querySelector('form') as HTMLFormElement
      if (form) {
        form.requestSubmit()
      }
    }, 100)
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {/* Demo Login Button */}
      <div className="mb-4">
        <button
          type="button"
          onClick={handleDemoLogin}
          disabled={loading}
          className="w-full bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-500 hover:to-amber-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-2.5 px-4 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105 disabled:hover:scale-100 text-sm flex items-center justify-center space-x-2"
        >
          <Zap className="w-4 h-4" />
          <span>Try Demo Account</span>
        </button>
        <p className="text-xs text-center text-dark-400 dark:text-dark-400 mt-2">
          Quick access with demo credentials
        </p>
      </div>

      {/* Divider */}
      <div className="relative flex items-center justify-center my-4">
        <div className="border-t border-mint-200 dark:border-dark-600 w-full"></div>
        <span className="absolute bg-white dark:bg-dark-800 px-3 text-xs text-dark-400 dark:text-dark-400">
          or sign in with email
        </span>
      </div>

      <div>
        <label htmlFor="email" className="block text-xs font-medium text-dark-500 dark:text-dark-200 mb-1.5">
          Email Address
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-dark-400 dark:text-dark-400" />
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            className="w-full pl-10 pr-3 py-2.5 border-2 border-mint-200 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800/30 focus:border-primary-400 dark:focus:border-primary-500 transition-all duration-300 bg-white/80 dark:bg-dark-700/80 backdrop-blur-sm text-sm font-medium text-dark-600 dark:text-dark-200"
            placeholder="Enter your email"
            required
          />
        </div>
      </div>

      <div>
        <label htmlFor="password" className="block text-xs font-medium text-dark-500 dark:text-dark-200 mb-1.5">
          Password
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-dark-400 dark:text-dark-400" />
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            className="w-full pl-10 pr-11 py-2.5 border-2 border-mint-200 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800/30 focus:border-primary-400 dark:focus:border-primary-500 transition-all duration-300 bg-white/80 dark:bg-dark-700/80 backdrop-blur-sm text-sm font-medium text-dark-600 dark:text-dark-200"
            placeholder="Enter your password"
            required
          />
          <button
            type="button"
            onClick={onTogglePassword}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-dark-400 dark:text-dark-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-300"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-primary-400 to-primary-600 hover:from-primary-500 hover:to-primary-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-2.5 px-4 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105 disabled:hover:scale-100 text-sm"
      >
        {loading ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Loading...</span>
          </div>
        ) : (
          <span>Sign In</span>
        )}
      </button>
    </form>
  )
}