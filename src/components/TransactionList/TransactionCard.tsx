import { Calendar, Building2, Target, ArrowDownCircle, RotateCcw } from 'lucide-react'
import { format } from 'date-fns'
import { ObjectiveTransaction } from '../../types/transaction'

interface TransactionCardProps {
  transaction: ObjectiveTransaction
  onReturn: (transaction: ObjectiveTransaction) => void
}

export function TransactionCard({ transaction, onReturn }: TransactionCardProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border border-gray-200 dark:border-dark-600 rounded-lg p-4 bg-white dark:bg-dark-800 hover:shadow-md transition">
      <div className="flex items-start gap-3">
        <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${
          transaction.amount >= 0 ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'
        }`}>
          {transaction.amount >= 0 ? (
            <Target className="w-5 h-5 text-green-600 dark:text-green-400" />
          ) : (
            <ArrowDownCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
          )}
        </div>
        <div className="text-sm">
          <div className="flex items-center gap-1 text-gray-600 dark:text-dark-300">
            <Calendar className="w-4 h-4 text-gray-400" />
            {format(new Date(transaction.created_at), 'MMM dd, yyyy HH:mm')}
          </div>
          <div className="flex items-center gap-1 mt-1 text-gray-600 dark:text-dark-300">
            <Building2 className="w-4 h-4 text-gray-400" /> {transaction.bank_name}
          </div>
          <div className="flex items-center gap-1 mt-1 text-gray-600 dark:text-dark-300">
            <Target className="w-4 h-4 text-gray-400" /> {transaction.objective_name}
          </div>
          {transaction.description && (
            <p className="italic text-gray-500 dark:text-dark-400 mt-1">
              "{transaction.description}"
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-3 mt-3 sm:mt-0">
        <div className="text-right">
          <p className={`text-lg font-bold ${transaction.amount >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {transaction.amount >= 0 ? '+' : ''}{transaction.amount.toFixed(2)} MAD
          </p>
          <p className="text-xs text-gray-500 dark:text-dark-400">
            {transaction.amount >= 0 ? 'Added' : 'Withdrawn'}
          </p>
        </div>
        {transaction.amount < 0 && (
          <button
            onClick={() => onReturn(transaction)}
            className="p-2 rounded-lg text-gray-400 dark:text-dark-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
            title="Return Money"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}
