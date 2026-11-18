import { useState, useEffect } from 'react'
import { Bank, Goal, TransactionWithDetails, supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { BankManager } from './BankManager'
import { GoalManager } from './GoalManager/index'
import { TransactionManager } from './TransactionManager'
import { TransactionHistory } from './TransactionHistory'
import { OverviewCards } from './OverviewCards/index'
import { toast } from '../lib/toast'
import { motion, AnimatePresence } from 'framer-motion'
import { ErrorBoundary } from './ErrorBoundary'

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
    } catch (error: unknown) {
      console.error(error)
      const msg = error instanceof Error ? error.message : String(error)
      toast.error('Error loading data: ' + msg)
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
          bank_name: (t.banks as { name?: string } | null)?.name || 'Unknown Bank',
          transaction_goals:
              t.transaction_goals?.map((tg: { amount: number | string; goals?: { name?: string } | null }) => ({
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
          return <OverviewCards banks={banks} goals={goals} transactions={transactions} onRefresh={refreshAllData} />
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
            <div className="space-y-6 max-w-7xl mx-auto">
              {/* Terminal Header Skeleton */}
              <div className="flex flex-col sm:flex-row justify-between gap-4 pb-4 border-b border-stone-200 dark:border-white/[0.06] animate-pulse">
                <div className="space-y-2">
                  <div className="h-4 w-40 bg-stone-200 dark:bg-stone-800 rounded-full" />
                  <div className="h-8 w-72 bg-stone-300 dark:bg-stone-700 rounded-lg" />
                </div>
                <div className="flex gap-2">
                  <div className="h-10 w-28 bg-stone-200 dark:bg-stone-800 rounded-xl" />
                  <div className="h-10 w-28 bg-stone-200 dark:bg-stone-800 rounded-xl" />
                </div>
              </div>

        {/* Hero Card & Matrix Skeleton */ }
                    < div className = "grid grid-cols-1 lg:grid-cols-12 gap-5" >
          <div className="lg:col-span-5 h-64 bg-stone-900 border border-stone-800 rounded-2xl animate-pulse p-6" />
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-white dark:bg-[#121520] border border-stone-200/90 dark:border-white/[0.08] shadow-sm rounded-2xl animate-pulse p-4" />
            ))}
          </div>
        </div>

                {/* Chart Skeleton */}
                <div className="h-72 bg-white dark:bg-[#121520] border border-stone-200/90 dark:border-white/[0.08] shadow-sm rounded-2xl animate-pulse" />
              </div>
              )
  }

              return (
              <div className="min-h-[calc(100vh-8rem)]">
                <ErrorBoundary
                  fallbackTitle="View Rendering Issue"
                  fallbackMessage="An issue occurred loading this section. Click below to refresh your ledger data."
                  onReset={refreshAllData}
                >
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
                </ErrorBoundary>
              </div>
              )
}
