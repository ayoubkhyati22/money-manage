import { useState, useEffect } from 'react'
import { Bank, Goal, supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { useSweetAlert } from '../hooks/useSweetAlert'
import {
  ArrowDownCircle, Building2, Target, ChevronRight,
  AlertCircle, CheckCircle2, X, Check,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

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

const labelCls = 'text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2 block'
const PCT_BTNS = [25, 50, 75, 100]

export function TransactionManager({
  banks, goals, onBanksUpdate, onGoalsUpdate, onTransactionAdded,
}: TransactionManagerProps) {
  const { user } = useAuth()
  const { showError, showConfirm, showSuccess } = useSweetAlert()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({ bank_id: '', objective_id: '', amount: '', description: '' })
  const [availableAllocations, setAvailableAllocations] = useState<ObjectiveAllocation[]>([])
  const [step, setStep] = useState<'bank' | 'goal' | 'amount'>('bank')
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024)

  useEffect(() => {
    const h = () => setIsDesktop(window.innerWidth >= 1024)
    window.addEventListener('resize', h)
    return () => window.removeEventListener('resize', h)
  }, [])

  const selectedBank = banks.find(b => b.id === formData.bank_id)
  const selectedAllocation = availableAllocations.find(a => a.objective_id === formData.objective_id)
  const maxAmount = Math.min(Number(selectedBank?.balance ?? 0), selectedAllocation?.allocated_amount ?? 0)
  const parsedAmount = parseFloat(formData.amount) || 0
  const amountValid = parsedAmount > 0 && parsedAmount <= maxAmount
  const canSubmit = formData.bank_id && formData.objective_id && formData.amount && formData.description && amountValid && !loading

  useEffect(() => {
    if (formData.bank_id && goals.length > 0) loadAllocationsForBank(formData.bank_id)
  }, [formData.bank_id, goals])

  const loadAllocationsForBank = async (bankId: string) => {
    try {
      const { data, error } = await supabase
        .from('allocations')
        .select('goal_id, amount, goals:goal_id(name)')
        .eq('bank_id', bankId)
        .gt('amount', 0)
      if (error) throw error
      setAvailableAllocations(
        data?.map(a => ({
          objective_id: a.goal_id,
          objective_name: (a.goals as any)?.name || 'Unknown',
          allocated_amount: Number(a.amount),
        })) || [],
      )
    } catch { setAvailableAllocations([]) }
  }

  const selectBank = (id: string) => {
    setFormData({ bank_id: id, objective_id: '', amount: '', description: '' })
    setAvailableAllocations([])
    if (!isDesktop) setStep('goal')
  }

  const selectGoal = (id: string) => {
    setFormData(f => ({ ...f, objective_id: id, amount: '' }))
    if (!isDesktop) setStep('amount')
  }

  const setPct = (pct: number) => {
    const val = (maxAmount * pct) / 100
    setFormData(f => ({ ...f, amount: val > 0 ? val.toFixed(2) : '' }))
  }

  const reset = () => {
    setFormData({ bank_id: '', objective_id: '', amount: '', description: '' })
    setAvailableAllocations([])
    setStep('bank')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit || !selectedBank || !selectedAllocation) return
    const result = await showConfirm(
      'Confirm Withdrawal',
      `Withdraw ${parsedAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} MAD from ${selectedBank.name} — ${selectedAllocation.objective_name}?`,
    )
    if (!result.isConfirmed) return
    setLoading(true)
    try {
      const { error: txErr } = await supabase.from('objectives_transactions').insert([{
        objective_id: formData.objective_id, bank_id: formData.bank_id,
        amount: -parsedAmount, description: formData.description,
      }])
      if (txErr) throw txErr
      await supabase.from('banks').update({ balance: Number(selectedBank.balance) - parsedAmount }).eq('id', formData.bank_id)
      await supabase.from('allocations')
        .update({ amount: selectedAllocation.allocated_amount - parsedAmount })
        .eq('goal_id', formData.objective_id).eq('bank_id', formData.bank_id)
      await showSuccess('Withdrawal Successful', `${parsedAmount.toFixed(2)} MAD withdrawn from ${selectedBank.name}`)
      reset()
      onTransactionAdded()
    } catch (err: any) {
      await showError('Transaction Failed', err.message)
    } finally {
      setLoading(false)
    }
  }

  if (banks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
          <Building2 className="w-8 h-8 text-slate-400" />
        </div>
        <p className="font-semibold text-slate-700 dark:text-slate-200">No Banks Available</p>
        <p className="text-sm text-slate-400 max-w-xs">Add banks and create goals with allocations before withdrawing.</p>
      </div>
    )
  }

  // ── Shared sub-sections ─────────────────────────────────────────────────────

  const BankList = () => (
    <div className="space-y-2">
      {banks.map(bank => {
        const active = formData.bank_id === bank.id
        return (
          <div
            key={bank.id}
            onClick={() => selectBank(bank.id)}
            className={`flex items-center gap-3 p-3.5 rounded-2xl border-2 transition-all cursor-pointer group ${
              active
                ? 'border-red-400 dark:border-red-500 bg-red-50 dark:bg-red-900/15'
                : 'border-transparent bg-white dark:bg-slate-800/80 hover:border-slate-200 dark:hover:border-slate-600 shadow-sm'
            }`}
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center flex-shrink-0">
              {bank.logo
                ? <img src={bank.logo} alt={bank.name} className="w-5 h-5 object-contain" />
                : <Building2 className="w-4 h-4 text-white" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-800 dark:text-white truncate">{bank.name}</p>
              <p className="text-xs text-slate-400 mt-0.5">
                {Number(bank.balance).toLocaleString('en-US', { maximumFractionDigits: 0 })} MAD
              </p>
            </div>
            {active
              ? <Check className="w-4 h-4 text-red-500 flex-shrink-0" />
              : <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 flex-shrink-0" />
            }
          </div>
        )
      })}
    </div>
  )

  const GoalList = () => (
    <div className="space-y-2">
      {availableAllocations.length === 0 ? (
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
          <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-amber-700 dark:text-amber-300">No goals allocated to this bank.</p>
        </div>
      ) : (
        availableAllocations.map(a => {
          const active = formData.objective_id === a.objective_id
          return (
            <div
              key={a.objective_id}
              onClick={() => selectGoal(a.objective_id)}
              className={`flex items-center gap-3 p-3.5 rounded-2xl border-2 transition-all cursor-pointer group ${
                active
                  ? 'border-red-400 dark:border-red-500 bg-red-50 dark:bg-red-900/15'
                  : 'border-transparent bg-white dark:bg-slate-800/80 hover:border-slate-200 dark:hover:border-slate-600 shadow-sm'
              }`}
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center flex-shrink-0">
                <Target className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-800 dark:text-white truncate">{a.objective_name}</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {a.allocated_amount.toLocaleString('en-US', { maximumFractionDigits: 0 })} MAD
                </p>
              </div>
              {active
                ? <Check className="w-4 h-4 text-red-500 flex-shrink-0" />
                : <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 flex-shrink-0" />
              }
            </div>
          )
        })
      )}
    </div>
  )

  const AmountPanel = () => (
    <div className="space-y-4">
      {/* Amount input */}
      <div className="bg-white dark:bg-slate-800/80 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-700/60">
        <div className="flex items-center justify-between mb-4">
          <span className={labelCls + ' mb-0'}>Withdrawal Amount</span>
          <span className="text-[11px] text-slate-400">
            Max <span className="font-bold text-slate-600 dark:text-slate-300">
              {maxAmount.toLocaleString('en-US', { maximumFractionDigits: 0 })} MAD
            </span>
          </span>
        </div>
        <div className="relative flex items-center">
          <input
            type="number" step="0.01" min="0.01" max={maxAmount}
            value={formData.amount}
            onChange={e => setFormData(f => ({ ...f, amount: e.target.value }))}
            placeholder="0.00"
            className="w-full bg-transparent text-3xl font-bold text-slate-800 dark:text-white placeholder:text-slate-200 dark:placeholder:text-slate-700 focus:outline-none pr-16"
            style={{ fontVariantNumeric: 'tabular-nums' }}
          />
          <span className="absolute right-0 text-sm font-semibold text-slate-400">MAD</span>
        </div>
        <div className="h-px bg-slate-100 dark:bg-slate-700 my-4" />
        <div className="flex gap-2">
          {PCT_BTNS.map(pct => (
            <button key={pct} type="button" onClick={() => setPct(pct)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                pct === 100
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300'
              }`}>
              {pct === 100 ? 'Max' : `${pct}%`}
            </button>
          ))}
        </div>
        {formData.amount && !amountValid && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex items-center gap-2 mt-3 text-xs text-red-500">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            Amount exceeds available balance or allocation
          </motion.div>
        )}
      </div>

      {/* Description */}
      <div className="bg-white dark:bg-slate-800/80 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-700/60">
        <span className={labelCls}>Description</span>
        <input
          type="text" value={formData.description}
          onChange={e => setFormData(f => ({ ...f, description: e.target.value }))}
          placeholder="e.g. Grocery shopping, rent…"
          className="w-full bg-transparent text-sm text-slate-800 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:outline-none"
          required
        />
      </div>

      {/* Live preview */}
      <AnimatePresence>
        {formData.amount && selectedBank && selectedAllocation && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
            <div className="bg-slate-50 dark:bg-slate-800/60 px-4 py-2.5 border-b border-slate-200 dark:border-slate-700">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Order Preview</p>
            </div>
            <div className="bg-white dark:bg-slate-800/40 divide-y divide-slate-100 dark:divide-slate-700/50">
              {[
                { label: 'Source Bank', value: selectedBank.name },
                { label: 'Goal', value: selectedAllocation.objective_name },
                { label: 'Withdraw', value: `-${parsedAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} MAD`, valueClass: 'text-red-500 font-bold' },
                { label: 'Bank remaining', value: `${(Number(selectedBank.balance) - parsedAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })} MAD` },
                { label: 'Goal remaining', value: `${(selectedAllocation.allocated_amount - parsedAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })} MAD` },
              ].map(row => (
                <div key={row.label} className="flex items-center justify-between px-4 py-2.5">
                  <span className="text-xs text-slate-500 dark:text-slate-400">{row.label}</span>
                  <span className={`text-xs font-semibold text-slate-800 dark:text-white ${row.valueClass ?? ''}`}>{row.value}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submit */}
      <div className="flex gap-3">
        <button type="button" onClick={reset}
          className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-sm font-semibold transition-colors">
          <X className="w-4 h-4" /> Reset
        </button>
        <button type="submit" disabled={!canSubmit}
          className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-red-500 hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-bold transition-colors">
          {loading
            ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            : <ArrowDownCircle className="w-4 h-4" />}
          {loading ? 'Processing…' : 'Confirm Withdrawal'}
        </button>
      </div>
    </div>
  )

  // ── Hero (shared) ────────────────────────────────────────────────────────────

  const Hero = () => (
    <div className="relative overflow-hidden rounded-2xl px-5 py-5"
      style={{ background: 'linear-gradient(135deg,#b91c1c 0%,#7f1d1d 100%)' }}>
      <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/5 pointer-events-none" />
      <div className="absolute -bottom-10 -left-6 w-32 h-32 rounded-full bg-white/5 pointer-events-none" />
      <div className="relative z-10 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-red-300/70 mb-1">Finance</p>
          <p className="text-2xl font-bold text-white leading-tight">Withdraw</p>
          <p className="text-xs text-red-200/60 mt-0.5">Funds out of your goals</p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
          <ArrowDownCircle className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  )

  // ── DESKTOP layout ───────────────────────────────────────────────────────────

  if (isDesktop) {
    return (
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <Hero />
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6 items-start">
          {/* Left — bank + goal */}
          <div className="space-y-6">
            <div>
              <span className={labelCls}>1 · Select Bank</span>
              <BankList />
            </div>
            {formData.bank_id && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                <span className={labelCls}>2 · Select Goal</span>
                <GoalList />
              </motion.div>
            )}
          </div>

          {/* Right — amount + preview + submit */}
          <div>
            {formData.bank_id && formData.objective_id ? (
              <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}>
                <span className={labelCls}>3 · Amount & Confirm</span>
                <AmountPanel />
              </motion.div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-slate-400 gap-3">
                <ArrowDownCircle className="w-8 h-8 opacity-30" />
                <p className="text-sm font-medium">Select a bank and goal to continue</p>
              </div>
            )}
          </div>
        </form>
      </motion.div>
    )
  }

  // ── MOBILE layout — step wizard ──────────────────────────────────────────────

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 max-w-lg mx-auto">
      <Hero />

      {/* Step breadcrumb */}
      <div className="flex items-center gap-2 px-1">
        {(['bank', 'goal', 'amount'] as const).map((s, i) => {
          const labels = ['Bank', 'Goal', 'Amount']
          const done = (step === 'goal' && i === 0) || (step === 'amount' && i < 2)
          const active = step === s
          return (
            <div key={s} className="flex items-center gap-2">
              <div onClick={() => { if (done) { if (i === 0) reset(); else if (i === 1) setStep('goal') } }}
                className={`flex items-center gap-1.5 ${done ? 'cursor-pointer' : ''}`}>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors ${
                  done ? 'bg-emerald-500 text-white' : active ? 'bg-red-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'
                }`}>
                  {done ? <CheckCircle2 className="w-3.5 h-3.5" /> : i + 1}
                </div>
                <span className={`text-xs font-semibold transition-colors ${
                  active ? 'text-slate-800 dark:text-white' : done ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'
                }`}>{labels[i]}</span>
              </div>
              {i < 2 && <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" />}
            </div>
          )
        })}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <AnimatePresence mode="wait">
          {step === 'bank' && (
            <motion.div key="bank" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.18 }}>
              <span className={labelCls}>Select Source Bank</span>
              <BankList />
            </motion.div>
          )}
          {step === 'goal' && (
            <motion.div key="goal" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.18 }}>
              <div className="flex items-center justify-between mb-1">
                <span className={labelCls + ' mb-0'}>Select Goal</span>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800">
                  <Building2 className="w-3 h-3 text-slate-400" />
                  <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">{selectedBank?.name}</span>
                </div>
              </div>
              <GoalList />
            </motion.div>
          )}
          {step === 'amount' && (
            <motion.div key="amount" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.18 }} className="space-y-4">
              <div className="flex gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800">
                  <Building2 className="w-3 h-3 text-slate-400" />
                  <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">{selectedBank?.name}</span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800">
                  <Target className="w-3 h-3 text-slate-400" />
                  <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">{selectedAllocation?.objective_name}</span>
                </div>
              </div>
              <AmountPanel />
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </motion.div>
  )
}
