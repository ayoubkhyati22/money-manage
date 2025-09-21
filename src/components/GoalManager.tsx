import { useState, useEffect } from 'react'
import { Goal, Bank, ObjectiveTransaction, supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { Plus, Edit2, Trash2, Target, Calendar, DollarSign, Tag, Settings, Eye } from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { ObjectiveTransactionsViewer } from './ObjectiveTransactionsViewer'

interface GoalManagerProps {
  goals: Goal[]
  banks: Bank[]
  onUpdate: (goals: Goal[]) => void
  onBanksUpdate: (banks: Bank[]) => void
}

interface Allocation {
  id: string
  goal_id: string
  bank_id: string
  amount: number
  bank_name: string
}

export function GoalManager({ goals, banks, onUpdate, onBanksUpdate }: GoalManagerProps) {
  const { user } = useAuth()
  const [showForm, setShowForm] = useState(false)
  const [showAddMoneyForm, setShowAddMoneyForm] = useState(false)
  const [showAllocationsModal, setShowAllocationsModal] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [selectedObjective, setSelectedObjective] = useState<Goal | null>(null)
  const [loading, setLoading] = useState(false)
  const [objectiveAmounts, setObjectiveAmounts] = useState<{ [goalId: string]: number }>({})
  const [allocations, setAllocations] = useState<Allocation[]>([])
  const [editingAllocation, setEditingAllocation] = useState<Allocation | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    target_amount: '',
    target_date: '',
    notes: ''
  })
  const [addMoneyData, setAddMoneyData] = useState({
    bank_id: '',
    amount: '',
    description: ''
  })
  const [allocationData, setAllocationData] = useState({
    bank_id: '',
    amount: ''
  })
  const [editingBankBalance, setEditingBankBalance] = useState<{
    allocationId: string
    bankId: string
    bankName: string
    currentBalance: number
  } | null>(null)
  const [bankBalanceData, setBankBalanceData] = useState({
    newBalance: '',
    description: ''
  })

  const categories = [
    'Personal',
    'Family',
    'Investment',
    'Emergency',
    'Travel',
    'Education',
    'Health',
    'Other'
  ]

  const loadBanks = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('banks')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      onBanksUpdate(data || [])
    } catch (error: any) {
      console.error('Error loading banks:', error)
    }
  }

  useEffect(() => {
    loadGoals()
  }, [user])

  useEffect(() => {
    if (goals.length > 0) {
      loadObjectiveAmounts()
    }
  }, [goals])

  const loadGoals = async () => {
    if (!user) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      onUpdate(data || [])
    } catch (error: any) {
      toast.error('Error loading objectives: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const loadObjectiveAmounts = async () => {
    try {
      const { data, error } = await supabase
        .from('objectives_transactions')
        .select('objective_id, amount')
        .in('objective_id', goals.map(g => g.id))

      if (error) throw error

      const amounts: { [goalId: string]: number } = {}
      data?.forEach(transaction => {
        if (!amounts[transaction.objective_id]) {
          amounts[transaction.objective_id] = 0
        }
        amounts[transaction.objective_id] += Number(transaction.amount)
      })

      setObjectiveAmounts(amounts)
    } catch (error: any) {
      console.error('Error loading objective amounts:', error)
    }
  }

  const loadAllocations = async (goalId: string) => {
    try {
      const { data, error } = await supabase
        .from('allocations')
        .select(`
          *,
          banks:bank_id(name)
        `)
        .eq('goal_id', goalId)

      if (error) throw error

      const allocationsWithBankNames: Allocation[] = data?.map(alloc => ({
        id: alloc.id,
        goal_id: alloc.goal_id,
        bank_id: alloc.bank_id,
        amount: Number(alloc.amount),
        bank_name: (alloc.banks as any)?.name || 'Unknown Bank'
      })) || []

      setAllocations(allocationsWithBankNames)
    } catch (error: any) {
      toast.error('Error loading allocations: ' + error.message)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    try {
      const goalData = {
        name: formData.name,
        category: formData.category || null,
        target_amount: formData.target_amount ? parseFloat(formData.target_amount) : null,
        target_date: formData.target_date || null,
        notes: formData.notes
      }

      if (editingGoal) {
        const { error } = await supabase
          .from('goals')
          .update(goalData)
          .eq('id', editingGoal.id)

        if (error) throw error
        toast.success('Objective updated successfully!')
      } else {
        const { error } = await supabase
          .from('goals')
          .insert([{
            ...goalData,
            user_id: user.id
          }])

        if (error) throw error
        toast.success('Objective created successfully!')
      }

      resetForm()
      loadGoals()
    } catch (error: any) {
      toast.error('Error saving objective: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleAddMoney = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedObjective || !addMoneyData.bank_id || !addMoneyData.amount) return

    const amount = parseFloat(addMoneyData.amount)
    if (amount <= 0) {
      toast.error('Amount must be greater than 0')
      return
    }

    setLoading(true)
    try {
      // Add transaction to objectives_transactions
      const { error: transactionError } = await supabase
        .from('objectives_transactions')
        .insert([{
          objective_id: selectedObjective.id,
          bank_id: addMoneyData.bank_id,
          amount: amount,
          description: addMoneyData.description
        }])

      if (transactionError) throw transactionError

      // Update bank balance (increase)
      const selectedBank = banks.find(b => b.id === addMoneyData.bank_id)
      if (selectedBank) {
        const newBalance = Number(selectedBank.balance) + amount
        const { error: bankError } = await supabase
          .from('banks')
          .update({ balance: newBalance })
          .eq('id', addMoneyData.bank_id)

        if (bankError) throw bankError
      }

      // Create or update allocation
      const { data: existingAllocation, error: allocError } = await supabase
        .from('allocations')
        .select('amount')
        .eq('goal_id', selectedObjective.id)
        .eq('bank_id', addMoneyData.bank_id)
        .single()

      if (allocError && allocError.code !== 'PGRST116') throw allocError

      if (existingAllocation) {
        // Update existing allocation
        const newAmount = Number(existingAllocation.amount) + amount
        await supabase
          .from('allocations')
          .update({ amount: newAmount })
          .eq('goal_id', selectedObjective.id)
          .eq('bank_id', addMoneyData.bank_id)
      } else {
        // Create new allocation
        await supabase
          .from('allocations')
          .insert([{
            goal_id: selectedObjective.id,
            bank_id: addMoneyData.bank_id,
            amount: amount
          }])
      }

      toast.success(`${amount.toFixed(2)} MAD added to ${selectedObjective.name}!`)

      // Reset form and refresh data
      setAddMoneyData({ bank_id: '', amount: '', description: '' })
      setShowAddMoneyForm(false)
      setSelectedObjective(null)
      loadObjectiveAmounts()
      loadBanks() // Refresh bank balances

      // Remove automatic page reload since we're updating data manually
    } catch (error: any) {
      toast.error('Error adding money: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleBankBalanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingBankBalance || !bankBalanceData.newBalance || !selectedObjective) return

    const newBalance = parseFloat(bankBalanceData.newBalance)
    if (newBalance < 0) {
      toast.error('Bank balance cannot be negative')
      return
    }

    const currentBalance = editingBankBalance.currentBalance
    const difference = newBalance - currentBalance

    setLoading(true)
    try {
      // Update bank balance
      await supabase
        .from('banks')
        .update({ balance: newBalance })
        .eq('id', editingBankBalance.bankId)

      // Record the balance change as a transaction in objectives_transactions
      if (difference !== 0) {
        const description = bankBalanceData.description ||
          `Bank balance ${difference > 0 ? 'increased' : 'decreased'} by ${Math.abs(difference).toFixed(2)} MAD`

        await supabase
          .from('objectives_transactions')
          .insert([{
            objective_id: selectedObjective.id,
            bank_id: editingBankBalance.bankId,
            amount: difference,
            description: description
          }])

        // Update corresponding allocation
        const allocation = allocations.find(a => a.id === editingBankBalance.allocationId)
        if (allocation) {
          const newAllocationAmount = allocation.amount + difference
          await supabase
            .from('allocations')
            .update({ amount: Math.max(0, newAllocationAmount) })
            .eq('id', editingBankBalance.allocationId)
        }
      }

      toast.success('Bank balance updated successfully!')

      // Reset form and refresh data
      setBankBalanceData({ newBalance: '', description: '' })
      setEditingBankBalance(null)
      loadAllocations(selectedObjective.id)
      loadObjectiveAmounts()
      loadBanks()
    } catch (error: any) {
      toast.error('Error updating bank balance: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleAllocationSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedObjective || !allocationData.bank_id || !allocationData.amount || !editingAllocation) return

    const amount = parseFloat(allocationData.amount)
    if (amount < 0) {
      toast.error('Amount cannot be negative')
      return
    }

    setLoading(true)
    try {
      // Get the difference between old and new amount
      const oldAmount = editingAllocation.amount
      const difference = amount - oldAmount

      // Update existing allocation
      await supabase
        .from('allocations')
        .update({ amount })
        .eq('id', editingAllocation.id)

      // If there's a difference, record it in objectives_transactions
      if (difference !== 0) {
        const selectedBank = banks.find(b => b.id === allocationData.bank_id)

        if (difference > 0) {
          // Increasing allocation - add money to objective and update bank balance
          await supabase
            .from('objectives_transactions')
            .insert([{
              objective_id: selectedObjective.id,
              bank_id: allocationData.bank_id,
              amount: difference,
              description: `Allocation increase: +${difference.toFixed(2)} MAD`
            }])

          // Increase bank balance
          if (selectedBank) {
            const newBalance = Number(selectedBank.balance) + difference
            await supabase
              .from('banks')
              .update({ balance: newBalance })
              .eq('id', allocationData.bank_id)
          }
        } else {
          // Decreasing allocation - remove money from objective and update bank balance
          await supabase
            .from('objectives_transactions')
            .insert([{
              objective_id: selectedObjective.id,
              bank_id: allocationData.bank_id,
              amount: difference, // This will be negative
              description: `Allocation decrease: ${difference.toFixed(2)} MAD`
            }])

          // Decrease bank balance
          if (selectedBank) {
            const newBalance = Number(selectedBank.balance) + difference // difference is negative
            await supabase
              .from('banks')
              .update({ balance: newBalance })
              .eq('id', allocationData.bank_id)
          }
        }
      }

      toast.success('Allocation updated successfully!')

      setAllocationData({ bank_id: '', amount: '' })
      setEditingAllocation(null)
      loadAllocations(selectedObjective.id)
      loadObjectiveAmounts() // Refresh objective amounts
      loadBanks() // Refresh bank balances

      // Remove the automatic page reload since we're updating data manually
    } catch (error: any) {
      toast.error('Error saving allocation: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAllocation = async (allocation: Allocation) => {
    if (!confirm(`Delete allocation of ${allocation.amount.toFixed(2)} MAD from ${allocation.bank_name}?`)) {
      return
    }

    setLoading(true)
    try {
      // Delete the allocation
      await supabase
        .from('allocations')
        .delete()
        .eq('id', allocation.id)

      // Add a negative transaction to objectives_transactions to reflect the removal
      await supabase
        .from('objectives_transactions')
        .insert([{
          objective_id: allocation.goal_id,
          bank_id: allocation.bank_id,
          amount: -allocation.amount, // Negative amount to remove money
          description: `Allocation deleted: -${allocation.amount.toFixed(2)} MAD`
        }])

      // Update bank balance (decrease by the allocation amount)
      const selectedBank = banks.find(b => b.id === allocation.bank_id)
      if (selectedBank) {
        const newBalance = Number(selectedBank.balance) - allocation.amount
        await supabase
          .from('banks')
          .update({ balance: newBalance })
          .eq('id', allocation.bank_id)
      }

      toast.success('Allocation deleted successfully!')
      loadAllocations(allocation.goal_id)
      loadObjectiveAmounts() // Refresh objective amounts
      loadBanks() // Refresh bank balances

      // Remove the automatic page reload since we're updating data manually
    } catch (error: any) {
      toast.error('Error deleting allocation: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (goal: Goal) => {
    setEditingGoal(goal)
    setFormData({
      name: goal.name,
      category: goal.category || '',
      target_amount: goal.target_amount ? goal.target_amount.toString() : '',
      target_date: goal.target_date ? format(new Date(goal.target_date), 'yyyy-MM-dd') : '',
      notes: goal.notes || ''
    })
    setShowForm(true)
  }

  const handleDelete = async (goal: Goal) => {
    const currentAmount = objectiveAmounts[goal.id] || 0

    if (currentAmount > 0) {
      if (!confirm(`This objective has ${currentAmount.toFixed(2)} MAD. Deleting it will return the money to the banks. Are you sure?`)) {
        return
      }

      // Return money to banks
      try {
        const { data: transactions, error: fetchError } = await supabase
          .from('objectives_transactions')
          .select('bank_id, amount')
          .eq('objective_id', goal.id)

        if (fetchError) throw fetchError

        // Group by bank and sum amounts
        const bankAmounts: { [bankId: string]: number } = {}
        transactions?.forEach(trans => {
          if (!bankAmounts[trans.bank_id]) {
            bankAmounts[trans.bank_id] = 0
          }
          bankAmounts[trans.bank_id] += Number(trans.amount)
        })

        // Update bank balances
        for (const [bankId, amount] of Object.entries(bankAmounts)) {
          const bank = banks.find(b => b.id === bankId)
          if (bank) {
            const newBalance = Number(bank.balance) - amount
            await supabase
              .from('banks')
              .update({ balance: newBalance })
              .eq('id', bankId)
          }
        }
      } catch (error: any) {
        toast.error('Error returning money to banks: ' + error.message)
        return
      }
    } else {
      if (!confirm('Are you sure you want to delete this objective?')) {
        return
      }
    }

    setLoading(true)
    try {
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', goal.id)

      if (error) throw error

      toast.success('Objective deleted successfully!')
      loadGoals()

      if (currentAmount > 0) {
        // Reload page to update bank balances
        window.location.reload()
      }
    } catch (error: any) {
      toast.error('Error deleting objective: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({ name: '', category: '', target_amount: '', target_date: '', notes: '' })
    setEditingGoal(null)
    setShowForm(false)
  }

  const resetAddMoneyForm = () => {
    setAddMoneyData({ bank_id: '', amount: '', description: '' })
    setSelectedObjective(null)
    setShowAddMoneyForm(false)
  }

  const openAllocationsModal = (goal: Goal) => {
    setSelectedObjective(goal)
    setShowAllocationsModal(true)
    loadAllocations(goal.id)
  }

  const closeAllocationsModal = () => {
    setShowAllocationsModal(false)
    setSelectedObjective(null)
    setAllocations([])
    setEditingAllocation(null)
    setEditingBankBalance(null)
    setAllocationData({ bank_id: '', amount: '' })
    setBankBalanceData({ newBalance: '', description: '' })
  }

  const startEditAllocation = (allocation: Allocation) => {
    setEditingAllocation(allocation)
    setAllocationData({
      bank_id: allocation.bank_id,
      amount: allocation.amount.toString()
    })
  }

  const startEditBankBalance = (allocation: Allocation) => {
    const bank = banks.find(b => b.id === allocation.bank_id)
    if (bank) {
      setEditingBankBalance({
        allocationId: allocation.id,
        bankId: allocation.bank_id,
        bankName: allocation.bank_name,
        currentBalance: Number(bank.balance)
      })
      setBankBalanceData({
        newBalance: Number(bank.balance).toString(),
        description: ''
      })
    }
  }

  if (loading && goals.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Financial Objectives</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add</span>
        </button>
      </div>

      {/* Add Objective Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingGoal ? 'Edit Objective' : 'Add New Objective'}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Objective Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="e.g., Car, Marriage, Bike"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="">Select category...</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Target Amount (MAD)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.target_amount}
                  onChange={(e) => setFormData({ ...formData, target_amount: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="10000.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Target Date
                </label>
                <input
                  type="date"
                  value={formData.target_date}
                  onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                rows={3}
                placeholder="Optional notes about this objective..."
              />
            </div>

            <div className="flex items-center space-x-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? 'Saving...' : (editingGoal ? 'Update Objective' : 'Add Objective')}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="text-gray-600 hover:text-gray-900 px-4 py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add Money Form */}
      {showAddMoneyForm && selectedObjective && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Add Money to "{selectedObjective.name}"
          </h3>

          <form onSubmit={handleAddMoney} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Bank *
                </label>
                <select
                  value={addMoneyData.bank_id}
                  onChange={(e) => setAddMoneyData({ ...addMoneyData, bank_id: e.target.value })}
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount (MAD) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={addMoneyData.amount}
                  onChange={(e) => setAddMoneyData({ ...addMoneyData, amount: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="500.00"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <input
                type="text"
                value={addMoneyData.description}
                onChange={(e) => setAddMoneyData({ ...addMoneyData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="e.g., Initial savings for car"
              />
            </div>

            <div className="flex items-center space-x-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? 'Adding...' : 'Add Money'}
              </button>
              <button
                type="button"
                onClick={resetAddMoneyForm}
                className="text-gray-600 hover:text-gray-900 px-4 py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Allocations Modal */}
      {showAllocationsModal && selectedObjective && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Manage Allocations for "{selectedObjective.name}"
                </h3>
                <button
                  onClick={closeAllocationsModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column - Allocations Management */}
                <div className="space-y-6">
                  {/* Edit Forms */}
                  {(editingAllocation || editingBankBalance) && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">
                        {editingAllocation ? 'Edit Allocation' : 'Edit Bank Balance'}
                      </h4>

                      {editingBankBalance ? (
                        // Bank Balance Edit Form
                        <form onSubmit={handleBankBalanceSubmit} className="space-y-4">
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                            <p className="text-sm text-blue-800">
                              <strong>Editing:</strong> {editingBankBalance.bankName}
                            </p>
                            <p className="text-sm text-blue-600">
                              Current Balance: {editingBankBalance.currentBalance.toFixed(2)} MAD
                            </p>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                New Balance (MAD) *
                              </label>
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={bankBalanceData.newBalance}
                                onChange={(e) => setBankBalanceData({ ...bankBalanceData, newBalance: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                placeholder="0.00"
                                required
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Description
                              </label>
                              <input
                                type="text"
                                value={bankBalanceData.description}
                                onChange={(e) => setBankBalanceData({ ...bankBalanceData, description: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                placeholder="Reason for balance change..."
                              />
                            </div>
                          </div>

                          {/* Balance Change Preview */}
                          {bankBalanceData.newBalance && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                              <div className="text-sm">
                                <div className="flex justify-between">
                                  <span className="text-yellow-700">Current Balance:</span>
                                  <span className="font-medium">{editingBankBalance.currentBalance.toFixed(2)} MAD</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-yellow-700">New Balance:</span>
                                  <span className="font-medium">{parseFloat(bankBalanceData.newBalance || '0').toFixed(2)} MAD</span>
                                </div>
                                <div className="flex justify-between border-t border-yellow-200 pt-2 mt-2">
                                  <span className="text-yellow-700">Change:</span>
                                  <span className={`font-semibold ${
                                    (parseFloat(bankBalanceData.newBalance || '0') - editingBankBalance.currentBalance) >= 0
                                      ? 'text-green-600'
                                      : 'text-red-600'
                                  }`}>
                                    {(parseFloat(bankBalanceData.newBalance || '0') - editingBankBalance.currentBalance) >= 0 ? '+' : ''}
                                    {(parseFloat(bankBalanceData.newBalance || '0') - editingBankBalance.currentBalance).toFixed(2)} MAD
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}

                          <div className="flex items-center space-x-3">
                            <button
                              type="submit"
                              disabled={loading}
                              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                            >
                              {loading ? 'Updating...' : 'Update Balance'}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingBankBalance(null)
                                setBankBalanceData({ newBalance: '', description: '' })
                              }}
                              className="text-gray-600 hover:text-gray-900 px-4 py-2 rounded-lg transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      ) : (
                        // Allocation Edit Form
                        <form onSubmit={handleAllocationSubmit} className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Bank
                              </label>
                              <input
                                type="text"
                                value={banks.find(b => b.id === allocationData.bank_id)?.name || ''}
                                className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg"
                                disabled
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Amount (MAD) *
                              </label>
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={allocationData.amount}
                                onChange={(e) => setAllocationData({ ...allocationData, amount: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                placeholder="0.00"
                                required
                              />
                            </div>
                          </div>

                          <div className="flex items-center space-x-3">
                            <button
                              type="submit"
                              disabled={loading}
                              className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                            >
                              {loading ? 'Updating...' : 'Update Allocation'}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingAllocation(null)
                                setAllocationData({ bank_id: '', amount: '' })
                              }}
                              className="text-gray-600 hover:text-gray-900 px-4 py-2 rounded-lg transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  )}

                  {/* Allocations List */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Current Allocations</h4>

                    {allocations.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">No allocations yet</p>
                    ) : (
                      <div className="space-y-3">
                        {allocations.map((allocation) => {
                          const bank = banks.find(b => b.id === allocation.bank_id)
                          const bankBalance = bank ? Number(bank.balance) : 0

                          return (
                            <div key={allocation.id} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
                              <div>
                                <p className="font-medium text-gray-900">{allocation.bank_name}</p>
                                <p className="text-sm text-gray-500">
                                  Allocated: {allocation.amount.toFixed(2)} MAD
                                </p>
                              </div>
                              <div className="flex items-center space-x-3">
                                <div className="text-right">
                                  <p className="text-lg font-semibold text-gray-900">
                                    {bankBalance.toFixed(2)} MAD
                                  </p>
                                  <p className="text-xs text-gray-500">Bank Balance</p>
                                </div>
                                <div className="flex flex-col space-y-1">
                                  <button
                                    onClick={() => startEditAllocation(allocation)}
                                    className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                                    title="Edit Allocation"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => startEditBankBalance(allocation)}
                                    className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                                    title="Edit Bank Balance"
                                  >
                                    <DollarSign className="w-4 h-4" />
                                  </button>
                                </div>
                                <button
                                  onClick={() => handleDeleteAllocation(allocation)}
                                  className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                  title="Delete Allocation"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column - Real-time Transactions */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Real-time Transactions</h4>
                  <ObjectiveTransactionsViewer
                    objectiveId={selectedObjective.id}
                    objectiveName={selectedObjective.name}
                    onUpdate={() => {
                      loadAllocations(selectedObjective.id)
                      loadObjectiveAmounts()
                      loadBanks()
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Objectives List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Your Objectives</h3>
        </div>

        <div className="p-6">
          {goals.length === 0 ? (
            <div className="text-center py-8">
              <Target className="mx-auto w-12 h-12 text-gray-400 mb-4" />
              <p className="text-gray-500">No objectives created yet</p>
              <p className="text-sm text-gray-400 mt-1">Click "Add Objective" to get started</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {goals.map((goal) => {
                const currentAmount = objectiveAmounts[goal.id] || 0
                const progress = goal.target_amount ? (currentAmount / goal.target_amount) * 100 : 0

                return (
                  <div key={goal.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-10 h-10 bg-orange-100 rounded-lg">
                          <Target className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{goal.name}</h4>
                          {goal.category && (
                            <div className="flex items-center space-x-1 mt-1">
                              <Tag className="w-3 h-3 text-gray-400" />
                              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                {goal.category}
                              </span>
                            </div>
                          )}
                          {goal.target_date && (
                            <div className="flex items-center space-x-1 text-sm text-gray-500 mt-1">
                              <Calendar className="w-3 h-3" />
                              <span>{format(new Date(goal.target_date), 'MMM dd, yyyy')}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => openAllocationsModal(goal)}
                          className="p-1 text-gray-400 hover:text-purple-600 transition-colors"
                          title="Manage Allocations"
                        >
                          <Settings className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(goal)}
                          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(goal)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{currentAmount.toFixed(2)} MAD</p>
                        {goal.target_amount && (
                          <p className="text-sm text-gray-500">of {Number(goal.target_amount).toFixed(2)} MAD</p>
                        )}
                      </div>

                      {goal.target_amount && (
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">Progress</span>
                            <span className="text-gray-600">{progress.toFixed(1)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-emerald-500 h-2 rounded-full transition-all"
                              style={{
                                width: `${Math.min(100, progress)}%`
                              }}
                            ></div>
                          </div>
                        </div>
                      )}

                      {goal.notes && (
                        <p className="text-sm text-gray-600 italic">"{goal.notes}"</p>
                      )}

                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedObjective(goal)
                            setShowAddMoneyForm(true)
                          }}
                          className="flex-1 flex items-center justify-center space-x-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-3 py-2 rounded-lg transition-colors"
                        >
                          <DollarSign className="w-4 h-4" />
                          <span>Add Money</span>
                        </button>

                        <button
                          onClick={() => openAllocationsModal(goal)}
                          className="flex items-center justify-center bg-purple-50 hover:bg-purple-100 text-purple-700 px-3 py-2 rounded-lg transition-colors"
                          title="View Allocations"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}