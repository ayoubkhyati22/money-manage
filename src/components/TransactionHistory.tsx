import { TransactionHistoryProps } from '../types/transaction'
import { useTransactionHistory } from '../hooks/useTransactionHistory'
import { MobileView } from './TransactionList/MobileView'
import { DesktopView } from './TransactionList/DesktopView'
import { SelectionBar } from './TransactionList/SelectionBar'
import { AnimatePresence, motion } from 'framer-motion'
import { History, ArrowDownLeft, ArrowUpRight, RotateCcw, CheckSquare, X } from 'lucide-react'

export function TransactionHistory({ onUpdate }: TransactionHistoryProps) {
  const {
    transactions, loading, showWithdrawnOnly,
    page, totalCount, hasMore, isDesktop,
    selectedIds, isSelectionMode,
    totalIn, totalOut,
    handleReturnMoney, handleReturnSelected,
    toggleSelection, toggleSelectAll, toggleFilter,
    loadMore, goToPage, toggleSelectionMode, getSelectedTotal, refresh,
  } = useTransactionHistory(onUpdate)

  const selectableCount = transactions.filter(
    t => t.amount < 0 && !t.description?.includes('Stock Purchase:') && !t.description?.includes('Stock Sale:')
  ).length

  // ── Shared toolbar ────────────────────────────────────────────────────────
  const Toolbar = () => (
    <div className="flex items-center gap-2">
      <div className="flex-1 flex gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
        {[
          { label: 'All',       isActive: !showWithdrawnOnly },
          { label: 'Withdrawn', isActive: showWithdrawnOnly  },
        ].map(tab => (
          <button key={tab.label} onClick={() => { if (!tab.isActive) toggleFilter() }}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              tab.isActive
                ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
            }`}>
            {tab.label}
          </button>
        ))}
      </div>
      <button onClick={toggleSelectionMode}
        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
          isSelectionMode
            ? 'bg-primary-500 text-white'
            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
        }`}>
        {isSelectionMode ? <X className="w-3.5 h-3.5" /> : <CheckSquare className="w-3.5 h-3.5" />}
        {isSelectionMode ? 'Cancel' : 'Select'}
      </button>
      <button onClick={refresh}
        className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors">
        <RotateCcw className="w-3.5 h-3.5" />
      </button>
    </div>
  )

  // ── DESKTOP ───────────────────────────────────────────────────────────────
  if (isDesktop) {
    return (
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

        {/* Hero + stats — full width */}
        <div className="relative overflow-hidden rounded-2xl px-6 py-5"
          style={{ background: 'linear-gradient(135deg,#1e1b4b 0%,#312e81 60%,#4338ca 100%)' }}>
          <div className="absolute -top-8 -right-8 w-52 h-52 rounded-full bg-white/5 pointer-events-none" />
          <div className="absolute -bottom-10 -left-6 w-40 h-40 rounded-full bg-white/5 pointer-events-none" />
          <div className="relative z-10 flex items-center justify-between gap-8">
            {/* Title */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-300/60 mb-0.5">Activity</p>
              <p className="text-2xl font-bold text-white">Transaction History</p>
              <p className="text-xs text-indigo-300/50 mt-0.5">All your financial activities</p>
            </div>
            {/* Stats */}
            <div className="flex items-center gap-4">
              <div className="text-center px-5 py-2.5 rounded-xl bg-white/10">
                <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-300/70">Total</p>
                <p className="text-2xl font-bold text-white tabular-nums">{totalCount}</p>
                <p className="text-[10px] text-indigo-300/50">transactions</p>
              </div>
              <div className="text-center px-5 py-2.5 rounded-xl bg-white/10">
                <div className="flex items-center justify-center gap-1 mb-0.5">
                  <ArrowUpRight className="w-3 h-3 text-emerald-400" />
                  <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400/80">In</p>
                </div>
                <p className="text-2xl font-bold text-emerald-400 tabular-nums">
                  {totalIn.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                </p>
                <p className="text-[10px] text-indigo-300/50">MAD</p>
              </div>
              <div className="text-center px-5 py-2.5 rounded-xl bg-white/10">
                <div className="flex items-center justify-center gap-1 mb-0.5">
                  <ArrowDownLeft className="w-3 h-3 text-red-400" />
                  <p className="text-[10px] font-bold uppercase tracking-widest text-red-400/80">Out</p>
                </div>
                <p className="text-2xl font-bold text-red-400 tabular-nums">
                  {totalOut.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                </p>
                <p className="text-[10px] text-indigo-300/50">MAD</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                <History className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <Toolbar />

        {/* Full-width table card */}
        <div className="bg-white dark:bg-slate-800/60 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-700/50 shadow-sm">
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
        </div>

        <AnimatePresence>
          {isSelectionMode && (
            <SelectionBar
              selectedCount={selectedIds.size}
              selectedTotal={getSelectedTotal()}
              selectableCount={selectableCount}
              onReturnSelected={handleReturnSelected}
              onSelectAll={toggleSelectAll}
            />
          )}
        </AnimatePresence>
      </motion.div>
    )
  }

  // ── MOBILE ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4 max-w-lg mx-auto">

      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl px-5 py-5"
        style={{ background: 'linear-gradient(135deg,#1e1b4b 0%,#312e81 60%,#4338ca 100%)' }}>
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute -bottom-10 -left-6 w-32 h-32 rounded-full bg-white/5 pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-300/60 mb-0.5">Activity</p>
              <p className="text-2xl font-bold text-white leading-tight">History</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <History className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/10 rounded-xl px-3 py-2.5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-300/70 leading-tight">Total</p>
              <p className="text-lg font-bold text-white tabular-nums leading-tight">{totalCount}</p>
              <p className="text-[10px] text-indigo-300/50">transactions</p>
            </div>
            <div className="bg-white/10 rounded-xl px-3 py-2.5">
              <div className="flex items-center gap-1 mb-0.5">
                <ArrowUpRight className="w-3 h-3 text-emerald-400" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400/80">In</p>
              </div>
              <p className="text-sm font-bold text-emerald-400 tabular-nums leading-tight">
                {totalIn.toLocaleString('en-US', { maximumFractionDigits: 0 })}
              </p>
              <p className="text-[10px] text-indigo-300/50">MAD</p>
            </div>
            <div className="bg-white/10 rounded-xl px-3 py-2.5">
              <div className="flex items-center gap-1 mb-0.5">
                <ArrowDownLeft className="w-3 h-3 text-red-400" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-red-400/80">Out</p>
              </div>
              <p className="text-sm font-bold text-red-400 tabular-nums leading-tight">
                {totalOut.toLocaleString('en-US', { maximumFractionDigits: 0 })}
              </p>
              <p className="text-[10px] text-indigo-300/50">MAD</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Toolbar */}
      <Toolbar />

      {/* List card */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-800/60 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-700/50 shadow-sm">
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
      </motion.div>

      <AnimatePresence>
        {isSelectionMode && (
          <SelectionBar
            selectedCount={selectedIds.size}
            selectedTotal={getSelectedTotal()}
            selectableCount={selectableCount}
            onReturnSelected={handleReturnSelected}
            onSelectAll={toggleSelectAll}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
