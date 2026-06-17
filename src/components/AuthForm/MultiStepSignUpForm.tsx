import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Mail, Lock, Eye, EyeOff, User, Phone,
  ArrowRight, ArrowLeft, Check, ShieldCheck,
} from 'lucide-react'

interface RegistrationData {
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  password: string
  confirmPassword: string
}

interface MultiStepSignUpFormProps {
  registrationData: RegistrationData
  onRegistrationDataChange: (data: RegistrationData) => void
  showPassword: boolean
  showConfirmPassword: boolean
  loading: boolean
  acceptTerms: boolean
  onTogglePassword: () => void
  onToggleConfirmPassword: () => void
  onAcceptTermsChange: (v: boolean) => void
  onShowTerms: () => void
  onSubmit: (e: React.FormEvent) => void
}

const STEPS = [
  { id: 1, label: 'Profile' },
  { id: 2, label: 'Account' },
  { id: 3, label: 'Confirm' },
]

const inputBase: React.CSSProperties = {
  width: '100%',
  height: '52px',
  background: 'rgba(255,255,255,0.04)',
  border: '1.5px solid rgba(255,255,255,0.08)',
  borderRadius: '12px',
  color: '#EAECEF',
  fontSize: '14px',
  outline: 'none',
  transition: 'border-color 0.15s, box-shadow 0.15s',
}

function AuthInput({
  icon: Icon, type = 'text', value, placeholder, onChange, autoFocus,
  rightEl, autoComplete,
}: {
  icon: React.FC<any>
  type?: string
  value: string
  placeholder: string
  onChange: (v: string) => void
  autoFocus?: boolean
  rightEl?: React.ReactNode
  autoComplete?: string
}) {
  const [focused, setFocused] = useState(false)
  return (
    <div className="relative">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#5a6272' }}>
        <Icon style={{ width: 17, height: 17 }} />
      </div>
      <input
        type={type} value={value} placeholder={placeholder}
        autoFocus={autoFocus} autoComplete={autoComplete}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          ...inputBase,
          paddingLeft: '44px',
          paddingRight: rightEl ? '48px' : '16px',
          borderColor: focused ? '#6366F1' : 'rgba(255,255,255,0.08)',
          boxShadow: focused ? '0 0 0 3px rgba(99,102,241,0.12)' : 'none',
        }}
      />
      {rightEl && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2">{rightEl}</div>
      )}
    </div>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-xs font-medium mb-1.5" style={{ color: '#848E9C' }}>{children}</label>
}

function PasswordStrength({ password }: { password: string }) {
  if (!password) return null
  const len = password.length
  const strength = len >= 12 ? 3 : len >= 8 ? 2 : len >= 6 ? 1 : 0
  const labels = ['', 'Weak', 'Medium', 'Strong']
  const colors = ['', '#F6465D', '#F0B90B', '#0ECB81']
  return (
    <div className="space-y-1.5 mt-2">
      <div className="flex items-center justify-between">
        <span className="text-xs" style={{ color: '#848E9C' }}>Password strength</span>
        <span className="text-xs font-semibold" style={{ color: colors[strength] }}>{labels[strength]}</span>
      </div>
      <div className="flex gap-1">
        {[1, 2, 3].map(i => (
          <motion.div key={i} className="h-1 flex-1 rounded-full"
            animate={{ background: i <= strength ? colors[strength] : 'rgba(255,255,255,0.08)' }}
            transition={{ duration: 0.3 }} />
        ))}
      </div>
    </div>
  )
}

