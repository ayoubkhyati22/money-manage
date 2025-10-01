import { Plus, CreditCard } from 'lucide-react'

interface BankHeaderProps {
  onAddClick: () => void
}

export function BankHeader({ onAddClick }: BankHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl shadow-lg">
          <CreditCard className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-dark-100">Banks</h2>
          <p className="text-sm text-gray-500 dark:text-dark-300">Manage your banks</p>
        </div>
      </div>
      <button
        onClick={onAddClick}
        className="flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-emerald-600 dark:from-primary-500 dark:to-primary-600 hover:from-emerald-600 hover:to-emerald-700 dark:hover:from-primary-600 dark:hover:to-primary-700 text-white font-semibold px-4 py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
      >
        <Plus className="w-4 h-4" />
        <span>Add Bank</span>
      </button>
    </div>
  )
}
