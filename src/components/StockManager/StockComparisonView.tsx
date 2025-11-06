// src/components/StockManager/StockComparisonView.tsx
import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { stockService } from '../../services/stockService'
import { supabase } from '../../lib/supabase'
import { StockPortfolio } from '../../types/stock'
import { StockComparisonCard } from './StockComparisonCard'
import { TrendingUp, AlertCircle, Briefcase } from 'lucide-react'

export function StockComparisonView() {
  const { user } = useAuth()
  const [portfolio, setPortfolio] = useState<StockPortfolio[]>([])
  const [totalBalance, setTotalBalance] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user])

  const loadData = async () => {
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      // Charger le portfolio
      const portfolioData = await stockService.fetchPortfolio(user.id)
      setPortfolio(portfolioData)

      // Calculer le solde total de tous les comptes bancaires
      const { data: banks, error: banksError } = await supabase
        .from('banks')
        .select('balance')
        .eq('user_id', user.id)

      if (banksError) throw banksError

      const total = banks?.reduce((sum, bank) => sum + bank.balance, 0) || 0
      setTotalBalance(total)
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des données')
      console.error('Error loading comparison data:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Chargement des données...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6 border border-red-200 dark:border-red-800">
        <div className="flex items-center space-x-3">
          <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
          <div>
            <h3 className="font-semibold text-red-900 dark:text-red-100">
              Erreur de chargement
            </h3>
            <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
            <button
              onClick={loadData}
              className="mt-2 text-xs text-red-600 dark:text-red-400 underline hover:no-underline"
            >
              Réessayer
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (portfolio.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 rounded-full mx-auto mb-4">
          <Briefcase className="w-8 h-8 text-blue-600 dark:text-blue-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-100 mb-2">
          Aucune action en portefeuille
        </h3>
        <p className="text-sm text-gray-500 dark:text-dark-300">
          Achetez des actions pour voir la comparaison prix d'achat vs prix actuel
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-700">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-blue-500 rounded-lg">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Comparaison Prix d'Achat vs Prix Actuel
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Analysez vos gains et pertes potentiels pour chaque action
            </p>
          </div>
        </div>

        {/* Stats globales */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white/50 dark:bg-slate-800/50 rounded-lg p-3 border border-blue-200 dark:border-blue-700">
            <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">
              Solde total disponible
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {totalBalance.toLocaleString('fr-MA', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })} MAD
            </p>
          </div>

          <div className="bg-white/50 dark:bg-slate-800/50 rounded-lg p-3 border border-blue-200 dark:border-blue-700">
            <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">
              Actions suivies
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {portfolio.length}
            </p>
          </div>
        </div>
      </div>

      {/* Grille des comparaisons */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {portfolio.map((holding) => (
          <StockComparisonCard
            key={`${holding.symbol}-${holding.bank_id}`}
            holding={holding}
            userTotalBalance={totalBalance}
          />
        ))}
      </div>
    </div>
  )
}