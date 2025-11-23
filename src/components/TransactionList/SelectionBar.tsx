import { CheckSquare, RotateCcw, X } from 'lucide-react'

interface SelectionBarProps {
  selectedCount: number
  selectedTotal: number
  selectableCount: number
  onReturnSelected: () => void
  onSelectAll: () => void
}

export function SelectionBar({ 
  selectedCount, 
  selectedTotal, 
  selectableCount,
  onReturnSelected,
  onSelectAll 
}: SelectionBarProps) {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-3 sm:p-4 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        {/* Left side - Selection info */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {selectedCount} selected
            </span>
          </div>
          {selectedCount > 0 && (
            <div className="flex items-center gap-2 px-3 py-1 bg-white dark:bg-dark-800 rounded-lg border border-blue-300 dark:border-blue-700">
              <span className="text-xs text-gray-500 dark:text-gray-400">Total:</span>
              <span className="text-sm font-bold text-red-600 dark:text-red-400">
                {selectedTotal.toFixed(2)} MAD
              </span>
            </div>
          )}
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onSelectAll}
            disabled={selectableCount === 0}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckSquare className="w-4 h-4" />
            {selectedCount === selectableCount && selectableCount > 0 ? 'Deselect All' : 'Select All'}
          </button>

          {selectedCount > 0 && (
            <button
              onClick={onReturnSelected}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white text-sm font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
            >
              <RotateCcw className="w-4 h-4" />
              Return Selected
            </button>
          )}
        </div>
      </div>
    </div>
  )
}