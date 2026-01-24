import { Building2 } from 'lucide-react'
import { Bank } from '../../types/bank'
import { BankCard } from './BankCard'
import { BankCardSwiper } from './BankCardSwiper'
import { motion } from 'framer-motion'

interface BankGridProps {
  banks: Bank[]
  hiddenBalances: Set<string>
  onEdit: (bank: Bank) => void
  onDelete: (bank: Bank) => void
  onToggleVisibility: (bankId: string) => void
}

export function BankGrid({
  banks,
  hiddenBalances,
  onEdit,
  onDelete,
  onToggleVisibility
}: BankGridProps) {
  const totalBalance = banks.reduce((sum, bank) => sum + Number(bank.balance), 0)

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
            <div>
              <h3 className="font-semibold text-slate-800 dark:text-white">Your Bank Cards</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {banks.length} {banks.length === 1 ? 'account' : 'accounts'} • Total:{' '}
                <span className="font-medium text-primary-600 dark:text-primary-400">
                  {totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })} MAD
                </span>
              </p>
            </div>
          </div>
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
          <>
            {/* Mobile Swiper */}
            <div className="md:hidden">
              <BankCardSwiper
                banks={banks}
                hiddenBalances={hiddenBalances}
                onEdit={onEdit}
                onDelete={onDelete}
                onToggleVisibility={onToggleVisibility}
              />
            </div>

            {/* Desktop Grid */}
            <div className="hidden md:grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {banks.map((bank, index) => (
                <BankCard
                  key={bank.id}
                  bank={bank}
                  index={index}
                  isBalanceHidden={hiddenBalances.has(bank.id)}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onToggleVisibility={onToggleVisibility}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </motion.div>
  )
}
