import { Calendar, Building2, Target, RotateCcw, TrendingUp } from 'lucide-react'
import { format } from 'date-fns'
import { ObjectiveTransaction } from '../../types/transaction'

interface TransactionTableRowProps {
  transaction: ObjectiveTransaction
  onReturn: (transaction: ObjectiveTransaction) => void
}

export function TransactionTableRow({ transaction, onReturn }: TransactionTableRowProps) {
  // Check if this is a stock transaction by looking at the description
  const isStockTransaction = transaction.description?.includes('Stock Purchase:') || 
                            transaction.description?.includes('Stock Sale:')

  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-dark-100">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          {format(new Date(transaction.created_at), 'MMM dd, yyyy HH:mm')}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-dark-300">
        <div className="flex items-center gap-2">
          {transaction.description || '-'}
          {isStockTransaction && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
              <TrendingUp className="w-3 h-3 mr-1" />
              Stock
            </span>
          )}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-dark-300">
        <div className="flex items-center gap-1">
          <Target className="w-4 h-4 text-gray-400" /> {transaction.objective_name}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-dark-300">
        <div className="flex items-center gap-1">
          <Building2 className="w-4 h-4 text-gray-400" /> {transaction.bank_name}
        </div>
      </td>
      <td className={`px-6 py-4 whitespace-nowrap text-right text-sm font-bold ${
        transaction.amount >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
      }`}>
        {transaction.amount >= 0 ? '+' : ''}{transaction.amount.toFixed(2)} MAD
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        {/* Only show return button for negative amounts (withdrawals) and non-stock transactions */}
        {transaction.amount < 0 && !isStockTransaction && (
          <button
            onClick={() => onReturn(transaction)}
            className="inline-flex items-center gap-1 px-3 py-1 rounded-md text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
            title="Return Money"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        )}
      </td>
    </tr>
  )
}