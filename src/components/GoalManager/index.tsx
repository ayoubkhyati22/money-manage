import { useState, useEffect } from 'react'
import { Goal, Bank } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import { Plus, Target, Eye, EyeOff } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from '../../lib/toast'
import { goalService } from '../../services/goalService'
import { allocationService } from '../../services/allocationService'
import type { Allocation } from '../../types/goal'
import { categories } from '../../types/goal'
import { GoalForm } from './GoalForm'
import { AddMoneyForm } from './AddMoneyForm'
import { GoalCard } from './GoalCard'
import { AllocationsModal } from './AllocationsModal'
import { GoalDetailPage } from './GoalDetailPage'
import { bankService } from '../../services/bankService'
import { motion } from 'framer-motion'
import { ErrorBoundary } from '../ErrorBoundary'

function safeFormatDate(dateStr: string | null | undefined, fmt: string = 'yyyy-MM-dd'): string {
  if (!dateStr) return ''
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return ''
    return format(d, fmt)
  } catch {
    return ''
  }
}

interface GoalManagerProps {
  goals: Goal[]
  banks: Bank[]
  onUpdate: (goals: Goal[]) => void
  onBanksUpdate: (banks: Bank[]) => void
}

export function GoalManager({ goals, banks, onUpdate, onBanksUpdate }: GoalManagerProps) {
  const { user } = useAuth()
  const [showForm, setShowForm] = useState(false)
  const [showAmounts, setShowAmounts] = useState(() => {
    return localStorage.getItem('ff_mask_balances') !== 'true'
  })
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [showAddMoneyForm, setShowAddMoneyForm] = useState(false)
  const [showAllocationsModal, setShowAllocationsModal] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [selectedObjective, setSelectedObjective] = useState<Goal | null>(null)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [objectiveAmounts, setObjectiveAmounts] = useState<{ [goalId: string]: number }>({})
  const [allocations, setAllocations] = useState<Allocation[]>([])
  const [loadingAllocations, setLoadingAllocations] = useState(false)
  const [detailPageGoal, setDetailPageGoal] = useState<Goal | null>(null)
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
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error)
      toast.error('Error loading objectives: ' + msg)
    } finally {
      setLoading(false)
    }
  }

  const loadObjectiveAmounts = async () => {
    try {
      const amounts = await goalService.loadObjectiveAmounts(goals.map(g => g.id))
      setObjectiveAmounts(amounts)
    } catch (error: unknown) {
      console.error('Error loading objective amounts:', error)
    }
  }

  const loadAllocations = async (goalId: string) => {
    setLoadingAllocations(true)
    try {
      const data = await goalService.loadAllocations(goalId)
      setAllocations(data)
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error)
      toast.error('Error loading allocations: ' + msg)
    } finally {
      setLoadingAllocations(false)
    }
  }

  const loadBanks = async () => {
    if (!user) return
    try {
      const data = await bankService.loadBanks(user.id)
      onBanksUpdate(data)
    } catch (error: unknown) {
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
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error)
      toast.error('Error saving objective: ' + msg)
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
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error)
      toast.error('Error adding money: ' + msg)
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
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error)
      toast.error('Error updating bank balance: ' + msg)
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
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error)
      toast.error('Error saving allocation: ' + msg)
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
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error)
      toast.error('Error deleting allocation: ' + msg)
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
      target_date: safeFormatDate(goal.target_date, 'yyyy-MM-dd'),
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
      } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : String(error)
        toast.error('Error returning money to banks: ' + msg)
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
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error)
      toast.error('Error deleting objective: ' + msg)
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

  const openDetailPage = (goal: Goal) => {
    setDetailPageGoal(goal)
    loadAllocations(goal.id)
  }

  const closeDetailPage = () => {
    setDetailPageGoal(null)
    setAllocations([])
  }

  const handleAddMoneyInPage = async (bankId: string, amount: number, description: string) => {
    if (!detailPageGoal) throw new Error('No goal selected')
    setSubmitting(true)
    try {
      await allocationService.addMoney(detailPageGoal.id, bankId, amount, description, banks)
      loadObjectiveAmounts()
      loadBanks()
      loadAllocations(detailPageGoal.id)
    } finally {
      setSubmitting(false)
    }
  }

  const handleSaveEditInPage = async (data: { name: string; category: string | null; target_amount: number | null; target_date: string | null; notes: string }) => {
    if (!detailPageGoal) throw new Error('No goal selected')
    setSubmitting(true)
    try {
      await goalService.updateGoal(detailPageGoal.id, data)
      loadGoals()
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteInPage = async () => {
    if (!detailPageGoal) throw new Error('No goal selected')
    setSubmitting(true)
    try {
      const currentAmt = objectiveAmounts[detailPageGoal.id] || 0
      if (currentAmt > 0) {
        await allocationService.returnMoneyToBanks(detailPageGoal.id, banks)
      }
      await goalService.deleteGoal(detailPageGoal.id)
      toast.success('Goal deleted!')
      closeDetailPage()
      loadGoals()
      if (currentAmt > 0) loadBanks()
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteAllocationInPage = async (allocation: Allocation) => {
    setSubmitting(true)
    try {
      await allocationService.deleteAllocation(allocation, banks)
      loadAllocations(allocation.goal_id)
      loadObjectiveAmounts()
      loadBanks()
    } finally {
      setSubmitting(false)
    }
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

  // Aggregate Calculations
  const totalSaved = Object.values(objectiveAmounts).reduce((s, v) => s + Math.max(0, v), 0)
  const totalTarget = goals.reduce((s, g) => s + Number(g.target_amount || 0), 0)
  const overallPace = totalTarget > 0 ? Math.min(100, (totalSaved / totalTarget) * 100) : 0
  const completedCount = goals.filter(g => {
    const amt = objectiveAmounts[g.id] || 0
    return g.target_amount && amt >= g.target_amount
  }).length

  const formatMAD = (amount: number, digits = 0) => {
    if (!showAmounts) return '••••••'
    return amount.toLocaleString('en-US', {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    })
  }

  if (loading && goals.length === 0) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="h-28 rounded-2xl bg-stone-100 dark:bg-[#121520] border border-stone-200/90 dark:border-white/[0.08] shadow-sm animate-pulse p-6" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-48 rounded-2xl bg-white dark:bg-[#121520] border border-stone-200/90 dark:border-white/[0.08] shadow-sm animate-pulse p-5" />
          ))}
        </div>
      </div>
    )
  }

  if (detailPageGoal) {
    const freshGoal = goals.find(g => g.id === detailPageGoal.id) || detailPageGoal
    return (
      <ErrorBoundary
        fallbackTitle="Milestone Vault Unavailable"
        fallbackMessage="Unable to load this milestone vault. Return to your active horizons below."
        onReset={closeDetailPage}
      >
        <motion.div
          initial={{ x: 30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 360, damping: 36 }}
        >
          <GoalDetailPage
            goal={freshGoal}
            currentAmount={objectiveAmounts[freshGoal.id] || 0}
            showAmounts={showAmounts}
            allocations={allocations || []}
            loadingAllocations={loadingAllocations}
            banks={banks || []}
            submitting={submitting}
            onBack={closeDetailPage}
            onAddMoney={handleAddMoneyInPage}
            onSaveEdit={handleSaveEditInPage}
            onConfirmDelete={handleDeleteInPage}
            onDeleteAllocation={handleDeleteAllocationInPage}
          />
        </motion.div>
      </ErrorBoundary>
    )
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ── 1. COMMAND HEADER & PORTFOLIO TELEMETRY ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-stone-200 dark:border-white/[0.06]"
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono tracking-wider uppercase font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Strategic Capital // Milestones
            </span>
            <span className="text-xs text-stone-400 dark:text-stone-500 font-mono hidden sm:inline">
              Portfolio Horizons
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-stone-900 dark:text-white tracking-tight">
            Capital Goals & Targets
          </h1>
        </div>

        {/* Quick Utilities */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={() => setShowAmounts(v => !v)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium bg-white dark:bg-[#12141c] border border-stone-200 dark:border-white/[0.08] text-stone-600 dark:text-stone-300 hover:border-stone-300 dark:hover:border-white/20 transition-all"
            title={showAmounts ? 'Mask figures' : 'Reveal figures'}
          >
            {showAmounts ? <EyeOff className="w-4 h-4 text-amber-500" /> : <Eye className="w-4 h-4 text-stone-400" />}
            <span>{showAmounts ? 'Mask' : 'Reveal'}</span>
          </button>

          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-semibold bg-stone-900 dark:bg-white text-white dark:text-stone-950 hover:opacity-90 transition-all shadow-md active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Goal</span>
          </button>
        </div>
      </motion.div>

      {/* ── 2. EXECUTIVE BENTO TELEMETRY BAR ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-3"
      >
        {/* Metric 1: Capital Secured */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#121520] border border-stone-200/90 dark:border-white/[0.08] flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-medium text-stone-500 uppercase tracking-wider">
              Secured in Goals
            </span>
            <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              Disciplined Capital
            </span>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-mono font-bold text-stone-900 dark:text-white tabular-num">
                {formatMAD(totalSaved)}
              </span>
              <span className="text-xs font-mono text-stone-400">MAD</span>
            </div>
            <p className="text-[11px] font-mono text-stone-400 mt-1">
              {goals.length} target{goals.length !== 1 ? 's' : ''} currently funded
            </p>
          </div>
        </div>

        {/* Metric 2: Aggregate Funding Pace */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#121520] border border-stone-200/90 dark:border-white/[0.08] flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-medium text-stone-500 uppercase tracking-wider">
              Portfolio Funding Pace
            </span>
            <span className="text-[10px] font-mono font-bold text-amber-500">
              {overallPace.toFixed(0)}% Completed
            </span>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-mono font-bold text-stone-900 dark:text-white tabular-num">
                {totalTarget > 0 ? formatMAD(totalTarget) : 'Open'}
              </span>
              {totalTarget > 0 && <span className="text-xs font-mono text-stone-400">MAD Target</span>}
            </div>
            <div className="w-full bg-stone-100 dark:bg-stone-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-amber-500 to-emerald-500 h-full rounded-full transition-all duration-700"
                style={{ width: `${overallPace}%` }}
              />
            </div>
          </div>
        </div>

        {/* Metric 3: Milestones Achieved */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#121520] border border-stone-200/90 dark:border-white/[0.08] flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-medium text-stone-500 uppercase tracking-wider">
              Milestone Status
            </span>
            <span className="text-[10px] font-mono text-stone-400">
              Horizon Completion
            </span>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-mono font-bold text-stone-900 dark:text-white tabular-num">
                {completedCount}
              </span>
              <span className="text-xs font-mono text-stone-400">
                of {goals.length} Achieved
              </span>
            </div>
            <p className="text-[11px] font-mono text-stone-400 mt-1">
              {goals.length - completedCount} active capital horizons
            </p>
          </div>
        </div>
      </motion.div>

      {/* ── 3. CATEGORY FILTER RAIL ── */}
      {goals.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setActiveCategory(null)}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all flex items-center gap-1.5 flex-shrink-0 ${
              activeCategory === null
                ? 'bg-stone-900 dark:bg-white text-white dark:text-stone-950 font-bold shadow-sm'
                : 'bg-white dark:bg-[#121520] border border-stone-200/90 dark:border-white/[0.08] text-stone-600 dark:text-stone-400 hover:border-stone-300 shadow-sm'
            }`}
          >
            <span>All Horizons</span>
            <span className="text-[10px] opacity-70">({goals.length})</span>
          </button>

          {categories
            .filter(c => goals.some(g => g.category === c))
            .map(cat => {
              const count = goals.filter(g => g.category === cat).length
              const isSelected = activeCategory === cat
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(isSelected ? null : cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all flex items-center gap-1.5 flex-shrink-0 ${
                    isSelected
                      ? 'bg-stone-900 dark:bg-white text-white dark:text-stone-950 font-bold shadow-sm'
                      : 'bg-white dark:bg-[#121520] border border-stone-200/90 dark:border-white/[0.08] text-stone-600 dark:text-stone-400 hover:border-stone-300 shadow-sm'
                  }`}
                >
                  <span>{cat}</span>
                  <span className="text-[10px] opacity-70">({count})</span>
                </button>
              )
            })}
        </div>
      )}

      {/* ── 4. FORMS & MODALS ── */}
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

      {/* ── 5. MILESTONE CARDS GRID ── */}
      {goals.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-12 rounded-2xl bg-white dark:bg-[#121520] border border-dashed border-stone-200/90 dark:border-white/10 text-center flex flex-col items-center justify-center gap-3 shadow-sm"
        >
          <div className="w-12 h-12 rounded-xl bg-stone-100 dark:bg-[#161a24] flex items-center justify-center text-stone-400">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-display font-bold text-stone-900 dark:text-white">
              No Capital Objectives Established
            </h3>
            <p className="text-xs text-stone-400 font-mono mt-1 max-w-sm">
              Define target goals for acquisitions, emergency vaults, or ventures to organize bank allocations.
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="mt-2 px-5 py-2.5 rounded-xl text-xs font-mono font-semibold bg-stone-900 dark:bg-white text-white dark:text-stone-950 hover:opacity-90 transition-all shadow-md flex items-center gap-2"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create First Milestone</span>
          </button>
        </motion.div>
      ) : (() => {
        const filtered = activeCategory ? goals.filter(g => g.category === activeCategory) : goals
        return filtered.length === 0 ? (
          <div className="py-12 text-center text-xs text-stone-400 font-mono">
            No milestones found under category "{activeCategory}"
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                }}
                onManageAllocations={() => openAllocationsModal(goal)}
                onViewDetails={() => openDetailPage(goal)}
              />
            ))}
          </div>
        )
      })()}
    </div>
  )
}
