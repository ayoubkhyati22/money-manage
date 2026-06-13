import { ObjectiveTransaction } from '../../types/transaction'
import { TransactionCard } from './TransactionCard'
import { format, isToday, isYesterday } from 'date-fns'
import { History } from 'lucide-react'

interface MobileViewProps {
  transactions: ObjectiveTransaction[]
  loading: boolean
  showWithdrawnOnly: boolean
  hasMore: boolean
  isDesktop: boolean
  isSelectionMode: boolean
  selectedIds: Set<string>
  onReturn: (transaction: ObjectiveTransaction) => void
  onToggleSelection: (id: string) => void
  onLoadMore: () => void
}

function dateLabel(dateStr: string): string {
  const d = new Date(dateStr)
  if (isToday(d)) return 'Today'
  if (isYesterday(d)) return 'Yesterday'
  return format(d, 'MMMM dd, yyyy')
}

function groupByDate(txs: ObjectiveTransaction[]): { label: string; items: ObjectiveTransaction[] }[] {
  const map = new Map<string, ObjectiveTransaction[]>()
  for (const tx of txs) {
    const key = format(new Date(tx.created_at), 'yyyy-MM-dd')
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(tx)
  }
  return Array.from(map.entries()).map(([, items]) => ({
    label: dateLabel(items[0].created_at),
    items,
  }))
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
  onLoadMore,
}: MobileViewProps) {
  if (!loading && transactions.length === 0) {
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

  const groups = groupByDate(transactions)
  let globalIndex = 0

  return (
    <div>
      {groups.map(group => (
        <div key={group.label}>
          {/* Date separator */}
          <div className="flex items-center gap-3 px-4 py-2.5">
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 whitespace-nowrap">
              {group.label}
            </p>
            <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800" />
          </div>

          {/* Rows */}
          <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {group.items.map(tx => {
              const idx = globalIndex++
              return (
                <TransactionCard
                  key={tx.id}
                  transaction={tx}
                  isSelectionMode={isSelectionMode}
                  isSelected={selectedIds.has(tx.id)}
                  onReturn={onReturn}
                  onToggleSelection={onToggleSelection}
                  index={idx}
                />
              )
            })}
          </div>
        </div>
      ))}

      {/* Load more */}
      {hasMore && !loading && !isDesktop && (
        <div className="flex justify-center pt-4 pb-2">
          <button
            onClick={onLoadMore}
            className="px-5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-sm font-semibold text-slate-600 dark:text-slate-300 transition-colors"
          >
            Load more
          </button>
        </div>
      )}

      {loading && (
        <div className="flex justify-center items-center gap-2 py-6 text-sm text-slate-400">
          <div className="w-4 h-4 border-2 border-slate-300 dark:border-slate-600 border-t-primary-500 rounded-full animate-spin" />
          Loading…
        </div>
      )}
    </div>
  )
}
