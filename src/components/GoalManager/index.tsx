import { useState, useEffect } from 'react'
import { Goal, Bank } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import { Plus, Target, Eye, EyeOff } from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { goalService } from '../../services/goalService'
import { allocationService } from '../../services/allocationService'
import type { Allocation } from '../../types/goal'
import { categories } from '../../types/goal'
import { GoalForm } from './GoalForm'
import { AddMoneyForm } from './AddMoneyForm'
import { GoalCard } from './GoalCard'
import { AllocationsModal } from './AllocationsModal'
import { bankService } from '../../services/bankService'
import { motion } from 'framer-motion'

interface GoalManagerProps {
  goals: Goal[]
  banks: Bank[]
  onUpdate: (goals: Goal[]) => void
  onBanksUpdate: (banks: Bank[]) => void
}

export function GoalManager({ goals, banks, onUpdate, onBanksUpdate }: GoalManagerProps) {
  const { user } = useAuth()
  const [showForm, setShowForm] = useState(false)
  const [showAmounts, setShowAmounts] = useState(false)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
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

  const totalSaved = Object.values(objectiveAmounts).reduce((s, v) => s + Math.max(0, v), 0)
  const completedCount = goals.filter(g => {
    const amt = objectiveAmounts[g.id] || 0
    return g.target_amount && amt >= g.target_amount
  }).length

  if (loading && goals.length === 0) {
    return (
      <div className="space-y-4">
        <div className="h-28 rounded-3xl bg-slate-200 dark:bg-slate-700 animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {[1, 2, 3].map(i => <div key={i} className="h-56 rounded-2xl bg-slate-200 dark:bg-slate-700 animate-pulse" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* ── Stats hero ── */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl px-4 py-3 text-white"
        style={{ background: 'linear-gradient(135deg, #059669 0%, #0891b2 100%)' }}
      >
        <div className="relative z-10 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* Goals count */}
            <div>
              <p className="text-white/50 text-[10px] font-semibold uppercase tracking-wider">Goals</p>
              <p className="text-xl font-bold leading-tight">{goals.length}</p>
            </div>
            <div className="w-px h-7 bg-white/20" />
            {/* Total saved */}
            <div>
              <div className="flex items-center gap-1">
                <p className="text-white/50 text-[10px] font-semibold uppercase tracking-wider">Saved</p>
                <button onClick={() => setShowAmounts(v => !v)} className="hover:bg-white/10 rounded p-0.5 transition-colors">
                  {showAmounts ? <EyeOff className="w-2.5 h-2.5 text-white/50" /> : <Eye className="w-2.5 h-2.5 text-white/50" />}
                </button>
              </div>
              {showAmounts ? (
                <p className="text-xl font-bold leading-tight">
                  {totalSaved.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                  <span className="text-xs font-normal text-white/60 ml-1">MAD</span>
                </p>
              ) : (
                <div className="flex items-center gap-1.5 h-7">
                  {[...Array(4)].map((_, i) => <span key={i} className="w-2 h-2 bg-white/40 rounded-full" />)}
                </div>
              )}
            </div>
            <div className="w-px h-7 bg-white/20" />
            {/* Completed */}
            <div>
              <p className="text-white/50 text-[10px] font-semibold uppercase tracking-wider">Done</p>
              <p className="text-xl font-bold leading-tight">{completedCount}</p>
            </div>
          </div>

          <div
            onClick={() => setShowForm(!showForm)}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors flex-shrink-0 cursor-pointer"
            style={{ minWidth: 32, minHeight: 32 }}
          >
            <Plus className="w-4 h-4" />
          </div>
        </div>
      </motion.div>

      {/* ── Forms ── */}
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

      {/* ── Category filter ── */}
      {goals.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {[{ label: 'All', value: null as string | null }, ...categories.filter(c => goals.some(g => g.category === c)).map(c => ({ label: c, value: c }))].map(({ label, value }) => (
            <div
              key={label}
              onClick={() => setActiveCategory(prev => value === null ? null : prev === value ? null : value)}
              className={`flex-shrink-0 px-3 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                activeCategory === value
                  ? 'bg-primary-500 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
              style={{ height: 28, display: 'flex', alignItems: 'center' }}
            >
              {label}
            </div>
          ))}
        </div>
      )}

      {/* ── Goals list ── */}
      {goals.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20 gap-4"
        >
          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
            <Target className="w-8 h-8 text-slate-400" />
          </div>
          <div className="text-center">
            <p className="font-semibold text-slate-700 dark:text-slate-200 mb-1">No goals yet</p>
            <p className="text-sm text-slate-400">Create your first savings goal to get started</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add your first goal
          </button>
        </motion.div>
      ) : (() => {
        const filtered = activeCategory ? goals.filter(g => g.category === activeCategory) : goals
        return filtered.length === 0 ? (
          <p className="text-center py-10 text-sm text-slate-400">No goals in this category</p>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {filtered.map((goal, index) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                index={index}
                currentAmount={objectiveAmounts[goal.id] || 0}
                showAmounts={showAmounts}
                onEdit={() => handleEdit(goal)}
                onDelete={() => handleDelete(goal)}
                onAddMoney={() => {
                  setSelectedObjective(goal)
                  setShowAddMoneyForm(true)
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
                onManageAllocations={() => openAllocationsModal(goal)}
              />
            ))}
          </div>
        )
      })()}
    </div>
  )
}
