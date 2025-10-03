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
    <div className="bg-white/90 dark:bg-dark-800/90 backdrop-blur-sm rounded-2xl shadow-lg border border-mint-200/50 dark:border-dark-600/50 overflow-hidden">
      <div className="bg-gradient-to-r from-accent-50 to-accent-100 dark:from-accent-900/30 dark:to-accent-800/30 p-6 border-b border-accent-200 dark:border-dark-600">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-dark-500 dark:text-dark-100">Banks Overview</h3>
            <p className="text-sm text-dark-400 dark:text-dark-300 mt-1">Your financial institutions</p>
          </div>
          {totalCount > 0 && (
            <div className="text-right">
              <p className="text-sm font-medium text-dark-500 dark:text-dark-200">
                {totalCount} bank{totalCount !== 1 ? 's' : ''}
              </p>
              <p className="text-xs text-dark-400 dark:text-dark-300">
                Showing {startIndex + 1}-{Math.min(endIndex, totalCount)}
              </p>
            </div>
          )}
        </div>
      </div>
      <div className="p-6">
        {banks.length === 0 ? (
          <div className="text-center py-12">
            <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-br from-accent-100 to-accent-200 dark:from-accent-900/30 dark:to-accent-800/30 rounded-full mx-auto mb-6">
              <Building2 className="w-10 h-10 text-accent-600 dark:text-accent-400" />
            </div>
            <p className="text-dark-500 dark:text-dark-200 text-lg font-medium">No banks added yet</p>
            <p className="text-sm text-dark-400 dark:text-dark-300 mt-2">Add your first bank to get started</p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
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
    </div>
  )
}
