import { useState, useEffect } from 'react'
import { Briefcase, TrendingUp, Crown, Sparkles } from 'lucide-react'
import { stockService } from '../../services/stockService'
import { StockPortfolio } from '../../types/stock'

interface StockPortfolioViewProps {
  userId: string
}

export function StockPortfolioView({ userId }: StockPortfolioViewProps) {
  const [portfolio, setPortfolio] = useState<StockPortfolio[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPortfolio()
  }, [userId])

  const loadPortfolio = async () => {
    if (!userId) return
    setLoading(true)
    try {
      const data = await stockService.fetchPortfolio(userId)
      setPortfolio(data)
    } catch (error) {
      console.error('Error loading portfolio:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-600"></div>
      </div>
    )
  }

  if (portfolio.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="flex items-center justify-center w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full mx-auto mb-3 border border-slate-200 dark:border-slate-700">
          <Briefcase className="w-6 h-6 text-slate-400 dark:text-slate-500" />
        </div>
        <p className="text-slate-500 dark:text-slate-400 mb-1 text-sm">No holdings yet</p>
        <p className="text-xs text-slate-400 dark:text-slate-500">
          Your current stock holdings will appear here
        </p>
      </div>
    )
  }

  const totalPortfolioValue = portfolio.reduce((sum, item) => sum + item.total_invested, 0)

  return (
    <div className="space-y-4">
      {/* Premium Portfolio Summary */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 rounded-xl p-4 text-white shadow-premium border border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-white/60 uppercase tracking-wider mb-1">Total Portfolio Value</p>
            <p className="text-2xl font-bold text-white/95">
              {totalPortfolioValue.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })} MAD
            </p>
            <p className="text-xs text-white/60 mt-1">
              {portfolio.length} holding{portfolio.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="relative">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl border border-amber-400/30 shadow-lg">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white shadow-sm"></div>
          </div>
        </div>
      </div>

      {/* Premium Holdings List */}
      <div className="space-y-3">
        {portfolio.map((holding, index) => {
          const currentValue = holding.total_quantity * holding.avg_buy_price
          const percentOfPortfolio = (currentValue / totalPortfolioValue) * 100
          const isTopHolding = index === 0

          return (
            <div
              key={`${holding.symbol}-${holding.bank_id}`}
              className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-premium hover:shadow-premium-lg transition-all duration-300 hover:border-slate-300 dark:hover:border-slate-600"
            >
              {/* Premium badge for top holding */}
              {isTopHolding && (
                <div className="absolute -top-2 -left-2 z-10 flex items-center gap-1 bg-gradient-to-r from-amber-500 to-amber-600 text-white px-2 py-1 rounded-full text-xs font-semibold shadow-lg border border-amber-400/30">
                  <Crown className="w-3 h-3" />
                  <span>Top</span>
                </div>
              )}

              {/* Background glow effect */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>

              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-base font-semibold text-slate-900 dark:text-white truncate">
                      {holding.company_name}
                    </h3>
                    <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 whitespace-nowrap">
                      {holding.symbol}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {holding.total_quantity} shares • {holding.avg_buy_price.toFixed(2)} MAD avg
                  </p>
                </div>

                <div className="text-right ml-3">
                  <p className="text-lg font-bold text-slate-900 dark:text-white">
                    {currentValue.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })} MAD
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {percentOfPortfolio.toFixed(1)}% of portfolio
                  </p>
                </div>
              </div>

              {/* Premium Progress Bar */}
              <div className="mb-3">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                  <span>Allocation</span>
                  <span>{percentOfPortfolio.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-slate-600 to-slate-800 dark:from-slate-400 dark:to-slate-600 h-1.5 rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${Math.min(percentOfPortfolio, 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Compact Details Grid */}
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-2 border border-slate-100 dark:border-slate-700">
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Invested</p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {holding.total_invested.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })} MAD
                  </p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-2 border border-slate-100 dark:border-slate-700">
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Shares</p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {holding.total_quantity.toLocaleString()}
                  </p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-2 border border-slate-100 dark:border-slate-700">
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Avg Price</p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {holding.avg_buy_price.toFixed(2)} MAD
                  </p>
                </div>
              </div>

              {/* Sales Information */}
              {holding.total_sold > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400">Total Sold:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {holding.total_sold.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })} MAD
                    </span>
                  </div>
                  {holding.last_sell_price && (
                    <div className="flex items-center justify-between text-xs mt-1">
                      <span className="text-slate-500 dark:text-slate-400">Last Sell:</span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {holding.last_sell_price.toFixed(2)} MAD
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Decorative corner */}
              <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-30 transition-opacity duration-300">
                <Sparkles className="w-4 h-4 text-slate-400" />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}