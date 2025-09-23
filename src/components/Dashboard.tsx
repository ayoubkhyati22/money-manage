// src/components/Dashboard.tsx
import { useState, useEffect } from 'react'
import { Bank, Goal, Transaction, TransactionWithDetails, supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { BankManager } from './BankManager'
import { GoalManager } from './GoalManager'
import { TransactionManager } from './TransactionManager'
import { TransactionHistory } from './TransactionHistory'
import { OverviewCards } from './OverviewCards'
import {
  Building2,
  Target,
  ArrowDownCircle,
  History,
  TrendingUp
} from 'lucide-react'
import toast from 'react-hot-toast'

type ActiveTab = 'overview' | 'banks' | 'goals' | 'transactions' | 'history'

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
    { id: 'goals' as const, label: 'Objectives', icon: Target },
    { id: 'transactions' as const, label: 'Withdraw', icon: ArrowDownCircle },
    { id: 'history' as const, label: 'History', icon: History },
  ]

  // Charger toutes les données au montage du composant
  useEffect(() => {
    if (user) {
      loadAllData()
    }
  }, [user])

  const loadAllData = async () => {
    if (!user) return

    setLoading(true)
    try {
      await Promise.all([
        loadBanks(),
        loadGoals(),
        loadTransactions()
      ])
    } catch (error: any) {
      console.error('Error loading dashboard data:', error)
      toast.error('Error loading data: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const loadBanks = async () => {
    try {
      const { data, error } = await supabase
        .from('banks')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setBanks(data || [])
    } catch (error: any) {
      console.error('Error loading banks:', error)
    }
  }

  const loadGoals = async () => {
    try {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setGoals(data || [])
    } catch (error: any) {
      console.error('Error loading goals:', error)
    }
  }

  const loadTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          banks:bank_id(name),
          transaction_goals(
            amount,
            goals:goal_id(name)
          )
        `)
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) throw error

      const transactionsWithDetails: TransactionWithDetails[] = data?.map(transaction => ({
        id: transaction.id,
        user_id: transaction.user_id,
        bank_id: transaction.bank_id,
        total_amount: Number(transaction.total_amount),
        description: transaction.description || '',
        created_at: transaction.created_at,
        bank_name: (transaction.banks as any)?.name || 'Unknown Bank',
        transaction_goals: transaction.transaction_goals?.map((tg: any) => ({
          goal_name: tg.goals?.name || 'Unknown Goal',
          amount: Number(tg.amount)
        })) || []
      })) || []

      setTransactions(transactionsWithDetails)
    } catch (error: any) {
      console.error('Error loading transactions:', error)
    }
  }

  // Fonction pour rafraîchir toutes les données
  const refreshAllData = () => {
    loadAllData()
  }

  const renderContent = () => {
    if (loading && activeTab === 'overview') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-dark-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-dark-600 animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-dark-600 rounded w-3/4 mb-4"></div>
              <div className="h-8 bg-gray-200 dark:bg-dark-600 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      )
    }

    switch (activeTab) {
      case 'overview':
        return <OverviewCards banks={banks} goals={goals} transactions={transactions} />
      case 'banks':
        return <BankManager banks={banks} onUpdate={(updatedBanks) => {
          setBanks(updatedBanks)
          // Rafraîchir les données de l'overview aussi
          if (activeTab === 'overview') {
            refreshAllData()
          }
        }} />
      case 'goals':
        return <GoalManager
          goals={goals}
          banks={banks}
          onUpdate={(updatedGoals) => {
            setGoals(updatedGoals)
            // Rafraîchir les banques car les soldes peuvent changer
            loadBanks()
          }}
          onBanksUpdate={setBanks}
        />
      case 'transactions':
        return (
          <TransactionManager
            banks={banks}
            goals={goals}
            onBanksUpdate={setBanks}
            onGoalsUpdate={setGoals}
            onTransactionAdded={() => {
              // Rafraîchir toutes les données après une transaction
              refreshAllData()
            }}
          />
        )
      case 'history':
        return <TransactionHistory onUpdate={() => {
          // Rafraîchir toutes les données quand une transaction est retournée
          refreshAllData()
        }} />
      default:
        return <OverviewCards banks={banks} goals={goals} transactions={transactions} />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-mint-50 via-white to-primary-50 dark:from-dark-900 dark:via-dark-800 dark:to-dark-900">
      {/* Padding top pour compenser la barre de titre native mobile */}
      <div className="pt-safe-top">
        <div className="space-y-6 p-4 sm:p-6 max-w-7xl mx-auto">
          {/* Navigation Tabs */}
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

          {/* Content */}
          <div className="animate-fadeIn">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  )
}