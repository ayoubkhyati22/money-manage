interface BankBalanceEditFormProps {
  bankName: string
  currentBalance: number
  formData: {
    newBalance: string
    description: string
  }
  loading: boolean
  onSubmit: (e: React.FormEvent) => void
  onChange: (data: { newBalance: string; description: string }) => void
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
    <div className="bg-stone-50 dark:bg-[#14161f] border border-stone-200/80 dark:border-white/[0.08] rounded-xl p-4 font-mono text-xs">
      <h4 className="font-display font-bold text-sm text-stone-900 dark:text-white mb-3">
        Synchronize Bank Balance
      </h4>

      <form onSubmit={onSubmit} className="space-y-3">
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 mb-3">
          <p className="text-amber-700 dark:text-amber-300 font-semibold">
            {bankName}
          </p>
          <p className="text-stone-500 dark:text-stone-400 mt-0.5">
            Current Balance: {currentBalance.toFixed(2)} MAD
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-medium text-stone-500 uppercase tracking-wider mb-1">
              New Bank Balance (MAD) *
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.newBalance}
              onChange={(e) => onChange({ ...formData, newBalance: e.target.value })}
              className="w-full px-3 py-2 border border-stone-200 dark:border-white/[0.08] rounded-xl bg-white dark:bg-[#121520] text-stone-900 dark:text-white focus:outline-none focus:border-amber-500/60 tabular-num"
              placeholder="0.00"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-stone-500 uppercase tracking-wider mb-1">
              Audit Note
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => onChange({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-stone-200 dark:border-white/[0.08] rounded-xl bg-white dark:bg-[#121520] text-stone-900 dark:text-white focus:outline-none focus:border-amber-500/60"
              placeholder="e.g. Bank statement reconciliation"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <button
            type="submit"
            disabled={loading}
            className="bg-stone-900 dark:bg-white text-white dark:text-stone-950 px-4 py-2 rounded-xl font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? 'Reconciling...' : 'Confirm Balance'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-2 text-stone-500 hover:text-stone-800 dark:hover:text-stone-200"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
