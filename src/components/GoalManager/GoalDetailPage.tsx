import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Eye,
  EyeOff,
  Edit2,
  Trash2,
  Calendar,
  Building2,
  Check,
  AlertTriangle,
  ArrowUpCircle,
  ArrowDownCircle,
  History,
  Target
} from 'lucide-react'
import { Goal, Bank } from '../../lib/supabase'
import { format, differenceInDays } from 'date-fns'
import type { Allocation, GoalTransaction } from '../../types/goal'
import { categories } from '../../types/goal'
import { goalService } from '../../services/goalService'
import { toast } from '../../lib/toast'

function safeFormatDate(dateStr: string | null | undefined, fmt: string = 'MMMM dd, yyyy'): string {
  if (!dateStr) return ''
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return ''
    return format(d, fmt)
  } catch {
    return ''
  }
}

function safeDaysLeft(dateStr: string | null | undefined): number | null {
  if (!dateStr) return null
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return null
    return differenceInDays(d, new Date())
  } catch {
    return null
  }
}

type View = 'detail' | 'add-money' | 'edit' | 'allocations' | 'transactions' | 'confirm-delete'

interface GoalDetailPageProps {
  goal: Goal
  currentAmount: number
  showAmounts: boolean
  allocations: Allocation[]
  loadingAllocations: boolean
  banks: Bank[]
  submitting: boolean
  onBack: () => void
  onAddMoney: (bankId: string, amount: number, description: string) => Promise<void>
  onSaveEdit: (data: {
    name: string
    category: string | null
    target_amount: number | null
    target_date: string | null
    notes: string
  }) => Promise<void>
  onConfirmDelete: () => Promise<void>
  onDeleteAllocation: (allocation: Allocation) => Promise<void>
}

const R = 44
const CIRC = 2 * Math.PI * R

const inputCls =
  'w-full rounded-xl border border-stone-200 dark:border-white/[0.08] bg-stone-50 dark:bg-[#14161f] px-3.5 py-2.5 text-sm font-mono text-stone-900 dark:text-white placeholder:text-stone-400 focus:outline-none focus:border-amber-500/60 transition-colors'
const labelCls = 'block text-xs font-mono font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-1.5'

