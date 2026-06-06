import {
  ArrowLeft, Edit2, Trash2, Building2, Eye, EyeOff,
  ArrowDownLeft, ArrowUpRight, Receipt
} from 'lucide-react'
import { Bank, BankFormData } from '../../types/bank'
import { BankForm } from './BankForm'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

interface BankDetailProps {
  bank: Bank
  banks: Bank[]
  index: number
  isBalanceHidden: boolean
  onToggleVisibility: () => void
  showEditForm: boolean
  formData: BankFormData
  editingBank: Bank | null
  loading: boolean
  onEdit: () => void
  onSubmit: (e: React.FormEvent) => void
  onFormChange: (data: BankFormData) => void
  onCancelEdit: () => void
  onDelete: () => void
  onBack: () => void
  onNavigate: (bankId: string) => void
}

interface BankTransaction {
  id: string
  amount: number
  description: string
  created_at: string
  objective_name: string
}

const cardGradients = [
  'from-slate-800 via-slate-900 to-slate-950',
  'from-primary-700 via-primary-800 to-primary-900',
  'from-accent-700 via-accent-800 to-accent-900',
  'from-success-700 via-success-800 to-success-900',
]

// Solid accent colours matching each gradient — used for animated circle buttons & text
const accentColors = ['#475569', '#0d9488', '#ea580c', '#16a34a']

