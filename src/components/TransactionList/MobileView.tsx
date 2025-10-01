import { ObjectiveTransaction } from '../../types/transaction'
import { TransactionCard } from './TransactionCard'
import { EmptyState } from './EmptyState'

interface MobileViewProps {
  transactions: ObjectiveTransaction[]
  loading: boolean
  showWithdrawnOnly: boolean
  hasMore: boolean
  isDesktop: boolean
  onReturn: (transaction: ObjectiveTransaction) => void
  onLoadMore: () => void
}

export function MobileView({
  transactions,
  loading,
  showWithdrawnOnly,
  hasMore,
  isDesktop,
  onReturn,
  onLoadMore
}: MobileViewProps) {
  return (
    <div className="space-y-3">
      {transactions.length === 0 && !loading ? (
        <EmptyState showWithdrawnOnly={showWithdrawnOnly} />
      ) : (
        transactions.map((transaction) => (
          <TransactionCard
            key={transaction.id}
            transaction={transaction}
            onReturn={onReturn}
          />
        ))
      )}

      {hasMore && !loading && !isDesktop && (
        <div className="mt-4 flex justify-center">
          <button
            onClick={onLoadMore}
            className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-dark-700 hover:bg-gray-200 dark:hover:bg-dark-600 text-gray-700 dark:text-dark-200 text-sm font-medium"
          >
            Load more
          </button>
        </div>
      )}

      {loading && (
        <div className="mt-4 text-center text-sm text-gray-500 dark:text-dark-400">
          Loading...
        </div>
      )}
    </div>
  )
}
