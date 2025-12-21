import { CreditCard } from 'lucide-react'
import { Bank } from '../../types/bank'
import { BankCard } from './BankCard'
import { BankCardSwiper } from './BankCardSwiper'

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
    <div className="relative">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-purple-50/30 to-pink-50/50 dark:from-blue-950/20 dark:via-purple-950/10 dark:to-pink-950/20 rounded-2xl blur-3xl -z-10"></div>
      
      <div className="bg-white/60 dark:bg-dark-800/60 backdrop-blur-2xl rounded-2xl shadow-xl border border-white/40 dark:border-dark-600/40 overflow-hidden">
        {/* Header with glass effect */}
        <div className="relative bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-pink-900/20 backdrop-blur-xl p-5 border-b border-white/30 dark:border-dark-600/30">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
                  <CreditCard className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                  Your Bank Cards
                </h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 ml-14">
                {banks.length} {banks.length === 1 ? 'card' : 'cards'} • Total:{" "}
                <span className="font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
                  {banks.reduce((sum, bank) => sum + Number(bank.balance), 0).toFixed(2)} MAD
                </span>
              </p>
            </div>
            
            {/* Decorative element */}
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }}></div>
              <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse" style={{ animationDelay: '0.6s' }}></div>
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-6">
          {banks.length === 0 ? (
            <div className="text-center py-12">
              <div className="relative inline-block mb-4">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 blur-2xl rounded-full"></div>
                <div className="relative flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-2xl backdrop-blur-sm border border-white/40">
                  <CreditCard className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <h4 className="text-lg font-semibold bg-gradient-to-r from-gray-700 to-gray-900 dark:from-gray-300 dark:to-gray-100 bg-clip-text text-transparent mb-2">
                No bank cards yet
              </h4>
              <p className="text-sm text-gray-500 dark:text-dark-300">
                Add your first bank to get started with your financial journey
              </p>
            </div>
          ) : (
            <>
              {/* Swiper for mobile */}
              <BankCardSwiper
                banks={banks}
                hiddenBalances={hiddenBalances}
                onEdit={onEdit}
                onDelete={onDelete}
                onToggleVisibility={onToggleVisibility}
              />

              {/* Grid for desktop */}
              <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
      </div>
    </div>
  )
}