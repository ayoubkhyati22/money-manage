import { Goal } from '../../lib/supabase'
import { categories } from '../../types/goal'

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
    <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-600 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-100 mb-4">
        {editingGoal ? 'Edit Objective' : 'Add New Objective'}
      </h3>

      <form onSubmit={onSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-200 mb-1">
              Objective Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => onChange({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:focus:ring-primary-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-dark-100 placeholder-gray-500 dark:placeholder-dark-400"
              placeholder="e.g., Car, Marriage, Bike"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-200 mb-1">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => onChange({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:focus:ring-primary-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-dark-100"
            >
              <option value="">Select category...</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-200 mb-1">
              Target Amount (MAD)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.target_amount}
              onChange={(e) => onChange({ ...formData, target_amount: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:focus:ring-primary-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-dark-100 placeholder-gray-500 dark:placeholder-dark-400"
              placeholder="10000.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-200 mb-1">
              Target Date
            </label>
            <input
              type="date"
              value={formData.target_date}
              onChange={(e) => onChange({ ...formData, target_date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:focus:ring-primary-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-dark-100"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-dark-200 mb-1">
            Notes
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => onChange({ ...formData, notes: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:focus:ring-primary-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-dark-100 placeholder-gray-500 dark:placeholder-dark-400"
            rows={3}
            placeholder="Optional notes about this objective..."
          />
        </div>

        <div className="flex items-center space-x-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-emerald-500 dark:bg-primary-500 hover:bg-emerald-600 dark:hover:bg-primary-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Saving...' : (editingGoal ? 'Update Objective' : 'Add Objective')}
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
