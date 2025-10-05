import { Calendar, Building2, Target, ArrowDownCircle, RotateCcw } from 'lucide-react'
import { format } from 'date-fns'
import { ObjectiveTransaction } from '../../types/transaction'

interface TransactionCardProps {
  transaction: ObjectiveTransaction
  onReturn: (transaction: ObjectiveTransaction) => void
}

export function TransactionCard({ transaction, onReturn }: TransactionCardProps) {
  const isPositive = transaction.amount >= 0

  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center sm:justify-between rounded-2xl p-4 sm:p-5 border transition-all duration-300 ${
        isPositive
          ? 'border-green-100 dark:border-green-800/40 bg-green-50/50 dark:bg-green-950/10'
          : 'border-red-100 dark:border-red-800/40 bg-red-50/50 dark:bg-red-950/10'
      } hover:shadow-lg hover:scale-[1.01]`}
    >
      {/* Left Side */}
      <div className="flex items-start gap-4">
        <div
          className={`flex items-center justify-center w-12 h-12 rounded-xl ${
            isPositive
              ? 'bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400'
              : 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400'
          }`}
        >
          {isPositive ? <Target className="w-6 h-6" /> : <ArrowDownCircle className="w-6 h-6" />}
        </div>

        <div className="flex flex-col text-sm sm:text-base text-gray-700 dark:text-dark-200">
          <div className="flex items-center gap-2 text-gray-500 dark:text-dark-300 text-xs sm:text-sm">
            <Calendar className="w-4 h-4 text-gray-400" />
            {format(new Date(transaction.created_at), 'MMM dd, yyyy HH:mm')}
          </div>

          <div className="flex items-center gap-2 mt-1">
            <Building2 className="w-4 h-4 text-gray-400" />
            <span className="font-medium">{transaction.bank_name}</span>
          </div>

          <div className="flex items-center gap-2 mt-1">
            <Target className="w-4 h-4 text-gray-400" />
            <span className="font-medium">{transaction.objective_name}</span>
          </div>

          {transaction.description && (
            <p className="italic text-gray-500 dark:text-dark-400 mt-2 text-xs sm:text-sm leading-snug line-clamp-2">
              “{transaction.description}”
            </p>
          )}
        </div>
      </div>

      {/* Right Side */}
      <div className="flex items-center justify-between sm:justify-end gap-3 mt-4 sm:mt-0">
        <div className="text-right">
          <p
            className={`text-lg sm:text-xl font-semibold ${
              isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            }`}
          >
            {isPositive ? '+' : ''}
            {transaction.amount.toFixed(2)} MAD
          </p>
          <p className="text-xs text-gray-500 dark:text-dark-400">
            {isPositive ? 'Added' : 'Withdrawn'}
          </p>
        </div>

        {!isPositive && (
          <button
            onClick={() => onReturn(transaction)}
            className="p-2 rounded-xl text-gray-400 dark:text-dark-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200"
            title="Return Money"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  )
}
