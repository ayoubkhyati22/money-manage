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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Record Withdrawal</h2>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Bank Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Bank *
            </label>
            <select
              value={formData.bank_id}
              onChange={(e) => setFormData({ ...formData, bank_id: e.target.value, objective_id: '' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Objective *
              </label>
              <select
                value={formData.objective_id}
                onChange={(e) => setFormData({ ...formData, objective_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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
                <p className="text-sm text-yellow-600 mt-1">
                  No allocations found for this bank. Please allocate funds to objectives first.
                </p>
              )}
            </div>
          )}

          {/* Amount and Description */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="0.00"
                required
              />
              {selectedAllocation && (
                <p className="text-sm text-gray-500 mt-1">
                  Max available: {selectedAllocation.allocated_amount.toFixed(2)} MAD
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="e.g., Grocery shopping, Gas, etc."
                required
              />
            </div>
          </div>

          {/* Summary */}
          {formData.amount && selectedBank && selectedAllocation && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-700">Bank:</span>
                  <span className="font-semibold text-blue-900">{selectedBank.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Objective:</span>
                  <span className="font-semibold text-blue-900">{selectedAllocation.objective_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Withdrawal Amount:</span>
                  <span className="font-semibold text-red-600">-{parseFloat(formData.amount).toFixed(2)} MAD</span>
                </div>
                <div className="flex justify-between border-t border-blue-200 pt-2">
                  <span className="text-blue-700">Remaining in Bank:</span>
                  <span className="font-semibold text-blue-900">
                    {(Number(selectedBank.balance) - parseFloat(formData.amount)).toFixed(2)} MAD
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Remaining in Allocation:</span>
                  <span className="font-semibold text-blue-900">
                    {(selectedAllocation.allocated_amount - parseFloat(formData.amount)).toFixed(2)} MAD
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center space-x-3 pt-4">
            <button
              type="submit"
              disabled={loading || !formData.bank_id || !formData.objective_id || !formData.amount || !formData.description}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Recording...' : 'Record Withdrawal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}