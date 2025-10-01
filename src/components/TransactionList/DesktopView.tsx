import { ObjectiveTransaction } from '../../types/transaction'
import { TransactionTableRow } from './TransactionTableRow'
import { Pagination } from './Pagination'
import { EmptyState } from './EmptyState'

interface DesktopViewProps {
  transactions: ObjectiveTransaction[]
  loading: boolean
  showWithdrawnOnly: boolean
  page: number
  totalCount: number
  onReturn: (transaction: ObjectiveTransaction) => void
  onPageChange: (page: number) => void
}

export function DesktopView({
  transactions,
  loading,
  showWithdrawnOnly,
  page,
  totalCount,
  onReturn,
  onPageChange
}: DesktopViewProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-600 rounded-lg">
        <thead className="bg-gray-50 dark:bg-dark-700">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-300 uppercase tracking-wider">
              Date
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-300 uppercase tracking-wider">
              Description
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-300 uppercase tracking-wider">
              Objective
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-300 uppercase tracking-wider">
              Bank
            </th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-dark-300 uppercase tracking-wider">
              Amount
            </th>
            <th scope="col" className="relative px-6 py-3">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-dark-800 divide-y divide-gray-200 dark:divide-dark-600">
          {transactions.length === 0 && !loading ? (
            <tr>
              <td colSpan={6}>
                <EmptyState showWithdrawnOnly={showWithdrawnOnly} />
              </td>
            </tr>
          ) : (
            transactions.map((transaction) => (
              <TransactionTableRow
                key={transaction.id}
                transaction={transaction}
                onReturn={onReturn}
              />
            ))
          )}
        </tbody>
      </table>

      {transactions.length > 0 && !loading && (
        <Pagination
          page={page}
          totalCount={totalCount}
          onPageChange={onPageChange}
        />
      )}

      {loading && (
        <div className="mt-4 text-center text-sm text-gray-500 dark:text-dark-400 py-4">
          Loading...
        </div>
      )}
    </div>
  )
}
