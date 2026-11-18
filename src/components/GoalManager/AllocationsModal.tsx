import { Goal, Bank } from '../../lib/supabase'
import type { Allocation } from '../../types/goal'
import { AllocationsList } from './AllocationsList'
import { AllocationEditForm } from './AllocationEditForm'
import { BankBalanceEditForm } from './BankBalanceEditForm'
import { ObjectiveTransactionsViewer } from '../ObjectiveTransactionsViewer'
import { X, Layers } from 'lucide-react'

interface AllocationsModalProps {
  selectedObjective: Goal
  allocations: Allocation[]
  banks: Bank[]
  editingAllocation: Allocation | null
  editingBankBalance: {
    allocationId: string
    bankId: string
    bankName: string
    currentBalance: number
  } | null
  allocationData: {
    bank_id: string
    amount: string
  }
  bankBalanceData: {
    newBalance: string
    description: string
  }
  loading: boolean
  onClose: () => void
  onEditAllocation: (allocation: Allocation) => void
  onEditBankBalance: (allocation: Allocation) => void
  onDeleteAllocation: (allocation: Allocation) => void
  onAllocationSubmit: (e: React.FormEvent) => void
  onBankBalanceSubmit: (e: React.FormEvent) => void
  onAllocationDataChange: (data: { bank_id: string; amount: string }) => void
  onBankBalanceDataChange: (data: { newBalance: string; description: string }) => void
  onCancelEdit: () => void
  onUpdate: () => void
}

export function AllocationsModal({
  selectedObjective,
  allocations,
  banks,
  editingAllocation,
  editingBankBalance,
  allocationData,
  bankBalanceData,
  loading,
  onClose,
  onEditAllocation,
  onEditBankBalance,
  onDeleteAllocation,
  onAllocationSubmit,
  onBankBalanceSubmit,
  onAllocationDataChange,
  onBankBalanceDataChange,
  onCancelEdit,
  onUpdate
}: AllocationsModalProps) {
  return (
    <div className="fixed inset-0 bg-black/65 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white dark:bg-[#121520] rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto border border-stone-200/90 dark:border-white/[0.08] my-8">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-stone-100 dark:border-white/[0.06] bg-stone-50/50 dark:bg-[#12141c]/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-stone-900 dark:bg-[#161a24] border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-mono tracking-widest uppercase text-amber-600 dark:text-amber-400 font-semibold">
                Allocation Ledger
              </p>
              <h3 className="text-base sm:text-lg font-display font-bold text-stone-900 dark:text-white leading-tight">
                Allocations for "{selectedObjective.name}"
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-white/[0.05] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-5">
              {(editingAllocation || editingBankBalance) && (
                editingBankBalance ? (
                  <BankBalanceEditForm
                    bankName={editingBankBalance.bankName}
                    currentBalance={editingBankBalance.currentBalance}
                    formData={bankBalanceData}
                    loading={loading}
                    onSubmit={onBankBalanceSubmit}
                    onChange={onBankBalanceDataChange}
                    onCancel={onCancelEdit}
                  />
                ) : (
                  <AllocationEditForm
                    banks={banks}
                    formData={allocationData}
                    loading={loading}
                    onSubmit={onAllocationSubmit}
                    onChange={onAllocationDataChange}
                    onCancel={onCancelEdit}
                  />
                )
              )}

              <div>
                <h4 className="text-xs font-mono font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-2.5">
                  Current Bank Allocations
                </h4>
                <AllocationsList
                  allocations={allocations}
                  banks={banks}
                  onEditAllocation={onEditAllocation}
                  onEditBankBalance={onEditBankBalance}
                  onDelete={onDeleteAllocation}
                />
              </div>
            </div>

            <div>
              <h4 className="text-xs font-mono font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-2.5">
                Real-time Audit Ledger
              </h4>
              <ObjectiveTransactionsViewer
                objectiveId={selectedObjective.id}
                objectiveName={selectedObjective.name}
                onUpdate={onUpdate}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