const slideVariants = {
  enter: (dir: 'left' | 'right') => ({
    x: dir === 'left' ? '110%' : '-110%',
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (dir: 'left' | 'right') => ({
    x: dir === 'left' ? '-110%' : '110%',
    opacity: 0,
  }),
}

export function BankDetail({
  bank, banks, index, isBalanceHidden, onToggleVisibility,
  showEditForm, formData, editingBank, loading,
  onEdit, onSubmit, onFormChange, onCancelEdit,
  onDelete, onBack, onNavigate,
}: BankDetailProps) {
  const [swipeDir, setSwipeDir] = useState<'left' | 'right'>('left')
  const [transactions, setTransactions] = useState<BankTransaction[]>([])
  const [txLoading, setTxLoading] = useState(true)

  const currentIdx = banks.findIndex(b => b.id === bank.id)
  const gradient = cardGradients[currentIdx % cardGradients.length]
  const accentColor = accentColors[currentIdx % accentColors.length]
  const canPrev = currentIdx > 0
  const canNext = currentIdx < banks.length - 1

  const navigate = (dir: 'prev' | 'next') => {
    const newIdx = dir === 'next' ? currentIdx + 1 : currentIdx - 1
    if (newIdx < 0 || newIdx >= banks.length) return
    if (showEditForm) onCancelEdit()
    setSwipeDir(dir === 'next' ? 'left' : 'right')
    onNavigate(banks[newIdx].id)
  }

  const goTo = (idx: number) => {
    if (idx === currentIdx) return
    if (showEditForm) onCancelEdit()
    setSwipeDir(idx > currentIdx ? 'left' : 'right')
    onNavigate(banks[idx].id)
  }

  // Reload transactions whenever the bank changes
  useEffect(() => {
    let cancelled = false
    setTxLoading(true)
    setTransactions([])

    supabase
      .from('objectives_transactions')
      .select('id, amount, description, created_at, goals:objective_id(name)')
      .eq('bank_id', bank.id)
      .order('created_at', { ascending: false })
      .limit(30)
      .then(({ data }) => {
        if (cancelled) return
        setTransactions(
          (data || []).map((t: any) => ({
            id: t.id,
            amount: Number(t.amount),
            description: t.description || '',
            created_at: t.created_at,
            objective_name: t.goals?.name || '—',
          }))
        )
        setTxLoading(false)
      })

    return () => { cancelled = true }
  }, [bank.id])

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="space-y-6"
    >
      {/* Back */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        All Banks
      </button>

      {/* ── Card + navigation ── */}
      <div className="flex flex-col items-center gap-2">
        {/* Card (swipeable) */}
        <div className="w-full max-w-sm overflow-hidden">
          <AnimatePresence custom={swipeDir} mode="wait">
            <motion.div
              key={bank.id}
              custom={swipeDir}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              drag={banks.length > 1 ? 'x' : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.18}
              whileDrag={{ scale: 0.97, cursor: 'grabbing' }}
              onDragEnd={(_, info) => {
                if (info.offset.x < -60) navigate('next')
                else if (info.offset.x > 60) navigate('prev')
              }}
              className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${gradient} p-7 shadow-md select-none`}
            >
              {/* BG circles */}
              <div className="absolute inset-0 opacity-10 pointer-events-none">
                <div className="absolute top-0 right-0 w-48 h-48 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-36 h-36 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
              </div>

              <div className="relative z-10">
                {/* Identity */}
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                    {bank.logo
                      ? <img src={bank.logo} alt={bank.name} className="w-8 h-8 object-contain" />
                      : <Building2 className="w-7 h-7 text-white" />}
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-xl">{bank.name}</h3>
                    <p className="text-white/50 text-sm">Bank Account</p>
                  </div>
                </div>

                {/* Balance */}
                <div>
                  <p className="text-white/50 text-xs mb-2">Available Balance</p>
                  <div className="flex items-center gap-3">
                    {isBalanceHidden ? (
                      <div className="flex gap-2 items-center h-10">
                        {[...Array(6)].map((_, i) => (
                          <span key={i} className="w-2.5 h-2.5 bg-white/30 rounded-full inline-block" />
                        ))}
                      </div>
                    ) : (
                      <span className="text-4xl font-bold text-white tracking-tight">
                        {Number(bank.balance).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    )}
                    <span className="text-white/60 text-base font-medium">MAD</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Dot indicators */}
        {banks.length > 1 && (
          <div className="flex items-center justify-center gap-3" style={{ height: 20 }}>
            {banks.map((b, i) => (
              <motion.div
                key={b.id}
                onClick={() => goTo(i)}
                animate={i === currentIdx ? {
                  width: 10,
                  height: 10,
                  backgroundColor: 'transparent',
                  boxShadow: `0 0 0 2px ${accentColor}`,
                  opacity: 1,
                } : {
                  width: 6,
                  height: 6,
                  backgroundColor: '#94a3b8',
                  boxShadow: '0 0 0 0px transparent',
                  opacity: 0.5,
                }}
                transition={{ duration: 0.3 }}
                style={{ borderRadius: '50%', flexShrink: 0, cursor: 'pointer' }}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Actions or edit form ── */}
      <AnimatePresence mode="wait">
        {showEditForm ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
          >
            <BankForm
              formData={formData}
              editingBank={editingBank}
              loading={loading}
              onSubmit={onSubmit}
              onChange={onFormChange}
              onCancel={onCancelEdit}
            />
          </motion.div>
        ) : (
          <motion.div
            key="actions"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
            className="flex justify-center gap-10"
          >
            {/* Show / Hide */}
            <button onClick={onToggleVisibility} className="flex flex-col items-center gap-2">
              <motion.div
                animate={{ backgroundColor: accentColor }}
                transition={{ duration: 0.35, ease: 'easeInOut' }}
                className="w-12 h-12 rounded-full flex items-center justify-center"
              >
                {isBalanceHidden
                  ? <Eye className="w-5 h-5 text-white" />
                  : <EyeOff className="w-5 h-5 text-white" />}
              </motion.div>
              <motion.span
                animate={{ color: accentColor }}
                transition={{ duration: 0.35 }}
                className="text-xs font-medium"
              >
                {isBalanceHidden ? 'Show' : 'Hide'}
              </motion.span>
            </button>

            {/* Edit */}
            <button onClick={onEdit} className="flex flex-col items-center gap-2">
              <motion.div
                animate={{ backgroundColor: accentColor }}
                transition={{ duration: 0.35, ease: 'easeInOut' }}
                className="w-12 h-12 rounded-full flex items-center justify-center"
              >
                <Edit2 className="w-5 h-5 text-white" />
              </motion.div>
              <motion.span
                animate={{ color: accentColor }}
                transition={{ duration: 0.35 }}
                className="text-xs font-medium"
              >
                Edit
              </motion.span>
            </button>

            {/* Delete */}
            <button onClick={onDelete} className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-colors">
                <Trash2 className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs font-medium text-red-500 dark:text-red-400">Delete</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Transactions ── */}
      <div className="glass-card overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center gap-3">
          <motion.div
            animate={{ backgroundColor: accentColor }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            className="w-8 h-8 rounded-lg flex items-center justify-center"
          >
            <Receipt className="w-4 h-4 text-white" />
          </motion.div>
          <h4 className="font-semibold text-sm text-slate-800 dark:text-white">Transactions</h4>
        </div>

        <AnimatePresence mode="wait">
          {txLoading ? (
            <motion.div
              key="skeleton"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-6 space-y-3"
            >
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex-shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 w-3/4 bg-slate-200 dark:bg-slate-700 rounded" />
                    <div className="h-2.5 w-1/2 bg-slate-200 dark:bg-slate-700 rounded" />
                  </div>
                  <div className="h-3 w-16 bg-slate-200 dark:bg-slate-700 rounded" />
                </div>
              ))}
            </motion.div>
          ) : transactions.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="py-10 text-center"
            >
              <Receipt className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-sm text-slate-500 dark:text-slate-400">No transactions yet</p>
            </motion.div>
          ) : (
            <motion.ul
              key={bank.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22 }}
              className="divide-y divide-slate-100 dark:divide-slate-700/60"
            >
              {transactions.map((tx, i) => {
                const isDebit = tx.amount < 0
                return (
                  <motion.li
                    key={tx.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="flex items-center gap-3 px-4 py-3"
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isDebit ? 'bg-red-100 dark:bg-red-900/30' : 'bg-emerald-100 dark:bg-emerald-900/30'
                    }`}>
                      {isDebit
                        ? <ArrowDownLeft className="w-4 h-4 text-red-500" />
                        : <ArrowUpRight className="w-4 h-4 text-emerald-500" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">
                        {tx.objective_name}
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 truncate">
                        {tx.description || new Date(tx.created_at).toLocaleDateString('en-US', {
                          day: 'numeric', month: 'short', year: 'numeric',
                        })}
                      </p>
                    </div>

                    <div className="text-right flex-shrink-0">
                      {isBalanceHidden ? (
                        <div className="flex gap-1 justify-end items-center h-5">
                          {[...Array(4)].map((_, j) => (
                            <span key={j} className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600 inline-block" />
                          ))}
                        </div>
                      ) : (
                        <>
                          <p className={`text-sm font-semibold ${isDebit ? 'text-red-500' : 'text-emerald-500'}`}>
                            {isDebit ? '-' : '+'}{Math.abs(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </p>
                          <p className="text-[10px] text-slate-400">MAD</p>
                        </>
                      )}
                    </div>
                  </motion.li>
                )
              })}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
