// src/components/Dashboard/Dashboard.tsx
import { useState, useEffect } from 'react'
import { 
  TrendingUp, 
  DollarSign, 
  Target, 
  Wallet,
  PiggyBank,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  EyeOff,
  Calendar,
  Activity
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { Bank } from '../../lib/supabase'
import { bankService } from '../../services/bankService'
import { goalService } from '../../services/goalService'
import { StockGainsSummary } from './StockGainsSummary'
import { StockGainsCard } from './StockGainsCard'
import { StockSaleBalanceCard } from './StockSaleBalanceCard'

interface Goal {
  id: string
  name: string
  target_amount: number
  current_amount: number
  deadline: string
  category: string
}

export function Dashboard() {
  const { user } = useAuth()
  const [banks, setBanks] = useState<Bank[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [objectiveAmounts, setObjectiveAmounts] = useState<{ [key: string]: number }>({})
  const [loading, setLoading] = useState(true)
  const [hiddenBalances, setHiddenBalances] = useState<Set<string>>(new Set())
  const [showDetailedStockCard, setShowDetailedStockCard] = useState(false)

  useEffect(() => {
    if (user) {
      loadDashboardData()
    }
  }, [user])

  const loadDashboardData = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      // Charger les banques
      const banksData = await bankService.loadBanks(user.id)
      setBanks(banksData)

      // Charger les objectifs
      const goalsData = await goalService.loadGoals(user.id)
      setGoals(goalsData)

      // Charger les montants des objectifs
      if (goalsData.length > 0) {
        const goalIds = goalsData.map(g => g.id)
        const amounts = await goalService.loadObjectiveAmounts(goalIds)
        setObjectiveAmounts(amounts)
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleBalanceVisibility = (bankId: string) => {
    setHiddenBalances(prev => {
      const newSet = new Set(prev)
      if (newSet.has(bankId)) {
        newSet.delete(bankId)
      } else {
        newSet.add(bankId)
      }
      return newSet
    })
  }

  // Calculs
  const totalBalance = banks.reduce((sum, bank) => sum + bank.balance, 0)
  const totalGoalTarget = goals.reduce((sum, goal) => sum + goal.target_amount, 0)
  const totalGoalCurrent = goals.reduce((sum, goal) => {
    const amount = objectiveAmounts[goal.id] || 0
    return sum + amount
  }, 0)
  const goalsProgress = totalGoalTarget > 0 ? (totalGoalCurrent / totalGoalTarget) * 100 : 0

  // Objectifs urgents (deadline < 30 jours)
  const urgentGoals = goals.filter(goal => {
    if (!goal.deadline) return false
    const daysLeft = Math.ceil((new Date(goal.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    return daysLeft > 0 && daysLeft <= 30
  }).length

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-MA', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Chargement du dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Dashboard
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Bienvenue, {user?.email?.split('@')[0]} 👋
            </p>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <Calendar className="w-4 h-4" />
            <span>{new Date().toLocaleDateString('fr-FR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</span>
          </div>
        </div>

        {/* Quick Stats - Ligne 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Total Balance */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <Wallet className="w-6 h-6" />
              </div>
              <ArrowUpRight className="w-5 h-5 text-white/60" />
            </div>
            <p className="text-sm text-white/80 mb-1">Solde Total</p>
            <p className="text-3xl font-bold">{formatCurrency(totalBalance)}</p>
            <p className="text-xs text-white/60 mt-1">MAD</p>
          </div>

          {/* Balance avec Vente Stocks */}
          <StockSaleBalanceCard totalBalance={totalBalance} />

          {/* Banks Count */}
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                <PiggyBank className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">{banks.length}</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Comptes Bancaires</p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Actifs</p>
          </div>

          {/* Goals Progress */}
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                <Target className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">{goals.length}</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Objectifs</p>
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500 mb-1">
                <span>Progression</span>
                <span>{goalsProgress.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-1.5">
                <div 
                  className="bg-green-500 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(goalsProgress, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Urgent Goals */}
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
                <Activity className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">{urgentGoals}</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Objectifs Urgents</p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Deadline {'<'} 30j</p>
          </div>
        </div>

        {/* Main Content - Ligne 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Stock Gains - Occupe 2 colonnes */}
          <div className="lg:col-span-2">
            {showDetailedStockCard ? (
              <StockGainsCard 
                autoRefresh={true} 
                refreshInterval={60000} 
              />
            ) : (
              <StockGainsSummary />
            )}
            {/* Toggle pour passer de summary à detailed */}
            <button
              onClick={() => setShowDetailedStockCard(!showDetailedStockCard)}
              className="mt-4 w-full text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            >
              {showDetailedStockCard ? '← Vue résumé' : 'Voir les détails →'}
            </button>
          </div>

          {/* Banks List */}
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Mes Comptes
              </h2>
              <Wallet className="w-5 h-5 text-gray-400" />
            </div>

            {banks.length === 0 ? (
              <div className="text-center py-8">
                <PiggyBank className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Aucun compte bancaire
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {banks.map((bank) => {
                  const isHidden = hiddenBalances.has(bank.id)
                  
                  return (
                    <div
                      key={bank.id}
                      className="group bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-lg p-4 border border-slate-200 dark:border-slate-700 hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          {bank.logo ? (
                            <img 
                              src={bank.logo} 
                              alt={bank.name}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                              <DollarSign className="w-4 h-4 text-white" />
                            </div>
                          )}
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {bank.name}
                          </h3>
                        </div>
                        <button
                          onClick={() => toggleBalanceVisibility(bank.id)}
                          className="p-1 hover:bg-white/50 dark:hover:bg-slate-700 rounded-lg transition-colors"
                        >
                          {isHidden ? (
                            <EyeOff className="w-4 h-4 text-gray-400" />
                          ) : (
                            <Eye className="w-4 h-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                      
                      <div className="flex items-baseline space-x-2">
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {isHidden ? '••••••' : formatCurrency(bank.balance)}
                        </p>
                        {!isHidden && (
                          <span className="text-sm text-gray-500 dark:text-gray-400">MAD</span>
                        )}
                      </div>
                      
                      <div className="mt-2 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span>Solde disponible</span>
                        <span className={`px-2 py-0.5 rounded-full ${
                          bank.balance > 0 
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                        }`}>
                          {bank.balance > 0 ? 'Actif' : 'Vide'}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Goals Overview - Ligne 3 */}
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-lg">
                <Target className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Mes Objectifs
              </h2>
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {goals.length} objectif{goals.length !== 1 ? 's' : ''}
            </span>
          </div>

          {goals.length === 0 ? (
            <div className="text-center py-12">
              <Target className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 mb-2">
                Aucun objectif défini
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500">
                Créez votre premier objectif financier
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {goals.map((goal) => {
                const currentAmount = objectiveAmounts[goal.id] || 0
                const progress = goal.target_amount > 0 
                  ? (currentAmount / goal.target_amount) * 100 
                  : 0
                
                const daysLeft = goal.deadline 
                  ? Math.ceil((new Date(goal.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                  : null
                
                const isUrgent = daysLeft !== null && daysLeft > 0 && daysLeft <= 30
                const isCompleted = progress >= 100

                return (
                  <div
                    key={goal.id}
                    className="group relative bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-lg p-4 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-200"
                  >
                    {isCompleted && (
                      <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                        ✓ Atteint
                      </div>
                    )}
                    
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                          {goal.name}
                        </h3>
                        <span className="inline-block px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs rounded-full">
                          {goal.category}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 mb-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Objectif</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {formatCurrency(goal.target_amount)} MAD
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Atteint</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {formatCurrency(currentAmount)} MAD
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                        <span>Progression</span>
                        <span>{progress.toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            isCompleted 
                              ? 'bg-green-500' 
                              : 'bg-gradient-to-r from-blue-500 to-purple-600'
                          }`}
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Deadline */}
                    {goal.deadline && (
                      <div className={`flex items-center justify-between text-xs ${
                        isUrgent 
                          ? 'text-orange-600 dark:text-orange-400' 
                          : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>Échéance</span>
                        </div>
                        <span className="font-medium">
                          {daysLeft !== null && daysLeft > 0 
                            ? `${daysLeft} jour${daysLeft !== 1 ? 's' : ''}`
                            : 'Expiré'
                          }
                        </span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          <p>Dernière mise à jour: {new Date().toLocaleTimeString('fr-FR')}</p>
        </div>
      </div>
    </div>
  )
}