import { Plus, Sparkles } from 'lucide-react'
import { Bank, BankFormData } from '../../types/bank'

interface BankFormProps {
  formData: BankFormData
  editingBank: Bank | null
  loading: boolean
  onSubmit: (e: React.FormEvent) => void
  onChange: (data: BankFormData) => void
  onCancel: () => void
}

export function BankForm({
  formData,
  editingBank,
  loading,
  onSubmit,
  onChange,
  onCancel
}: BankFormProps) {
  return (
    <div className="relative">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-100/50 via-teal-100/30 to-cyan-100/50 dark:from-emerald-950/30 dark:via-teal-950/20 dark:to-cyan-950/30 rounded-2xl blur-3xl -z-10"></div>
      
      <div className="bg-white/70 dark:bg-dark-800/70 backdrop-blur-2xl rounded-2xl shadow-xl border border-white/50 dark:border-dark-600/50 overflow-hidden">
        {/* Header with glass effect */}
        <div className="relative bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 dark:from-emerald-900/30 dark:via-teal-900/30 dark:to-cyan-900/30 backdrop-blur-xl p-6 border-b border-white/30 dark:border-dark-600/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="absolute inset-0 bg-emerald-500 blur-lg opacity-50 rounded-xl"></div>
                <div className="relative flex items-center justify-center w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg">
                  <Plus className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 dark:from-emerald-400 dark:via-teal-400 dark:to-cyan-400 bg-clip-text text-transparent">
                  {editingBank ? 'Edit Bank' : 'Add New Bank'}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {editingBank ? 'Update bank information' : 'Add a new financial institution'}
                </p>
              </div>
            </div>
            
            {/* Sparkle decoration */}
            <Sparkles className="w-6 h-6 text-emerald-500/40 dark:text-emerald-400/30 animate-pulse" />
          </div>
        </div>

        <div className="p-6">
          <form onSubmit={onSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Bank Name Input */}
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 dark:text-dark-200 mb-2">
                  Bank Name *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => onChange({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 text-sm border-2 border-white/50 dark:border-dark-600/50 rounded-xl focus:ring-2 focus:ring-emerald-500/50 dark:focus:ring-teal-500/50 focus:border-emerald-500 dark:focus:border-teal-500 bg-white/70 dark:bg-dark-700/70 backdrop-blur-sm text-gray-900 dark:text-dark-100 placeholder-gray-500 dark:placeholder-dark-400 transition-all duration-300 hover:bg-white/90 dark:hover:bg-dark-700/90"
                    placeholder="Enter bank name"
                    required
                  />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-500/0 via-emerald-500/5 to-emerald-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
              </div>

              {/* Balance Input */}
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 dark:text-dark-200 mb-2">
                  Initial Balance (MAD) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.balance}
                    onChange={(e) => onChange({ ...formData, balance: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-3 text-sm border-2 border-white/50 dark:border-dark-600/50 rounded-xl focus:ring-2 focus:ring-emerald-500/50 dark:focus:ring-teal-500/50 focus:border-emerald-500 dark:focus:border-teal-500 bg-white/70 dark:bg-dark-700/70 backdrop-blur-sm text-gray-900 dark:text-dark-100 placeholder-gray-500 dark:placeholder-dark-400 transition-all duration-300 hover:bg-white/90 dark:hover:bg-dark-700/90"
                    placeholder="0.00"
                    required
                  />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-500/0 via-emerald-500/5 to-emerald-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
              </div>
            </div>

            {/* Logo URL Input */}
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 dark:text-dark-200 mb-2">
                Logo URL (optional)
              </label>
              <div className="relative">
                <input
                  type="url"
                  value={formData.logo}
                  onChange={(e) => onChange({ ...formData, logo: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-white/50 dark:border-dark-600/50 rounded-xl focus:ring-2 focus:ring-emerald-500/50 dark:focus:ring-teal-500/50 focus:border-emerald-500 dark:focus:border-teal-500 bg-white/70 dark:bg-dark-700/70 backdrop-blur-sm text-gray-900 dark:text-dark-100 placeholder-gray-500 dark:placeholder-dark-400 transition-all duration-300 hover:bg-white/90 dark:hover:bg-dark-700/90"
                  placeholder="https://example.com/logo.png"
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-500/0 via-emerald-500/5 to-emerald-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="relative group/btn flex-1 sm:flex-none overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 opacity-0 group-hover/btn:opacity-100 blur-xl transition-opacity duration-300"></div>
                <div className="relative bg-gradient-to-r from-emerald-500 to-teal-600 dark:from-emerald-600 dark:to-teal-700 hover:from-emerald-600 hover:to-teal-700 dark:hover:from-emerald-700 dark:hover:to-teal-800 text-white font-bold px-8 py-3 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-2xl transform hover:scale-105 disabled:hover:scale-100 active:scale-95">
                  {loading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Saving...</span>
                    </div>
                  ) : (
                    <span>{editingBank ? 'Update Bank' : 'Add Bank'}</span>
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