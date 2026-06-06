import { useState, useEffect } from 'react'
import { Bank, Goal, TransactionWithDetails, ObjectiveWithAmount } from '../../lib/supabase'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'
import {
  TrendingUp,
  Target,
  Building2,
  ArrowDownRight,
  Eye,
  EyeOff,
  ChevronRight,
  ArrowDownCircle,
  History,
  Wallet,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../hooks/useAuth'
import { stockService } from '../../services/stockService'

interface OverviewCardsProps {
  banks: Bank[]
  goals: Goal[]
  transactions: TransactionWithDetails[]
}

export function OverviewCards({ banks, goals }: OverviewCardsProps) {
  const [objectivesWithAmounts, setObjectivesWithAmounts] = useState<ObjectiveWithAmount[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const [stockGains, setStockGains] = useState(0)
  const [showBalance, setShowBalance] = useState(false)
  const [activeTab, setActiveTab] = useState<'accounts' | 'goals'>('accounts')
  const [showAllAccounts, setShowAllAccounts] = useState(false)
  const [showAllGoals, setShowAllGoals] = useState(false)

  useEffect(() => { loadObjectiveAmounts() }, [goals])
  useEffect(() => { if (user) loadStockGains() }, [user])

  const loadStockGains = async () => {
    if (!user) return
    try {
      const gains = await stockService.calculateTotalGains(user.id)
      setStockGains(gains)
    } catch (e) {
      console.error(e)
    }
  }

  const loadObjectiveAmounts = async () => {
    try {
      if (goals.length === 0) {
        setObjectivesWithAmounts([])
        setLoading(false)
        return
      }

      const { data: transactions, error } = await supabase
        .from('objectives_transactions')
        .select('objective_id, amount, description, created_at, banks:bank_id(name)')
        .in('objective_id', goals.map(g => g.id))

      if (error) throw error

      const withAmounts: ObjectiveWithAmount[] = goals.map(goal => {
        const goalTx = transactions?.filter(t => t.objective_id === goal.id) || []
        return {
          ...goal,
          total_amount: goalTx.reduce((s, t) => s + Number(t.amount), 0),
          transactions: goalTx.map(t => ({
            bank_name: (t.banks as any)?.name || 'Unknown',
            amount: Number(t.amount),
            description: t.description || '',
            created_at: t.created_at,
          })),
        }
      }).sort((a, b) => {
        const pa = a.target_amount ? (a.total_amount / a.target_amount) * 100 : 0
        const pb = b.target_amount ? (b.total_amount / b.target_amount) * 100 : 0
        return pb - pa
      })

      setObjectivesWithAmounts(withAmounts)
    } catch (error: any) {
      toast.error('Error loading data: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const navigate = (tab: string) =>
    window.dispatchEvent(new CustomEvent('tabChange', { detail: tab }))

  const totalBalance = banks.reduce((s, b) => s + Number(b.balance), 0)
  const totalSaved = objectivesWithAmounts.reduce((s, o) => s + Math.max(0, o.total_amount), 0)
  const totalWithdrawn = objectivesWithAmounts.reduce((s, o) =>
    s + o.transactions.filter(t => t.amount < 0).reduce((ts, t) => ts + Math.abs(t.amount), 0), 0)

  const fade = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="h-52 rounded-3xl bg-slate-200 dark:bg-slate-700 animate-pulse" />
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map(i => <div key={i} className="h-24 rounded-2xl bg-slate-200 dark:bg-slate-700 animate-pulse" />)}
        </div>
        <div className="h-48 rounded-2xl bg-slate-200 dark:bg-slate-700 animate-pulse" />
        <div className="h-48 rounded-2xl bg-slate-200 dark:bg-slate-700 animate-pulse" />
      </div>
    )
  }

  return (
    <motion.div
      className="space-y-5"
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
    >
      {/* ── Hero Balance Card ── */}
      <motion.div
        variants={fade}
        className="relative overflow-hidden rounded-3xl p-6 lg:p-8 text-white"
        style={{
          background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 45%, #0891b2 100%)',
        }}
      >
        {/* Subtle mesh overlay */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage:
            'radial-gradient(at 20% 10%, rgba(255,255,255,0.12) 0, transparent 55%),' +
            'radial-gradient(at 85% 80%, rgba(255,255,255,0.07) 0, transparent 50%)',
        }} />
        {/* Decorative ring */}
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full border border-white/10 pointer-events-none" />

        <div className="relative z-10">
          {/* Label + eye */}
          <div className="flex items-center justify-between mb-1">
            <p className="text-white/50 text-xs font-semibold tracking-widest uppercase">Total Assets</p>
            <button
              onClick={() => setShowBalance(v => !v)}
              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            >
              {showBalance
                ? <EyeOff className="w-4 h-4 text-white/60" />
                : <Eye className="w-4 h-4 text-white/60" />}
            </button>
          </div>

          {/* Balance */}
          <div className="mb-1">
            <div className="flex items-baseline gap-2">
              {showBalance ? (
                <span className="text-4xl lg:text-5xl font-bold tracking-tight">
                  {totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              ) : (
                <div className="flex items-center gap-3 h-12">
                  {[...Array(4)].map((_, i) => (
                    <span key={i} className="w-4 h-4 bg-white/40 rounded-full inline-block" />
                  ))}
                </div>
              )}
              <span className="text-lg text-white/50 font-medium">MAD</span>
            </div>
          </div>
          <p className="text-white/35 text-xs mb-7">
            {banks.length} connected account{banks.length !== 1 ? 's' : ''}
          </p>

          {/* Quick Actions */}
          <div className="flex justify-around">
            {[
              { icon: Building2,      label: 'Banks',    tab: 'banks' },
              { icon: Target,         label: 'Goals',    tab: 'goals' },
              { icon: ArrowDownCircle,label: 'Withdraw', tab: 'transactions' },
              { icon: History,        label: 'History',  tab: 'history' },
            ].map(({ icon: Icon, label, tab }) => (
              <button
                key={tab}
                onClick={() => navigate(tab)}
                className="flex flex-col items-center gap-2 group"
              >
                <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/25 transition-colors">
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-[11px] text-white/60 font-medium">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ── Stats Row ── */}
      <motion.div variants={fade} className="grid grid-cols-3 gap-3">
        {[
          {
            label: 'Saved', value: totalSaved.toLocaleString('en-US', { maximumFractionDigits: 0 }),
            unit: 'MAD', icon: TrendingUp, color: 'text-success-500', bg: 'bg-success-500/10 dark:bg-success-500/15',
          },
          {
            label: 'Goals', value: goals.length, unit: 'active',
            icon: Target, color: 'text-primary-500', bg: 'bg-primary-500/10 dark:bg-primary-500/15',
          },
          {
            label: 'Spent', value: totalWithdrawn.toLocaleString('en-US', { maximumFractionDigits: 0 }),
            unit: 'MAD', icon: ArrowDownRight, color: 'text-danger-500', bg: 'bg-danger-500/10 dark:bg-danger-500/15',
          },
        ].map(({ label, value, unit, icon: Icon, color, bg }) => (
          <div key={label} className="glass-card p-4">
            <div className={`w-8 h-8 rounded-xl ${bg} flex items-center justify-center mb-3`}>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <p className="text-base font-bold text-slate-800 dark:text-white leading-tight">{value}</p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{label} · {unit}</p>
          </div>
        ))}
      </motion.div>

      {/* ── Accounts / Goals Tabs ── */}
      <motion.div variants={fade} className="glass-card overflow-hidden">
        {/* Tab bar */}
        <div className="flex items-center border-b border-slate-100 dark:border-slate-700/60 px-5 pt-4 gap-6">
          {(['accounts', 'goals'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="relative pb-3 text-sm font-semibold capitalize transition-colors"
              style={{ color: activeTab === tab ? undefined : undefined }}
            >
              <span className={activeTab === tab
                ? 'text-primary-600 dark:text-primary-400'
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
              }>
                {tab === 'accounts' ? 'Accounts' : 'Goals'}
              </span>
              {activeTab === tab && (
                <motion.div
                  layoutId="tabUnderline"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500 rounded-full"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          ))}
          <div className="flex-1" />
          <button
            onClick={() => {
              if (activeTab === 'accounts') setShowAllAccounts(v => !v)
              else setShowAllGoals(v => !v)
            }}
            className="flex items-center gap-0.5 text-xs text-primary-500 hover:text-primary-600 transition-colors pb-3"
          >
            {(activeTab === 'accounts' ? showAllAccounts : showAllGoals) ? 'Show less' : 'See all'}
            <ChevronRight className={`w-3.5 h-3.5 transition-transform ${(activeTab === 'accounts' ? showAllAccounts : showAllGoals) ? 'rotate-90' : ''}`} />
          </button>
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          {activeTab === 'accounts' ? (
            <motion.div
              key="accounts"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              {banks.length === 0 ? (
                <div className="py-10 text-center text-sm text-slate-400 dark:text-slate-500">
                  No bank accounts added yet
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
                  {(showAllAccounts ? banks : banks.slice(0, 4)).map((bank, i) => (
                    <div
                      key={bank.id}
                      className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
                    >
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center flex-shrink-0">
                        {bank.logo
                          ? <img src={bank.logo} alt={bank.name} className="w-5 h-5 object-contain" />
                          : <Building2 className="w-4 h-4 text-white" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 dark:text-white truncate">{bank.name}</p>
                        <p className="text-[11px] text-slate-400">Bank Account</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        {showBalance ? (
                          <>
                            <p className="text-sm font-semibold text-slate-800 dark:text-white">
                              {Number(bank.balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </p>
                            <p className="text-[10px] text-slate-400">MAD</p>
                          </>
                        ) : (
                          <div className="flex items-center gap-1.5 justify-end h-5">
                            {[...Array(4)].map((_, j) => (
                              <span key={j} className="w-2 h-2 bg-slate-300 dark:bg-slate-500 rounded-full inline-block" />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="goals"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              {objectivesWithAmounts.length === 0 ? (
                <div className="py-10 text-center text-sm text-slate-400 dark:text-slate-500">
                  No goals created yet
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
                  {(showAllGoals ? objectivesWithAmounts : objectivesWithAmounts.slice(0, 4)).map((obj, i) => {
                    const progress = obj.target_amount
                      ? Math.min((obj.total_amount / obj.target_amount) * 100, 100)
                      : 0
                    const done = progress >= 100
                    return (
                      <div key={obj.id} className="px-5 py-4">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium text-slate-800 dark:text-white truncate flex-1 mr-3">
                            {obj.name}
                          </p>
                          <span className={`text-xs font-bold flex-shrink-0 ${done ? 'text-success-500' : 'text-primary-500'}`}>
                            {progress.toFixed(0)}%
                          </span>
                        </div>
                        <div className="h-1.5 bg-slate-100 dark:bg-slate-700/80 rounded-full overflow-hidden">
                          <motion.div
                            className={`h-full rounded-full ${done ? 'bg-success-500' : 'bg-gradient-to-r from-primary-500 to-accent-500'}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.9, delay: i * 0.1, ease: 'easeOut' }}
                          />
                        </div>
                        <div className="flex justify-between mt-1.5">
                          <span className="text-[10px] text-slate-400">{obj.total_amount.toLocaleString('en-US')} MAD</span>
                          <span className="text-[10px] text-slate-400">{obj.target_amount?.toLocaleString('en-US')} MAD</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}