export function MultiStepSignUpForm({
  registrationData, onRegistrationDataChange,
  showPassword, showConfirmPassword, loading, acceptTerms,
  onTogglePassword, onToggleConfirmPassword,
  onAcceptTermsChange, onShowTerms, onSubmit,
}: MultiStepSignUpFormProps) {
  const [step, setStep]           = useState(1)
  const [direction, setDirection] = useState(1)
  const rd = registrationData
  const set = (patch: Partial<RegistrationData>) => onRegistrationDataChange({ ...rd, ...patch })

  const valid = (s: number): boolean => {
    if (s === 1) return rd.firstName.trim().length >= 2 && rd.lastName.trim().length >= 2
    if (s === 2) return rd.email.trim().length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rd.email)
                     && rd.password.length >= 6 && rd.password === rd.confirmPassword
    if (s === 3) return acceptTerms
    return false
  }

  const next = () => { if (valid(step) && step < 3) { setDirection(1); setStep(s => s + 1) } }
  const prev = () => { if (step > 1) { setDirection(-1); setStep(s => s - 1) } }

  const slideVariants = {
    enter:  (d: number) => ({ x: d > 0 ? 260 : -260, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit:   (d: number) => ({ x: d < 0 ? 260 : -260, opacity: 0 }),
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">

      {/* Title */}
      <div className="mb-2">
        <h2 className="font-bold text-2xl mb-1" style={{ color: '#EAECEF' }}>Create account</h2>
        <p className="text-sm" style={{ color: '#848E9C' }}>Start managing your finances today</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-6">
        {STEPS.map((s, i) => {
          const done    = s.id < step
          const current = s.id === step
          return (
            <div key={s.id} className="flex items-center gap-2 flex-1">
              <div className="flex items-center gap-2">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all duration-300"
                  style={{
                    background: done ? '#0ECB81' : current ? '#6366F1' : 'rgba(255,255,255,0.06)',
                    color: done || current ? '#fff' : '#5a6272',
                    border: current ? '2px solid rgba(99,102,241,0.4)' : 'none',
                    boxShadow: current ? '0 0 12px rgba(99,102,241,0.35)' : 'none',
                  }}
                >
                  {done ? <Check style={{ width: 13, height: 13 }} /> : s.id}
                </div>
                <span className="text-xs font-medium hidden sm:block" style={{ color: current ? '#EAECEF' : done ? '#0ECB81' : '#5a6272' }}>
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className="flex-1 mx-1 h-px" style={{ background: done ? '#0ECB81' : 'rgba(255,255,255,0.06)' }} />
              )}
            </div>
          )
        })}
      </div>

      {/* Step content */}
      <div className="relative overflow-hidden" style={{ minHeight: 240 }}>
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div key={step} custom={direction}
            variants={slideVariants} initial="enter" animate="center" exit="exit"
            transition={{ type: 'spring', stiffness: 340, damping: 32 }}
            className="space-y-4">

            {/* Step 1: Personal */}
            {step === 1 && (
              <>
                <div>
                  <Label>First Name</Label>
                  <AuthInput icon={User} value={rd.firstName} placeholder="Enter your first name"
                    onChange={v => set({ firstName: v })} autoFocus autoComplete="given-name" />
                </div>
                <div>
                  <Label>Last Name</Label>
                  <AuthInput icon={User} value={rd.lastName} placeholder="Enter your last name"
                    onChange={v => set({ lastName: v })} autoComplete="family-name" />
                </div>
                <div>
                  <Label>Phone Number <span style={{ color: '#5a6272' }}>(optional)</span></Label>
                  <AuthInput icon={Phone} type="tel" value={rd.phoneNumber} placeholder="+212 6 XX XX XX XX"
                    onChange={v => set({ phoneNumber: v })} autoComplete="tel" />
                </div>
              </>
            )}

            {/* Step 2: Account */}
            {step === 2 && (
              <>
                <div>
                  <Label>Email Address</Label>
                  <AuthInput icon={Mail} type="email" value={rd.email} placeholder="name@example.com"
                    onChange={v => set({ email: v })} autoFocus autoComplete="email" />
                </div>
                <div>
                  <Label>Password</Label>
                  <AuthInput icon={Lock} type={showPassword ? 'text' : 'password'} value={rd.password}
                    placeholder="Min. 6 characters"
                    onChange={v => set({ password: v })}
                    autoComplete="new-password"
                    rightEl={
                      <button type="button" onClick={onTogglePassword} style={{ color: '#5a6272' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#EAECEF' }}
                        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#5a6272' }}>
                        {showPassword ? <EyeOff style={{ width: 17, height: 17 }} /> : <Eye style={{ width: 17, height: 17 }} />}
                      </button>
                    }
                  />
                  <PasswordStrength password={rd.password} />
                </div>
                <div>
                  <Label>Confirm Password</Label>
                  <AuthInput icon={Lock} type={showConfirmPassword ? 'text' : 'password'} value={rd.confirmPassword}
                    placeholder="Re-enter your password"
                    onChange={v => set({ confirmPassword: v })}
                    autoComplete="new-password"
                    rightEl={
                      <button type="button" onClick={onToggleConfirmPassword} style={{ color: '#5a6272' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#EAECEF' }}
                        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#5a6272' }}>
                        {showConfirmPassword ? <EyeOff style={{ width: 17, height: 17 }} /> : <Eye style={{ width: 17, height: 17 }} />}
                      </button>
                    }
                  />
                  {rd.password && rd.confirmPassword && rd.password !== rd.confirmPassword && (
                    <p className="text-xs mt-1.5" style={{ color: '#F6465D' }}>Passwords don't match</p>
                  )}
                </div>
              </>
            )}

            {/* Step 3: Review & Terms */}
            {step === 3 && (
              <>
                {/* Summary card */}
                <div className="rounded-xl p-4 space-y-3"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="flex items-center gap-3 pb-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm"
                      style={{ background: 'linear-gradient(135deg, #6366F1, #06B6D4)', color: '#fff' }}>
                      {(rd.firstName[0] || '?').toUpperCase()}{(rd.lastName[0] || '').toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-sm" style={{ color: '#EAECEF' }}>
                        {rd.firstName} {rd.lastName}
                      </p>
                      <p className="text-xs" style={{ color: '#848E9C' }}>{rd.email}</p>
                    </div>
                  </div>
                  {[
                    { label: 'Email',    value: rd.email },
                    ...(rd.phoneNumber ? [{ label: 'Phone', value: rd.phoneNumber }] : []),
                    { label: 'Password', value: '••••••••' },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between">
                      <span className="text-xs" style={{ color: '#848E9C' }}>{label}</span>
                      <span className="text-xs font-medium" style={{ color: '#EAECEF' }}>{value}</span>
                    </div>
                  ))}
                </div>

                {/* Security note */}
                <div className="flex items-start gap-3 px-3 py-2.5 rounded-xl"
                  style={{ background: 'rgba(14,203,129,0.06)', border: '1px solid rgba(14,203,129,0.15)' }}>
                  <ShieldCheck style={{ color: '#0ECB81', width: 16, height: 16, flexShrink: 0, marginTop: 2 }} />
                  <p className="text-xs" style={{ color: '#848E9C' }}>
                    Your data is encrypted with 256-bit SSL and never shared with third parties.
                  </p>
                </div>

                {/* Terms checkbox */}
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="relative flex-shrink-0 mt-0.5">
                    <input type="checkbox" checked={acceptTerms} onChange={e => onAcceptTermsChange(e.target.checked)}
                      className="sr-only" />
                    <div
                      className="w-5 h-5 rounded-md flex items-center justify-center transition-all duration-200"
                      style={{
                        background: acceptTerms ? '#6366F1' : 'rgba(255,255,255,0.04)',
                        border: `1.5px solid ${acceptTerms ? '#6366F1' : 'rgba(255,255,255,0.12)'}`,
                        boxShadow: acceptTerms ? '0 0 8px rgba(99,102,241,0.35)' : 'none',
                      }}
                    >
                      {acceptTerms && <Check style={{ color: '#fff', width: 12, height: 12 }} />}
                    </div>
                  </div>
                  <span className="text-xs leading-relaxed" style={{ color: '#848E9C' }}>
                    I agree to the{' '}
                    <button type="button" onClick={onShowTerms}
                      className="font-semibold underline underline-offset-2"
                      style={{ color: '#6366F1' }}>
                      Terms of Service
                    </button>
                    {' '}and{' '}
                    <button type="button" onClick={onShowTerms}
                      className="font-semibold underline underline-offset-2"
                      style={{ color: '#6366F1' }}>
                      Privacy Policy
                    </button>
                  </span>
                </label>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-3 pt-1">
        {step > 1 && (
          <motion.button type="button" onClick={prev} whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 px-4 h-12 rounded-xl text-sm font-semibold transition-all"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', color: '#848E9C' }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.1)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.06)' }}>
            <ArrowLeft style={{ width: 16, height: 16 }} />
            Back
          </motion.button>
        )}

        {step < 3 ? (
          <motion.button type="button" onClick={next} whileTap={{ scale: 0.97 }} disabled={!valid(step)}
            className="flex-1 flex items-center justify-center gap-2 h-12 rounded-xl text-sm font-bold"
            style={{
              background: valid(step) ? 'linear-gradient(135deg, #6366F1, #4F46E5)' : 'rgba(255,255,255,0.06)',
              color: valid(step) ? '#fff' : '#5a6272',
              border: 'none',
              cursor: valid(step) ? 'pointer' : 'not-allowed',
              boxShadow: valid(step) ? '0 4px 20px rgba(99,102,241,0.3)' : 'none',
              transition: 'all 0.2s',
            }}>
            Continue
            <ArrowRight style={{ width: 16, height: 16 }} />
          </motion.button>
        ) : (
          <motion.button type="submit" whileTap={{ scale: 0.97 }}
            disabled={loading || !acceptTerms}
            className="flex-1 flex items-center justify-center gap-2 h-12 rounded-xl text-sm font-bold"
            style={{
              background: !loading && acceptTerms ? 'linear-gradient(135deg, #0ECB81, #0BB574)' : 'rgba(255,255,255,0.06)',
              color: !loading && acceptTerms ? '#fff' : '#5a6272',
              border: 'none',
              cursor: loading || !acceptTerms ? 'not-allowed' : 'pointer',
              boxShadow: !loading && acceptTerms ? '0 4px 20px rgba(14,203,129,0.3)' : 'none',
              transition: 'all 0.2s',
            }}>
            {loading ? (
              <div className="w-5 h-5 border-2 rounded-full animate-spin"
                style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff' }} />
            ) : (
              <>
                <Check style={{ width: 16, height: 16 }} />
                Create Account
              </>
            )}
          </motion.button>
        )}
      </div>
    </form>
  )
}
