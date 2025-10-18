import { Calendar, Building2, Target, ArrowDownCircle, TrendingUp, RotateCcw } from 'lucide-react'
import { format } from 'date-fns'
import { ObjectiveTransaction } from '../../types/transaction'

interface TransactionCardProps {
  transaction: ObjectiveTransaction
  onReturn: (transaction: ObjectiveTransaction) => void
}

export function TransactionCard({ transaction, onReturn }: TransactionCardProps) {
  const isPositive = transaction.amount >= 0

  return (
    <div className="flex items-center justify-between rounded-xl p-3 bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 hover:shadow-md transition-all duration-200">
      {/* Left: Icon + Main Info */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* Icon */}
        <div
          className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
            isPositive
              ? 'bg-primary-100 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
              : 'bg-accent-100 dark:bg-accent-900/20 text-accent-600 dark:text-accent-400'
          }`}
        >
          {isPositive ? <TrendingUp className="w-5 h-5" /> : <ArrowDownCircle className="w-5 h-5" />}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">
              {transaction.objective_name}
            </h3>
            <span className="text-xs text-gray-400 dark:text-dark-500">•</span>
            <span className="text-xs text-gray-500 dark:text-dark-400 truncate">
              {transaction.bank_name}
            </span>
          </div>
          
          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-dark-400">
            <Calendar className="w-3 h-3" />
            <span>{format(new Date(transaction.created_at), 'MMM dd, HH:mm')}</span>
          </div>

          {transaction.description && (
            <p className="text-xs text-gray-500 dark:text-dark-400 mt-1 line-clamp-1 italic">
              "{transaction.description}"
            </p>
          )}
        </div>
      </div>

      {/* Right: Amount + Action */}
      <div className="flex items-center gap-2 flex-shrink-0 ml-2">
        <div className="text-right">
          <p
            className={`text-base font-semibold whitespace-nowrap ${
              isPositive
                ? 'text-primary-600 dark:text-primary-400'
                : 'text-accent-600 dark:text-accent-400'
            }`}
          >
            {isPositive ? '+' : ''}
            {transaction.amount.toFixed(2)}
          </p>
          <p className="text-[10px] text-gray-400 dark:text-dark-500 uppercase tracking-wide">
            MAD
          </p>
        </div>

        {!isPositive && (
          <button
            onClick={() => onReturn(transaction)}
            className="p-1.5 rounded-lg text-cyan-500 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 transition-all duration-200"
            title="Return Money"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}