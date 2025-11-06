// src/components/Dashboard/DashboardCompact.tsx
// Version compacte avec focus sur les stocks

import { useState, useEffect } from 'react'
import { 
  TrendingUp, 
  Wallet,
  Target,
  Eye,
  EyeOff,
  ChevronRight
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { Bank } from '../../lib/supabase'
import { bankService } from '../../services/bankService'
import { goalService } from '../../services/goalService'
import { StockGainsSummary } from './StockGainsSummary'
import { Link } from 'react-router-dom' // Adapter selon votre routing

interface Goal {
  id: string
  name: string
  target_amount: number
  deadline: string
}

export function DashboardCompact() {
  const { user } = useAuth()
  const [banks, setBanks] = useState<Bank[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [objectiveAmounts, setObjectiveAmounts] = useState<{ [key: string]: number }>({})
  const [loading, setLoading] = useState(true)
  const [hideTotalBalance, setHideTotalBalance] = useState(false)

  useEffect(() => {
    if (user) {
      loadDashboardData()
    }
  }, [user])

  const loadDashboardData = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      const [banksData, goalsData] = await Promise.all([
        bankService.loadBanks(user.id),
        goalService.loadGoals(user.id)
      ])

      setBanks(banksData)
      setGoals(goalsData)

      if (goalsData.length > 0) {
        const amounts = await goalService.loadObjectiveAmounts(goalsData.map(g => g.id))
        setObjectiveAmounts(amounts)
      }
    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const totalBalance = banks.reduce((sum, bank) => sum + bank.balance, 0)
  const totalGoalCurrent = goals.reduce((sum, goal) => sum + (objectiveAmounts[goal.id] || 0), 0)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-MA', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Bonjour, {user?.email?.split('@')[0]} 👋
        </h1>
        <p className="text-sm text-white/80">
          Voici votre situation financière
        </p>
      </div>

      {/* Quick Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Balance */}
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Wallet className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Solde Total
              </span>
            </div>
            <button
              onClick={() => setHideTotalBalance(!hideTotalBalance)}
              className="p-1 hover:bg-gray-100 dark:hover:bg-slate-800 rounded"
            >
              {hideTotalBalance ? (
                <EyeOff className="w-4 h-4 text-gray-400" />
              ) : (
                <Eye className="w-4 h-4 text-gray-400" />
              )}
            </button>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {hideTotalBalance ? '••••••' : formatCurrency(totalBalance)}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {banks.length} compte{banks.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Goals Progress */}
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center space-x-2 mb-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Target className="w-4 h-4 text-green-600 dark:text-green-400" />
            </div>
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Objectifs
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(totalGoalCurrent)}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {goals.length} objectif{goals.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-4">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">
            Actions rapides
          </p>
          <div className="space-y-2">
            <Link
              to="/stocks"
              className="flex items-center justify-between text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 p-2 rounded-lg transition-colors"
            >
              <span>Gérer mes stocks</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
            <Link
              to="/goals"
              className="flex items-center justify-between text-sm text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 p-2 rounded-lg transition-colors"
            >
              <span>Mes objectifs</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Stock Gains - Featured */}
      <StockGainsSummary />

      {/* Recent Goals */}
      {goals.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Objectifs récents
            </h2>
            <Link 
              to="/goals"
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              Voir tout
            </Link>
          </div>
          <div className="space-y-3">
            {goals.slice(0, 3).map((goal) => {
              const currentAmount = objectiveAmounts[goal.id] || 0
              const progress = goal.target_amount > 0 
                ? (currentAmount / goal.target_amount) * 100 
                : 0

              return (
                <div
                  key={goal.id}
                  className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                      {goal.name}
                    </p>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-200 dark:bg-slate-700 rounded-full h-1.5">
                        <div 
                          className="bg-green-500 h-1.5 rounded-full transition-all"
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {progress.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}