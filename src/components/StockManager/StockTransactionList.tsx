import { format } from 'date-fns'
import { Trash2, TrendingUp, TrendingDown, Calendar, Building2 } from 'lucide-react'
import { StockTransactionWithDetails } from '../../types/stock'

interface StockTransactionListProps {
  transactions: StockTransactionWithDetails[]
  onDelete: (id: string) => void
}

export function StockTransactionList({ transactions, onDelete }: StockTransactionListProps) {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-dark-700 rounded-full mx-auto mb-4">
          <TrendingUp className="w-8 h-8 text-gray-400 dark:text-dark-400" />
        </div>
        <p className="text-gray-500 dark:text-dark-300 mb-2">No transactions yet</p>
        <p className="text-sm text-gray-400 dark:text-dark-400">
          Start by adding your first stock transaction
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {transactions.map((transaction) => (
        <div
          key={transaction.id}
          className="bg-gradient-to-r from-gray-50 to-white dark:from-dark-700 dark:to-dark-800 border border-gray-200 dark:border-dark-600 rounded-xl p-4 hover:shadow-md transition-all duration-300"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4 flex-1">
              {/* Icon */}
              <div
                className={`flex items-center justify-center w-12 h-12 rounded-xl ${
                  transaction.transaction_type === 'BUY'
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                    : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                }`}
              >
                {transaction.transaction_type === 'BUY' ? (
                  <TrendingUp className="w-6 h-6" />
                ) : (
                  <TrendingDown className="w-6 h-6" />
                )}
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <h4 className="font-semibold text-gray-900 dark:text-dark-100">
                    {transaction.company_name}
                  </h4>
                  <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-medium rounded">
                    {transaction.symbol}
                  </span>
                  <span
                    className={`px-2 py-0.5 text-xs font-medium rounded ${
                      transaction.transaction_type === 'BUY'
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                        : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                    }`}
                  >
                    {transaction.transaction_type}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm text-gray-600 dark:text-dark-300 mb-2">
                  <div>
                    <span className="text-xs text-gray-500 dark:text-dark-400">Quantity:</span>
                    <p className="font-medium text-gray-900 dark:text-dark-100">
                      {transaction.quantity}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 dark:text-dark-400">Price:</span>
                    <p className="font-medium text-gray-900 dark:text-dark-100">
                      {transaction.price_per_share.toFixed(2)} MAD
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 dark:text-dark-400">Total:</span>
                    <p className="font-medium text-gray-900 dark:text-dark-100">
                      {transaction.total_amount.toFixed(2)} MAD
                    </p>
                  </div>
                  {transaction.fees > 0 && (
                    <div>
                      <span className="text-xs text-gray-500 dark:text-dark-400">Fees:</span>
                      <p className="font-medium text-gray-900 dark:text-dark-100">
                        {transaction.fees.toFixed(2)} MAD
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-dark-400">
                  <div className="flex items-center space-x-1">
                    <Building2 className="w-3 h-3" />
                    <span>{transaction.bank_name}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-3 h-3" />
                    <span>{format(new Date(transaction.transaction_date), 'MMM dd, yyyy')}</span>
                  </div>
                </div>

                {transaction.notes && (
                  <p className="text-xs text-gray-500 dark:text-dark-400 italic mt-2">
                    "{transaction.notes}"
                  </p>
                )}
              </div>
            </div>

            {/* Actions */}
            <button
              onClick={() => onDelete(transaction.id)}
              className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
              title="Delete Transaction"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
