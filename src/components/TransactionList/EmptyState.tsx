import { History } from 'lucide-react'

interface EmptyStateProps {
  showWithdrawnOnly: boolean
}

export function EmptyState({ showWithdrawnOnly }: EmptyStateProps) {
  return (
    <div className="text-center py-12">
      <History className="mx-auto w-12 h-12 text-gray-400 dark:text-dark-500 mb-4" />
      <p className="text-gray-500 dark:text-dark-300">
        {showWithdrawnOnly ? 'No withdrawn transactions.' : 'No transactions yet.'}
      </p>
      <p className="text-sm text-gray-400 mt-1">
        Your transaction history will appear here
      </p>
    </div>
  )
}
