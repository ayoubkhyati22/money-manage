import { useState, useEffect } from 'react'
import { Bank, Goal, TransactionWithDetails, ObjectiveWithAmount } from '../../lib/supabase'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'
import {
  Wallet,
  TrendingUp,
  Target,
  Building2,
  ArrowDownRight,
  ArrowUpRight,
  Eye,
  EyeOff,
  ChevronRight,
  Sparkles,
  PieChart,
  BarChart3
} from 'lucide-react'
import { motion } from 'framer-motion'
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

  useEffect(() => {
    loadObjectiveAmounts()
  }, [goals])

  useEffect(() => {
    if (user) {
      loadStockGains()
    }
  }, [user])

  const loadStockGains = async () => {
    if (!user) return
    try {
      const gains = await stockService.calculateTotalGains(user.id)
      setStockGains(gains)
    } catch (error) {
      console.error('Error loading stock gains:', error)
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
        .select(`
          objective_id,
          amount,
          description,
          created_at,
          banks:bank_id(name)
        `)
        .in('objective_id', goals.map(g => g.id))

      if (error) throw error

      const objectivesWithAmounts: ObjectiveWithAmount[] = goals.map(goal => {
        const goalTransactions = transactions?.filter(t => t.objective_id === goal.id) || []
        const total = goalTransactions.reduce((sum, trans) => sum + Number(trans.amount), 0)

        return {
          ...goal,
          total_amount: total,
          transactions: goalTransactions.map(trans => ({
            bank_name: (trans.banks as any)?.name || 'Unknown',
            amount: Number(trans.amount),
            description: trans.description || '',
            created_at: trans.created_at
          })),
        }
      })

      const sortedObjectives = objectivesWithAmounts.sort((a, b) => {
        const percentA = a.target_amount ? (a.total_amount / a.target_amount) * 100 : 0
        const percentB = b.target_amount ? (b.total_amount / b.target_amount) * 100 : 0
        return percentB - percentA
      })

      setObjectivesWithAmounts(sortedObjectives)
    } catch (error: any) {
      console.error('Error loading objective amounts:', error)
      toast.error('Error loading data: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const totalBalance = banks.reduce((sum, bank) => sum + Number(bank.balance), 0)
  const totalSaved = objectivesWithAmounts.reduce((sum, obj) => sum + Math.max(0, obj.total_amount), 0)
  const totalWithdrawn = objectivesWithAmounts.reduce((sum, obj) => {
    const withdrawnAmount = obj.transactions
      .filter(trans => trans.amount < 0)
      .reduce((transSum, trans) => transSum + Math.abs(trans.amount), 0)
    return sum + withdrawnAmount
  }, 0)

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="glass-card p-6 animate-pulse">
          <div className="h-8 w-48 bg-slate-200 dark:bg-slate-700 rounded-lg mb-4"></div>
          <div className="h-12 w-64 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="glass-card p-5 animate-pulse">
              <div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded mb-3"></div>
              <div className="h-8 w-24 bg-slate-200 dark:bg-slate-700 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Hero Balance Card */}
      <motion.div
        variants={itemVariants}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-600 via-primary-700 to-accent-700 p-6 lg:p-8 text-white shadow-xl"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full translate-y-1/2 -translate-x-1/2"></div>
        </div>

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Wallet className="w-6 h-6" />
              </div>
              <div>
                <p className="text-white/70 text-sm font-medium">Total Balance</p>
                <p className="text-white/50 text-xs">Across {banks.length} account{banks.length !== 1 ? 's' : ''}</p>
              </div>
            </div>
            <button
              onClick={() => setShowBalance(!showBalance)}
              className="p-2 hover:bg-white/10 rounded-xl transition-colors"
            >
              {showBalance ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          <div className="mb-6">
            <div className="flex items-baseline gap-2">
              <span className={`text-4xl lg:text-5xl font-bold tracking-tight transition-all duration-300 ${
                showBalance ? '' : 'blur-md select-none'
              }`}>
                {showBalance
                  ? totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                  : '********'
                }
              </span>
              <span className="text-xl text-white/70">MAD</span>
            </div>
          </div>

          {/* Quick Stats Row */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <ArrowUpRight className="w-4 h-4 text-success-400" />
                <span className="text-xs text-white/70">Saved</span>
              </div>
              <p className="text-lg font-semibold">
                {totalSaved.toLocaleString('en-US', { minimumFractionDigits: 0 })} MAD
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <ArrowDownRight className="w-4 h-4 text-danger-400" />
                <span className="text-xs text-white/70">Withdrawn</span>
              </div>
              <p className="text-lg font-semibold">
                {totalWithdrawn.toLocaleString('en-US', { minimumFractionDigits: 0 })} MAD
              </p>
            </div>
            <div className="hidden lg:block bg-white/10 backdrop-blur-sm rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-accent-400" />
                <span className="text-xs text-white/70">Active Goals</span>
              </div>
              <p className="text-lg font-semibold">{goals.length}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Banks Card */}
        <div className="glass-card p-5 group hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-accent-100 dark:bg-accent-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Building2 className="w-5 h-5 text-accent-600 dark:text-accent-400" />
            </div>
            <span className="text-xs text-slate-400">Accounts</span>
          </div>
          <p className="text-2xl font-bold text-slate-800 dark:text-white">{banks.length}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">Active Banks</p>
        </div>

        {/* Goals Card */}
        <div className="glass-card p-5 group hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-success-100 dark:bg-success-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Target className="w-5 h-5 text-success-600 dark:text-success-400" />
            </div>
            <span className="text-xs text-slate-400">Objectives</span>
          </div>
          <p className="text-2xl font-bold text-slate-800 dark:text-white">{goals.length}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">Active Goals</p>
        </div>

        {/* Savings Progress Card */}
        <div className="glass-card p-5 group hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
              <TrendingUp className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <span className="text-xs text-slate-400">Savings</span>
          </div>
          <p className="text-2xl font-bold text-slate-800 dark:text-white">
            {totalSaved.toLocaleString('en-US', { minimumFractionDigits: 0 })}
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">MAD Total</p>
        </div>

        {/* Withdrawn Card */}
        <div className="glass-card p-5 group hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-danger-100 dark:bg-danger-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ArrowDownRight className="w-5 h-5 text-danger-600 dark:text-danger-400" />
            </div>
            <span className="text-xs text-slate-400">Withdrawn</span>
          </div>
          <p className="text-2xl font-bold text-slate-800 dark:text-white">
            {totalWithdrawn.toLocaleString('en-US', { minimumFractionDigits: 0 })}
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">MAD Total</p>
        </div>
      </motion.div>

      {/* Banks & Goals Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Banks List */}
        <motion.div variants={itemVariants} className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-accent-500" />
              Your Banks
            </h3>
            <span className="badge-accent">{banks.length}</span>
          </div>

          {banks.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                <Building2 className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-slate-500 dark:text-slate-400">No banks added yet</p>
              <p className="text-sm text-slate-400 dark:text-slate-500">Add your first bank account to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {banks.slice(0, 4).map((bank, index) => (
                <motion.div
                  key={bank.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
                      {bank.logo ? (
                        <img src={bank.logo} alt={bank.name} className="w-6 h-6 object-contain" />
                      ) : (
                        <Building2 className="w-5 h-5 text-white" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-slate-800 dark:text-white">{bank.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Active Account</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-800 dark:text-white">
                      {Number(bank.balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">MAD</p>
                  </div>
                </motion.div>
              ))}
              {banks.length > 4 && (
                <button className="w-full py-3 text-sm text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-xl transition-colors flex items-center justify-center gap-1">
                  View all {banks.length} banks
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </motion.div>

        {/* Goals Progress */}
        <motion.div variants={itemVariants} className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-success-500" />
              Goal Progress
            </h3>
            <span className="badge-success">{objectivesWithAmounts.length}</span>
          </div>

          {objectivesWithAmounts.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                <Target className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-slate-500 dark:text-slate-400">No goals created yet</p>
              <p className="text-sm text-slate-400 dark:text-slate-500">Create your first savings goal</p>
            </div>
          ) : (
            <div className="space-y-4">
              {objectivesWithAmounts.slice(0, 4).map((objective, index) => {
                const progress = objective.target_amount
                  ? Math.min((objective.total_amount / objective.target_amount) * 100, 100)
                  : 0
                const isCompleted = progress >= 100

                return (
                  <motion.div
                    key={objective.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-800 dark:text-white">{objective.name}</span>
                        {isCompleted && (
                          <span className="badge-success text-[10px]">
                            <Sparkles className="w-3 h-3" />
                            Completed
                          </span>
                        )}
                      </div>
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                        {progress.toFixed(0)}%
                      </span>
                    </div>
                    <div className="progress-bar mb-2">
                      <motion.div
                        className={`progress-fill ${isCompleted ? 'bg-gradient-to-r from-success-500 to-success-400' : ''}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1, delay: index * 0.2 }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                      <span>{objective.total_amount.toLocaleString('en-US')} MAD</span>
                      <span>{objective.target_amount?.toLocaleString('en-US')} MAD</span>
                    </div>
                  </motion.div>
                )
              })}
              {objectivesWithAmounts.length > 4 && (
                <button className="w-full py-3 text-sm text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-xl transition-colors flex items-center justify-center gap-1">
                  View all {objectivesWithAmounts.length} goals
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  )
}
