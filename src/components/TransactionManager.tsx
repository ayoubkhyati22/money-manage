import { useState, useEffect } from 'react'
import { Bank, Goal, supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { useSweetAlert } from '../hooks/useSweetAlert'
import { ArrowDownCircle, DollarSign } from 'lucide-react'
import toast from 'react-hot-toast'

interface TransactionManagerProps {
  banks: Bank[]
  goals: Goal[]
  onBanksUpdate: (banks: Bank[]) => void
  onGoalsUpdate: (goals: Goal[]) => void
  onTransactionAdded: () => void
}

interface ObjectiveAllocation {
  objective_id: string
  objective_name: string
  allocated_amount: number
}

export function TransactionManager({
  banks,
  goals,
  onBanksUpdate,
  onGoalsUpdate,
  onTransactionAdded
}: TransactionManagerProps) {
  const { user } = useAuth()
  const { showSuccess, showError, showWarning, showConfirm } = useSweetAlert()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    bank_id: '',
    objective_id: '',
    amount: '',
    description: ''
  })
  const [availableAllocations, setAvailableAllocations] = useState<ObjectiveAllocation[]>([])

  useEffect(() => {
    if (formData.bank_id && goals.length > 0) {
      loadAllocationsForBank(formData.bank_id)
    }
  }, [formData.bank_id, goals])

  const loadAllocationsForBank = async (bankId: string) => {
    try {
      const { data, error } = await supabase
        .from('allocations')
        .select(`
          goal_id,
          amount,
          goals:goal_id(name)
        `)
        .eq('bank_id', bankId)
        .gt('amount', 0)

      if (error) throw error

      const allocations: ObjectiveAllocation[] = data?.map(alloc => ({
        objective_id: alloc.goal_id,
        objective_name: (alloc.goals as any)?.name || 'Unknown Objective',
        allocated_amount: Number(alloc.amount)
      })) || []

      setAvailableAllocations(allocations)
    } catch (error: any) {
      console.error('Error loading allocations:', error)
      setAvailableAllocations([])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !formData.bank_id || !formData.objective_id || !formData.amount) return

    const amount = parseFloat(formData.amount)
    if (amount <= 0) {
      await showError('Invalid Amount', 'Amount must be greater than 0')
      return
    }

    const selectedBank = banks.find(b => b.id === formData.bank_id)
    if (!selectedBank) {
      await showError('Bank Not Found', 'Selected bank not found')
      return
    }

    if (amount > Number(selectedBank.balance)) {
      await showError('Insufficient Balance', 'Insufficient balance in selected bank')
      return
    }

    // Check if there's enough allocation for this objective from this bank
    const allocation = availableAllocations.find(a => a.objective_id === formData.objective_id)
    if (!allocation || amount > allocation.allocated_amount) {
      const availableAmount = allocation?.allocated_amount || 0
      await showError(
        'Insufficient Allocation',
        `Insufficient allocation for this objective. Available: ${availableAmount.toFixed(2)} MAD`
      )
      return
    }

    // Show confirmation dialog
    const result = await showConfirm(
      'Confirm Withdrawal',
      `Are you sure you want to withdraw ${amount.toFixed(2)} MAD from ${selectedBank.name} for ${allocation.objective_name}?`
    )

    if (!result.isConfirmed) return

    setLoading(true)
    try {
      // Create withdrawal transaction in objectives_transactions (negative amount)
      const { error: transactionError } = await supabase
        .from('objectives_transactions')
        .insert([{
          objective_id: formData.objective_id,
          bank_id: formData.bank_id,
          amount: -amount, // Negative for withdrawal
          description: formData.description || `Withdrawal: ${amount.toFixed(2)} MAD`
        }])

      if (transactionError) throw transactionError

      // Update bank balance (decrease)
      const newBankBalance = Number(selectedBank.balance) - amount
      const { error: bankError } = await supabase
        .from('banks')
        .update({ balance: newBankBalance })
        .eq('id', formData.bank_id)

      if (bankError) throw bankError

      // Update allocation (decrease)
      const newAllocationAmount = allocation.allocated_amount - amount
      const { error: allocationError } = await supabase
        .from('allocations')
        .update({ amount: newAllocationAmount })
        .eq('goal_id', formData.objective_id)
        .eq('bank_id', formData.bank_id)

      if (allocationError) throw allocationError

      await showSuccess(
        'Withdrawal Recorded!',
        `${amount.toFixed(2)} MAD has been withdrawn from ${selectedBank.name}`
      )

      // Reset form
      setFormData({ bank_id: '', objective_id: '', amount: '', description: '' })
      setAvailableAllocations([])

      // Notify parent to refresh data
      onTransactionAdded()
    } catch (error: any) {
      await showError('Transaction Failed', error.message)
    } finally {
      setLoading(false)
    }
  }

  const selectedBank = banks.find(b => b.id === formData.bank_id)
  const selectedAllocation = availableAllocations.find(a => a.objective_id === formData.objective_id)

  return (
    <div className="space-y-4 sm:space-y-6 mt-7">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-red-400 to-red-600 rounded-xl shadow-lg">
            <ArrowDownCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-dark-100">Record Withdrawal</h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-dark-300 hidden sm:block">Withdraw money from your objectives</p>
          </div>
        </div>
      </div>

      <div className="bg-white/90 dark:bg-dark-800/90 backdrop-blur-sm rounded-2xl shadow-lg border border-mint-200/50 dark:border-dark-600/50 overflow-hidden">
        <div className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/30 p-3 sm:p-6 border-b border-red-200 dark:border-dark-600">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-white dark:bg-dark-800 border-2 border-red-300 dark:border-red-600 rounded-xl shadow-md">
              <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-red-900 dark:text-red-100">Withdrawal Form</h3>
              <p className="text-xs sm:text-sm text-red-700 dark:text-red-300 hidden sm:block">Select bank, objective, and amount to withdraw</p>
            </div>
          </div>
        </div>

        <div className="p-3 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-6">
            {/* Bank Selection */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-dark-200 mb-1 sm:mb-2">
                Select Bank *
              </label>
              <select
                value={formData.bank_id}
                onChange={(e) => setFormData({ ...formData, bank_id: e.target.value, objective_id: '' })}
                className="w-full px-2 py-1.5 sm:px-3 sm:py-2 text-sm border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:focus:ring-primary-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-dark-100"
                required
              >
                <option value="">Choose a bank...</option>
                {banks.map((bank) => (
                  <option key={bank.id} value={bank.id}>
                    {bank.name} - {Number(bank.balance).toFixed(2)} MAD
                  </option>
                ))}
              </select>
            </div>

            {/* Objective Selection */}
            {formData.bank_id && (
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-dark-200 mb-1 sm:mb-2">
                  Select Objective *
                </label>
                <select
                  value={formData.objective_id}
                  onChange={(e) => setFormData({ ...formData, objective_id: e.target.value })}
                  className="w-full px-2 py-1.5 sm:px-3 sm:py-2 text-sm border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:focus:ring-primary-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-dark-100"
                  required
                >
                  <option value="">Choose an objective...</option>
                  {availableAllocations.map((allocation) => (
                    <option key={allocation.objective_id} value={allocation.objective_id}>
                      {allocation.objective_name} - Available: {allocation.allocated_amount.toFixed(2)} MAD
                    </option>
                  ))}
                </select>

                {availableAllocations.length === 0 && (
                  <div className="mt-2 p-2 sm:p-3 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-lg">
                    <p className="text-xs sm:text-sm text-yellow-700 dark:text-yellow-300">
                      No allocations found for this bank. Please allocate funds to objectives first.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Amount and Description */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-dark-200 mb-1 sm:mb-2">
                  Withdrawal Amount (MAD) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={Math.min(
                    selectedBank?.balance || 0,
                    selectedAllocation?.allocated_amount || 0
                  )}
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-2 py-1.5 sm:px-3 sm:py-2 text-sm border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:focus:ring-primary-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-dark-100 placeholder-gray-500 dark:placeholder-dark-400"
                  placeholder="0.00"
                  required
                />
                {selectedAllocation && (
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-dark-400 mt-1">
                    Max available: {selectedAllocation.allocated_amount.toFixed(2)} MAD
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-dark-200 mb-1 sm:mb-2">
                  Description *
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-2 py-1.5 sm:px-3 sm:py-2 text-sm border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:focus:ring-primary-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-dark-100 placeholder-gray-500 dark:placeholder-dark-400"
                  placeholder="e.g., Grocery shopping, Gas, etc."
                  required
                />
              </div>
            </div>

            {/* Summary */}
            {formData.amount && selectedBank && selectedAllocation && (
              <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-xl p-3 sm:p-4">
                <div className="flex items-center space-x-2 mb-2 sm:mb-3">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 dark:bg-blue-400 rounded-full"></div>
                  <h4 className="text-xs sm:text-sm font-semibold text-blue-900 dark:text-blue-100">Transaction Summary</h4>
                </div>
                <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-700 dark:text-blue-300">Bank:</span>
                    <span className="font-semibold text-blue-900 dark:text-blue-100">{selectedBank.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700 dark:text-blue-300">Objective:</span>
                    <span className="font-semibold text-blue-900 dark:text-blue-100">{selectedAllocation.objective_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700 dark:text-blue-300">Withdrawal Amount:</span>
                    <span className="font-semibold text-red-600 dark:text-red-400">-{parseFloat(formData.amount).toFixed(2)} MAD</span>
                  </div>
                  <div className="border-t border-blue-200 dark:border-blue-700 pt-2 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-blue-700 dark:text-blue-300">Remaining in Bank:</span>
                      <span className="font-semibold text-blue-900 dark:text-blue-100">
                        {(Number(selectedBank.balance) - parseFloat(formData.amount)).toFixed(2)} MAD
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700 dark:text-blue-300">Remaining in Allocation:</span>
                      <span className="font-semibold text-blue-900 dark:text-blue-100">
                        {(selectedAllocation.allocated_amount - parseFloat(formData.amount)).toFixed(2)} MAD
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center space-x-2 sm:space-x-3 pt-2 sm:pt-4">
              <button
                type="submit"
                disabled={loading || !formData.bank_id || !formData.objective_id || !formData.amount || !formData.description}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold px-4 py-2 sm:px-6 sm:py-3 text-sm rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105 disabled:hover:scale-100"
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm">Recording...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <ArrowDownCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="text-sm">Add</span>
                  </div>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setFormData({ bank_id: '', objective_id: '', amount: '', description: '' })
                  setAvailableAllocations([])
                }}
                className="text-gray-600 dark:text-dark-300 hover:text-gray-900 dark:hover:text-dark-100 px-3 py-2 sm:px-4 sm:py-3 text-sm rounded-xl transition-colors font-medium"
              >
                Clear
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Empty State or Help Text */}
      {banks.length === 0 && (
        <div className="bg-white/90 dark:bg-dark-800/90 backdrop-blur-sm rounded-2xl shadow-lg border border-mint-200/50 dark:border-dark-600/50 p-8 text-center">
          <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-dark-700 dark:to-dark-600 rounded-full mx-auto mb-4">
            <ArrowDownCircle className="w-8 h-8 text-gray-400 dark:text-dark-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-100 mb-2">No Banks Available</h3>
          <p className="text-gray-600 dark:text-dark-300">
            You need to add banks and create objectives with allocations before you can record withdrawals.
          </p>
        </div>
      )}
    </div>
  )
}