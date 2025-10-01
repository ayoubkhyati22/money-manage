import { Plus } from 'lucide-react'
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
    <div className="bg-white/90 dark:bg-dark-800/90 backdrop-blur-sm rounded-2xl shadow-lg border border-mint-200/50 dark:border-dark-600/50 overflow-hidden">
      <div className="bg-gradient-to-r from-emerald-50 to-mint-50 dark:from-emerald-900/30 dark:to-mint-900/30 p-6 border-b border-emerald-200 dark:border-dark-600">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-10 h-10 bg-emerald-500 rounded-xl">
            <Plus className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-emerald-900 dark:text-emerald-100">
              {editingBank ? 'Edit Bank' : 'Add New Bank'}
            </h3>
            <p className="text-sm text-emerald-700 dark:text-emerald-300">
              {editingBank ? 'Update bank information' : 'Add a new financial institution'}
            </p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-200 mb-2">
                Bank Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => onChange({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:focus:ring-primary-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-dark-100 placeholder-gray-500 dark:placeholder-dark-400"
                placeholder="Enter bank name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-200 mb-2">
                Initial Balance (MAD) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.balance}
                onChange={(e) => onChange({ ...formData, balance: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:focus:ring-primary-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-dark-100 placeholder-gray-500 dark:placeholder-dark-400"
                placeholder="0.00"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-200 mb-2">
              Logo URL (optional)
            </label>
            <input
              type="url"
              value={formData.logo}
              onChange={(e) => onChange({ ...formData, logo: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:focus:ring-primary-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-dark-100 placeholder-gray-500 dark:placeholder-dark-400"
              placeholder="https://example.com/logo.png"
            />
          </div>

          <div className="flex items-center space-x-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 dark:from-primary-500 dark:to-primary-600 hover:from-emerald-600 hover:to-emerald-700 dark:hover:from-primary-600 dark:hover:to-primary-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 disabled:opacity-50 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:hover:scale-100"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Saving...</span>
                </div>
              ) : (
                <span>{editingBank ? 'Update Bank' : 'Add Bank'}</span>
              )}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="text-gray-600 dark:text-dark-300 hover:text-gray-900 dark:hover:text-dark-100 px-6 py-3 rounded-xl transition-colors font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
