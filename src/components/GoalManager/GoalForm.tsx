import { Goal } from '../../lib/supabase'
import { categories } from '../../types/goal'
import { Target } from 'lucide-react'

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
  onChange: (data: any) => void
  onCancel: () => void
}

export function GoalForm({ formData, editingGoal, loading, onSubmit, onChange, onCancel }: GoalFormProps) {
  return (
    <div className="relative">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-100/50 via-teal-100/30 to-cyan-100/50 dark:from-emerald-950/30 dark:via-teal-950/20 dark:to-cyan-950/30 rounded-2xl blur-3xl -z-10"></div>
      
      <div className="bg-white/70 dark:bg-dark-800/70 backdrop-blur-2xl rounded-2xl shadow-xl border border-white/50 dark:border-dark-600/50 overflow-hidden">
        {/* Header with glass effect */}
        <div className="relative bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 dark:from-emerald-900/20 dark:via-teal-900/20 dark:to-cyan-900/20 backdrop-blur-xl p-5 sm:p-6 border-b border-white/30 dark:border-dark-600/30">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-emerald-500 blur-lg opacity-50 rounded-xl"></div>
              <div className="relative flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg">
                <Target className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 dark:from-emerald-400 dark:via-teal-400 dark:to-cyan-400 bg-clip-text text-transparent">
                {editingGoal ? 'Edit Objective' : 'Add New Objective'}
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                {editingGoal ? 'Update objective information' : 'Create a new financial goal'}
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          <form onSubmit={onSubmit} className="space-y-4 sm:space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Objective Name */}
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 dark:text-dark-200 mb-2">
                  Objective Name *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => onChange({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2.5 sm:py-3 text-sm border-2 border-white/50 dark:border-dark-600/50 rounded-xl focus:ring-2 focus:ring-emerald-500/50 dark:focus:ring-emerald-500/50 focus:border-emerald-500 dark:focus:border-emerald-500 bg-white/70 dark:bg-dark-700/70 backdrop-blur-sm text-gray-900 dark:text-dark-100 placeholder-gray-500 dark:placeholder-dark-400 transition-all duration-300 hover:bg-white/90 dark:hover:bg-dark-700/90"
                    placeholder="e.g., Car, Marriage, Bike"
                    required
                  />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-500/0 via-emerald-500/5 to-emerald-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
              </div>

              {/* Category */}
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 dark:text-dark-200 mb-2">
                  Category
                </label>
                <div className="relative">
                  <select
                    value={formData.category}
                    onChange={(e) => onChange({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2.5 sm:py-3 text-sm border-2 border-white/50 dark:border-dark-600/50 rounded-xl focus:ring-2 focus:ring-emerald-500/50 dark:focus:ring-emerald-500/50 focus:border-emerald-500 dark:focus:border-emerald-500 bg-white/70 dark:bg-dark-700/70 backdrop-blur-sm text-gray-900 dark:text-dark-100 transition-all duration-300 hover:bg-white/90 dark:hover:bg-dark-700/90"
                  >
                    <option value="">Select category...</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-500/0 via-emerald-500/5 to-emerald-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Target Amount */}
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 dark:text-dark-200 mb-2">
                  Target Amount (MAD)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.target_amount}
                    onChange={(e) => onChange({ ...formData, target_amount: e.target.value })}
                    className="w-full px-4 py-2.5 sm:py-3 text-sm border-2 border-white/50 dark:border-dark-600/50 rounded-xl focus:ring-2 focus:ring-emerald-500/50 dark:focus:ring-emerald-500/50 focus:border-emerald-500 dark:focus:border-emerald-500 bg-white/70 dark:bg-dark-700/70 backdrop-blur-sm text-gray-900 dark:text-dark-100 placeholder-gray-500 dark:placeholder-dark-400 transition-all duration-300 hover:bg-white/90 dark:hover:bg-dark-700/90"
                    placeholder="10000.00"
                  />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-500/0 via-emerald-500/5 to-emerald-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
              </div>

              {/* Target Date */}
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 dark:text-dark-200 mb-2">
                  Target Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={formData.target_date}
                    onChange={(e) => onChange({ ...formData, target_date: e.target.value })}
                    className="w-full px-4 py-2.5 sm:py-3 text-sm border-2 border-white/50 dark:border-dark-600/50 rounded-xl focus:ring-2 focus:ring-emerald-500/50 dark:focus:ring-emerald-500/50 focus:border-emerald-500 dark:focus:border-emerald-500 bg-white/70 dark:bg-dark-700/70 backdrop-blur-sm text-gray-900 dark:text-dark-100 transition-all duration-300 hover:bg-white/90 dark:hover:bg-dark-700/90"
                  />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-500/0 via-emerald-500/5 to-emerald-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 dark:text-dark-200 mb-2">
                Notes
              </label>
              <div className="relative">
                <textarea
                  value={formData.notes}
                  onChange={(e) => onChange({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-white/50 dark:border-dark-600/50 rounded-xl focus:ring-2 focus:ring-emerald-500/50 dark:focus:ring-emerald-500/50 focus:border-emerald-500 dark:focus:border-emerald-500 bg-white/70 dark:bg-dark-700/70 backdrop-blur-sm text-gray-900 dark:text-dark-100 placeholder-gray-500 dark:placeholder-dark-400 transition-all duration-300 hover:bg-white/90 dark:hover:bg-dark-700/90 resize-none"
                  rows={3}
                  placeholder="Optional notes about this objective..."
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-500/0 via-emerald-500/5 to-emerald-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="relative group/btn flex-1 sm:flex-none overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 opacity-0 group-hover/btn:opacity-100 blur-xl transition-opacity duration-300"></div>
                <div className="relative bg-gradient-to-r from-emerald-500 to-teal-600 dark:from-emerald-600 dark:to-teal-700 hover:from-emerald-600 hover:to-teal-700 dark:hover:from-emerald-700 dark:hover:to-teal-800 text-white font-bold px-8 py-3 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-2xl transform hover:scale-105 disabled:hover:scale-100 active:scale-95">
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Saving...</span>
                    </div>
                  ) : (
                    <span>{editingGoal ? 'Update Objective' : 'Add Objective'}</span>
                  )}
                </div>
              </button>
              
              <button
                type="button"
                onClick={onCancel}
                className="relative group/cancel px-6 py-3 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95"
              >
                <div className="absolute inset-0 bg-white/50 dark:bg-dark-700/50 backdrop-blur-sm rounded-xl border-2 border-gray-300/50 dark:border-dark-600/50 group-hover/cancel:border-gray-400/50 dark:group-hover/cancel:border-dark-500/50 transition-colors"></div>
                <span className="relative font-semibold text-gray-700 dark:text-dark-200 group-hover/cancel:text-gray-900 dark:group-hover/cancel:text-dark-100">
                  Cancel
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}