import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, ArrowRight, Zap } from 'lucide-react'

interface LoginFormProps {
  email: string
  password: string
  showPassword: boolean
  loading: boolean
  onEmailChange: (v: string) => void
  onPasswordChange: (v: string) => void
  onTogglePassword: () => void
  onSubmit: (e: React.FormEvent) => void
  onSwitchToRegister?: () => void
}

function Field({
  icon: Icon, label, right, children,
}: {
  icon: React.FC<any>
  label?: string
  right?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      {(label || right) && (
        <div className="flex items-center justify-between">
          {label && <label className="text-xs font-medium" style={{ color: '#848E9C' }}>{label}</label>}
          {right}
        </div>
      )}
      <div className="relative group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-200"
          style={{ color: '#5a6272' }}>
          <Icon style={{ width: 17, height: 17 }} />
        </div>
        {children}
      </div>
    </div>
  )
}

const inputBase: React.CSSProperties = {
  width: '100%',
  height: '52px',
  paddingLeft: '44px',
  paddingRight: '16px',
  background: 'rgba(255,255,255,0.04)',
  border: '1.5px solid rgba(255,255,255,0.08)',
  borderRadius: '12px',
  color: '#EAECEF',
  fontSize: '14px',
  outline: 'none',
  transition: 'border-color 0.15s',
}

export function LoginForm({
  email, password, showPassword, loading,
  onEmailChange, onPasswordChange, onTogglePassword, onSubmit, onSwitchToRegister,
}: LoginFormProps) {
  const [focusedField, setFocusedField] = useState<string | null>(null)

  const focusStyle = (name: string): React.CSSProperties => ({
    ...inputBase,
    borderColor: focusedField === name ? '#6366F1' : 'rgba(255,255,255,0.08)',
    boxShadow: focusedField === name ? '0 0 0 3px rgba(99,102,241,0.12)' : 'none',
  })

  const handleDemoLogin = () => {
    onEmailChange('test@financeflow.com')
    onPasswordChange('test123')
    setTimeout(() => {
      document.getElementById('login-submit-btn')?.click()
    }, 300)
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">

      {/* Title */}
      <div className="mb-6">
        <h2 className="font-bold text-2xl mb-1" style={{ color: '#EAECEF' }}>Welcome back</h2>
        <p className="text-sm" style={{ color: '#848E9C' }}>Sign in to your FinanceFlow account</p>
      </div>

      {/* Demo button */}
      <motion.button type="button" onClick={handleDemoLogin} disabled={loading}
        whileTap={{ scale: 0.98 }}
        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200"
        style={{ background: 'rgba(240,185,11,0.06)', border: '1px solid rgba(240,185,11,0.18)' }}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(240,185,11,0.1)' }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(240,185,11,0.06)' }}
      >
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(240,185,11,0.15)' }}>
          <Zap style={{ color: '#F0B90B', width: 15, height: 15 }} />
        </div>
        <div className="text-left flex-1">
          <p className="text-sm font-semibold" style={{ color: '#F0B90B' }}>Try Demo Account</p>
          <p className="text-xs" style={{ color: '#848E9C' }}>One-click auto-fill & login</p>
        </div>
        <ArrowRight style={{ color: '#F0B90B', width: 15, height: 15 }} />
      </motion.button>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
        <span className="text-xs" style={{ color: '#5a6272' }}>or continue with email</span>
        <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
      </div>

      {/* Email */}
      <Field icon={Mail} label="Email Address">
        <input
          type="email" value={email} placeholder="name@example.com" autoComplete="email"
          onChange={e => onEmailChange(e.target.value)}
          onFocus={() => setFocusedField('email')}
          onBlur={() => setFocusedField(null)}
          style={focusStyle('email')}
        />
      </Field>

      {/* Password */}
      <Field
        icon={Lock}
        label="Password"
        right={
          <button type="button" className="text-xs transition-colors"
            style={{ color: '#6366F1' }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#818CF8' }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#6366F1' }}>
            Forgot password?
          </button>
        }
      >
        <input
          type={showPassword ? 'text' : 'password'} value={password} placeholder="••••••••"
          autoComplete="current-password"
          onChange={e => onPasswordChange(e.target.value)}
          onFocus={() => setFocusedField('password')}
          onBlur={() => setFocusedField(null)}
          style={{ ...focusStyle('password'), paddingRight: '48px' }}
        />
        <button type="button" onClick={onTogglePassword}
          className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors"
          style={{ color: '#5a6272' }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#EAECEF' }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#5a6272' }}>
          {showPassword ? <EyeOff style={{ width: 17, height: 17 }} /> : <Eye style={{ width: 17, height: 17 }} />}
        </button>
      </Field>

      {/* Submit */}
      <motion.button id="login-submit-btn" type="submit" disabled={loading}
        whileTap={{ scale: 0.98 }}
        className="w-full flex items-center justify-center gap-2 font-bold text-sm mt-2"
        style={{
          height: '52px',
          borderRadius: '12px',
          background: loading ? 'rgba(99,102,241,0.5)' : 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
          color: '#fff',
          border: 'none',
          cursor: loading ? 'not-allowed' : 'pointer',
          boxShadow: loading ? 'none' : '0 4px 20px rgba(99,102,241,0.35)',
          transition: 'all 0.2s',
        }}
        onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 6px 28px rgba(99,102,241,0.5)' }}
        onMouseLeave={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 20px rgba(99,102,241,0.35)' }}
      >
        {loading ? (
          <div className="w-5 h-5 border-2 rounded-full animate-spin"
            style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff' }} />
        ) : (
          <>
            <span>Sign In</span>
            <ArrowRight style={{ width: 16, height: 16 }} />
          </>
        )}
      </motion.button>

      {/* Switch to register */}
      <p className="text-center text-sm" style={{ color: '#848E9C' }}>
        Don't have an account?{' '}
        <button type="button" onClick={onSwitchToRegister}
          className="font-semibold transition-colors"
          style={{ color: '#6366F1' }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#818CF8' }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#6366F1' }}>
          Create account
        </button>
      </p>
    </form>
  )
}
