import { useState, useEffect } from 'react'
import { Briefcase, TrendingUp } from 'lucide-react'
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
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (portfolio.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-dark-700 rounded-full mx-auto mb-4">
          <Briefcase className="w-8 h-8 text-gray-400 dark:text-dark-400" />
        </div>
        <p className="text-gray-500 dark:text-dark-300 mb-2">No holdings yet</p>
        <p className="text-sm text-gray-400 dark:text-dark-400">
          Your current stock holdings will appear here
        </p>
      </div>
    )
  }

  const totalPortfolioValue = portfolio.reduce((sum, item) => sum + item.total_invested, 0)

  return (
    <div className="space-y-6">
      {/* Portfolio Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-dark-300 mb-1">Total Portfolio Value</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-dark-100">
              {totalPortfolioValue.toFixed(2)} MAD
            </p>
          </div>
          <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
            <Briefcase className="w-8 h-8 text-white" />
          </div>
        </div>
      </div>

      {/* Holdings List */}
      <div className="space-y-4">
        {portfolio.map((holding) => {
          const currentValue = holding.total_quantity * holding.avg_buy_price
          const percentOfPortfolio = (currentValue / totalPortfolioValue) * 100

          return (
            <div
              key={`${holding.symbol}-${holding.bank_id}`}
              className="bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-600 rounded-xl p-6 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-100">
                      {holding.company_name}
                    </h3>
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-medium rounded">
                      {holding.symbol}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-dark-300">
                    {holding.total_quantity} shares @ {holding.avg_buy_price.toFixed(2)} MAD avg
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900 dark:text-dark-100">
                    {currentValue.toFixed(2)} MAD
                  </p>
                  <p className="text-xs text-gray-500 dark:text-dark-400">
                    {percentOfPortfolio.toFixed(1)}% of portfolio
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="w-full bg-gray-200 dark:bg-dark-600 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(percentOfPortfolio, 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-50 dark:bg-dark-700 rounded-lg p-3">
                  <p className="text-xs text-gray-500 dark:text-dark-400 mb-1">Total Invested</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-dark-100">
                    {holding.total_invested.toFixed(2)} MAD
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-dark-700 rounded-lg p-3">
                  <p className="text-xs text-gray-500 dark:text-dark-400 mb-1">Shares</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-dark-100">
                    {holding.total_quantity}
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-dark-700 rounded-lg p-3">
                  <p className="text-xs text-gray-500 dark:text-dark-400 mb-1">Avg Price</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-dark-100">
                    {holding.avg_buy_price.toFixed(2)} MAD
                  </p>
                </div>
              </div>

              {holding.total_sold > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-dark-600">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-dark-300">Total Sold:</span>
                    <span className="font-semibold text-gray-900 dark:text-dark-100">
                      {holding.total_sold.toFixed(2)} MAD
                    </span>
                  </div>
                  {holding.last_sell_price && (
                    <div className="flex items-center justify-between text-sm mt-1">
                      <span className="text-gray-600 dark:text-dark-300">Last Sell Price:</span>
                      <span className="font-semibold text-gray-900 dark:text-dark-100">
                        {holding.last_sell_price.toFixed(2)} MAD
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
