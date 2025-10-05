import { useState, useEffect } from 'react'
import { Bank, Goal, TransactionWithDetails, supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { BankManager } from './BankManager'
import { GoalManager } from './GoalManager/index'
import { TransactionManager } from './TransactionManager'
import { TransactionHistory } from './TransactionHistory'
import { OverviewCards } from './OverviewCards/index'
import { DCAManager } from './DCAManager'
import { DCAPerformanceChart } from './DCAManager/DCAPerformanceChart'
import {
  Building2,
  Target,
  ArrowDownCircle,
  History,
  TrendingUp,
  LineChart
} from 'lucide-react'
import toast from 'react-hot-toast'

type ActiveTab = 'overview' | 'banks' | 'goals' | 'transactions' | 'history' | 'dca'

export function Dashboard() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview')
  const [banks, setBanks] = useState<Bank[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [transactions, setTransactions] = useState<TransactionWithDetails[]>([])
  const [loading, setLoading] = useState(true)

  const tabs = [
    { id: 'overview' as const, label: 'Overview', icon: TrendingUp },
    { id: 'banks' as const, label: 'Banks', icon: Building2 },
    { id: 'goals' as const, label: 'Goals', icon: Target },
    { id: 'transactions' as const, label: 'Withdraw', icon: ArrowDownCircle },
    { id: 'history' as const, label: 'History', icon: History },
    { id: 'dca' as const, label: 'DCA', icon: LineChart },
  ]

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

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewCards banks={banks} goals={goals} transactions={transactions} />
      case 'banks':
        return (
          <BankManager
            banks={banks}
            onUpdate={(updated) => {
              setBanks(updated)
              refreshAllData()
            }}
          />
        )
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
      case 'dca':
        return (
          <div className="space-y-6">
            <DCAManager />
            <DCAPerformanceChart />
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-mint-50 via-white to-primary-50 dark:from-dark-900 dark:via-dark-800 dark:to-dark-900">
      <div className="pt-safe-top pb-20 sm:pb-0"> {/* espace pour bottom nav sur mobile */}
        <div className="space-y-6 p-4 sm:p-6 max-w-7xl mx-auto">
          {/* --- TABS DESKTOP --- */}
          <div className="hidden sm:block">
            <div className="bg-white/90 dark:bg-dark-800/90 backdrop-blur-sm rounded-2xl shadow-lg border border-mint-200/50 dark:border-dark-600/50 p-2">
              <div className="flex space-x-1 sm:space-x-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-6 py-3 sm:py-4 rounded-xl font-medium text-xs sm:text-sm transition-all flex-1 justify-center duration-300 transform hover:scale-105 ${
                        activeTab === tab.id
                          ? 'bg-gradient-to-r from-primary-400 to-primary-500 text-white shadow-lg shadow-primary-200 dark:shadow-primary-900/30'
                          : 'text-dark-500 dark:text-dark-200 hover:text-dark-600 dark:hover:text-dark-100 hover:bg-mint-100/70 dark:hover:bg-dark-700/70'
                      }`}
                    >
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="hidden sm:inline font-medium">{tab.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* --- CONTENU --- */}
          <div className="animate-fadeIn">{renderContent()}</div>
        </div>
      </div>

      {/* --- BOTTOM NAV MOBILE - ENHANCED DARK VERSION --- */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-dark-900/95 backdrop-blur-sm border-t border-gray-200/50 dark:border-dark-600/30 shadow-2xl z-50">
        <div className="flex justify-around px-2 py-1">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const active = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center justify-center flex-1 py-2 px-2 text-xs transition-all duration-300 rounded-xl mx-2 ${
                  active
                    ? 'text-white bg-gradient-to-br from-primary-500 to-primary-600 dark:from-primary-400 dark:to-primary-500 shadow-lg scale-105'
                    : 'text-gray-600 dark:text-dark-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100/50 dark:hover:bg-dark-800/50'
                }`}
              >
                <Icon className={`w-5 h-5 mb-1 transition-transform ${active ? 'scale-110' : ''}`} />
                <span className="font-medium">{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}