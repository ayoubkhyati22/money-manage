import { Bank } from '../../lib/supabase'
import type { Allocation } from '../../types/goal'
import { Edit2, Trash2, Landmark } from 'lucide-react'

interface AllocationsListProps {
  allocations: Allocation[]
  banks: Bank[]
  onEditAllocation: (allocation: Allocation) => void
  onEditBankBalance: (allocation: Allocation) => void
  onDelete: (allocation: Allocation) => void
}

export function AllocationsList({ allocations, banks, onEditAllocation, onEditBankBalance, onDelete }: AllocationsListProps) {
  if (allocations.length === 0) {
    return <p className="text-stone-400 font-mono text-xs text-center py-8">No allocations active yet</p>
  }

  return (
    <div className="space-y-2.5">
      {allocations.map((allocation) => {
        const bank = banks.find(b => b.id === allocation.bank_id)
        const bankBalance = bank ? Number(bank.balance) : 0

        return (
          <div
            key={allocation.id}
            className="flex items-center justify-between p-3.5 bg-stone-50 dark:bg-[#14161f] border border-stone-200/80 dark:border-white/[0.07] rounded-xl font-mono text-xs"
          >
            <div>
              <p className="font-semibold text-stone-900 dark:text-white">{allocation.bank_name}</p>
              <p className="text-[11px] text-stone-400 mt-0.5">
                Allocated: <strong className="text-stone-700 dark:text-stone-300">{allocation.amount.toFixed(2)} MAD</strong>
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="font-bold text-stone-900 dark:text-white tabular-num">
                  {bankBalance.toFixed(2)} MAD
                </p>
                <p className="text-[10px] text-stone-400">Vault Balance</p>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => onEditAllocation(allocation)}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-amber-500 hover:bg-stone-200/50 dark:hover:bg-white/[0.05] transition-colors"
                  title="Adjust Allocation"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onEditBankBalance(allocation)}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-emerald-500 hover:bg-stone-200/50 dark:hover:bg-white/[0.05] transition-colors"
                  title="Adjust Bank Balance"
                >
                  <Landmark className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onDelete(allocation)}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-rose-500 hover:bg-stone-200/50 dark:hover:bg-white/[0.05] transition-colors"
                  title="Delete Allocation"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
