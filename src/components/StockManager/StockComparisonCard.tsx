// src/components/StockManager/StockComparisonCard.tsx
import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, DollarSign, RefreshCw, ShoppingCart, Wallet, AlertCircle } from 'lucide-react'
import { stockPriceService } from '../../services/stockPriceService'
import { StockPortfolio } from '../../types/stock'

interface StockComparisonCardProps {
  holding: StockPortfolio
  userTotalBalance: number // Balance totale de l'utilisateur (tous comptes)
}

export function StockComparisonCard({ holding, userTotalBalance }: StockComparisonCardProps) {
  const [currentPrice, setCurrentPrice] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<string | null>(null)

  useEffect(() => {
    fetchCurrentPrice()
  }, [holding.casablanca_api_id])

  const fetchCurrentPrice = async () => {
    if (!holding.casablanca_api_id) {
      setError('Pas d\'API ID disponible')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const priceData = await stockPriceService.getPriceWithCache(
        holding.casablanca_api_id.toString()
      )

      if (priceData) {
        setCurrentPrice(priceData.currentPrice)
        setLastUpdate(priceData.lastUpdate)
      } else {
        setError('Prix non disponible')
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la récupération du prix')
    } finally {
      setLoading(false)
    }
  }

  // Calculs
  const purchasePrice = holding.avg_buy_price
  const quantity = holding.total_quantity
  const totalInvested = holding.total_invested
  
  const currentValue = currentPrice ? (quantity * currentPrice) : totalInvested
  const gainLoss = currentValue - totalInvested
  const gainLossPercent = totalInvested > 0 ? (gainLoss / totalInvested) * 100 : 0
  const isProfit = gainLoss >= 0

  // Nouveau solde si on vend tout maintenant
  const newBalanceIfSold = userTotalBalance + currentValue

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-MA', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {holding.company_name}
            </h3>
            <div className="flex items-center space-x-2 mt-1">
              <span className="px-2 py-1 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium rounded">
                {holding.symbol}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {quantity} actions
              </span>
            </div>
          </div>
          <button
            onClick={fetchCurrentPrice}
            disabled={loading || !holding.casablanca_api_id}
            className="p-2 hover:bg-white/50 dark:hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50"
            title="Actualiser le prix"
          >
            <RefreshCw className={`w-5 h-5 text-blue-600 dark:text-blue-400 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="p-6 space-y-6">
        {/* Erreur */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 border border-red-200 dark:border-red-800">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
              <span className="text-sm text-red-700 dark:text-red-300">{error}</span>
            </div>
          </div>
        )}

        {/* Comparaison des prix */}
        <div className="grid grid-cols-2 gap-4">
          {/* Prix d'achat */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center space-x-2 mb-2">
              <ShoppingCart className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-xs font-medium text-blue-700 dark:text-blue-300 uppercase tracking-wider">
                Prix d'achat
              </span>
            </div>
            <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              {formatCurrency(purchasePrice)} MAD
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              par action
            </p>
          </div>

          {/* Prix actuel */}
          <div className={`rounded-lg p-4 border ${
            loading 
              ? 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800'
              : isProfit
              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
          }`}>
            <div className="flex items-center space-x-2 mb-2">
              <DollarSign className={`w-4 h-4 ${
                loading
                  ? 'text-gray-600 dark:text-gray-400'
                  : isProfit
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
              }`} />
              <span className={`text-xs font-medium uppercase tracking-wider ${
                loading
                  ? 'text-gray-700 dark:text-gray-300'
                  : isProfit
                  ? 'text-green-700 dark:text-green-300'
                  : 'text-red-700 dark:text-red-300'
              }`}>
                Prix actuel
              </span>
            </div>
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-600"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Chargement...</span>
              </div>
            ) : currentPrice ? (
              <>
                <p className={`text-2xl font-bold ${
                  isProfit
                    ? 'text-green-900 dark:text-green-100'
                    : 'text-red-900 dark:text-red-100'
                }`}>
                  {formatCurrency(currentPrice)} MAD
                </p>
                <p className={`text-xs mt-1 ${
                  isProfit
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {isProfit ? '+' : ''}{formatCurrency(currentPrice - purchasePrice)} MAD/action
                </p>
              </>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">Non disponible</p>
            )}
          </div>
        </div>

        {/* Investissement vs Valeur actuelle */}
        <div className="space-y-3">
          <div className="flex items-center justify-between py-3 border-b border-slate-200 dark:border-slate-700">
            <span className="text-sm text-gray-600 dark:text-gray-400">Montant investi</span>
            <span className="text-lg font-semibold text-gray-900 dark:text-white">
              {formatCurrency(totalInvested)} MAD
            </span>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-slate-200 dark:border-slate-700">
            <span className="text-sm text-gray-600 dark:text-gray-400">Valeur actuelle</span>
            <span className="text-lg font-semibold text-gray-900 dark:text-white">
              {formatCurrency(currentValue)} MAD
            </span>
          </div>

          {/* Gain/Perte */}
          <div className={`rounded-xl p-4 ${
            isProfit
              ? 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-300 dark:border-green-700'
              : 'bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border-2 border-red-300 dark:border-red-700'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {isProfit ? (
                  <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
                )}
                <span className={`text-sm font-medium ${
                  isProfit
                    ? 'text-green-700 dark:text-green-300'
                    : 'text-red-700 dark:text-red-300'
                }`}>
                  {isProfit ? 'Gain potentiel' : 'Perte potentielle'}
                </span>
              </div>
              <div className="text-right">
                <p className={`text-2xl font-bold ${
                  isProfit
                    ? 'text-green-700 dark:text-green-300'
                    : 'text-red-700 dark:text-red-300'
                }`}>
                  {isProfit ? '+' : ''}{formatCurrency(gainLoss)} MAD
                </p>
                <p className={`text-sm font-medium ${
                  isProfit
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {isProfit ? '+' : ''}{gainLossPercent.toFixed(2)}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Simulation si vente */}
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-2 mb-3">
            <Wallet className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Si vous vendez maintenant
            </h4>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-400">Solde actuel</span>
              <span className="font-medium text-slate-900 dark:text-white">
                {formatCurrency(userTotalBalance)} MAD
              </span>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-400">Valeur de vente</span>
              <span className={`font-medium ${
                isProfit
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {isProfit ? '+' : ''}{formatCurrency(currentValue)} MAD
              </span>
            </div>
            
            <div className="pt-2 mt-2 border-t border-slate-300 dark:border-slate-600">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-900 dark:text-white">
                  Nouveau solde
                </span>
                <span className="text-xl font-bold text-slate-900 dark:text-white">
                  {formatCurrency(newBalanceIfSold)} MAD
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Différence: {isProfit ? '+' : ''}{formatCurrency(gainLoss)} MAD
              </p>
            </div>
          </div>
        </div>

        {/* Dernière mise à jour */}
        {lastUpdate && !loading && (
          <div className="text-center">
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Prix actualisé le {formatDateTime(lastUpdate)}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}