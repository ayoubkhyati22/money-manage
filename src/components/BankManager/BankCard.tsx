import { Building2, Edit2, Trash2, Eye, EyeOff, MoreVertical } from 'lucide-react'
import { Bank } from '../../types/bank'
import { motion } from 'framer-motion'
import { useState } from 'react'

interface BankCardProps {
  bank: Bank
  index: number
  isBalanceHidden: boolean
  onEdit: (bank: Bank) => void
  onDelete: (bank: Bank) => void
  onToggleVisibility: (bankId: string) => void
}

const cardGradients = [
  'from-slate-800 via-slate-900 to-slate-950',
  'from-primary-700 via-primary-800 to-primary-900',
  'from-accent-700 via-accent-800 to-accent-900',
  'from-success-700 via-success-800 to-success-900',
]

export function BankCard({
  bank,
  index,
  isBalanceHidden,
  onEdit,
  onDelete,
  onToggleVisibility
}: BankCardProps) {
  const [showMenu, setShowMenu] = useState(false)
  const gradient = cardGradients[index % cardGradients.length]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.3 }}
      className="group relative"
    >
      {/* Card */}
      <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${gradient} p-6 h-48 shadow-lg hover:shadow-xl transition-shadow duration-300`}>
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full translate-y-1/2 -translate-x-1/2"></div>
        </div>

        {/* Shine Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col">
          {/* Header */}
          <div className="flex items-start justify-between mb-auto">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
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

            {/* Actions Menu */}
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <MoreVertical className="w-4 h-4 text-white/70" />
              </button>

              {showMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute right-0 top-full mt-1 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 py-1 z-20 min-w-[140px]"
                  >
                    <button
                      onClick={() => { onToggleVisibility(bank.id); setShowMenu(false); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                    >
                      {isBalanceHidden ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      {isBalanceHidden ? 'Show Balance' : 'Hide Balance'}
                    </button>
                    <button
                      onClick={() => { onEdit(bank); setShowMenu(false); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => { onDelete(bank); setShowMenu(false); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-danger-600 dark:text-danger-400 hover:bg-danger-50 dark:hover:bg-danger-900/20"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </motion.div>
                </>
              )}
            </div>
          </div>

          {/* Balance */}
          <div>
            <p className="text-white/50 text-xs mb-1">Available Balance</p>
            <div className="flex items-baseline gap-2">
              {isBalanceHidden ? (
                <div className="flex gap-1.5">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-2 h-2 bg-white/30 rounded-full" />
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
                    maximumFractionDigits: 2
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
