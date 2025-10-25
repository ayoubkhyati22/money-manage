import { TrendingUp, TrendingDown, DollarSign, ShoppingBag } from 'lucide-react'
import { StockProfitLoss } from '../../types/stock'

interface StockProfitSummaryProps {
  profitLoss: StockProfitLoss[]
}

export function StockProfitSummary({ profitLoss }: StockProfitSummaryProps) {
  if (profitLoss.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-dark-700 rounded-full mx-auto mb-4">
          <DollarSign className="w-8 h-8 text-gray-400 dark:text-dark-400" />
        </div>
        <p className="text-gray-500 dark:text-dark-300 mb-2">No profit/loss data</p>
        <p className="text-sm text-gray-400 dark:text-dark-400">
          Complete buy and sell transactions to see your profits
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {profitLoss.map((item) => {
        const profitPercent = item.total_invested > 0 
          ? (item.net_profit_loss / item.total_invested) * 100 
          : 0
        const isProfit = item.net_profit_loss >= 0

        return (
          <div
            key={`${item.symbol}`}
            className="bg-gradient-to-r from-gray-50 to-white dark:from-dark-700 dark:to-dark-800 border border-gray-200 dark:border-dark-600 rounded-xl p-6 hover:shadow-lg transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-100 mb-1">
                  {item.company_name}
                </h3>
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-medium rounded">
                  {item.symbol}
                </span>
              </div>

              <div className="text-right">
                <div
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
                    isProfit
                      ? 'bg-green-100 dark:bg-green-900/30'
                      : 'bg-red-100 dark:bg-red-900/30'
                  }`}
                >
                  {isProfit ? (
                    <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
                  )}
                  <div>
                    <p
                      className={`text-lg font-bold ${
                        isProfit
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}
                    >
                      {isProfit ? '+' : ''}{item.net_profit_loss.toFixed(2)} MAD
                    </p>
                    <p
                      className={`text-xs ${
                        isProfit
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}
                    >
                      {isProfit ? '+' : ''}{profitPercent.toFixed(2)}%
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-dark-900/50 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-2">
                  <ShoppingBag className="w-4 h-4 text-blue-500" />
                  <span className="text-xs text-gray-500 dark:text-dark-400">Invested</span>
                </div>
                <p className="text-sm font-semibold text-gray-900 dark:text-dark-100">
                  {item.total_invested.toFixed(2)} MAD
                </p>
                <p className="text-xs text-gray-500 dark:text-dark-400">
                  {item.buy_count} {item.buy_count === 1 ? 'purchase' : 'purchases'}
                </p>
              </div>

              <div className="bg-white dark:bg-dark-900/50 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-2">
                  <DollarSign className="w-4 h-4 text-green-500" />
                  <span className="text-xs text-gray-500 dark:text-dark-400">Revenue</span>
                </div>
                <p className="text-sm font-semibold text-gray-900 dark:text-dark-100">
                  {item.total_revenue.toFixed(2)} MAD
                </p>
                <p className="text-xs text-gray-500 dark:text-dark-400">
                  {item.sell_count} {item.sell_count === 1 ? 'sale' : 'sales'}
                </p>
              </div>

              <div className="bg-white dark:bg-dark-900/50 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-purple-500" />
                  <span className="text-xs text-gray-500 dark:text-dark-400">Net P/L</span>
                </div>
                <p
                  className={`text-sm font-semibold ${
                    isProfit
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {isProfit ? '+' : ''}{item.net_profit_loss.toFixed(2)} MAD
                </p>
              </div>

              <div className="bg-white dark:bg-dark-900/50 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-xs text-gray-500 dark:text-dark-400">Return</span>
                </div>
                <p
                  className={`text-sm font-semibold ${
                    isProfit
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {isProfit ? '+' : ''}{profitPercent.toFixed(2)}%
                </p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
