import { useState, useEffect } from 'react'
import { Goal, Bank, ObjectiveTransaction, supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { Plus, Edit2, Trash2, Target, Calendar, DollarSign, Tag } from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

interface GoalManagerProps {
  goals: Goal[]
  banks: Bank[]
  onUpdate: (goals: Goal[]) => void
}

export function GoalManager({ goals, banks, onUpdate }: GoalManagerProps) {
  const { user } = useAuth()
  const [showForm, setShowForm] = useState(false)
  const [showAddMoneyForm, setShowAddMoneyForm] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [selectedObjective, setSelectedObjective] = useState<Goal | null>(null)
  const [loading, setLoading] = useState(false)
  const [objectiveAmounts, setObjectiveAmounts] = useState<{ [goalId: string]: number }>({})
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

      toast.success(`${amount.toFixed(2)} MAD added to ${selectedObjective.name}!`)
      
      // Reset form and refresh data
      setAddMoneyData({ bank_id: '', amount: '', description: '' })
      setShowAddMoneyForm(false)
      setSelectedObjective(null)
      loadObjectiveAmounts()
      
      // Reload page to update bank balances
      window.location.reload()
    } catch (error: any) {
      toast.error('Error adding money: ' + error.message)
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
          <span>Add Objective</span>
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

                      <button
                        onClick={() => {
                          setSelectedObjective(goal)
                          setShowAddMoneyForm(true)
                        }}
                        className="w-full flex items-center justify-center space-x-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-3 py-2 rounded-lg transition-colors"
                      >
                        <DollarSign className="w-4 h-4" />
                        <span>Add Money</span>
                      </button>
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