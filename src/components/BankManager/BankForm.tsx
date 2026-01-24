import { Plus, X, Building2 } from 'lucide-react'
import { Bank, BankFormData } from '../../types/bank'
import { motion } from 'framer-motion'

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
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="glass-card overflow-hidden"
    >
      {/* Header */}
      <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
            {editingBank ? (
              <Building2 className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            ) : (
              <Plus className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 dark:text-white">
              {editingBank ? 'Edit Bank' : 'Add New Bank'}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {editingBank ? 'Update bank details' : 'Add a new bank account'}
            </p>
          </div>
        </div>
        <button
          onClick={onCancel}
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        >
          <X className="w-5 h-5 text-slate-500" />
        </button>
      </div>

      {/* Form */}
      <form onSubmit={onSubmit} className="p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Bank Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Bank Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => onChange({ ...formData, name: e.target.value })}
              className="input-modern"
              placeholder="Enter bank name"
              required
            />
          </div>

          {/* Balance */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Initial Balance (MAD) *
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.balance}
              onChange={(e) => onChange({ ...formData, balance: parseFloat(e.target.value) || 0 })}
              className="input-modern"
              placeholder="0.00"
              required
            />
          </div>
        </div>

        {/* Logo URL */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Logo URL (optional)
          </label>
          <input
            type="url"
            value={formData.logo}
            onChange={(e) => onChange({ ...formData, logo: e.target.value })}
            className="input-modern"
            placeholder="https://example.com/logo.png"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex-1 sm:flex-none"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Saving...</span>
              </>
            ) : (
              <span>{editingBank ? 'Update Bank' : 'Add Bank'}</span>
            )}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary"
          >
            Cancel
          </button>
        </div>
      </form>
    </motion.div>
  )
}
