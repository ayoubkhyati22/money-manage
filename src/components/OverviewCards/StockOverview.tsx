import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, BarChart3, DollarSign, Activity, Crown, ArrowUpRight } from 'lucide-react'
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

interface StockOverviewProps {
  onTotalGainsChange?: (gains: number) => void
}

export function StockOverview({ onTotalGainsChange }: StockOverviewProps) {
  const { user } = useAuth()
  const [portfolio, setPortfolio] = useState<StockPortfolio[]>([])
  const [portfolioWithPrices, setPortfolioWithPrices] = useState<PortfolioWithPrice[]>([])
  const [loading, setLoading] = useState(true)

  const apiIds = portfolio
    .filter(p => p.casablanca_api_id)
    .map(p => p.casablanca_api_id!.toString())

  const { prices, loading: pricesLoading } = useStockPrices(apiIds, 60000)

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
    } catch (error) {
      console.error('Error loading portfolio:', error)
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
    
    // Calculer le gain total et le passer au parent
    const totalGain = updated.reduce((sum, p) => sum + (p.totalGain || 0), 0)
    if (onTotalGainsChange) {
      onTotalGainsChange(totalGain)
    }
  }

  if (loading) {
    return (
      <div className="bg-white/90 dark:bg-dark-800/90 backdrop-blur-sm rounded-2xl shadow-lg border border-mint-200/50 dark:border-dark-600/50 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-dark-600 rounded w-1/3"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 dark:bg-dark-600 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (portfolio.length === 0) {
    return null // Ne rien afficher si pas d'investissements
  }

  const totalInvested = portfolioWithPrices.reduce((sum, p) => sum + p.total_invested, 0)
  const totalValue = portfolioWithPrices.reduce((sum, p) => sum + (p.currentValue || 0), 0)
  const totalGain = totalValue - totalInvested
  const totalGainPercent = totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0

  // Top performer
  const topPerformer = portfolioWithPrices.reduce((top, current) => {
    const currentPercent = current.totalGainPercent || 0
    const topPercent = top.totalGainPercent || 0
    return currentPercent > topPercent ? current : top
  }, portfolioWithPrices[0])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-MA', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  return (
    <div className="space-y-4">
      {/* Header Premium */}
      <div className="bg-gradient-to-br from-purple-900 via-indigo-900 to-purple-800 rounded-2xl p-6 text-white shadow-premium border border-white/10 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute w-[150%] h-[150%] -left-1/4 -top-1/4 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.2)_0%,transparent_70%)] animate-pulse"></div>
        </div>

        {/* Content */}
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white shadow-sm animate-pulse"></div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white/95">Stock Investments</h3>
                <p className="text-sm text-white/60">Real-time market data</p>
              </div>
            </div>
            
            {pricesLoading && (
              <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/20">
                <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span className="text-xs font-medium text-white/80">Updating...</span>
              </div>
            )}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <p className="text-xs text-white/60 uppercase tracking-wider mb-1">Total Invested</p>
              <p className="text-2xl font-bold text-white/95">{formatCurrency(totalInvested)}</p>
              <p className="text-xs text-white/60 mt-1">MAD</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <p className="text-xs text-white/60 uppercase tracking-wider mb-1">Current Value</p>
              <p className="text-2xl font-bold text-white/95">{formatCurrency(totalValue)}</p>
              <p className="text-xs text-white/60 mt-1">MAD</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-white/60 uppercase tracking-wider mb-1">Total Gain</p>
                  <p className={`text-2xl font-bold ${totalGain >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
                    {totalGain >= 0 ? '+' : ''}{formatCurrency(totalGain)}
                  </p>
                  <p className={`text-xs mt-1 ${totalGain >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
                    {totalGain >= 0 ? '+' : ''}{totalGainPercent.toFixed(2)}% • MAD
                  </p>
                </div>
                {totalGain >= 0 ? (
                  <TrendingUp className="w-8 h-8 text-emerald-300" />
                ) : (
                  <TrendingDown className="w-8 h-8 text-rose-300" />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Holdings List - Compact and Beautiful */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {portfolioWithPrices.map((holding, index) => {
          const isProfit = (holding.totalGain || 0) >= 0
          const isTopPerformer = holding.symbol === topPerformer.symbol && (holding.totalGainPercent || 0) > 0

          return (
            <div
              key={`${holding.symbol}-${holding.bank_id}`}
              className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
            >
              {/* Top Performer Badge */}
              {isTopPerformer && (
                <div className="absolute -top-2 -right-2 z-10 flex items-center gap-1 bg-gradient-to-r from-amber-500 to-amber-600 text-white px-2 py-1 rounded-full text-xs font-semibold shadow-lg border border-amber-400/30">
                  <Crown className="w-3 h-3" />
                  <span>Top</span>
                </div>
              )}

              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                    {holding.company_name}
                  </h4>
                  <span className="inline-block px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium rounded mt-1">
                    {holding.symbol}
                  </span>
                </div>
              </div>

              {/* Price Info */}
              <div className="space-y-2 mb-3">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-slate-500 dark:text-slate-400">Current</span>
                  <div className="text-right">
                    <span className="text-lg font-bold text-slate-900 dark:text-white">
                      {formatCurrency(holding.currentPrice || 0)}
                    </span>
                    {holding.priceChange !== undefined && (
                      <div className={`flex items-center justify-end text-xs mt-0.5 ${
                        holding.priceChange >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                      }`}>
                        {holding.priceChange >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                        {holding.priceChange >= 0 ? '+' : ''}{formatCurrency(Math.abs(holding.priceChange))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-slate-500 dark:text-slate-400">Bought at</span>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {formatCurrency(holding.avg_buy_price)}
                  </span>
                </div>

                <div className="flex items-baseline justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">{holding.total_quantity} shares</span>
                  <span className="text-slate-500 dark:text-slate-400">
                    Value: {formatCurrency(holding.currentValue || 0)}
                  </span>
                </div>
              </div>

              {/* Gain/Loss Badge */}
              <div className={`flex items-center justify-between p-2 rounded-lg ${
                isProfit
                  ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800'
              }`}>
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  {isProfit ? 'Gain' : 'Loss'}
                </span>
                <div className="text-right">
                  <p className={`text-sm font-bold ${
                    isProfit ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                  }`}>
                    {isProfit ? '+' : ''}{formatCurrency(holding.totalGain || 0)}
                  </p>
                  <p className={`text-xs ${
                    isProfit ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                  }`}>
                    {isProfit ? '+' : ''}{(holding.totalGainPercent || 0).toFixed(2)}%
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}