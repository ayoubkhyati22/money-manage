import { Goal, Bank } from '../../lib/supabase'
import { Building2, X, ArrowUpCircle, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface AddMoneyFormProps {
  selectedObjective: Goal
  banks: Bank[]
  formData: {
    bank_id: string
    amount: string
    description: string
  }
  loading: boolean
  onSubmit: (e: React.FormEvent) => void
  onChange: (data: {
    bank_id: string
    amount: string
    description: string
  }) => void
  onCancel: () => void
}

const PRESET_AMOUNTS = ['500', '1000', '2500', '5000', '10000']

export function AddMoneyForm({
  selectedObjective,
  banks,
  formData,
  loading,
  onSubmit,
  onChange,
  onCancel,
}: AddMoneyFormProps) {
  const selectedBank = banks.find(b => b.id === formData.bank_id)
  const availableBalance = selectedBank ? Number(selectedBank.balance) : 0

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-lg bg-white dark:bg-[#121520] border border-stone-200/90 dark:border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden my-8"
        >
          {/* Executive Header */}
          <div className="flex items-center justify-between p-5 sm:p-6 border-b border-stone-100 dark:border-white/[0.06] bg-stone-50/50 dark:bg-[#12141c]/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-stone-900 dark:bg-[#161a24] border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <ArrowUpCircle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-mono tracking-widest uppercase text-emerald-600 dark:text-emerald-400 font-semibold">
                  Capital Allocation // Deposit
                </p>
                <h3 className="text-lg font-display font-bold text-stone-900 dark:text-white leading-tight">
                  Allocate to "{selectedObjective.name}"
                </h3>
              </div>
            </div>

            <button
              onClick={onCancel}
              className="p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-white/[0.05] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={onSubmit} className="p-5 sm:p-6 space-y-4">
            {/* Source Bank Selection */}
            <div>
              <label className="block text-xs font-mono font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Building2 className="w-3 h-3 text-stone-400" />
                <span>Source Bank Account *</span>
              </label>

              <select
                value={formData.bank_id}
                onChange={e => onChange({ ...formData, bank_id: e.target.value })}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-[#14161f] border border-stone-200 dark:border-white/[0.08] text-sm text-stone-900 dark:text-white focus:outline-none focus:border-emerald-500/60 font-mono transition-all"
              >
                <option value="">Choose depository bank...</option>
                {banks.map(bank => (
                  <option key={bank.id} value={bank.id}>
                    {bank.name} — {Number(bank.balance).toLocaleString('en-US', { minimumFractionDigits: 2 })} MAD
                  </option>
                ))}
              </select>

              {selectedBank && (
                <div className="mt-2 px-3 py-1.5 rounded-lg bg-stone-100 dark:bg-[#161922] border border-stone-200/60 dark:border-white/[0.06] flex items-center justify-between text-xs font-mono">
                  <span className="text-stone-500 dark:text-stone-400">Available Liquid Balance:</span>
                  <span className="font-bold text-stone-800 dark:text-white tabular-num">
                    {availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })} MAD
                  </span>
                </div>
              )}
            </div>

            {/* Deposit Amount */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-mono font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                  Allocation Amount (MAD) *
                </label>
                <span className="text-[10px] font-mono text-stone-400">Moroccan Dirham</span>
              </div>

              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={availableBalance > 0 ? availableBalance : undefined}
                  value={formData.amount}
                  onChange={e => onChange({ ...formData, amount: e.target.value })}
                  placeholder="0.00"
                  required
                  className="w-full pl-3.5 pr-14 py-2.5 rounded-xl bg-stone-50 dark:bg-[#14161f] border border-stone-200 dark:border-white/[0.08] text-sm font-mono text-stone-900 dark:text-white placeholder:text-stone-400 focus:outline-none focus:border-emerald-500/60 tabular-num transition-all"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-stone-400 font-semibold pointer-events-none">
                  MAD
                </span>
              </div>

              {/* Quick Presets */}
              <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                <span className="text-[10px] font-mono text-stone-400 mr-1">Presets:</span>
                {PRESET_AMOUNTS.map(preset => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => onChange({ ...formData, amount: preset })}
                    className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-stone-100 dark:bg-[#181b24] hover:bg-emerald-500/10 text-stone-600 dark:text-stone-300 hover:text-emerald-500 border border-stone-200/60 dark:border-white/[0.06] transition-colors"
                  >
                    +{Number(preset).toLocaleString('en-US')}
                  </button>
                ))}
                {availableBalance > 0 && (
                  <button
                    type="button"
                    onClick={() => onChange({ ...formData, amount: String(availableBalance) })}
                    className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors"
                  >
                    Max ({availableBalance.toFixed(0)})
                  </button>
                )}
              </div>
            </div>

            {/* Description / Memo */}
            <div>
              <label className="block text-xs font-mono font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-1.5">
                Transaction Memo (Optional)
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={e => onChange({ ...formData, description: e.target.value })}
                placeholder="e.g. Monthly salary savings, Bonus allocation"
                className="w-full px-3.5 py-2 rounded-xl bg-stone-50 dark:bg-[#14161f] border border-stone-200 dark:border-white/[0.08] text-xs text-stone-900 dark:text-white placeholder:text-stone-400 focus:outline-none focus:border-emerald-500/60 transition-all"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100 dark:border-white/[0.06]">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2.5 rounded-xl text-xs font-medium text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-white/[0.05] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !formData.bank_id || !formData.amount}
                className="px-6 py-2.5 rounded-xl text-xs font-mono font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-all disabled:opacity-50 shadow-md flex items-center gap-2"
              >
                {loading ? (
                  <div className="w-3 h-3 rounded-full border-2 border-white border-t-transparent animate-spin" />
                ) : (
                  <Check className="w-3.5 h-3.5" />
                )}
                <span>Confirm Allocation</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
