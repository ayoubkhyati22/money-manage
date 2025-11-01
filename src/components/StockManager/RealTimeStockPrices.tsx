// src/components/StockManager/RealTimeStockPrices.tsx
import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, RefreshCw, Activity, AlertCircle } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useStockPrices } from '../../hooks/useStockPrices'
import { stockService } from '../../services/stockService'
import { StockPortfolio } from '../../types/stock'

interface PortfolioWithPrice extends StockPortfolio {
  currentPrice?: number
  priceChange?: number
  priceChangePercent?: number
  currentValue?: number
  totalGain?: number
  totalGainPercent?: number
  lastUpdate?: string
}

export function RealTimeStockPrices() {
  const { user } = useAuth()
  const [portfolio, setPortfolio] = useState<StockPortfolio[]>([])
  const [portfolioWithPrices, setPortfolioWithPrices] = useState<PortfolioWithPrice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Extraire les casablanca_api_ids du portfolio
  const apiIds = portfolio
    .filter(p => p.casablanca_api_id)
    .map(p => p.casablanca_api_id!.toString())

  // Hook pour récupérer les prix en temps réel (refresh toutes les 30s)
  const { prices, loading: pricesLoading, error: pricesError, lastRefresh, refresh } = useStockPrices(apiIds, 30000)

  useEffect(() => {
    if (user) {
      loadPortfolio()
    }
  }, [user])

  useEffect(() => {
    if (portfolio.length > 0) {
      updatePortfolioWithPrices()
    }
  }, [portfolio, prices])

  const loadPortfolio = async () => {
    if (!user) return
    setLoading(true)
    try {
      const data = await stockService.fetchPortfolio(user.id)
      setPortfolio(data)
      setError(null)
    } catch (err: any) {
      setError(err.message || 'Failed to load portfolio')
      console.error('Error loading portfolio:', err)
    } finally {
      setLoading(false)
    }
  }

  const updatePortfolioWithPrices = () => {
    const updated = portfolio.map(holding => {
      const apiId = holding.casablanca_api_id?.toString()
      const priceData = apiId ? prices.get(apiId) : null

      if (priceData) {
        const currentPrice = priceData.currentPrice
        const currentValue = holding.total_quantity * currentPrice
        const totalGain = currentValue - holding.total_invested
        const totalGainPercent = holding.total_invested > 0 
          ? (totalGain / holding.total_invested) * 100 
          : 0

        return {
          ...holding,
          currentPrice,
          priceChange: priceData.change,
          priceChangePercent: priceData.changePercent,
          currentValue,
          totalGain,
          totalGainPercent,
          lastUpdate: priceData.lastUpdate
        }
      }

      // Fallback: utiliser le prix d'achat moyen
      const fallbackValue = holding.total_quantity * holding.avg_buy_price
      return {
        ...holding,
        currentPrice: holding.avg_buy_price,
        currentValue: fallbackValue,
        totalGain: 0,
        totalGainPercent: 0
      }
    })

    setPortfolioWithPrices(updated)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-MA', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleString('fr-FR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
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
          </div>
        </div>
      </div>
    )
  }

  if (portfolio.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 rounded-full mx-auto mb-4">
          <Activity className="w-8 h-8 text-blue-600 dark:text-blue-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-100 mb-2">
          Aucune action en portefeuille
        </h3>
        <p className="text-sm text-gray-500 dark:text-dark-300">
          Achetez vos premières actions pour voir les prix en temps réel
        </p>
      </div>
    )
  }

  const totalPortfolioValue = portfolioWithPrices.reduce((sum, p) => sum + (p.currentValue || 0), 0)
  const totalInvested = portfolioWithPrices.reduce((sum, p) => sum + p.total_invested, 0)
  const totalGain = totalPortfolioValue - totalInvested
  const totalGainPercent = totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0

  return (
    <div className="space-y-6">
      {/* Header avec stats globales */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 rounded-xl p-6 text-white shadow-lg border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Activity className="w-8 h-8" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
            </div>
            <div>
              <h2 className="text-xl font-bold">Prix en Temps Réel</h2>
              <p className="text-sm text-white/60">
                Mise à jour: {formatDateTime(lastRefresh.toISOString())}
              </p>
            </div>
          </div>
          <button
            onClick={refresh}
            disabled={pricesLoading}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
            title="Actualiser les prix"
          >
            <RefreshCw className={`w-5 h-5 ${pricesLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Stats globales */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10">
            <p className="text-xs text-white/60 uppercase tracking-wider mb-1">Valeur Totale</p>
            <p className="text-2xl font-bold">{formatCurrency(totalPortfolioValue)} MAD</p>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10">
            <p className="text-xs text-white/60 uppercase tracking-wider mb-1">Investi</p>
            <p className="text-2xl font-bold">{formatCurrency(totalInvested)} MAD</p>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-white/60 uppercase tracking-wider mb-1">Gain/Perte</p>
                <p className={`text-2xl font-bold ${totalGain >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                  {totalGain >= 0 ? '+' : ''}{formatCurrency(totalGain)} MAD
                </p>
                <p className={`text-sm ${totalGain >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                  {totalGain >= 0 ? '+' : ''}{totalGainPercent.toFixed(2)}%
                </p>
              </div>
              {totalGain >= 0 ? (
                <TrendingUp className="w-6 h-6 text-green-300" />
              ) : (
                <TrendingDown className="w-6 h-6 text-red-300" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Liste des actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {portfolioWithPrices.map((holding) => {
          const isProfit = (holding.totalGain || 0) >= 0
          const hasLivePrice = holding.currentPrice !== holding.avg_buy_price

          return (
            <div
              key={`${holding.symbol}-${holding.bank_id}`}
              className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-md hover:shadow-xl transition-all duration-300"
            >
              {/* Badge LIVE */}
              {hasLivePrice && (
                <div className="absolute top-3 right-3 flex items-center space-x-1 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  <span>LIVE</span>
                </div>
              )}

              {/* Header */}
              <div className="mb-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                  {holding.company_name}
                </h3>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium rounded">
                    {holding.symbol}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {holding.total_quantity} actions
                  </span>
                </div>
              </div>

              {/* Prix actuel */}
              <div className="mb-4 pb-4 border-b border-gray-200 dark:border-slate-700">
                <div className="flex items-baseline space-x-2">
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(holding.currentPrice || 0)}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">MAD</span>
                </div>
                {holding.priceChange !== undefined && (
                  <div className="flex items-center space-x-2 mt-1">
                    {holding.priceChange >= 0 ? (
                      <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />
                    )}
                    <span className={`text-sm font-medium ${
                      holding.priceChange >= 0
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {holding.priceChange >= 0 ? '+' : ''}{formatCurrency(holding.priceChange)} 
                      ({holding.priceChange >= 0 ? '+' : ''}{holding.priceChangePercent?.toFixed(2)}%)
                    </span>
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Prix d'achat moyen</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatCurrency(holding.avg_buy_price)} MAD
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Valeur actuelle</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatCurrency(holding.currentValue || 0)} MAD
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Investi</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatCurrency(holding.total_invested)} MAD
                  </span>
                </div>
              </div>

              {/* Gain/Perte */}
              <div className={`p-3 rounded-lg ${
                isProfit
                  ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                  : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    {isProfit ? 'Gain' : 'Perte'}
                  </span>
                  <div className="text-right">
                    <p className={`text-lg font-bold ${
                      isProfit
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {isProfit ? '+' : ''}{formatCurrency(holding.totalGain || 0)} MAD
                    </p>
                    <p className={`text-xs ${
                      isProfit
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {isProfit ? '+' : ''}{holding.totalGainPercent?.toFixed(2)}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Dernière mise à jour */}
              {holding.lastUpdate && (
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-3 text-center">
                  Mis à jour: {formatDateTime(holding.lastUpdate)}
                </p>
              )}
            </div>
          )
        })}
      </div>

      {/* Message d'erreur des prix */}
      {pricesError && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
                Certains prix n'ont pas pu être récupérés
              </p>
              <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                Les prix d'achat moyens sont utilisés comme fallback.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}