import { Bank } from '../../lib/supabase'
import type { Allocation } from '../../types/goal'
import { Edit2, Trash2, DollarSign } from 'lucide-react'

interface AllocationsListProps {
  allocations: Allocation[]
  banks: Bank[]
  onEditAllocation: (allocation: Allocation) => void
  onEditBankBalance: (allocation: Allocation) => void
  onDelete: (allocation: Allocation) => void
}

export function AllocationsList({ allocations, banks, onEditAllocation, onEditBankBalance, onDelete }: AllocationsListProps) {
  if (allocations.length === 0) {
    return <p className="text-gray-500 dark:text-dark-400 text-center py-8">No allocations yet</p>
  }

  return (
    <div className="space-y-3">
      {allocations.map((allocation) => {
        const bank = banks.find(b => b.id === allocation.bank_id)
        const bankBalance = bank ? Number(bank.balance) : 0

        return (
          <div key={allocation.id} className="flex items-center justify-between p-4 bg-white dark:bg-dark-700 border border-gray-200 dark:border-dark-600 rounded-lg">
            <div>
              <p className="font-medium text-gray-900 dark:text-dark-100">{allocation.bank_name}</p>
              <p className="text-sm text-gray-500 dark:text-dark-400">
                Allocated: {allocation.amount.toFixed(2)} MAD
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-lg font-semibold text-gray-900 dark:text-dark-100">
                  {bankBalance.toFixed(2)} MAD
                </p>
                <p className="text-xs text-gray-500 dark:text-dark-400">Bank Balance</p>
              </div>
              <div className="flex flex-col space-y-1">
                <button
                  onClick={() => onEditAllocation(allocation)}
                  className="p-1 text-gray-400 dark:text-dark-400 hover:text-blue-600 dark:hover:text-primary-400 transition-colors"
                  title="Edit Allocation"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onEditBankBalance(allocation)}
                  className="p-1 text-gray-400 dark:text-dark-400 hover:text-green-600 dark:hover:text-primary-400 transition-colors"
                  title="Edit Bank Balance"
                >
                  <DollarSign className="w-4 h-4" />
                </button>
              </div>
              <button
                onClick={() => onDelete(allocation)}
                className="p-1 text-gray-400 dark:text-dark-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                title="Delete Allocation"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
