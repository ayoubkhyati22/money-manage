import { Plus, CreditCard } from 'lucide-react'

interface BankHeaderProps {
  onAddClick: () => void
}

export function BankHeader({ onAddClick }: BankHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <div className="flex items-center justify-center w-9 h-9 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg shadow-md">
          <CreditCard className="w-4 h-4 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-dark-100">Banks</h2>
          <p className="text-xs text-gray-500 dark:text-dark-300">Manage your banks</p>
        </div>
      </div>
      <button
        onClick={onAddClick}
        className="flex items-center space-x-1.5 bg-gradient-to-r from-emerald-500 to-emerald-600 dark:from-primary-500 dark:to-primary-600 hover:from-emerald-600 hover:to-emerald-700 dark:hover:from-primary-600 dark:hover:to-primary-700 text-white font-medium px-3 py-2 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
      >
        <Plus className="w-3.5 h-3.5" />
        <span className="text-sm">Add Bank</span>
      </button>
    </div>

  )
}
