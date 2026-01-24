import { useState, useEffect } from 'react'
import { Bank, Goal, supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { useSweetAlert } from '../hooks/useSweetAlert'
import { ArrowDownCircle, DollarSign, AlertCircle } from 'lucide-react'
import { motion } from 'framer-motion'

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

    const allocation = availableAllocations.find(a => a.objective_id === formData.objective_id)
    if (!allocation || amount > allocation.allocated_amount) {
      const availableAmount = allocation?.allocated_amount || 0
      await showError(
        'Insufficient Allocation',
        `Insufficient allocation for this objective. Available: ${availableAmount.toFixed(2)} MAD`
      )
      return
    }

    const result = await showConfirm(
      'Confirm Withdrawal',
      `Are you sure you want to withdraw ${amount.toFixed(2)} MAD from ${selectedBank.name} for ${allocation.objective_name}?`
    )

    if (!result.isConfirmed) return

    setLoading(true)
    try {
      const { error: transactionError } = await supabase
        .from('objectives_transactions')
        .insert([{
          objective_id: formData.objective_id,
          bank_id: formData.bank_id,
          amount: -amount,
          description: formData.description || `Withdrawal: ${amount.toFixed(2)} MAD`
        }])

      if (transactionError) throw transactionError

      const newBankBalance = Number(selectedBank.balance) - amount
      const { error: bankError } = await supabase
        .from('banks')
        .update({ balance: newBankBalance })
        .eq('id', formData.bank_id)

      if (bankError) throw bankError

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

      setFormData({ bank_id: '', objective_id: '', amount: '', description: '' })
      setAvailableAllocations([])
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
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-danger-500 to-danger-600 flex items-center justify-center shadow-lg">
          <ArrowDownCircle className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-display font-bold text-slate-800 dark:text-white">Withdraw</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Withdraw money from your objectives</p>
        </div>
      </motion.div>

      {/* Form Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card overflow-hidden"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-700 bg-danger-50 dark:bg-danger-900/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center border border-danger-200 dark:border-danger-800">
              <DollarSign className="w-5 h-5 text-danger-600 dark:text-danger-400" />
            </div>
            <div>
              <h3 className="font-semibold text-danger-900 dark:text-danger-100">Withdrawal Form</h3>
              <p className="text-sm text-danger-700 dark:text-danger-300">Select bank, objective, and amount</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {/* Bank Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Select Bank *
            </label>
            <select
              value={formData.bank_id}
              onChange={(e) => setFormData({ ...formData, bank_id: e.target.value, objective_id: '' })}
              className="select-modern"
              required
            >
              <option value="">Choose a bank...</option>
              {banks.map((bank) => (
                <option key={bank.id} value={bank.id}>
                  {bank.name} - {Number(bank.balance).toLocaleString('en-US', { minimumFractionDigits: 2 })} MAD
                </option>
              ))}
            </select>
          </div>

          {/* Objective Selection */}
          {formData.bank_id && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
            >
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Select Objective *
              </label>
              <select
                value={formData.objective_id}
                onChange={(e) => setFormData({ ...formData, objective_id: e.target.value })}
                className="select-modern"
                required
              >
                <option value="">Choose an objective...</option>
                {availableAllocations.map((allocation) => (
                  <option key={allocation.objective_id} value={allocation.objective_id}>
                    {allocation.objective_name} - Available: {allocation.allocated_amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} MAD
                  </option>
                ))}
              </select>

              {availableAllocations.length === 0 && (
                <div className="mt-3 p-3 bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-800 rounded-xl flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-warning-600 dark:text-warning-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-warning-700 dark:text-warning-300">
                    No allocations found for this bank. Please allocate funds to objectives first.
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {/* Amount and Description */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Amount (MAD) *
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
                className="input-modern"
                placeholder="0.00"
                required
              />
              {selectedAllocation && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Max: {selectedAllocation.allocated_amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} MAD
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Description *
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input-modern"
                placeholder="e.g., Grocery shopping"
                required
              />
            </div>
          </div>

          {/* Summary */}
          {formData.amount && selectedBank && selectedAllocation && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-xl"
            >
              <h4 className="text-sm font-semibold text-primary-900 dark:text-primary-100 mb-3">Transaction Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-primary-700 dark:text-primary-300">Bank:</span>
                  <span className="font-medium text-primary-900 dark:text-primary-100">{selectedBank.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-primary-700 dark:text-primary-300">Objective:</span>
                  <span className="font-medium text-primary-900 dark:text-primary-100">{selectedAllocation.objective_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-primary-700 dark:text-primary-300">Withdrawal:</span>
                  <span className="font-bold text-danger-600 dark:text-danger-400">-{parseFloat(formData.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })} MAD</span>
                </div>
                <div className="border-t border-primary-200 dark:border-primary-700 pt-2 mt-2 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-primary-600 dark:text-primary-400">Remaining in Bank:</span>
                    <span className="text-primary-900 dark:text-primary-100">
                      {(Number(selectedBank.balance) - parseFloat(formData.amount)).toLocaleString('en-US', { minimumFractionDigits: 2 })} MAD
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-primary-600 dark:text-primary-400">Remaining Allocation:</span>
                    <span className="text-primary-900 dark:text-primary-100">
                      {(selectedAllocation.allocated_amount - parseFloat(formData.amount)).toLocaleString('en-US', { minimumFractionDigits: 2 })} MAD
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={loading || !formData.bank_id || !formData.objective_id || !formData.amount || !formData.description}
              className="btn-danger flex-1 sm:flex-none"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <ArrowDownCircle className="w-4 h-4" />
                  <span>Withdraw</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setFormData({ bank_id: '', objective_id: '', amount: '', description: '' })
                setAvailableAllocations([])
              }}
              className="btn-ghost"
            >
              Clear
            </button>
          </div>
        </form>
      </motion.div>

      {/* Empty State */}
      {banks.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card p-8 text-center"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
            <ArrowDownCircle className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-1">No Banks Available</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Add banks and create objectives with allocations before withdrawing.
          </p>
        </motion.div>
      )}
    </div>
  )
}
