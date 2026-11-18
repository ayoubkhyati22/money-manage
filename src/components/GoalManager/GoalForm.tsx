import { Goal } from '../../lib/supabase'
import { categories } from '../../types/goal'
import { Target, X, Calendar, DollarSign, Tag, FileText } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface GoalFormProps {
  formData: {
    name: string
    category: string
    target_amount: string
    target_date: string
    notes: string
  }
  editingGoal: Goal | null
  loading: boolean
  onSubmit: (e: React.FormEvent) => void
  onChange: (data: {
    name: string
    category: string
    target_amount: string
    target_date: string
    notes: string
  }) => void
  onCancel: () => void
}

const PRESET_AMOUNTS = ['10000', '25000', '50000', '100000', '250000']

export function GoalForm({
  formData,
  editingGoal,
  loading,
  onSubmit,
  onChange,
  onCancel,
}: GoalFormProps) {
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-xl bg-white dark:bg-[#121520] border border-stone-200/90 dark:border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden my-8"
        >
          {/* Executive Header */}
          <div className="flex items-center justify-between p-5 sm:p-6 border-b border-stone-100 dark:border-white/[0.06] bg-stone-50/50 dark:bg-[#12141c]/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-stone-900 dark:bg-[#161a24] border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-mono tracking-widest uppercase text-amber-600 dark:text-amber-400 font-semibold">
                  Capital Planning // Objective
                </p>
                <h3 className="text-lg font-display font-bold text-stone-900 dark:text-white leading-tight">
                  {editingGoal ? 'Update Milestone Objective' : 'Establish New Capital Goal'}
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
            {/* Goal Name */}
            <div>
              <label className="block text-xs font-mono font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-1.5">
                Milestone Name *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => onChange({ ...formData, name: e.target.value })}
                  placeholder="e.g. Real Estate Acquisition, Emergency Vault, Venture Seed"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-[#14161f] border border-stone-200 dark:border-white/[0.08] text-sm text-stone-900 dark:text-white placeholder:text-stone-400 focus:outline-none focus:border-amber-500/60 font-medium transition-all"
                />
              </div>
            </div>

            {/* Category & Target Date (2 columns) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Tag className="w-3 h-3 text-stone-400" />
                  <span>Category</span>
                </label>
                <select
                  value={formData.category}
                  onChange={e => onChange({ ...formData, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-[#14161f] border border-stone-200 dark:border-white/[0.08] text-sm text-stone-900 dark:text-white focus:outline-none focus:border-amber-500/60 font-mono transition-all"
                >
                  <option value="">Select allocation category...</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-stone-400" />
                  <span>Target Horizon</span>
                </label>
                <input
                  type="date"
                  value={formData.target_date}
                  onChange={e => onChange({ ...formData, target_date: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-[#14161f] border border-stone-200 dark:border-white/[0.08] text-sm text-stone-900 dark:text-white focus:outline-none focus:border-amber-500/60 font-mono transition-all"
                />
              </div>
            </div>

            {/* Target Amount */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-mono font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider flex items-center gap-1">
                  <DollarSign className="w-3 h-3 text-stone-400" />
                  <span>Target Amount (MAD)</span>
                </label>
                <span className="text-[10px] font-mono text-stone-400">Moroccan Dirham</span>
              </div>

              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.target_amount}
                  onChange={e => onChange({ ...formData, target_amount: e.target.value })}
                  placeholder="0.00"
                  className="w-full pl-3.5 pr-14 py-2.5 rounded-xl bg-stone-50 dark:bg-[#14161f] border border-stone-200 dark:border-white/[0.08] text-sm font-mono text-stone-900 dark:text-white placeholder:text-stone-400 focus:outline-none focus:border-amber-500/60 tabular-num transition-all"
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
                    onClick={() => onChange({ ...formData, target_amount: preset })}
                    className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-stone-100 dark:bg-[#181b24] hover:bg-amber-500/10 text-stone-600 dark:text-stone-300 hover:text-amber-500 border border-stone-200/60 dark:border-white/[0.06] transition-colors"
                  >
                    +{Number(preset).toLocaleString('en-US')}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-mono font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <FileText className="w-3 h-3 text-stone-400" />
                <span>Strategy & Notes (Optional)</span>
              </label>
              <textarea
                value={formData.notes}
                onChange={e => onChange({ ...formData, notes: e.target.value })}
                rows={2}
                placeholder="Strategic context, bank allocation preference, or horizon notes..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-[#14161f] border border-stone-200 dark:border-white/[0.08] text-xs text-stone-900 dark:text-white placeholder:text-stone-400 focus:outline-none focus:border-amber-500/60 transition-all resize-none"
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
                disabled={loading}
                className="px-6 py-2.5 rounded-xl text-xs font-mono font-semibold bg-stone-900 dark:bg-white text-white dark:text-stone-950 hover:opacity-90 transition-all disabled:opacity-50 shadow-md flex items-center gap-2"
              >
                {loading && <div className="w-3 h-3 rounded-full border-2 border-current border-t-transparent animate-spin" />}
                <span>{editingGoal ? 'Commit Changes' : 'Record Objective'}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
