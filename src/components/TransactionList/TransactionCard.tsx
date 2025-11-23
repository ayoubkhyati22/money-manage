import { Calendar, Building2, Target, ArrowDownCircle, TrendingUp, RotateCcw } from 'lucide-react'
import { format } from 'date-fns'
import { ObjectiveTransaction } from '../../types/transaction'

interface TransactionCardProps {
  transaction: ObjectiveTransaction
  isSelectionMode: boolean
  isSelected: boolean
  onReturn: (transaction: ObjectiveTransaction) => void
  onToggleSelection: (transactionId: string) => void
}

export function TransactionCard({ 
  transaction, 
  isSelectionMode, 
  isSelected,
  onReturn, 
  onToggleSelection 
}: TransactionCardProps) {
  const isPositive = transaction.amount >= 0
  
  // Check if this is a stock transaction by looking at the description
  const isStockTransaction = transaction.description?.includes('Stock Purchase:') || 
                            transaction.description?.includes('Stock Sale:')
  
  // Can only select negative (withdrawal) transactions that are not stock transactions
  const isSelectable = transaction.amount < 0 && !isStockTransaction

  const handleCardClick = () => {
    if (isSelectionMode && isSelectable) {
      onToggleSelection(transaction.id)
    }
  }

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  return (
    <div 
      onClick={handleCardClick}
      className={`flex items-center justify-between rounded-xl p-3 border transition-all duration-200 ${
        isSelected 
          ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-400 dark:border-blue-600 shadow-md' 
          : 'bg-white dark:bg-dark-800 border-gray-200 dark:border-dark-700 hover:shadow-md'
      } ${isSelectionMode && isSelectable ? 'cursor-pointer' : ''}`}
    >
      {/* Checkbox in selection mode */}
      {isSelectionMode && (
        <div className="flex-shrink-0 mr-3" onClick={handleCheckboxClick}>
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => {}}
            disabled={!isSelectable}
            className={`w-5 h-5 rounded border-gray-300 dark:border-dark-600 ${
              isSelectable 
                ? 'text-blue-600 focus:ring-blue-500 cursor-pointer' 
                : 'opacity-30 cursor-not-allowed'
            }`}
          />
        </div>
      )}

      {/* Left: Icon + Main Info */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* Icon */}
        <div
          className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
            isPositive
              ? 'bg-primary-100 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
              : 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400'
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
          
          {/* Show a small badge for stock transactions */}
          {isStockTransaction && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 mt-1">
              Stock
            </span>
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
                : 'text-red-600 dark:text-red-400'
            }`}
          >
            {isPositive ? '+' : ''}
            {transaction.amount.toFixed(2)}
          </p>
          <p className="text-[10px] text-gray-400 dark:text-dark-500 uppercase tracking-wide">
            MAD
          </p>
        </div>

        {/* Only show return button for non-positive, non-stock transactions when not in selection mode */}
        {!isSelectionMode && !isPositive && !isStockTransaction && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onReturn(transaction)
            }}
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