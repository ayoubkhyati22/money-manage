import { TransactionHistoryProps } from '../types/transaction'
import { useTransactionHistory } from '../hooks/useTransactionHistory'
import { TransactionHeader } from './TransactionList/TransactionHeader'
import { MobileView } from './TransactionList/MobileView'
import { DesktopView } from './TransactionList/DesktopView'

export function TransactionHistory({ onUpdate }: TransactionHistoryProps) {
  const {
    transactions,
    loading,
    showWithdrawnOnly,
    page,
    totalCount,
    hasMore,
    isDesktop,
    handleReturnMoney,
    toggleFilter,
    loadMore,
    goToPage,
    refresh
  } = useTransactionHistory(onUpdate)

  return (
    <div className="space-y-3 sm:space-y-4">
      <TransactionHeader
        showWithdrawnOnly={showWithdrawnOnly}
        onToggleFilter={toggleFilter}
        onRefresh={refresh}
      />

      <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-600">
        <div className="p-3 sm:p-6 border-b border-gray-200 dark:border-dark-600">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-dark-100">
            {showWithdrawnOnly ? 'Withdrawn Transactions' : 'All Transactions'}
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-dark-300 mt-0.5 sm:mt-1">
            {showWithdrawnOnly ? 'Only withdrawals from objectives.' : 'Recent financial activities.'}
          </p>
        </div>

        <div className="p-3 sm:p-6">
          {isDesktop ? (
            <DesktopView
              transactions={transactions}
              loading={loading}
              showWithdrawnOnly={showWithdrawnOnly}
              page={page}
              totalCount={totalCount}
              onReturn={handleReturnMoney}
              onPageChange={goToPage}
            />
          ) : (
            <MobileView
              transactions={transactions}
              loading={loading}
              showWithdrawnOnly={showWithdrawnOnly}
              hasMore={hasMore}
              isDesktop={isDesktop}
              onReturn={handleReturnMoney}
              onLoadMore={loadMore}
            />
          )}
        </div>
      </div>
    </div>
  )
}