const slide = {
  enter: (d: number) => ({ x: d > 0 ? 40 : -40, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (d: number) => ({ x: d > 0 ? -40 : 40, opacity: 0 }),
}

export function GoalDetailPage({
  goal,
  currentAmount,
  showAmounts,
  allocations,
  loadingAllocations,
  banks,
  submitting,
  onBack,
  onAddMoney,
  onSaveEdit,
  onConfirmDelete,
  onDeleteAllocation,
}: GoalDetailPageProps) {
  const [view, setView] = useState<View>('detail')
  const [dir, setDir] = useState(1)

  // Form states
  const [addForm, setAddForm] = useState({ bank_id: '', amount: '', description: '' })
  const [editForm, setEditForm] = useState({
    name: '',
    category: '',
    target_amount: '',
    target_date: '',
    notes: '',
  })
  const [confirmDeleteAlloc, setConfirmDeleteAlloc] = useState<string | null>(null)
  const [localShow, setLocalShow] = useState(showAmounts)
  const [transactions, setTransactions] = useState<GoalTransaction[]>([])
  const [loadingTransactions, setLoadingTransactions] = useState(false)

  // Reset to detail when goal changes
  useEffect(() => {
    setView('detail')
    setDir(1)
  }, [goal.id])

  // Load transactions when navigating to that view
  useEffect(() => {
    if (view !== 'transactions') return
    setLoadingTransactions(true)
    goalService
      .loadGoalTransactions(goal.id)
      .then(setTransactions)
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : String(err)
        toast.error(msg)
      })
      .finally(() => setLoadingTransactions(false))
  }, [view, goal.id])

  // Pre-fill edit form
  useEffect(() => {
    if (view !== 'edit') return
    setEditForm({
      name: goal.name,
      category: goal.category || '',
      target_amount: goal.target_amount ? String(goal.target_amount) : '',
      target_date: safeFormatDate(goal.target_date, 'yyyy-MM-dd'),
      notes: goal.notes || '',
    })
  }, [view, goal])

  const goTo = (next: View) => {
    setDir(1)
    setView(next)
  }

  const back = () => {
    setDir(-1)
    setView('detail')
  }

  // Calculations
  const safeCurrent = typeof currentAmount === 'number' && !isNaN(currentAmount) ? currentAmount : 0
  const target = goal.target_amount ? Number(goal.target_amount) : 0
  const progress = target > 0 ? Math.min((safeCurrent / target) * 100, 100) : 0
  const isCompleted = progress >= 100
  const remaining = target > 0 ? Math.max(target - safeCurrent, 0) : null
  const daysLeft = safeDaysLeft(goal.target_date)
  const safeProgress = isNaN(progress) ? 0 : Math.max(0, Math.min(100, progress))
  const dashOffset = CIRC - (CIRC * safeProgress) / 100

  const formatMAD = (amount: number, digits = 0) => {
    if (!localShow) return '••••••'
    return amount.toLocaleString('en-US', {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    })
  }

  const submitAddMoney = async (e: React.FormEvent) => {
    e.preventDefault()
    const amt = parseFloat(addForm.amount)
    if (!addForm.bank_id || isNaN(amt) || amt <= 0) {
      toast.error('Please specify a valid bank and amount')
      return
    }
    try {
      await onAddMoney(addForm.bank_id, amt, addForm.description)
      toast.success(`${amt.toFixed(2)} MAD allocated to ${goal.name}!`)
      setAddForm({ bank_id: '', amount: '', description: '' })
      back()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      toast.error(msg)
    }
  }

  const submitEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editForm.name.trim()) {
      toast.error('Goal name is required')
      return
    }
    try {
      await onSaveEdit({
        name: editForm.name.trim(),
        category: editForm.category || null,
        target_amount: editForm.target_amount ? parseFloat(editForm.target_amount) : null,
        target_date: editForm.target_date || null,
        notes: editForm.notes,
      })
      toast.success('Goal updated successfully!')
      back()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      toast.error(msg)
    }
  }

  const submitDelete = async () => {
    try {
      await onConfirmDelete()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      toast.error(msg)
    }
  }

  const deleteAlloc = async (a: Allocation) => {
    try {
      await onDeleteAllocation(a)
      toast.success('Allocation removed!')
      setConfirmDeleteAlloc(null)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      toast.error(msg)
    }
  }

  // Sub-view header
  const SubHeader = ({ title, subtitle }: { title: string; subtitle?: string }) => (
    <div className="flex items-center gap-3 px-1 mb-6">
      <button
        onClick={back}
        className="flex items-center justify-center rounded-xl bg-stone-100 dark:bg-[#161a24] border border-stone-200/80 dark:border-white/[0.08] hover:bg-stone-200 dark:hover:bg-white/[0.05] transition-colors w-9 h-9 flex-shrink-0"
      >
        <ChevronLeft className="w-4 h-4 text-stone-600 dark:text-stone-300" />
      </button>
      <div className="min-w-0">
        <p className="text-base font-display font-bold text-stone-900 dark:text-white leading-tight">
          {title}
        </p>
        {subtitle && <p className="text-xs font-mono text-stone-400 truncate mt-0.5">{subtitle}</p>}
      </div>
    </div>
  )

  const renderView = () => {
    switch (view) {
      // ── DETAIL ────────────────────────────────────────────────────────────
      case 'detail':
        return (
          <div className="space-y-5">
            {/* Navigation Header */}
            <div className="flex items-center justify-between px-1">
              <button
                onClick={onBack}
                className="flex items-center gap-2 text-xs font-mono text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-stone-100 dark:bg-[#161a24] border border-stone-200/80 dark:border-white/[0.08]">
                  <ChevronLeft className="w-4 h-4 text-stone-600 dark:text-stone-300" />
                </div>
                <span>Back to Milestones</span>
              </button>

              <button
                onClick={() => setLocalShow(v => !v)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-[#14161f] border border-stone-200 dark:border-white/[0.08] text-xs font-medium text-stone-600 dark:text-stone-300 transition-colors"
              >
                {localShow ? <EyeOff className="w-3.5 h-3.5 text-amber-500" /> : <Eye className="w-3.5 h-3.5 text-stone-400" />}
                <span>{localShow ? 'Mask' : 'Reveal'}</span>
              </button>
            </div>

            {/* Sovereign Milestone Vault Banner */}
            <div className="p-6 sm:p-7 rounded-2xl titanium-card text-white relative overflow-hidden">
              <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono tracking-wider uppercase font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                      <Target className="w-2.5 h-2.5" />
                      {goal.category || 'Capital Reserve'}
                    </span>
                    {isCompleted && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        <Check className="w-2.5 h-2.5" /> Target Achieved
                      </span>
                    )}
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
                    {goal.name}
                  </h2>

                  {/* Horizon Countdown */}
                  <div className="flex items-center gap-2 text-xs font-mono text-stone-400 flex-wrap">
                    {goal.target_date && safeFormatDate(goal.target_date) && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-stone-400" />
                        {safeFormatDate(goal.target_date, 'MMMM dd, yyyy')}
                      </span>
                    )}
                    {daysLeft !== null && (
                      <span className={`px-2 py-0.5 rounded-md ${daysLeft < 0 ? 'bg-rose-500/20 text-rose-300' : daysLeft < 30 ? 'bg-amber-500/20 text-amber-300' : 'bg-white/10 text-stone-300'}`}>
                        {daysLeft < 0 ? `${Math.abs(daysLeft)}d overdue` : `${daysLeft} days remaining`}
                      </span>
                    )}
                  </div>
                </div>

                {/* Circular Gauge Ring */}
                <div className="relative flex-shrink-0 self-center" style={{ width: 104, height: 104 }}>
                  <svg width="104" height="104" viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)' }}>
                    <circle cx="60" cy="60" r={R} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
                    <motion.circle
                      cx="60"
                      cy="60"
                      r={R}
                      fill="none"
                      stroke={isCompleted ? '#10B981' : '#C5A059'}
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={CIRC}
                      initial={{ strokeDashoffset: CIRC }}
                      animate={{ strokeDashoffset: dashOffset }}
                      transition={{ duration: 1.2, ease: 'easeOut' }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center font-mono">
                    <span className="text-xl font-bold text-white leading-none tabular-num">
                      {progress.toFixed(0)}%
                    </span>
                    <span className="text-[9px] uppercase tracking-widest text-stone-400 mt-1">
                      funded
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Core Metrics: Saved vs Target & Gap */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Saved */}
              <div className="p-5 rounded-2xl bg-white dark:bg-[#121520] border border-stone-200/90 dark:border-white/[0.08] shadow-sm flex flex-col justify-between">
                <span className={labelCls}>Capital Accumulated</span>
                <div className="my-1">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-mono font-bold tracking-tight text-stone-900 dark:text-white tabular-num">
                      {formatMAD(currentAmount)}
                    </span>
                    <span className="text-xs font-mono font-semibold text-stone-400">MAD</span>
                  </div>
                  <p className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                    Secured across {allocations.length} depository accounts
                  </p>
                </div>
              </div>

              {/* Target & Remaining Gap */}
              <div className="p-5 rounded-2xl bg-white dark:bg-[#121520] border border-stone-200/90 dark:border-white/[0.08] shadow-sm flex flex-col justify-between">
                <span className={labelCls}>Target Goal Horizon</span>
                <div className="my-1">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-mono font-bold tracking-tight text-stone-900 dark:text-white tabular-num">
                      {target > 0 ? formatMAD(target) : 'Open Horizon'}
                    </span>
                    {target > 0 && <span className="text-xs font-mono font-semibold text-stone-400">MAD</span>}
                  </div>
                  <p className="text-[11px] font-mono text-stone-400 mt-1">
                    {remaining !== null && remaining > 0 ? (
                      <span>Gap to close: <strong className="text-stone-700 dark:text-stone-200">{formatMAD(remaining)} MAD</strong></span>
                    ) : (
                      <span>Objective fully funded</span>
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Notes Section (if any) */}
            {goal.notes && (
              <div className="p-4 rounded-2xl bg-white dark:bg-[#121520] border border-stone-200/90 dark:border-white/[0.08] shadow-sm">
                <span className={labelCls}>Strategic Notes</span>
                <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed mt-1 whitespace-pre-wrap">
                  {goal.notes}
                </p>
              </div>
            )}

            {/* Tactical Command Action Deck */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#121520] border border-stone-200/90 dark:border-white/[0.08] shadow-sm">
              <span className={labelCls}>Tactical Operations</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-2">
                <button
                  onClick={() => goTo('add-money')}
                  className="flex items-center justify-center gap-2 p-3 rounded-xl bg-stone-900 dark:bg-white text-white dark:text-stone-950 font-mono text-xs font-semibold hover:opacity-90 transition-all shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Allocate Funds</span>
                </button>

                <button
                  onClick={() => goTo('transactions')}
                  className="flex items-center justify-center gap-2 p-3 rounded-xl bg-stone-100 dark:bg-[#161a24] border border-stone-200/80 dark:border-white/[0.07] text-stone-700 dark:text-stone-300 font-mono text-xs font-medium hover:bg-stone-200 dark:hover:bg-white/[0.05] transition-all"
                >
                  <History className="w-4 h-4 text-stone-400" />
                  <span>Audit Trail</span>
                </button>

                <button
                  onClick={() => goTo('edit')}
                  className="flex items-center justify-center gap-2 p-3 rounded-xl bg-stone-100 dark:bg-[#161a24] border border-stone-200/80 dark:border-white/[0.07] text-stone-700 dark:text-stone-300 font-mono text-xs font-medium hover:bg-stone-200 dark:hover:bg-white/[0.05] transition-all"
                >
                  <Edit2 className="w-4 h-4 text-stone-400" />
                  <span>Edit Target</span>
                </button>

                <button
                  onClick={() => goTo('confirm-delete')}
                  className="flex items-center justify-center gap-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 font-mono text-xs font-medium hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Dissolve Goal</span>
                </button>
              </div>
            </div>

            {/* Bank Allocations Breakdown */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#121520] border border-stone-200/90 dark:border-white/[0.08] shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-display font-bold text-stone-900 dark:text-white">
                    Depository Allocations
                  </h3>
                  <p className="text-[11px] text-stone-400 mt-0.5">
                    Institutions backing this milestone
                  </p>
                </div>
                {allocations.length > 0 && (
                  <button
                    onClick={() => goTo('allocations')}
                    className="text-xs font-mono font-medium text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
                  >
                    <span>Manage ({allocations.length})</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {loadingAllocations ? (
                <div className="space-y-2">
                  {[1, 2].map(i => (
                    <div key={i} className="h-14 rounded-xl bg-stone-100 dark:bg-[#161a24] animate-pulse" />
                  ))}
                </div>
              ) : allocations.length === 0 ? (
                <div className="py-8 text-center border border-dashed border-stone-200 dark:border-white/10 rounded-xl">
                  <Building2 className="w-6 h-6 mx-auto text-stone-400 mb-1 opacity-50" />
                  <p className="text-xs text-stone-400 font-mono">No bank accounts allocated to this goal yet</p>
                  <button
                    onClick={() => goTo('add-money')}
                    className="mt-2 text-xs font-mono font-medium text-amber-600 dark:text-amber-400 hover:underline inline-flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Allocate first deposit
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {allocations.map(a => {
                    const proportion = currentAmount > 0 ? (Number(a.amount) / currentAmount) * 100 : 0
                    return (
                      <div
                        key={a.id}
                        className="p-3.5 rounded-xl bg-stone-50 dark:bg-[#14161f] border border-stone-200/60 dark:border-white/[0.06] flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-stone-200 dark:bg-[#1e2230] flex items-center justify-center flex-shrink-0 text-stone-600 dark:text-stone-300 font-mono font-bold text-xs">
                            {(a.bank_name || 'Bank').slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-stone-900 dark:text-white leading-tight">
                              {a.bank_name}
                            </p>
                            <p className="text-[10px] font-mono text-stone-400 mt-0.5">
                              {proportion.toFixed(0)}% of goal total
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="text-sm font-mono font-bold text-stone-900 dark:text-white tabular-num">
                            {formatMAD(Number(a.amount))}
                          </p>
                          <p className="text-[10px] font-mono text-stone-400">MAD</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )

      // ── ADD MONEY ─────────────────────────────────────────────────────────
      case 'add-money':
        return (
          <div className="max-w-xl mx-auto">
            <SubHeader title="Allocate Capital" subtitle={goal.name} />
            <form onSubmit={submitAddMoney} className="space-y-4">
              <div>
                <label className={labelCls}>Select Source Bank Account</label>
                {banks.length === 0 ? (
                  <p className="text-xs text-stone-400 font-mono py-4">No banks linked</p>
                ) : (
                  <div className="space-y-2">
                    {banks.map(bank => {
                      const isSelected = addForm.bank_id === bank.id
                      return (
                        <div
                          key={bank.id}
                          onClick={() => setAddForm(f => ({ ...f, bank_id: bank.id }))}
                          className={`flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer ${
                            isSelected
                              ? 'border-amber-500/60 bg-amber-500/5'
                              : 'border-stone-200/90 dark:border-white/[0.08] bg-white dark:bg-[#121520] hover:border-stone-300 shadow-sm'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-stone-100 dark:bg-[#161a24] flex items-center justify-center font-mono text-xs font-bold text-amber-500">
                              {(bank.name || 'Bank').slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-stone-900 dark:text-white">
                                {bank.name}
                              </p>
                              <p className="text-[10px] font-mono text-stone-400">
                                Balance: {formatMAD(Number(bank.balance), 2)} MAD
                              </p>
                            </div>
                          </div>

                          <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                            isSelected ? 'bg-amber-500 border-amber-500 text-white' : 'border-stone-300 dark:border-stone-700'
                          }`}>
                            {isSelected && <Check className="w-3 h-3 text-white" />}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              <div>
                <label className={labelCls}>Allocation Amount (MAD)</label>
                <div className="relative">
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={addForm.amount}
                    onChange={e => setAddForm(f => ({ ...f, amount: e.target.value }))}
                    placeholder="0.00"
                    required
                    className={inputCls}
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-stone-400 font-semibold pointer-events-none">
                    MAD
                  </span>
                </div>
              </div>

              <div>
                <label className={labelCls}>Memo (Optional)</label>
                <input
                  type="text"
                  value={addForm.description}
                  onChange={e => setAddForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="e.g. Monthly allocation, bonus split"
                  className={inputCls}
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={!addForm.bank_id || !addForm.amount || submitting}
                  className="w-full py-3 rounded-xl bg-stone-900 dark:bg-white text-white dark:text-stone-950 font-mono font-semibold text-xs transition-all disabled:opacity-50 shadow-md"
                >
                  {submitting ? 'Processing Allocation...' : 'Confirm Allocation'}
                </button>
              </div>
            </form>
          </div>
        )

      // ── EDIT GOAL ─────────────────────────────────────────────────────────
      case 'edit':
        return (
          <div className="max-w-xl mx-auto">
            <SubHeader title="Edit Milestone Target" subtitle={goal.name} />
            <form onSubmit={submitEdit} className="space-y-4">
              <div>
                <label className={labelCls}>Milestone Name *</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                  className={inputCls}
                />
              </div>

              <div>
                <label className={labelCls}>Category</label>
                <div className="flex flex-wrap gap-1.5">
                  {['', ...categories].map(cat => (
                    <button
                      type="button"
                      key={cat || 'none'}
                      onClick={() => setEditForm(f => ({ ...f, category: cat }))}
                      className={`px-3 py-1 rounded-lg text-xs font-mono transition-all ${
                        editForm.category === cat
                          ? 'bg-amber-500 text-white font-semibold'
                          : 'bg-stone-100 dark:bg-[#161a24] text-stone-600 dark:text-stone-400 border border-stone-200/80 dark:border-white/[0.06]'
                      }`}
                    >
                      {cat || 'General'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className={labelCls}>Target Amount (MAD)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={editForm.target_amount}
                  onChange={e => setEditForm(f => ({ ...f, target_amount: e.target.value }))}
                  placeholder="0.00"
                  className={inputCls}
                />
              </div>

              <div>
                <label className={labelCls}>Target Horizon Date</label>
                <input
                  type="date"
                  value={editForm.target_date}
                  onChange={e => setEditForm(f => ({ ...f, target_date: e.target.value }))}
                  className={inputCls}
                />
              </div>

              <div>
                <label className={labelCls}>Notes</label>
                <textarea
                  rows={3}
                  value={editForm.notes}
                  onChange={e => setEditForm(f => ({ ...f, notes: e.target.value }))}
                  className={inputCls + ' resize-none'}
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={!editForm.name.trim() || submitting}
                  className="w-full py-3 rounded-xl bg-stone-900 dark:bg-white text-white dark:text-stone-950 font-mono font-semibold text-xs transition-all disabled:opacity-50 shadow-md"
                >
                  {submitting ? 'Saving...' : 'Commit Milestone Changes'}
                </button>
              </div>
            </form>
          </div>
        )

      // ── ALLOCATIONS ───────────────────────────────────────────────────────
      case 'allocations':
        return (
          <div className="max-w-xl mx-auto">
            <SubHeader title="Bank Allocations" subtitle={`${allocations.length} accounts · ${goal.name}`} />
            {loadingAllocations ? (
              <div className="space-y-2">
                {[1, 2].map(i => (
                  <div key={i} className="h-16 rounded-xl bg-stone-100 dark:bg-[#161a24] animate-pulse" />
                ))}
              </div>
            ) : allocations.length === 0 ? (
              <div className="py-12 text-center border border-dashed border-stone-200 dark:border-white/10 rounded-xl">
                <Building2 className="w-8 h-8 mx-auto text-stone-400 mb-2 opacity-50" />
                <p className="text-xs text-stone-400 font-mono">No active bank allocations</p>
                <button
                  onClick={() => goTo('add-money')}
                  className="mt-3 px-4 py-2 rounded-xl text-xs font-mono font-semibold bg-stone-900 dark:bg-white text-white dark:text-stone-950 inline-flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" /> Allocate Funds
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {allocations.map(a => (
                  <div key={a.id}>
                    {confirmDeleteAlloc === a.id ? (
                      <div className="p-4 rounded-xl border border-rose-500/40 bg-rose-500/5 space-y-3">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-rose-500 flex-shrink-0" />
                          <p className="text-xs font-semibold text-rose-600 dark:text-rose-400">
                            Remove allocation from {a.bank_name}?
                          </p>
                        </div>
                        <p className="text-[11px] text-stone-500 dark:text-stone-400 font-mono">
                          {formatMAD(Number(a.amount))} MAD will be returned directly to {a.bank_name}.
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setConfirmDeleteAlloc(null)}
                            className="flex-1 py-2 rounded-lg bg-stone-100 dark:bg-[#161a24] text-xs font-mono text-stone-600 dark:text-stone-300"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => deleteAlloc(a)}
                            className="flex-1 py-2 rounded-lg bg-rose-600 text-white text-xs font-mono font-bold"
                          >
                            {submitting ? 'Removing...' : 'Confirm Return'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3.5 rounded-xl bg-white dark:bg-[#121520] border border-stone-200/90 dark:border-white/[0.08] shadow-sm flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-stone-100 dark:bg-[#161a24] flex items-center justify-center font-mono text-xs font-bold text-stone-700 dark:text-stone-300">
                            {(a.bank_name || 'Bank').slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-stone-900 dark:text-white">
                              {a.bank_name}
                            </p>
                            <p className="text-[11px] font-mono text-stone-400">
                              {formatMAD(Number(a.amount))} MAD allocated
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => setConfirmDeleteAlloc(a.id)}
                          className="p-2 rounded-lg text-stone-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
                          title="Return allocation to bank"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}

                <button
                  onClick={() => goTo('add-money')}
                  className="w-full py-3 rounded-xl border border-dashed border-stone-200 dark:border-white/10 hover:border-amber-500/50 text-stone-500 hover:text-amber-500 text-xs font-mono font-semibold transition-all flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Allocate from another account</span>
                </button>
              </div>
            )}
          </div>
        )

      // ── TRANSACTIONS ─────────────────────────────────────────────────────
      case 'transactions':
        return (
          <div className="max-w-xl mx-auto">
            <SubHeader title="Capital Audit Trail" subtitle={goal.name} />
            {loadingTransactions ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-16 rounded-xl bg-stone-100 dark:bg-[#161a24] animate-pulse" />
                ))}
              </div>
            ) : transactions.length === 0 ? (
              <div className="py-12 text-center border border-dashed border-stone-200 dark:border-white/10 rounded-xl">
                <History className="w-8 h-8 mx-auto text-stone-400 mb-2 opacity-50" />
                <p className="text-xs text-stone-400 font-mono">No historical ledger entries for this milestone</p>
              </div>
            ) : (
              <div className="space-y-2">
                {transactions.map(tx => {
                  const isPositive = Number(tx.amount) > 0
                  return (
                    <div
                      key={tx.id}
                      className="p-3.5 rounded-xl bg-white dark:bg-[#121520] border border-stone-200/90 dark:border-white/[0.08] shadow-sm flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          isPositive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                        }`}>
                          {isPositive ? <ArrowUpCircle className="w-4 h-4" /> : <ArrowDownCircle className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-stone-900 dark:text-white">
                            {tx.description || tx.bank_name || 'Transaction'}
                          </p>
                          <p className="text-[10px] font-mono text-stone-400">
                            {tx.bank_name || 'Bank'} • {safeFormatDate(tx.created_at, 'MMM dd, yyyy')}
                          </p>
                        </div>
                      </div>

                      <div className="text-right font-mono">
                        <p className={`text-xs font-bold tabular-num ${
                          isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                        }`}>
                          {isPositive ? '+' : ''}{formatMAD(Number(tx.amount), 2)} MAD
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )

      // ── CONFIRM DELETE ────────────────────────────────────────────────────
      case 'confirm-delete':
        return (
          <div className="max-w-md mx-auto py-6">
            <SubHeader title="Dissolve Goal" />
            <div className="p-6 rounded-2xl bg-white dark:bg-[#121520] border border-rose-500/30 text-center space-y-4 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-500 mx-auto flex items-center justify-center">
                <Trash2 className="w-6 h-6" />
              </div>

              <div>
                <h3 className="text-base font-display font-bold text-stone-900 dark:text-white">
                  Permanently Dissolve Goal?
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                  "{goal.name}" will be closed and removed from your active targets.
                </p>
              </div>

              {currentAmount > 0 && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs font-mono text-amber-700 dark:text-amber-400">
                  <p>
                    {formatMAD(currentAmount)} MAD will be automatically released back to source banks.
                  </p>
                </div>
              )}

              <div className="space-y-2 pt-2">
                <button
                  onClick={submitDelete}
                  disabled={submitting}
                  className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-bold shadow-md transition-all disabled:opacity-50"
                >
                  {submitting ? 'Dissolving...' : 'Confirm Dissolution'}
                </button>
                <button
                  onClick={back}
                  className="w-full py-2.5 rounded-xl bg-stone-100 dark:bg-[#161a24] text-stone-700 dark:text-stone-300 font-mono text-xs font-medium hover:bg-stone-200 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="overflow-hidden">
      <AnimatePresence mode="wait" custom={dir}>
        <motion.div
          key={view}
          custom={dir}
          variants={slide}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ type: 'spring', stiffness: 360, damping: 36 }}
        >
          {renderView()}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
