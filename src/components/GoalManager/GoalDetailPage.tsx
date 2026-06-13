import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft, Plus, Eye, EyeOff, Edit2, Trash2, Calendar, Sparkles,
  Building2, Check, AlertTriangle, ArrowUpCircle, ArrowDownCircle, History,
} from 'lucide-react'
import { Goal, Bank } from '../../lib/supabase'
import { format, differenceInDays } from 'date-fns'
import type { Allocation, GoalTransaction } from '../../types/goal'
import { categories } from '../../types/goal'
import { goalService } from '../../services/goalService'
import toast from 'react-hot-toast'

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
    name: string; category: string | null
    target_amount: number | null; target_date: string | null; notes: string
  }) => Promise<void>
  onConfirmDelete: () => Promise<void>
  onDeleteAllocation: (allocation: Allocation) => Promise<void>
}

// ── Config ────────────────────────────────────────────────────────────────────

const catConfig: Record<string, { gradient: string; ring: string; glow: string }> = {
  Personal:   { gradient: 'linear-gradient(135deg,#6d28d9 0%,#4f46e5 100%)', ring: '#c4b5fd', glow: 'rgba(109,40,217,.2)' },
  Family:     { gradient: 'linear-gradient(135deg,#be185d 0%,#9d174d 100%)', ring: '#f9a8d4', glow: 'rgba(190,24,93,.2)' },
  Investment: { gradient: 'linear-gradient(135deg,#b45309 0%,#78350f 100%)', ring: '#fcd34d', glow: 'rgba(180,83,9,.2)' },
  Emergency:  { gradient: 'linear-gradient(135deg,#b91c1c 0%,#7f1d1d 100%)', ring: '#fca5a5', glow: 'rgba(185,28,28,.2)' },
  Travel:     { gradient: 'linear-gradient(135deg,#0369a1 0%,#075985 100%)', ring: '#7dd3fc', glow: 'rgba(3,105,161,.2)' },
  Education:  { gradient: 'linear-gradient(135deg,#3730a3 0%,#1e1b4b 100%)', ring: '#a5b4fc', glow: 'rgba(55,48,163,.2)' },
  Health:     { gradient: 'linear-gradient(135deg,#047857 0%,#064e3b 100%)', ring: '#6ee7b7', glow: 'rgba(4,120,87,.2)' },
  Other:      { gradient: 'linear-gradient(135deg,#334155 0%,#0f172a 100%)', ring: '#cbd5e1', glow: 'rgba(51,65,85,.2)' },
}
const defaultCat = { gradient: 'linear-gradient(135deg,#4f46e5 0%,#1e1b4b 100%)', ring: '#a5b4fc', glow: 'rgba(79,70,229,.2)' }
const completedCat = { gradient: 'linear-gradient(135deg,#047857 0%,#0891b2 100%)', ring: '#6ee7b7', glow: 'rgba(4,120,87,.25)' }

const R = 48
const CIRC = 2 * Math.PI * R

const inputCls =
  'w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors placeholder:text-slate-300 dark:placeholder:text-slate-600'
const labelCls = 'block text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-2'

