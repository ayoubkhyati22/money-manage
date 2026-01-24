import { TransactionHistoryProps } from '../types/transaction'
import { useTransactionHistory } from '../hooks/useTransactionHistory'
import { TransactionHeader } from './TransactionList/TransactionHeader'
import { MobileView } from './TransactionList/MobileView'
import { DesktopView } from './TransactionList/DesktopView'
import { SelectionBar } from './TransactionList/SelectionBar'
import { History } from 'lucide-react'
import { motion } from 'framer-motion'

export function TransactionHistory({ onUpdate }: TransactionHistoryProps) {
  const {
    transactions,
    loading,
    showWithdrawnOnly,
    page,
    totalCount,
    hasMore,
    isDesktop,
    selectedIds,
    isSelectionMode,
    handleReturnMoney,
    handleReturnSelected,
    toggleSelection,
    toggleSelectAll,
    toggleFilter,
    loadMore,
    goToPage,
    toggleSelectionMode,
    getSelectedTotal,
    refresh
  } = useTransactionHistory(onUpdate)

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-accent-500 to-primary-500 flex items-center justify-center shadow-lg">
          <History className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-display font-bold text-slate-800 dark:text-white">History</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">View your transaction history</p>
        </div>
      </motion.div>

      {/* Filters & Controls */}
      <TransactionHeader
        showWithdrawnOnly={showWithdrawnOnly}
        isSelectionMode={isSelectionMode}
        onToggleFilter={toggleFilter}
        onToggleSelectionMode={toggleSelectionMode}
        onRefresh={refresh}
      />

      {/* Selection Bar */}
      {isSelectionMode && (
        <SelectionBar
          selectedCount={selectedIds.size}
          selectedTotal={getSelectedTotal()}
          onReturnSelected={handleReturnSelected}
          onSelectAll={toggleSelectAll}
          selectableCount={transactions.filter(t =>
            t.amount < 0 &&
            !(t.description?.includes('Stock Purchase:') || t.description?.includes('Stock Sale:'))
          ).length}
        />
      )}

      {/* Transactions List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card overflow-hidden"
      >
        <div className="p-5 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent-100 dark:bg-accent-900/30 flex items-center justify-center">
              <History className="w-5 h-5 text-accent-600 dark:text-accent-400" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 dark:text-white">
                {showWithdrawnOnly ? 'Withdrawals' : 'All Transactions'}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {showWithdrawnOnly ? 'Only withdrawal transactions' : 'Your recent financial activities'}
              </p>
            </div>
          </div>
        </div>

        <div className="p-5">
          {isDesktop ? (
            <DesktopView
              transactions={transactions}
              loading={loading}
              showWithdrawnOnly={showWithdrawnOnly}
              page={page}
              totalCount={totalCount}
              isSelectionMode={isSelectionMode}
              selectedIds={selectedIds}
              onReturn={handleReturnMoney}
              onToggleSelection={toggleSelection}
              onPageChange={goToPage}
            />
          ) : (
            <MobileView
              transactions={transactions}
              loading={loading}
              showWithdrawnOnly={showWithdrawnOnly}
              hasMore={hasMore}
              isDesktop={isDesktop}
              isSelectionMode={isSelectionMode}
              selectedIds={selectedIds}
              onReturn={handleReturnMoney}
              onToggleSelection={toggleSelection}
              onLoadMore={loadMore}
            />
          )}
        </div>
      </motion.div>
    </div>
  )
}
