interface BankBalanceEditFormProps {
  bankName: string
  currentBalance: number
  formData: {
    newBalance: string
    description: string
  }
  loading: boolean
  onSubmit: (e: React.FormEvent) => void
  onChange: (data: any) => void
  onCancel: () => void
}

export function BankBalanceEditForm({
  bankName,
  currentBalance,
  formData,
  loading,
  onSubmit,
  onChange,
  onCancel
}: BankBalanceEditFormProps) {
  return (
    <div className="bg-gray-50 dark:bg-dark-700 rounded-lg p-4">
      <h4 className="text-sm font-medium text-gray-700 dark:text-dark-200 mb-3">
        Edit Bank Balance
      </h4>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-3 mb-4">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Editing:</strong> {bankName}
          </p>
          <p className="text-sm text-blue-600 dark:text-blue-300">
            Current Balance: {currentBalance.toFixed(2)} MAD
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-200 mb-1">
              New Balance (MAD) *
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.newBalance}
              onChange={(e) => onChange({ ...formData, newBalance: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:focus:ring-primary-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-dark-100"
              placeholder="0.00"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-200 mb-1">
              Description
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => onChange({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:focus:ring-primary-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-dark-100 placeholder-gray-500 dark:placeholder-dark-400"
              placeholder="Reason for balance change..."
            />
          </div>
        </div>

        {formData.newBalance && (
          <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-lg p-3">
            <div className="text-sm">
              <div className="flex justify-between">
                <span className="text-yellow-700 dark:text-yellow-200">Current Balance:</span>
                <span className="font-medium text-gray-900 dark:text-dark-100">{currentBalance.toFixed(2)} MAD</span>
              </div>
              <div className="flex justify-between">
                <span className="text-yellow-700 dark:text-yellow-200">New Balance:</span>
                <span className="font-medium text-gray-900 dark:text-dark-100">{parseFloat(formData.newBalance || '0').toFixed(2)} MAD</span>
              </div>
              <div className="flex justify-between border-t border-yellow-200 dark:border-yellow-700 pt-2 mt-2">
                <span className="text-yellow-700 dark:text-yellow-200">Change:</span>
                <span className={`font-semibold ${
                  (parseFloat(formData.newBalance || '0') - currentBalance) >= 0
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {(parseFloat(formData.newBalance || '0') - currentBalance) >= 0 ? '+' : ''}
                  {(parseFloat(formData.newBalance || '0') - currentBalance).toFixed(2)} MAD
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center space-x-3">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Updating...' : 'Update Balance'}
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
