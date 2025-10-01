import { Filter, RotateCcw } from 'lucide-react'

interface TransactionHeaderProps {
  showWithdrawnOnly: boolean
  onToggleFilter: () => void
  onRefresh: () => void
}

export function TransactionHeader({
  showWithdrawnOnly,
  onToggleFilter,
  onRefresh
}: TransactionHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-dark-100">
        Transaction History
      </h2>
      <div className="flex items-center gap-3">
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
          className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-dark-600 text-emerald-600 dark:text-emerald-400"
          title="Refresh"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
