import { CreditCard } from 'lucide-react'
import { Bank } from '../../types/bank'
import { BankCard } from './BankCard'

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
  return (
    <div className="bg-white/90 dark:bg-dark-800/90 backdrop-blur-sm rounded-2xl shadow-lg border border-mint-200/50 dark:border-dark-600/50 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 p-6 border-b border-blue-200 dark:border-dark-600">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-blue-900 dark:text-blue-100">Your Bank Cards</h3>
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
              {banks.length} {banks.length === 1 ? 'card' : 'cards'} • Total: {banks.reduce((sum, bank) => sum + Number(bank.balance), 0).toFixed(2)} MAD
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <CreditCard className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
      </div>

      <div className="p-6">
        {banks.length === 0 ? (
          <div className="text-center py-12">
            <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 rounded-full mx-auto mb-6">
              <CreditCard className="w-10 h-10 text-blue-600 dark:text-blue-400" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-dark-100 mb-2">No bank cards yet</h4>
            <p className="text-gray-500 dark:text-dark-300">Add your first bank to get started with beautiful card management</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
        )}
      </div>
    </div>
  )
}
