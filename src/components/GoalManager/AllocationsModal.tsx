import { Goal, Bank } from '../../lib/supabase'
import type { Allocation } from '../../types/goal'
import { AllocationsList } from './AllocationsList'
import { AllocationEditForm } from './AllocationEditForm'
import { BankBalanceEditForm } from './BankBalanceEditForm'
import { ObjectiveTransactionsViewer } from '../ObjectiveTransactionsViewer'

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
  onAllocationDataChange: (data: any) => void
  onBankBalanceDataChange: (data: any) => void
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-dark-800 rounded-xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto border dark:border-dark-600">
        <div className="p-6 border-b border-gray-200 dark:border-dark-600">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-100">
              Manage Allocations for "{selectedObjective.name}"
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 dark:text-dark-400 hover:text-gray-600 dark:hover:text-dark-200 text-2xl"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
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
                <h4 className="text-sm font-medium text-gray-700 dark:text-dark-200 mb-3">Current Allocations</h4>
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
              <h4 className="text-sm font-medium text-gray-700 dark:text-dark-200 mb-3">Real-time Transactions</h4>
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
