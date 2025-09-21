import { useState, useEffect } from 'react'
import { Bank, Goal, supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { ArrowDownCircle, DollarSign } from 'lucide-react'
import toast from 'react-hot-toast'

interface TransactionManagerProps {
  banks: Bank[]
  goals: Goal[]
  onBanksUpdate: (banks: Bank[]) => void
  onGoalsUpdate: (goals: Goal[]) => void
  onTransactionAdded: () => void
}

interface GoalAllocation {
  goal_id: string
  amount: number
}

export function TransactionManager({ 
  banks, 
  goals, 
  onBanksUpdate, 
  onGoalsUpdate, 
  onTransactionAdded 
}: TransactionManagerProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    bank_id: '',
    total_amount: '',
    description: ''
  })
  const [goalAllocations, setGoalAllocations] = useState<GoalAllocation[]>([])
  const [goalAllocationsByBank, setGoalAllocationsByBank] = useState<{ [goalId: string]: number }>({})

  useEffect(() => {
    if (formData.bank_id && goals.length > 0) {
      loadGoalAllocationsForBank(formData.bank_id)
    }
  }, [formData.bank_id, goals])

  const loadGoalAllocationsForBank = async (bankId: string) => {
    try {
      const { data, error } = await supabase
        .from('allocations')
        .select('goal_id, amount')
        .eq('bank_id', bankId)

      if (error) throw error

      const allocMap: { [goalId: string]: number } = {}
      data?.forEach(alloc => {
        allocMap[alloc.goal_id] = Number(alloc.amount)
      })
      
      setGoalAllocationsByBank(allocMap)
    } catch (error: any) {
      console.error('Error loading goal allocations:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !formData.bank_id || !formData.total_amount) return

    const totalAmount = parseFloat(formData.total_amount)
    const allocatedAmount = goalAllocations.reduce((sum, alloc) => sum + alloc.amount, 0)

    if (allocatedAmount !== totalAmount) {
      toast.error('Total allocation must equal withdrawal amount')
      return
    }

    if (allocatedAmount <= 0) {
      toast.error('Please allocate the withdrawal amount to at least one goal')
      return
    }

    const selectedBank = banks.find(b => b.id === formData.bank_id)
    if (!selectedBank) {
      toast.error('Selected bank not found')
      return
    }

    if (totalAmount > Number(selectedBank.balance)) {
      toast.error('Insufficient balance in selected bank')
      return
    }

    // Validate goal allocations
    for (const allocation of goalAllocations) {
      const availableAmount = goalAllocationsByBank[allocation.goal_id] || 0
      if (allocation.amount > availableAmount) {
        const goal = goals.find(g => g.id === allocation.goal_id)
        toast.error(`Insufficient allocation for ${goal?.name}. Available: ${availableAmount.toFixed(2)} MAD`)
        return
      }
    }

    setLoading(true)
    try {
      // Create transaction
      const { data: transaction, error: transactionError } = await supabase
        .from('transactions')
        .insert([{
          user_id: user.id,
          bank_id: formData.bank_id,
          total_amount: totalAmount,
          description: formData.description
        }])
        .select()
        .single()

      if (transactionError) throw transactionError

      // Create transaction goals
      const transactionGoals = goalAllocations
        .filter(alloc => alloc.amount > 0)
        .map(alloc => ({
          transaction_id: transaction.id,
          goal_id: alloc.goal_id,
          amount: alloc.amount
        }))

      if (transactionGoals.length > 0) {
        const { error: transactionGoalsError } = await supabase
          .from('transaction_goals')
          .insert(transactionGoals)

        if (transactionGoalsError) throw transactionGoalsError
      }

      // Update bank balance
      const newBankBalance = Number(selectedBank.balance) - totalAmount
      const { error: bankError } = await supabase
        .from('banks')
        .update({ balance: newBankBalance })
        .eq('id', formData.bank_id)

      if (bankError) throw bankError

      // Update goal allocations
      for (const allocation of goalAllocations) {
        if (allocation.amount > 0) {
          const currentAmount = goalAllocationsByBank[allocation.goal_id]
          const newAmount = currentAmount - allocation.amount

          const { error: allocationError } = await supabase
            .from('allocations')
            .update({ amount: newAmount })
            .eq('goal_id', allocation.goal_id)
            .eq('bank_id', formData.bank_id)

          if (allocationError) throw allocationError
        }
      }

      toast.success('Withdrawal recorded successfully!')
      
      // Reset form
      setFormData({ bank_id: '', total_amount: '', description: '' })
      setGoalAllocations([])
      setGoalAllocationsByBank({})
      
      // Notify parent to refresh data
      onTransactionAdded()
    } catch (error: any) {
      toast.error('Error recording withdrawal: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleAllocationChange = (goalId: string, amount: number) => {
    setGoalAllocations(prev => {
      const existing = prev.find(a => a.goal_id === goalId)
      if (existing) {
        return prev.map(a => 
          a.goal_id === goalId ? { ...a, amount } : a
        ).filter(a => a.amount > 0)
      } else if (amount > 0) {
        return [...prev, { goal_id: goalId, amount }]
      }
      return prev
    })
  }

  const selectedBank = banks.find(b => b.id === formData.bank_id)
  const totalAllocated = goalAllocations.reduce((sum, alloc) => sum + alloc.amount, 0)
  const totalAmount = parseFloat(formData.total_amount) || 0
  const remainingAmount = totalAmount - totalAllocated

  // Filter goals that have allocations in the selected bank
  const availableGoals = goals.filter(goal => 
    goalAllocationsByBank[goal.id] > 0
  )

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
              onChange={(e) => setFormData({ ...formData, bank_id: e.target.value })}
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

          {/* Amount */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Withdrawal Amount (MAD) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max={selectedBank?.balance}
                value={formData.total_amount}
                onChange={(e) => setFormData({ ...formData, total_amount: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="0.00"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="e.g., Grocery shopping"
              />
            </div>
          </div>

          {/* Goal Allocations */}
          {formData.bank_id && totalAmount > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-gray-700">
                  Allocate to Goals *
                </h4>
                <div className="text-sm">
                  <span className={`font-medium ${remainingAmount === 0 ? 'text-green-600' : 'text-orange-600'}`}>
                    Remaining: {remainingAmount.toFixed(2)} MAD
                  </span>
                </div>
              </div>
              
              {availableGoals.length === 0 ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-yellow-800">
                    No goals have allocations in the selected bank. Please allocate funds to goals first.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                  {availableGoals.map((goal) => {
                    const availableAmount = goalAllocationsByBank[goal.id] || 0
                    const allocation = goalAllocations.find(a => a.goal_id === goal.id)
                    
                    return (
                      <div key={goal.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center justify-center w-8 h-8 bg-orange-100 rounded-lg">
                            <ArrowDownCircle className="w-4 h-4 text-orange-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{goal.name}</p>
                            <p className="text-sm text-gray-500">
                              Available: {availableAmount.toFixed(2)} MAD
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            max={Math.min(availableAmount, remainingAmount + (allocation?.amount || 0))}
                            value={allocation?.amount || 0}
                            onChange={(e) => handleAllocationChange(goal.id, parseFloat(e.target.value) || 0)}
                            className="w-24 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            placeholder="0.00"
                          />
                          <span className="text-sm text-gray-500">MAD</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Summary */}
          {totalAmount > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-700">Total Withdrawal:</span>
                  <span className="font-semibold text-blue-900">{totalAmount.toFixed(2)} MAD</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Total Allocated:</span>
                  <span className="font-semibold text-blue-900">{totalAllocated.toFixed(2)} MAD</span>
                </div>
                <div className="flex justify-between border-t border-blue-200 pt-2">
                  <span className="text-blue-700">Remaining:</span>
                  <span className={`font-semibold ${remainingAmount === 0 ? 'text-green-600' : 'text-orange-600'}`}>
                    {remainingAmount.toFixed(2)} MAD
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center space-x-3 pt-4">
            <button
              type="submit"
              disabled={loading || remainingAmount !== 0 || totalAmount === 0 || availableGoals.length === 0}
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