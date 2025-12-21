import { Goal, Bank } from '../../lib/supabase'
import { DollarSign } from 'lucide-react'

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
  onChange: (data: any) => void
  onCancel: () => void
}

export function AddMoneyForm({ selectedObjective, banks, formData, loading, onSubmit, onChange, onCancel }: AddMoneyFormProps) {
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
                <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 dark:from-emerald-400 dark:via-teal-400 dark:to-cyan-400 bg-clip-text text-transparent">
                Add Money to "{selectedObjective.name}"
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                Allocate funds to your objective
              </p>
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-6">
          <form onSubmit={onSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Select Bank */}
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 dark:text-dark-200 mb-2">
                  Select Bank *
                </label>
                <div className="relative">
                  <select
                    value={formData.bank_id}
                    onChange={(e) => onChange({ ...formData, bank_id: e.target.value })}
                    className="w-full px-4 py-3 text-sm border-2 border-white/50 dark:border-dark-600/50 rounded-xl focus:ring-2 focus:ring-emerald-500/50 dark:focus:ring-teal-500/50 focus:border-emerald-500 dark:focus:border-teal-500 bg-white/70 dark:bg-dark-700/70 backdrop-blur-sm text-gray-900 dark:text-dark-100 transition-all duration-300 hover:bg-white/90 dark:hover:bg-dark-700/90"
                    required
                  >
                    <option value="">Choose a bank...</option>
                    {banks.map((bank) => (
                      <option key={bank.id} value={bank.id}>
                        {bank.name} - {Number(bank.balance).toFixed(2)} MAD
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-500/0 via-emerald-500/5 to-emerald-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
              </div>

              {/* Amount */}
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 dark:text-dark-200 mb-2">
                  Amount (MAD) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={formData.amount}
                    onChange={(e) => onChange({ ...formData, amount: e.target.value })}
                    className="w-full px-4 py-3 text-sm border-2 border-white/50 dark:border-dark-600/50 rounded-xl focus:ring-2 focus:ring-emerald-500/50 dark:focus:ring-teal-500/50 focus:border-emerald-500 dark:focus:border-teal-500 bg-white/70 dark:bg-dark-700/70 backdrop-blur-sm text-gray-900 dark:text-dark-100 placeholder-gray-500 dark:placeholder-dark-400 transition-all duration-300 hover:bg-white/90 dark:hover:bg-dark-700/90"
                    placeholder="500.00"
                    required
                  />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-teal-500/0 via-teal-500/5 to-teal-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 dark:text-dark-200 mb-2">
                Description
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => onChange({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-white/50 dark:border-dark-600/50 rounded-xl focus:ring-2 focus:ring-emerald-500/50 dark:focus:ring-teal-500/50 focus:border-emerald-500 dark:focus:border-teal-500 bg-white/70 dark:bg-dark-700/70 backdrop-blur-sm text-gray-900 dark:text-dark-100 placeholder-gray-500 dark:placeholder-dark-400 transition-all duration-300 hover:bg-white/90 dark:hover:bg-dark-700/90"
                  placeholder="e.g., Initial savings for car"
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500/0 via-cyan-500/5 to-cyan-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
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
                      <span>Adding...</span>
                    </div>
                  ) : (
                    <span>Add Money</span>
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