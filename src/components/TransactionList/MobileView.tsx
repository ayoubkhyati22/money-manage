import { ObjectiveTransaction } from '../../types/transaction'
import { TransactionCard } from './TransactionCard'
import { EmptyState } from './EmptyState'

interface MobileViewProps {
  transactions: ObjectiveTransaction[]
  loading: boolean
  showWithdrawnOnly: boolean
  hasMore: boolean
  isDesktop: boolean
  isSelectionMode: boolean
  selectedIds: Set<string>
  onReturn: (transaction: ObjectiveTransaction) => void
  onToggleSelection: (transactionId: string) => void
  onLoadMore: () => void
}

export function MobileView({
  transactions,
  loading,
  showWithdrawnOnly,
  hasMore,
  isDesktop,
  isSelectionMode,
  selectedIds,
  onReturn,
  onToggleSelection,
  onLoadMore
}: MobileViewProps) {
  return (
    <div className="space-y-2">
      {transactions.length === 0 && !loading ? (
        <EmptyState showWithdrawnOnly={showWithdrawnOnly} />
      ) : (
        transactions.map((transaction) => (
          <TransactionCard
            key={transaction.id}
            transaction={transaction}
            isSelectionMode={isSelectionMode}
            isSelected={selectedIds.has(transaction.id)}
            onReturn={onReturn}
            onToggleSelection={onToggleSelection}
          />
        ))
      )}

      {hasMore && !loading && !isDesktop && (
        <div className="pt-3 flex justify-center">
          <button
            onClick={onLoadMore}
            className="px-6 py-2.5 rounded-xl bg-gradient-lime text-white text-sm font-medium shadow-brand hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
          >
            Load more
          </button>
        </div>
      )}

      {loading && (
        <div className="pt-3 flex justify-center">
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-dark-400">
            <div className="spinner"></div>
            <span>Loading...</span>
          </div>
        </div>
      )}
    </div>
  )
}