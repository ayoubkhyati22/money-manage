import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useSweetAlert } from '../../hooks/useSweetAlert'
import { supabase } from '../../lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import {
  TrendingUp, ShieldCheck, BarChart3, Wallet,
  Globe, Star,
} from 'lucide-react'
import { LoginForm } from './LoginForm'
import { MultiStepSignUpForm } from './MultiStepSignUpForm'
import { TermsModal } from './TermsModal'

const FEATURES = [
  { icon: Wallet,      title: 'Multi-Bank Tracking',  desc: 'Monitor all your accounts in one place' },
  { icon: TrendingUp,  title: 'Goal Management',      desc: 'Set targets and track your progress' },
  { icon: BarChart3,   title: 'Stock Portfolio',       desc: 'Real-time Casablanca stock prices' },
]

const STATS = [
  { value: '10K+', label: 'Active Users' },
  { value: '99.9%', label: 'Uptime' },
  { value: '256-bit', label: 'Encryption' },
]

export function AuthForm() {
  const navigate   = useNavigate()
  const { signIn, signUp } = useAuth()
  const { showError, showInfo } = useSweetAlert()

  const [tab, setTab]                       = useState<'login' | 'register'>('login')
  const [loading, setLoading]               = useState(false)
  const [showTermsModal, setShowTermsModal] = useState(false)
  const [acceptTerms, setAcceptTerms]       = useState(false)

  // login fields
  const [email,        setEmail]        = useState('')
  const [password,     setPassword]     = useState('')
  const [showPwd,      setShowPwd]      = useState(false)

  // register fields
  const [showRegPwd,   setShowRegPwd]   = useState(false)
  const [showRegConf,  setShowRegConf]  = useState(false)
  const [regData, setRegData] = useState({
    firstName: '', lastName: '', email: '',
    phoneNumber: '', password: '', confirmPassword: '',
  })

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) { await showError('Missing Fields', 'Please enter email and password'); return }
    if (password.length < 6) { await showError('Password Too Short', 'Minimum 6 characters required'); return }
    setLoading(true)
    try {
      await signIn(email, password)
      navigate('/dashboard')
    } catch (err: any) {
      await showError('Login Failed', err.message || 'Invalid credentials')
    } finally { setLoading(false) }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!regData.email || !regData.password) { await showError('Missing Fields', 'Please fill in all required fields'); return }
    if (regData.password.length < 6)          { await showError('Password Too Short', 'Minimum 6 characters required'); return }
    if (regData.password !== regData.confirmPassword) { await showError('Password Mismatch', 'Passwords do not match'); return }
    if (!acceptTerms)                          { await showError('Terms Required', 'Please accept the terms to continue'); return }
    setLoading(true)
    try {
      await signUp(regData.email, regData.password)
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase.from('user_profiles').insert([{
          user_id: user.id,
          first_name: regData.firstName,
          last_name: regData.lastName,
          phone_number: regData.phoneNumber || null,
        }])
      }
      await showInfo('Check Your Email', 'We sent a verification link — please confirm your email before signing in.')
      setRegData({ firstName: '', lastName: '', email: '', phoneNumber: '', password: '', confirmPassword: '' })
      setAcceptTerms(false)
      setTab('login')
    } catch (err: any) {
      await showError('Registration Failed', err.message || 'An error occurred')
    } finally { setLoading(false) }
  }

  const switchTab = (t: 'login' | 'register') => {
    setTab(t)
    setEmail(''); setPassword(''); setShowPwd(false)
    setRegData({ firstName: '', lastName: '', email: '', phoneNumber: '', password: '', confirmPassword: '' })
    setAcceptTerms(false)
  }

  return (
    <div className="min-h-screen flex" style={{ background: '#0b0e11' }}>

      {/* ── Left branding panel ── */}
      <div className="hidden lg:flex flex-col justify-between w-[52%] relative overflow-hidden p-12"
        style={{ background: 'linear-gradient(135deg, #0d1117 0%, #0f1923 100%)' }}>

        {/* Animated orbs */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div animate={{ y: [0, -24, 0], x: [0, 12, 0] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-[10%] right-[15%] w-72 h-72 rounded-full blur-[80px]"
            style={{ background: 'rgba(99,102,241,0.18)' }} />
          <motion.div animate={{ y: [0, 20, 0], x: [0, -16, 0] }} transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
            className="absolute bottom-[20%] left-[10%] w-56 h-56 rounded-full blur-[80px]"
            style={{ background: 'rgba(6,182,212,0.14)' }} />
          <motion.div animate={{ y: [0, 14, 0] }} transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
            className="absolute top-[55%] right-[30%] w-40 h-40 rounded-full blur-[60px]"
            style={{ background: 'rgba(14,203,129,0.10)' }} />
        </div>

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #6366F1, #06B6D4)' }}>
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-bold text-xl tracking-tight">FinanceFlow</span>
          </div>
          <p className="text-sm font-medium" style={{ color: '#848E9C' }}>
            Your complete wealth management platform
          </p>
        </div>

        {/* Headline */}
        <div className="relative z-10 my-auto">
          <motion.h1
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-bold leading-[1.15] mb-6"
            style={{ fontSize: '2.6rem', color: '#EAECEF' }}
          >
            Take control of<br />
            <span style={{ background: 'linear-gradient(90deg, #6366F1, #06B6D4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              your finances
            </span>
          </motion.h1>

          <div className="space-y-5">
            {FEATURES.map(({ icon: Icon, title, desc }, i) => (
              <motion.div key={title} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 + i * 0.12 }}
                className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.2)' }}>
                  <Icon style={{ color: '#818CF8', width: 18, height: 18 }} />
                </div>
                <div>
                  <p className="font-semibold text-sm" style={{ color: '#EAECEF' }}>{title}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#848E9C' }}>{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="relative z-10 grid grid-cols-3 gap-4">
          {STATS.map(({ value, label }) => (
            <div key={label} className="rounded-2xl p-4"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="font-bold text-lg" style={{ color: '#EAECEF' }}>{value}</p>
              <p className="text-xs mt-0.5" style={{ color: '#848E9C' }}>{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12 relative">

        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #6366F1, #06B6D4)' }}>
            <Wallet className="w-4 h-4 text-white" />
          </div>
          <span className="text-white font-bold text-lg">FinanceFlow</span>
        </div>

        <div className="w-full" style={{ maxWidth: tab === 'register' ? 480 : 420 }}>

          {/* Tab switcher */}
          <div className="flex mb-8 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
            {(['login', 'register'] as const).map(t => (
              <button key={t} onClick={() => switchTab(t)}
                className="flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 capitalize"
                style={{
                  background: tab === t ? 'rgba(99,102,241,0.15)' : 'transparent',
                  color: tab === t ? '#818CF8' : '#848E9C',
                  border: tab === t ? '1px solid rgba(99,102,241,0.25)' : '1px solid transparent',
                }}>
                {t === 'login' ? 'Log In' : 'Create Account'}
              </button>
            ))}
          </div>

          {/* Form content */}
          <AnimatePresence mode="wait">
            {tab === 'login' ? (
              <motion.div key="login"
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.22 }}>
                <LoginForm
                  email={email} password={password} showPassword={showPwd} loading={loading}
                  onEmailChange={setEmail} onPasswordChange={setPassword}
                  onTogglePassword={() => setShowPwd(v => !v)}
                  onSubmit={handleLogin}
                  onSwitchToRegister={() => switchTab('register')}
                />
              </motion.div>
            ) : (
              <motion.div key="register"
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.22 }}>
                <MultiStepSignUpForm
                  registrationData={regData}
                  onRegistrationDataChange={setRegData}
                  showPassword={showRegPwd}
                  showConfirmPassword={showRegConf}
                  loading={loading}
                  acceptTerms={acceptTerms}
                  onTogglePassword={() => setShowRegPwd(v => !v)}
                  onToggleConfirmPassword={() => setShowRegConf(v => !v)}
                  onAcceptTermsChange={setAcceptTerms}
                  onShowTerms={() => setShowTermsModal(true)}
                  onSubmit={handleRegister}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Trust bar */}
          <div className="mt-8 flex items-center justify-center gap-5">
            {[
              { icon: ShieldCheck, label: 'Secure' },
              { icon: Globe,       label: 'Private' },
              { icon: Star,        label: 'Trusted' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-1.5">
                <Icon style={{ color: '#5a6272', width: 13, height: 13 }} />
                <span className="text-xs" style={{ color: '#5a6272' }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <TermsModal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        onAccept={() => { setAcceptTerms(true); setShowTermsModal(false) }}
      />
    </div>
  )
}
