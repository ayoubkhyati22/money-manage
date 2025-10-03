import { useState } from 'react'
import { Wallet, Eye, EyeOff, Building2 } from 'lucide-react'
import { format } from 'date-fns'

interface CreditCardProps {
  totalBalance: number
  banksCount: number
}

export function CreditCard({ totalBalance, banksCount }: CreditCardProps) {
  const [showBalance, setShowBalance] = useState(true)

  return (
    <div className="w-full">
      <div className="w-full max-w-md mx-auto relative group">
        <div className="relative w-full h-48 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-dark-900 dark:via-dark-800 dark:to-dark-900 rounded-2xl shadow-2xl transform transition-all duration-500 hover:scale-105 hover:rotate-1 border border-slate-700/50 dark:border-dark-600/50 overflow-hidden">

          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full -translate-x-16 -translate-y-16"></div>
            <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-tl from-accent-400 to-accent-600 rounded-full translate-x-12 translate-y-12"></div>
            <div className="absolute top-1/2 left-1/2 w-40 h-40 bg-gradient-to-r from-mint-400 to-mint-600 rounded-full opacity-5 -translate-x-1/2 -translate-y-1/2"></div>
          </div>

          <div className="absolute top-6 left-6 right-6 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg flex items-center justify-center shadow-lg">
                <Wallet className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-white/90 text-sm font-medium">FinanceFlow</p>
                <p className="text-white/60 text-xs">Total Balance</p>
              </div>
            </div>
            <button
              onClick={() => setShowBalance(!showBalance)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              title={showBalance ? 'Hide balance' : 'Show balance'}
            >
              {showBalance ? (
                <Eye className="w-4 h-4 text-white/70 hover:text-white" />
              ) : (
                <EyeOff className="w-4 h-4 text-white/70 hover:text-white" />
              )}
            </button>
          </div>

          <div className="absolute top-1/2 left-6 right-6 -translate-y-1/2">
            <div className="text-center">
              <p className="text-white/60 text-xs uppercase tracking-wider mb-2">Available Balance</p>
              <div className="relative">
                {showBalance ? (
                  <h2 className="text-3xl font-bold text-white mb-1 tracking-wide">
                    {totalBalance.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })} <span className="text-lg font-medium text-white/80">MAD</span>
                  </h2>
                ) : (
                  <h2 className="text-3xl font-bold text-white mb-1 tracking-wide">
                    ••••••• <span className="text-lg font-medium text-white/80">MAD</span>
                  </h2>
                )}

                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform translate-x-full group-hover:translate-x-[-200%] transition-transform duration-1000 ease-in-out"></div>
              </div>
            </div>
          </div>

          <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
            <div>
              <p className="text-white/60 text-xs">Last updated</p>
              <p className="text-white/90 text-sm font-medium">{format(new Date(), 'MMM dd, yyyy')}</p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center">
                <Building2 className="w-3 h-3 text-white/70" />
              </div>
              <span className="text-white/60 text-xs">{banksCount} Banks</span>
            </div>
          </div>

          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

          <div className="absolute top-16 left-6 w-8 h-6 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-sm shadow-inner opacity-80"></div>
        </div>

        <div className="absolute inset-0 bg-gradient-to-br from-slate-800/50 to-transparent rounded-2xl blur-xl scale-105 -z-10 opacity-50 group-hover:opacity-75 transition-opacity duration-500"></div>
      </div>
    </div>
  )
}
