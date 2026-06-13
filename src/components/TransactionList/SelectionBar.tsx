import { RotateCcw, CheckCircle2, X } from 'lucide-react'
import { motion } from 'framer-motion'

interface SelectionBarProps {
  selectedCount: number
  selectedTotal: number
  selectableCount: number
  onReturnSelected: () => void
  onSelectAll: () => void
}

export function SelectionBar({
  selectedCount,
  selectedTotal,
  selectableCount,
  onReturnSelected,
  onSelectAll,
}: SelectionBarProps) {
  const allSelected = selectedCount === selectableCount && selectableCount > 0

  return (
    <motion.div
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 80, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
      className="fixed bottom-20 left-0 right-0 z-50 px-4"
    >
      <div className="max-w-lg mx-auto bg-slate-900 dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-700/60 p-3 flex items-center gap-3">
        {/* Count + total */}
        <div className="flex-1 min-w-0">
          <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-widest leading-tight">
            {selectedCount} selected
          </p>
          {selectedCount > 0 && (
            <p className="text-base font-bold text-white tabular-nums leading-tight">
              {selectedTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              <span className="text-xs font-normal text-slate-400 ml-1">MAD</span>
            </p>
          )}
        </div>

        {/* Select all toggle */}
        <button
          onClick={onSelectAll}
          disabled={selectableCount === 0}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 dark:hover:bg-slate-600 text-slate-300 text-xs font-semibold transition-colors disabled:opacity-40"
        >
          {allSelected
            ? <X className="w-3.5 h-3.5" />
            : <CheckCircle2 className="w-3.5 h-3.5" />
          }
          {allSelected ? 'Deselect' : 'All'}
        </button>

        {/* Return button */}
        <button
          onClick={onReturnSelected}
          disabled={selectedCount === 0}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary-500 hover:bg-primary-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Return
        </button>
      </div>
    </motion.div>
  )
}
