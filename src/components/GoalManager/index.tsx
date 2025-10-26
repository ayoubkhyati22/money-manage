import { useState, useEffect } from 'react'
import { Goal, Bank } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import { Plus, Target } from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { goalService } from '../../services/goalService'
import { allocationService } from '../../services/allocationService'
import type { Allocation } from '../../types/goal'
import { GoalForm } from './GoalForm'
import { AddMoneyForm } from './AddMoneyForm'
import { GoalCard } from './GoalCard'
import { AllocationsModal } from './AllocationsModal'
import { bankService } from '../../services/bankService'

interface GoalManagerProps {
  goals: Goal[]
  banks: Bank[]
  onUpdate: (goals: Goal[]) => void
  onBanksUpdate: (banks: Bank[]) => void
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
      const data = await goalService.loadGoals(user.id)
      onUpdate(data)
    } catch (error: any) {
      toast.error('Error loading objectives: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const loadObjectiveAmounts = async () => {
    try {
      const amounts = await goalService.loadObjectiveAmounts(goals.map(g => g.id))
      setObjectiveAmounts(amounts)
    } catch (error: any) {
      console.error('Error loading objective amounts:', error)
    }
  }

  const loadAllocations = async (goalId: string) => {
    try {
      const data = await goalService.loadAllocations(goalId)
      setAllocations(data)
    } catch (error: any) {
      toast.error('Error loading allocations: ' + error.message)
    }
  }

  const loadBanks = async () => {
    if (!user) return

    try {
      const data = await bankService.loadBanks(user.id)
      onBanksUpdate(data)
    } catch (error: any) {
      console.error('Error loading banks:', error)
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
        await goalService.updateGoal(editingGoal.id, goalData)
        toast.success('Objective updated successfully!')
      } else {
        await goalService.createGoal(user.id, goalData)
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
      await allocationService.addMoney(
        selectedObjective.id,
        addMoneyData.bank_id,
        amount,
        addMoneyData.description,
        banks
      )

      toast.success(`${amount.toFixed(2)} MAD added to ${selectedObjective.name}!`)

      setAddMoneyData({ bank_id: '', amount: '', description: '' })
      setShowAddMoneyForm(false)
      setSelectedObjective(null)
      loadObjectiveAmounts()
      loadBanks()
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

    setLoading(true)
    try {
      await allocationService.updateBankBalance(
        editingBankBalance.bankId,
        newBalance,
        editingBankBalance.currentBalance,
        selectedObjective.id,
        editingBankBalance.allocationId,
        bankBalanceData.description,
        allocations
      )

      toast.success('Bank balance updated successfully!')

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
      await allocationService.updateAllocation(
        editingAllocation.id,
        allocationData.bank_id,
        amount,
        editingAllocation.amount,
        selectedObjective.id,
        banks
      )

      toast.success('Allocation updated successfully!')

      setAllocationData({ bank_id: '', amount: '' })
      setEditingAllocation(null)
      loadAllocations(selectedObjective.id)
      loadObjectiveAmounts()
      loadBanks()
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
      await allocationService.deleteAllocation(allocation, banks)

      toast.success('Allocation deleted successfully!')
      loadAllocations(allocation.goal_id)
      loadObjectiveAmounts()
      loadBanks()
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

      try {
        await allocationService.returnMoneyToBanks(goal.id, banks)
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
      await goalService.deleteGoal(goal.id)

      toast.success('Objective deleted successfully!')
      loadGoals()

      if (currentAmount > 0) {
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

  const cancelEdit = () => {
    setEditingAllocation(null)
    setEditingBankBalance(null)
    setAllocationData({ bank_id: '', amount: '' })
    setBankBalanceData({ newBalance: '', description: '' })
  }

  if (loading && goals.length === 0) {
    return (
      <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-600 p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-dark-600 rounded w-1/4"></div>
          <div className="space-y-3">
            <div className="h-16 bg-gray-200 dark:bg-dark-600 rounded"></div>
            <div className="h-16 bg-gray-200 dark:bg-dark-600 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <br />
      <div className="flex items-center justify-between">
        <h2 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-dark-100">Financial Objectives</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center space-x-1.5 sm:space-x-2 bg-emerald-500 dark:bg-primary-500 hover:bg-emerald-600 dark:hover:bg-primary-600 text-white px-3 py-1.5 sm:px-4 sm:py-2 text-sm rounded-lg transition-colors"
        >
          <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span>Add</span>
        </button>
      </div>

      {showForm && (
        <GoalForm
          formData={formData}
          editingGoal={editingGoal}
          loading={loading}
          onSubmit={handleSubmit}
          onChange={setFormData}
          onCancel={resetForm}
        />
      )}

      {showAddMoneyForm && selectedObjective && (
        <AddMoneyForm
          selectedObjective={selectedObjective}
          banks={banks}
          formData={addMoneyData}
          loading={loading}
          onSubmit={handleAddMoney}
          onChange={setAddMoneyData}
          onCancel={resetAddMoneyForm}
        />
      )}

      {showAllocationsModal && selectedObjective && (
        <AllocationsModal
          selectedObjective={selectedObjective}
          allocations={allocations}
          banks={banks}
          editingAllocation={editingAllocation}
          editingBankBalance={editingBankBalance}
          allocationData={allocationData}
          bankBalanceData={bankBalanceData}
          loading={loading}
          onClose={closeAllocationsModal}
          onEditAllocation={startEditAllocation}
          onEditBankBalance={startEditBankBalance}
          onDeleteAllocation={handleDeleteAllocation}
          onAllocationSubmit={handleAllocationSubmit}
          onBankBalanceSubmit={handleBankBalanceSubmit}
          onAllocationDataChange={setAllocationData}
          onBankBalanceDataChange={setBankBalanceData}
          onCancelEdit={cancelEdit}
          onUpdate={() => {
            loadAllocations(selectedObjective.id)
            loadObjectiveAmounts()
            loadBanks()
          }}
        />
      )}

      <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-600">
        <div className="p-3 sm:p-6 border-b border-gray-200 dark:border-dark-600">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-dark-100">Your Objectives</h3>
        </div>

        <div className="p-3 sm:p-6">
          {goals.length === 0 ? (
            <div className="text-center py-6 sm:py-8">
              <Target className="mx-auto w-10 h-10 sm:w-12 sm:h-12 text-gray-400 dark:text-dark-500 mb-3 sm:mb-4" />
              <p className="text-sm sm:text-base text-gray-500 dark:text-dark-300">No objectives created yet</p>
              <p className="text-xs sm:text-sm text-gray-400 dark:text-dark-400 mt-1">Click "Add" to get started</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
              {goals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  currentAmount={objectiveAmounts[goal.id] || 0}
                  onEdit={() => handleEdit(goal)}
                  onDelete={() => handleDelete(goal)}
                  onAddMoney={() => {
                    setSelectedObjective(goal)
                    setShowAddMoneyForm(true)
                    // Scroll to top
                    window.scrollTo({
                      top: 0,
                      behavior: 'smooth'
                    })
                  }}
                  onManageAllocations={() => openAllocationsModal(goal)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
