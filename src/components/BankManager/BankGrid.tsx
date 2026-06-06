import { Building2, Eye, EyeOff, Layers, LayoutGrid } from 'lucide-react'
import { Bank } from '../../types/bank'
import { BankCard } from './BankCard'
import { motion, LayoutGroup } from 'framer-motion'
import { useState } from 'react'

interface BankGridProps {
  banks: Bank[]
  visibleBalances: Set<string>
  onCardClick: (bankId: string) => void
  onToggleVisibility: (bankId: string) => void
}

const PEEK = 72
const CARD_H = 178

export function BankGrid({ banks, visibleBalances, onCardClick, onToggleVisibility }: BankGridProps) {
  const [totalHidden, setTotalHidden] = useState(true)
  const [isExpanded, setIsExpanded] = useState(false)
  const totalBalance = banks.reduce((sum, bank) => sum + Number(bank.balance), 0)

  // Container height when stacked: last card fully shown + each earlier card peeks PEEK px
  const stackHeight = CARD_H + (banks.length - 1) * PEEK

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between px-1">
        <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
          {banks.length} {banks.length === 1 ? 'account' : 'accounts'} • Total:{' '}
          {totalHidden ? (
            <span className="flex gap-1 items-center">
              {[...Array(4)].map((_, i) => (
                <span key={i} className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500 inline-block" />
              ))}
            </span>
          ) : (
            <span className="font-medium text-primary-600 dark:text-primary-400">
              {totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })} MAD
            </span>
          )}
          <button
            onClick={() => setTotalHidden(h => !h)}
            className="ml-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            {totalHidden ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          </button>
        </p>

        {banks.length > 0 && (
          <button
            onClick={() => setIsExpanded(v => !v)}
            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            {isExpanded ? <Layers className="w-4 h-4" /> : <LayoutGrid className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* Cards */}
      {banks.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
            <Building2 className="w-8 h-8 text-slate-400" />
          </div>
          <h4 className="font-semibold text-slate-700 dark:text-slate-200 mb-1">No bank accounts yet</h4>
          <p className="text-sm text-slate-500 dark:text-slate-400">Add your first bank to start tracking your finances</p>
        </div>
      ) : (
        <LayoutGroup>
          <motion.div
            layout
            transition={{ type: 'spring', stiffness: 300, damping: 32 }}
            className={isExpanded ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5' : 'relative'}
            style={!isExpanded ? { height: stackHeight } : {}}
          >
            {banks.map((bank, index) => (
              <motion.div
                key={bank.id}
                layoutId={`bankcard-${bank.id}`}
                transition={{ type: 'spring', stiffness: 300, damping: 32 }}
                style={!isExpanded ? {
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: index * PEEK,
                  zIndex: index + 1,
                } : {
                  position: 'relative',
                  zIndex: 1,
                }}
              >
                <BankCard
                  bank={bank}
                  index={index}
                  isBalanceHidden={!visibleBalances.has(bank.id)}
                  onToggleVisibility={onToggleVisibility}
                  onClick={() => onCardClick(bank.id)}
                />
              </motion.div>
            ))}
          </motion.div>
        </LayoutGroup>
      )}
    </motion.div>
  )
}
