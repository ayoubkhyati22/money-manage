import { motion, AnimatePresence } from 'framer-motion'
import { X, FileText, ShieldCheck, Lock, Users, AlertCircle, Check } from 'lucide-react'

interface TermsModalProps {
  isOpen: boolean
  onClose: () => void
  onAccept: () => void
}

const TERMS = [
  {
    icon: ShieldCheck, color: '#0ECB81',
    title: 'Personal Finance Management',
    desc: 'Track funds across banks, set goals, and manage transactions securely within the platform.',
  },
  {
    icon: Lock, color: '#6366F1',
    title: 'Privacy & Data Security',
    desc: 'Your data is encrypted with 256-bit SSL. We never sell or share your information with third parties.',
  },
  {
    icon: Users, color: '#06B6D4',
    title: 'Account Responsibility',
    desc: 'You are responsible for maintaining the security of your account credentials and data accuracy.',
  },
  {
    icon: AlertCircle, color: '#F0B90B',
    title: 'Service Availability',
    desc: 'Service is provided "as is." We strive for 99.9% uptime and apply industry-standard protections.',
  },
]

export function TermsModal({ isOpen, onClose, onAccept }: TermsModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[9990] flex items-center justify-center p-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)' }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.88, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.88, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 420, damping: 32 }}
            onClick={e => e.stopPropagation()}
            className="w-full overflow-hidden"
            style={{
              maxWidth: 480,
              background: 'linear-gradient(160deg, #1c2028 0%, #13161c 100%)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '20px',
              boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
            }}
          >
            {/* Top line */}
            <div className="h-[2px]" style={{ background: 'linear-gradient(90deg, transparent, #6366F1, transparent)' }} />

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.2)' }}>
                  <FileText style={{ color: '#818CF8', width: 18, height: 18 }} />
                </div>
                <div>
                  <p className="font-bold text-sm" style={{ color: '#EAECEF' }}>Terms & Privacy Policy</p>
                  <p className="text-xs" style={{ color: '#848E9C' }}>FinanceFlow Service Agreement</p>
                </div>
              </div>
              <button onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                style={{ color: '#5a6272' }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.08)'; (e.currentTarget as HTMLButtonElement).style.color = '#EAECEF' }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = '#5a6272' }}>
                <X style={{ width: 16, height: 16 }} />
              </button>
            </div>

            {/* Content */}
            <div className="px-6 py-5 space-y-3 max-h-[60vh] overflow-y-auto"
              style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}>
              {TERMS.map(({ icon: Icon, color, title, desc }) => (
                <div key={title} className="flex items-start gap-3 p-4 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: `${color}15` }}>
                    <Icon style={{ color, width: 16, height: 16 }} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold mb-0.5" style={{ color: '#EAECEF' }}>{title}</p>
                    <p className="text-xs leading-relaxed" style={{ color: '#848E9C' }}>{desc}</p>
                  </div>
                </div>
              ))}

              <div className="px-4 py-3 rounded-xl text-center"
                style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)' }}>
                <p className="text-xs" style={{ color: '#848E9C' }}>
                  Full terms available at <span style={{ color: '#818CF8' }}>financeflow.app/terms</span>
                  <span className="mx-2 opacity-40">·</span>
                  Last updated {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-5 flex items-center gap-3"
              style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <button onClick={onClose}
                className="flex-1 h-11 rounded-xl text-sm font-semibold transition-all"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', color: '#848E9C' }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.1)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.06)' }}>
                Close
              </button>
              <button onClick={onAccept}
                className="flex-1 h-11 rounded-xl text-sm font-bold flex items-center justify-center gap-2"
                style={{
                  background: 'linear-gradient(135deg, #6366F1, #4F46E5)',
                  color: '#fff',
                  border: 'none',
                  boxShadow: '0 4px 16px rgba(99,102,241,0.35)',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 6px 24px rgba(99,102,241,0.5)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 16px rgba(99,102,241,0.35)' }}>
                <Check style={{ width: 15, height: 15 }} />
                Accept & Continue
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
