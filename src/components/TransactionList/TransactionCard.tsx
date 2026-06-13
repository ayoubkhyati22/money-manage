import { format } from 'date-fns'
import { ObjectiveTransaction } from '../../types/transaction'
import { ArrowDownLeft, ArrowUpRight, BarChart2, RotateCcw } from 'lucide-react'
import { motion } from 'framer-motion'

interface TransactionCardProps {
  transaction: ObjectiveTransaction
  isSelectionMode: boolean
  isSelected: boolean
  onReturn: (transaction: ObjectiveTransaction) => void
  onToggleSelection: (id: string) => void
  index?: number
}

export function TransactionCard({
  transaction,
  isSelectionMode,
  isSelected,
  onReturn,
  onToggleSelection,
  index = 0,
}: TransactionCardProps) {
  const isPositive = transaction.amount >= 0
  const isStock =
    transaction.description?.includes('Stock Purchase:') ||
    transaction.description?.includes('Stock Sale:')
  const isSelectable = transaction.amount < 0 && !isStock

  const handleClick = () => {
    if (isSelectionMode && isSelectable) onToggleSelection(transaction.id)
  }

  // Type config
  const type = isStock ? 'stock' : isPositive ? 'deposit' : 'withdraw'
  const typeConfig = {
    deposit:  { icon: ArrowUpRight,   iconBg: 'bg-emerald-500/10 dark:bg-emerald-500/15', iconCls: 'text-emerald-500', dot: 'bg-emerald-500', label: 'Deposit',  amtCls: 'text-emerald-500' },
    withdraw: { icon: ArrowDownLeft,  iconBg: 'bg-red-500/10 dark:bg-red-500/15',         iconCls: 'text-red-500',     dot: 'bg-red-500',     label: 'Withdraw', amtCls: 'text-red-500'     },
    stock:    { icon: BarChart2,      iconBg: 'bg-violet-500/10 dark:bg-violet-500/15',   iconCls: 'text-violet-500',  dot: 'bg-violet-500',  label: 'Stock',    amtCls: isPositive ? 'text-emerald-500' : 'text-red-500' },
  }[type]

  const Icon = typeConfig.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.18 }}
      onClick={handleClick}
      className={`relative flex items-center gap-3 px-4 py-3.5 transition-colors
        ${isSelected ? 'bg-primary-50/80 dark:bg-primary-900/20' : 'bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50'}
        ${isSelectionMode && isSelectable ? 'cursor-pointer' : ''}
      `}
    >
      {/* Selection checkbox */}
      {isSelectionMode && (
        <div
          onClick={e => { e.stopPropagation(); if (isSelectable) onToggleSelection(transaction.id) }}
          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
            isSelected
              ? 'border-primary-500 bg-primary-500'
              : isSelectable
                ? 'border-slate-300 dark:border-slate-600'
                : 'border-slate-200 dark:border-slate-700 opacity-30'
          }`}
        >
          {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
        </div>
      )}

      {/* Icon */}
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${typeConfig.iconBg}`}>
        <Icon className={`w-4 h-4 ${typeConfig.iconCls}`} />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="text-sm font-semibold text-slate-800 dark:text-white truncate leading-tight">
            {transaction.objective_name}
          </p>
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${typeConfig.dot}`} />
          <p className="text-[11px] text-slate-400 truncate">
            {transaction.bank_name}
            {transaction.description ? ` · ${transaction.description}` : ''}
          </p>
        </div>
        <p className="text-[11px] text-slate-300 dark:text-slate-600 mt-0.5">
          {format(new Date(transaction.created_at), 'HH:mm · MMM dd')}
        </p>
      </div>

      {/* Amount + action */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="text-right">
          <p className={`text-sm font-bold tabular-nums leading-tight ${typeConfig.amtCls}`}>
            {isPositive ? '+' : ''}{Math.abs(transaction.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[10px] text-slate-400 uppercase tracking-wide">MAD</p>
        </div>

        {!isSelectionMode && !isPositive && !isStock && (
          <button
            onClick={e => { e.stopPropagation(); onReturn(transaction) }}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors flex-shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </motion.div>
  )
}
