import { useState, useEffect } from 'react'
import { Bank, Goal, Transaction, TransactionWithDetails } from '../lib/supabase'
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

type ActiveTab = 'overview' | 'banks' | 'goals' | 'transactions' | 'history'

export function Dashboard() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview')
  const [banks, setBanks] = useState<Bank[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [transactions, setTransactions] = useState<TransactionWithDetails[]>([])

  const tabs = [
    { id: 'overview' as const, label: 'Overview', icon: TrendingUp },
    { id: 'banks' as const, label: 'Banks', icon: Building2 },
    { id: 'goals' as const, label: 'Objectives', icon: Target },
    { id: 'transactions' as const, label: 'Withdraw', icon: ArrowDownCircle },
    { id: 'history' as const, label: 'History', icon: History },
  ]

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewCards banks={banks} goals={goals} transactions={transactions} />
      case 'banks':
        return <BankManager banks={banks} onUpdate={setBanks} />
      case 'goals':
        return <GoalManager goals={goals} banks={banks} onUpdate={setGoals} onBanksUpdate={setBanks} />
      case 'transactions':
        return (
          <TransactionManager 
            banks={banks} 
            goals={goals} 
            onBanksUpdate={setBanks}
            onGoalsUpdate={setGoals}
            onTransactionAdded={() => {
              // Refresh data after transaction
              window.location.reload()
            }}
          />
        )
      case 'history':
        return <TransactionHistory onUpdate={() => {
          // Refresh all data when a transaction is returned
          window.location.reload()
        }} />
      default:
        return <OverviewCards banks={banks} goals={goals} transactions={transactions} />
    }
  }

  return (
    <div className="space-y-8">
      {/* Navigation Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-1">
        <div className="flex space-x-1">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-3 rounded-lg font-medium text-sm transition-all flex-1 justify-center ${
                  activeTab === tab.id
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
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
  )
}