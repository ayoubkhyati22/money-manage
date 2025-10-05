import { Bank } from '../../lib/supabase'
import { Building2 } from 'lucide-react'
import { PaginationControls } from './PaginationControls'

interface BanksSectionProps {
  banks: Bank[]
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  currentBanks: Bank[]
  startIndex: number
  endIndex: number
  totalCount: number
}

export function BanksSection({
  banks,
  currentPage,
  totalPages,
  onPageChange,
  currentBanks,
  startIndex,
  endIndex,
  totalCount
}: BanksSectionProps) {
  return (
    <div>
      {/* Summary Header */}
      {totalCount > 0 && (
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg sm:text-xl font-semibold text-dark-500 dark:text-dark-100">
            Your Financial Institutions
          </h3>
          <div className="text-right">
            <p className="text-xs sm:text-sm font-medium text-dark-500 dark:text-dark-200">
              {totalCount} bank{totalCount !== 1 ? 's' : ''}
            </p>
            <p className="text-[10px] sm:text-xs text-dark-400 dark:text-dark-300">
              Showing {startIndex + 1}-{Math.min(endIndex, totalCount)}
            </p>
          </div>
        </div>
      )}

      {banks.length === 0 ? (
        <div className="text-center py-8 sm:py-12">
          <div className="flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-accent-100 to-accent-200 dark:from-accent-900/30 dark:to-accent-800/30 rounded-full mx-auto mb-4 sm:mb-6">
            <Building2 className="w-8 h-8 sm:w-10 sm:h-10 text-accent-600 dark:text-accent-400" />
          </div>
          <p className="text-dark-500 dark:text-dark-200 text-base sm:text-lg font-medium">No banks added yet</p>
          <p className="text-xs sm:text-sm text-dark-400 dark:text-dark-300 mt-2">Add your first bank to get started</p>
        </div>
      ) : (
        <>
          {/* Mobile Compact List */}
          <div className="sm:hidden space-y-2">
            {currentBanks.map((bank) => (
              <div key={bank.id} className="flex items-center justify-between p-3 bg-gradient-to-r from-accent-50 to-accent-100 dark:from-accent-900/20 dark:to-accent-800/20 border border-accent-200 dark:border-dark-600 rounded-lg hover:shadow-md transition-all duration-300">
                <div className="flex items-center space-x-2 flex-1 min-w-0">
                  <div className="flex items-center justify-center w-8 h-8 bg-white dark:bg-dark-700 border border-accent-300 dark:border-accent-600 rounded-lg shadow-sm flex-shrink-0">
                    {bank.logo ? (
                      <img src={bank.logo} alt={bank.name} className="w-4 h-4 object-contain" />
                    ) : (
                      <Building2 className="w-4 h-4 text-accent-600 dark:text-accent-400" />
                    )}
                  </div>
                  <p className="font-medium text-dark-600 dark:text-dark-100 text-sm truncate">{bank.name}</p>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <p className="text-sm font-semibold text-dark-600 dark:text-dark-100">{Number(bank.balance).toFixed(2)}</p>
                  <p className="text-[10px] text-dark-400 dark:text-dark-300 font-medium">MAD</p>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Larger Cards */}
          <div className="hidden sm:block space-y-4">
            {currentBanks.map((bank) => (
              <div key={bank.id} className="group flex items-center justify-between p-5 bg-gradient-to-r from-accent-50 to-accent-100 dark:from-accent-900/20 dark:to-accent-800/20 border border-accent-200 dark:border-dark-600 rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-102">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-14 h-14 bg-white dark:bg-dark-700 border-2 border-accent-300 dark:border-accent-600 rounded-xl shadow-md group-hover:shadow-lg transition-shadow">
                    {bank.logo ? (
                      <img src={bank.logo} alt={bank.name} className="w-7 h-7 object-contain" />
                    ) : (
                      <Building2 className="w-7 h-7 text-accent-600 dark:text-accent-400" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-dark-600 dark:text-dark-100 text-sm">{bank.name}</p>
                    <p className="text-sm text-dark-400 dark:text-dark-300">Current Balance</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-md font-semibold text-dark-600 dark:text-dark-100">{Number(bank.balance).toFixed(2)}</p>
                  <p className="text-sm text-dark-400 dark:text-dark-300 font-medium">MAD</p>
                </div>
              </div>
            ))}
          </div>

          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
            itemName="banks"
          />
        </>
      )}
    </div>
  )
}