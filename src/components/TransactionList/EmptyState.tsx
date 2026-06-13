import { History } from 'lucide-react'

interface EmptyStateProps {
  showWithdrawnOnly: boolean
}

export function EmptyState({ showWithdrawnOnly }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
        <History className="w-7 h-7 text-slate-300 dark:text-slate-600" />
      </div>
      <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
        {showWithdrawnOnly ? 'No withdrawals found' : 'No transactions yet'}
      </p>
      <p className="text-xs text-slate-400">Your activity will appear here</p>
    </div>
  )
}
