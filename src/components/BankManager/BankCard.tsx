import { Building2, Eye, EyeOff } from 'lucide-react'
import { Bank } from '../../types/bank'
import { motion } from 'framer-motion'

interface BankCardProps {
  bank: Bank
  index: number
  isBalanceHidden: boolean
  onToggleVisibility: (bankId: string) => void
  onClick: () => void
}

const cardGradients = [
  'from-slate-800 via-slate-900 to-slate-950',
  'from-primary-700 via-primary-800 to-primary-900',
  'from-accent-700 via-accent-800 to-accent-900',
  'from-success-700 via-success-800 to-success-900',
]

export function BankCard({ bank, index, isBalanceHidden, onToggleVisibility, onClick }: BankCardProps) {
  const gradient = cardGradients[index % cardGradients.length]

  return (
    <motion.div
      whileHover={{ y: -3, transition: { duration: 0.18 } }}
      whileTap={{ scale: 0.98 }}
      className="group relative cursor-pointer"
      onClick={onClick}
    >
      <div
        className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${gradient} p-5 shadow-md`}
      >
        {/* Background circles */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
        </div>
        {/* Shine sweep */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />

        <div className="relative z-10 flex flex-col gap-4">
          {/* Header row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                {bank.logo ? (
                  <img src={bank.logo} alt={bank.name} className="w-6 h-6 object-contain" />
                ) : (
                  <Building2 className="w-5 h-5 text-white" />
                )}
              </div>
              <div>
                <h4 className="text-white font-semibold text-sm">{bank.name}</h4>
                <p className="text-white/50 text-xs">Bank Account</p>
              </div>
            </div>

            <button
              onClick={(e) => { e.stopPropagation(); onToggleVisibility(bank.id) }}
              className="p-1.5 hover:opacity-70 transition-opacity"
            >
              {isBalanceHidden
                ? <Eye className="w-3.5 h-3.5 text-white" />
                : <EyeOff className="w-3.5 h-3.5 text-white" />}
            </button>
          </div>

          {/* Balance */}
          <div>
            <p className="text-white/50 text-xs mb-1">Available Balance</p>
            <div className="flex items-baseline gap-2">
              {isBalanceHidden ? (
                <div className="flex gap-1.5 items-center h-7">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-1.5 h-1.5 bg-white/30 rounded-full" />
                  ))}
                </div>
              ) : (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-2xl font-bold text-white tracking-tight"
                >
                  {Number(bank.balance).toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </motion.span>
              )}
              <span className="text-white/70 text-sm font-medium">MAD</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
