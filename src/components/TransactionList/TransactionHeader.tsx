import { Filter, RotateCcw, CheckSquare } from 'lucide-react'

interface TransactionHeaderProps {
  showWithdrawnOnly: boolean
  isSelectionMode: boolean
  onToggleFilter: () => void
  onToggleSelectionMode: () => void
  onRefresh: () => void
}

export function TransactionHeader({
  showWithdrawnOnly,
  isSelectionMode,
  onToggleFilter,
  onToggleSelectionMode,
  onRefresh
}: TransactionHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-7">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-dark-100">
        Transaction History
      </h2>
      <div className="flex items-center gap-2 sm:gap-3"> 
        <button
          onClick={onToggleSelectionMode}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            isSelectionMode
              ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-dark-700 dark:text-dark-200 dark:hover:bg-dark-600'
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          {isSelectionMode ? 'Cancel' : 'Select'}
        </button>
        <button
          onClick={onToggleFilter}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors
          ${showWithdrawnOnly
            ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-dark-700 dark:text-dark-200'
          }`}
        >
          <Filter className="w-4 h-4" />
          {showWithdrawnOnly ? 'Withdrawn Only' : 'All'}
        </button>
        <button
          onClick={onRefresh}
          className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-dark-600 text-emerald-600 dark:text-emerald-400 transition-colors"
          title="Refresh"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}