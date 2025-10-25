import { TrendingUp, TrendingDown, DollarSign, ShoppingBag, Crown, Sparkles } from 'lucide-react'
import { StockProfitLoss } from '../../types/stock'

interface StockProfitSummaryProps {
  profitLoss: StockProfitLoss[]
}

export function StockProfitSummary({ profitLoss }: StockProfitSummaryProps) {
  if (profitLoss.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="flex items-center justify-center w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full mx-auto mb-3 border border-slate-200 dark:border-slate-700">
          <DollarSign className="w-6 h-6 text-slate-400 dark:text-slate-500" />
        </div>
        <p className="text-slate-500 dark:text-slate-400 mb-1 text-sm">No P&L data available</p>
        <p className="text-xs text-slate-400 dark:text-slate-500">
          Complete transactions to track your performance
        </p>
      </div>
    )
  }

  // Find top performer for premium badge
  const topPerformer = profitLoss.reduce((top, current) => {
    const currentPercent = current.total_invested > 0 
      ? (current.net_profit_loss / current.total_invested) * 100 
      : 0
    const topPercent = top.total_invested > 0 
      ? (top.net_profit_loss / top.total_invested) * 100 
      : 0
    return currentPercent > topPercent ? current : top
  })

  return (
    <div className="space-y-3">
      {profitLoss.map((item) => {
        const profitPercent = item.total_invested > 0 
          ? (item.net_profit_loss / item.total_invested) * 100 
          : 0
        const isProfit = item.net_profit_loss >= 0
        const isTopPerformer = item.symbol === topPerformer.symbol && profitPercent > 0

        return (
          <div
            key={`${item.symbol}`}
            className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-premium hover:shadow-premium-lg transition-all duration-300 hover:border-slate-300 dark:hover:border-slate-600"
          >
            {/* Top Performer Badge */}
            {isTopPerformer && (
              <div className="absolute -top-2 -left-2 z-10 flex items-center gap-1 bg-gradient-to-r from-amber-500 to-amber-600 text-white px-2 py-1 rounded-full text-xs font-semibold shadow-lg border border-amber-400/30">
                <Crown className="w-3 h-3" />
                <span>Top</span>
              </div>
            )}

            {/* Background Glow */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>

            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="text-base font-semibold text-slate-900 dark:text-white truncate">
                    {item.company_name}
                  </h3>
                  <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 whitespace-nowrap">
                    {item.symbol}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {item.buy_count} purchase{item.buy_count !== 1 ? 's' : ''} • {item.sell_count} sale{item.sell_count !== 1 ? 's' : ''}
                </p>
              </div>

              {/* Premium Profit/Loss Indicator */}
              <div className="text-right ml-3">
                <div
                  className={`inline-flex items-center space-x-1 px-3 py-2 rounded-lg border backdrop-blur-sm ${
                    isProfit
                      ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800'
                      : 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800'
                  }`}
                >
                  {isProfit ? (
                    <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                  )}
                  <div>
                    <p
                      className={`text-sm font-bold ${
                        isProfit
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {isProfit ? '+' : ''}{item.net_profit_loss.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })} MAD
                    </p>
                    <p
                      className={`text-xs ${
                        isProfit
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {isProfit ? '+' : ''}{profitPercent.toFixed(2)}%
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Compact Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-2 border border-slate-100 dark:border-slate-700">
                <div className="flex items-center space-x-1 mb-1">
                  <ShoppingBag className="w-3 h-3 text-slate-600 dark:text-slate-400" />
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">Invested</span>
                </div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  {item.total_invested.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })} MAD
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-2 border border-slate-100 dark:border-slate-700">
                <div className="flex items-center space-x-1 mb-1">
                  <DollarSign className="w-3 h-3 text-slate-600 dark:text-slate-400" />
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">Revenue</span>
                </div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  {item.total_revenue.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })} MAD
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-2 border border-slate-100 dark:border-slate-700">
                <div className="flex items-center space-x-1 mb-1">
                  <TrendingUp className="w-3 h-3 text-slate-600 dark:text-slate-400" />
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">Net P&L</span>
                </div>
                <p
                  className={`text-sm font-semibold ${
                    isProfit
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {isProfit ? '+' : ''}{item.net_profit_loss.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })} MAD
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-2 border border-slate-100 dark:border-slate-700">
                <div className="flex items-center space-x-1 mb-1">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">Return</span>
                </div>
                <p
                  className={`text-sm font-semibold ${
                    isProfit
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {isProfit ? '+' : ''}{profitPercent.toFixed(2)}%
                </p>
              </div>
            </div>

            {/* Performance Bar */}
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                <span>Performance</span>
                <span>{profitPercent >= 0 ? '+' : ''}{profitPercent.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-1.5 rounded-full transition-all duration-700 ease-out ${
                    isProfit
                      ? 'bg-gradient-to-r from-emerald-500 to-emerald-600'
                      : 'bg-gradient-to-r from-rose-500 to-rose-600'
                  }`}
                  style={{ width: `${Math.min(Math.abs(profitPercent), 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Decorative Element */}
            <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-30 transition-opacity duration-300">
              <Sparkles className="w-4 h-4 text-slate-400" />
            </div>
          </div>
        )
      })}
    </div>
  )
}