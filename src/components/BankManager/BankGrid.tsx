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

// How many px of each card header stays visible in stack mode.
// Card header (icon + name + "Bank Account") is ~64px tall.
const PEEK = 68
// Approximate full card height (p-5 padding + identity row + balance row)
const CARD_H = 158

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
      className="glass-card overflow-hidden"
    >
      {/* Header */}
      <div className="p-5 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
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
          </div>

          {banks.length > 0 && (
            <button
              onClick={() => setIsExpanded(v => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              {isExpanded ? (
                <><Layers className="w-3.5 h-3.5" /><span>Stack</span></>
              ) : (
                <><LayoutGrid className="w-3.5 h-3.5" /><span>Expand</span></>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {banks.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
              <Building2 className="w-8 h-8 text-slate-400" />
            </div>
            <h4 className="font-semibold text-slate-700 dark:text-slate-200 mb-1">No bank accounts yet</h4>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Add your first bank to start tracking your finances
            </p>
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
                  // Stack: later cards have higher z-index so they cover earlier ones,
                  // exposing exactly PEEK px of each earlier card's header at the top.
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
      </div>
    </motion.div>
  )
}
