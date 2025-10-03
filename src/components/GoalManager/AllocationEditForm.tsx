import { Bank } from '../../lib/supabase'

interface AllocationEditFormProps {
  banks: Bank[]
  formData: {
    bank_id: string
    amount: string
  }
  loading: boolean
  onSubmit: (e: React.FormEvent) => void
  onChange: (data: any) => void
  onCancel: () => void
}

export function AllocationEditForm({ banks, formData, loading, onSubmit, onChange, onCancel }: AllocationEditFormProps) {
  return (
    <div className="bg-gray-50 dark:bg-dark-700 rounded-lg p-4">
      <h4 className="text-sm font-medium text-gray-700 dark:text-dark-200 mb-3">
        Edit Allocation
      </h4>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-200 mb-1">
              Bank
            </label>
            <input
              type="text"
              value={banks.find(b => b.id === formData.bank_id)?.name || ''}
              className="w-full px-3 py-2 bg-gray-100 dark:bg-dark-600 border border-gray-300 dark:border-dark-600 rounded-lg text-gray-900 dark:text-dark-100"
              disabled
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-200 mb-1">
              Amount (MAD) *
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.amount}
              onChange={(e) => onChange({ ...formData, amount: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:focus:ring-primary-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-dark-100"
              placeholder="0.00"
              required
            />
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            type="submit"
            disabled={loading}
            className="bg-emerald-500 dark:bg-primary-500 hover:bg-emerald-600 dark:hover:bg-primary-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Updating...' : 'Update Allocation'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="text-gray-600 dark:text-dark-300 hover:text-gray-900 dark:hover:text-dark-100 px-4 py-2 rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
