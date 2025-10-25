import { format } from 'date-fns'
import { Trash2, TrendingUp, TrendingDown } from 'lucide-react'
import { StockTransactionWithDetails } from '../../types/stock'

interface StockTransactionListProps {
  transactions: StockTransactionWithDetails[]
  onDelete: (id: string) => void
}

export function StockTransactionList({ transactions, onDelete }: StockTransactionListProps) {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="flex items-center justify-center w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full mx-auto mb-3">
          <TrendingUp className="w-6 h-6 text-slate-400" />
        </div>
        <p className="text-slate-500 dark:text-slate-400 text-sm">Aucune transaction</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {transactions.map((transaction) => (
        <div
          key={transaction.id}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3 hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1">
              {/* Icône simple */}
              <div
                className={`p-2 rounded-lg ${
                  transaction.transaction_type === 'BUY'
                    ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                    : 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400'
                }`}
              >
                {transaction.transaction_type === 'BUY' ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
              </div>

              {/* Contenu principal */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <h4 className="font-semibold text-slate-900 dark:text-white text-sm">
                    {transaction.company_name}
                  </h4>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {transaction.symbol}
                  </span>
                </div>

                <div className="flex items-center space-x-4 text-sm text-slate-600 dark:text-slate-400">
                  <span>{transaction.quantity} actions</span>
                  <span>à {transaction.price_per_share.toFixed(2)} MAD</span>
                  <span className="font-medium text-slate-900 dark:text-white">
                    {transaction.total_amount.toFixed(2)} MAD
                  </span>
                </div>

                <div className="flex items-center space-x-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
                  <span>{transaction.bank_name}</span>
                  <span>•</span>
                  <span>{format(new Date(transaction.transaction_date), 'dd/MM/yyyy')}</span>
                </div>
              </div>
            </div>

            {/* Action supprimer */}
            <button
              onClick={() => onDelete(transaction.id)}
              className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
              title="Supprimer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}