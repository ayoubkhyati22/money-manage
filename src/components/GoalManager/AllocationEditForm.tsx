import { Bank } from '../../lib/supabase'

interface AllocationEditFormProps {
  banks: Bank[]
  formData: {
    bank_id: string
    amount: string
  }
  loading: boolean
  onSubmit: (e: React.FormEvent) => void
  onChange: (data: { bank_id: string; amount: string }) => void
  onCancel: () => void
}

export function AllocationEditForm({ banks, formData, loading, onSubmit, onChange, onCancel }: AllocationEditFormProps) {
  const bankName = banks.find(b => b.id === formData.bank_id)?.name || 'Depository Account'

  return (
    <div className="bg-stone-50 dark:bg-[#14161f] border border-stone-200/80 dark:border-white/[0.08] rounded-xl p-4 font-mono text-xs">
      <h4 className="font-display font-bold text-sm text-stone-900 dark:text-white mb-3">
        Adjust Bank Allocation
      </h4>

      <form onSubmit={onSubmit} className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-medium text-stone-500 uppercase tracking-wider mb-1">
              Bank
            </label>
            <input
              type="text"
              value={bankName}
              className="w-full px-3 py-2 bg-stone-100 dark:bg-[#1a1d28] border border-stone-200 dark:border-white/[0.06] rounded-xl text-stone-700 dark:text-stone-300 font-medium"
              disabled
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-stone-500 uppercase tracking-wider mb-1">
              Allocated Amount (MAD) *
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.amount}
              onChange={(e) => onChange({ ...formData, amount: e.target.value })}
              className="w-full px-3 py-2 border border-stone-200 dark:border-white/[0.08] rounded-xl bg-white dark:bg-[#121520] text-stone-900 dark:text-white focus:outline-none focus:border-amber-500/60 tabular-num"
              placeholder="0.00"
              required
            />
          </div>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <button
            type="submit"
            disabled={loading}
            className="bg-stone-900 dark:bg-white text-white dark:text-stone-950 px-4 py-2 rounded-xl font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? 'Updating...' : 'Update Allocation'}
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