// Sub-view slide variants
const slide = {
  enter: (d: number) => ({ x: d > 0 ? 48 : -48, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit:  (d: number) => ({ x: d > 0 ? -48 : 48, opacity: 0 }),
}

// ── Component ─────────────────────────────────────────────────────────────────

export function GoalDetailPage({
  goal, currentAmount, showAmounts, allocations, loadingAllocations,
  banks, submitting, onBack, onAddMoney, onSaveEdit, onConfirmDelete, onDeleteAllocation,
}: GoalDetailPageProps) {
  const [view, setView] = useState<View>('detail')
  const [dir,  setDir]  = useState(1)

  // Form states
  const [addForm,  setAddForm]  = useState({ bank_id: '', amount: '', description: '' })
  const [editForm, setEditForm] = useState({ name: '', category: '', target_amount: '', target_date: '', notes: '' })
  const [confirmDeleteAlloc, setConfirmDeleteAlloc] = useState<string | null>(null)
  const [localShow, setLocalShow] = useState(showAmounts)
  const [transactions, setTransactions] = useState<GoalTransaction[]>([])
  const [loadingTransactions, setLoadingTransactions] = useState(false)

  // Reset to detail when goal changes
  useEffect(() => { setView('detail'); setDir(1) }, [goal.id])

  // Load transactions when navigating to that view
  useEffect(() => {
    if (view !== 'transactions') return
    setLoadingTransactions(true)
    goalService.loadGoalTransactions(goal.id)
      .then(setTransactions)
      .catch(err => toast.error(err.message))
      .finally(() => setLoadingTransactions(false))
  }, [view, goal.id])

  // Pre-fill edit form
  useEffect(() => {
    if (view !== 'edit') return
    setEditForm({
      name:          goal.name,
      category:      goal.category || '',
      target_amount: goal.target_amount ? String(goal.target_amount) : '',
      target_date:   goal.target_date ? format(new Date(goal.target_date), 'yyyy-MM-dd') : '',
      notes:         goal.notes || '',
    })
  }, [view, goal])

  const goTo = (v: View) => { setDir(v === 'detail' ? -1 : 1); setView(v) }
  const back  = () => goTo('detail')

  // ── Computed ──────────────────────────────────────────────────────────────

  const progress    = goal.target_amount ? Math.min((currentAmount / goal.target_amount) * 100, 100) : 0
  const isCompleted = progress >= 100
  const cfg         = isCompleted ? completedCat : (goal.category ? (catConfig[goal.category] ?? defaultCat) : defaultCat)
  const dashOffset  = CIRC * (1 - progress / 100)
  const daysLeft    = goal.target_date ? differenceInDays(new Date(goal.target_date), new Date()) : null

  // ── Handlers ──────────────────────────────────────────────────────────────

  const submitAddMoney = async (e: React.FormEvent) => {
    e.preventDefault()
    const amount = parseFloat(addForm.amount)
    if (!addForm.bank_id || isNaN(amount) || amount <= 0) { toast.error('Select a bank and enter a valid amount'); return }
    try {
      await onAddMoney(addForm.bank_id, amount, addForm.description)
      toast.success(`${amount.toFixed(2)} MAD added!`)
      setAddForm({ bank_id: '', amount: '', description: '' })
      back()
    } catch (err: any) { toast.error(err.message) }
  }

  const submitEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editForm.name.trim()) return
    try {
      await onSaveEdit({
        name:          editForm.name.trim(),
        category:      editForm.category || null,
        target_amount: editForm.target_amount ? parseFloat(editForm.target_amount) : null,
        target_date:   editForm.target_date || null,
        notes:         editForm.notes,
      })
      toast.success('Goal updated!')
      back()
    } catch (err: any) { toast.error(err.message) }
  }

  const submitDelete = async () => {
    try { await onConfirmDelete() } catch (err: any) { toast.error(err.message) }
  }

  const deleteAlloc = async (a: Allocation) => {
    try {
      await onDeleteAllocation(a)
      toast.success('Allocation removed!')
      setConfirmDeleteAlloc(null)
    } catch (err: any) { toast.error(err.message) }
  }

  // ── Shared sub-view header ────────────────────────────────────────────────

  const SubHeader = ({ title, subtitle }: { title: string; subtitle?: string }) => (
    <div className="flex items-center gap-3 px-1 mb-6">
      <div
        onClick={back}
        className="flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer flex-shrink-0"
        style={{ width: 38, height: 38, minWidth: 38, minHeight: 38 }}
      >
        <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
      </div>
      <div className="min-w-0">
        <p className="text-base font-bold text-slate-800 dark:text-white leading-tight">{title}</p>
        {subtitle && <p className="text-xs text-slate-400 truncate mt-0.5">{subtitle}</p>}
      </div>
    </div>
  )

  // ── Views ─────────────────────────────────────────────────────────────────

  const renderView = () => {
    switch (view) {

      // ── DETAIL ────────────────────────────────────────────────────────────
      case 'detail': return (
        <div className="space-y-4">

          {/* ← Back row */}
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <div
                onClick={onBack}
                className="flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer flex-shrink-0"
                style={{ width: 38, height: 38, minWidth: 38, minHeight: 38 }}
              >
                <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
              </div>
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Goals</span>
            </div>
            <div
              onClick={() => setLocalShow(v => !v)}
              className="flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer flex-shrink-0"
              style={{ width: 38, height: 38, minWidth: 38, minHeight: 38 }}
            >
              {localShow
                ? <Eye className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                : <EyeOff className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              }
            </div>
          </div>

          {/* Gradient hero */}
          <div
            className="relative overflow-hidden rounded-2xl"
            style={{ background: cfg.gradient, boxShadow: `0 8px 32px ${cfg.glow}` }}
          >
            <div className="absolute -top-12 -right-12 w-56 h-56 rounded-full bg-white/5 pointer-events-none" />
            <div className="absolute bottom-0 -left-10 w-40 h-40 rounded-full bg-white/5 translate-y-1/2 pointer-events-none" />

            <div className="relative z-10 p-6 pb-7">
              {/* Badges row */}
              <div className="flex items-center gap-2 mb-5 flex-wrap">
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/60 bg-white/15 px-2.5 py-1 rounded-full backdrop-blur-sm">
                  {goal.category || 'General'}
                </span>
                {isCompleted && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-amber-300 bg-amber-400/20 px-2.5 py-1 rounded-full">
                    <Sparkles className="w-2.5 h-2.5" /> Completed
                  </span>
                )}
              </div>

              {/* Name + big ring */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-2xl font-bold text-white leading-tight mb-2">{goal.name}</p>
                  {goal.target_date && (
                    <div className="flex items-center gap-1.5 text-white/55 text-xs flex-wrap">
                      <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{format(new Date(goal.target_date), 'MMM dd, yyyy')}</span>
                      {daysLeft !== null && (
                        <span className={`font-semibold ${daysLeft < 0 ? 'text-red-300' : daysLeft < 30 ? 'text-amber-300' : 'text-white/60'}`}>
                          • {daysLeft < 0 ? `${Math.abs(daysLeft)}d overdue` : `${daysLeft}d left`}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Large progress ring */}
                <div className="relative flex-shrink-0" style={{ width: 108, height: 108 }}>
                  <svg width="108" height="108" viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)' }}>
                    <circle cx="60" cy="60" r={R} fill="none" stroke="rgba(255,255,255,.15)" strokeWidth="10" />
                    <motion.circle
                      cx="60" cy="60" r={R}
                      fill="none" stroke={cfg.ring} strokeWidth="10" strokeLinecap="round"
                      strokeDasharray={CIRC}
                      initial={{ strokeDashoffset: CIRC }}
                      animate={{ strokeDashoffset: dashOffset }}
                      transition={{ duration: 1.4, ease: 'easeOut', delay: 0.1 }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-white leading-none">{progress.toFixed(0)}%</span>
                    <span className="text-[10px] text-white/50 mt-0.5 font-medium">done</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Amounts card */}
          <div className="grid grid-cols-2 gap-3">
            <div className="glass-card p-4">
              <p className={labelCls}>Saved</p>
              {localShow ? (
                <>
                  <p className="text-xl font-bold text-slate-800 dark:text-white leading-none">
                    {currentAmount.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">MAD</p>
                </>
              ) : (
                <div className="flex gap-1.5 items-center h-8">
                  {[...Array(4)].map((_, i) => <span key={i} className="w-2.5 h-2.5 bg-slate-200 dark:bg-slate-600 rounded-full" />)}
                </div>
              )}
            </div>
            <div className="glass-card p-4">
              <p className={labelCls}>{goal.target_amount ? 'Target' : 'Status'}</p>
              {goal.target_amount ? (
                localShow ? (
                  <>
                    <p className="text-xl font-bold text-slate-800 dark:text-white leading-none">
                      {Number(goal.target_amount).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">MAD</p>
                  </>
                ) : (
                  <div className="flex gap-1.5 items-center h-8">
                    {[...Array(4)].map((_, i) => <span key={i} className="w-2.5 h-2.5 bg-slate-200 dark:bg-slate-600 rounded-full" />)}
                  </div>
                )
              ) : <p className="text-sm font-medium text-slate-400 mt-2">Open-ended</p>}
            </div>
          </div>

          {/* Notes */}
          {goal.notes && (
            <div className="glass-card p-4">
              <p className={labelCls}>Notes</p>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{goal.notes}</p>
            </div>
          )}

          {/* Actions — icons only */}
          <div className="glass-card p-4">
            <p className={labelCls}>Actions</p>
            <div className="flex gap-3">
              {[
                { icon: Plus,   onClick: () => goTo('add-money'),
                  bg: 'bg-primary-500 hover:bg-primary-600', iconCls: 'text-white' },
                { icon: History, onClick: () => goTo('transactions'),
                  bg: 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700', iconCls: 'text-slate-600 dark:text-slate-300' },
                { icon: Edit2,  onClick: () => goTo('edit'),
                  bg: 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700', iconCls: 'text-slate-600 dark:text-slate-300' },
                { icon: Trash2, onClick: () => goTo('confirm-delete'),
                  bg: 'bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40', iconCls: 'text-red-500' },
              ].map(({ icon: Icon, onClick, bg, iconCls }, idx) => (
                <div
                  key={idx}
                  onClick={onClick}
                  className={`flex-1 flex items-center justify-center rounded-2xl transition-colors cursor-pointer ${bg}`}
                  style={{ height: 52 }}
                >
                  <Icon className={`w-5 h-5 ${iconCls}`} />
                </div>
              ))}
            </div>
          </div>

          {/* Allocations preview */}
          <div className="glass-card p-4 mb-6">
            <div className="flex items-center justify-between mb-3">
              <p className={labelCls + ' mb-0'}>Bank Allocations</p>
              {allocations.length > 0 && (
                <div onClick={() => goTo('allocations')}
                  className="text-[11px] text-primary-500 hover:text-primary-600 cursor-pointer font-semibold flex items-center gap-0.5">
                  Manage →
                </div>
              )}
            </div>
            {loadingAllocations ? (
              <div className="space-y-2">
                {[1, 2].map(i => <div key={i} className="h-14 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />)}
              </div>
            ) : allocations.length === 0 ? (
              <div className="flex flex-col items-center py-6 gap-2">
                <Building2 className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                <p className="text-xs text-slate-400">No allocations yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {allocations.map((a, i) => (
                  <motion.div key={a.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                    <div className="rounded-xl bg-white dark:bg-slate-700 shadow-sm flex items-center justify-center flex-shrink-0"
                      style={{ width: 36, height: 36, minWidth: 36, minHeight: 36 }}>
                      <Building2 className="w-4 h-4 text-slate-400" />
                    </div>
                    <p className="flex-1 min-w-0 text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{a.bank_name}</p>
                    {localShow ? (
                      <div className="text-right">
                        <p className="text-sm font-bold text-slate-800 dark:text-white">
                          {Number(a.amount).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                        </p>
                        <p className="text-[10px] text-slate-400">MAD</p>
                      </div>
                    ) : (
                      <div className="flex gap-1">
                        {[...Array(3)].map((_, j) => <span key={j} className="w-1.5 h-1.5 bg-slate-300 dark:bg-slate-600 rounded-full" />)}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      )

      // ── ADD MONEY ─────────────────────────────────────────────────────────
      case 'add-money': return (
        <div>
          <SubHeader title="Add Money" subtitle={goal.name} />
          <form onSubmit={submitAddMoney} className="space-y-5">
            <div>
              <p className={labelCls}>Select Bank</p>
              {banks.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-6">No banks added yet</p>
              ) : (
                <div className="space-y-2">
                  {banks.map(bank => (
                    <div key={bank.id}
                      onClick={() => setAddForm(f => ({ ...f, bank_id: bank.id }))}
                      className={`flex items-center gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                        addForm.bank_id === bank.id
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-transparent bg-slate-50 dark:bg-slate-800 hover:border-slate-200 dark:hover:border-slate-600'
                      }`}>
                      <div className="rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center flex-shrink-0"
                        style={{ width: 40, height: 40, minWidth: 40, minHeight: 40 }}>
                        {bank.logo ? <img src={bank.logo} alt={bank.name} className="w-5 h-5 object-contain" />
                          : <Building2 className="w-4 h-4 text-white" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">{bank.name}</p>
                        {localShow
                          ? <p className="text-xs text-slate-400">{Number(bank.balance).toLocaleString('en-US', { maximumFractionDigits: 0 })} MAD</p>
                          : <div className="flex gap-1 mt-0.5">{[...Array(3)].map((_, i) => <span key={i} className="w-1 h-1 bg-slate-300 dark:bg-slate-600 rounded-full" />)}</div>
                        }
                      </div>
                      <div className={`rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                        addForm.bank_id === bank.id ? 'bg-primary-500' : 'border-2 border-slate-200 dark:border-slate-600'
                      }`} style={{ width: 22, height: 22, minWidth: 22, minHeight: 22 }}>
                        {addForm.bank_id === bank.id && <Check className="w-3 h-3 text-white" />}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <p className={labelCls}>Amount</p>
              <div className="relative">
                <input type="number" min="0.01" step="0.01" value={addForm.amount}
                  onChange={e => setAddForm(f => ({ ...f, amount: e.target.value }))}
                  placeholder="0.00" className={inputCls + ' pr-16'} />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-medium pointer-events-none">MAD</span>
              </div>
            </div>

            <div>
              <p className={labelCls}>Note <span className="normal-case font-normal text-slate-300">(optional)</span></p>
              <input type="text" value={addForm.description}
                onChange={e => setAddForm(f => ({ ...f, description: e.target.value }))}
                placeholder="e.g. Monthly savings" className={inputCls} />
            </div>

            <button type="submit"
              disabled={!addForm.bank_id || !addForm.amount || submitting}
              className="w-full py-4 rounded-2xl bg-primary-500 hover:bg-primary-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm transition-colors">
              {submitting ? 'Adding…' : 'Add Money'}
            </button>
          </form>
        </div>
      )

      // ── EDIT GOAL ─────────────────────────────────────────────────────────
      case 'edit': return (
        <div>
          <SubHeader title="Edit Goal" subtitle={goal.name} />
          <form onSubmit={submitEdit} className="space-y-5">
            <div>
              <p className={labelCls}>Goal Name</p>
              <input type="text" required value={editForm.name}
                onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Emergency Fund" className={inputCls} />
            </div>

            <div>
              <p className={labelCls}>Category</p>
              <div className="flex flex-wrap gap-2">
                {['', ...categories].map(cat => (
                  <div key={cat || 'none'}
                    onClick={() => setEditForm(f => ({ ...f, category: cat }))}
                    className={`px-3.5 rounded-full text-xs font-semibold cursor-pointer transition-all ${
                      editForm.category === cat
                        ? 'bg-primary-500 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`} style={{ height: 30, display: 'flex', alignItems: 'center' }}>
                    {cat || 'None'}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className={labelCls}>Target Amount <span className="normal-case font-normal text-slate-300">(optional)</span></p>
              <div className="relative">
                <input type="number" min="0" step="0.01" value={editForm.target_amount}
                  onChange={e => setEditForm(f => ({ ...f, target_amount: e.target.value }))}
                  placeholder="0.00" className={inputCls + ' pr-16'} />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-medium pointer-events-none">MAD</span>
              </div>
            </div>

            <div>
              <p className={labelCls}>Target Date <span className="normal-case font-normal text-slate-300">(optional)</span></p>
              <input type="date" value={editForm.target_date}
                onChange={e => setEditForm(f => ({ ...f, target_date: e.target.value }))}
                className={inputCls} />
            </div>

            <div>
              <p className={labelCls}>Notes <span className="normal-case font-normal text-slate-300">(optional)</span></p>
              <textarea rows={3} value={editForm.notes}
                onChange={e => setEditForm(f => ({ ...f, notes: e.target.value }))}
                placeholder="Any notes about this goal…" className={inputCls + ' resize-none'} />
            </div>

            <button type="submit" disabled={!editForm.name.trim() || submitting}
              className="w-full py-4 rounded-2xl bg-primary-500 hover:bg-primary-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm transition-colors">
              {submitting ? 'Saving…' : 'Save Changes'}
            </button>
          </form>
        </div>
      )

      // ── ALLOCATIONS ───────────────────────────────────────────────────────
      case 'allocations': return (
        <div>
          <SubHeader title="Bank Allocations"
            subtitle={`${allocations.length} bank${allocations.length !== 1 ? 's' : ''} · ${goal.name}`} />
          {loadingAllocations ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <div key={i} className="h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />)}
            </div>
          ) : allocations.length === 0 ? (
            <div className="flex flex-col items-center py-16 gap-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <Building2 className="w-8 h-8 text-slate-400" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">No allocations yet</p>
                <p className="text-xs text-slate-400 mt-1">Add money to see bank allocations here</p>
              </div>
              <div onClick={() => goTo('add-money')}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-primary-500 hover:bg-primary-600 text-white text-sm font-bold cursor-pointer transition-colors">
                <Plus className="w-4 h-4" /> Add Money
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {allocations.map((a, i) => (
                <motion.div key={a.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  {confirmDeleteAlloc === a.id ? (
                    <div className="p-4 rounded-2xl border-2 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 space-y-3">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                        <p className="text-sm font-semibold text-red-700 dark:text-red-300">Remove this allocation?</p>
                      </div>
                      {localShow && (
                        <p className="text-xs text-red-500 dark:text-red-400">
                          {Number(a.amount).toLocaleString('en-US', { maximumFractionDigits: 0 })} MAD will be returned to {a.bank_name}
                        </p>
                      )}
                      <div className="flex gap-2">
                        <div onClick={() => setConfirmDeleteAlloc(null)}
                          className="flex-1 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-600 dark:text-slate-300 text-center cursor-pointer hover:bg-slate-50 transition-colors">
                          Cancel
                        </div>
                        <div onClick={() => deleteAlloc(a)}
                          className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-sm font-bold text-white text-center cursor-pointer transition-colors">
                          {submitting ? 'Removing…' : 'Remove'}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800">
                      <div className="rounded-xl bg-white dark:bg-slate-700 shadow-sm flex items-center justify-center flex-shrink-0"
                        style={{ width: 42, height: 42, minWidth: 42, minHeight: 42 }}>
                        <Building2 className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">{a.bank_name}</p>
                        {localShow
                          ? <p className="text-xs text-slate-400 mt-0.5">{Number(a.amount).toLocaleString('en-US', { maximumFractionDigits: 0 })} MAD</p>
                          : <div className="flex gap-1 mt-1">{[...Array(3)].map((_, j) => <span key={j} className="w-1 h-1 bg-slate-300 dark:bg-slate-600 rounded-full" />)}</div>
                        }
                      </div>
                      <div onClick={() => setConfirmDeleteAlloc(a.id)}
                        className="flex items-center justify-center rounded-xl bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors cursor-pointer"
                        style={{ width: 38, height: 38, minWidth: 38, minHeight: 38 }}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}

              <div onClick={() => goTo('add-money')}
                className="flex items-center justify-center gap-2 p-4 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-slate-400 hover:border-primary-400 hover:text-primary-500 transition-colors cursor-pointer mt-2">
                <Plus className="w-4 h-4" />
                <span className="text-sm font-semibold">Add more money</span>
              </div>
            </div>
          )}
        </div>
      )

      // ── TRANSACTIONS ─────────────────────────────────────────────────────
      case 'transactions': return (
        <div>
          <SubHeader
            title="Transactions"
            subtitle={`${goal.name}`}
          />
          {loadingTransactions ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
              ))}
            </div>
          ) : transactions.length === 0 ? (
            <div className="flex flex-col items-center py-16 gap-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <History className="w-8 h-8 text-slate-400" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">No transactions yet</p>
                <p className="text-xs text-slate-400 mt-1">Add money to see your history here</p>
              </div>
              <div
                onClick={() => goTo('add-money')}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-primary-500 hover:bg-primary-600 text-white text-sm font-bold cursor-pointer transition-colors"
              >
                <Plus className="w-4 h-4" /> Add Money
              </div>
            </div>
          ) : (
            <div className="space-y-3 pb-6">
              {transactions.map((tx, i) => {
                const isPositive = tx.amount > 0
                return (
                  <motion.div
                    key={tx.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800"
                  >
                    <div
                      className={`flex items-center justify-center rounded-xl flex-shrink-0 ${
                        isPositive
                          ? 'bg-emerald-100 dark:bg-emerald-900/30'
                          : 'bg-red-100 dark:bg-red-900/30'
                      }`}
                      style={{ width: 42, height: 42, minWidth: 42, minHeight: 42 }}
                    >
                      {isPositive
                        ? <ArrowUpCircle className="w-5 h-5 text-emerald-500" />
                        : <ArrowDownCircle className="w-5 h-5 text-red-500" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">
                        {tx.description || tx.bank_name}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Building2 className="w-3 h-3 text-slate-400 flex-shrink-0" />
                        <p className="text-xs text-slate-400 truncate">{tx.bank_name}</p>
                        <span className="text-slate-300 dark:text-slate-600">·</span>
                        <p className="text-xs text-slate-400 flex-shrink-0">
                          {format(new Date(tx.created_at), 'MMM dd, yyyy')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      {localShow ? (
                        <>
                          <p className={`text-sm font-bold ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
                            {isPositive ? '+' : ''}{tx.amount.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                          </p>
                          <p className="text-[10px] text-slate-400">MAD</p>
                        </>
                      ) : (
                        <div className="flex gap-1">
                          {[...Array(3)].map((_, j) => (
                            <span key={j} className="w-1.5 h-1.5 bg-slate-300 dark:bg-slate-600 rounded-full" />
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      )

      // ── CONFIRM DELETE ────────────────────────────────────────────────────
      case 'confirm-delete': return (
        <div>
          <SubHeader title="Delete Goal" />
          <div className="flex flex-col items-center text-center py-8 gap-5">
            <div className="w-20 h-20 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <Trash2 className="w-10 h-10 text-red-500" />
            </div>
            <div className="space-y-2">
              <p className="text-xl font-bold text-slate-800 dark:text-white">Delete this goal?</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs">
                "{goal.name}" will be permanently removed.
              </p>
              {currentAmount > 0 && (
                <div className="mt-3 px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                  <div className="flex items-center gap-2 justify-center">
                    <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                    <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                      {localShow
                        ? `${currentAmount.toLocaleString('en-US', { maximumFractionDigits: 0 })} MAD will be returned to your banks`
                        : 'All saved money will be returned to your banks'
                      }
                    </p>
                  </div>
                </div>
              )}
            </div>
            <div className="w-full space-y-3 pt-2">
              <div onClick={submitDelete}
                className={`w-full py-4 rounded-2xl text-sm font-bold text-white text-center cursor-pointer transition-colors ${
                  submitting ? 'bg-red-400 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600'
                }`}>
                {submitting ? 'Deleting…' : 'Yes, Delete Goal'}
              </div>
              <div onClick={back}
                className="w-full py-4 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-sm font-bold text-slate-700 dark:text-slate-200 text-center cursor-pointer transition-colors">
                Cancel
              </div>
            </div>
          </div>
        </div>
      )
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

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
