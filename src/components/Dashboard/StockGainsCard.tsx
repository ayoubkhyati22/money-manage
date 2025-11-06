// src/components/Dashboard/StockGainsCard.tsx
import { useState } from 'react'
import { TrendingUp, TrendingDown, RefreshCw, LineChart, Eye, EyeOff, DollarSign } from 'lucide-react'
import { useStockGains } from '../../hooks/useStockGains'

interface StockGainsCardProps {
  autoRefresh?: boolean
  refreshInterval?: number
}

export function StockGainsCard({ autoRefresh = true, refreshInterval = 60000 }: StockGainsCardProps) {
  const { 
    totalInvested, 
    currentValue, 
    totalGain, 
    totalGainPercent,
    realizedGains,
    unrealizedGains,
    loading, 
    error,
    refresh 
  } = useStockGains(autoRefresh, refreshInterval)

  const [showDetails, setShowDetails] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const isProfit = totalGain >= 0

  const handleRefresh = async () => {
    setRefreshing(true)
    await refresh()
    setTimeout(() => setRefreshing(false), 500)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-MA', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
            <LineChart className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Stock Portfolio Gains
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Real-time performance
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl">
            <LineChart className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Stock Portfolio Gains
            </h3>
            <p className="text-xs text-red-500">Error loading data</p>
          </div>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400">{error}</p>
        <button
          onClick={handleRefresh}
          className="mt-3 text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          Retry
        </button>
      </div>
    )
  }

  // Si pas d'investissement, ne rien afficher
  if (totalInvested === 0) {
    return null
  }

  return (
    <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 rounded-xl shadow-lg border border-white/10 p-6 text-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
            <LineChart className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Stock Portfolio Gains</h3>
            <p className="text-xs text-white/60">Real-time performance</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            title={showDetails ? "Hide details" : "Show details"}
          >
            {showDetails ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Total Gain */}
        <div className="col-span-2 bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xs text-white/60 uppercase tracking-wider mb-1">
                Total Gain/Loss
              </p>
              <div className="flex items-baseline space-x-2">
                <p className={`text-3xl font-bold ${
                  isProfit ? 'text-green-300' : 'text-red-300'
                }`}>
                  {isProfit ? '+' : ''}{formatCurrency(totalGain)}
                </p>
                <span className="text-sm text-white/60">MAD</span>
              </div>
              <p className={`text-sm mt-1 ${
                isProfit ? 'text-green-300' : 'text-red-300'
              }`}>
                {isProfit ? '+' : ''}{totalGainPercent.toFixed(2)}%
              </p>
            </div>
            <div className={`p-3 rounded-xl ${
              isProfit 
                ? 'bg-green-500/20 border border-green-500/30' 
                : 'bg-red-500/20 border border-red-500/30'
            }`}>
              {isProfit ? (
                <TrendingUp className="w-8 h-8 text-green-300" />
              ) : (
                <TrendingDown className="w-8 h-8 text-red-300" />
              )}
            </div>
          </div>
        </div>

        {/* Invested */}
        <div className="bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10">
          <p className="text-xs text-white/60 uppercase tracking-wider mb-1">
            Invested
          </p>
          <p className="text-xl font-bold">{formatCurrency(totalInvested)}</p>
          <p className="text-xs text-white/60 mt-1">MAD</p>
        </div>

        {/* Current Value */}
        <div className="bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10">
          <p className="text-xs text-white/60 uppercase tracking-wider mb-1">
            Current Value
          </p>
          <p className="text-xl font-bold">{formatCurrency(currentValue)}</p>
          <p className="text-xs text-white/60 mt-1">MAD</p>
        </div>
      </div>

      {/* Detailed Breakdown */}
      {showDetails && (
        <div className="space-y-3 pt-4 border-t border-white/10">
          <p className="text-xs text-white/60 uppercase tracking-wider mb-2">
            Gain Breakdown
          </p>
          
          {/* Unrealized Gains */}
          <div className="flex items-center justify-between bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-blue-400"></div>
              <span className="text-sm text-white/80">Unrealized (Open Positions)</span>
            </div>
            <div className="text-right">
              <p className={`text-sm font-bold ${
                unrealizedGains >= 0 ? 'text-green-300' : 'text-red-300'
              }`}>
                {unrealizedGains >= 0 ? '+' : ''}{formatCurrency(unrealizedGains)} MAD
              </p>
            </div>
          </div>

          {/* Realized Gains */}
          <div className="flex items-center justify-between bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-purple-400"></div>
              <span className="text-sm text-white/80">Realized (Sold)</span>
            </div>
            <div className="text-right">
              <p className={`text-sm font-bold ${
                realizedGains >= 0 ? 'text-green-300' : 'text-red-300'
              }`}>
                {realizedGains >= 0 ? '+' : ''}{formatCurrency(realizedGains)} MAD
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Auto-refresh indicator */}
      {autoRefresh && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <p className="text-xs text-white/40 text-center">
            Auto-refreshes every {refreshInterval / 1000}s
          </p>
        </div>
      )}
    </div>
  )
}