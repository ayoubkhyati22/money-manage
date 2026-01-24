import { useState, useEffect } from 'react'
import { Bank, Goal, TransactionWithDetails, supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { BankManager } from './BankManager'
import { GoalManager } from './GoalManager/index'
import { TransactionManager } from './TransactionManager'
import { TransactionHistory } from './TransactionHistory'
import { OverviewCards } from './OverviewCards/index'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'

type ActiveTab = 'overview' | 'goals' | 'banks' | 'transactions' | 'history' | 'dca' | 'stocks'

export function Dashboard() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview')
  const [banks, setBanks] = useState<Bank[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [transactions, setTransactions] = useState<TransactionWithDetails[]>([])
  const [loading, setLoading] = useState(true)

  // Listen for tab changes from Layout
  useEffect(() => {
    const handleTabChange = (event: CustomEvent<ActiveTab>) => {
      setActiveTab(event.detail)
    }

    window.addEventListener('tabChange', handleTabChange as EventListener)
    return () => window.removeEventListener('tabChange', handleTabChange as EventListener)
  }, [])

  useEffect(() => {
    if (user) loadAllData()
  }, [user])

  const loadAllData = async () => {
    if (!user) return
    setLoading(true)
    try {
      await Promise.all([loadBanks(), loadGoals(), loadTransactions()])
    } catch (error: any) {
      console.error(error)
      toast.error('Error loading data: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const loadBanks = async () => {
    const { data, error } = await supabase.from('banks').select('*').order('created_at', { ascending: false })
    if (!error) setBanks(data || [])
  }

  const loadGoals = async () => {
    const { data, error } = await supabase.from('goals').select('*').order('created_at', { ascending: false })
    if (!error) setGoals(data || [])
  }

  const loadTransactions = async () => {
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        banks:bank_id(name),
        transaction_goals(amount, goals:goal_id(name))
      `)
      .order('created_at', { ascending: false })
      .limit(10)

    if (!error) {
      const mapped: TransactionWithDetails[] =
        data?.map((t) => ({
          id: t.id,
          user_id: t.user_id,
          bank_id: t.bank_id,
          total_amount: Number(t.total_amount),
          description: t.description || '',
          created_at: t.created_at,
          bank_name: (t.banks as any)?.name || 'Unknown Bank',
          transaction_goals:
            t.transaction_goals?.map((tg: any) => ({
              goal_name: tg.goals?.name || 'Unknown Goal',
              amount: Number(tg.amount),
            })) || [],
        })) || []
      setTransactions(mapped)
    }
  }

  const refreshAllData = () => loadAllData()

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    enter: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewCards banks={banks} goals={goals} transactions={transactions} />
      case 'goals':
        return (
          <GoalManager
            goals={goals}
            banks={banks}
            onUpdate={(updated) => {
              setGoals(updated)
              loadBanks()
            }}
            onBanksUpdate={setBanks}
          />
        )
      case 'banks':
        return (
          <BankManager
            banks={banks}
            onUpdate={setBanks}
          />
        )
      case 'transactions':
        return (
          <TransactionManager
            banks={banks}
            goals={goals}
            onBanksUpdate={setBanks}
            onGoalsUpdate={setGoals}
            onTransactionAdded={refreshAllData}
          />
        )
      case 'history':
        return <TransactionHistory onUpdate={refreshAllData} />
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Loading Skeleton - Hero Card */}
        <div className="glass-card p-6 animate-pulse">
          <div className="h-8 w-48 bg-slate-200 dark:bg-slate-700 rounded-lg mb-4"></div>
          <div className="h-12 w-64 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
        </div>

        {/* Loading Skeleton - Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="glass-card p-5 animate-pulse">
              <div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded mb-3"></div>
              <div className="h-8 w-24 bg-slate-200 dark:bg-slate-700 rounded"></div>
            </div>
          ))}
        </div>

        {/* Loading Skeleton - Content */}
        <div className="glass-card p-6 animate-pulse">
          <div className="h-6 w-32 bg-slate-200 dark:bg-slate-700 rounded mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-8rem)]">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          variants={pageVariants}
          initial="initial"
          animate="enter"
          exit="exit"
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          {renderContent()}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
